/**
 * FE sales profit breakdown — SoT:
 * - `lib/sales/olshop-sale-profit-breakdown.ts` (Shopee/Tokopedia)
 * - `lib/sales/internal-sale-profit-breakdown.ts` (POS / webstore)
 * - `lib/sales/sale-profit-breakdown-shared.ts`
 */

import type { KolamSale, KolamSaleItem } from './kolam-sales';

export type KolamSaleCommissionRule = {
  type: 'percentage' | 'fixed';
  val: number;
};

export type KolamSaleItemProfitBreakdown = {
  itemIndex: number;
  revenueAfterDiscount: number;
  discountAmount: number;
  hasDiscount: boolean;
  vendorHpp: number;
  bomHpp: number;
  storedHpp: number;
  packingHpp: number;
  /** Internal only — proportional payment-method fee. */
  pmCostShare: number;
  /** Olshop only — proportional marketplace/source fee. */
  sourceFeeShare: number;
  commissionBaseBeforeCommission: number;
  commissionRule: KolamSaleCommissionRule | null;
  commissionAmount: number;
  profitItem: number;
};

export type KolamSaleProfitSummary = {
  mode: 'olshop' | 'internal';
  grossSubtotal: number;
  marketplaceFees: number;
  marketplaceFeeLabel: string;
  marketplaceFeeBreakdown: Array<{ name: string; amount: number }>;
  totalPpn: number;
  paymentMethodCost: number;
  totalCommission: number;
  totalProductHpp: number;
  netProfit: number;
  itemBreakdowns: KolamSaleItemProfitBreakdown[];
};

function lineSubtotal(item: KolamSaleItem): number {
  return Math.max(0, Math.round(Number(item.subtotal) || 0));
}

function isProductSpeciesItem(item: KolamSaleItem): boolean {
  const type = String(item.itemType || '').toLowerCase();
  return type === 'product' || type === 'species';
}

function resolveItemDiscount(item: KolamSaleItem): {
  discountAmount: number;
  hasDiscount: boolean;
} {
  const itemTotal = Math.round(
    (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0),
  );
  if (!item.discount || !(item.discount.amount > 0)) {
    return { discountAmount: 0, hasDiscount: false };
  }
  const discountAmount =
    String(item.discount.type || '').toLowerCase() === 'percentage'
      ? Math.round((itemTotal * item.discount.amount) / 100)
      : Math.round(item.discount.amount * (Number(item.quantity) || 0));
  return { discountAmount, hasDiscount: discountAmount > 0 };
}

function resolveLineProductHppTotal(item: KolamSaleItem): number {
  const qty = Math.max(0, Number(item.quantity) || 0);
  const type = String(item.itemType || '').toLowerCase();
  const unit =
    type === 'custom'
      ? Math.max(0, Number(item.customCost) || 0)
      : Math.max(0, Number(item.unitCostAtSale) || 0);
  return Math.round(unit * qty);
}

function resolveLinePackingHpp(item: KolamSaleItem): number {
  let total = 0;
  for (const packing of item.packings) {
    const quantity = Math.max(0, Number(packing.quantity) || 0);
    if (quantity <= 0) {
      continue;
    }
    total += Math.max(0, Number(packing.unitCostAtSale) || 0) * quantity;
  }
  return Math.round(total);
}

function resolveSnapshotHppParts(item: KolamSaleItem): {
  vendorHpp: number;
  bomHpp: number;
  storedHpp: number;
  packingHpp: number;
} {
  const qty = Math.max(0, Number(item.quantity) || 0);
  const packingHpp = resolveLinePackingHpp(item);
  const hasUnitBreakdown =
    item.hppVendorUnitAtSale != null ||
    item.hppBomUnitAtSale != null ||
    item.hppStoredOnlyUnitAtSale != null;

  if (hasUnitBreakdown) {
    return {
      vendorHpp: Math.round(
        Math.max(0, Number(item.hppVendorUnitAtSale) || 0) * qty,
      ),
      bomHpp: Math.round(Math.max(0, Number(item.hppBomUnitAtSale) || 0) * qty),
      storedHpp: Math.round(
        Math.max(0, Number(item.hppStoredOnlyUnitAtSale) || 0) * qty,
      ),
      packingHpp,
    };
  }

  return {
    vendorHpp: 0,
    bomHpp: 0,
    storedHpp: resolveLineProductHppTotal(item),
    packingHpp,
  };
}

function buildProportionalShares(
  sale: KolamSale,
  itemIndexes: number[],
  totalCost: number,
): Map<number, number> {
  const shares = new Map<number, number>();
  const cost = Math.max(0, Math.round(Number(totalCost) || 0));
  if (cost <= 0) {
    return shares;
  }

  const bases: Array<{ idx: number; base: number }> = [];
  let totalBase = 0;
  for (const idx of itemIndexes) {
    const item = sale.items[idx];
    if (!item) {
      continue;
    }
    const base = lineSubtotal(item);
    if (base <= 0) {
      continue;
    }
    bases.push({ idx, base });
    totalBase += base;
  }
  if (totalBase <= 0) {
    return shares;
  }

  let allocated = 0;
  for (let i = 0; i < bases.length; i += 1) {
    const { idx, base } = bases[i];
    const isLast = i === bases.length - 1;
    const share = isLast
      ? cost - allocated
      : Math.round((cost * base) / totalBase);
    shares.set(idx, Math.max(0, share));
    allocated += share;
  }
  return shares;
}

function buildCommissionAccrualMap(
  sale: KolamSale,
): Map<number, { rule: KolamSaleCommissionRule; amount: number }> {
  const map = new Map<number, { rule: KolamSaleCommissionRule; amount: number }>();
  for (const row of sale.commissionAccrualByItem) {
    const idx = Number(row.saleItemIndex);
    if (!Number.isInteger(idx) || idx < 0) {
      continue;
    }
    map.set(idx, {
      rule: {
        type: row.commissionType === 'fixed' ? 'fixed' : 'percentage',
        val: Number(row.commissionValue) || 0,
      },
      amount: Math.max(0, Math.round(Number(row.commissionAmount) || 0)),
    });
  }
  return map;
}

function allocateTotalByBase(
  itemIndexes: number[],
  bases: Map<number, number>,
  total: number,
): Map<number, number> {
  const shares = new Map<number, number>();
  const amount = Math.max(0, Math.round(Number(total) || 0));
  if (amount <= 0) {
    return shares;
  }

  const rows: Array<{ idx: number; base: number }> = [];
  let totalBase = 0;
  for (const idx of itemIndexes) {
    const base = Math.max(0, Math.round(bases.get(idx) || 0));
    if (base <= 0) {
      continue;
    }
    rows.push({ idx, base });
    totalBase += base;
  }
  if (totalBase <= 0) {
    return shares;
  }

  let allocated = 0;
  for (let i = 0; i < rows.length; i += 1) {
    const { idx, base } = rows[i];
    const isLast = i === rows.length - 1;
    const share = isLast
      ? amount - allocated
      : Math.round((amount * base) / totalBase);
    shares.set(idx, Math.max(0, share));
    allocated += share;
  }
  return shares;
}

function resolveSaleAccruedCommissionTotal(sale: KolamSale): number {
  if (sale.commissionAccruedTotalAtSale != null) {
    return Math.max(
      0,
      Math.round(Number(sale.commissionAccruedTotalAtSale) || 0),
    );
  }
  return sale.commissionAccrualByItem.reduce(
    (sum, row) =>
      sum + Math.max(0, Math.round(Number(row.commissionAmount) || 0)),
    0,
  );
}

function resolveItemCommissionSnapshot(
  itemIndex: number,
  commissionBase: number,
  accrualMap: Map<number, { rule: KolamSaleCommissionRule; amount: number }>,
  allocatedFallback: Map<number, number>,
): { rule: KolamSaleCommissionRule | null; amount: number } {
  const snap = accrualMap.get(itemIndex);
  if (snap && snap.amount > 0) {
    return { rule: snap.rule, amount: snap.amount };
  }
  const allocated = allocatedFallback.get(itemIndex) ?? 0;
  if (allocated > 0) {
    return { rule: null, amount: allocated };
  }
  void commissionBase;
  return { rule: null, amount: 0 };
}

function resolveOlshopCommissionNetBase(
  item: KolamSaleItem,
  sourceCostShare: number,
): number {
  let base = lineSubtotal(item);
  base -= resolveLineProductHppTotal(item);
  base -= resolveLinePackingHpp(item);
  base -= Math.max(0, sourceCostShare);
  return Math.max(0, Math.round(base));
}

function resolveInternalCommissionNetBase(
  item: KolamSaleItem,
  pmCostShare: number,
): number {
  let base = lineSubtotal(item);
  base -= Math.max(0, pmCostShare);
  base -= resolveLineProductHppTotal(item);
  base -= resolveLinePackingHpp(item);
  return Math.max(0, Math.round(base));
}

function marketplaceFeeLabel(sale: KolamSale): string {
  const sourceName =
    sale.sourceRef?.name?.trim() || sale.marketplaceSource || 'marketplace';
  if (/shopee/i.test(sourceName) || sale.marketplaceSource === 'shopee') {
    return 'Biaya layanan Shopee';
  }
  if (/tokopedia/i.test(sourceName) || sale.marketplaceSource === 'tokopedia') {
    return 'Biaya layanan Tokopedia';
  }
  return `Biaya layanan ${sourceName}`;
}

function computeOlshopSaleProfitSummary(sale: KolamSale): KolamSaleProfitSummary {
  const eligibleIndexes = sale.items
    .map((_, idx) => idx)
    .filter(idx => isProductSpeciesItem(sale.items[idx]));

  const sourceFeeShares = buildProportionalShares(
    sale,
    eligibleIndexes,
    sale.sourceCost ?? 0,
  );
  const accrualMap = buildCommissionAccrualMap(sale);

  const commissionBases = new Map<number, number>();
  for (const idx of eligibleIndexes) {
    commissionBases.set(
      idx,
      resolveOlshopCommissionNetBase(
        sale.items[idx],
        sourceFeeShares.get(idx) || 0,
      ),
    );
  }

  const accruedTotal = resolveSaleAccruedCommissionTotal(sale);
  const commissionFallback =
    accrualMap.size > 0
      ? new Map<number, number>()
      : allocateTotalByBase(eligibleIndexes, commissionBases, accruedTotal);

  const itemBreakdowns: KolamSaleItemProfitBreakdown[] = [];
  for (const idx of eligibleIndexes) {
    const item = sale.items[idx];
    const { discountAmount, hasDiscount } = resolveItemDiscount(item);
    const { vendorHpp, bomHpp, storedHpp, packingHpp } =
      resolveSnapshotHppParts(item);
    const sourceFeeShare = Math.max(0, sourceFeeShares.get(idx) || 0);
    const commissionBaseBeforeCommission = resolveOlshopCommissionNetBase(
      item,
      sourceFeeShare,
    );
    const { rule, amount } = resolveItemCommissionSnapshot(
      idx,
      commissionBaseBeforeCommission,
      accrualMap,
      commissionFallback,
    );
    itemBreakdowns.push({
      itemIndex: idx,
      revenueAfterDiscount: lineSubtotal(item),
      discountAmount,
      hasDiscount,
      vendorHpp,
      bomHpp,
      storedHpp,
      packingHpp,
      pmCostShare: 0,
      sourceFeeShare,
      commissionBaseBeforeCommission,
      commissionRule: rule,
      commissionAmount: amount,
      profitItem: commissionBaseBeforeCommission - amount,
    });
  }

  const grossSubtotal = itemBreakdowns.reduce(
    (sum, row) => sum + row.revenueAfterDiscount,
    0,
  );
  const marketplaceFees = Math.max(0, Math.round(Number(sale.sourceCost) || 0));
  const totalCommission =
    accruedTotal > 0
      ? accruedTotal
      : itemBreakdowns.reduce((sum, row) => sum + row.commissionAmount, 0);
  const totalProductHpp = itemBreakdowns.reduce(
    (sum, row) =>
      sum + row.vendorHpp + row.bomHpp + row.storedHpp + row.packingHpp,
    0,
  );

  return {
    mode: 'olshop',
    grossSubtotal,
    marketplaceFees,
    marketplaceFeeLabel: marketplaceFeeLabel(sale),
    marketplaceFeeBreakdown: sale.sourceCostBreakdown.filter(
      row => row.name && row.amount > 0,
    ),
    totalPpn: 0,
    paymentMethodCost: 0,
    totalCommission,
    totalProductHpp,
    netProfit: grossSubtotal - totalProductHpp - marketplaceFees - totalCommission,
    itemBreakdowns,
  };
}

function computeInternalSaleProfitSummary(sale: KolamSale): KolamSaleProfitSummary {
  const eligibleIndexes = sale.items
    .map((_, idx) => idx)
    .filter(idx => isProductSpeciesItem(sale.items[idx]));

  const pmCostShares = buildProportionalShares(
    sale,
    eligibleIndexes,
    sale.paymentMethodCost ?? 0,
  );
  const accrualMap = buildCommissionAccrualMap(sale);

  const commissionBases = new Map<number, number>();
  for (const idx of eligibleIndexes) {
    commissionBases.set(
      idx,
      resolveInternalCommissionNetBase(
        sale.items[idx],
        pmCostShares.get(idx) || 0,
      ),
    );
  }

  const accruedTotal = resolveSaleAccruedCommissionTotal(sale);
  const commissionFallback =
    accrualMap.size > 0
      ? new Map<number, number>()
      : allocateTotalByBase(eligibleIndexes, commissionBases, accruedTotal);

  const itemBreakdowns: KolamSaleItemProfitBreakdown[] = [];
  for (const idx of eligibleIndexes) {
    const item = sale.items[idx];
    const { discountAmount, hasDiscount } = resolveItemDiscount(item);
    const { vendorHpp, bomHpp, storedHpp, packingHpp } =
      resolveSnapshotHppParts(item);
    const pmCostShare = Math.max(0, pmCostShares.get(idx) || 0);
    const commissionBaseBeforeCommission = resolveInternalCommissionNetBase(
      item,
      pmCostShare,
    );
    const { rule, amount } = resolveItemCommissionSnapshot(
      idx,
      commissionBaseBeforeCommission,
      accrualMap,
      commissionFallback,
    );
    itemBreakdowns.push({
      itemIndex: idx,
      revenueAfterDiscount: lineSubtotal(item),
      discountAmount,
      hasDiscount,
      vendorHpp,
      bomHpp,
      storedHpp,
      packingHpp,
      pmCostShare,
      sourceFeeShare: 0,
      commissionBaseBeforeCommission,
      commissionRule: rule,
      commissionAmount: amount,
      profitItem: commissionBaseBeforeCommission - amount,
    });
  }

  const grossSubtotal = itemBreakdowns.reduce(
    (sum, row) => sum + row.revenueAfterDiscount,
    0,
  );
  const totalProductHpp = itemBreakdowns.reduce(
    (sum, row) =>
      sum + row.vendorHpp + row.bomHpp + row.storedHpp + row.packingHpp,
    0,
  );
  const paymentMethodCost = Math.max(
    0,
    Math.round(Number(sale.paymentMethodCost) || 0),
  );
  const totalCommission =
    accruedTotal > 0
      ? accruedTotal
      : itemBreakdowns.reduce((sum, row) => sum + row.commissionAmount, 0);

  return {
    mode: 'internal',
    grossSubtotal,
    marketplaceFees: 0,
    marketplaceFeeLabel: '',
    marketplaceFeeBreakdown: [],
    totalPpn: 0,
    paymentMethodCost,
    totalCommission,
    totalProductHpp,
    netProfit:
      grossSubtotal - totalProductHpp - paymentMethodCost - totalCommission,
    itemBreakdowns,
  };
}

/** FE `isMarketplaceOlshopSale` — Shopee/Tokopedia automatic. */
function isOlshopSale(sale: KolamSale): boolean {
  const source = String(sale.marketplaceSource || '').toLowerCase();
  return source === 'shopee' || source === 'tokopedia';
}

/** FE `SalesItemsTable` branch: olshop vs internal. */
export function computeKolamSaleProfitSummary(
  sale: KolamSale,
): KolamSaleProfitSummary {
  if (isOlshopSale(sale)) {
    return computeOlshopSaleProfitSummary(sale);
  }
  return computeInternalSaleProfitSummary(sale);
}

export function getKolamSaleItemProfitBreakdownMap(
  summary: KolamSaleProfitSummary,
): Map<number, KolamSaleItemProfitBreakdown> {
  const map = new Map<number, KolamSaleItemProfitBreakdown>();
  for (const row of summary.itemBreakdowns) {
    map.set(row.itemIndex, row);
  }
  return map;
}
