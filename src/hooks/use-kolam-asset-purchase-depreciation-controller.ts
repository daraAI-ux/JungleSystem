import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildKolamAssetCreateFromPurchasePayload,
  createEmptyKolamAssetDepreciationForm,
  getDecliningBalanceMonth1Preview,
  getStraightLineMonthlyPreview,
  parseDepreciationNumberText,
  validateKolamAssetDepreciationForm,
  type KolamAssetDepreciationDetail,
  type KolamAssetDepreciationFormState,
  type KolamDepreciationMethod,
} from '../domain/kolam-asset-depreciation';
import type { KolamAssetPurchaseDetail } from '../domain/kolam-finance-expense';
import { ApiError } from '../lib/api-error';
import {
  createKolamAssetFromPurchase,
  fetchKolamAssetById,
} from '../services/kolam-asset-api';

export type KolamAssetPurchaseDepreciationMode =
  | 'unverified'
  | 'form'
  | 'view';

export interface KolamAssetPurchaseDepreciationController {
  mode: KolamAssetPurchaseDepreciationMode;
  form: KolamAssetDepreciationFormState;
  asset: KolamAssetDepreciationDetail | null;
  purchasePrice: number;
  salvageValue: number;
  usefulLife: number;
  depreciationRate: number | null;
  previewStraightLine: number | null;
  previewDeclining: number | null;
  loadingAsset: boolean;
  submitting: boolean;
  error: string;
  statusMessage: string;
  onChangeForm: (patch: Partial<KolamAssetDepreciationFormState>) => void;
  onSelectMethod: (method: KolamDepreciationMethod) => void;
  onSubmit: () => Promise<void>;
}

export function useKolamAssetPurchaseDepreciationController(
  purchase: KolamAssetPurchaseDetail,
  onPurchaseRefresh: () => Promise<void>,
): KolamAssetPurchaseDepreciationController {
  const mode: KolamAssetPurchaseDepreciationMode = purchase.linkedAssetId
    ? 'view'
    : purchase.status === 'verified'
      ? 'form'
      : 'unverified';

  const [form, setForm] = useState<KolamAssetDepreciationFormState>(() =>
    createEmptyKolamAssetDepreciationForm(),
  );
  const [asset, setAsset] = useState<KolamAssetDepreciationDetail | null>(null);
  const [loadingAsset, setLoadingAsset] = useState(mode === 'view');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (mode !== 'view' || !purchase.linkedAssetId) {
      setAsset(null);
      setLoadingAsset(false);
      return;
    }
    const requestId = ++requestIdRef.current;
    setLoadingAsset(true);
    setError('');
    void (async () => {
      try {
        const next = await fetchKolamAssetById(purchase.linkedAssetId);
        if (requestIdRef.current !== requestId) {
          return;
        }
        setAsset(next);
      } catch (err) {
        if (requestIdRef.current !== requestId) {
          return;
        }
        setAsset(null);
        setError(resolveErrorMessage(err, 'Gagal memuat data aset.'));
      } finally {
        if (requestIdRef.current === requestId) {
          setLoadingAsset(false);
        }
      }
    })();
  }, [mode, purchase.linkedAssetId]);

  const purchasePrice = purchase.total;
  const salvageValue = parseDepreciationNumberText(form.salvageValueText);
  const usefulLife = parseDepreciationNumberText(form.usefulLifeText);
  const depreciationRateRaw = parseDepreciationNumberText(
    form.depreciationRateText,
  );
  const depreciationRate =
    form.depreciationRateText.trim() === '' ? null : depreciationRateRaw;

  const previewStraightLine = useMemo(
    () =>
      form.depreciationMethod === 'straight-line'
        ? getStraightLineMonthlyPreview(
            purchasePrice,
            salvageValue,
            usefulLife,
          )
        : null,
    [form.depreciationMethod, purchasePrice, salvageValue, usefulLife],
  );

  const previewDeclining = useMemo(
    () =>
      form.depreciationMethod === 'declining-balance'
        ? getDecliningBalanceMonth1Preview(purchasePrice, depreciationRate)
        : null,
    [depreciationRate, form.depreciationMethod, purchasePrice],
  );

  const onChangeForm = useCallback(
    (patch: Partial<KolamAssetDepreciationFormState>) => {
      setForm(current => ({ ...current, ...patch }));
      setError('');
      setStatusMessage('');
    },
    [],
  );

  const onSelectMethod = useCallback((method: KolamDepreciationMethod) => {
    setForm(current => ({
      ...current,
      depreciationMethod: method,
      depreciationRateText:
        method === 'straight-line' ? '' : current.depreciationRateText,
    }));
    setError('');
  }, []);

  const onSubmit = useCallback(async () => {
    if (mode !== 'form') {
      return;
    }
    const validationError = validateKolamAssetDepreciationForm(
      form,
      purchasePrice,
    );
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');
    setStatusMessage('');
    try {
      await createKolamAssetFromPurchase(
        buildKolamAssetCreateFromPurchasePayload({
          purchaseId: purchase.id,
          name: purchase.name,
          photos: purchase.photos,
          series: purchase.series,
          purchasePrice,
          executedAt: purchase.executedAt,
          customFieldValues: purchase.customFieldValues,
          form,
        }),
      );
      setStatusMessage('Data penyusutan berhasil disimpan');
      await onPurchaseRefresh();
    } catch (err) {
      setError(resolveErrorMessage(err, 'Gagal menyimpan data penyusutan'));
    } finally {
      setSubmitting(false);
    }
  }, [form, mode, onPurchaseRefresh, purchase, purchasePrice]);

  return {
    mode,
    form,
    asset,
    purchasePrice,
    salvageValue,
    usefulLife,
    depreciationRate,
    previewStraightLine,
    previewDeclining,
    loadingAsset,
    submitting,
    error,
    statusMessage,
    onChangeForm,
    onSelectMethod,
    onSubmit,
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
