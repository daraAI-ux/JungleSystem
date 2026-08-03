import { useCallback, useEffect, useState } from 'react';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import {
  getKolamVoucherRouteMode,
  hasKolamVoucherPermission,
  isKolamVoucherRoute,
  type KolamVoucher,
  type KolamVoucherRouteMode,
  type KolamVoucherStatus,
} from '../domain/kolam-voucher';
import { getErrorMessage as getApiErrorMessage } from '../lib/api-error';
import {
  deleteKolamVoucher,
  getKolamVouchers,
  updateKolamVoucherStatus,
} from '../services/kolam-voucher-api';

export type KolamVoucherSurfaceMode = KolamVoucherRouteMode;
export type KolamVoucherDataSource = 'idle' | 'live' | 'error';

export interface KolamVoucherController {
  canCreate: boolean;
  canDelete: boolean;
  canUpdate: boolean;
  canView: boolean;
  dataSource: KolamVoucherDataSource;
  error: string | null;
  loading: boolean;
  mode: KolamVoucherSurfaceMode;
  mutating: boolean;
  page: number;
  pageSize: number;
  search: string;
  statusFilter: '' | KolamVoucherStatus;
  statusMessage: string | null;
  total: number;
  totalPages: number;
  vouchers: KolamVoucher[];
  onBackToList: () => string;
  onClearFilters: () => void;
  onCreateNew: () => void;
  onDeleteVoucher: (voucher: KolamVoucher) => Promise<boolean>;
  onRefresh: () => Promise<void>;
  onSearchChange: (value: string) => void;
  onSetPage: (page: number) => void;
  onSetPageSize: (pageSize: number) => void;
  onSetStatusFilter: (value: '' | KolamVoucherStatus) => void;
  onToggleStatus: (voucher: KolamVoucher) => Promise<boolean>;
}

export function useKolamVoucherController(route: string): KolamVoucherController {
  const { authUser } = useKolamAuthContext();
  const initialMode = getKolamVoucherRouteMode(route);

  const canView = hasKolamVoucherPermission(
    authUser?.permissions,
    'view',
    authUser?.roleKey,
  );
  const canCreate = hasKolamVoucherPermission(
    authUser?.permissions,
    'create',
    authUser?.roleKey,
  );
  const canUpdate = hasKolamVoucherPermission(
    authUser?.permissions,
    'update',
    authUser?.roleKey,
  );
  const canDelete = hasKolamVoucherPermission(
    authUser?.permissions,
    'delete',
    authUser?.roleKey,
  );

  const [vouchers, setVouchers] = useState<KolamVoucher[]>([]);
  const [mode, setMode] = useState<KolamVoucherSurfaceMode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<KolamVoucherDataSource>('idle');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | KolamVoucherStatus>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!isKolamVoucherRoute(route)) {
      return;
    }
    setMode(getKolamVoucherRouteMode(route));
  }, [route]);

  const loadList = useCallback(async () => {
    if (!canView) {
      setVouchers([]);
      setTotal(0);
      setTotalPages(1);
      setDataSource('idle');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await getKolamVouchers({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      });
      setVouchers(result.items);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setPage(result.page);
      setDataSource('live');
    } catch (loadError) {
      setVouchers([]);
      setTotal(0);
      setTotalPages(1);
      setDataSource('error');
      setError(getApiErrorMessage(loadError, 'Gagal memuat daftar voucher.'));
    } finally {
      setLoading(false);
    }
  }, [canView, page, pageSize, search, statusFilter]);

  useEffect(() => {
    if (mode !== 'list') {
      return;
    }
    void loadList();
  }, [loadList, mode]);

  const onRefresh = useCallback(async () => {
    setStatusMessage(null);
    await loadList();
  }, [loadList]);

  const onSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const onSetStatusFilter = useCallback((value: '' | KolamVoucherStatus) => {
    setStatusFilter(value);
    setPage(1);
  }, []);

  const onClearFilters = useCallback(() => {
    setSearch('');
    setStatusFilter('');
    setPage(1);
  }, []);

  const onSetPage = useCallback((nextPage: number) => {
    setPage(Math.max(1, nextPage));
  }, []);

  const onSetPageSize = useCallback((nextSize: number) => {
    setPageSize(Math.max(1, nextSize));
    setPage(1);
  }, []);

  const onBackToList = useCallback(() => {
    setMode('list');
    setStatusMessage(null);
    setError(null);
    return '/vouchers';
  }, []);

  const onCreateNew = useCallback(() => {
    setMode('new');
    setStatusMessage(null);
    setError(null);
  }, []);

  const onToggleStatus = useCallback(
    async (voucher: KolamVoucher) => {
      if (!canUpdate) {
        setError('Tidak ada izin update voucher.');
        return false;
      }
      if (voucher.status === 'expired') {
        setError('Voucher kedaluwarsa tidak bisa diaktifkan lewat toggle.');
        return false;
      }
      const nextStatus = voucher.status === 'active' ? 'inactive' : 'active';
      setMutating(true);
      setError(null);
      setStatusMessage(null);
      try {
        await updateKolamVoucherStatus(voucher.id, nextStatus);
        setStatusMessage(
          nextStatus === 'active'
            ? `Voucher ${voucher.code} diaktifkan.`
            : `Voucher ${voucher.code} dinonaktifkan.`,
        );
        await loadList();
        return true;
      } catch (toggleError) {
        setError(
          getApiErrorMessage(toggleError, 'Gagal mengubah status voucher.'),
        );
        return false;
      } finally {
        setMutating(false);
      }
    },
    [canUpdate, loadList],
  );

  const onDeleteVoucher = useCallback(
    async (voucher: KolamVoucher) => {
      if (!canDelete) {
        setError('Tidak ada izin hapus voucher.');
        return false;
      }
      setMutating(true);
      setError(null);
      setStatusMessage(null);
      try {
        await deleteKolamVoucher(voucher.id);
        setStatusMessage(`Voucher ${voucher.code} dihapus.`);
        await loadList();
        return true;
      } catch (deleteError) {
        setError(getApiErrorMessage(deleteError, 'Gagal menghapus voucher.'));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [canDelete, loadList],
  );

  return {
    canCreate,
    canDelete,
    canUpdate,
    canView,
    dataSource,
    error,
    loading,
    mode,
    mutating,
    page,
    pageSize,
    search,
    statusFilter,
    statusMessage,
    total,
    totalPages,
    vouchers,
    onBackToList,
    onClearFilters,
    onCreateNew,
    onDeleteVoucher,
    onRefresh,
    onSearchChange,
    onSetPage,
    onSetPageSize,
    onSetStatusFilter,
    onToggleStatus,
  };
}
