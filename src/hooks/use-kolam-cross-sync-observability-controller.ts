import { useCallback, useEffect, useRef, useState } from 'react';
import type { KolamCrossSyncObservabilityReport } from '../domain/kolam-cross-sync-observability';
import { getErrorMessage } from '../lib/api-error';
import { getKolamCrossSyncObservability } from '../services/kolam-cross-sync-observability-api';

export interface KolamCrossSyncObservabilityState {
  errorMessage?: string;
  fetching: boolean;
  loading: boolean;
  report: KolamCrossSyncObservabilityReport | null;
  onRefresh: () => Promise<void>;
}

export function useKolamCrossSyncObservabilityController({
  enabled = true,
  intervalMs = 60_000,
}: {
  enabled?: boolean;
  intervalMs?: number;
} = {}): KolamCrossSyncObservabilityState {
  const [report, setReport] =
    useState<KolamCrossSyncObservabilityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const reportRef = useRef<KolamCrossSyncObservabilityReport | null>(null);

  useEffect(() => {
    reportRef.current = report;
  }, [report]);

  const refresh = useCallback(async () => {
    setFetching(true);
    setLoading(!reportRef.current);
    setErrorMessage(undefined);

    try {
      const next = await getKolamCrossSyncObservability();
      setReport(next);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setReport(null);
      setLoading(false);
      setFetching(false);
      setErrorMessage(undefined);
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;

    const run = async () => {
      setFetching(true);
      setLoading(!reportRef.current);
      setErrorMessage(undefined);
      try {
        const next = await getKolamCrossSyncObservability();
        if (!cancelled) {
          setReport(next);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(getErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setFetching(false);
        }
      }
    };

    void run();
    timer = setInterval(() => {
      void run();
    }, intervalMs);

    return () => {
      cancelled = true;
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [enabled, intervalMs]);

  return {
    errorMessage,
    fetching,
    loading,
    report,
    onRefresh: refresh,
  };
}
