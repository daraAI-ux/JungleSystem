import {useCallback, useState} from 'react';
import {
  getKolamDaraMarketIntelTab,
  isKolamDaraMarketIntelRoute,
  type KolamDaraMarketIntelStoreHealthScan,
} from '../domain/kolam-dara-market-intel';
import {sanitizeApiErrorMessage} from '../lib/api-error';
import {fetchKolamDaraMarketIntelStoreHealthProducts} from '../services/kolam-dara-market-intel-api';

export interface KolamDaraMarketIntelStoreHealthController {
  data: KolamDaraMarketIntelStoreHealthScan | null;
  error: string | null;
  expandedId: string | null;
  loading: boolean;
  sellableOnly: boolean;
  onScan: () => Promise<void>;
  onSetSellableOnly: (value: boolean) => void;
  onToggleExpanded: (productId: string) => void;
}

export function useKolamDaraMarketIntelStoreHealthController(
  route: string,
): KolamDaraMarketIntelStoreHealthController {
  const enabled =
    isKolamDaraMarketIntelRoute(route) &&
    getKolamDaraMarketIntelTab(route) === 'kesehatan';

  const [sellableOnly, setSellableOnly] = useState(true);
  const [data, setData] = useState<KolamDaraMarketIntelStoreHealthScan | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const onScan = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setData(
        await fetchKolamDaraMarketIntelStoreHealthProducts({sellableOnly}),
      );
      setExpandedId(null);
    } catch (err) {
      setError(
        err instanceof Error && err.message.trim()
          ? sanitizeApiErrorMessage(err.message)
          : 'Gagal scan kesehatan produk',
      );
    } finally {
      setLoading(false);
    }
  }, [enabled, sellableOnly]);

  return {
    data,
    error,
    expandedId,
    loading,
    sellableOnly,
    onScan,
    onSetSellableOnly: setSellableOnly,
    onToggleExpanded: (productId: string) => {
      setExpandedId(current => (current === productId ? null : productId));
    },
  };
}
