import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import {
  buildKolamAssetPurchaseCreatePayload,
  buildKolamAssetPurchaseUpdatePayload,
  createEmptyKolamAssetPurchaseForm,
  createKolamAssetPurchaseFormFromDetail,
  getKolamAssetPurchaseDetailRoute,
  getKolamAssetPurchaseIdFromRoute,
  getKolamAssetPurchaseSurfaceMode,
  getKolamFinanceExpenseRoot,
  hasKolamFinanceExpensePermission,
  validateKolamAssetPurchaseForm,
  type KolamAssetPurchaseCustomField,
  type KolamAssetPurchaseFormState,
  type KolamAssetPurchaseSurfaceMode,
} from '../domain/kolam-finance-expense';
import { ApiError } from '../lib/api-error';
import {
  createKolamAssetPurchase,
  deleteKolamAssetPurchasePhoto,
  fetchKolamAssetPurchaseById,
  updateKolamAssetPurchase,
  uploadKolamAssetPurchasePhotos,
} from '../services/kolam-finance-expense-api';
import {
  getKolamLocations,
  type KolamLocationOption,
} from '../services/kolam-location-api';
import { fetchKolamWalletsAll } from '../services/kolam-wallet-api';
import type { KolamWallet } from '../domain/kolam-wallet';

const ASSET_PURCHASE_PHOTO_MAX = 5;

export interface KolamAssetPurchaseFormController {
  mode: Extract<KolamAssetPurchaseSurfaceMode, 'create' | 'edit'>;
  form: KolamAssetPurchaseFormState;
  wallets: KolamWallet[];
  locations: KolamLocationOption[];
  loading: boolean;
  submitting: boolean;
  uploadingPhotos: boolean;
  error: string;
  canSubmit: boolean;
  onChangeForm: (patch: Partial<KolamAssetPurchaseFormState>) => void;
  onAddCustomField: () => void;
  onUpdateCustomField: (
    index: number,
    patch: Partial<KolamAssetPurchaseCustomField>,
  ) => void;
  onRemoveCustomField: (index: number) => void;
  onAddPhotos: (localUris: string[]) => Promise<void>;
  onRemovePhoto: (index: number) => Promise<void>;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

export function useKolamAssetPurchaseFormController(
  route: string,
  onRouteChange?: (route: string) => void,
): KolamAssetPurchaseFormController | null {
  const { authUser } = useKolamAuthContext();
  const surfaceMode = getKolamAssetPurchaseSurfaceMode(route);
  const mode =
    surfaceMode === 'create' || surfaceMode === 'edit' ? surfaceMode : null;
  const editId =
    mode === 'edit' ? getKolamAssetPurchaseIdFromRoute(route) : null;

  const permissions = authUser?.permissions;
  const roleKey = authUser?.roleKey;
  const canCreate = hasKolamFinanceExpensePermission(
    permissions,
    'asset-purchase',
    'create',
    roleKey,
  );
  const canUpdate = hasKolamFinanceExpensePermission(
    permissions,
    'asset-purchase',
    'update',
    roleKey,
  );

  const [form, setForm] = useState<KolamAssetPurchaseFormState>(() =>
    createEmptyKolamAssetPurchaseForm(),
  );
  const [wallets, setWallets] = useState<KolamWallet[]>([]);
  const [locations, setLocations] = useState<KolamLocationOption[]>([]);
  const [loading, setLoading] = useState(mode === 'edit');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [error, setError] = useState('');
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!mode) {
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const [walletRows, locationRows] = await Promise.all([
          fetchKolamWalletsAll(),
          getKolamLocations(),
        ]);
        if (cancelled) {
          return;
        }
        setWallets(walletRows);
        setLocations(locationRows);
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
        setForm(createEmptyKolamAssetPurchaseForm());
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
        const detail = await fetchKolamAssetPurchaseById(editId);
        if (requestIdRef.current !== requestId) {
          return;
        }
        setForm(createKolamAssetPurchaseFormFromDetail(detail));
      } catch (err) {
        if (requestIdRef.current !== requestId) {
          return;
        }
        setError(resolveErrorMessage(err, 'Gagal memuat pembelian aset'));
      } finally {
        if (requestIdRef.current === requestId) {
          setLoading(false);
        }
      }
    })();
  }, [canUpdate, editId, mode]);

  const onChangeForm = useCallback(
    (patch: Partial<KolamAssetPurchaseFormState>) => {
      setForm(current => ({ ...current, ...patch }));
      setError('');
    },
    [],
  );

  const onAddCustomField = useCallback(() => {
    setForm(current => ({
      ...current,
      customFieldValues: [
        ...current.customFieldValues,
        { label: '', value: '' },
      ],
    }));
  }, []);

  const onUpdateCustomField = useCallback(
    (index: number, patch: Partial<KolamAssetPurchaseCustomField>) => {
      setForm(current => ({
        ...current,
        customFieldValues: current.customFieldValues.map((field, fieldIndex) =>
          fieldIndex === index ? { ...field, ...patch } : field,
        ),
      }));
    },
    [],
  );

  const onRemoveCustomField = useCallback((index: number) => {
    setForm(current => ({
      ...current,
      customFieldValues: current.customFieldValues.filter(
        (_, fieldIndex) => fieldIndex !== index,
      ),
    }));
  }, []);

  const onAddPhotos = useCallback(
    async (localUris: string[]) => {
      if (!mode || localUris.length === 0) {
        return;
      }
      const remaining = ASSET_PURCHASE_PHOTO_MAX - form.photos.length;
      if (remaining <= 0) {
        setError(`Maksimal ${ASSET_PURCHASE_PHOTO_MAX} foto`);
        return;
      }
      const toUpload = localUris.slice(0, remaining);
      setUploadingPhotos(true);
      setError('');
      try {
        const paths = await uploadKolamAssetPurchasePhotos(toUpload);
        setForm(current => ({
          ...current,
          photos: [...current.photos, ...paths].slice(
            0,
            ASSET_PURCHASE_PHOTO_MAX,
          ),
        }));
      } catch (err) {
        setError(resolveErrorMessage(err, 'Gagal unggah foto'));
      } finally {
        setUploadingPhotos(false);
      }
    },
    [form.photos.length, mode],
  );

  const onRemovePhoto = useCallback(async (index: number) => {
    let removedPath = '';
    setForm(current => {
      removedPath = current.photos[index] ?? '';
      return {
        ...current,
        photos: current.photos.filter((_, photoIndex) => photoIndex !== index),
      };
    });
    if (
      removedPath &&
      !removedPath.startsWith('http://') &&
      !removedPath.startsWith('https://')
    ) {
      try {
        await deleteKolamAssetPurchasePhoto(removedPath);
      } catch {
        // Silent — UI already updated (FE parity).
      }
    }
  }, []);

  const onCancel = useCallback(() => {
    onRouteChange?.(getKolamFinanceExpenseRoot('asset-purchase'));
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

    const validationError = validateKolamAssetPurchaseForm(form, mode);
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
        const saved = await createKolamAssetPurchase(
          buildKolamAssetPurchaseCreatePayload(form),
        );
        onRouteChange?.(getKolamAssetPurchaseDetailRoute(saved.id));
        return;
      }
      if (!editId) {
        setError('ID pembelian aset tidak valid');
        return;
      }
      const saved = await updateKolamAssetPurchase(
        editId,
        buildKolamAssetPurchaseUpdatePayload(form),
      );
      onRouteChange?.(getKolamAssetPurchaseDetailRoute(saved.id));
    } catch (err) {
      setError(
        resolveErrorMessage(
          err,
          mode === 'create'
            ? 'Gagal membuat pembelian aset'
            : 'Gagal memperbarui pembelian aset',
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
    if (!mode || submitting || loading || uploadingPhotos) {
      return false;
    }
    if (mode === 'create' && !canCreate) {
      return false;
    }
    if (mode === 'edit' && !canUpdate) {
      return false;
    }
    return validateKolamAssetPurchaseForm(form, mode) == null;
  }, [
    canCreate,
    canUpdate,
    form,
    loading,
    mode,
    submitting,
    uploadingPhotos,
  ]);

  if (!mode) {
    return null;
  }

  if (mode === 'create' && !canCreate) {
    return {
      mode,
      form,
      wallets,
      locations,
      loading: false,
      submitting: false,
      uploadingPhotos: false,
      error: 'Akses ditolak',
      canSubmit: false,
      onChangeForm,
      onAddCustomField,
      onUpdateCustomField,
      onRemoveCustomField,
      onAddPhotos,
      onRemovePhoto,
      onSubmit,
      onCancel,
    };
  }

  return {
    mode,
    form,
    wallets,
    locations,
    loading,
    submitting,
    uploadingPhotos,
    error,
    canSubmit,
    onChangeForm,
    onAddCustomField,
    onUpdateCustomField,
    onRemoveCustomField,
    onAddPhotos,
    onRemovePhoto,
    onSubmit,
    onCancel,
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
