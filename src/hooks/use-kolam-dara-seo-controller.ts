import {useCallback, useEffect, useState} from 'react';
import {
  getKolamDaraSeoTab,
  isKolamDaraSeoRoute,
  type KolamDaraSeoBrand,
  type KolamDaraSeoDashboard,
  type KolamDaraSeoPendingSuggestion,
} from '../domain/kolam-dara-seo';
import {startKolamDaraJob} from '../services/kolam-dara-jobs-api';
import {
  fetchKolamDaraSeoActiveBrands,
  fetchKolamDaraSeoDashboard,
  fetchKolamDaraSeoPendingSuggestions,
  fetchKolamDaraSeoStatus,
} from '../services/kolam-dara-seo-api';

export type KolamDaraSeoDataSource = 'idle' | 'live' | 'error';

export interface KolamDaraSeoController {
  brandId: string;
  brands: KolamDaraSeoBrand[];
  dashboard: KolamDaraSeoDashboard | null;
  dataSource: KolamDaraSeoDataSource;
  error: string | null;
  jobBusyType: string | null;
  loading: boolean;
  notice: string | null;
  pending: KolamDaraSeoPendingSuggestion[];
  seoEnabled: boolean;
  onRefresh: () => Promise<void>;
  onSetBrandId: (brandId: string) => void;
  onStartSeoJob: (
    jobType: string,
    params?: Record<string, unknown>,
    label?: string,
  ) => Promise<void>;
}

export function useKolamDaraSeoController(route: string): KolamDaraSeoController {
  const enabled =
    isKolamDaraSeoRoute(route) && getKolamDaraSeoTab(route) === 'dashboard';
  const [brandId, setBrandId] = useState('all');
  const [brands, setBrands] = useState<KolamDaraSeoBrand[]>([]);
  const [dashboard, setDashboard] = useState<KolamDaraSeoDashboard | null>(null);
  const [pending, setPending] = useState<KolamDaraSeoPendingSuggestion[]>([]);
  const [seoEnabled, setSeoEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [jobBusyType, setJobBusyType] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<KolamDaraSeoDataSource>('idle');

  const onRefresh = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [status, brandRes, dash, pendingRes] = await Promise.all([
        fetchKolamDaraSeoStatus(),
        fetchKolamDaraSeoActiveBrands().catch(() => ({
          brands: [] as KolamDaraSeoBrand[],
          defaultBrandId: 'all',
        })),
        fetchKolamDaraSeoDashboard(brandId),
        fetchKolamDaraSeoPendingSuggestions(brandId, 10),
      ]);
      setSeoEnabled(status.seoEnabled);
      setBrands(brandRes.brands);
      setDashboard(dash);
      setPending(pendingRes);
      setDataSource('live');
    } catch (err) {
      setDashboard(null);
      setPending([]);
      setDataSource('error');
      setError(getControllerErrorMessage(err, 'Gagal memuat dashboard DARA SEO'));
    } finally {
      setLoading(false);
    }
  }, [brandId, enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    void onRefresh();
  }, [enabled, onRefresh]);

  const onStartSeoJob = useCallback(
    async (
      jobType: string,
      params?: Record<string, unknown>,
      label?: string,
    ) => {
      setJobBusyType(jobType);
      setNotice(null);
      try {
        await startKolamDaraJob({
          module: 'seo',
          jobType,
          params,
          label,
        });
        setNotice(`Job dimulai: ${label || jobType}`);
        await onRefresh();
      } catch (err) {
        setNotice(getControllerErrorMessage(err, 'Gagal memulai job SEO'));
      } finally {
        setJobBusyType(null);
      }
    },
    [onRefresh],
  );

  return {
    brandId,
    brands,
    dashboard,
    dataSource,
    error,
    jobBusyType,
    loading,
    notice,
    pending,
    seoEnabled,
    onRefresh,
    onSetBrandId: setBrandId,
    onStartSeoJob,
  };
}

function getControllerErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}
