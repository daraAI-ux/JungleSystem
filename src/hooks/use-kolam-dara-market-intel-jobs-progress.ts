import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {isKolamDaraMarketIntelRoute} from '../domain/kolam-dara-market-intel';
import {
  isKolamDaraJobActive,
  type KolamDaraAsyncJob,
} from '../domain/kolam-pusat-ai-jobs';
import {sanitizeApiErrorMessage} from '../lib/api-error';
import {
  fetchKolamDaraJob,
  fetchKolamDaraJobsList,
  startKolamDaraJob,
} from '../services/kolam-dara-jobs-api';

const MARKET_JOBS_POLL_MS = 2000;

export interface KolamDaraMarketIntelJobsProgressController {
  activeJobs: KolamDaraAsyncJob[];
  notice: string | null;
  isRunning: (jobType: string) => boolean;
  onRefreshJobs: () => Promise<void>;
  onStartMarketJob: (
    jobType: string,
    params?: Record<string, unknown>,
    label?: string,
  ) => Promise<void>;
}

/**
 * FE `DaraJobsProvider module="market-intel"` + `DaraJobProgressBar`
 * (poll active market-intel jobs while any Intel Pasar route is open).
 */
export function useKolamDaraMarketIntelJobsProgress(
  route: string,
  options?: {
    onJobSettled?: (job: KolamDaraAsyncJob) => void;
  },
): KolamDaraMarketIntelJobsProgressController {
  const enabled = isKolamDaraMarketIntelRoute(route);
  const [jobs, setJobs] = useState<KolamDaraAsyncJob[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const jobsRef = useRef(jobs);
  jobsRef.current = jobs;
  const onJobSettledRef = useRef(options?.onJobSettled);
  onJobSettledRef.current = options?.onJobSettled;

  const onRefreshJobs = useCallback(async () => {
    if (!enabled) {
      return;
    }
    try {
      setJobs(
        await fetchKolamDaraJobsList({
          module: 'market-intel',
          hours: 48,
        }),
      );
    } catch {
      // Keep prior jobs on sync errors (FE parity).
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setJobs([]);
      return;
    }
    void onRefreshJobs();
  }, [enabled, onRefreshJobs]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    const timer = setInterval(() => {
      const active = jobsRef.current.filter(isKolamDaraJobActive);
      if (!active.length) {
        return;
      }
      active.forEach(job => {
        void fetchKolamDaraJob(job.id)
          .then(next => {
            if (!isKolamDaraJobActive(next)) {
              // FE removes completed/failed from strip + toasts.
              if (next.status === 'completed') {
                setNotice(`${next.label} selesai`);
              } else if (next.status === 'failed') {
                setNotice(next.error || `${next.label} gagal`);
              }
              onJobSettledRef.current?.(next);
              setJobs(prev => prev.filter(item => item.id !== next.id));
              return;
            }
            setJobs(prev => {
              const without = prev.filter(item => item.id !== next.id);
              return [next, ...without];
            });
          })
          .catch(() => undefined);
      });
    }, MARKET_JOBS_POLL_MS);
    return () => clearInterval(timer);
  }, [enabled]);

  const activeJobs = useMemo(
    () => jobs.filter(isKolamDaraJobActive),
    [jobs],
  );

  const isRunning = useCallback(
    (jobType: string) =>
      jobs.some(job => job.jobType === jobType && isKolamDaraJobActive(job)),
    [jobs],
  );

  const onStartMarketJob = useCallback(
    async (
      jobType: string,
      params?: Record<string, unknown>,
      label?: string,
    ) => {
      const existing = jobs.find(
        job => job.jobType === jobType && isKolamDaraJobActive(job),
      );
      if (existing) {
        setNotice(`${existing.label} masih berjalan`);
        return;
      }
      setNotice(null);
      try {
        const {jobId, job} = await startKolamDaraJob({
          module: 'market-intel',
          jobType,
          params,
          label,
        });
        if (job) {
          setJobs(prev => [job, ...prev.filter(item => item.id !== job.id)]);
        } else if (jobId) {
          const next = await fetchKolamDaraJob(jobId).catch(() => null);
          if (next) {
            setJobs(prev => [
              next,
              ...prev.filter(item => item.id !== next.id),
            ]);
          } else {
            void onRefreshJobs();
          }
        }
        setNotice(`Job dimulai: ${label || jobType}`);
        void onRefreshJobs();
      } catch (err) {
        setNotice(
          err instanceof Error && err.message.trim()
            ? sanitizeApiErrorMessage(err.message)
            : 'Gagal memulai job',
        );
      }
    },
    [jobs, onRefreshJobs],
  );

  return {
    activeJobs,
    notice,
    isRunning,
    onRefreshJobs,
    onStartMarketJob,
  };
}
