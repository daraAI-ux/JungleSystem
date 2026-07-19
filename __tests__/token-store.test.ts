import {getAccessToken} from '../src/lib/api-client';
import {
  clearAuthToken,
  clearAuthSource,
  createMemoryAuthTokenStore,
  getAuthTokenStore,
  getStoredAuthSource,
  getStoredAuthToken,
  saveAuthSource,
  saveAuthToken,
  setAuthTokenStore,
  type AuthTokenStore,
} from '../src/services/token-store';

describe('auth token store', () => {
  beforeEach(() => {
    setAuthTokenStore(createMemoryAuthTokenStore());
    clearAuthToken();
    clearAuthSource();
  });

  it('keeps the API client bearer token synchronized with the active store', () => {
    saveAuthToken('runtime-token');

    expect(getStoredAuthToken()).toBe('runtime-token');
    expect(getAccessToken()).toBe('runtime-token');

    clearAuthToken();

    expect(getStoredAuthToken()).toBeUndefined();
    expect(getAccessToken()).toBeUndefined();
  });

  it('keeps the auth source next to the active token when the store supports it', () => {
    saveAuthToken('kolam-token');
    saveAuthSource('kolam');

    expect(getStoredAuthToken()).toBe('kolam-token');
    expect(getStoredAuthSource()).toBe('kolam');

    clearAuthSource();
    expect(getStoredAuthSource()).toBeUndefined();
  });

  it('allows swapping in a future Windows secure token store adapter', () => {
    let token: string | undefined = 'hydrated-token';
    let source: 'kolam' | undefined = 'kolam';
    const windowsStore: AuthTokenStore = {
      kind: 'windows-secure',
      getToken: () => token,
      getSource: () => source,
      setToken: nextToken => {
        token = nextToken;
      },
      setSource: nextSource => {
        source = nextSource === 'kolam' ? nextSource : undefined;
      },
      clearToken: () => {
        token = undefined;
      },
      clearSource: () => {
        source = undefined;
      },
    };

    setAuthTokenStore(windowsStore);

    expect(getAuthTokenStore().kind).toBe('windows-secure');
    expect(getAccessToken()).toBe('hydrated-token');

    saveAuthToken('next-token');
    saveAuthSource('kolam');
    expect(getStoredAuthToken()).toBe('next-token');
    expect(getStoredAuthSource()).toBe('kolam');
    expect(getAccessToken()).toBe('next-token');
  });
});
