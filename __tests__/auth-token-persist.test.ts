import {flushAuthTokenStorePersist} from '../src/services/flush-auth-token-store';
import {
  bootstrapAuthTokenStore,
  resetAuthTokenBootstrapForTests,
} from '../src/services/auth-token-bootstrap';
import {
  clearAuthSource,
  clearAuthToken,
  createMemoryAuthTokenStore,
  getAuthTokenStore,
  getStoredAuthSource,
  getStoredAuthToken,
  saveAuthSource,
  saveAuthToken,
  setAuthTokenStore,
} from '../src/services/token-store';
import {
  createWindowsSecureAuthTokenStore,
  type NativeSecureTokenBridge,
} from '../src/services/windows-secure-auth-token-store';
import {getAccessToken} from '../src/lib/api-client';
import {
  createLocalDataAuthTokenStore,
} from '../src/services/local-data-auth-token-store';
import {
  parsePersistedAuthSession,
  serializePersistedAuthSession,
} from '../src/services/persisted-auth-session';
import {
  MemoryLocalDataStore,
  setLocalDataStore,
} from '../src/services/local-data-store';

describe('persisted auth session helpers', () => {
  it('parses and serializes token + source', () => {
    const raw = serializePersistedAuthSession({
      token: 'abc',
      source: 'kolam',
    });
    expect(parsePersistedAuthSession(JSON.parse(raw))).toEqual({
      token: 'abc',
      source: 'kolam',
    });
    expect(parsePersistedAuthSession({token: ''})).toBeNull();
  });
});

describe('local-data auth token store', () => {
  it('hydrates token across store instances via LocalDataStore', async () => {
    const dataStore = new MemoryLocalDataStore();
    setLocalDataStore(dataStore);

    const first = createLocalDataAuthTokenStore(dataStore);
    first.setToken('persist-me');
    first.setSource?.('pos');
    await first.flush();

    const second = createLocalDataAuthTokenStore(dataStore);
    await second.hydrate();

    expect(second.getToken()).toBe('persist-me');
    expect(second.getSource?.()).toBe('pos');
  });
});

describe('windows-secure auth token store', () => {
  it('reads and writes session JSON through the native bridge', () => {
    let payload: string | null = null;
    const bridge: NativeSecureTokenBridge = {
      getSession: () => payload,
      setSession: next => {
        payload = next;
        return true;
      },
      clearSession: () => {
        payload = null;
        return true;
      },
    };

    const store = createWindowsSecureAuthTokenStore(bridge);
    store.setToken('vault-token');
    store.setSource?.('am');
    setAuthTokenStore(store);

    expect(getStoredAuthToken()).toBe('vault-token');
    expect(getStoredAuthSource()).toBe('am');
    expect(getAccessToken()).toBe('vault-token');
    expect(payload).toContain('vault-token');

    const rehydrated = createWindowsSecureAuthTokenStore(bridge);
    expect(rehydrated.getToken()).toBe('vault-token');
    expect(rehydrated.getSource?.()).toBe('am');

    setAuthTokenStore(rehydrated);
    rehydrated.clearToken();
    setAuthTokenStore(rehydrated);
    expect(payload).toBeNull();
    expect(getStoredAuthToken()).toBeUndefined();
  });
});

describe('auth token bootstrap', () => {
  beforeEach(() => {
    resetAuthTokenBootstrapForTests();
    setLocalDataStore(new MemoryLocalDataStore());
    setAuthTokenStore(createMemoryAuthTokenStore());
    clearAuthToken();
    clearAuthSource();
  });

  it('falls back to local-data when Credential Manager bridge is absent', async () => {
    const kind = await bootstrapAuthTokenStore();
    expect(kind).toBe('local-data');
    expect(getAuthTokenStore().kind).toBe('local-data');

    saveAuthToken('boot-token');
    saveAuthSource('kolam');
    await flushAuthTokenStorePersist();

    resetAuthTokenBootstrapForTests();
    setAuthTokenStore(createMemoryAuthTokenStore());
    clearAuthToken();

    const kindAgain = await bootstrapAuthTokenStore();
    expect(kindAgain).toBe('local-data');
    expect(getStoredAuthToken()).toBe('boot-token');
    expect(getStoredAuthSource()).toBe('kolam');
    expect(getAccessToken()).toBe('boot-token');
  });
});
