import {NativeModules} from 'react-native';
import type {AuthSource} from '../domain/auth';
import {
  parsePersistedAuthSession,
  serializePersistedAuthSession,
} from './persisted-auth-session';
import type {AuthTokenStore} from './token-store';

export interface NativeSecureTokenBridge {
  getSession(): string | null | undefined;
  setSession(payload: string): boolean;
  clearSession(): boolean;
}

export function getNativeSecureTokenBridge(): NativeSecureTokenBridge | null {
  const bridge = NativeModules.KolamWindowsSecureTokenStore as
    | NativeSecureTokenBridge
    | undefined;

  if (
    bridge &&
    typeof bridge.getSession === 'function' &&
    typeof bridge.setSession === 'function' &&
    typeof bridge.clearSession === 'function'
  ) {
    return bridge;
  }

  return null;
}

export function isWindowsSecureAuthTokenStoreAvailable() {
  return getNativeSecureTokenBridge() != null;
}

export function createWindowsSecureAuthTokenStore(
  bridge: NativeSecureTokenBridge,
): AuthTokenStore {
  let token: string | undefined;
  let source: AuthSource | undefined;

  const hydrateFromBridge = () => {
    const raw = bridge.getSession();
    if (!raw) {
      token = undefined;
      source = undefined;
      return;
    }

    try {
      const session = parsePersistedAuthSession(JSON.parse(raw));
      token = session?.token;
      source = session?.source;
    } catch {
      token = undefined;
      source = undefined;
    }
  };

  const persist = () => {
    if (!token) {
      bridge.clearSession();
      return;
    }

    bridge.setSession(
      serializePersistedAuthSession({
        token,
        source,
      }),
    );
  };

  hydrateFromBridge();

  return {
    kind: 'windows-secure',
    getToken: () => token,
    getSource: () => source,
    setToken: nextToken => {
      token = nextToken;
      persist();
    },
    setSource: nextSource => {
      source = nextSource;
      persist();
    },
    clearToken: () => {
      token = undefined;
      source = undefined;
      persist();
    },
    clearSource: () => {
      source = undefined;
      persist();
    },
  };
}
