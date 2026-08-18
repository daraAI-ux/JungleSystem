export type WysiwygIntervalUnit = 'day' | 'week' | 'month';
export type WysiwygPriceMode = 'fixed' | 'percent';
export type WysiwygStatus = 'idle' | 'due' | 'skipped';

export interface WysiwygUnitConfig {
  enabled?: boolean;
  useDefaults?: boolean;
  intervalValue?: number;
  intervalUnit?: WysiwygIntervalUnit;
  priceMode?: WysiwygPriceMode;
  priceAmount?: number;
  priceCap?: number;
  paused?: boolean;
  startsAt?: string | null;
  nextDueAt?: string | null;
  status?: WysiwygStatus;
  lastPhotoAt?: string | null;
  lastPriceAt?: string | null;
  lastSkipAt?: string | null;
  lastNotifiedAt?: string | null;
}

export interface WysiwygSettings {
  enabled?: boolean;
  notifyEnabled?: boolean;
  intervalValue?: number;
  intervalUnit?: WysiwygIntervalUnit;
  priceMode?: WysiwygPriceMode;
  priceAmount?: number;
  priceCap?: number;
}

export const EMPTY_WYSIWYG_UNIT: WysiwygUnitConfig = {
  enabled: false,
  useDefaults: true,
  intervalValue: 1,
  intervalUnit: 'month',
  priceMode: 'percent',
  priceAmount: 0,
  priceCap: 0,
  paused: false,
  status: 'idle',
};

export const EMPTY_WYSIWYG_SETTINGS: WysiwygSettings = {
  enabled: false,
  notifyEnabled: true,
  intervalValue: 1,
  intervalUnit: 'month',
  priceMode: 'percent',
  priceAmount: 0,
  priceCap: 0,
};

const INTERVAL_UNITS: WysiwygIntervalUnit[] = ['day', 'week', 'month'];
const PRICE_MODES: WysiwygPriceMode[] = ['fixed', 'percent'];
const STATUSES: WysiwygStatus[] = ['idle', 'due', 'skipped'];

export function isWysiwygDue(unit?: {
  enabled?: boolean;
  paused?: boolean;
  status?: string;
} | null): boolean {
  return Boolean(unit?.enabled && !unit.paused && unit.status === 'due');
}

export function catalogHasWysiwygDue(item: {
  wysiwyg?: {enabled?: boolean; paused?: boolean; status?: string} | null;
  variants?: Array<{
    wysiwyg?: {enabled?: boolean; paused?: boolean; status?: string} | null;
  }> | null;
}): boolean {
  if (isWysiwygDue(item.wysiwyg)) {
    return true;
  }
  return (item.variants ?? []).some(variant => isWysiwygDue(variant.wysiwyg));
}

export function isWysiwygMongoId(value?: string | null): boolean {
  return /^[a-f\d]{24}$/i.test(String(value ?? '').trim());
}

export function mergeWysiwygUnit(
  value?: WysiwygUnitConfig | null,
): WysiwygUnitConfig {
  return {...EMPTY_WYSIWYG_UNIT, ...(value || {})};
}

export function mergeWysiwygSettings(
  value?: WysiwygSettings | null,
): WysiwygSettings {
  return {...EMPTY_WYSIWYG_SETTINGS, ...(value || {})};
}

export function createWysiwygUnitSavePayload(
  value?: WysiwygUnitConfig | null,
): WysiwygUnitConfig {
  const unit = mergeWysiwygUnit(value);
  return {
    enabled: Boolean(unit.enabled),
    useDefaults: unit.useDefaults !== false,
    intervalValue: normalizeIntervalValue(unit.intervalValue),
    intervalUnit: normalizeIntervalUnit(unit.intervalUnit),
    priceMode: normalizePriceMode(unit.priceMode),
    priceAmount: normalizeAmount(unit.priceAmount),
    priceCap: normalizeAmount(unit.priceCap),
    paused: Boolean(unit.paused),
  };
}

export function createWysiwygSettingsSavePayload(
  value?: WysiwygSettings | null,
): WysiwygSettings {
  const settings = mergeWysiwygSettings(value);
  return {
    enabled: Boolean(settings.enabled),
    notifyEnabled: settings.notifyEnabled !== false,
    intervalValue: normalizeIntervalValue(settings.intervalValue),
    intervalUnit: normalizeIntervalUnit(settings.intervalUnit),
    priceMode: normalizePriceMode(settings.priceMode),
    priceAmount: normalizeAmount(settings.priceAmount),
    priceCap: normalizeAmount(settings.priceCap),
  };
}

export function normalizeWysiwygUnitConfig(value: unknown): WysiwygUnitConfig {
  const record = asRecord(value);
  return {
    enabled: Boolean(record.enabled),
    useDefaults: record.useDefaults !== false,
    intervalValue: normalizeIntervalValue(record.intervalValue),
    intervalUnit: normalizeIntervalUnit(record.intervalUnit),
    priceMode: normalizePriceMode(record.priceMode),
    priceAmount: normalizeAmount(record.priceAmount),
    priceCap: normalizeAmount(record.priceCap),
    paused: Boolean(record.paused),
    startsAt: asIso(record.startsAt),
    nextDueAt: asIso(record.nextDueAt),
    status: normalizeStatus(record.status),
    lastPhotoAt: asIso(record.lastPhotoAt),
    lastPriceAt: asIso(record.lastPriceAt),
    lastSkipAt: asIso(record.lastSkipAt),
    lastNotifiedAt: asIso(record.lastNotifiedAt),
  };
}

export function normalizeWysiwygSettings(value: unknown): WysiwygSettings {
  const record = asRecord(value);
  return {
    enabled: Boolean(record.enabled),
    notifyEnabled: record.notifyEnabled !== false,
    intervalValue: normalizeIntervalValue(record.intervalValue),
    intervalUnit: normalizeIntervalUnit(record.intervalUnit),
    priceMode: normalizePriceMode(record.priceMode),
    priceAmount: normalizeAmount(record.priceAmount),
    priceCap: normalizeAmount(record.priceCap),
  };
}

export function formatWysiwygDueAt(value?: string | null): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleString('id-ID');
}

function normalizeIntervalValue(value: unknown): number {
  const parsed = Math.floor(Number(value));
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}

function normalizeAmount(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function normalizeIntervalUnit(value: unknown): WysiwygIntervalUnit {
  return INTERVAL_UNITS.includes(value as WysiwygIntervalUnit)
    ? (value as WysiwygIntervalUnit)
    : 'month';
}

function normalizePriceMode(value: unknown): WysiwygPriceMode {
  return PRICE_MODES.includes(value as WysiwygPriceMode)
    ? (value as WysiwygPriceMode)
    : 'percent';
}

function normalizeStatus(value: unknown): WysiwygStatus {
  return STATUSES.includes(value as WysiwygStatus)
    ? (value as WysiwygStatus)
    : 'idle';
}

function asIso(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  return null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}
