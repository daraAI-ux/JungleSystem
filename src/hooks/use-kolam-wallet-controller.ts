import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import {
  buildKolamWalletSummaryStats,
  countKolamWalletTxByType,
  createInitialWalletListFilters,
  createInitialWalletTxFilters,
  getKolamWalletRouteId,
  getKolamWalletSurfaceMode,
  hasKolamWalletPermission,
  type KolamWallet,
  type KolamWalletListFilters,
  type KolamWalletPagination,
  type KolamWalletSummaryStats,
  type KolamWalletSurfaceMode,
  type KolamWalletTab,
  type KolamWalletTransaction,
  type KolamWalletTxFilters,
  type KolamWalletWriteBody,
} from '../domain/kolam-wallet';
import { ApiError } from '../lib/api-error';
import {
  confirmKolamWalletTransaction,
  createKolamWallet,
  deleteKolamWallet,
  depositKolamWallet,
  fetchKolamWalletById,
  fetchKolamWalletTransactions,
  fetchKolamWalletsAll,
  fetchKolamWalletsPaginated,
  transferKolamWallet,
  updateKolamWallet,
  withdrawKolamWallet,
} from '../services/kolam-wallet-api';

export type KolamWalletActionModal = 'deposit' | 'withdraw' | 'transfer' | null;

export interface KolamWalletController {
  mode: KolamWalletSurfaceMode;
  documentId: string | null;
  activeTab: KolamWalletTab;
  walletFilters: KolamWalletListFilters;
  txFilters: KolamWalletTxFilters;
  wallets: KolamWallet[];
  allWallets: KolamWallet[];
  filteredWallets: KolamWallet[];
  walletPagination: KolamWalletPagination;
  transactions: KolamWalletTransaction[];
  txPagination: KolamWalletPagination;
  detailWallet: KolamWallet | null;
  summaryStats: KolamWalletSummaryStats;
  txTypeCounts: { credit: number; debit: number };
  totalBalance: number;
  loadingWallets: boolean;
  loadingSummary: boolean;
  loadingTransactions: boolean;
  loadingDetail: boolean;
  submitting: boolean;
  confirmingTxId: string | null;
  deletingWalletId: string | null;
  actionModal: KolamWalletActionModal;
  error: string;
  statusMessage: string;
  canEdit: boolean;
  canConfirm: boolean;
  canCreate: boolean;
  canDelete: boolean;
  onChangeTab: (tab: KolamWalletTab) => void;
  onChangeWalletFilters: (patch: Partial<KolamWalletListFilters>) => void;
  onChangeTxFilters: (patch: Partial<KolamWalletTxFilters>) => void;
  onClearWalletFilters: () => void;
  onClearTxFilters: () => void;
  onWalletPageChange: (page: number) => void;
  onWalletLimitChange: (limit: number) => void;
  onTxPageChange: (page: number) => void;
  onTxLimitChange: (limit: number) => void;
  onRefreshWallets: () => Promise<void>;
  onRefreshTransactions: () => Promise<void>;
  onRefreshDetail: () => Promise<void>;
  onOpenActionModal: (modal: KolamWalletActionModal) => void;
  onCloseActionModal: () => void;
  onDeposit: (input: {
    walletId: string;
    amount: number;
    note?: string;
    proofLocalUris?: string[];
  }) => Promise<void>;
  onWithdraw: (input: {
    walletId: string;
    amount: number;
    note?: string;
    proofLocalUris?: string[];
  }) => Promise<void>;
  onTransfer: (input: {
    fromWalletId: string;
    toWalletId: string;
    amount: number;
    note?: string;
    proofLocalUris?: string[];
  }) => Promise<void>;
  onConfirmTransaction: (tx: KolamWalletTransaction) => Promise<void>;
  onCreateWallet: (body: KolamWalletWriteBody) => Promise<KolamWallet | null>;
  onUpdateWallet: (
    id: string,
    body: Partial<KolamWalletWriteBody>,
  ) => Promise<KolamWallet | null>;
  onDeleteWallet: (wallet: KolamWallet) => Promise<boolean>;
  clearStatusMessage: () => void;
}

export function useKolamWalletController(route: string): KolamWalletController {
  const { authUser } = useKolamAuthContext();
  const mode = getKolamWalletSurfaceMode(route);
  const documentId = getKolamWalletRouteId(route);

  const [activeTab, setActiveTab] = useState<KolamWalletTab>('wallets');
  const [walletFilters, setWalletFilters] = useState<KolamWalletListFilters>(
    () => createInitialWalletListFilters(),
  );
  const [txFilters, setTxFilters] = useState<KolamWalletTxFilters>(() =>
    createInitialWalletTxFilters(documentId ?? ''),
  );
  const [wallets, setWallets] = useState<KolamWallet[]>([]);
  const [allWallets, setAllWallets] = useState<KolamWallet[]>([]);
  const [walletPagination, setWalletPagination] =
    useState<KolamWalletPagination>({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    });
  const [transactions, setTransactions] = useState<KolamWalletTransaction[]>(
    [],
  );
  const [txPagination, setTxPagination] = useState<KolamWalletPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [detailWallet, setDetailWallet] = useState<KolamWallet | null>(null);
  const [loadingWallets, setLoadingWallets] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmingTxId, setConfirmingTxId] = useState<string | null>(null);
  const [deletingWalletId, setDeletingWalletId] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<KolamWalletActionModal>(null);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const walletFiltersRef = useRef(walletFilters);
  walletFiltersRef.current = walletFilters;
  const txFiltersRef = useRef(txFilters);
  txFiltersRef.current = txFilters;

  const canEdit = hasKolamWalletPermission(
    authUser?.permissions,
    'update',
    authUser?.roleKey,
  );
  const canConfirm = hasKolamWalletPermission(
    authUser?.permissions,
    'confirm',
    authUser?.roleKey,
  );
  const canCreate = hasKolamWalletPermission(
    authUser?.permissions,
    'create',
    authUser?.roleKey,
  );
  const canDelete = hasKolamWalletPermission(
    authUser?.permissions,
    'delete',
    authUser?.roleKey,
  );

  useEffect(() => {
    if (documentId) {
      setTxFilters(prev => ({ ...prev, walletId: documentId, page: 1 }));
    }
  }, [documentId]);

  const filteredWallets = useMemo(() => {
    const query = walletFilters.search.trim().toLowerCase();
    if (!query) {
      return wallets;
    }
    return wallets.filter(wallet => {
      const haystack = `${wallet.name} ${wallet.note} ${wallet.provider}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [walletFilters.search, wallets]);

  const summaryStats = useMemo(
    () => buildKolamWalletSummaryStats(allWallets),
    [allWallets],
  );
  const txTypeCounts = useMemo(
    () => countKolamWalletTxByType(transactions),
    [transactions],
  );
  const totalBalance = summaryStats.totalBalance;

  const refreshAllWallets = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const items = await fetchKolamWalletsAll();
      setAllWallets(items);
    } catch (err) {
      setAllWallets([]);
      setError(getErrorMessage(err, 'Gagal memuat ringkasan dompet.'));
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  const refreshWallets = useCallback(async () => {
    setLoadingWallets(true);
    setError('');
    try {
      const current = walletFiltersRef.current;
      const result = await fetchKolamWalletsPaginated({
        page: current.page,
        limit: current.limit,
        type: current.type,
      });
      setWallets(result.items);
      setWalletPagination(result.pagination);
    } catch (err) {
      setWallets([]);
      setError(getErrorMessage(err, 'Gagal memuat dompet.'));
    } finally {
      setLoadingWallets(false);
    }
  }, []);

  const refreshTransactions = useCallback(async () => {
    setLoadingTransactions(true);
    setError('');
    try {
      const current = txFiltersRef.current;
      const result = await fetchKolamWalletTransactions({
        page: current.page,
        limit: current.limit,
        walletId: current.walletId,
        type: current.type,
        source: current.source,
        confirmStatus: current.confirmStatus,
        startDate: current.startDate,
        endDate: current.endDate,
      });
      setTransactions(result.items);
      setTxPagination(result.pagination);
    } catch (err) {
      setTransactions([]);
      setError(getErrorMessage(err, 'Gagal memuat transaksi.'));
    } finally {
      setLoadingTransactions(false);
    }
  }, []);

  const refreshDetail = useCallback(async () => {
    if (!documentId) {
      setDetailWallet(null);
      return;
    }
    setLoadingDetail(true);
    setError('');
    try {
      const wallet = await fetchKolamWalletById(documentId);
      setDetailWallet(wallet);
    } catch (err) {
      setDetailWallet(null);
      setError(getErrorMessage(err, 'Gagal memuat detail dompet.'));
    } finally {
      setLoadingDetail(false);
    }
  }, [documentId]);

  useEffect(() => {
    void refreshAllWallets();
  }, [refreshAllWallets]);

  useEffect(() => {
    void refreshWallets();
  }, [
    walletFilters.page,
    walletFilters.limit,
    walletFilters.type,
    refreshWallets,
  ]);

  useEffect(() => {
    if (mode === 'detail' || mode === 'edit') {
      void refreshDetail();
    }
  }, [mode, refreshDetail]);

  useEffect(() => {
    void refreshTransactions();
  }, [
    mode,
    activeTab,
    txFilters.page,
    txFilters.limit,
    txFilters.walletId,
    txFilters.type,
    txFilters.source,
    txFilters.confirmStatus,
    txFilters.startDate,
    txFilters.endDate,
    refreshTransactions,
  ]);

  const onChangeTab = useCallback((tab: KolamWalletTab) => {
    setActiveTab(tab);
  }, []);

  const onChangeWalletFilters = useCallback(
    (patch: Partial<KolamWalletListFilters>) => {
      setWalletFilters(prev => ({
        ...prev,
        ...patch,
        page: patch.page ?? (patch.search != null || patch.type != null ? 1 : prev.page),
      }));
    },
    [],
  );

  const onChangeTxFilters = useCallback((patch: Partial<KolamWalletTxFilters>) => {
    setTxFilters(prev => ({
      ...prev,
      ...patch,
      page:
        patch.page ??
        (patch.walletId != null ||
        patch.type != null ||
        patch.source != null ||
        patch.confirmStatus != null ||
        patch.startDate != null ||
        patch.endDate != null
          ? 1
          : prev.page),
    }));
  }, []);

  const onClearWalletFilters = useCallback(() => {
    setWalletFilters(createInitialWalletListFilters());
  }, []);

  const onClearTxFilters = useCallback(() => {
    setTxFilters(createInitialWalletTxFilters(documentId ?? ''));
  }, [documentId]);

  const onWalletPageChange = useCallback((page: number) => {
    setWalletFilters(prev => ({ ...prev, page }));
  }, []);

  const onWalletLimitChange = useCallback((limit: number) => {
    setWalletFilters(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  const onTxPageChange = useCallback((page: number) => {
    setTxFilters(prev => ({ ...prev, page }));
  }, []);

  const onTxLimitChange = useCallback((limit: number) => {
    setTxFilters(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  const runMutation = useCallback(
    async (action: () => Promise<void>, successMessage: string) => {
      setSubmitting(true);
      setError('');
      setStatusMessage('');
      try {
        await action();
        setStatusMessage(successMessage);
        setActionModal(null);
        await Promise.all([
          refreshAllWallets(),
          refreshWallets(),
          refreshTransactions(),
          mode === 'detail' ? refreshDetail() : Promise.resolve(),
        ]);
      } catch (err) {
        setError(getErrorMessage(err, 'Operasi gagal.'));
      } finally {
        setSubmitting(false);
      }
    },
    [mode, refreshAllWallets, refreshDetail, refreshTransactions, refreshWallets],
  );

  const onDeposit = useCallback(
    async (input: {
      walletId: string;
      amount: number;
      note?: string;
      proofLocalUris?: string[];
    }) => {
      await runMutation(async () => {
        await depositKolamWallet(input);
      }, 'Drop dana berhasil.');
    },
    [runMutation],
  );

  const onWithdraw = useCallback(
    async (input: {
      walletId: string;
      amount: number;
      note?: string;
      proofLocalUris?: string[];
    }) => {
      await runMutation(async () => {
        await withdrawKolamWallet(input);
      }, 'Tarik dana berhasil.');
    },
    [runMutation],
  );

  const onTransfer = useCallback(
    async (input: {
      fromWalletId: string;
      toWalletId: string;
      amount: number;
      note?: string;
      proofLocalUris?: string[];
    }) => {
      await runMutation(async () => {
        await transferKolamWallet(input);
      }, 'Transfer berhasil.');
    },
    [runMutation],
  );

  const onConfirmTransaction = useCallback(
    async (tx: KolamWalletTransaction) => {
      if (!tx.id) {
        return;
      }
      setConfirmingTxId(tx.id);
      setError('');
      setStatusMessage('');
      try {
        await confirmKolamWalletTransaction(tx.id);
        setStatusMessage('Transaksi dikonfirmasi.');
        await Promise.all([
          refreshTransactions(),
          refreshWallets(),
          refreshAllWallets(),
          mode === 'detail' || mode === 'edit'
            ? refreshDetail()
            : Promise.resolve(),
        ]);
      } catch (err) {
        setError(getErrorMessage(err, 'Gagal mengonfirmasi transaksi.'));
      } finally {
        setConfirmingTxId(null);
      }
    },
    [mode, refreshAllWallets, refreshDetail, refreshTransactions, refreshWallets],
  );

  const onCreateWallet = useCallback(
    async (body: KolamWalletWriteBody) => {
      setSubmitting(true);
      setError('');
      setStatusMessage('');
      try {
        const created = await createKolamWallet(body);
        setStatusMessage('Dompet berhasil dibuat');
        await Promise.all([refreshAllWallets(), refreshWallets()]);
        return created;
      } catch (err) {
        setError(getErrorMessage(err, 'Gagal membuat dompet'));
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [refreshAllWallets, refreshWallets],
  );

  const onUpdateWallet = useCallback(
    async (id: string, body: Partial<KolamWalletWriteBody>) => {
      setSubmitting(true);
      setError('');
      setStatusMessage('');
      try {
        const updated = await updateKolamWallet(id, body);
        setStatusMessage('Dompet berhasil diperbarui');
        await Promise.all([
          refreshAllWallets(),
          refreshWallets(),
          refreshDetail(),
        ]);
        return updated;
      } catch (err) {
        setError(getErrorMessage(err, 'Gagal memperbarui dompet'));
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [refreshAllWallets, refreshDetail, refreshWallets],
  );

  const onDeleteWallet = useCallback(
    async (wallet: KolamWallet) => {
      if (!wallet.id) {
        return false;
      }
      setDeletingWalletId(wallet.id);
      setError('');
      setStatusMessage('');
      try {
        await deleteKolamWallet(wallet.id);
        setStatusMessage('Dompet berhasil dihapus');
        await Promise.all([refreshAllWallets(), refreshWallets()]);
        return true;
      } catch (err) {
        setError(getErrorMessage(err, 'Gagal menghapus dompet'));
        return false;
      } finally {
        setDeletingWalletId(null);
      }
    },
    [refreshAllWallets, refreshWallets],
  );

  return {
    mode,
    documentId,
    activeTab,
    walletFilters,
    txFilters,
    wallets,
    allWallets,
    filteredWallets,
    walletPagination,
    transactions,
    txPagination,
    detailWallet,
    summaryStats,
    txTypeCounts,
    totalBalance,
    loadingWallets,
    loadingSummary,
    loadingTransactions,
    loadingDetail,
    submitting,
    confirmingTxId,
    deletingWalletId,
    actionModal,
    error,
    statusMessage,
    canEdit,
    canConfirm,
    canCreate,
    canDelete,
    onChangeTab,
    onChangeWalletFilters,
    onChangeTxFilters,
    onClearWalletFilters,
    onClearTxFilters,
    onWalletPageChange,
    onWalletLimitChange,
    onTxPageChange,
    onTxLimitChange,
    onRefreshWallets: refreshWallets,
    onRefreshTransactions: refreshTransactions,
    onRefreshDetail: refreshDetail,
    onOpenActionModal: setActionModal,
    onCloseActionModal: () => setActionModal(null),
    onDeposit,
    onWithdraw,
    onTransfer,
    onConfirmTransaction,
    onCreateWallet,
    onUpdateWallet,
    onDeleteWallet,
    clearStatusMessage: () => setStatusMessage(''),
  };
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError && err.message.trim()) {
    return err.message.trim();
  }
  if (err instanceof Error && err.message.trim()) {
    return err.message.trim();
  }
  return fallback;
}
