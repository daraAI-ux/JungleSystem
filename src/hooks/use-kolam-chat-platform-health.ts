import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  getKolamChatPlatformHealth,
  type KolamChatPlatform,
  type KolamChatPlatformHealth,
  type KolamChatPlatformHealthRow,
} from '../services/kolam-api';

export interface KolamChatPlatformHealthState {
  checkedAt?: string;
  errorMessage?: string;
  healthByPlatform: Partial<Record<KolamChatPlatform, KolamChatPlatformHealthRow>>;
  loading: boolean;
  platforms: KolamChatPlatformHealthRow[];
  refresh: () => Promise<void>;
}

export function useKolamChatPlatformHealth({
  enabled,
  intervalMs = 30_000,
}: {
  enabled: boolean;
  intervalMs?: number;
}): KolamChatPlatformHealthState {
  const mountedRef = useRef(false);
  const [state, setState] = useState<KolamChatPlatformHealthState>({
    healthByPlatform: {},
    loading: false,
    platforms: [],
    refresh: async () => undefined,
  });

  const refresh = useCallback(async () => {
    if (!enabled) {
      return;
    }

    setState(current => ({
      ...current,
      loading: current.platforms.length === 0,
      errorMessage: undefined,
    }));

    try {
      const payload = await getKolamChatPlatformHealth();
      if (!mountedRef.current) {
        return;
      }

      setState({
        checkedAt: payload.checkedAt,
        healthByPlatform: mapHealthByPlatform(payload),
        loading: false,
        platforms: payload.platforms ?? [],
        refresh,
      });
    } catch (error) {
      if (!mountedRef.current) {
        return;
      }

      setState(current => ({
        ...current,
        loading: false,
        errorMessage:
          error instanceof Error
            ? error.message
            : 'Status koneksi chat belum bisa dibaca.',
        refresh,
      }));
    }
  }, [enabled]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;

    mountedRef.current = true;

    if (enabled) {
      refresh();
      timer = setInterval(() => {
        refresh();
      }, intervalMs);
    } else {
      setState(current => ({
        ...current,
        loading: false,
        refresh,
      }));
    }

    return () => {
      mountedRef.current = false;
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [enabled, intervalMs, refresh]);

  return useMemo(
    () => ({
      ...state,
      refresh,
    }),
    [refresh, state],
  );
}

function mapHealthByPlatform(
  payload: KolamChatPlatformHealth,
): Partial<Record<KolamChatPlatform, KolamChatPlatformHealthRow>> {
  const map: Partial<Record<KolamChatPlatform, KolamChatPlatformHealthRow>> = {};

  for (const row of payload.platforms ?? []) {
    if (isKolamChatPlatform(row.platform)) {
      map[row.platform] = row;
    }
  }

  return map;
}

function isKolamChatPlatform(platform: string): platform is KolamChatPlatform {
  return (
    platform === 'tokopedia' ||
    platform === 'shopee' ||
    platform === 'store' ||
    platform === 'tiktok' ||
    platform === 'whatsapp' ||
    platform === 'instagram'
  );
}
