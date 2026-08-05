import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import {
  buildKolamUnexpectedIncomeDetailRoute,
  buildKolamUnexpectedIncomeHistoryItems,
  getKolamFinanceExpenseRoot,
  getKolamUnexpectedIncomeDetailTab,
  getKolamUnexpectedIncomeEditRoute,
  getKolamUnexpectedIncomeIdFromRoute,
  getKolamUnexpectedIncomeSurfaceMode,
  hasKolamFinanceExpensePermission,
  KOLAM_UNEXPECTED_INCOME_DETAIL_TABS,
  type KolamUnexpectedIncomeDetail,
  type KolamUnexpectedIncomeDetailTab,
  type KolamUnexpectedIncomeHistoryItem,
} from '../domain/kolam-finance-expense';
import { ApiError } from '../lib/api-error';
import {
  fetchKolamUnexpectedIncomeById,
  verifyKolamFinanceExpense,
} from '../services/kolam-finance-expense-api';

export interface KolamUnexpectedIncomeDetailController {
  detail: KolamUnexpectedIncomeDetail | null;
  tab: KolamUnexpectedIncomeDetailTab;
  tabs: Array<{ id: KolamUnexpectedIncomeDetailTab; label: string }>;
  historyItems: KolamUnexpectedIncomeHistoryItem[];
  loading: boolean;
  verifying: boolean;
  error: string;
  statusMessage: string;
  canView: boolean;
  canVerify: boolean;
  canShowVerify: boolean;
  canUpdate: boolean;
  onSelectTab: (tab: KolamUnexpectedIncomeDetailTab) => void;
  onVerify: () => Promise<void>;
  onEdit: () => void;
  onOpenWallet: () => void;
  onBack: () => void;
  onRefresh: () => Promise<void>;
}

export function useKolamUnexpectedIncomeDetailController(
  route: string,
  onRouteChange?: (route: string) => void,
): KolamUnexpectedIncomeDetailController | null {
  const { authUser } = useKolamAuthContext();
  const mode = getKolamUnexpectedIncomeSurfaceMode(route);
  const detailId =
    mode === 'detail' ? getKolamUnexpectedIncomeIdFromRoute(route) : null;
  const tabFromRoute = getKolamUnexpectedIncomeDetailTab(route);

  const permissions = authUser?.permissions;
  const roleKey = authUser?.roleKey;
  const canView = hasKolamFinanceExpensePermission(
    permissions,
    'unexpected-income',
    'view',
    roleKey,
  );
  const canVerify = hasKolamFinanceExpensePermission(
    permissions,
    'unexpected-income',
    'verify',
    roleKey,
  );
  const canUpdate = hasKolamFinanceExpensePermission(
    permissions,
    'unexpected-income',
    'update',
    roleKey,
  );

  const [detail, setDetail] = useState<KolamUnexpectedIncomeDetail | null>(
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
      const next = await fetchKolamUnexpectedIncomeById(detailId);
      if (requestIdRef.current !== requestId) {
        return;
      }
      setDetail(next);
    } catch (err) {
      if (requestIdRef.current !== requestId) {
        return;
      }
      setDetail(null);
      setError(resolveErrorMessage(err, 'Gagal memuat pemasukan'));
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
    (tab: KolamUnexpectedIncomeDetailTab) => {
      if (!detailId) {
        return;
      }
      onRouteChange?.(buildKolamUnexpectedIncomeDetailRoute(detailId, tab));
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
      await verifyKolamFinanceExpense('unexpected-income', detail.id);
      setStatusMessage('Pemasukan diverifikasi');
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
    onRouteChange?.(getKolamUnexpectedIncomeEditRoute(detail.id));
  }, [detail, onRouteChange]);

  const onOpenWallet = useCallback(() => {
    if (!detail?.walletId) {
      return;
    }
    onRouteChange?.(`/wallet/${encodeURIComponent(detail.walletId)}`);
  }, [detail, onRouteChange]);

  const onBack = useCallback(() => {
    onRouteChange?.(getKolamFinanceExpenseRoot('unexpected-income'));
  }, [onRouteChange]);

  const historyItems = useMemo(
    () => (detail ? buildKolamUnexpectedIncomeHistoryItems(detail) : []),
    [detail],
  );

  if (mode !== 'detail') {
    return null;
  }

  return {
    detail,
    tab: tabFromRoute,
    tabs: KOLAM_UNEXPECTED_INCOME_DETAIL_TABS,
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
