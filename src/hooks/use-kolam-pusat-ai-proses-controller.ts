import {useCallback, useEffect, useMemo, useState} from 'react';
import {getKolamPusatAiHubTab} from '../domain/kolam-pusat-ai';
import {
  dismissKolamDaraJob,
  filterKolamDaraJobs,
  isKolamDaraJobDismissed,
  type KolamDaraAsyncJob,
  type KolamDaraJobsModuleFilter,
  type KolamDaraJobsStatusFilter,
  type KolamDaraJobModule,
} from '../domain/kolam-pusat-ai-jobs';
import {getErrorMessage as getApiErrorMessage} from '../lib/api-error';
import {
  fetchKolamDaraJob,
  fetchKolamDaraJobsList,
} from '../services/kolam-dara-jobs-api';

export type KolamPusatAiProsesDataSource = 'idle' | 'live' | 'error';

export interface KolamPusatAiProsesController {
  dataSource: KolamPusatAiProsesDataSource;
  error: string | null;
  jobs: KolamDaraAsyncJob[];
  loading: boolean;
  moduleFilter: KolamDaraJobsModuleFilter;
  pollingJobId: string | null;
  statusFilter: KolamDaraJobsStatusFilter;
  onDismissJob: (jobId: string) => void;
  onPollJob: (jobId: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  onSetModuleFilter: (value: KolamDaraJobsModuleFilter) => void;
  onSetStatusFilter: (value: KolamDaraJobsStatusFilter) => void;
}

export function useKolamPusatAiProsesController(
  route: string,
): KolamPusatAiProsesController {
  const enabled = getKolamPusatAiHubTab(route) === 'ringkasan';
  const [moduleFilter, setModuleFilter] =
    useState<KolamDaraJobsModuleFilter>('all');
  const [statusFilter, setStatusFilter] =
    useState<KolamDaraJobsStatusFilter>('all');
  const [rawJobs, setRawJobs] = useState<KolamDaraAsyncJob[]>([]);
  const [dismissTick, setDismissTick] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pollingJobId, setPollingJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] =
    useState<KolamPusatAiProsesDataSource>('idle');

  const onRefresh = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const serverJobs = await fetchKolamDaraJobsList({
        module:
          moduleFilter === 'all'
            ? undefined
            : (moduleFilter as KolamDaraJobModule),
        active: statusFilter === 'active' ? true : undefined,
        hours: 72,
      });
      setRawJobs(serverJobs);
      setDataSource('live');
    } catch (err) {
      // FE keeps prior rows and toasts; surface a notice without wiping list.
      setDataSource('error');
      setError(getApiErrorMessage(err, 'Gagal memuat riwayat job'));
    } finally {
      setLoading(false);
    }
  }, [enabled, moduleFilter, statusFilter]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    void onRefresh();
  }, [enabled, onRefresh]);

  const jobs = useMemo(() => {
    void dismissTick;
    return filterKolamDaraJobs(rawJobs, statusFilter).filter(
      job => !isKolamDaraJobDismissed(job.id),
    );
  }, [dismissTick, rawJobs, statusFilter]);

  const onPollJob = useCallback(async (jobId: string) => {
    setPollingJobId(jobId);
    try {
      const next = await fetchKolamDaraJob(jobId);
      setRawJobs(prev => [next, ...prev.filter(job => job.id !== jobId)]);
    } catch {
      // FE swallows poll errors.
    } finally {
      setPollingJobId(null);
    }
  }, []);

  const onDismissJob = useCallback((jobId: string) => {
    dismissKolamDaraJob(jobId);
    setDismissTick(tick => tick + 1);
  }, []);

  return {
    dataSource,
    error,
    jobs,
    loading,
    moduleFilter,
    pollingJobId,
    statusFilter,
    onDismissJob,
    onPollJob,
    onRefresh,
    onSetModuleFilter: setModuleFilter,
    onSetStatusFilter: setStatusFilter,
  };
}
