import { appConfig } from '../config/app';
import { apiRequest } from '../lib/api-client';

export type KolamEntityStatisticsEntityType = 'product' | 'species';
export type KolamEntityStatisticsPeriod = '30d' | '90d' | '1y' | 'all';

export interface KolamEntityStatisticsMonthlyPoint {
  year: number;
  month: number;
  monthName: string;
  totalAmount: number;
  totalQuantity: number;
  totalValue: number;
  orderCount: number;
}

export interface KolamEntityStatisticsSummary {
  stock: number;
  viewCount: number;
  wishlistCount: number;
  averageRating: number;
  totalReviews: number;
  sales: {
    totalAmount: number;
    totalQuantity: number;
    orderCount: number;
  };
  purchases: {
    totalValue: number;
    totalQuantity: number;
    orderCount: number;
  };
}

export interface KolamEntityStatisticsRow {
  id: string;
  primary: string;
  secondary: string;
  meta: string;
  amount: number;
  createdAt: string;
}

export interface KolamEntityVariantSaleStat {
  variantId: string;
  variantLabel: string;
  totalAmount: number;
  totalQuantity: number;
  orderCount: number;
}

export interface KolamEntityCompetitorSummary {
  competitorCount: number;
  health: string;
  healthLabel: string;
  lastFetchAt: string;
  monitorLinkCount: number;
  productId: string;
}

export interface KolamEntityStatistics {
  period: KolamEntityStatisticsPeriod;
  summary: KolamEntityStatisticsSummary;
  monthlySales: KolamEntityStatisticsMonthlyPoint[];
  monthlyPurchases: KolamEntityStatisticsMonthlyPoint[];
  recentSales: KolamEntityStatisticsRow[];
  recentPurchaseOrders: KolamEntityStatisticsRow[];
  variantSales: KolamEntityVariantSaleStat[];
  competitorSummary: KolamEntityCompetitorSummary | null;
}

interface DataResponse<T> {
  data: T;
}

export async function getKolamEntityStatistics({
  entityId,
  entityType,
  period = '90d',
}: {
  entityId: string;
  entityType: KolamEntityStatisticsEntityType;
  period?: KolamEntityStatisticsPeriod;
}): Promise<KolamEntityStatistics | null> {
  const basePath = entityType === 'product' ? 'products' : 'species';
  const response = await apiRequest<unknown | DataResponse<unknown>>({
    method: 'GET',
    path: `/${basePath}/${encodeURIComponent(entityId)}/statistics`,
    query: { period },
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });
  const record = asRecord(unwrapData(response));
  if (!Object.keys(record).length) {
    return null;
  }
  return normalizeStatistics(record);
}

function normalizeStatistics(record: Record<string, unknown>): KolamEntityStatistics {
  const summary = asRecord(record.summary);
  const sales = asRecord(summary.sales);
  const purchases = asRecord(summary.purchases);
  return {
    period: normalizePeriod(record.period),
    summary: {
      stock: getNumber(summary, 'stock'),
      viewCount: getNumber(summary, 'viewCount'),
      wishlistCount: getNumber(summary, 'wishlistCount'),
      averageRating: getNumber(summary, 'averageRating'),
      totalReviews: getNumber(summary, 'totalReviews'),
      sales: {
        totalAmount: getNumber(sales, 'totalAmount'),
        totalQuantity: getNumber(sales, 'totalQuantity'),
        orderCount: getNumber(sales, 'orderCount'),
      },
      purchases: {
        totalValue: getNumber(purchases, 'totalValue'),
        totalQuantity: getNumber(purchases, 'totalQuantity'),
        orderCount: getNumber(purchases, 'orderCount'),
      },
    },
    monthlySales: normalizeMonthlyRows(record.monthlySales),
    monthlyPurchases: normalizeMonthlyRows(record.monthlyPurchases),
    recentSales: normalizeDocumentRows(record.recentSales, 'invoiceCode', 'customerName'),
    recentPurchaseOrders: normalizeDocumentRows(record.recentPurchaseOrders, 'poCode', 'vendorName'),
    variantSales: Array.isArray(record.variantSales)
      ? record.variantSales.map(normalizeVariantSale).filter(Boolean) as KolamEntityVariantSaleStat[]
      : [],
    competitorSummary: normalizeCompetitorSummary(record.competitorSummary),
  };
}

function normalizeMonthlyRows(value: unknown): KolamEntityStatisticsMonthlyPoint[] {
  const list = Array.isArray(value) ? value : [];
  return list.map(item => {
    const record = asRecord(item);
    return {
      year: getNumber(record, 'year'),
      month: getNumber(record, 'month'),
      monthName: getString(record, 'monthName'),
      totalAmount: getNumber(record, 'totalAmount'),
      totalQuantity: getNumber(record, 'totalQuantity'),
      totalValue: getNumber(record, 'totalValue'),
      orderCount: getNumber(record, 'orderCount'),
    };
  });
}

function normalizeDocumentRows(
  value: unknown,
  primaryKey: string,
  secondaryKey: string,
): KolamEntityStatisticsRow[] {
  const list = Array.isArray(value) ? value : [];
  return list.map((item, index) => {
    const record = asRecord(item);
    return {
      id: getString(record, '_id') || getString(record, 'id') || String(index),
      primary: getString(record, primaryKey) || 'Dokumen',
      secondary: getString(record, secondaryKey),
      meta: `${getNumber(record, 'quantity')} unit`,
      amount: getNumber(record, 'amount'),
      createdAt: getString(record, 'createdAt'),
    };
  });
}

function normalizeVariantSale(value: unknown): KolamEntityVariantSaleStat | null {
  const record = asRecord(value);
  return {
    variantId: getString(record, 'variantId'),
    variantLabel: getString(record, 'variantLabel') || 'Default',
    totalAmount: getNumber(record, 'totalAmount'),
    totalQuantity: getNumber(record, 'totalQuantity'),
    orderCount: getNumber(record, 'orderCount'),
  };
}

function normalizeCompetitorSummary(value: unknown): KolamEntityCompetitorSummary | null {
  const record = asRecord(value);
  if (!Object.keys(record).length) {
    return null;
  }
  return {
    competitorCount: getNumber(record, 'competitorCount'),
    health: getString(record, 'health'),
    healthLabel: getString(record, 'healthLabel'),
    lastFetchAt: getString(record, 'lastFetchAt'),
    monitorLinkCount: getNumber(record, 'monitorLinkCount'),
    productId: getString(record, 'productId'),
  };
}

function normalizePeriod(value: unknown): KolamEntityStatisticsPeriod {
  return value === '30d' || value === '1y' || value === 'all' ? value : '90d';
}

function unwrapData(value: unknown): unknown {
  const record = asRecord(value);
  if ('data' in record) {
    return record.data;
  }
  return value;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' ? value : '';
}

function getNumber(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}
