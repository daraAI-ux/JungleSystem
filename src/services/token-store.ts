import {setAccessToken} from '../lib/api-client';
import type {AuthSource} from '../domain/auth';

export type AuthTokenStoreKind = 'memory' | 'windows-secure';

export interface AuthTokenStore {
  kind: AuthTokenStoreKind;
  getToken(): string | undefined;
  setToken(token: string): void;
  clearToken(): void;
  getSource?(): AuthSource | undefined;
  setSource?(source: AuthSource): void;
  clearSource?(): void;
}

export function createMemoryAuthTokenStore(): AuthTokenStore {
  let token: string | undefined;
  let source: AuthSource | undefined;

  return {
    kind: 'memory',
    getToken: () => token,
    getSource: () => source,
    setToken: nextToken => {
      token = nextToken;
    },
    setSource: nextSource => {
      source = nextSource;
    },
    clearToken: () => {
      token = undefined;
    },
    clearSource: () => {
      source = undefined;
    },
  };
}

let activeTokenStore = createMemoryAuthTokenStore();

export function setAuthTokenStore(store: AuthTokenStore) {
  activeTokenStore = store;
  setAccessToken(store.getToken());
}

export function getAuthTokenStore() {
  return activeTokenStore;
}

export function getStoredAuthToken() {
  return activeTokenStore.getToken();
}

export function getStoredAuthSource(): AuthSource | undefined {
  return normalizeAuthSource(activeTokenStore.getSource?.());
}

export function saveAuthToken(token: string) {
  activeTokenStore.setToken(token);
  setAccessToken(token);
}

export function saveAuthSource(source: AuthSource) {
  activeTokenStore.setSource?.(source);
}

export function clearAuthToken() {
  activeTokenStore.clearToken();
  setAccessToken(undefined);
}

export function clearAuthSource() {
  activeTokenStore.clearSource?.();
}

function normalizeAuthSource(source: AuthSource | undefined) {
  if (source === 'kolam' || source === 'pos' || source === 'am') {
    return source;
  }

  return undefined;
}
