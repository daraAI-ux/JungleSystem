import { useCallback, useEffect, useMemo, useState } from 'react';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import {
  buildKolamPayableCreatePayload,
  createEmptyKolamPayableForm,
  KOLAM_PAYABLE_ROOT,
  getKolamPayableSurfaceMode,
  hasKolamPayablePermission,
  validateKolamPayableForm,
  type KolamPayableFormState,
} from '../domain/kolam-payable';
import type { KolamWallet } from '../domain/kolam-wallet';
import { ApiError } from '../lib/api-error';
import { createKolamPayable } from '../services/kolam-payable-api';
import { fetchKolamWalletsAll } from '../services/kolam-wallet-api';

export interface KolamPayableFormController {
  form: KolamPayableFormState;
  wallets: KolamWallet[];
  loading: boolean;
  submitting: boolean;
  error: string;
  canSubmit: boolean;
  onChangeForm: (patch: Partial<KolamPayableFormState>) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

export function useKolamPayableFormController(
  route: string,
  onRouteChange?: (route: string) => void,
): KolamPayableFormController | null {
  const { authUser } = useKolamAuthContext();
  const mode = getKolamPayableSurfaceMode(route);
  const canCreate = hasKolamPayablePermission(
    authUser?.permissions,
    'create',
    authUser?.roleKey,
  );

  const [form, setForm] = useState<KolamPayableFormState>(() =>
    createEmptyKolamPayableForm(),
  );
  const [wallets, setWallets] = useState<KolamWallet[]>([]);
  const [loading, setLoading] = useState(mode === 'create');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode !== 'create') {
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    setForm(createEmptyKolamPayableForm());
    const loadWallets = async () => {
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
    };
    loadWallets().catch(err => {
      if (!cancelled) {
        setError(resolveErrorMessage(err, 'Gagal memuat data form'));
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [mode]);

  const onChangeForm = useCallback((patch: Partial<KolamPayableFormState>) => {
    setForm(current => ({ ...current, ...patch }));
    setError('');
  }, []);

  const onCancel = useCallback(() => {
    onRouteChange?.(KOLAM_PAYABLE_ROOT);
  }, [onRouteChange]);

  const onSubmit = useCallback(async () => {
    if (mode !== 'create') {
      return;
    }
    if (!canCreate) {
      setError('Akses ditolak');
      return;
    }
    const validationError = validateKolamPayableForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    const selectedWallet = wallets.find(wallet => wallet.id === form.walletId);
    if (!selectedWallet) {
      setError('Wallet tidak ditemukan');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await createKolamPayable(buildKolamPayableCreatePayload(form));
      onRouteChange?.(KOLAM_PAYABLE_ROOT);
    } catch (err) {
      setError(resolveErrorMessage(err, 'Gagal menyimpan hutang'));
    } finally {
      setSubmitting(false);
    }
  }, [canCreate, form, mode, onRouteChange, wallets]);

  const canSubmit = useMemo(() => {
    if (mode !== 'create' || submitting || loading || !canCreate) {
      return false;
    }
    if (validateKolamPayableForm(form) != null) {
      return false;
    }
    return wallets.some(wallet => wallet.id === form.walletId);
  }, [canCreate, form, loading, mode, submitting, wallets]);

  if (mode !== 'create') {
    return null;
  }

  return {
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
