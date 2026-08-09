/**
 * DARA Pricing equipment bulk tools (Peralatan).
 * SoT: FE bulk-pricing-tools-panel + `/dara-pricing/equipment/*`.
 */

import { formatRupiah } from '../lib/money';

export type KolamDaraPricingEquipmentOperation =
  | 'kolam'
  | 'marketplace_db'
  | 'push_olshop';

export type KolamDaraPricingMarkupType = 'percent' | 'fixed';

export type KolamDaraPricingMarketplaceMode =
  | 'markup_online'
  | 'webstore_below_market'
  | 'sync_equal';

export const KOLAM_DARA_PRICING_MARKETPLACE_MODE_OPTIONS: Array<{
  value: KolamDaraPricingMarketplaceMode;
  label: string;
  hint: string;
}> = [
  {
    value: 'markup_online',
    label: 'Markup dari harga olshop (onlinePrice)',
    hint: 'Basis onlinePrice + markup → perbarui onlinePrice (Tokopedia/Shopee di DB). marketPrice (harga pasar) tidak disentuh.',
  },
  {
    value: 'webstore_below_market',
    label: 'Webstore di bawah harga olshop',
    hint: 'Basis onlinePrice (olshop) — markup = jarak di bawah. Hanya ubah price_to_sell (webstore).',
  },
  {
    value: 'sync_equal',
    label: 'Samakan webstore & olshop',
    hint: 'price_to_sell = onlinePrice — prioritas ikut onlinePrice (olshop) jika ada.',
  },
];

export type KolamDaraPricingEquipmentRow = {
  entityType: string;
  entityId: string;
  variantId: string;
  sku: string;
  name: string;
  onlinePrice: number;
  baseCost: number;
  oldPrice: number;
  newPrice: number;
  vendorName: string;
  poCode: string;
  source: string;
  skip: boolean;
  skipReason: string;
  markupType: KolamDaraPricingMarkupType | string;
  markupValue: number;
};

export type KolamDaraPricingEquipmentPreview = {
  operation: string;
  marketplaceMode: string;
  total: number;
  applicable: number;
  skipped: number;
  rows: KolamDaraPricingEquipmentRow[];
};

export type KolamDaraPricingEquipmentLogLine = {
  ts: string;
  level: string;
  message: string;
};

export type KolamDaraPricingEquipmentJobPoll = {
  id: string;
  status: string;
  progressCurrent: number;
  progressTotal: number;
  progressMessage: string;
  error: string;
  logs: KolamDaraPricingEquipmentLogLine[];
};

export function formatKolamDaraPricingEquipmentIdr(value?: number | null) {
  if (value == null || !Number.isFinite(value) || value <= 0) {
    return '—';
  }
  return formatRupiah(value);
}

export function buildKolamDaraPricingEquipmentConsoleLines(
  job: KolamDaraPricingEquipmentJobPoll | null,
): string[] {
  const lines: string[] = [];
  if (job?.progressMessage) {
    lines.push(`[progress] ${job.progressMessage}`);
  }
  for (const log of job?.logs ?? []) {
    lines.push(`[${log.level}] ${log.message}`);
  }
  return lines;
}

export function getKolamDaraPricingEquipmentProgressPercent(
  job: KolamDaraPricingEquipmentJobPoll | null,
) {
  if (!job || job.progressTotal <= 0) {
    return 0;
  }
  return Math.min(
    100,
    Math.max(0, Math.round((job.progressCurrent / job.progressTotal) * 100)),
  );
}

export function isKolamDaraPricingEquipmentJobActive(status: string) {
  return status === 'queued' || status === 'running';
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function unwrapData(payload: unknown): unknown {
  const root = asRecord(payload);
  if ('data' in root) {
    return root.data;
  }
  return payload;
}

function toFiniteNumber(value: unknown) {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function normalizeKolamDaraPricingEquipmentPreview(
  payload: unknown,
): KolamDaraPricingEquipmentPreview {
  const data = asRecord(unwrapData(payload));
  const rowsRaw = Array.isArray(data.rows) ? data.rows : [];
  return {
    operation: String(data.operation || '').trim(),
    marketplaceMode: String(data.marketplaceMode || '').trim(),
    total: toFiniteNumber(data.total),
    applicable: toFiniteNumber(data.applicable),
    skipped: toFiniteNumber(data.skipped),
    rows: rowsRaw.map(item => {
      const row = asRecord(item);
      return {
        entityType: String(row.entityType || '').trim(),
        entityId: String(row.entityId || row._id || '').trim(),
        variantId: String(row.variantId || '').trim(),
        sku: String(row.sku || '').trim(),
        name: String(row.name || '').trim(),
        onlinePrice: toFiniteNumber(row.onlinePrice),
        baseCost: toFiniteNumber(row.baseCost),
        oldPrice: toFiniteNumber(row.oldPrice),
        newPrice: toFiniteNumber(row.newPrice),
        vendorName: String(row.vendorName || '').trim(),
        poCode: String(row.poCode || '').trim(),
        source: String(row.source || '').trim(),
        skip: row.skip === true,
        skipReason: String(row.skipReason || '').trim(),
        markupType: String(row.markupType || 'percent').trim() || 'percent',
        markupValue: toFiniteNumber(row.markupValue),
      };
    }),
  };
}

export function normalizeKolamDaraPricingEquipmentStartResult(
  payload: unknown,
): {jobId: string} {
  const data = asRecord(unwrapData(payload));
  const jobId =
    typeof data.jobId === 'string'
      ? data.jobId
      : typeof data.id === 'string'
        ? data.id
        : typeof asRecord(data.job)._id === 'string'
          ? String(asRecord(data.job)._id)
          : typeof asRecord(data.job).id === 'string'
            ? String(asRecord(data.job).id)
            : '';
  return {jobId};
}

export function normalizeKolamDaraPricingEquipmentJobPoll(
  payload: unknown,
): KolamDaraPricingEquipmentJobPoll | null {
  const data = asRecord(unwrapData(payload));
  const id = String(data._id || data.id || '').trim();
  if (!id) {
    return null;
  }
  const progress = asRecord(data.progress);
  const result = asRecord(data.result);
  const logsRaw = Array.isArray(result.logs) ? result.logs : [];
  return {
    id,
    status: String(data.status || '').trim(),
    progressCurrent: toFiniteNumber(progress.current),
    progressTotal: toFiniteNumber(progress.total),
    progressMessage:
      typeof progress.message === 'string' ? progress.message.trim() : '',
    error: String(data.error || '').trim(),
    logs: logsRaw.map(item => {
      const row = asRecord(item);
      return {
        ts: String(row.ts || '').trim(),
        level: String(row.level || 'info').trim() || 'info',
        message: String(row.message || '').trim(),
      };
    }),
  };
}
