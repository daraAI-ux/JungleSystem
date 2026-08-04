import {useCallback, useEffect, useState} from 'react';
import {
  getKolamDaraSeoTab,
  isKolamDaraSeoRoute,
  type KolamDaraSeoBrand,
  type KolamDaraSeoRankingRow,
} from '../domain/kolam-dara-seo';
import {sanitizeApiErrorMessage} from '../lib/api-error';
import {
  fetchKolamDaraSeoActiveBrands,
  fetchKolamDaraSeoRankings,
  fetchKolamDaraSeoSerpKeyword,
} from '../services/kolam-dara-seo-api';

export interface KolamDaraSeoRankingsController {
  brandId: string;
  brands: KolamDaraSeoBrand[];
  error: string | null;
  fetchBusy: boolean;
  keywordInput: string;
  loading: boolean;
  notice: string | null;
  rows: KolamDaraSeoRankingRow[];
  total: number;
  onFetchKeyword: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onSetBrandId: (brandId: string) => void;
  onSetKeywordInput: (value: string) => void;
}

export function useKolamDaraSeoRankingsController(
  route: string,
): KolamDaraSeoRankingsController {
  const enabled =
    isKolamDaraSeoRoute(route) && getKolamDaraSeoTab(route) === 'rankings';
  const [brandId, setBrandId] = useState('all');
  const [brands, setBrands] = useState<KolamDaraSeoBrand[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [rows, setRows] = useState<KolamDaraSeoRankingRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchBusy, setFetchBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const onRefresh = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [rankings, brandRes] = await Promise.all([
        fetchKolamDaraSeoRankings({
          keyword: keywordInput.trim() || undefined,
          limit: 50,
          brandId,
        }),
        fetchKolamDaraSeoActiveBrands().catch(() => ({
          brands: [] as KolamDaraSeoBrand[],
          defaultBrandId: 'all',
        })),
      ]);
      setRows(rankings.items);
      setTotal(rankings.total);
      setBrands(brandRes.brands);
    } catch (err) {
      setRows([]);
      setTotal(0);
      setError(
        err instanceof Error && err.message.trim()
          ? sanitizeApiErrorMessage(err.message)
          : 'Gagal memuat ranking',
      );
    } finally {
      setLoading(false);
    }
  }, [brandId, enabled, keywordInput]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    void onRefresh();
  }, [enabled, brandId]); // eslint-disable-line react-hooks/exhaustive-deps -- FE reloads on brand; keyword via Muat ulang

  const onFetchKeyword = useCallback(async () => {
    const keyword = keywordInput.trim();
    if (!keyword) {
      setNotice('Isi keyword dulu');
      return;
    }
    setFetchBusy(true);
    setNotice(null);
    try {
      await fetchKolamDaraSeoSerpKeyword(keyword);
      setNotice(`SERP "${keyword}" tersimpan`);
      await onRefresh();
    } catch (err) {
      setNotice(
        err instanceof Error && err.message.trim()
          ? sanitizeApiErrorMessage(err.message)
          : 'Fetch gagal',
      );
    } finally {
      setFetchBusy(false);
    }
  }, [keywordInput, onRefresh]);

  return {
    brandId,
    brands,
    error,
    fetchBusy,
    keywordInput,
    loading,
    notice,
    rows,
    total,
    onFetchKeyword,
    onRefresh,
    onSetBrandId: setBrandId,
    onSetKeywordInput: setKeywordInput,
  };
}
