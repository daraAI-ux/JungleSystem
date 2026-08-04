import type {AuthSource} from '../domain/auth';
import {
  getLocalDataStore,
  type LocalDataStore,
} from './local-data-store';
import {
  KOLAM_AUTH_SESSION_LOCAL_KEY,
  parsePersistedAuthSession,
  type PersistedAuthSession,
} from './persisted-auth-session';
import type {AuthTokenStore} from './token-store';

type LocalDataAuthTokenStore = AuthTokenStore & {
  hydrate(): Promise<void>;
  flush(): Promise<void>;
};

export function createLocalDataAuthTokenStore(
  dataStore: LocalDataStore = getLocalDataStore(),
): LocalDataAuthTokenStore {
  let token: string | undefined;
  let source: AuthSource | undefined;
  let writeChain: Promise<void> = Promise.resolve();

  const persist = (session: PersistedAuthSession | null) => {
    writeChain = writeChain
      .catch(() => undefined)
      .then(async () => {
        if (!session) {
          await dataStore.remove(KOLAM_AUTH_SESSION_LOCAL_KEY);
          return;
        }

        await dataStore.write({
          key: KOLAM_AUTH_SESSION_LOCAL_KEY,
          value: session,
          revision: String(Date.now()),
          updatedAt: new Date().toISOString(),
        });
      });

    return writeChain;
  };

  return {
    kind: 'local-data',
    getToken: () => token,
    getSource: () => source,
    setToken: nextToken => {
      token = nextToken;
      void persist(
        token
          ? {
              token,
              source,
            }
          : null,
      );
    },
    setSource: nextSource => {
      source = nextSource;
      if (!token) {
        return;
      }
      void persist({token, source});
    },
    clearToken: () => {
      token = undefined;
      source = undefined;
      void persist(null);
    },
    clearSource: () => {
      source = undefined;
      if (!token) {
        return;
      }
      void persist({token, source});
    },
    async hydrate() {
      const record = await dataStore.read<PersistedAuthSession>(
        KOLAM_AUTH_SESSION_LOCAL_KEY,
      );
      const session = parsePersistedAuthSession(record?.value);
      token = session?.token;
      source = session?.source;
    },
    flush() {
      return writeChain.catch(() => undefined);
    },
  };
}

export async function readPersistedAuthSessionFromLocalData(
  dataStore: LocalDataStore = getLocalDataStore(),
): Promise<PersistedAuthSession | null> {
  const record = await dataStore.read<PersistedAuthSession>(
    KOLAM_AUTH_SESSION_LOCAL_KEY,
  );
  return parsePersistedAuthSession(record?.value);
}

export async function clearPersistedAuthSessionFromLocalData(
  dataStore: LocalDataStore = getLocalDataStore(),
): Promise<void> {
  await dataStore.remove(KOLAM_AUTH_SESSION_LOCAL_KEY);
}
