import type {AuthSource} from '../domain/auth';

export const KOLAM_AUTH_SESSION_LOCAL_KEY = 'kolam.auth.session';

export type PersistedAuthSession = {
  token: string;
  source?: AuthSource;
};

export function parsePersistedAuthSession(
  raw: unknown,
): PersistedAuthSession | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const record = raw as {token?: unknown; source?: unknown};
  if (typeof record.token !== 'string' || !record.token.trim()) {
    return null;
  }

  const source =
    record.source === 'kolam' || record.source === 'pos' || record.source === 'am'
      ? record.source
      : undefined;

  return {
    token: record.token,
    source,
  };
}

export function serializePersistedAuthSession(
  session: PersistedAuthSession,
): string {
  return JSON.stringify({
    token: session.token,
    ...(session.source ? {source: session.source} : {}),
  });
}
