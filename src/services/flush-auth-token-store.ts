import type {AuthTokenStore} from './token-store';
import {getAuthTokenStore} from './token-store';

export async function flushAuthTokenStorePersist() {
  const store = getAuthTokenStore() as AuthTokenStore & {
    flush?: () => Promise<void>;
  };
  if (typeof store.flush === 'function') {
    await store.flush();
  }
}
