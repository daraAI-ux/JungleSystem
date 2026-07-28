import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  computeAdminCashflowReviewSummary,
  formatAdminCashflowStatusLabel,
  getGrossCashFromInvoiceGroup,
  invoiceReviewFilterMatches,
  isCashInvoiceGroup,
  type KolamAdminCashflowConfirmAllResult,
  type KolamAdminCashflowDeposit,
  type KolamAdminCashflowDetailTab,
  type KolamAdminCashflowInvoiceGroup,
  type KolamAdminCashflowInvoiceReviewFilter,
  type KolamAdminCashflowRecheckResult,
  type KolamAdminCashflowReviewSummary,
  type KolamAdminCashflowSession,
  type KolamAdminCashflowSubmitDirectAllocation,
} from '../domain/kolam-admin-cashflow-session';
import type { KolamWalletOption } from '../domain/kolam-wallet-option';
import { ApiError } from '../lib/api-error';
import {
  closeKolamAdminCashflowSession,
  confirmAllKolamAdminCashflowTransactions,
  confirmKolamAdminCashflowInvoice,
  getKolamAdminCashflowByInvoice,
  getKolamAdminCashflowDeposits,
  getKolamAdminCashflowReview,
  getKolamAdminCashflowSession,
  recheckKolamAdminCashflowSession,
  rejectKolamAdminCashflowInvoice,
  submitKolamAdminCashflowDirectDeposit,
  verifyKolamAdminCashflowDeposit,
  voidKolamAdminCashflowSession,
} from '../services/kolam-cashflow-session-api';
import { getKolamWalletOptionsPaginated } from '../services/kolam-wallet-option-api';

export interface KolamAdminCashflowDepositDraftAllocation {
  saleId: string;
  invoiceCode: string;
  expectedAmountIdr: number;
  actualAmountIdr: string;
  note: string;
}

export interface KolamAdminCashflowSessionDetailController {
  sessionId: string;
  session: KolamAdminCashflowSession | null;
  loading: boolean;
  acting: boolean;
  error: string;
  statusMessage: string;
  activeTab: KolamAdminCashflowDetailTab;
  setActiveTab: (tab: KolamAdminCashflowDetailTab) => void;
  reviewSummary: KolamAdminCashflowReviewSummary;
  invoiceGroups: KolamAdminCashflowInvoiceGroup[];
  invoiceFilter: KolamAdminCashflowInvoiceReviewFilter;
  setInvoiceFilter: (filter: KolamAdminCashflowInvoiceReviewFilter) => void;
  filteredInvoiceGroups: KolamAdminCashflowInvoiceGroup[];
  invoiceFilterCounts: Record<KolamAdminCashflowInvoiceReviewFilter, number>;
  deposits: KolamAdminCashflowDeposit[];
  cashWallets: KolamWalletOption[];
  nonCashWallets: KolamWalletOption[];
  cashInvoiceCandidates: KolamAdminCashflowInvoiceGroup[];
  canClose: boolean;
  canRecheck: boolean;
  canVoid: boolean;
  canConfirmAll: boolean;
  canSubmitDeposit: boolean;
  readOnlyReview: boolean;
  onRefresh: () => Promise<void>;
  onCloseSession: () => Promise<boolean>;
  onVoidSession: (reason: string) => Promise<boolean>;
  onRecheckSession: () => Promise<KolamAdminCashflowRecheckResult | null>;
  onConfirmInvoice: (saleId: string) => Promise<boolean>;
  onRejectInvoice: (saleId: string, note: string) => Promise<boolean>;
  onConfirmAllNonCash: () => Promise<KolamAdminCashflowConfirmAllResult | null>;
  onSubmitDirectDeposit: (input: {
    fromWallet: string;
    toWallet: string;
    allocations: KolamAdminCashflowSubmitDirectAllocation[];
    note?: string;
  }) => Promise<boolean>;
  onVerifyDeposit: (deposit: KolamAdminCashflowDeposit) => Promise<boolean>;
  clearStatusMessage: () => void;
}

function isCashWallet(wallet: KolamWalletOption) {
  return (
    wallet.type.toLowerCase() === 'cash' ||
    (wallet.provider || '').toUpperCase() === 'CASH'
  );
}

export function useKolamAdminCashflowSessionDetailController(
  sessionId: string | null,
): KolamAdminCashflowSessionDetailController {
  const [session, setSession] = useState<KolamAdminCashflowSession | null>(
    null,
  );
  const [reviewSummary, setReviewSummary] =
    useState<KolamAdminCashflowReviewSummary>({
      unconfirmedCount: 0,
      cashTotal: 0,
      nonCashTotal: 0,
      totalUnconfirmed: 0,
    });
  const [invoiceGroups, setInvoiceGroups] = useState<
    KolamAdminCashflowInvoiceGroup[]
  >([]);
  const [deposits, setDeposits] = useState<KolamAdminCashflowDeposit[]>([]);
  const [wallets, setWallets] = useState<KolamWalletOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [activeTab, setActiveTab] =
    useState<KolamAdminCashflowDetailTab>('overview');
  const [invoiceFilter, setInvoiceFilter] =
    useState<KolamAdminCashflowInvoiceReviewFilter>('pending');
  const autoRecheckedRef = useRef(false);
  const resolvedSessionId = sessionId?.trim() || '';

  const refresh = useCallback(async () => {
    if (!resolvedSessionId) {
      setSession(null);
      setInvoiceGroups([]);
      setDeposits([]);
      setReviewSummary({
        unconfirmedCount: 0,
        cashTotal: 0,
        nonCashTotal: 0,
        totalUnconfirmed: 0,
      });
      return;
    }

    setLoading(true);
    setError('');
    try {
      const [sessionRow, reviewEntries, groups, depositRows, walletRows] =
        await Promise.all([
          getKolamAdminCashflowSession(resolvedSessionId),
          getKolamAdminCashflowReview(resolvedSessionId),
          getKolamAdminCashflowByInvoice(resolvedSessionId),
          getKolamAdminCashflowDeposits(resolvedSessionId),
          getKolamWalletOptionsPaginated({ page: 1, limit: 200 }),
        ]);
      setSession(sessionRow);
      setReviewSummary(computeAdminCashflowReviewSummary(reviewEntries));
      setInvoiceGroups(groups);
      setDeposits(depositRows);
      setWallets(walletRows);
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal memuat detail sesi tunai.'));
    } finally {
      setLoading(false);
    }
  }, [resolvedSessionId]);

  useEffect(() => {
    autoRecheckedRef.current = false;
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!resolvedSessionId || !session) {
      return;
    }
    if (autoRecheckedRef.current) {
      return;
    }
    if (session.status !== 'locked') {
      return;
    }
    autoRecheckedRef.current = true;
    void recheckKolamAdminCashflowSession(resolvedSessionId)
      .then(result => {
        if (result.transitioned) {
          setStatusMessage(
            'Sesi diverifikasi otomatis — semua entri yang bisa dikonfirmasi sudah selesai.',
          );
          return refresh();
        }
        return undefined;
      })
      .catch(() => {
        // Silent — manual recheck remains available.
      });
  }, [refresh, resolvedSessionId, session]);

  const cashWallets = useMemo(
    () => wallets.filter(isCashWallet),
    [wallets],
  );
  const nonCashWallets = useMemo(
    () => wallets.filter(wallet => !isCashWallet(wallet)),
    [wallets],
  );

  const filteredInvoiceGroups = useMemo(
    () =>
      invoiceGroups.filter(group =>
        invoiceReviewFilterMatches(group, invoiceFilter),
      ),
    [invoiceFilter, invoiceGroups],
  );

  const invoiceFilterCounts = useMemo(
    () => ({
      pending: invoiceGroups.filter(group =>
        invoiceReviewFilterMatches(group, 'pending'),
      ).length,
      confirmed: invoiceGroups.filter(group =>
        invoiceReviewFilterMatches(group, 'confirmed'),
      ).length,
      rejected: invoiceGroups.filter(group =>
        invoiceReviewFilterMatches(group, 'rejected'),
      ).length,
      all: invoiceGroups.length,
    }),
    [invoiceGroups],
  );

  const cashInvoiceCandidates = useMemo(
    () =>
      invoiceGroups.filter(group => {
        if (!group.saleId) {
          return false;
        }
        if (!isCashInvoiceGroup(group)) {
          return false;
        }
        return (
          group.confirmStatus === 'unconfirmed' ||
          group.confirmStatus === 'partial'
        );
      }),
    [invoiceGroups],
  );

  const canClose = session?.status === 'open';
  const canRecheck = session?.status === 'locked';
  const canVoid = session?.status === 'locked';
  const canConfirmAll =
    session?.status === 'locked' && reviewSummary.nonCashTotal > 0;
  const canSubmitDeposit =
    session?.status === 'locked' &&
    session.source !== 'pos' &&
    reviewSummary.cashTotal > 0;
  const readOnlyReview = session?.status !== 'locked';

  const runAction = useCallback(
    async <T,>(
      action: () => Promise<T>,
      successMessage: string | null,
      failureFallback: string,
    ): Promise<T | null> => {
      setActing(true);
      setError('');
      setStatusMessage('');
      try {
        const result = await action();
        if (successMessage) {
          setStatusMessage(successMessage);
        }
        await refresh();
        return result;
      } catch (err) {
        setError(getErrorMessage(err, failureFallback));
        return null;
      } finally {
        setActing(false);
      }
    },
    [refresh],
  );

  const onCloseSession = useCallback(async () => {
    if (!resolvedSessionId) {
      return false;
    }
    const result = await runAction(
      () => closeKolamAdminCashflowSession(resolvedSessionId),
      'Sesi ditutup (terkunci).',
      'Gagal menutup sesi.',
    );
    return Boolean(result);
  }, [resolvedSessionId, runAction]);

  const onVoidSession = useCallback(
    async (reason: string) => {
      if (!resolvedSessionId) {
        return false;
      }
      const trimmed = reason.trim();
      if (trimmed.length < 10) {
        setError('Alasan pembatalan minimal 10 karakter.');
        return false;
      }
      const result = await runAction(
        () => voidKolamAdminCashflowSession(resolvedSessionId, trimmed),
        null,
        'Gagal membatalkan sesi.',
      );
      if (!result) {
        return false;
      }
      setStatusMessage(
        `Sesi dibatalkan · ${result.rejectedTransactionsCount} entri ditolak.`,
      );
      return true;
    },
    [resolvedSessionId, runAction],
  );

  const onRecheckSession = useCallback(async () => {
    if (!resolvedSessionId) {
      return null;
    }
    setActing(true);
    setError('');
    setStatusMessage('');
    try {
      const result = await recheckKolamAdminCashflowSession(resolvedSessionId);
      if (result.transitioned) {
        setStatusMessage('Sesi terverifikasi.');
        await refresh();
      } else if (result.remainingConfirmable > 0) {
        setStatusMessage(
          `Masih ada ${result.remainingConfirmable} entri yang belum diselesaikan.`,
        );
      } else if (result.remainingExcluded > 0) {
        setStatusMessage(
          `${result.remainingExcluded} entri komisi tersisa. Status: ${formatAdminCashflowStatusLabel(result.sessionStatus)}.`,
        );
      } else {
        setStatusMessage(
          `Status saat ini: ${formatAdminCashflowStatusLabel(result.sessionStatus)}`,
        );
      }
      if (result.transitioned) {
        // already refreshed
      } else {
        await refresh();
      }
      return result;
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal memeriksa ulang sesi.'));
      return null;
    } finally {
      setActing(false);
    }
  }, [refresh, resolvedSessionId]);

  const onConfirmInvoice = useCallback(
    async (saleId: string) => {
      if (!resolvedSessionId || !saleId) {
        return false;
      }
      const result = await runAction(
        () => confirmKolamAdminCashflowInvoice(resolvedSessionId, saleId),
        'Invoice disetujui.',
        'Gagal menyetujui invoice.',
      );
      return Boolean(result);
    },
    [resolvedSessionId, runAction],
  );

  const onRejectInvoice = useCallback(
    async (saleId: string, note: string) => {
      if (!resolvedSessionId || !saleId) {
        return false;
      }
      if (!note.trim()) {
        setError('Catatan penolakan wajib diisi.');
        return false;
      }
      const result = await runAction(
        () =>
          rejectKolamAdminCashflowInvoice(
            resolvedSessionId,
            saleId,
            note.trim(),
          ),
        'Invoice ditolak.',
        'Gagal menolak invoice.',
      );
      return Boolean(result);
    },
    [resolvedSessionId, runAction],
  );

  const onConfirmAllNonCash = useCallback(async () => {
    if (!resolvedSessionId) {
      return null;
    }
    const result = await runAction(
      () => confirmAllKolamAdminCashflowTransactions(resolvedSessionId),
      null,
      'Gagal mengonfirmasi semua non-tunai.',
    );
    if (!result) {
      return null;
    }
    setStatusMessage(
      `Dikonfirmasi ${result.confirmedCount} transaksi. Sisa ${result.remainingUnconfirmed}.`,
    );
    return result;
  }, [resolvedSessionId, runAction]);

  const onSubmitDirectDeposit = useCallback(
    async (input: {
      fromWallet: string;
      toWallet: string;
      allocations: KolamAdminCashflowSubmitDirectAllocation[];
      note?: string;
    }) => {
      if (!resolvedSessionId) {
        return false;
      }
      if (
        !input.fromWallet ||
        !input.toWallet ||
        input.allocations.length === 0
      ) {
        setError('Lengkapi dompet asal/tujuan dan pilih minimal satu invoice.');
        return false;
      }
      const result = await runAction(
        () =>
          submitKolamAdminCashflowDirectDeposit({
            sessionId: resolvedSessionId,
            ...input,
          }),
        'Setoran dikirim.',
        'Gagal mengirim setoran.',
      );
      return Boolean(result);
    },
    [resolvedSessionId, runAction],
  );

  const onVerifyDeposit = useCallback(
    async (deposit: KolamAdminCashflowDeposit) => {
      if (!resolvedSessionId) {
        return false;
      }
      const result = await runAction(
        () =>
          verifyKolamAdminCashflowDeposit({
            sessionId: resolvedSessionId,
            depositId: deposit.id,
            source: deposit.source,
          }),
        'Setoran diverifikasi.',
        'Gagal memverifikasi setoran.',
      );
      return Boolean(result);
    },
    [resolvedSessionId, runAction],
  );

  return {
    sessionId: resolvedSessionId,
    session,
    loading,
    acting,
    error,
    statusMessage,
    activeTab,
    setActiveTab,
    reviewSummary,
    invoiceGroups,
    invoiceFilter,
    setInvoiceFilter,
    filteredInvoiceGroups,
    invoiceFilterCounts,
    deposits,
    cashWallets,
    nonCashWallets,
    cashInvoiceCandidates,
    canClose,
    canRecheck,
    canVoid,
    canConfirmAll,
    canSubmitDeposit,
    readOnlyReview,
    onRefresh: refresh,
    onCloseSession,
    onVoidSession,
    onRecheckSession,
    onConfirmInvoice,
    onRejectInvoice,
    onConfirmAllNonCash,
    onSubmitDirectDeposit,
    onVerifyDeposit,
    clearStatusMessage: () => setStatusMessage(''),
  };
}

export function buildDepositDraftFromCandidates(
  groups: KolamAdminCashflowInvoiceGroup[],
): KolamAdminCashflowDepositDraftAllocation[] {
  return groups
    .filter(group => group.saleId)
    .map(group => ({
      saleId: group.saleId as string,
      invoiceCode: group.invoiceCode || group.saleId || '—',
      expectedAmountIdr: getGrossCashFromInvoiceGroup(group),
      actualAmountIdr: String(getGrossCashFromInvoiceGroup(group)),
      note: '',
    }));
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
