import { appConfig } from '../config/app';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

const PRICING_SUPPORT_CACHE_TTL_MS = 5 * 60 * 1000;

type CacheEntry<T> = {
  expiresAt: number;
  promise: Promise<T>;
};

let activePricingSourcesCache: CacheEntry<KolamPricingSource[]> | null = null;
let pricingPaymentMethodsCache: CacheEntry<KolamPricingPaymentMethod[]> | null = null;
let taxEstimateCache: CacheEntry<KolamTaxEstimate> | null = null;

export type KolamSourceCostField = {
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
};

export type KolamPricingSource = {
  id: string;
  name: string;
  type: 'online' | 'offline' | string;
  isMarketplace: boolean;
  costFields: KolamSourceCostField[];
};

export type KolamPaymentMethodCost = {
  name: string;
  type: 'percentage' | 'fixed';
  amount: number;
};

export type KolamPricingPaymentMethod = {
  id: string;
  name: string;
  isActive: boolean;
  costs: KolamPaymentMethodCost[];
};

export type KolamTaxEstimate = {
  ppnRate: number;
  pricesIncludeTax: boolean;
};

export type KolamChannelPricingBreakdown = {
  sourceId: string;
  sourceName: string;
  recommendedListing: number;
  currentListing: number;
  realFeePercent: number | null;
  realFeeSampleCount: number;
  estimatedFeeAmount: number | null;
  estimatedProfit: number | null;
  feeSource: string;
  hppMissing?: boolean;
};

export type KolamChannelPricingAnalysis = {
  ok: boolean;
  warning?: string | null;
  pricingMode?: 'hpp_anchor' | 'web_anchor';
  hppMissing?: boolean;
  entityType: 'product' | 'species';
  entityId: string;
  variantId?: string | null;
  name: string;
  hpp: number;
  minimumOrderQty?: number;
  packingHppBatch?: number;
  recommendedWebPrice?: number;
  currentWebPrice?: number;
  recommendedOnlinePrice?: number;
  currentOnlinePrice?: number;
  channels: KolamChannelPricingBreakdown[];
};

export async function fetchKolamChannelPricingAnalysis(params: {
  entityType: 'product' | 'species';
  entityId: string;
  variantId?: string;
}): Promise<KolamChannelPricingAnalysis | null> {
  const response = await kolamRequest<unknown>(
    '/dara-market-intel/channel-pricing/analysis',
    {
      query: {
        entityType: params.entityType,
        entityId: params.entityId,
        variantId: params.variantId,
      },
    },
  );
  const record = asRecord(unwrapData(response));
  if (!record.entityId && !record.ok && !record.warning) {
    return null;
  }

  return {
    channels: Array.isArray(record.channels)
      ? record.channels.map(normalizeChannelPricingBreakdown)
      : [],
    currentOnlinePrice: getNumber(record.currentOnlinePrice),
    currentWebPrice: getNumber(record.currentWebPrice),
    entityId: String(record.entityId ?? params.entityId),
    entityType: record.entityType === 'product' ? 'product' : 'species',
    hpp: getNumber(record.hpp),
    hppMissing: Boolean(record.hppMissing),
    minimumOrderQty: getNumber(record.minimumOrderQty) || 1,
    name: String(record.name ?? ''),
    ok: Boolean(record.ok),
    packingHppBatch: getNumber(record.packingHppBatch),
    pricingMode:
      record.pricingMode === 'web_anchor' || record.pricingMode === 'hpp_anchor'
        ? record.pricingMode
        : undefined,
    recommendedOnlinePrice: getNumber(record.recommendedOnlinePrice),
    recommendedWebPrice: getNumber(record.recommendedWebPrice),
    variantId: record.variantId == null ? null : String(record.variantId),
    warning: typeof record.warning === 'string' ? record.warning : null,
  };
}

export async function fetchKolamActivePricingSources(): Promise<KolamPricingSource[]> {
  activePricingSourcesCache = getOrCreateCache(activePricingSourcesCache, async () => {
    const response = await kolamRequest<unknown>('/source/active', {
      query: { isActive: true, type: 'online' },
    });
    const data = unwrapData(response);
    const list = Array.isArray(data) ? data : [];
    return list.map(normalizePricingSource).filter(source => source.isMarketplace);
  }, () => {
    activePricingSourcesCache = null;
  });
  return activePricingSourcesCache.promise;
}

export async function fetchKolamPricingPaymentMethods(): Promise<KolamPricingPaymentMethod[]> {
  pricingPaymentMethodsCache = getOrCreateCache(pricingPaymentMethodsCache, async () => {
    const response = await kolamRequest<unknown>('/payment-method', {
      query: { page: 1, limit: 200 },
    });
    const data = unwrapData(response);
    const list = Array.isArray(data) ? data : [];
    return list.map(normalizePaymentMethod);
  }, () => {
    pricingPaymentMethodsCache = null;
  });
  return pricingPaymentMethodsCache.promise;
}

export async function fetchKolamTaxEstimate(): Promise<KolamTaxEstimate> {
  taxEstimateCache = getOrCreateCache(taxEstimateCache, async () => {
    const [taxResponse, webSettingResponse] = await Promise.allSettled([
      kolamRequest<unknown>('/dara-tax/formulas'),
      kolamRequest<unknown>('/websetting'),
    ]);
    const tax =
      taxResponse.status === 'fulfilled'
        ? asRecord(unwrapData(taxResponse.value))
        : {};
    const formulas = asRecord(tax.formulas);
    const webSetting =
      webSettingResponse.status === 'fulfilled'
        ? asRecord(unwrapData(webSettingResponse.value))
        : {};

    const ppnRate = getNumber(formulas.ppnRate) || 11;
    const taxInclude =
      typeof tax.salePricesIncludeTax === 'boolean'
        ? tax.salePricesIncludeTax
        : typeof formulas.pricesIncludeTax === 'boolean'
        ? formulas.pricesIncludeTax
        : typeof webSetting.salePricesIncludeTax === 'boolean'
        ? webSetting.salePricesIncludeTax !== false
        : true;

    return {
      ppnRate,
      pricesIncludeTax: taxInclude,
    };
  }, () => {
    taxEstimateCache = null;
  });
  return taxEstimateCache.promise;
}

function getOrCreateCache<T>(
  cache: CacheEntry<T> | null,
  loader: () => Promise<T>,
  onReject: () => void,
): CacheEntry<T> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) {
    return cache;
  }

  const entry: CacheEntry<T> = {
    expiresAt: now + PRICING_SUPPORT_CACHE_TTL_MS,
    promise: loader(),
  };
  entry.promise.catch(onReject);
  return entry;
}

function kolamRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    query?: Record<string, string | number | boolean | undefined | null>;
    body?: unknown;
  } = {},
) {
  return apiRequest<T | DataResponse<T>>({
    method: options.method ?? 'GET',
    path,
    query: options.query,
    body: options.body,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  }) as Promise<T>;
}

function normalizeChannelPricingBreakdown(value: unknown): KolamChannelPricingBreakdown {
  const record = asRecord(value);
  return {
    currentListing: getNumber(record.currentListing),
    estimatedFeeAmount:
      record.estimatedFeeAmount == null ? null : getNumber(record.estimatedFeeAmount),
    estimatedProfit:
      record.estimatedProfit == null ? null : getNumber(record.estimatedProfit),
    feeSource: String(record.feeSource ?? ''),
    hppMissing: Boolean(record.hppMissing),
    realFeePercent:
      record.realFeePercent == null ? null : getNumber(record.realFeePercent),
    realFeeSampleCount: getNumber(record.realFeeSampleCount),
    recommendedListing: getNumber(record.recommendedListing),
    sourceId: String(record.sourceId ?? ''),
    sourceName: String(record.sourceName ?? ''),
  };
}

function normalizePricingSource(value: unknown): KolamPricingSource {
  const record = asRecord(value);
  return {
    costFields: Array.isArray(record.costFields)
      ? record.costFields.map(normalizeSourceCostField)
      : [],
    id: String(record._id ?? record.id ?? ''),
    isMarketplace: Boolean(record.isMarketplace),
    name: String(record.name ?? ''),
    type: String(record.type ?? ''),
  };
}

function normalizeSourceCostField(value: unknown): KolamSourceCostField {
  const record = asRecord(value);
  return {
    amount: getNumber(record.value),
    name: String(record.name ?? 'Biaya layanan'),
    type: record.type === 'fixed' ? 'fixed' : 'percentage',
    value: getNumber(record.value),
  } as KolamSourceCostField & { amount: number };
}

function normalizePaymentMethod(value: unknown): KolamPricingPaymentMethod {
  const record = asRecord(value);
  return {
    costs: Array.isArray(record.costs)
      ? record.costs.map(normalizePaymentCost)
      : [],
    id: String(record._id ?? record.id ?? ''),
    isActive: record.isActive !== false,
    name: String(record.name ?? 'pembayaran'),
  };
}

function normalizePaymentCost(value: unknown): KolamPaymentMethodCost {
  const record = asRecord(value);
  return {
    amount: getNumber(record.amount),
    name: String(record.name ?? ''),
    type: record.type === 'fixed' ? 'fixed' : 'percentage',
  };
}

function unwrapData(value: unknown): unknown {
  const record = asRecord(value);
  return 'data' in record ? record.data : value;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function getNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
