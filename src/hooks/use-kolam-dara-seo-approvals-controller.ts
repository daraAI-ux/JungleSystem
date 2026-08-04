import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  filterKolamDaraSeoSuggestions,
  getKolamDaraSeoApprovalsFocusEntity,
  getKolamDaraSeoApprovalsFocusId,
  getKolamDaraSeoTab,
  isKolamDaraSeoReadyToApply,
  isKolamDaraSeoRoute,
  paginateKolamDaraSeoSuggestions,
  type KolamDaraSeoBrand,
  type KolamDaraSeoStatusFilterId,
  type KolamDaraSeoSuggestion,
  type KolamDaraSeoSuggestionDetail,
  type KolamDaraSeoTargetTab,
} from '../domain/kolam-dara-seo';
import {sanitizeApiErrorMessage} from '../lib/api-error';
import {startKolamDaraJob} from '../services/kolam-dara-jobs-api';
import {
  approveKolamDaraSeoSuggestion,
  bulkApproveKolamDaraSeoSuggestions,
  deferKolamDaraSeoSuggestion,
  fetchKolamDaraSeoActiveBrands,
  fetchKolamDaraSeoSuggestion,
  fetchKolamDaraSeoSuggestions,
  rejectKolamDaraSeoSuggestion,
  rollbackKolamDaraSeoSuggestion,
  submitKolamDaraSeoSuggestion,
} from '../services/kolam-dara-seo-api';

export interface KolamDaraSeoApprovalsController {
  actionBusy: boolean;
  brandId: string;
  brands: KolamDaraSeoBrand[];
  detail: KolamDaraSeoSuggestionDetail | null;
  detailOpen: boolean;
  error: string | null;
  filteredTotal: number;
  jobBusy: boolean;
  list: KolamDaraSeoSuggestion[];
  loading: boolean;
  notice: string | null;
  page: number;
  pageItems: KolamDaraSeoSuggestion[];
  rejectNote: string;
  rejectOpen: boolean;
  searchInput: string;
  selectedIds: string[];
  selectedApprovableCount: number;
  statusFilter: KolamDaraSeoStatusFilterId;
  targetTab: KolamDaraSeoTargetTab;
  totalPages: number;
  onApproveDetail: () => Promise<void>;
  onBulkApprove: () => Promise<void>;
  onCloseDetail: () => void;
  onCloseReject: () => void;
  onConfirmReject: () => Promise<void>;
  onDeferDetail: () => Promise<void>;
  onOpenDetail: (id: string) => Promise<void>;
  onOpenReject: () => void;
  onPageChange: (page: number) => void;
  onRefresh: () => Promise<void>;
  onRegenerateDraft: () => Promise<void>;
  onResetFilters: () => void;
  onRollbackDetail: () => Promise<void>;
  onSearch: () => void;
  onSetBrandId: (brandId: string) => void;
  onSetRejectNote: (note: string) => void;
  onSetSearchInput: (value: string) => void;
  onSetStatusFilter: (status: KolamDaraSeoStatusFilterId) => void;
  onSetTargetTab: (tab: KolamDaraSeoTargetTab) => void;
  onSubmitDetail: () => Promise<void>;
  onToggleSelected: (id: string) => void;
}

export function useKolamDaraSeoApprovalsController(
  route: string,
): KolamDaraSeoApprovalsController {
  const enabled =
    isKolamDaraSeoRoute(route) && getKolamDaraSeoTab(route) === 'approvals';
  const focusId = getKolamDaraSeoApprovalsFocusId(route);
  const focusEntity = getKolamDaraSeoApprovalsFocusEntity(route);

  const [brandId, setBrandId] = useState('all');
  const [brands, setBrands] = useState<KolamDaraSeoBrand[]>([]);
  const [list, setList] = useState<KolamDaraSeoSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [jobBusy, setJobBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [targetTab, setTargetTab] = useState<KolamDaraSeoTargetTab>(
    focusEntity.target || 'all',
  );
  const [statusFilter, setStatusFilter] =
    useState<KolamDaraSeoStatusFilterId>('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detail, setDetail] = useState<KolamDaraSeoSuggestionDetail | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const focusedRef = useRef<string>('');

  const onRefresh = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [brandRes, suggestionRes] = await Promise.all([
        fetchKolamDaraSeoActiveBrands().catch(() => ({
          brands: [] as KolamDaraSeoBrand[],
          defaultBrandId: 'all',
        })),
        fetchKolamDaraSeoSuggestions({
          limit: 100,
          targetType: targetTab === 'all' ? undefined : targetTab,
          brandId,
        }),
      ]);
      setBrands(brandRes.brands);
      setList(suggestionRes.items);
    } catch (err) {
      setList([]);
      setError(getControllerErrorMessage(err, 'Gagal memuat antrian'));
    } finally {
      setLoading(false);
    }
  }, [brandId, enabled, targetTab]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    void onRefresh();
  }, [enabled, onRefresh]);

  useEffect(() => {
    if (focusEntity.target) {
      setTargetTab(focusEntity.target);
    }
  }, [focusEntity.target]);

  const filtered = useMemo(
    () =>
      filterKolamDaraSeoSuggestions(list, {
        targetTab,
        statusFilter,
        search,
      }),
    [list, search, statusFilter, targetTab],
  );

  const paged = useMemo(
    () => paginateKolamDaraSeoSuggestions(filtered, page),
    [filtered, page],
  );

  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
  }, [brandId, search, statusFilter, targetTab]);

  useEffect(() => {
    if (page > paged.totalPages) {
      setPage(paged.totalPages);
    }
  }, [page, paged.totalPages]);

  const onOpenDetail = useCallback(async (id: string) => {
    try {
      const next = await fetchKolamDaraSeoSuggestion(id);
      setDetail(next);
      setDetailOpen(true);
      setNotice(null);
    } catch (err) {
      setNotice(getControllerErrorMessage(err, 'Gagal memuat detail'));
    }
  }, []);

  useEffect(() => {
    if (!enabled || !list.length) {
      return;
    }
    const key = `${focusId}|${focusEntity.productId}|${focusEntity.blogId}|${focusEntity.speciesId}`;
    if (!key.replace(/\|/g, '') || focusedRef.current === key) {
      return;
    }
    focusedRef.current = key;
    if (focusId) {
      void onOpenDetail(focusId);
      return;
    }
    const match = list.find(item => {
      if (focusEntity.productId && item.productId === focusEntity.productId) {
        return true;
      }
      if (focusEntity.blogId && item.blogId === focusEntity.blogId) {
        return true;
      }
      if (focusEntity.speciesId && item.speciesId === focusEntity.speciesId) {
        return true;
      }
      return false;
    });
    if (match) {
      void onOpenDetail(match.id);
    }
  }, [
    enabled,
    focusEntity.blogId,
    focusEntity.productId,
    focusEntity.speciesId,
    focusId,
    list,
    onOpenDetail,
  ]);

  const selectedApprovableCount = useMemo(
    () =>
      selectedIds.filter(id => {
        const row = list.find(item => item.id === id);
        return row ? isKolamDaraSeoReadyToApply(row) : false;
      }).length,
    [list, selectedIds],
  );

  const runAction = useCallback(
    async (work: () => Promise<void>, successNotice: string) => {
      setActionBusy(true);
      setNotice(null);
      try {
        await work();
        setNotice(successNotice);
        await onRefresh();
      } catch (err) {
        setNotice(getControllerErrorMessage(err, 'Aksi gagal'));
      } finally {
        setActionBusy(false);
      }
    },
    [onRefresh],
  );

  return {
    actionBusy,
    brandId,
    brands,
    detail,
    detailOpen,
    error,
    filteredTotal: filtered.length,
    jobBusy,
    list,
    loading,
    notice,
    page: paged.page,
    pageItems: paged.items,
    rejectNote,
    rejectOpen,
    searchInput,
    selectedIds,
    selectedApprovableCount,
    statusFilter,
    targetTab,
    totalPages: paged.totalPages,
    onApproveDetail: async () => {
      if (!detail) {
        return;
      }
      await runAction(async () => {
        await approveKolamDaraSeoSuggestion(detail.suggestion.id);
        setDetailOpen(false);
        setDetail(null);
      }, 'Diterapkan');
    },
    onBulkApprove: async () => {
      const ids = selectedIds.filter(id => {
        const row = list.find(item => item.id === id);
        return row ? isKolamDaraSeoReadyToApply(row) : false;
      });
      if (!ids.length) {
        return;
      }
      setActionBusy(true);
      setNotice(null);
      try {
        const results = await bulkApproveKolamDaraSeoSuggestions(ids);
        const ok = results.filter(item => item.ok).length;
        const fail = results.length - ok;
        const failMsg = results
          .filter(item => !item.ok)
          .map(item => item.error)
          .filter(Boolean)
          .join(' · ');
        setSelectedIds([]);
        await onRefresh();
        if (ok && fail) {
          setNotice(`${ok} ok, ${fail} gagal${failMsg ? `: ${failMsg}` : ''}`);
        } else if (ok) {
          setNotice(`${ok} entitas diperbarui`);
        } else {
          setNotice(failMsg || 'Bulk approve gagal');
        }
      } catch (err) {
        setNotice(getControllerErrorMessage(err, 'Bulk approve gagal'));
      } finally {
        setActionBusy(false);
      }
    },
    onCloseDetail: () => {
      setDetailOpen(false);
    },
    onCloseReject: () => {
      setRejectOpen(false);
    },
    onConfirmReject: async () => {
      if (!detail) {
        return;
      }
      await runAction(async () => {
        await rejectKolamDaraSeoSuggestion(detail.suggestion.id, rejectNote);
        setRejectOpen(false);
        setRejectNote('');
        setDetailOpen(false);
        setDetail(null);
      }, 'Ditolak');
    },
    onDeferDetail: async () => {
      if (!detail) {
        return;
      }
      await runAction(async () => {
        await deferKolamDaraSeoSuggestion(detail.suggestion.id, 'Ditunda');
        const next = await fetchKolamDaraSeoSuggestion(detail.suggestion.id);
        setDetail(next);
      }, 'Ditunda');
    },
    onOpenDetail,
    onOpenReject: () => {
      setRejectOpen(true);
    },
    onPageChange: setPage,
    onRefresh,
    onRegenerateDraft: async () => {
      if (!detail) {
        return;
      }
      setJobBusy(true);
      setNotice(null);
      try {
        await startKolamDaraJob({
          module: 'seo',
          jobType: 'seo.regenerate_draft',
          params: {suggestionId: detail.suggestion.id},
          label: 'Buat draft SEO',
        });
        setDetailOpen(false);
        setDetail(null);
        setNotice('Job dimulai: Buat draft SEO');
        await onRefresh();
      } catch (err) {
        setNotice(getControllerErrorMessage(err, 'Gagal membuat draft'));
      } finally {
        setJobBusy(false);
      }
    },
    onResetFilters: () => {
      setStatusFilter('all');
      setSearch('');
      setSearchInput('');
    },
    onRollbackDetail: async () => {
      if (!detail) {
        return;
      }
      await runAction(async () => {
        await rollbackKolamDaraSeoSuggestion(detail.suggestion.id);
        const next = await fetchKolamDaraSeoSuggestion(detail.suggestion.id);
        setDetail(next);
      }, 'Rollback selesai');
    },
    onSearch: () => {
      setSearch(searchInput.trim());
    },
    onSetBrandId: setBrandId,
    onSetRejectNote: setRejectNote,
    onSetSearchInput: (value: string) => {
      setSearchInput(value);
      setSearch(value.trim());
    },
    onSetStatusFilter: setStatusFilter,
    onSetTargetTab: setTargetTab,
    onSubmitDetail: async () => {
      if (!detail) {
        return;
      }
      await runAction(async () => {
        await submitKolamDaraSeoSuggestion(detail.suggestion.id);
        const next = await fetchKolamDaraSeoSuggestion(detail.suggestion.id);
        setDetail(next);
      }, 'Masuk menunggu approve');
    },
    onToggleSelected: (id: string) => {
      setSelectedIds(prev =>
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
      );
    },
  };
}

function getControllerErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return sanitizeApiErrorMessage(error.message);
  }
  return fallback;
}
