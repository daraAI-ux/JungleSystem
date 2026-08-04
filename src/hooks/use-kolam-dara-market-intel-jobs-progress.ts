import {useCallback, useEffect, useRef, useState} from 'react';
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

/** FE `DaraJobsProvider module="market-intel"` + progress strip. */
export function useKolamDaraMarketIntelJobsProgress(
  route: string,
): KolamDaraMarketIntelJobsProgressController {
  const enabled = isKolamDaraMarketIntelRoute(route);
  const [jobs, setJobs] = useState<KolamDaraAsyncJob[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const jobsRef = useRef(jobs);
  jobsRef.current = jobs;

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
            setJobs(prev => {
              const without = prev.filter(item => item.id !== next.id);
              if (!isKolamDaraJobActive(next)) {
                return without;
              }
              return [...without, next];
            });
          })
          .catch(() => undefined);
      });
    }, MARKET_JOBS_POLL_MS);
    return () => clearInterval(timer);
  }, [enabled]);

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
      setNotice(null);
      try {
        const {job, jobId} = await startKolamDaraJob({
          module: 'market-intel',
          jobType,
          params,
          label,
        });
        if (job) {
          setJobs(prev => {
            const without = prev.filter(item => item.id !== job.id);
            return [...without, job];
          });
        } else if (jobId) {
          void onRefreshJobs();
        }
        setNotice('Job dimulai');
      } catch (err) {
        setNotice(
          err instanceof Error && err.message.trim()
            ? sanitizeApiErrorMessage(err.message)
            : 'Gagal memulai job',
        );
      }
    },
    [onRefreshJobs],
  );

  return {
    activeJobs: jobs.filter(isKolamDaraJobActive),
    notice,
    isRunning,
    onRefreshJobs,
    onStartMarketJob,
  };
}
