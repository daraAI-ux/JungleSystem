import {
  clearPersistedAuthSessionFromLocalData,
  createLocalDataAuthTokenStore,
  readPersistedAuthSessionFromLocalData,
} from './local-data-auth-token-store';
import {
  createMemoryAuthTokenStore,
  setAuthTokenStore,
  type AuthTokenStoreKind,
} from './token-store';
import {
  createWindowsSecureAuthTokenStore,
  getNativeSecureTokenBridge,
} from './windows-secure-auth-token-store';

let bootstrapPromise: Promise<AuthTokenStoreKind> | null = null;
let bootstrappedKind: AuthTokenStoreKind | null = null;

/**
 * Prefer Windows Credential Manager when native module is present;
 * otherwise persist via LocalDataStore (SQLite) so Metro reload keeps the session.
 */
export async function bootstrapAuthTokenStore(): Promise<AuthTokenStoreKind> {
  if (!bootstrapPromise) {
    bootstrapPromise = bootstrapAuthTokenStoreOnce().then(kind => {
      bootstrappedKind = kind;
      return kind;
    });
  }

  return bootstrapPromise;
}

export function isAuthTokenStoreBootstrapped() {
  return bootstrappedKind != null;
}

export function resetAuthTokenBootstrapForTests() {
  bootstrapPromise = null;
  bootstrappedKind = null;
}

async function bootstrapAuthTokenStoreOnce(): Promise<AuthTokenStoreKind> {
  const vaultBridge = getNativeSecureTokenBridge();

  if (vaultBridge) {
    const vaultStore = createWindowsSecureAuthTokenStore(vaultBridge);
    setAuthTokenStore(vaultStore);

    if (!vaultStore.getToken()) {
      const localSession = await readPersistedAuthSessionFromLocalData();
      if (localSession?.token) {
        vaultStore.setToken(localSession.token);
        if (localSession.source) {
          vaultStore.setSource?.(localSession.source);
        }
        await clearPersistedAuthSessionFromLocalData().catch(() => undefined);
      }
    }

    return 'windows-secure';
  }

  const localStore = createLocalDataAuthTokenStore();
  await localStore.hydrate();
  setAuthTokenStore(localStore);
  return 'local-data';
}

/** Test/fallback helper when bootstrap is skipped. */
export function installMemoryAuthTokenStore() {
  setAuthTokenStore(createMemoryAuthTokenStore());
  return 'memory' as const;
}
