import { getKolamFileUrl } from '../lib/file-url';
import type { KolamSpeciesShippingMethod } from './kolam-species';

export type KolamShippingMethodCategory = 'instant' | 'regular';
export type KolamShippingMethodRateSource = 'manual' | 'biteship';
export type KolamShippingMethodPricingType =
  | 'per_kg'
  | 'per_km'
  | 'per_cubic_meter'
  | 'fixed';
export type KolamShippingMethodInsuranceType = 'fixed' | 'percentage';

/**
 * Full admin + picker entity. Required picker fields match
 * `KolamSpeciesShippingMethod` so Product/Species/Sales keep working.
 */
export interface KolamShippingMethod extends KolamSpeciesShippingMethod {
  name: string;
  description: string;
  rateSource: KolamShippingMethodRateSource | '';
  biteshipCourierCode: string;
  biteshipCourierName: string;
  biteshipServiceCode: string;
  biteshipServiceName: string;
  biteshipServiceCodes: string[];
  biteshipServiceNames: string[];
  insuranceEnabled: boolean;
  insuranceType: KolamShippingMethodInsuranceType | '';
  insurancePrice: number;
  isActive: boolean;
  isAvailableOnWebstore: boolean;
  iconPath: string | null;
  createdAt?: string;
  updatedAt?: string;
  raw: unknown;
}

export interface KolamShippingMethodListResult {
  data: KolamShippingMethod[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface KolamShippingMethodFormState {
  id?: string;
  name: string;
  displayName: string;
  description: string;
  category: KolamShippingMethodCategory;
  rateSource: KolamShippingMethodRateSource;
  biteshipCourierCode: string;
  biteshipCourierName: string;
  biteshipServiceCode: string;
  biteshipServiceName: string;
  biteshipServiceCodes: string[];
  biteshipServiceNames: string[];
  pricingType: KolamShippingMethodPricingType;
  pricingPrice: string;
  insuranceEnabled: boolean;
  insuranceType: KolamShippingMethodInsuranceType;
  insurancePrice: string;
  restrictedRegionsText: string;
  minimumOrderAmount: string;
  estimatedDaysMin: string;
  estimatedDaysMax: string;
  isActive: boolean;
  isAvailableOnWebstore: boolean;
  /** Local uri pending upload after create/update. */
  pendingLogoUri: string | null;
  /** When true on edit, delete remote logo after save. */
  removeLogo: boolean;
}

export interface KolamShippingMethodInitializeDefaultsResult {
  message: string;
  created: number;
  skipped: number;
}

export const KOLAM_SHIPPING_METHOD_BREADCRUMB_ROOT = '/metode-pengiriman';
/** Legacy FE/Kolam path kept as alias for deep links and older sessions. */
export const KOLAM_SHIPPING_METHOD_LEGACY_ROOT = '/shipping-method';

export const KOLAM_SHIPPING_METHOD_CATEGORY_OPTIONS = [
  {
    label: 'Pengiriman Instan',
    value: 'instant' as const,
    description: 'Pengiriman di hari yang sama',
  },
  {
    label: 'Pengiriman Reguler',
    value: 'regular' as const,
    description: 'Layanan pengiriman standar',
  },
] as const;

export const KOLAM_SHIPPING_METHOD_RATE_SOURCE_OPTIONS = [
  {
    label: 'Tarif Langsung Biteship',
    value: 'biteship' as const,
    description: 'Gunakan tarif kurir dan layanan Biteship saat checkout',
  },
  {
    label: 'Tarif Manual',
    value: 'manual' as const,
    description: 'Gunakan model harga internal yang dikonfigurasi',
  },
] as const;

export const KOLAM_SHIPPING_METHOD_PRICING_TYPE_OPTIONS = [
  { label: 'Per Kilogram', value: 'per_kg' as const },
  { label: 'Per Kilometer', value: 'per_km' as const },
  { label: 'Per Meter Kubik', value: 'per_cubic_meter' as const },
  { label: 'Harga Tetap', value: 'fixed' as const },
] as const;

export const KOLAM_SHIPPING_METHOD_INSURANCE_TYPE_OPTIONS = [
  { label: 'Harga Tetap', value: 'fixed' as const },
  { label: 'Persentase', value: 'percentage' as const },
] as const;

export function canonicalizeKolamShippingMethodRoute(route: string) {
  const path = String(route || '').split('?')[0];
  if (
    path === KOLAM_SHIPPING_METHOD_LEGACY_ROOT ||
    path.startsWith(`${KOLAM_SHIPPING_METHOD_LEGACY_ROOT}/`)
  ) {
    return path.replace(
      KOLAM_SHIPPING_METHOD_LEGACY_ROOT,
      KOLAM_SHIPPING_METHOD_BREADCRUMB_ROOT,
    );
  }
  return path;
}

export function isKolamShippingMethodRoute(route: string) {
  const path = canonicalizeKolamShippingMethodRoute(route);
  return (
    path === KOLAM_SHIPPING_METHOD_BREADCRUMB_ROOT ||
    path === `${KOLAM_SHIPPING_METHOD_BREADCRUMB_ROOT}/create` ||
    path === `${KOLAM_SHIPPING_METHOD_BREADCRUMB_ROOT}/baru` ||
    path.startsWith(`${KOLAM_SHIPPING_METHOD_BREADCRUMB_ROOT}/`)
  );
}

export function getKolamShippingMethodBreadcrumbPath(
  mode: 'list' | 'detail' | 'edit' | 'new',
  method?: (Pick<KolamShippingMethod, 'id'> &
    Partial<Pick<KolamShippingMethod, 'displayName'>>) | null,
) {
  if (mode === 'new') {
    return `${KOLAM_SHIPPING_METHOD_BREADCRUMB_ROOT}/create`;
  }

  if ((mode === 'detail' || mode === 'edit') && method?.id) {
    return mode === 'edit'
      ? `${KOLAM_SHIPPING_METHOD_BREADCRUMB_ROOT}/${method.id}/edit`
      : `${KOLAM_SHIPPING_METHOD_BREADCRUMB_ROOT}/${method.id}`;
  }

  return KOLAM_SHIPPING_METHOD_BREADCRUMB_ROOT;
}

export function parseKolamShippingMethodRoute(route: string): {
  mode: 'list' | 'detail' | 'edit' | 'new';
  id: string | null;
} {
  const path = canonicalizeKolamShippingMethodRoute(route);
  if (
    path === `${KOLAM_SHIPPING_METHOD_BREADCRUMB_ROOT}/create` ||
    path === `${KOLAM_SHIPPING_METHOD_BREADCRUMB_ROOT}/baru`
  ) {
    return { mode: 'new', id: null };
  }

  const editMatch = path.match(
    /^\/metode-pengiriman\/([^/]+)\/edit\/?$/,
  );
  if (editMatch?.[1]) {
    return { mode: 'edit', id: decodeURIComponent(editMatch[1]) };
  }

  const detailMatch = path.match(/^\/metode-pengiriman\/([^/]+)\/?$/);
  if (
    detailMatch?.[1] &&
    detailMatch[1] !== 'create' &&
    detailMatch[1] !== 'baru'
  ) {
    return { mode: 'detail', id: decodeURIComponent(detailMatch[1]) };
  }

  return { mode: 'list', id: null };
}

export function isKolamShippingMethodBiteship(
  method: Pick<KolamShippingMethod, 'rateSource' | 'biteshipCourierCode'>,
) {
  return (
    method.rateSource === 'biteship' || Boolean(method.biteshipCourierCode?.trim())
  );
}

export function formatKolamShippingMethodCategoryLabel(category?: string | null) {
  if (category === 'instant') {
    return 'Instan';
  }
  if (category === 'regular') {
    return 'Reguler';
  }
  return category?.trim() || '—';
}

export function formatKolamShippingMethodRateSourceLabel(
  method: Pick<KolamShippingMethod, 'rateSource' | 'biteshipCourierCode'>,
) {
  return isKolamShippingMethodBiteship(method) ? 'Biteship' : 'Manual';
}

export function formatKolamShippingMethodPricingTypeLabel(type?: string | null) {
  const found = KOLAM_SHIPPING_METHOD_PRICING_TYPE_OPTIONS.find(
    option => option.value === type,
  );
  if (found) {
    return found.label;
  }
  return String(type || '')
    .replace(/_/g, ' ')
    .trim() || '—';
}

export function formatKolamShippingMethodEstimatedDaysLabel(
  method: Pick<KolamShippingMethod, 'estimatedMinDays' | 'estimatedMaxDays'>,
) {
  const min = method.estimatedMinDays || 0;
  const max = method.estimatedMaxDays || 0;
  if (!min && !max) {
    return '—';
  }
  return `${min} - ${max} hari`;
}

export function toKolamShippingMethodPicker(
  method: KolamShippingMethod,
): KolamSpeciesShippingMethod {
  return {
    id: method.id,
    displayName: method.displayName,
    logoUri: method.logoUri,
    category: method.category,
    pricingType: method.pricingType,
    pricingPrice: method.pricingPrice,
    estimatedMinDays: method.estimatedMinDays,
    estimatedMaxDays: method.estimatedMaxDays,
    restrictedRegions: method.restrictedRegions,
    maximumWeight: method.maximumWeight,
    maximumDimensionLength: method.maximumDimensionLength,
    maximumDimensionWidth: method.maximumDimensionWidth,
    maximumDimensionHeight: method.maximumDimensionHeight,
    minimumOrderAmount: method.minimumOrderAmount,
  };
}

export function normalizeKolamShippingMethodList(
  payload: unknown,
): KolamShippingMethod[] {
  return extractShippingMethodArray(payload)
    .map(normalizeKolamShippingMethod)
    .filter(item => item.id && item.displayName);
}

export function normalizeKolamShippingMethodListResult(
  payload: unknown,
  fallbackLimit = 10,
): KolamShippingMethodListResult {
  const root = asRecord(payload);
  const dataNode = asRecord(root.data);
  const pagination = asRecord(
    root.pagination ?? dataNode.pagination ?? root.meta ?? dataNode.meta,
  );
  const data = normalizeKolamShippingMethodList(payload);
  const page = Math.max(1, getNumber(pagination, 'page') ?? 1);
  const limit = Math.max(
    1,
    getNumber(pagination, 'limit') ?? getNumber(pagination, 'perPage') ?? fallbackLimit,
  );
  const total = Math.max(
    0,
    getNumber(pagination, 'total') ??
      getNumber(pagination, 'totalItems') ??
      data.length,
  );
  const totalPages = Math.max(
    1,
    getNumber(pagination, 'totalPages') ??
      getNumber(pagination, 'pages') ??
      Math.max(1, Math.ceil(total / limit) || 1),
  );

  return { data, page, limit, total, totalPages };
}

export function normalizeKolamShippingMethod(
  payload: unknown,
): KolamShippingMethod {
  const record = asRecord(unwrapData(payload));
  const pricingModel = asRecord(record.pricingModel);
  const estimatedDays = asRecord(record.estimatedDays);
  const specialConditions = asRecord(record.specialConditions);
  const maximumDimension = asRecord(specialConditions.maximumDimension);
  const insurance = asRecord(record.insurance);
  const id =
    getObjectIdString(record) || getString(record, '_id') || getString(record, 'id');
  const name = getString(record, 'name');
  const displayName =
    getString(record, 'displayName') || name || id;
  const iconPath =
    getNullableString(record, 'icon') ?? getNullableString(record, 'logo');
  const rateSourceRaw = getString(record, 'rateSource');
  const rateSource: KolamShippingMethodRateSource | '' =
    rateSourceRaw === 'biteship' || rateSourceRaw === 'manual'
      ? rateSourceRaw
      : '';
  const insuranceTypeRaw = getString(insurance, 'type');
  const insuranceType: KolamShippingMethodInsuranceType | '' =
    insuranceTypeRaw === 'percentage' || insuranceTypeRaw === 'fixed'
      ? insuranceTypeRaw
      : '';

  const biteshipServiceCodes = Array.isArray(record.biteshipServiceCodes)
    ? record.biteshipServiceCodes.map(String).map(value => value.trim()).filter(Boolean)
    : [];
  const biteshipServiceNames = Array.isArray(record.biteshipServiceNames)
    ? record.biteshipServiceNames.map(String).map(value => value.trim()).filter(Boolean)
    : [];

  return {
    id,
    name: name || displayName,
    displayName,
    description: getString(record, 'description'),
    logoUri: getKolamFileUrl(iconPath),
    iconPath,
    category: getString(record, 'category'),
    rateSource,
    biteshipCourierCode: getString(record, 'biteshipCourierCode'),
    biteshipCourierName: getString(record, 'biteshipCourierName'),
    biteshipServiceCode: getString(record, 'biteshipServiceCode'),
    biteshipServiceName: getString(record, 'biteshipServiceName'),
    biteshipServiceCodes,
    biteshipServiceNames,
    pricingType: getString(pricingModel, 'type'),
    pricingPrice: Math.max(0, getNumber(pricingModel, 'price') ?? 0),
    estimatedMinDays: Math.max(0, getNumber(estimatedDays, 'min') ?? 0),
    estimatedMaxDays: Math.max(0, getNumber(estimatedDays, 'max') ?? 0),
    restrictedRegions: Array.isArray(specialConditions.restrictedRegions)
      ? specialConditions.restrictedRegions.map(String).filter(Boolean)
      : [],
    maximumWeight: Math.max(0, getNumber(specialConditions, 'maximumWeight') ?? 0),
    maximumDimensionLength: Math.max(
      0,
      getNumber(maximumDimension, 'length') ?? 0,
    ),
    maximumDimensionWidth: Math.max(0, getNumber(maximumDimension, 'width') ?? 0),
    maximumDimensionHeight: Math.max(
      0,
      getNumber(maximumDimension, 'height') ?? 0,
    ),
    minimumOrderAmount: Math.max(
      0,
      getNumber(specialConditions, 'minimumOrderAmount') ?? 0,
    ),
    insuranceEnabled: getBoolean(insurance, 'enabled') ?? false,
    insuranceType,
    insurancePrice: Math.max(0, getNumber(insurance, 'price') ?? 0),
    isActive: getBoolean(record, 'isActive') ?? true,
    isAvailableOnWebstore: getBoolean(record, 'isAvailableOnWebstore') ?? true,
    createdAt: getString(record, 'createdAt') || undefined,
    updatedAt: getString(record, 'updatedAt') || undefined,
    raw: payload,
  };
}

export function createKolamShippingMethodListRevision(
  items: KolamShippingMethod[],
) {
  return createStableHash(
    items.map(item => ({
      id: item.id,
      name: item.name,
      displayName: item.displayName,
      logoUri: item.logoUri,
      category: item.category,
      rateSource: item.rateSource,
      pricingType: item.pricingType,
      pricingPrice: item.pricingPrice,
      estimatedMinDays: item.estimatedMinDays,
      estimatedMaxDays: item.estimatedMaxDays,
      isActive: item.isActive,
      isAvailableOnWebstore: item.isAvailableOnWebstore,
      updatedAt: item.updatedAt,
    })),
  );
}

export function createKolamShippingMethodDetailRevision(
  method: KolamShippingMethod,
) {
  return createStableHash({
    id: method.id,
    name: method.name,
    displayName: method.displayName,
    description: method.description,
    logoUri: method.logoUri,
    category: method.category,
    rateSource: method.rateSource,
    biteshipCourierCode: method.biteshipCourierCode,
    biteshipServiceCodes: method.biteshipServiceCodes,
    pricingType: method.pricingType,
    pricingPrice: method.pricingPrice,
    insuranceEnabled: method.insuranceEnabled,
    insuranceType: method.insuranceType,
    insurancePrice: method.insurancePrice,
    restrictedRegions: method.restrictedRegions,
    minimumOrderAmount: method.minimumOrderAmount,
    estimatedMinDays: method.estimatedMinDays,
    estimatedMaxDays: method.estimatedMaxDays,
    isActive: method.isActive,
    isAvailableOnWebstore: method.isAvailableOnWebstore,
    updatedAt: method.updatedAt,
  });
}

export function createEmptyKolamShippingMethodFormState(): KolamShippingMethodFormState {
  return {
    name: '',
    displayName: '',
    description: '',
    category: 'regular',
    rateSource: 'biteship',
    biteshipCourierCode: '',
    biteshipCourierName: '',
    biteshipServiceCode: '',
    biteshipServiceName: '',
    biteshipServiceCodes: [],
    biteshipServiceNames: [],
    pricingType: 'fixed',
    pricingPrice: '',
    insuranceEnabled: false,
    insuranceType: 'fixed',
    insurancePrice: '',
    restrictedRegionsText: '',
    minimumOrderAmount: '',
    estimatedDaysMin: '2',
    estimatedDaysMax: '5',
    isActive: true,
    isAvailableOnWebstore: true,
    pendingLogoUri: null,
    removeLogo: false,
  };
}

export function createKolamShippingMethodFormState(
  method: KolamShippingMethod,
): KolamShippingMethodFormState {
  return {
    id: method.id,
    name: method.name,
    displayName: method.displayName,
    description: method.description,
    category:
      method.category === 'instant' || method.category === 'regular'
        ? method.category
        : 'regular',
    rateSource: isKolamShippingMethodBiteship(method) ? 'biteship' : 'manual',
    biteshipCourierCode: method.biteshipCourierCode,
    biteshipCourierName: method.biteshipCourierName,
    biteshipServiceCode: method.biteshipServiceCode,
    biteshipServiceName: method.biteshipServiceName,
    biteshipServiceCodes: [...method.biteshipServiceCodes],
    biteshipServiceNames: [...method.biteshipServiceNames],
    pricingType:
      method.pricingType === 'per_kg' ||
      method.pricingType === 'per_km' ||
      method.pricingType === 'per_cubic_meter' ||
      method.pricingType === 'fixed'
        ? method.pricingType
        : 'fixed',
    pricingPrice:
      method.pricingPrice > 0 ? String(method.pricingPrice) : '',
    insuranceEnabled: method.insuranceEnabled,
    insuranceType:
      method.insuranceType === 'percentage' ? 'percentage' : 'fixed',
    insurancePrice:
      method.insurancePrice > 0 ? String(method.insurancePrice) : '',
    restrictedRegionsText: method.restrictedRegions.join(', '),
    minimumOrderAmount:
      method.minimumOrderAmount > 0 ? String(method.minimumOrderAmount) : '',
    estimatedDaysMin: String(method.estimatedMinDays || 0),
    estimatedDaysMax: String(method.estimatedMaxDays || 0),
    isActive: method.isActive,
    isAvailableOnWebstore: method.isAvailableOnWebstore,
    pendingLogoUri: null,
    removeLogo: false,
  };
}

export function validateKolamShippingMethodForm(
  form: KolamShippingMethodFormState,
): string | null {
  if (form.rateSource === 'biteship') {
    if (!form.biteshipCourierCode.trim()) {
      return 'Pilih kurir Biteship.';
    }
    if (form.biteshipServiceCodes.length === 0) {
      return 'Pilih minimal satu layanan Biteship.';
    }
  } else {
    const name = form.name.trim();
    if (!name) {
      return 'Nama metode pengiriman wajib diisi.';
    }
    if (name.length < 2) {
      return 'Nama metode pengiriman minimal 2 karakter.';
    }
    const price = Number(form.pricingPrice);
    if (!Number.isFinite(price) || price < 0) {
      return 'Harga wajib diisi dan tidak boleh negatif.';
    }
  }

  const minDays = Number(form.estimatedDaysMin);
  const maxDays = Number(form.estimatedDaysMax);
  if (!Number.isFinite(minDays) || minDays < 0) {
    return 'Hari minimum tidak valid.';
  }
  if (!Number.isFinite(maxDays) || maxDays < 0) {
    return 'Hari maksimum tidak valid.';
  }
  if (maxDays < minDays) {
    return 'Hari maksimum harus ≥ hari minimum.';
  }

  if (form.insuranceEnabled) {
    const insurancePrice = Number(form.insurancePrice);
    if (!Number.isFinite(insurancePrice) || insurancePrice < 0) {
      return 'Harga asuransi tidak valid.';
    }
  }

  return null;
}

export function createKolamShippingMethodSavePayload(
  form: KolamShippingMethodFormState,
) {
  const displayName = form.displayName.trim() || form.name.trim();
  const restrictedRegions = form.restrictedRegionsText
    .split(/[,;\n]/)
    .map(part => part.trim())
    .filter(Boolean);
  const minimumOrderAmount = Number(form.minimumOrderAmount);
  const estimatedDays = {
    min: Math.max(0, Number(form.estimatedDaysMin) || 0),
    max: Math.max(0, Number(form.estimatedDaysMax) || 0),
  };

  if (form.rateSource === 'biteship') {
    const singleCode =
      form.biteshipServiceCodes.length === 1
        ? form.biteshipServiceCodes[0]
        : form.biteshipServiceCode.trim() || undefined;
    const singleName =
      form.biteshipServiceNames.length === 1
        ? form.biteshipServiceNames[0]
        : form.biteshipServiceName.trim() || undefined;
    const name =
      form.name.trim() ||
      [form.biteshipCourierCode.trim(), ...(form.biteshipServiceCodes.length
        ? form.biteshipServiceCodes
        : ['all'])]
        .filter(Boolean)
        .join('-');

    return {
      name,
      displayName:
        displayName ||
        form.biteshipCourierName.trim() ||
        form.biteshipCourierCode.trim(),
      description: form.description.trim() || undefined,
      category: form.category,
      rateSource: 'biteship' as const,
      biteshipCourierCode: form.biteshipCourierCode.trim(),
      biteshipCourierName: form.biteshipCourierName.trim() || undefined,
      biteshipServiceCode: singleCode,
      biteshipServiceName: singleName,
      biteshipServiceCodes: form.biteshipServiceCodes,
      biteshipServiceNames: form.biteshipServiceNames,
      pricingModel: { type: 'fixed' as const, price: 0 },
      specialConditions: {
        restrictedRegions,
        ...(Number.isFinite(minimumOrderAmount) && minimumOrderAmount > 0
          ? { minimumOrderAmount }
          : {}),
      },
      estimatedDays,
      isActive: form.isActive,
      isAvailableOnWebstore: form.isAvailableOnWebstore,
      insurance: form.insuranceEnabled
        ? {
            enabled: true,
            type: form.insuranceType,
            price: Math.max(0, Number(form.insurancePrice) || 0),
          }
        : { enabled: false, type: form.insuranceType, price: 0 },
    };
  }

  return {
    name: form.name.trim(),
    displayName: displayName || form.name.trim(),
    description: form.description.trim() || undefined,
    category: form.category,
    rateSource: 'manual' as const,
    biteshipCourierCode: null,
    biteshipCourierName: null,
    biteshipServiceCode: null,
    biteshipServiceName: null,
    biteshipServiceCodes: [],
    biteshipServiceNames: [],
    pricingModel: {
      type: form.pricingType,
      price: Math.max(0, Number(form.pricingPrice) || 0),
    },
    specialConditions: {
      restrictedRegions,
      ...(Number.isFinite(minimumOrderAmount) && minimumOrderAmount > 0
        ? { minimumOrderAmount }
        : {}),
    },
    estimatedDays,
    isActive: form.isActive,
    isAvailableOnWebstore: form.isAvailableOnWebstore,
    insurance: form.insuranceEnabled
      ? {
          enabled: true,
          type: form.insuranceType,
          price: Math.max(0, Number(form.insurancePrice) || 0),
        }
      : { enabled: false, type: form.insuranceType, price: 0 },
  };
}

export function normalizeKolamShippingMethodInitializeDefaults(
  payload: unknown,
): KolamShippingMethodInitializeDefaultsResult {
  const record = asRecord(unwrapData(payload));
  return {
    message: getString(record, 'message') || 'Defaults initialized',
    created: Math.max(0, getNumber(record, 'created') ?? 0),
    skipped: Math.max(0, getNumber(record, 'skipped') ?? 0),
  };
}

function extractShippingMethodArray(payload: unknown): unknown[] {
  const root = unwrapData(payload);
  const record = asRecord(root);
  if (Array.isArray(root)) {
    return root;
  }
  if (Array.isArray(record.data)) {
    return record.data;
  }
  if (Array.isArray(record.items)) {
    return record.items;
  }
  if (Array.isArray(record.shippingMethods)) {
    return record.shippingMethods;
  }
  const nested = asRecord(record.data);
  if (Array.isArray(nested.data)) {
    return nested.data;
  }
  return [];
}

function unwrapData(payload: unknown): unknown {
  const record = asRecord(payload);
  if ('data' in record && !Array.isArray(payload)) {
    return record.data;
  }
  return payload;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' ? value.trim() : '';
}

function getNullableString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function getNumber(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function getBoolean(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value === 'boolean') {
    return value;
  }
  if (value === 'true' || value === 1 || value === '1') {
    return true;
  }
  if (value === 'false' || value === 0 || value === '0') {
    return false;
  }
  return null;
}

function getObjectIdString(record: Record<string, unknown>) {
  const value = record._id;
  if (typeof value === 'string') {
    return value;
  }
  const objectRecord = asRecord(value);
  return getString(objectRecord, '$oid');
}

function createStableHash(value: unknown) {
  const json = JSON.stringify(value);
  let hash = 0;
  for (let index = 0; index < json.length; index += 1) {
    hash = (hash << 5) - hash + json.charCodeAt(index);
    hash |= 0;
  }
  return String(hash);
}
