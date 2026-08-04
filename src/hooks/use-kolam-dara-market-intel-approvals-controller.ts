import {useCallback, useEffect, useMemo, useState} from 'react';
import {
  filterKolamDaraMarketIntelRecommendationsForMargin,
  getKolamDaraMarketIntelTab,
  isKolamDaraMarketIntelApprovable,
  isKolamDaraMarketIntelRoute,
  paginateKolamDaraMarketIntelRecommendations,
  type KolamDaraMarketIntelBrand,
  type KolamDaraMarketIntelRecommendation,
  type KolamDaraMarketIntelStatusFilterId,
} from '../domain/kolam-dara-market-intel';
import {sanitizeApiErrorMessage} from '../lib/api-error';
import {
  approveKolamDaraMarketIntelRecommendation,
  bulkApproveKolamDaraMarketIntelRecommendations,
  fetchKolamDaraMarketIntelActiveBrands,
  fetchKolamDaraMarketIntelRecommendations,
  rejectKolamDaraMarketIntelRecommendation,
} from '../services/kolam-dara-market-intel-api';

export interface KolamDaraMarketIntelApprovalsController {
  actionBusy: boolean;
  brandId: string;
  brands: KolamDaraMarketIntelBrand[];
  detail: KolamDaraMarketIntelRecommendation | null;
  detailOpen: boolean;
  error: string | null;
  filteredTotal: number;
  list: KolamDaraMarketIntelRecommendation[];
  loading: boolean;
  notice: string | null;
  page: number;
  pageItems: KolamDaraMarketIntelRecommendation[];
  rejectNote: string;
  rejectOpen: boolean;
  selectedApprovableCount: number;
  selectedIds: string[];
  statusFilter: KolamDaraMarketIntelStatusFilterId;
  totalPages: number;
  onApproveDetail: () => Promise<void>;
  onBulkApprove: () => Promise<void>;
  onCloseDetail: () => void;
  onCloseReject: () => void;
  onConfirmReject: () => Promise<void>;
  onOpenDetail: (id: string) => void;
  onOpenReject: () => void;
  onPageChange: (page: number) => void;
  onRefresh: () => Promise<void>;
  onSetBrandId: (brandId: string) => void;
  onSetRejectNote: (note: string) => void;
  onSetStatusFilter: (status: KolamDaraMarketIntelStatusFilterId) => void;
  onToggleSelected: (id: string) => void;
}

export function useKolamDaraMarketIntelApprovalsController(
  route: string,
  canViewMargin: boolean,
): KolamDaraMarketIntelApprovalsController {
  const enabled =
    isKolamDaraMarketIntelRoute(route) &&
    getKolamDaraMarketIntelTab(route) === 'approvals';

  const [brandId, setBrandId] = useState('all');
  const [brands, setBrands] = useState<KolamDaraMarketIntelBrand[]>([]);
  const [list, setList] = useState<KolamDaraMarketIntelRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] =
    useState<KolamDaraMarketIntelStatusFilterId>('draft_ready');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detail, setDetail] = useState<KolamDaraMarketIntelRecommendation | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState('');

  const onRefresh = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [brandRes, listRes] = await Promise.all([
        fetchKolamDaraMarketIntelActiveBrands().catch(() => ({
          brands: [] as KolamDaraMarketIntelBrand[],
          defaultBrandId: 'all',
        })),
        fetchKolamDaraMarketIntelRecommendations({
          status: statusFilter === 'all' ? undefined : statusFilter,
          limit: 100,
          brandId,
        }),
      ]);
      setBrands(brandRes.brands);
      setList(listRes.items);
      setPage(1);
    } catch (err) {
      setList([]);
      setError(
        err instanceof Error && err.message.trim()
          ? sanitizeApiErrorMessage(err.message)
          : 'Gagal memuat',
      );
    } finally {
      setLoading(false);
    }
  }, [brandId, enabled, statusFilter]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    void onRefresh();
  }, [enabled, onRefresh]);

  const filtered = useMemo(
    () =>
      filterKolamDaraMarketIntelRecommendationsForMargin(list, canViewMargin),
    [canViewMargin, list],
  );

  const paged = useMemo(
    () => paginateKolamDaraMarketIntelRecommendations(filtered, page),
    [filtered, page],
  );

  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
  }, [brandId, statusFilter, canViewMargin]);

  useEffect(() => {
    if (page > paged.totalPages) {
      setPage(paged.totalPages);
    }
  }, [page, paged.totalPages]);

  const selectedApprovableCount = useMemo(
    () =>
      selectedIds.filter(id =>
        filtered.some(
          item => item.id === id && isKolamDaraMarketIntelApprovable(item),
        ),
      ).length,
    [filtered, selectedIds],
  );

  const onOpenDetail = useCallback(
    (id: string) => {
      const found = filtered.find(item => item.id === id) ?? null;
      setDetail(found);
      setDetailOpen(true);
      setNotice(null);
    },
    [filtered],
  );

  const onCloseDetail = useCallback(() => {
    setDetailOpen(false);
    setDetail(null);
    setRejectOpen(false);
    setRejectNote('');
  }, []);

  const onOpenReject = useCallback(() => {
    setRejectNote('');
    setRejectOpen(true);
  }, []);

  const onCloseReject = useCallback(() => {
    setRejectOpen(false);
  }, []);

  const onToggleSelected = useCallback((id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
    );
  }, []);

  const onApproveDetail = useCallback(async () => {
    if (!detail) {
      return;
    }
    setActionBusy(true);
    setNotice(null);
    try {
      await approveKolamDaraMarketIntelRecommendation(detail.id);
      setNotice('Disetujui');
      setDetailOpen(false);
      setDetail(null);
      await onRefresh();
    } catch (err) {
      setNotice(
        err instanceof Error && err.message.trim()
          ? sanitizeApiErrorMessage(err.message)
          : 'Gagal approve',
      );
    } finally {
      setActionBusy(false);
    }
  }, [detail, onRefresh]);

  const onConfirmReject = useCallback(async () => {
    if (!detail) {
      return;
    }
    setActionBusy(true);
    setNotice(null);
    try {
      await rejectKolamDaraMarketIntelRecommendation(detail.id, rejectNote);
      setNotice('Ditolak');
      setRejectOpen(false);
      setDetailOpen(false);
      setDetail(null);
      setRejectNote('');
      await onRefresh();
    } catch (err) {
      setNotice(
        err instanceof Error && err.message.trim()
          ? sanitizeApiErrorMessage(err.message)
          : 'Gagal tolak',
      );
    } finally {
      setActionBusy(false);
    }
  }, [detail, onRefresh, rejectNote]);

  const onBulkApprove = useCallback(async () => {
    const ids = selectedIds.filter(id =>
      filtered.some(
        item => item.id === id && isKolamDaraMarketIntelApprovable(item),
      ),
    );
    if (!ids.length) {
      return;
    }
    setActionBusy(true);
    setNotice(null);
    try {
      const results = await bulkApproveKolamDaraMarketIntelRecommendations(ids);
      const ok = results.filter(item => item.ok).length;
      setNotice(`${ok} rekomendasi disetujui`);
      setSelectedIds([]);
      await onRefresh();
    } catch (err) {
      setNotice(
        err instanceof Error && err.message.trim()
          ? sanitizeApiErrorMessage(err.message)
          : 'Gagal bulk approve',
      );
    } finally {
      setActionBusy(false);
    }
  }, [filtered, onRefresh, selectedIds]);

  return {
    actionBusy,
    brandId,
    brands,
    detail,
    detailOpen,
    error,
    filteredTotal: paged.total,
    list,
    loading,
    notice,
    page: paged.page,
    pageItems: paged.items,
    rejectNote,
    rejectOpen,
    selectedApprovableCount,
    selectedIds,
    statusFilter,
    totalPages: paged.totalPages,
    onApproveDetail,
    onBulkApprove,
    onCloseDetail,
    onCloseReject,
    onConfirmReject,
    onOpenDetail,
    onOpenReject,
    onPageChange: setPage,
    onRefresh,
    onSetBrandId: setBrandId,
    onSetRejectNote: setRejectNote,
    onSetStatusFilter: setStatusFilter,
    onToggleSelected,
  };
}
