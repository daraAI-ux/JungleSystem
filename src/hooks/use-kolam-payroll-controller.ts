import { useCallback, useEffect, useMemo, useState } from 'react';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import {
  buildKolamPayrollPeriodRoute,
  buildKolamPayrollSlipRoute,
  buildPayrollPeriodKey,
  getKolamPayrollPeriodKey,
  getKolamPayrollSlipId,
  getKolamPayrollSurfaceMode,
  hasKolamPayrollPermission,
  type KolamPayrollPeriod,
  type KolamPayrollPeriodDetail,
  type KolamPayrollSlip,
} from '../domain/kolam-payroll';
import type { KolamWalletOption } from '../domain/kolam-wallet-option';
import { ApiError } from '../lib/api-error';
import {
  createKolamPayrollPeriod,
  fetchKolamPayrollPeriod,
  fetchKolamPayrollPeriods,
  fetchKolamPayrollSlip,
  finalizeKolamPayrollPeriod,
  generateAllKolamPayrollSlips,
  generateKolamPayrollSlip,
  refreshKolamPayrollPph21Ai,
  setKolamPayrollPeriodWallet,
} from '../services/kolam-payroll-api';
import { getKolamWalletOptionsPaginated } from '../services/kolam-wallet-option-api';

export interface KolamPayrollController {
  mode: ReturnType<typeof getKolamPayrollSurfaceMode>;
  periodKey: string | null;
  slipId: string | null;
  periods: KolamPayrollPeriod[];
  detail: KolamPayrollPeriodDetail | null;
  slip: KolamPayrollSlip | null;
  wallets: KolamWalletOption[];
  selectedWalletId: string;
  createYear: number;
  createMonth: number;
  search: string;
  loading: boolean;
  mutating: boolean;
  error: string;
  statusMessage: string;
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  filteredPeriods: KolamPayrollPeriod[];
  onSearchChange: (value: string) => void;
  onCreateYearChange: (year: number) => void;
  onCreateMonthChange: (month: number) => void;
  onSelectedWalletChange: (walletId: string) => void;
  onRefresh: () => Promise<void>;
  onCreatePeriod: () => Promise<void>;
  onSetWallet: () => Promise<void>;
  onGenerateAll: (withAi?: boolean) => Promise<void>;
  /** FE: generate-one always sends `withAi: true`. */
  onGenerateOne: (input: {
    userId: string;
    openSlip?: boolean;
  }) => Promise<void>;
  onFinalize: () => Promise<void>;
  onRefreshPph21Ai: () => Promise<void>;
}

export function useKolamPayrollController(
  route: string,
  onRouteChange?: (route: string) => void,
): KolamPayrollController {
  const { authUser } = useKolamAuthContext();
  const mode = getKolamPayrollSurfaceMode(route);
  const periodKey = getKolamPayrollPeriodKey(route);
  const slipId = getKolamPayrollSlipId(route);
  const now = new Date();

  const [periods, setPeriods] = useState<KolamPayrollPeriod[]>([]);
  const [detail, setDetail] = useState<KolamPayrollPeriodDetail | null>(null);
  const [slip, setSlip] = useState<KolamPayrollSlip | null>(null);
  const [wallets, setWallets] = useState<KolamWalletOption[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [createYear, setCreateYear] = useState(now.getFullYear());
  const [createMonth, setCreateMonth] = useState(now.getMonth() + 1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const permissions = authUser?.permissions;
  const roleKey = authUser?.roleKey;
  const canView = hasKolamPayrollPermission(permissions, 'view', roleKey);
  const canCreate = hasKolamPayrollPermission(permissions, 'create', roleKey);
  const canUpdate = hasKolamPayrollPermission(permissions, 'update', roleKey);

  const filteredPeriods = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return periods;
    }
    return periods.filter(row => row.periodKey.toLowerCase().includes(q));
  }, [periods, search]);

  const refresh = useCallback(async () => {
    if (!canView) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (mode === 'list') {
        const rows = await fetchKolamPayrollPeriods();
        setPeriods(rows);
        setDetail(null);
        setSlip(null);
      } else if (mode === 'detail' && periodKey) {
        const nextDetail = await fetchKolamPayrollPeriod(periodKey);
        setDetail(nextDetail);
        setSelectedWalletId(nextDetail?.period.walletId ?? '');
      } else if (mode === 'slip' && slipId) {
        const nextSlip = await fetchKolamPayrollSlip(slipId);
        setSlip(nextSlip);
      }
    } catch (err) {
      setError(formatError(err, 'Gagal memuat payroll'));
      if (mode === 'list') {
        setPeriods([]);
      }
      if (mode === 'detail') {
        setDetail(null);
      }
      if (mode === 'slip') {
        setSlip(null);
      }
    } finally {
      setLoading(false);
    }
  }, [canView, mode, periodKey, slipId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!canView || mode === 'slip') {
      return;
    }
    let cancelled = false;
    void getKolamWalletOptionsPaginated({ page: 1, limit: 100 })
      .then(result => {
        if (!cancelled) {
          setWallets(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setWallets([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [canView, mode]);

  const runMutation = useCallback(
    async (label: string, action: () => Promise<void>) => {
      setMutating(true);
      setError('');
      setStatusMessage('');
      try {
        await action();
        setStatusMessage(label);
        await refresh();
      } catch (err) {
        setError(formatError(err, 'Operasi gagal'));
      } finally {
        setMutating(false);
      }
    },
    [refresh],
  );

  const onCreatePeriod = useCallback(async () => {
    if (!canCreate) {
      return;
    }
    const key = buildPayrollPeriodKey(createYear, createMonth);
    if (!key) {
      setError('Tahun/bulan tidak valid');
      return;
    }
    await runMutation(`Periode ${key} dibuat`, async () => {
      const created = await createKolamPayrollPeriod({
        year: createYear,
        month: createMonth,
      });
      const nextKey = created?.periodKey || key;
      onRouteChange?.(buildKolamPayrollPeriodRoute(nextKey));
    });
  }, [canCreate, createMonth, createYear, onRouteChange, runMutation]);

  const onSetWallet = useCallback(async () => {
    if (!canUpdate || !periodKey || !selectedWalletId.trim()) {
      return;
    }
    await runMutation('Dompet periode diperbarui', async () => {
      await setKolamPayrollPeriodWallet({
        periodKey,
        walletId: selectedWalletId.trim(),
      });
    });
  }, [canUpdate, periodKey, runMutation, selectedWalletId]);

  const onGenerateAll = useCallback(
    async (withAi = false) => {
      if (!canUpdate || !periodKey) {
        return;
      }
      await runMutation('Slip digenerate', async () => {
        await generateAllKolamPayrollSlips({ periodKey, withAi });
      });
    },
    [canUpdate, periodKey, runMutation],
  );

  const onGenerateOne = useCallback(
    async (input: { userId: string; openSlip?: boolean }) => {
      if (!canUpdate || !periodKey) {
        return;
      }
      const userId = input.userId.trim();
      if (!userId) {
        setError('Karyawan tidak valid');
        return;
      }
      await runMutation(
        input.openSlip ? 'Slip dibuat' : 'Slip diperbarui',
        async () => {
          const created = await generateKolamPayrollSlip({
            periodKey,
            userId,
            withAi: true,
          });
          if (input.openSlip && created?.id) {
            onRouteChange?.(buildKolamPayrollSlipRoute(created.id));
          }
        },
      );
    },
    [canUpdate, onRouteChange, periodKey, runMutation],
  );

  const onFinalize = useCallback(async () => {
    if (!canUpdate || !periodKey) {
      return;
    }
    await runMutation('Periode difinalisasi', async () => {
      await finalizeKolamPayrollPeriod({
        periodKey,
        walletId: selectedWalletId.trim() || undefined,
      });
    });
  }, [canUpdate, periodKey, runMutation, selectedWalletId]);

  const onRefreshPph21Ai = useCallback(async () => {
    if (!slipId) {
      return;
    }
    await runMutation('Narasi PPh 21 AI diperbarui', async () => {
      const next = await refreshKolamPayrollPph21Ai(slipId);
      if (next) {
        setSlip(next);
      }
    });
  }, [runMutation, slipId]);

  return {
    mode,
    periodKey,
    slipId,
    periods,
    detail,
    slip,
    wallets,
    selectedWalletId,
    createYear,
    createMonth,
    search,
    loading,
    mutating,
    error,
    statusMessage,
    canView,
    canCreate,
    canUpdate,
    filteredPeriods,
    onSearchChange: setSearch,
    onCreateYearChange: setCreateYear,
    onCreateMonthChange: setCreateMonth,
    onSelectedWalletChange: setSelectedWalletId,
    onRefresh: refresh,
    onCreatePeriod,
    onSetWallet,
    onGenerateAll,
    onGenerateOne,
    onFinalize,
    onRefreshPph21Ai,
  };
}

function formatError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    return err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}
