import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {isKolamDaraSeoRoute} from '../domain/kolam-dara-seo';
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

const SEO_JOBS_POLL_MS = 2000;

export interface KolamDaraSeoJobsProgressController {
  activeJobs: KolamDaraAsyncJob[];
  notice: string | null;
  isRunning: (jobType: string) => boolean;
  onStartSeoJob: (
    jobType: string,
    params?: Record<string, unknown>,
    label?: string,
  ) => Promise<void>;
  onRefreshJobs: () => Promise<void>;
}

export interface UseKolamDaraSeoJobsProgressOptions {
  /** Poll/start SEO jobs outside DARA SEO routes (e.g. product list toolbar). */
  forceEnabled?: boolean;
}

/**
 * FE parity: `DaraJobsProvider module="seo"` + `DaraJobProgressBar`
 * (poll active SEO jobs while any DARA SEO route is open, or when forceEnabled).
 */
export function useKolamDaraSeoJobsProgress(
  route: string,
  options?: UseKolamDaraSeoJobsProgressOptions,
): KolamDaraSeoJobsProgressController {
  const enabled =
    options?.forceEnabled === true || isKolamDaraSeoRoute(route);
  const [jobs, setJobs] = useState<KolamDaraAsyncJob[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const jobsRef = useRef(jobs);
  jobsRef.current = jobs;

  const onRefreshJobs = useCallback(async () => {
    if (!enabled) {
      return;
    }
    try {
      const serverJobs = await fetchKolamDaraJobsList({
        module: 'seo',
        hours: 48,
      });
      setJobs(serverJobs);
    } catch {
      // FE swallows sync errors and keeps prior tracked jobs.
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
                // Keep completed/failed briefly out of active strip (FE removes).
                return without;
              }
              return [next, ...without];
            });
          })
          .catch(() => undefined);
      });
    }, SEO_JOBS_POLL_MS);
    return () => {
      clearInterval(timer);
    };
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

  const onStartSeoJob = useCallback(
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
          module: 'seo',
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
          }
        }
        setNotice(`Job dimulai: ${label || jobType}`);
        void onRefreshJobs();
      } catch (err) {
        setNotice(
          err instanceof Error && err.message.trim()
            ? sanitizeApiErrorMessage(err.message)
            : 'Gagal memulai job SEO',
        );
      }
    },
    [jobs, onRefreshJobs],
  );

  return {
    activeJobs,
    notice,
    isRunning,
    onStartSeoJob,
    onRefreshJobs,
  };
}
