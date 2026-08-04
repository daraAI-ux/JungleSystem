import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import {
  buildKolamAssetPurchaseDetailRoute,
  buildKolamAssetPurchaseHistoryItems,
  getKolamAssetPurchaseDetailTab,
  getKolamAssetPurchaseEditRoute,
  getKolamAssetPurchaseIdFromRoute,
  getKolamAssetPurchaseSurfaceMode,
  getKolamFinanceExpenseRoot,
  hasKolamFinanceExpensePermission,
  KOLAM_ASSET_PURCHASE_DETAIL_TABS,
  type KolamAssetPurchaseDetail,
  type KolamAssetPurchaseDetailTab,
  type KolamAssetPurchaseHistoryItem,
} from '../domain/kolam-finance-expense';
import { ApiError } from '../lib/api-error';
import {
  fetchKolamAssetPurchaseById,
  verifyKolamFinanceExpense,
} from '../services/kolam-finance-expense-api';

export interface KolamAssetPurchaseDetailController {
  detail: KolamAssetPurchaseDetail | null;
  tab: KolamAssetPurchaseDetailTab;
  tabs: Array<{ id: KolamAssetPurchaseDetailTab; label: string }>;
  historyItems: KolamAssetPurchaseHistoryItem[];
  loading: boolean;
  verifying: boolean;
  error: string;
  statusMessage: string;
  canView: boolean;
  canVerify: boolean;
  canShowVerify: boolean;
  onSelectTab: (tab: KolamAssetPurchaseDetailTab) => void;
  onVerify: () => Promise<void>;
  onEdit: () => void;
  onOpenWallet: () => void;
  onBack: () => void;
  onRefresh: () => Promise<void>;
}

export function useKolamAssetPurchaseDetailController(
  route: string,
  onRouteChange?: (route: string) => void,
): KolamAssetPurchaseDetailController | null {
  const { authUser } = useKolamAuthContext();
  const mode = getKolamAssetPurchaseSurfaceMode(route);
  const detailId =
    mode === 'detail' ? getKolamAssetPurchaseIdFromRoute(route) : null;
  const tabFromRoute = getKolamAssetPurchaseDetailTab(route);

  const permissions = authUser?.permissions;
  const roleKey = authUser?.roleKey;
  const canView = hasKolamFinanceExpensePermission(
    permissions,
    'asset-purchase',
    'view',
    roleKey,
  );
  const canVerify = hasKolamFinanceExpensePermission(
    permissions,
    'asset-purchase',
    'verify',
    roleKey,
  );

  const [detail, setDetail] = useState<KolamAssetPurchaseDetail | null>(null);
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
      const next = await fetchKolamAssetPurchaseById(detailId);
      if (requestIdRef.current !== requestId) {
        return;
      }
      setDetail(next);
    } catch (err) {
      if (requestIdRef.current !== requestId) {
        return;
      }
      setDetail(null);
      setError(resolveErrorMessage(err, 'Gagal memuat pembelian aset'));
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
    (tab: KolamAssetPurchaseDetailTab) => {
      if (!detailId) {
        return;
      }
      onRouteChange?.(buildKolamAssetPurchaseDetailRoute(detailId, tab));
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
      await verifyKolamFinanceExpense('asset-purchase', detail.id);
      setStatusMessage('Pembelian aset diverifikasi');
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
    onRouteChange?.(getKolamAssetPurchaseEditRoute(detail.id));
  }, [detail, onRouteChange]);

  const onOpenWallet = useCallback(() => {
    if (!detail?.walletId) {
      return;
    }
    onRouteChange?.(`/wallet/${encodeURIComponent(detail.walletId)}`);
  }, [detail, onRouteChange]);

  const onBack = useCallback(() => {
    onRouteChange?.(getKolamFinanceExpenseRoot('asset-purchase'));
  }, [onRouteChange]);

  const historyItems = useMemo(
    () => (detail ? buildKolamAssetPurchaseHistoryItems(detail) : []),
    [detail],
  );

  const tabs = useMemo(() => {
    return KOLAM_ASSET_PURCHASE_DETAIL_TABS.map(tab => {
      if (tab.id === 'depreciation' && detail && !detail.hasLinkedAsset) {
        return { ...tab, label: 'Penyusutan ·' };
      }
      return tab;
    });
  }, [detail]);

  if (mode !== 'detail') {
    return null;
  }

  return {
    detail,
    tab: tabFromRoute,
    tabs,
    historyItems,
    loading,
    verifying,
    error,
    statusMessage,
    canView,
    canVerify,
    canShowVerify:
      canVerify && Boolean(detail) && detail?.status !== 'verified',
    onSelectTab,
    onVerify,
    onEdit,
    onOpenWallet,
    onBack,
    onRefresh: refresh,
  };
}

function resolveErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}
