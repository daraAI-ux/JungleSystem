import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamButton } from './kolam-button';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamMarketplaceSyncPlatformList } from './kolam-marketplace-sync-platform-list';
import { KolamStatusBadge, type KolamStatusBadgeProps } from './kolam-status-badge';

type MarketplacePlatformStatus = {
  label?: string;
  lastSyncedAt?: string;
  platform: string;
  status: string;
};

type GrocerPricingTier = {
  minQty: number;
  onlinePrice?: number;
  price: number;
};

export type KolamVendorPriceCardItem = {
  id: string;
  link?: string;
  price: number;
  priceHistory?: Array<{ date?: string; poId?: string; poRef?: string }>;
  shippingCost: number;
  totalCost: number;
  vendorId?: string;
  vendorName: string;
};

export type KolamInternalProfitCommission = {
  enabled: boolean;
  type: 'percentage' | 'fixed' | string;
  value: number;
};

export type KolamInternalProfitHppParts = {
  bomBatch: number;
  productBatch: number;
  storedBatch: number;
  vendorBatch: number;
};

export type KolamInternalProfitPaymentMethod = {
  costs: Array<{ amount?: number; name?: string; type?: string }>;
  isActive?: boolean;
  name?: string;
};

export type KolamInternalProfitTaxEstimate = {
  ppnRate: number;
  pricesIncludeTax: boolean;
};

export type KolamMarketplacePricingSource = {
  costFields: Array<{ name?: string; type: 'percentage' | 'fixed' | string; value: number }>;
  id: string;
  name: string;
};

export type KolamMarketplaceChannelAnalysis = {
  channels: Array<{
    currentListing: number;
    recommendedListing: number;
    sourceId: string;
    sourceName: string;
  }>;
  hpp: number;
  minimumOrderQty?: number;
  ok: boolean;
  packingHppBatch?: number;
  warning?: string | null;
};

export function KolamPricingMarketplaceSyncFooter({
  emptyText = 'Belum ada status sinkron harga.',
  onOpenSyncPrice,
  platforms,
}: {
  emptyText?: string;
  onOpenSyncPrice?: (platforms: Array<'tokopedia' | 'shopee'>) => void;
  platforms?: MarketplacePlatformStatus[];
}) {
  return (
    <View style={styles.marketplaceFooterWrap}>
      <KolamMarketplaceSyncPlatformList
        emptyText={emptyText}
        platforms={platforms ?? []}
        showTime
      />
      {onOpenSyncPrice ? (
        <View style={styles.marketplaceFooterActions}>
          <KolamButton label="Sync TP" onPress={() => onOpenSyncPrice(['tokopedia'])} style={styles.marketplaceFooterButton} />
          <KolamButton label="Sync SH" onPress={() => onOpenSyncPrice(['shopee'])} style={styles.marketplaceFooterButton} />
          <KolamButton label="Sync keduanya" onPress={() => onOpenSyncPrice(['tokopedia', 'shopee'])} style={styles.marketplaceFooterButtonWide} />
        </View>
      ) : null}
    </View>
  );
}

export function KolamGrocerPricingCard({
  description,
  formatCurrency,
  tiers,
  title,
}: {
  description: string;
  formatCurrency: (value: number) => string;
  tiers: GrocerPricingTier[];
  title: string;
}) {
  return (
    <KolamContentFrame style={styles.sectionCardFull} variant="settingsWebConfig">
      <View style={styles.pricingCardHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionDescription}>{description}</Text>
      </View>
      <KolamGrocerTierPills formatCurrency={formatCurrency} tiers={tiers} />
    </KolamContentFrame>
  );
}

export function KolamGrocerTierPills({
  formatCurrency,
  tiers,
}: {
  formatCurrency: (value: number) => string;
  tiers: GrocerPricingTier[];
}) {
  return (
    <View style={styles.pricingTierWrap}>
      {[...tiers]
        .sort((left, right) => left.minQty - right.minQty)
        .map(tier => (
          <View key={tier.minQty} style={styles.pricingTierPill}>
            <Text style={styles.pricingTierQty}>{tier.minQty}+</Text>
            <Text style={styles.pricingTierValue}>{formatCurrency(tier.price)}</Text>
            <Text style={styles.pricingTierOwner}>POS</Text>
            {(tier.onlinePrice ?? 0) > 0 ? (
              <>
                <Text style={styles.pricingTierOnline}>{formatCurrency(tier.onlinePrice ?? 0)}</Text>
                <Text style={styles.pricingTierOwner}>Webstore</Text>
              </>
            ) : null}
          </View>
        ))}
    </View>
  );
}

export function KolamVendorPriceCard({
  badge,
  description,
  emptyText = 'Belum ada harga vendor.',
  formatCurrency,
  prices,
  title,
}: {
  badge?: string;
  description: string;
  emptyText?: string;
  formatCurrency: (value: number) => string;
  prices: KolamVendorPriceCardItem[];
  title: string;
}) {
  const sortedPrices = (Array.isArray(prices) ? [...prices] : []).sort(
    (left, right) => left.totalCost - right.totalCost,
  );
  const bestId = sortedPrices[0]?.id;

  return (
    <KolamContentFrame style={styles.sectionCardFull} variant="settingsWebConfig">
      <View style={styles.vendorSectionHeader}>
        <View style={styles.vendorSectionTitleWrap}>
          <View style={styles.vendorTitleRow}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {badge ? <KolamStatusBadge intent="muted" label={badge} /> : null}
          </View>
          <Text style={styles.sectionDescription}>{description}</Text>
        </View>
      </View>
      {sortedPrices.length ? (
        <View style={styles.vendorTable}>
          <View style={[styles.vendorTableRow, styles.vendorTableHeaderRow]}>
            <Text style={[styles.vendorHeaderCell, styles.vendorSupplierCell]}>Supplier</Text>
            <Text style={styles.vendorHeaderCell}>Harga</Text>
            <Text style={styles.vendorHeaderCell}>Ongkir / unit</Text>
            <Text style={styles.vendorHeaderCell}>Total biaya</Text>
            <Text style={styles.vendorHeaderCell}>Sumber PO</Text>
            <Text style={styles.vendorHeaderCell}>Tautan eksternal</Text>
          </View>
          {sortedPrices.map(price => (
            <View key={price.id} style={styles.vendorTableRow}>
              <View style={[styles.vendorNameCell, styles.vendorSupplierCell]}>
                <Text style={styles.vendorItemTitle}>{price.vendorName || '-'}</Text>
                {price.id === bestId ? (
                  <View style={styles.vendorBestBadge}>
                    <KolamStatusBadge intent="success" label="Terbaik" />
                  </View>
                ) : null}
              </View>
              <Text style={styles.vendorAmountCell}>{hasVendorCost(price) ? formatCurrency(price.price) : '-'}</Text>
              <Text style={styles.vendorAmountCell}>{hasVendorCost(price) ? formatCurrency(price.shippingCost) : '-'}</Text>
              <Text style={styles.vendorTotalCell}>{hasVendorCost(price) ? formatCurrency(price.totalCost) : 'Belum ada PO'}</Text>
              <Text style={styles.vendorPoCell}>{getVendorLatestPoLabel(price)}</Text>
              {price.link ? (
                <KolamButton
                  label="Buka situs vendor"
                  onPress={() => void Linking.openURL(price.link ?? '')}
                  style={styles.vendorLinkButton}
                />
              ) : (
                <Text style={styles.vendorEmptyCell}>-</Text>
              )}
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.pricingMuted}>{emptyText}</Text>
      )}
    </KolamContentFrame>
  );
}

export function KolamInternalProfitCard({
  commission,
  components,
  cost,
  formatCurrency,
  formatNumber,
  minimumOrderQty,
  minimumPriceToSales,
  packings,
  paymentMethods,
  priceToSell,
  taxEstimate,
  vendorPrices,
}: {
  commission: KolamInternalProfitCommission;
  components?: unknown;
  cost: number;
  formatCurrency: (value: number) => string;
  formatNumber: (value: number) => string;
  minimumOrderQty: number;
  minimumPriceToSales: number;
  packings?: unknown;
  paymentMethods?: KolamInternalProfitPaymentMethod[];
  priceToSell: number;
  taxEstimate: KolamInternalProfitTaxEstimate;
  vendorPrices: KolamVendorPriceCardItem[];
}) {
  const minQty = Math.max(1, Number(minimumOrderQty) || 1);
  const hppParts = getInternalHppParts({
    components,
    minimumOrderQty: minQty,
    storedPrice: cost,
    vendorPrices,
  });
  const packingHpp = getPackingHppBatch(packings, minQty);
  if (hppParts.productBatch <= 0 && packingHpp <= 0) {
    return null;
  }
  if (priceToSell <= 0 && minimumPriceToSales <= 0) {
    return null;
  }

  return (
    <KolamContentFrame style={styles.sectionCardFull} variant="settingsWebConfig">
      <View style={styles.pricingCardHeader}>
        <Text style={styles.sectionTitle}>Analisa laba internal</Text>
        <Text style={styles.sectionDescription}>
          POS & webstore - komisi dihitung dari total setelah pemotongan HPP.
        </Text>
      </View>
      <View style={styles.profitGrid}>
        {priceToSell > 0 ? (
          <ProfitBreakdownPanel
            commission={commission}
            formatCurrency={formatCurrency}
            formatNumber={formatNumber}
            hppParts={hppParts}
            label="Margin Harga Pos/Web"
            minimumOrderQty={minQty}
            packingHpp={packingHpp}
            paymentMethods={paymentMethods}
            sellLineLabel="Harga Jual (Pos + Web):"
            taxEstimate={taxEstimate}
            unitSellPrice={priceToSell}
          />
        ) : null}
        {minimumPriceToSales > 0 ? (
          <ProfitBreakdownPanel
            commission={commission}
            formatCurrency={formatCurrency}
            formatNumber={formatNumber}
            hppParts={hppParts}
            label="Margin Harga Minimum (Pos + Web)"
            minimumOrderQty={minQty}
            packingHpp={packingHpp}
            paymentMethods={paymentMethods}
            sellLineLabel="Harga Jual minimum (Pos + Web):"
            taxEstimate={taxEstimate}
            unitSellPrice={minimumPriceToSales}
          />
        ) : null}
      </View>
    </KolamContentFrame>
  );
}

export function KolamMarketplaceProfitAnalyzerCard({
  analysis,
  commission,
  cost,
  formatCurrency,
  formatNumber,
  minimumOrderQty,
  onlinePrice,
  packingHpp,
  platforms,
  priceToSell,
  sources,
  vendorPrices,
}: {
  analysis?: KolamMarketplaceChannelAnalysis | null;
  commission: KolamInternalProfitCommission;
  cost: number;
  formatCurrency: (value: number) => string;
  formatNumber: (value: number) => string;
  minimumOrderQty: number;
  onlinePrice: number;
  packingHpp?: number;
  platforms?: MarketplacePlatformStatus[];
  priceToSell: number;
  sources: KolamMarketplacePricingSource[];
  vendorPrices: KolamVendorPriceCardItem[];
}) {
  const legacyListingUnit = onlinePrice > 0 ? onlinePrice : priceToSell;
  const minQty = Math.max(1, Number(analysis?.minimumOrderQty ?? minimumOrderQty) || 1);
  const resolvedPackingHpp = Math.max(0, Number(analysis?.packingHppBatch ?? packingHpp) || 0);
  const hppParts = analysis?.ok && (analysis.hpp ?? 0) > 0
    ? getAnalysisHppParts(analysis.hpp, resolvedPackingHpp)
    : getInternalHppParts({
        components: undefined,
        minimumOrderQty: minQty,
        storedPrice: cost,
        vendorPrices,
      });
  const cards = getMarketplaceCards({
    analysis,
    legacyListingUnit,
    platforms,
    sources,
  });

  if (analysis?.warning && !cards.length && legacyListingUnit <= 0) {
    return (
      <KolamContentFrame style={styles.sectionCardFull} variant="settingsWebConfig">
        <View style={styles.pricingCardHeader}>
          <Text style={styles.sectionTitle}>Analisa laba marketplace</Text>
          <Text style={styles.sectionDescription}>{analysis.warning}</Text>
        </View>
      </KolamContentFrame>
    );
  }

  if (!cards.length) {
    return null;
  }

  return (
    <KolamContentFrame style={styles.sectionCardFull} variant="settingsWebConfig">
      <View style={styles.pricingCardHeader}>
        <Text style={styles.sectionTitle}>Analisa laba marketplace</Text>
        <Text style={styles.sectionDescription}>
          Per kanal olshop - HPP, biaya layanan source, komisi, laba bersih.
        </Text>
        {analysis?.warning ? <Text style={styles.pricingMuted}>{analysis.warning}</Text> : null}
      </View>
      <View style={styles.marketplaceAnalysisGrid}>
        {cards.map(card => (
          <MarketplaceProfitChannelCard
            commission={commission}
            costFields={card.costFields}
            formatCurrency={formatCurrency}
            formatNumber={formatNumber}
            hppParts={hppParts}
            key={card.sourceId || card.sourceName}
            minimumOrderQty={minQty}
            packingHpp={resolvedPackingHpp}
            platformName={card.sourceName}
            unitPrice={card.listingUnit}
          />
        ))}
      </View>
    </KolamContentFrame>
  );
}

function ProfitBreakdownPanel({
  commission,
  formatCurrency,
  formatNumber,
  hppParts,
  label,
  minimumOrderQty,
  packingHpp,
  paymentMethods,
  sellLineLabel,
  taxEstimate,
  unitSellPrice,
}: {
  commission: KolamInternalProfitCommission;
  formatCurrency: (value: number) => string;
  formatNumber: (value: number) => string;
  hppParts: KolamInternalProfitHppParts;
  label: string;
  minimumOrderQty: number;
  packingHpp: number;
  paymentMethods?: KolamInternalProfitPaymentMethod[];
  sellLineLabel: string;
  taxEstimate: KolamInternalProfitTaxEstimate;
  unitSellPrice: number;
}) {
  const sellBatch = Math.round(unitSellPrice * minimumOrderQty);
  const paymentMethodCost = estimateRepresentativePaymentMethodCost(paymentMethods, sellBatch);
  const internalBase = resolveInternalCommissionNetBase({
    packingHppBatch: packingHpp,
    paymentMethodCostBatch: paymentMethodCost?.amount ?? 0,
    productHppBatch: hppParts.productBatch,
    sellPriceBatch: sellBatch,
    taxEstimate,
  });
  const netBaseBeforeCommission = internalBase.netBaseBeforeCommission;
  const commissionAmount = getCommissionAmount(netBaseBeforeCommission, commission, minimumOrderQty);
  const netProfit = netBaseBeforeCommission - commissionAmount;
  const costBasis = hppParts.productBatch + packingHpp;
  const marginPct = costBasis > 0 ? (netProfit / costBasis) * 100 : 0;
  const intent = netProfit > 0 ? 'success' : netProfit < 0 ? 'danger' : 'muted';
  const hasHppLines =
    hppParts.vendorBatch > 0 ||
    hppParts.bomBatch > 0 ||
    hppParts.storedBatch > 0 ||
    packingHpp > 0 ||
    (paymentMethodCost?.amount ?? 0) > 0;

  return (
    <View style={[styles.profitTile, netProfit < 0 ? styles.profitTileLoss : styles.profitTileGain]}>
      <View style={styles.profitHeaderRow}>
        <Text style={styles.profitItemTitle}>{label}</Text>
        <KolamStatusBadge intent={intent} label={netProfit > 0 ? 'Menguntungkan' : netProfit < 0 ? 'Rugi' : 'Impas'} />
      </View>
      <View style={styles.profitLine}>
        <Text style={styles.pricingMuted}>{sellLineLabel}</Text>
        <Text style={styles.profitLineValue}>{formatBatchLine(unitSellPrice, minimumOrderQty, sellBatch, formatCurrency, formatNumber)}</Text>
      </View>
      {internalBase.ppnAmount > 0 ? (
        <DeductionLine amount={internalBase.ppnAmount} formatCurrency={formatCurrency} label={`PPN keluaran (est. ${formatNumber(taxEstimate.ppnRate)}%)`} />
      ) : null}
      {hasHppLines ? (
        <View style={styles.profitSection}>
          <Text style={styles.profitSectionLabel}>HPP Produk:</Text>
          <DeductionLine amount={hppParts.vendorBatch} formatCurrency={formatCurrency} label="Harga vendor" />
          <DeductionLine amount={hppParts.bomBatch} formatCurrency={formatCurrency} label="Harga bahan baku" />
          <DeductionLine amount={hppParts.storedBatch} formatCurrency={formatCurrency} label="HPP produk" />
          <DeductionLine amount={packingHpp} formatCurrency={formatCurrency} label="Harga packing" />
          {paymentMethodCost ? <DeductionLine amount={paymentMethodCost.amount} formatCurrency={formatCurrency} label={paymentMethodCost.name} /> : null}
        </View>
      ) : null}
      <View style={styles.profitDivider} />
      <View style={styles.profitLine}>
        <Text style={styles.profitStrongLabel}>Total setelah pemotongan HPP:</Text>
        <Text style={styles.profitStrongValue}>{formatCurrency(netBaseBeforeCommission)}</Text>
      </View>
      {commissionAmount > 0 ? (
        <DeductionLine amount={commissionAmount} formatCurrency={formatCurrency} label={getCommissionLabel(commission, formatNumber)} />
      ) : null}
      <View style={styles.profitDivider} />
      <View style={styles.profitLine}>
        <Text style={styles.profitStrongLabel}>Laba bersih:</Text>
        <Text style={[styles.profitNetValue, netProfit < 0 ? styles.profitDanger : styles.profitSuccess]}>{formatCurrency(netProfit)}</Text>
      </View>
      <View style={styles.profitLine}>
        <Text style={styles.pricingMuted}>Margin laba:</Text>
        <Text style={[styles.profitLineValue, marginPct < 0 ? styles.profitDanger : styles.profitSuccess]}>{marginPct.toFixed(2)}%</Text>
      </View>
    </View>
  );
}

function DeductionLine({
  amount,
  formatCurrency,
  label,
}: {
  amount: number;
  formatCurrency: (value: number) => string;
  label: string;
}) {
  if (amount <= 0) {
    return null;
  }

  return (
    <View style={styles.profitLine}>
      <Text style={styles.pricingMuted}>{label}</Text>
      <Text style={styles.profitDanger}>-{formatCurrency(amount)}</Text>
    </View>
  );
}

function hasVendorCost(price: KolamVendorPriceCardItem) {
  return price.price > 0 || price.shippingCost > 0;
}

function getVendorLatestPoLabel(price: KolamVendorPriceCardItem) {
  const history = Array.isArray(price.priceHistory) ? price.priceHistory : [];
  const latestHistory = history.length ? history[history.length - 1] : null;
  return latestHistory?.poRef || '-';
}

function MarketplaceProfitChannelCard({
  commission,
  costFields,
  formatCurrency,
  formatNumber,
  hppParts,
  minimumOrderQty,
  packingHpp,
  platformName,
  unitPrice,
}: {
  commission: KolamInternalProfitCommission;
  costFields: KolamMarketplacePricingSource['costFields'];
  formatCurrency: (value: number) => string;
  formatNumber: (value: number) => string;
  hppParts: KolamInternalProfitHppParts;
  minimumOrderQty: number;
  packingHpp: number;
  platformName: string;
  unitPrice: number;
}) {
  const listingBatch = Math.round(unitPrice * minimumOrderQty);
  const serviceFees = computeMarketplaceServiceFees(costFields, listingBatch);
  const netAfterHppAndService = Math.round(
    listingBatch -
      hppParts.vendorBatch -
      hppParts.bomBatch -
      hppParts.storedBatch -
      packingHpp -
      serviceFees.total,
  );
  const commissionAmount = getCommissionAmount(
    Math.max(0, netAfterHppAndService),
    commission,
    minimumOrderQty,
  );
  const netProfit = netAfterHppAndService - commissionAmount;
  const marginPct = listingBatch > 0 ? (netProfit / listingBatch) * 100 : 0;
  const intent = netProfit > 0 ? 'success' : netProfit < 0 ? 'danger' : 'muted';
  const hasHppSection =
    hppParts.vendorBatch > 0 ||
    hppParts.bomBatch > 0 ||
    hppParts.storedBatch > 0 ||
    packingHpp > 0;

  return (
    <View style={[styles.marketplaceAnalysisCard, netProfit < 0 ? styles.profitTileLoss : styles.profitTileGain]}>
      <View style={styles.profitHeaderRow}>
        <Text style={styles.profitItemTitle}>{platformName}</Text>
        <KolamStatusBadge intent={intent} label={netProfit > 0 ? 'Menguntungkan' : netProfit < 0 ? 'Rugi' : 'Impas'} />
      </View>
      <View style={styles.profitLine}>
        <Text style={styles.pricingMuted}>Harga Jual:</Text>
        <Text style={styles.profitLineValue}>{formatBatchLine(unitPrice, minimumOrderQty, listingBatch, formatCurrency, formatNumber)}</Text>
      </View>
      {hasHppSection ? (
        <View style={styles.profitSection}>
          <Text style={styles.profitSectionLabel}>HPP Produk:</Text>
          <DeductionLine amount={hppParts.vendorBatch} formatCurrency={formatCurrency} label="Harga vendor" />
          <DeductionLine amount={hppParts.bomBatch} formatCurrency={formatCurrency} label="Harga bahan baku" />
          {hppParts.storedBatch > 0 && hppParts.vendorBatch <= 0 && hppParts.bomBatch <= 0 ? (
            <DeductionLine amount={hppParts.storedBatch} formatCurrency={formatCurrency} label="HPP produk" />
          ) : null}
          <DeductionLine amount={packingHpp} formatCurrency={formatCurrency} label="Harga packing" />
        </View>
      ) : null}
      {serviceFees.lines.length ? (
        <View style={styles.profitSection}>
          <Text style={styles.profitSectionLabel}>Biaya layanan:</Text>
          {serviceFees.lines.map((line, index) => (
            <DeductionLine amount={line.amount} formatCurrency={formatCurrency} key={`${line.name}-${index}`} label={line.name} />
          ))}
        </View>
      ) : null}
      <View style={styles.profitDivider} />
      <View style={styles.profitLine}>
        <Text style={styles.profitStrongLabel}>Total setelah pemotongan HPP + Biaya layanan:</Text>
        <Text style={styles.profitStrongValue}>{formatCurrency(netAfterHppAndService)}</Text>
      </View>
      {commissionAmount > 0 ? (
        <DeductionLine amount={commissionAmount} formatCurrency={formatCurrency} label={getCommissionLabel(commission, formatNumber)} />
      ) : (
        <View style={styles.profitLine}>
          <Text style={styles.pricingMuted}>Komisi:</Text>
          <Text style={styles.pricingMuted}>-</Text>
        </View>
      )}
      <View style={styles.profitDivider} />
      <View style={styles.profitLine}>
        <Text style={styles.profitStrongLabel}>Laba bersih:</Text>
        <Text style={[styles.profitNetValue, netProfit < 0 ? styles.profitDanger : styles.profitSuccess]}>{formatCurrency(netProfit)}</Text>
      </View>
      <View style={styles.profitLine}>
        <Text style={styles.pricingMuted}>Margin laba:</Text>
        <Text style={[styles.profitLineValue, marginPct < 0 ? styles.profitDanger : styles.profitSuccess]}>{marginPct.toFixed(2)}%</Text>
      </View>
    </View>
  );
}

function getAnalysisHppParts(hpp: number, packingHpp: number): KolamInternalProfitHppParts {
  const productBatch = Math.max(0, Math.round((Number(hpp) || 0) - (Number(packingHpp) || 0)));
  return {
    bomBatch: 0,
    productBatch,
    storedBatch: productBatch,
    vendorBatch: 0,
  };
}

function getMarketplaceCards({
  analysis,
  legacyListingUnit,
  platforms,
  sources,
}: {
  analysis?: KolamMarketplaceChannelAnalysis | null;
  legacyListingUnit: number;
  platforms?: MarketplacePlatformStatus[];
  sources: KolamMarketplacePricingSource[];
}): Array<{ costFields: KolamMarketplacePricingSource['costFields']; listingUnit: number; sourceId: string; sourceName: string }> {
  if (analysis?.ok && analysis.channels.length > 0) {
    return analysis.channels.map(channel => {
      const source = sources.find(item => item.id === channel.sourceId || item.name === channel.sourceName);
      return {
        costFields: source?.costFields ?? [],
        listingUnit: channel.currentListing > 0 ? channel.currentListing : channel.recommendedListing,
        sourceId: channel.sourceId,
        sourceName: channel.sourceName || source?.name || 'Marketplace',
      };
    });
  }

  if (legacyListingUnit <= 0) {
    return [];
  }

  if (sources.length > 0) {
    return sources.map(source => ({
      costFields: source.costFields ?? [],
      listingUnit: legacyListingUnit,
      sourceId: source.id,
      sourceName: source.name,
    }));
  }

  return (platforms ?? []).map(platform => ({
    costFields: [],
    listingUnit: legacyListingUnit,
    sourceId: platform.platform,
    sourceName: platform.label || platform.platform,
  }));
}

function computeMarketplaceServiceFees(
  costFields: KolamMarketplacePricingSource['costFields'] | undefined | null,
  listingBatch: number,
): { lines: Array<{ name: string; amount: number }>; total: number } {
  const lines: Array<{ name: string; amount: number }> = [];
  let total = 0;
  for (const field of costFields ?? []) {
    const amount = field.type === 'percentage'
      ? Math.round((listingBatch * Number(field.value || 0)) / 100)
      : Math.round(Number(field.value) || 0);
    if (amount <= 0) {
      continue;
    }
    lines.push({ amount, name: field.name || 'Biaya layanan' });
    total += amount;
  }
  return { lines, total };
}

function getInternalHppParts({
  components,
  minimumOrderQty,
  storedPrice,
  vendorPrices,
}: {
  components?: unknown;
  minimumOrderQty: number;
  storedPrice: number;
  vendorPrices: KolamVendorPriceCardItem[];
}): KolamInternalProfitHppParts {
  const minQty = Math.max(1, Number(minimumOrderQty) || 1);
  const bomUnit = getBomSubtotal(components);
  const vendorUnit = getLowestVendorCost(vendorPrices);
  const storedUnit = Math.max(0, Number(storedPrice) || 0);

  if (bomUnit > 0) {
    return {
      bomBatch: Math.round(bomUnit * minQty),
      productBatch: Math.round(bomUnit * minQty),
      storedBatch: 0,
      vendorBatch: 0,
    };
  }

  if (vendorUnit > 0) {
    return {
      bomBatch: 0,
      productBatch: Math.round(vendorUnit * minQty),
      storedBatch: 0,
      vendorBatch: Math.round(vendorUnit * minQty),
    };
  }

  return {
    bomBatch: 0,
    productBatch: Math.round(storedUnit * minQty),
    storedBatch: Math.round(storedUnit * minQty),
    vendorBatch: 0,
  };
}

function getBomSubtotal(components: unknown) {
  if (!Array.isArray(components)) {
    return 0;
  }

  return components.reduce((total, item) => {
    const record = getRawRecord(item);
    const product = getRawRecord(record.product);
    const unitPrice = firstPositiveNumber(product.price, record.price, record.unitPrice);
    const quantity = Number.isFinite(Number(record.quantity)) ? Math.max(0, Number(record.quantity)) : 0;
    return total + unitPrice * quantity;
  }, 0);
}

function getLowestVendorCost(prices: KolamVendorPriceCardItem[]) {
  const values = (Array.isArray(prices) ? prices : [])
    .map(price => firstPositiveNumber(price.totalCost, price.price + price.shippingCost, price.price))
    .filter(value => value > 0);
  return values.length ? Math.min(...values) : 0;
}

function getPackingHppBatch(packings: unknown, minimumOrderQty: number) {
  if (!Array.isArray(packings)) {
    return 0;
  }

  return packings.reduce((total, item) => {
    const record = getRawRecord(item);
    const packing = getRawRecord(record.packing);
    const unitCost = firstPositiveNumber(
      packing.cost,
      getLowestRawVendorCost(packing.vendorPrices),
      record.cost,
      record.price,
      record.totalPrice,
      packing.price,
      packing.priceToSell,
    );
    const quantity = Math.max(1, Number(record.quantity) || 1);
    const batchQuantity = Math.max(1, Math.ceil(quantity / Math.max(1, minimumOrderQty)));
    return total + unitCost * batchQuantity;
  }, 0);
}

function getLowestRawVendorCost(value: unknown) {
  if (!Array.isArray(value)) {
    return 0;
  }

  const values = value
    .map(item => {
      const record = getRawRecord(item);
      const price = Number(record.price) || 0;
      const shipping = Number(record.shippingCost) || 0;
      return firstPositiveNumber(record.totalCost, price + shipping, price);
    })
    .filter(amount => amount > 0);
  return values.length ? Math.min(...values) : 0;
}

function getCommissionAmount(
  netBaseBeforeCommission: number,
  commission: KolamInternalProfitCommission,
  minimumOrderQty: number,
) {
  if (!commission.enabled || commission.value <= 0) {
    return 0;
  }

  if (commission.type === 'percentage') {
    return Math.round((netBaseBeforeCommission * commission.value) / 100);
  }

  return Math.round(commission.value * Math.max(1, minimumOrderQty));
}

function getCommissionLabel(
  commission: KolamInternalProfitCommission,
  formatNumber: (value: number) => string,
) {
  return commission.type === 'percentage'
    ? `Komisi (${formatNumber(commission.value)}%)`
    : 'Komisi (tetap)';
}

function formatBatchLine(
  unitAmount: number,
  minimumOrderQty: number,
  totalAmount: number,
  formatCurrency: (value: number) => string,
  formatNumber: (value: number) => string,
) {
  if (minimumOrderQty <= 1) {
    return formatCurrency(totalAmount);
  }

  return `${formatCurrency(unitAmount)} × ${formatNumber(minimumOrderQty)} = ${formatCurrency(totalAmount)}`;
}

function firstPositiveNumber(...values: unknown[]) {
  for (const value of values) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return 0;
}

function splitPpnFromTotal(
  totalIdr: number,
  taxEstimate: KolamInternalProfitTaxEstimate,
): { dpp: number; ppn: number; total: number } {
  const total = Math.max(0, Number(totalIdr) || 0);
  const rate = (Number(taxEstimate.ppnRate) || 0) / 100;
  if (rate <= 0) {
    return { dpp: total, ppn: 0, total };
  }

  if (taxEstimate.pricesIncludeTax) {
    const dpp = Math.round(total / (1 + rate));
    const ppn = total - dpp;
    return { dpp, ppn, total };
  }

  const dpp = total;
  const ppn = Math.round(dpp * rate);
  return { dpp, ppn, total: dpp + ppn };
}

function resolveInternalCommissionNetBase(args: {
  sellPriceBatch: number;
  productHppBatch: number;
  packingHppBatch: number;
  paymentMethodCostBatch?: number;
  taxEstimate?: KolamInternalProfitTaxEstimate;
}): { ppnAmount: number; revenueBase: number; netBaseBeforeCommission: number } {
  const sell = Math.max(0, Number(args.sellPriceBatch) || 0);
  const productHpp = Math.max(0, Number(args.productHppBatch) || 0);
  const packingHpp = Math.max(0, Number(args.packingHppBatch) || 0);
  const pmCost = Math.max(0, Number(args.paymentMethodCostBatch) || 0);
  const ppnSplit = args.taxEstimate
    ? splitPpnFromTotal(sell, args.taxEstimate)
    : { dpp: sell, ppn: 0, total: sell };
  const usesDpp = Boolean(args.taxEstimate?.pricesIncludeTax && ppnSplit.ppn > 0);
  const revenueBase = usesDpp ? ppnSplit.dpp : sell;
  const ppnDeduction = usesDpp ? 0 : ppnSplit.ppn;
  const netBase = revenueBase - pmCost - productHpp - packingHpp - ppnDeduction;
  return {
    netBaseBeforeCommission: Math.max(0, Math.round(netBase)),
    ppnAmount: ppnSplit.ppn,
    revenueBase,
  };
}

function estimateRepresentativePaymentMethodCost(
  paymentMethods: KolamInternalProfitPaymentMethod[] | undefined | null,
  baseAmount: number,
): { name: string; amount: number } | null {
  const base = Math.max(0, Number(baseAmount) || 0);
  if (base <= 0 || !paymentMethods?.length) {
    return null;
  }

  const candidates = paymentMethods.filter(
    paymentMethod => paymentMethod.isActive !== false && paymentMethod.costs.length > 0,
  );
  if (!candidates.length) {
    return null;
  }

  const paymentMethod = candidates[0];
  let total = 0;
  const names: string[] = [];
  for (const cost of paymentMethod.costs) {
    const amount = cost.type === 'percentage'
      ? Math.round((base * Number(cost.amount || 0)) / 100)
      : Math.round(Number(cost.amount) || 0);
    if (amount > 0) {
      total += amount;
      if (cost.name) {
        names.push(cost.name);
      }
    }
  }

  if (total <= 0) {
    return null;
  }

  return {
    amount: total,
    name: names.length
      ? `Biaya ${paymentMethod.name || 'pembayaran'} (${names.join(', ')})`
      : `Biaya ${paymentMethod.name || 'pembayaran'}`,
  };
}

function getRawRecord(raw: unknown) {
  return raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
}

const styles = StyleSheet.create({
  marketplaceFooterWrap: {
    gap: 4,
    marginTop: 4,
  },
  marketplaceFooterActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  marketplaceFooterButton: {
    minHeight: 28,
    paddingHorizontal: 8,
  },
  marketplaceFooterButtonWide: {
    minHeight: 28,
    paddingHorizontal: 10,
  },
  pricingMuted: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontStyle: 'italic',
    fontWeight: '700',
    lineHeight: 15,
  },
  sectionCardFull: {
    flexBasis: '100%',
    flexGrow: 1,
  },
  pricingCardHeader: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    gap: 4,
    marginBottom: 12,
    paddingBottom: 12,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 22,
  },
  sectionDescription: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  vendorSectionHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  vendorSectionTitleWrap: {
    flex: 1,
    gap: 4,
  },
  vendorTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vendorTable: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  vendorTableRow: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 48,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  vendorTableHeaderRow: {
    backgroundColor: V.colors.muted,
  },
  vendorHeaderCell: {
    color: V.colors.mutedFg,
    flexBasis: 112,
    flexGrow: 0,
    flexShrink: 0,
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 14,
    textAlign: 'right',
    textTransform: 'uppercase',
  },
  vendorSupplierCell: {
    flexBasis: 220,
    flexGrow: 1,
    flexShrink: 1,
    textAlign: 'left',
  },
  vendorNameCell: {
    gap: 4,
    minWidth: 0,
  },
  vendorItemTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  vendorAmountCell: {
    color: V.colors.fg,
    flexBasis: 112,
    flexGrow: 0,
    flexShrink: 0,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    textAlign: 'right',
  },
  vendorTotalCell: {
    color: V.colors.primary,
    flexBasis: 112,
    flexGrow: 0,
    flexShrink: 0,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
    textAlign: 'right',
  },
  vendorPoCell: {
    color: V.colors.mutedFg,
    flexBasis: 96,
    flexGrow: 0,
    flexShrink: 0,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
    textAlign: 'right',
  },
  vendorEmptyCell: {
    color: V.colors.mutedFg,
    flexBasis: 126,
    flexGrow: 0,
    flexShrink: 0,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textAlign: 'center',
  },
  vendorLinkButton: {
    flexBasis: 126,
    flexGrow: 0,
    flexShrink: 0,
    minHeight: 28,
    paddingHorizontal: 8,
  },
  vendorBestBadge: {
    alignSelf: 'flex-start',
  },
  breakdownList: {
    gap: 8,
  },
  breakdownRow: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    padding: 10,
  },
  breakdownCopy: {
    flexBasis: 220,
    flexGrow: 1,
    gap: 3,
  },
  breakdownTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  breakdownLabel: {
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 17,
  },
  breakdownValue: {
    color: V.colors.fg,
    flexBasis: 130,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
    textAlign: 'right',
  },
  breakdownValueLeft: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
  },
  profitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  profitTile: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: 260,
    flexGrow: 1,
    gap: 4,
    padding: 10,
  },
  profitTileGain: {
    backgroundColor: V.colors.successSoft,
    borderColor: V.colors.success,
  },
  profitTileLoss: {
    backgroundColor: V.colors.dangerSoft,
    borderColor: V.colors.danger,
  },
  profitHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  profitItemTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  profitPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: 260,
    flexGrow: 1,
    gap: 8,
    padding: 12,
  },
  profitPanelDanger: {
    borderColor: '#fecaca',
  },
  profitPanelSuccess: {
    borderColor: '#bbf7d0',
  },
  profitDivider: {
    backgroundColor: V.colors.border,
    height: 1,
    marginVertical: 4,
  },
  profitSection: {
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    gap: 4,
    marginTop: 4,
    paddingTop: 8,
  },
  profitLine: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  profitLineValue: {
    color: V.colors.fg,
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    textAlign: 'right',
  },
  profitStrongLabel: {
    color: V.colors.fg,
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
  profitStrongValue: {
    color: V.colors.fg,
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
    textAlign: 'right',
  },
  profitNetValue: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 20,
    textAlign: 'right',
  },
  profitSectionLabel: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 15,
  },
  marketplaceAnalysisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  marketplaceAnalysisCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: 320,
    flexGrow: 1,
    gap: 8,
    padding: 10,
  },
  profitDanger: {
    color: V.colors.danger,
  },
  profitSuccess: {
    color: V.colors.success,
  },
  pricingTierWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pricingTierPill: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  pricingTierQty: {
    backgroundColor: V.colors.muted,
    borderRadius: 4,
    color: V.colors.fg,
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 15,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  pricingTierValue: {
    color: V.colors.success,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
  pricingTierOnline: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
  pricingTierOwner: {
    color: V.colors.mutedFg,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 14,
  },
});
