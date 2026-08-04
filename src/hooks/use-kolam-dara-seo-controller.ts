import {useCallback, useEffect, useState} from 'react';
import {
  getKolamDaraSeoTab,
  isKolamDaraSeoRoute,
  type KolamDaraSeoBrand,
  type KolamDaraSeoDashboard,
  type KolamDaraSeoPendingSuggestion,
} from '../domain/kolam-dara-seo';
import {sanitizeApiErrorMessage} from '../lib/api-error';
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

    // Match FE dashboard load: dashboard + pending first.
    // Keep status/brands non-blocking so they cannot blank the KPI surface.
    const [dashRes, pendingRes] = await Promise.allSettled([
      fetchKolamDaraSeoDashboard(brandId),
      fetchKolamDaraSeoPendingSuggestions(brandId, 10),
    ]);

    void Promise.allSettled([
      fetchKolamDaraSeoStatus(),
      fetchKolamDaraSeoActiveBrands(),
    ]).then(([statusRes, brandRes]) => {
      if (statusRes.status === 'fulfilled') {
        setSeoEnabled(statusRes.value.seoEnabled);
      }
      if (brandRes.status === 'fulfilled') {
        setBrands(brandRes.value.brands);
      }
    });

    if (dashRes.status === 'fulfilled') {
      setDashboard(dashRes.value);
      setDataSource('live');
      setError(null);
    } else {
      const message = getControllerErrorMessage(
        dashRes.reason,
        'Gagal memuat dashboard DARA SEO',
      );
      setError(message);
      setDataSource(current => (current === 'live' ? 'live' : 'error'));
    }

    if (pendingRes.status === 'fulfilled') {
      setPending(pendingRes.value);
    }

    setLoading(false);
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
        // FE/plugin: startJob only — no immediate dashboard reload while BE runs the job.
        setNotice(`Job dimulai: ${label || jobType}`);
      } catch (err) {
        setNotice(getControllerErrorMessage(err, 'Gagal memulai job SEO'));
      } finally {
        setJobBusyType(null);
      }
    },
    [],
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
    return sanitizeApiErrorMessage(error.message);
  }
  return fallback;
}
