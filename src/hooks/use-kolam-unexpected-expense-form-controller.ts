import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import {
  buildKolamUnexpectedExpenseCreatePayload,
  buildKolamUnexpectedExpenseUpdatePayload,
  createEmptyKolamUnexpectedExpenseForm,
  createKolamUnexpectedExpenseFormFromDetail,
  getKolamFinanceExpenseRoot,
  getKolamUnexpectedExpenseDetailRoute,
  getKolamUnexpectedExpenseIdFromRoute,
  getKolamUnexpectedExpenseSurfaceMode,
  hasKolamFinanceExpensePermission,
  validateKolamUnexpectedExpenseForm,
  type KolamUnexpectedExpenseFormState,
  type KolamUnexpectedExpenseSurfaceMode,
} from '../domain/kolam-finance-expense';
import type { KolamWallet } from '../domain/kolam-wallet';
import { ApiError } from '../lib/api-error';
import {
  createKolamUnexpectedExpense,
  fetchKolamUnexpectedExpenseById,
  updateKolamUnexpectedExpense,
} from '../services/kolam-finance-expense-api';
import { fetchKolamWalletsAll } from '../services/kolam-wallet-api';

export interface KolamUnexpectedExpenseFormController {
  mode: Extract<KolamUnexpectedExpenseSurfaceMode, 'create' | 'edit'>;
  form: KolamUnexpectedExpenseFormState;
  wallets: KolamWallet[];
  loading: boolean;
  submitting: boolean;
  error: string;
  canSubmit: boolean;
  onChangeForm: (patch: Partial<KolamUnexpectedExpenseFormState>) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

export function useKolamUnexpectedExpenseFormController(
  route: string,
  onRouteChange?: (route: string) => void,
): KolamUnexpectedExpenseFormController | null {
  const { authUser } = useKolamAuthContext();
  const surfaceMode = getKolamUnexpectedExpenseSurfaceMode(route);
  const mode =
    surfaceMode === 'create' || surfaceMode === 'edit' ? surfaceMode : null;
  const editId =
    mode === 'edit' ? getKolamUnexpectedExpenseIdFromRoute(route) : null;

  const permissions = authUser?.permissions;
  const roleKey = authUser?.roleKey;
  const canCreate = hasKolamFinanceExpensePermission(
    permissions,
    'unexpected-expense',
    'create',
    roleKey,
  );
  const canUpdate = hasKolamFinanceExpensePermission(
    permissions,
    'unexpected-expense',
    'update',
    roleKey,
  );

  const [form, setForm] = useState<KolamUnexpectedExpenseFormState>(() =>
    createEmptyKolamUnexpectedExpenseForm(),
  );
  const [wallets, setWallets] = useState<KolamWallet[]>([]);
  const [loading, setLoading] = useState(mode === 'edit');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!mode) {
      return;
    }
    let cancelled = false;
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
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode]);

  useEffect(() => {
    if (mode !== 'edit' || !editId) {
      if (mode === 'create') {
        setForm(createEmptyKolamUnexpectedExpenseForm());
        setLoading(false);
        setError('');
      }
      return;
    }
    if (!canUpdate) {
      setLoading(false);
      setError('Akses ditolak');
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError('');
    void (async () => {
      try {
        const detail = await fetchKolamUnexpectedExpenseById(editId);
        if (requestIdRef.current !== requestId) {
          return;
        }
        setForm(createKolamUnexpectedExpenseFormFromDetail(detail));
      } catch (err) {
        if (requestIdRef.current !== requestId) {
          return;
        }
        setError(resolveErrorMessage(err, 'Gagal memuat Pengeluaran'));
      } finally {
        if (requestIdRef.current === requestId) {
          setLoading(false);
        }
      }
    })();
  }, [canUpdate, editId, mode]);

  const onChangeForm = useCallback(
    (patch: Partial<KolamUnexpectedExpenseFormState>) => {
      setForm(current => ({ ...current, ...patch }));
      setError('');
    },
    [],
  );

  const onCancel = useCallback(() => {
    onRouteChange?.(getKolamFinanceExpenseRoot('unexpected-expense'));
  }, [onRouteChange]);

  const onSubmit = useCallback(async () => {
    if (!mode) {
      return;
    }
    if (mode === 'create' && !canCreate) {
      setError('Akses ditolak');
      return;
    }
    if (mode === 'edit' && !canUpdate) {
      setError('Akses ditolak');
      return;
    }

    const validationError = validateKolamUnexpectedExpenseForm(form);
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
      if (mode === 'create') {
        const saved = await createKolamUnexpectedExpense(
          buildKolamUnexpectedExpenseCreatePayload(form),
        );
        onRouteChange?.(getKolamUnexpectedExpenseDetailRoute(saved.id));
        return;
      }
      if (!editId) {
        setError('ID Pengeluaran tidak valid');
        return;
      }
      const saved = await updateKolamUnexpectedExpense(
        editId,
        buildKolamUnexpectedExpenseUpdatePayload(form),
      );
      onRouteChange?.(getKolamUnexpectedExpenseDetailRoute(saved.id));
    } catch (err) {
      setError(
        resolveErrorMessage(
          err,
          mode === 'create'
            ? 'Gagal membuat Pengeluaran'
            : 'Gagal memperbarui Pengeluaran',
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    canCreate,
    canUpdate,
    editId,
    form,
    mode,
    onRouteChange,
    wallets,
  ]);

  const canSubmit = useMemo(() => {
    if (!mode || submitting || loading) {
      return false;
    }
    if (mode === 'create' && !canCreate) {
      return false;
    }
    if (mode === 'edit' && !canUpdate) {
      return false;
    }
    return validateKolamUnexpectedExpenseForm(form) == null;
  }, [canCreate, canUpdate, form, loading, mode, submitting]);

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
