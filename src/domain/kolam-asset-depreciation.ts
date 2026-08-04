/**
 * Asset depreciation for Pembelian Aset Penyusutan tab.
 * SoT: FE depreciation-tab.tsx + BE /api/assets + utils/assets/depreciation.js
 */

export type KolamDepreciationMethod = 'straight-line' | 'declining-balance';

export type KolamAssetDepreciationFormState = {
  salvageValueText: string;
  usefulLifeText: string;
  depreciationMethod: KolamDepreciationMethod;
  depreciationRateText: string;
};

export type KolamAssetCreateFromPurchasePayload = {
  name: string;
  photo?: string;
  series?: string;
  assetPurchase: string;
  purchasePrice: number;
  salvageValue: number;
  usefulLife: number;
  depreciationPeriod: 'monthly';
  depreciationMethod: KolamDepreciationMethod;
  depreciationRate: number | null;
  purchaseDate: string;
  customFieldValues: Array<{ label: string; value: string }>;
};

export type KolamDepreciationSummary = {
  currentBookValue: number;
  accumulated: number;
  progressPercent: number;
  isFullyDepreciated: boolean;
  completedPeriods: number;
  depreciationPerPeriod: number | null;
  annualRatePercent: number | null;
};

export type KolamDepreciationScheduleRow = {
  period: number;
  depreciation: number;
  bookValue: number;
  accumulated: number;
  isDone: boolean;
};

export type KolamAssetDepreciationDetail = {
  id: string;
  code: string;
  name: string;
  purchasePrice: number;
  salvageValue: number;
  usefulLife: number;
  depreciationMethod: KolamDepreciationMethod;
  depreciationRate: number | null;
  purchaseDate: string;
  depreciation: KolamDepreciationSummary | null;
  schedule: KolamDepreciationScheduleRow[];
};

export const KOLAM_DEPRECIATION_METHOD_OPTIONS: Array<{
  id: KolamDepreciationMethod;
  name: string;
  desc: string;
}> = [
  {
    id: 'straight-line',
    name: 'Garis Lurus',
    desc: 'Penyusutan tetap setiap bulan',
  },
  {
    id: 'declining-balance',
    name: 'Saldo Menurun',
    desc: 'Lebih tinggi di awal, menurun seiring waktu',
  },
];

export function createEmptyKolamAssetDepreciationForm(): KolamAssetDepreciationFormState {
  return {
    salvageValueText: '0',
    usefulLifeText: '12',
    depreciationMethod: 'straight-line',
    depreciationRateText: '',
  };
}

export function parseDepreciationNumberText(value: string): number {
  const digits = String(value || '').replace(/[^\d]/g, '');
  if (!digits) {
    return 0;
  }
  return Number(digits) || 0;
}

export function formatDepreciationMethodLabel(
  method: KolamDepreciationMethod | string | null | undefined,
): string {
  if (method === 'declining-balance') {
    return 'Saldo Menurun';
  }
  return 'Garis Lurus';
}

export function getStraightLineMonthlyPreview(
  purchasePrice: number,
  salvageValue: number,
  usefulLife: number,
): number | null {
  const depreciable = purchasePrice - salvageValue;
  if (usefulLife > 0 && depreciable > 0) {
    return depreciable / usefulLife;
  }
  return null;
}

export function getDecliningBalanceMonth1Preview(
  purchasePrice: number,
  annualRatePercent: number | null,
): number | null {
  if (
    annualRatePercent != null &&
    annualRatePercent > 0 &&
    purchasePrice > 0
  ) {
    return (purchasePrice * (annualRatePercent / 100)) / 12;
  }
  return null;
}

export function validateKolamAssetDepreciationForm(
  form: KolamAssetDepreciationFormState,
  purchasePrice: number,
): string | null {
  const usefulLife = parseDepreciationNumberText(form.usefulLifeText);
  const salvageValue = parseDepreciationNumberText(form.salvageValueText);
  const rate = parseDepreciationNumberText(form.depreciationRateText);

  if (usefulLife <= 0) {
    return 'Masa manfaat harus lebih dari 0';
  }
  if (salvageValue >= purchasePrice) {
    return 'Nilai residu tidak boleh melebihi harga beli';
  }
  if (
    form.depreciationMethod === 'declining-balance' &&
    salvageValue === 0 &&
    !rate
  ) {
    return 'Tingkat penyusutan wajib diisi jika nilai residu 0';
  }
  return null;
}

export function buildKolamAssetCreateFromPurchasePayload(params: {
  purchaseId: string;
  name: string;
  photos: string[];
  series: string;
  purchasePrice: number;
  executedAt: string;
  customFieldValues: Array<{ label: string; value: string }>;
  form: KolamAssetDepreciationFormState;
}): KolamAssetCreateFromPurchasePayload {
  const salvageValue = parseDepreciationNumberText(params.form.salvageValueText);
  const usefulLife = parseDepreciationNumberText(params.form.usefulLifeText);
  const rate = parseDepreciationNumberText(params.form.depreciationRateText);
  const purchaseDate = toPurchaseDateIso(params.executedAt);

  return {
    name: params.name,
    photo: params.photos[0] || undefined,
    series: params.series.trim() || undefined,
    assetPurchase: params.purchaseId,
    purchasePrice: params.purchasePrice,
    salvageValue,
    usefulLife,
    depreciationPeriod: 'monthly',
    depreciationMethod: params.form.depreciationMethod,
    depreciationRate:
      params.form.depreciationMethod === 'declining-balance'
        ? rate || null
        : null,
    purchaseDate,
    customFieldValues: params.customFieldValues.filter(field =>
      field.label.trim(),
    ),
  };
}

export function normalizeKolamAssetDepreciationDetail(
  payload: unknown,
): KolamAssetDepreciationDetail {
  const root = asRecord(payload);
  const record =
    root.data && typeof root.data === 'object'
      ? asRecord(root.data)
      : root;
  const methodRaw = String(record.depreciationMethod || 'straight-line');
  const depreciationMethod: KolamDepreciationMethod =
    methodRaw === 'declining-balance' ? 'declining-balance' : 'straight-line';

  const depRecord = asRecord(record.depreciation);
  const hasDep =
    record.depreciation != null && typeof record.depreciation === 'object';
  const completedPeriods = hasDep
    ? Math.max(0, Number(depRecord.completedPeriods || 0) || 0)
    : 0;

  const scheduleRaw = Array.isArray(record.depreciationSchedule)
    ? record.depreciationSchedule
    : [];

  return {
    id: getString(record, '_id') || getString(record, 'id'),
    code: getString(record, 'code'),
    name: getString(record, 'name'),
    purchasePrice: Number(record.purchasePrice || 0) || 0,
    salvageValue: Number(record.salvageValue || 0) || 0,
    usefulLife: Number(record.usefulLife || 0) || 0,
    depreciationMethod,
    depreciationRate:
      record.depreciationRate == null || record.depreciationRate === ''
        ? null
        : Number(record.depreciationRate) || 0,
    purchaseDate: getString(record, 'purchaseDate'),
    depreciation: hasDep
      ? {
          currentBookValue: Number(depRecord.currentBookValue || 0) || 0,
          accumulated: Number(depRecord.accumulated || 0) || 0,
          progressPercent: Number(depRecord.progressPercent || 0) || 0,
          isFullyDepreciated: Boolean(depRecord.isFullyDepreciated),
          completedPeriods,
          depreciationPerPeriod:
            depRecord.depreciationPerPeriod == null
              ? null
              : Number(depRecord.depreciationPerPeriod) || 0,
          annualRatePercent:
            depRecord.annualRatePercent == null
              ? null
              : Number(depRecord.annualRatePercent) || 0,
        }
      : null,
    schedule: scheduleRaw.map(row => {
      const item = asRecord(row);
      const period = Math.max(0, Number(item.period || 0) || 0);
      return {
        period,
        depreciation: Number(item.depreciation || 0) || 0,
        bookValue: Number(item.bookValue || 0) || 0,
        accumulated: Number(item.accumulated || 0) || 0,
        isDone: period > 0 && period <= completedPeriods,
      };
    }),
  };
}

function toPurchaseDateIso(value: string): string {
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toISOString();
  }
  return new Date().toISOString();
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

function getString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (value == null) {
    return '';
  }
  return String(value).trim();
}
