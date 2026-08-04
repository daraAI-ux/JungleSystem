import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import {
  createInitialFinanceSummaryFilters,
  getKolamFinanceFocusTxId,
  hasKolamWalletPermission,
  isKolamFinanceConfirmableSource,
  txMatchesFinanceFocusId,
  type KolamFinanceConfirmStatusFilter,
  type KolamFinanceRange,
  type KolamFinanceSummaryData,
  type KolamFinanceSummaryFilters,
  type KolamFinanceTransaction,
} from '../domain/kolam-finance-summary';
import { ApiError } from '../lib/api-error';
import {
  confirmKolamFinanceCashflowTransaction,
  confirmKolamFinanceWalletTransaction,
  fetchKolamFinanceSummary,
} from '../services/kolam-finance-summary-api';
import { downloadKolamAccountingLedgerXlsx } from '../services/kolam-accounting-ledger-api';

export interface KolamFinanceSummaryController {
  filters: KolamFinanceSummaryFilters;
  summary: KolamFinanceSummaryData | null;
  filteredTransactions: KolamFinanceTransaction[];
  paginatedTransactions: KolamFinanceTransaction[];
  totalPages: number;
  focusTxId: string | null;
  loading: boolean;
  confirmingTxId: string | null;
  downloadingLedger: boolean;
  error: string;
  statusMessage: string;
  canConfirm: boolean;
  onChangeRange: (range: KolamFinanceRange) => void;
  onChangeCustomDates: (startDate: string, endDate: string) => void;
  onChangeConfirmStatus: (status: KolamFinanceConfirmStatusFilter) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onRefresh: () => Promise<void>;
  onConfirmTransaction: (tx: KolamFinanceTransaction) => Promise<void>;
  onDownloadLedger: () => Promise<void>;
  clearStatusMessage: () => void;
}

export function useKolamFinanceSummaryController(
  route: string,
): KolamFinanceSummaryController {
  const { authUser } = useKolamAuthContext();
  const focusTxId = getKolamFinanceFocusTxId(route);
  const [filters, setFilters] = useState<KolamFinanceSummaryFilters>(() =>
    createInitialFinanceSummaryFilters(),
  );
  const [summary, setSummary] = useState<KolamFinanceSummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmingTxId, setConfirmingTxId] = useState<string | null>(null);
  const [downloadingLedger, setDownloadingLedger] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const canConfirm = hasKolamWalletPermission(
    authUser?.permissions,
    'confirm',
    authUser?.roleKey,
  );

  const filteredTransactions = useMemo(() => {
    const txs = summary?.transactions ?? [];
    if (filters.confirmStatus === 'all') {
      return txs;
    }
    return txs.filter(tx => tx.confirmStatus === filters.confirmStatus);
  }, [filters.confirmStatus, summary?.transactions]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / Math.max(1, filters.limit)),
  );

  const paginatedTransactions = useMemo(() => {
    const start = (Math.max(1, filters.page) - 1) * Math.max(1, filters.limit);
    return filteredTransactions.slice(start, start + filters.limit);
  }, [filteredTransactions, filters.limit, filters.page]);

  const refresh = useCallback(async () => {
    const current = filtersRef.current;
    setLoading(true);
    setError('');
    try {
      const data = await fetchKolamFinanceSummary({
        range: current.range,
        startDate: current.startDate,
        endDate: current.endDate,
      });
      setSummary(data);
    } catch (err) {
      setSummary(null);
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal memuat ringkasan keuangan',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [filters.range, filters.startDate, filters.endDate, refresh]);

  useEffect(() => {
    if (!focusTxId || !summary) {
      return;
    }
    const index = filteredTransactions.findIndex(tx =>
      txMatchesFinanceFocusId(tx, focusTxId),
    );
    if (index < 0) {
      return;
    }
    const targetPage = Math.floor(index / Math.max(1, filters.limit)) + 1;
    if (targetPage !== filters.page) {
      setFilters(prev => ({ ...prev, page: targetPage }));
    }
  }, [
    filteredTransactions,
    filters.limit,
    filters.page,
    focusTxId,
    summary,
  ]);

  const onChangeRange = useCallback((range: KolamFinanceRange) => {
    setFilters(prev => ({
      ...prev,
      range,
      page: 1,
      startDate: range === 'custom' ? prev.startDate : '',
      endDate: range === 'custom' ? prev.endDate : '',
    }));
  }, []);

  const onChangeCustomDates = useCallback(
    (startDate: string, endDate: string) => {
      setFilters(prev => ({
        ...prev,
        startDate,
        endDate,
        page: 1,
      }));
    },
    [],
  );

  const onChangeConfirmStatus = useCallback(
    (confirmStatus: KolamFinanceConfirmStatusFilter) => {
      setFilters(prev => ({ ...prev, confirmStatus, page: 1 }));
    },
    [],
  );

  const onPageChange = useCallback((page: number) => {
    setFilters(prev => ({
      ...prev,
      page: Math.max(1, page),
    }));
  }, []);

  const onLimitChange = useCallback((limit: number) => {
    setFilters(prev => ({
      ...prev,
      limit: Math.max(1, limit),
      page: 1,
    }));
  }, []);

  const onConfirmTransaction = useCallback(
    async (tx: KolamFinanceTransaction) => {
      if (!tx.id || !canConfirm) {
        return;
      }
      if (tx.source === 'commission') {
        setStatusMessage('Entri ini dirilis lewat alur Komisi.');
        return;
      }
      setConfirmingTxId(tx.id);
      setError('');
      setStatusMessage('');
      try {
        if (tx.sourceModel === 'Complaint') {
          await confirmKolamFinanceWalletTransaction(tx.id);
          setStatusMessage('Transaksi refund dikonfirmasi');
        } else {
          const sessionId = tx.cashflowSessionId;
          if (!sessionId) {
            setError(
              'Transaksi tidak terhubung ke sesi cashflow — konfirmasi lewat halaman terkait.',
            );
            return;
          }
          if (!tx.source || !isKolamFinanceConfirmableSource(tx.source)) {
            setStatusMessage(
              'Entri ini dirilis lewat alur terpisah (mis. Komisi).',
            );
            return;
          }
          await confirmKolamFinanceCashflowTransaction(sessionId, tx.id);
          setStatusMessage('Transaksi dikonfirmasi');
        }
        await refresh();
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Gagal mengonfirmasi transaksi',
        );
      } finally {
        setConfirmingTxId(null);
      }
    },
    [canConfirm, refresh],
  );

  const clearStatusMessage = useCallback(() => {
    setStatusMessage('');
  }, []);

  const onDownloadLedger = useCallback(async () => {
    setDownloadingLedger(true);
    setError('');
    setStatusMessage('');
    try {
      const current = filtersRef.current;
      const result = await downloadKolamAccountingLedgerXlsx({
        range: current.range,
        startDate: current.startDate,
        endDate: current.endDate,
      });
      setStatusMessage(`Buku besar disimpan: ${result.name}`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal mengunduh buku besar',
      );
    } finally {
      setDownloadingLedger(false);
    }
  }, []);

  return {
    filters,
    summary,
    filteredTransactions,
    paginatedTransactions,
    totalPages,
    focusTxId,
    loading,
    confirmingTxId,
    downloadingLedger,
    error,
    statusMessage,
    canConfirm,
    onChangeRange,
    onChangeCustomDates,
    onChangeConfirmStatus,
    onPageChange,
    onLimitChange,
    onRefresh: refresh,
    onConfirmTransaction,
    onDownloadLedger,
    clearStatusMessage,
  };
}
