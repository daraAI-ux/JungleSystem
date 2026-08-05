import { useCallback, useEffect, useMemo, useState } from 'react';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import {
  buildKolamRoutineExpenseCreatePayload,
  createEmptyKolamRoutineExpenseForm,
  getKolamFinanceExpenseRoot,
  getKolamRoutineExpenseSurfaceMode,
  hasKolamFinanceExpensePermission,
  validateKolamRoutineExpenseForm,
  type KolamRoutineExpenseFormState,
  type KolamRoutineExpenseSurfaceMode,
} from '../domain/kolam-finance-expense';
import type { KolamWallet } from '../domain/kolam-wallet';
import { ApiError } from '../lib/api-error';
import { createKolamRoutineExpense } from '../services/kolam-finance-expense-api';
import { fetchKolamWalletsAll } from '../services/kolam-wallet-api';

export interface KolamRoutineExpenseFormController {
  mode: Extract<KolamRoutineExpenseSurfaceMode, 'create'>;
  form: KolamRoutineExpenseFormState;
  wallets: KolamWallet[];
  loading: boolean;
  submitting: boolean;
  error: string;
  canSubmit: boolean;
  onChangeForm: (patch: Partial<KolamRoutineExpenseFormState>) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

export function useKolamRoutineExpenseFormController(
  route: string,
  onRouteChange?: (route: string) => void,
): KolamRoutineExpenseFormController | null {
  const { authUser } = useKolamAuthContext();
  const surfaceMode = getKolamRoutineExpenseSurfaceMode(route);
  const mode = surfaceMode === 'create' ? surfaceMode : null;

  const permissions = authUser?.permissions;
  const roleKey = authUser?.roleKey;
  const canCreate = hasKolamFinanceExpensePermission(
    permissions,
    'routine-expense',
    'create',
    roleKey,
  );

  const [form, setForm] = useState<KolamRoutineExpenseFormState>(() =>
    createEmptyKolamRoutineExpenseForm(),
  );
  const [wallets, setWallets] = useState<KolamWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!mode) {
      return;
    }
    if (!canCreate) {
      setLoading(false);
      setError('Akses ditolak');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    setForm(createEmptyKolamRoutineExpenseForm());
    void (async () => {
      try {
        const walletRows = await fetchKolamWalletsAll();
        if (!cancelled) {
          setWallets(walletRows);
        }
      } catch (err) {
        if (!cancelled) {
          setError(resolveErrorMessage(err, 'Gagal memuat data form'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canCreate, mode]);

  const onChangeForm = useCallback(
    (patch: Partial<KolamRoutineExpenseFormState>) => {
      setForm(current => ({ ...current, ...patch }));
      setError('');
    },
    [],
  );

  const onCancel = useCallback(() => {
    onRouteChange?.(getKolamFinanceExpenseRoot('routine-expense'));
  }, [onRouteChange]);

  const onSubmit = useCallback(async () => {
    if (!mode || !canCreate) {
      setError('Akses ditolak');
      return;
    }

    const validationError = validateKolamRoutineExpenseForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (form.walletId.trim()) {
      const selected = wallets.find(wallet => wallet.id === form.walletId);
      if (!selected) {
        setError('Dompet tidak ditemukan');
        return;
      }
    }

    setSubmitting(true);
    setError('');
    try {
      await createKolamRoutineExpense(
        buildKolamRoutineExpenseCreatePayload(form),
      );
      onRouteChange?.(getKolamFinanceExpenseRoot('routine-expense'));
    } catch (err) {
      setError(resolveErrorMessage(err, 'Gagal membuat pengeluaran rutin'));
    } finally {
      setSubmitting(false);
    }
  }, [canCreate, form, mode, onRouteChange, wallets]);

  const canSubmit = useMemo(() => {
    if (!mode || submitting || loading || !canCreate) {
      return false;
    }
    return validateKolamRoutineExpenseForm(form) == null;
  }, [canCreate, form, loading, mode, submitting]);

  if (!mode) {
    return null;
  }

  return {
    mode,
    form,
    wallets,
    loading,
    submitting,
    error,
    canSubmit,
    onChangeForm,
    onSubmit,
    onCancel,
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
