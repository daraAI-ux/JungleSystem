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
  normalizeKolamDaraSeoTargetTypes,
} from '../services/kolam-dara-jobs-api';

export type KolamPusatAiProsesDataSource = 'idle' | 'live' | 'error';

export interface KolamPusatAiProsesController {
  canNormalize: boolean;
  dataSource: KolamPusatAiProsesDataSource;
  error: string | null;
  jobs: KolamDaraAsyncJob[];
  loading: boolean;
  moduleFilter: KolamDaraJobsModuleFilter;
  normalizeBusy: boolean;
  notice: string | null;
  pollingJobId: string | null;
  statusFilter: KolamDaraJobsStatusFilter;
  onDismissJob: (jobId: string) => void;
  onNormalizeSeo: () => Promise<void>;
  onPollJob: (jobId: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  onSetModuleFilter: (value: KolamDaraJobsModuleFilter) => void;
  onSetStatusFilter: (value: KolamDaraJobsStatusFilter) => void;
}

export function useKolamPusatAiProsesController(
  route: string,
  opts?: {canNormalize?: boolean},
): KolamPusatAiProsesController {
  const enabled = getKolamPusatAiHubTab(route) === 'proses';
  const canNormalize = opts?.canNormalize === true;
  const [moduleFilter, setModuleFilter] =
    useState<KolamDaraJobsModuleFilter>('all');
  const [statusFilter, setStatusFilter] =
    useState<KolamDaraJobsStatusFilter>('all');
  const [rawJobs, setRawJobs] = useState<KolamDaraAsyncJob[]>([]);
  const [dismissTick, setDismissTick] = useState(0);
  const [loading, setLoading] = useState(false);
  const [normalizeBusy, setNormalizeBusy] = useState(false);
  const [pollingJobId, setPollingJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
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

  const onNormalizeSeo = useCallback(async () => {
    if (!canNormalize) {
      return;
    }
    setNormalizeBusy(true);
    setNotice(null);
    try {
      const result = await normalizeKolamDaraSeoTargetTypes(false);
      setNotice(
        `Data SEO dinormalisasi (${result.updated ?? 0} baris diperbaiki)`,
      );
    } catch (err) {
      setNotice(getApiErrorMessage(err, 'Normalisasi gagal'));
    } finally {
      setNormalizeBusy(false);
    }
  }, [canNormalize]);

  return {
    canNormalize,
    dataSource,
    error,
    jobs,
    loading,
    moduleFilter,
    normalizeBusy,
    notice,
    pollingJobId,
    statusFilter,
    onDismissJob,
    onNormalizeSeo,
    onPollJob,
    onRefresh,
    onSetModuleFilter: setModuleFilter,
    onSetStatusFilter: setStatusFilter,
  };
}
