import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import {
  buildKolamUnexpectedExpenseDetailRoute,
  buildKolamUnexpectedExpenseHistoryItems,
  getKolamFinanceExpenseRoot,
  getKolamUnexpectedExpenseDetailTab,
  getKolamUnexpectedExpenseEditRoute,
  getKolamUnexpectedExpenseIdFromRoute,
  getKolamUnexpectedExpenseSurfaceMode,
  hasKolamFinanceExpensePermission,
  KOLAM_UNEXPECTED_EXPENSE_DETAIL_TABS,
  type KolamUnexpectedExpenseDetail,
  type KolamUnexpectedExpenseDetailTab,
  type KolamUnexpectedExpenseHistoryItem,
} from '../domain/kolam-finance-expense';
import { ApiError } from '../lib/api-error';
import {
  fetchKolamUnexpectedExpenseById,
  verifyKolamFinanceExpense,
} from '../services/kolam-finance-expense-api';

export interface KolamUnexpectedExpenseDetailController {
  detail: KolamUnexpectedExpenseDetail | null;
  tab: KolamUnexpectedExpenseDetailTab;
  tabs: Array<{ id: KolamUnexpectedExpenseDetailTab; label: string }>;
  historyItems: KolamUnexpectedExpenseHistoryItem[];
  loading: boolean;
  verifying: boolean;
  error: string;
  statusMessage: string;
  canView: boolean;
  canVerify: boolean;
  canShowVerify: boolean;
  canUpdate: boolean;
  onSelectTab: (tab: KolamUnexpectedExpenseDetailTab) => void;
  onVerify: () => Promise<void>;
  onEdit: () => void;
  onOpenWallet: () => void;
  onBack: () => void;
  onRefresh: () => Promise<void>;
}

export function useKolamUnexpectedExpenseDetailController(
  route: string,
  onRouteChange?: (route: string) => void,
): KolamUnexpectedExpenseDetailController | null {
  const { authUser } = useKolamAuthContext();
  const mode = getKolamUnexpectedExpenseSurfaceMode(route);
  const detailId =
    mode === 'detail' ? getKolamUnexpectedExpenseIdFromRoute(route) : null;
  const tabFromRoute = getKolamUnexpectedExpenseDetailTab(route);

  const permissions = authUser?.permissions;
  const roleKey = authUser?.roleKey;
  const canView = hasKolamFinanceExpensePermission(
    permissions,
    'unexpected-expense',
    'view',
    roleKey,
  );
  const canVerify = hasKolamFinanceExpensePermission(
    permissions,
    'unexpected-expense',
    'verify',
    roleKey,
  );
  const canUpdate = hasKolamFinanceExpensePermission(
    permissions,
    'unexpected-expense',
    'update',
    roleKey,
  );

  const [detail, setDetail] = useState<KolamUnexpectedExpenseDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const requestIdRef = useRef(0);

  const refresh = useCallback(async () => {
    if (!detailId || !canView) {
      return;
    }
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError('');
    try {
      const next = await fetchKolamUnexpectedExpenseById(detailId);
      if (requestIdRef.current !== requestId) {
        return;
      }
      setDetail(next);
    } catch (err) {
      if (requestIdRef.current !== requestId) {
        return;
      }
      setDetail(null);
      setError(resolveErrorMessage(err, 'Gagal memuat Pengeluaran'));
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [canView, detailId]);

  useEffect(() => {
    if (mode !== 'detail' || !detailId) {
      return;
    }
    if (!canView) {
      setLoading(false);
      setError('Akses ditolak');
      setDetail(null);
      return;
    }
    void refresh();
  }, [canView, detailId, mode, refresh]);

  const onSelectTab = useCallback(
    (tab: KolamUnexpectedExpenseDetailTab) => {
      if (!detailId) {
        return;
      }
      onRouteChange?.(buildKolamUnexpectedExpenseDetailRoute(detailId, tab));
    },
    [detailId, onRouteChange],
  );

  const onVerify = useCallback(async () => {
    if (!detail || !canVerify || detail.status === 'verified') {
      return;
    }
    setVerifying(true);
    setError('');
    setStatusMessage('');
    try {
      await verifyKolamFinanceExpense('unexpected-expense', detail.id);
      setStatusMessage('Pengeluaran diverifikasi');
      await refresh();
    } catch (err) {
      setError(resolveErrorMessage(err, 'Gagal verifikasi'));
    } finally {
      setVerifying(false);
    }
  }, [canVerify, detail, refresh]);

  const onEdit = useCallback(() => {
    if (!detail) {
      return;
    }
    onRouteChange?.(getKolamUnexpectedExpenseEditRoute(detail.id));
  }, [detail, onRouteChange]);

  const onOpenWallet = useCallback(() => {
    if (!detail?.walletId) {
      return;
    }
    onRouteChange?.(`/wallet/${encodeURIComponent(detail.walletId)}`);
  }, [detail, onRouteChange]);

  const onBack = useCallback(() => {
    onRouteChange?.(getKolamFinanceExpenseRoot('unexpected-expense'));
  }, [onRouteChange]);

  const historyItems = useMemo(
    () => (detail ? buildKolamUnexpectedExpenseHistoryItems(detail) : []),
    [detail],
  );

  if (mode !== 'detail') {
    return null;
  }

  return {
    detail,
    tab: tabFromRoute,
    tabs: KOLAM_UNEXPECTED_EXPENSE_DETAIL_TABS,
    historyItems,
    loading,
    verifying,
    error,
    statusMessage,
    canView,
    canVerify,
    canShowVerify: Boolean(
      canVerify && detail && detail.status !== 'verified',
    ),
    canUpdate,
    onSelectTab,
    onVerify,
    onEdit,
    onOpenWallet,
    onBack,
    onRefresh: refresh,
  };
}

function resolveErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    return err.message;
  }
  if (err instanceof Error && err.message.trim()) {
    return err.message;
  }
  return fallback;
}
