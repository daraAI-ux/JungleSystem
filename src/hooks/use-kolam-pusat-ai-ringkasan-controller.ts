import {useCallback, useEffect, useMemo, useState} from 'react';
import {
  buildKolamPusatAiRingkasanKpiCards,
  filterKolamPusatAiRingkasanQuickLinks,
  isKolamPusatAiRingkasanRoute,
  type KolamDaraMarketingHubSummary,
} from '../domain/kolam-pusat-ai';
import {getErrorMessage as getApiErrorMessage} from '../lib/api-error';
import {fetchKolamDaraMarketingHub} from '../services/kolam-dara-marketing-hub-api';

export type KolamPusatAiRingkasanDataSource = 'idle' | 'live' | 'error';

export interface KolamPusatAiRingkasanController {
  brandId: string;
  brandOptions: Array<{label: string; value: string}>;
  dataSource: KolamPusatAiRingkasanDataSource;
  error: string | null;
  hub: KolamDaraMarketingHubSummary | null;
  kpiCards: ReturnType<typeof buildKolamPusatAiRingkasanKpiCards>;
  loading: boolean;
  quickLinks: Array<{href: string; label: string}>;
  onRefresh: () => Promise<void>;
  onSetBrandId: (brandId: string) => void;
}

export function useKolamPusatAiRingkasanController(
  route: string,
): KolamPusatAiRingkasanController {
  const enabled = isKolamPusatAiRingkasanRoute(route);
  const [brandId, setBrandId] = useState('all');
  const [hub, setHub] = useState<KolamDaraMarketingHubSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] =
    useState<KolamPusatAiRingkasanDataSource>('idle');

  const onRefresh = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const next = await fetchKolamDaraMarketingHub(
        brandId === 'all' ? undefined : brandId,
      );
      setHub(next);
      setDataSource('live');
      if (next.selectedBrandId && next.selectedBrandId !== brandId) {
        // Keep local filter unless server only returns a forced brand id.
      }
    } catch (err) {
      setHub(null);
      setDataSource('error');
      setError(getApiErrorMessage(err, 'Gagal memuat hub'));
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

  const brandOptions = useMemo(() => {
    const brands = hub?.brands ?? [];
    return [
      {label: 'Semua', value: 'all'},
      ...brands.map(brand => ({
        label: brand.name,
        value: brand.id,
      })),
    ];
  }, [hub?.brands]);

  const kpiCards = useMemo(
    () => buildKolamPusatAiRingkasanKpiCards(hub),
    [hub],
  );

  const quickLinks = useMemo(
    () => filterKolamPusatAiRingkasanQuickLinks(hub?.quickLinks ?? []),
    [hub?.quickLinks],
  );

  return {
    brandId,
    brandOptions,
    dataSource,
    error,
    hub,
    kpiCards,
    loading,
    quickLinks,
    onRefresh,
    onSetBrandId: setBrandId,
  };
}
