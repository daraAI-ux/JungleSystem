import {useEffect, useState} from 'react';
import type {ServerMetricsSnapshot} from '../domain/server-metrics';
import {fetchServerMetrics} from '../services/server-metrics-api';

export interface KolamServerMetricsState {
  errorMessage?: string;
  loading: boolean;
  snapshot?: ServerMetricsSnapshot | null;
}

export function useKolamServerMetricsController({
  enabled,
  intervalMs = 5000,
}: {
  enabled: boolean;
  intervalMs?: number;
}): KolamServerMetricsState {
  const [state, setState] = useState<KolamServerMetricsState>({
    loading: false,
    snapshot: null,
  });

  useEffect(() => {
    if (!enabled) {
      setState({loading: false, snapshot: null});
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;

    const refresh = async () => {
      setState(current => ({
        ...current,
        loading: !current.snapshot,
        errorMessage: undefined,
      }));

      try {
        const snapshot = await fetchServerMetrics();
        if (cancelled) {
          return;
        }

        setState({
          loading: false,
          snapshot,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setState(current => ({
          ...current,
          loading: false,
          errorMessage:
            error instanceof Error
              ? error.message
              : 'Metrik server tidak bisa dibaca.',
        }));
      }
    };

    refresh();
    timer = setInterval(refresh, intervalMs);

    return () => {
      cancelled = true;
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [enabled, intervalMs]);

  return state;
}
