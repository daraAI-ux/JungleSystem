import {useCallback, useEffect, useState} from 'react';
import {
  getKolamDaraMarketIntelTab,
  isKolamDaraMarketIntelRoute,
  type KolamDaraMarketIntelBrand,
  type KolamDaraMarketIntelDashboard,
  type KolamDaraMarketIntelStatus,
} from '../domain/kolam-dara-market-intel';
import {sanitizeApiErrorMessage} from '../lib/api-error';
import {
  fetchKolamDaraMarketIntelActiveBrands,
  fetchKolamDaraMarketIntelDashboard,
  fetchKolamDaraMarketIntelStatus,
} from '../services/kolam-dara-market-intel-api';

export interface KolamDaraMarketIntelDashboardController {
  brandId: string;
  brands: KolamDaraMarketIntelBrand[];
  dashboard: KolamDaraMarketIntelDashboard | null;
  error: string | null;
  loading: boolean;
  marketEnabled: boolean;
  status: KolamDaraMarketIntelStatus | null;
  onRefresh: () => Promise<void>;
  onSetBrandId: (brandId: string) => void;
}

export function useKolamDaraMarketIntelDashboardController(
  route: string,
): KolamDaraMarketIntelDashboardController {
  const enabled =
    isKolamDaraMarketIntelRoute(route) &&
    getKolamDaraMarketIntelTab(route) === 'dashboard';
  const [brandId, setBrandId] = useState('all');
  const [brands, setBrands] = useState<KolamDaraMarketIntelBrand[]>([]);
  const [dashboard, setDashboard] =
    useState<KolamDaraMarketIntelDashboard | null>(null);
  const [status, setStatus] = useState<KolamDaraMarketIntelStatus | null>(null);
  const [marketEnabled, setMarketEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onRefresh = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(null);

    const [dashRes] = await Promise.allSettled([
      fetchKolamDaraMarketIntelDashboard(brandId),
    ]);

    void Promise.allSettled([
      fetchKolamDaraMarketIntelStatus(),
      fetchKolamDaraMarketIntelActiveBrands(),
    ]).then(([statusRes, brandRes]) => {
      if (statusRes.status === 'fulfilled') {
        setStatus(statusRes.value);
        setMarketEnabled(statusRes.value.enabled);
      }
      if (brandRes.status === 'fulfilled') {
        setBrands(brandRes.value.brands);
      }
    });

    if (dashRes.status === 'fulfilled') {
      setDashboard(dashRes.value);
      setError(null);
    } else {
      setError(
        dashRes.reason instanceof Error && dashRes.reason.message.trim()
          ? sanitizeApiErrorMessage(dashRes.reason.message)
          : 'Gagal memuat dashboard',
      );
    }

    setLoading(false);
  }, [brandId, enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    void onRefresh();
  }, [enabled, onRefresh]);

  return {
    brandId,
    brands,
    dashboard,
    error,
    loading,
    marketEnabled,
    status,
    onRefresh,
    onSetBrandId: setBrandId,
  };
}
