import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  getKolamEntityStatistics,
  type KolamEntityStatistics,
  type KolamEntityStatisticsEntityType,
  type KolamEntityStatisticsPeriod,
} from '../services/kolam-entity-statistics-api';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamButton } from './kolam-button';
import { KolamContentFrame } from './kolam-content-frame';

export function KolamEntityStatisticsPanel({
  description,
  entityId,
  entityType,
}: {
  description: string;
  entityId: string;
  entityType: KolamEntityStatisticsEntityType;
}) {
  const [period, setPeriod] = React.useState<KolamEntityStatisticsPeriod>('90d');
  const [statistics, setStatistics] = React.useState<KolamEntityStatistics | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const loadStatistics = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setStatistics(await getKolamEntityStatistics({ entityId, entityType, period }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Statistik tidak tersedia.');
    } finally {
      setLoading(false);
    }
  }, [entityId, entityType, period]);

  React.useEffect(() => {
    void loadStatistics();
  }, [loadStatistics]);

  const summary = statistics?.summary;
  const hasSales = !!summary && summary.sales.orderCount > 0;
  const hasPurchases = !!summary && summary.purchases.orderCount > 0;

  return (
    <KolamContentFrame style={styles.sectionCardFull} variant="settingsWebConfig">
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleWrap}>
          <Text style={styles.sectionTitle}>Statistik</Text>
          <Text style={styles.sectionDescription}>{description}</Text>
        </View>
        <KolamButton disabled={loading} label={loading ? 'Memuat...' : 'Segarkan'} onPress={loadStatistics} />
      </View>
      <View style={styles.periodFilterRow}>
        {STATISTICS_PERIOD_OPTIONS.map(option => (
          <KolamButton
            intent={period === option.id ? 'primary' : 'outline'}
            key={option.id}
            label={option.label}
            onPress={() => setPeriod(option.id)}
            style={styles.periodFilterButton}
          />
        ))}
      </View>
      {error ? <Text style={styles.emptyText}>{error}</Text> : null}
      {summary ? (
        <View style={styles.statisticsStack}>
          <View style={styles.statisticsGrid}>
            <StatTile label="Penjualan" value={formatNumber(summary.sales.totalQuantity)} hint={`${formatCurrency(summary.sales.totalAmount)} | ${formatNumber(summary.sales.orderCount)} order`} />
            <StatTile label="Pembelian" value={formatNumber(summary.purchases.totalQuantity)} hint={`${formatCurrency(summary.purchases.totalValue)} | ${formatNumber(summary.purchases.orderCount)} PO`} />
            <StatTile label="Views" value={formatNumber(summary.viewCount)} />
            <StatTile label="Wishlist" value={formatNumber(summary.wishlistCount)} />
            <StatTile label="Rating" value={`${summary.averageRating.toFixed(1)} *`} hint={`${formatNumber(summary.totalReviews)} review`} />
            <StatTile label="Stok" value={formatNumber(summary.stock)} />
          </View>
          {entityType === 'product' && statistics.competitorSummary ? (
            <View style={styles.locationListCard}>
              <Text style={styles.statisticsBlockTitle}>Kompetitor</Text>
              <View style={styles.locationListRow}>
                <Text style={styles.logisticsMethodTitle}>{statistics.competitorSummary.healthLabel || 'Belum ada status'}</Text>
                <Text style={styles.logisticsMethodMeta}>
                  {formatNumber(statistics.competitorSummary.competitorCount)} kompetitor | {formatNumber(statistics.competitorSummary.monitorLinkCount)} link monitor
                </Text>
              </View>
            </View>
          ) : null}
          {(hasSales && statistics.monthlySales.length > 0) || (hasPurchases && statistics.monthlyPurchases.length > 0) ? (
            <View style={styles.statisticsListGrid}>
              {hasSales && statistics.monthlySales.length > 0 ? (
                <StatisticsTrendCard
                  rows={statistics.monthlySales.map(row => ({ label: `${row.monthName} ${row.year}`, quantity: row.totalQuantity, value: row.totalAmount }))}
                  title="Tren penjualan"
                />
              ) : null}
              {hasPurchases && statistics.monthlyPurchases.length > 0 ? (
                <StatisticsTrendCard
                  rows={statistics.monthlyPurchases.map(row => ({ label: `${row.monthName} ${row.year}`, quantity: row.totalQuantity, value: row.totalValue }))}
                  title="Tren pembelian"
                />
              ) : null}
            </View>
          ) : null}
          {statistics.variantSales.length ? (
            <View style={styles.locationListCard}>
              <Text style={styles.statisticsBlockTitle}>Penjualan per varian</Text>
              {statistics.variantSales.slice(0, 12).map((row, index) => (
                <View key={`${row.variantId || index}`} style={styles.locationListRow}>
                  <Text style={styles.logisticsMethodTitle}>{row.variantLabel || 'Default'}</Text>
                  <Text style={styles.logisticsMethodMeta}>{formatNumber(row.totalQuantity)} unit | {formatCurrency(row.totalAmount)}</Text>
                </View>
              ))}
            </View>
          ) : null}
          <View style={styles.statisticsListGrid}>
            <StatisticsCompactCard emptyLabel="Belum ada penjualan." rows={statistics.recentSales} title="Invoice terkait" />
            <StatisticsCompactCard emptyLabel="Belum ada PO." rows={statistics.recentPurchaseOrders} title="Purchase order" />
          </View>
          {statistics.recentSales[0]?.createdAt ? (
            <Text style={styles.pricingMuted}>Terakhir transaksi: {formatDisplayDate(statistics.recentSales[0].createdAt)}</Text>
          ) : null}
        </View>
      ) : loading ? (
        <Text style={styles.emptyText}>Memuat statistik...</Text>
      ) : (
        <Text style={styles.emptyText}>Statistik tidak tersedia.</Text>
      )}
    </KolamContentFrame>
  );
}

const STATISTICS_PERIOD_OPTIONS: Array<{ id: KolamEntityStatisticsPeriod; label: string }> = [
  { id: '30d', label: '30 hari' },
  { id: '90d', label: '90 hari' },
  { id: '1y', label: '1 tahun' },
  { id: 'all', label: 'Semua' },
];

function StatTile({ hint, label, value }: { hint?: string; label: string; value: string }) {
  return (
    <View style={styles.statisticsTile}>
      <Text style={styles.pricingMetricLabel}>{label}</Text>
      <Text style={styles.pricingValue}>{value}</Text>
      {hint ? <Text style={styles.pricingMuted}>{hint}</Text> : null}
    </View>
  );
}

function StatisticsTrendCard({
  rows,
  title,
}: {
  rows: Array<{ label: string; quantity: number; value: number }>;
  title: string;
}) {
  const max = Math.max(1, ...rows.map(row => row.quantity));
  return (
    <View style={[styles.locationListCard, styles.statisticsListCard]}>
      <Text style={styles.statisticsBlockTitle}>{title}</Text>
      <View style={styles.trendRows}>
        {rows.slice(-8).map(row => (
          <View key={`${title}-${row.label}`} style={styles.trendRow}>
            <Text style={styles.trendLabel}>{row.label}</Text>
            <View style={styles.trendTrack}>
              <View style={[styles.trendFill, { width: `${Math.max(4, Math.round((row.quantity / max) * 100))}%` }]} />
            </View>
            <Text style={styles.trendValue}>{formatNumber(row.quantity)} | {formatCurrency(row.value)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function StatisticsCompactCard({
  emptyLabel,
  rows,
  title,
}: {
  emptyLabel: string;
  rows: KolamEntityStatistics['recentSales'];
  title: string;
}) {
  return (
    <View style={[styles.locationListCard, styles.statisticsListCard]}>
      <View style={styles.statisticsListHeader}>
        <Text style={styles.statisticsBlockTitle}>{title}</Text>
        <Text style={styles.pricingMuted}>{rows.length} item</Text>
      </View>
      {rows.length ? rows.slice(0, 8).map(row => (
        <View key={row.id} style={styles.locationListRow}>
          <View style={styles.logisticsMethodTitleWrap}>
            <Text style={styles.logisticsMethodTitle}>{row.primary}</Text>
            {row.secondary ? <Text style={styles.logisticsMethodMeta}>{row.secondary}</Text> : null}
          </View>
          <Text style={styles.logisticsMethodMeta}>{row.meta} | {formatCurrency(row.amount)}</Text>
        </View>
      )) : <Text style={styles.emptyText}>{emptyLabel}</Text>}
    </View>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    currency: 'IDR',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(Number(value) || 0);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatDisplayDate(value: string) {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

const styles = StyleSheet.create({
  emptyText: {
    color: V.colors.mutedFg,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
    padding: 18,
    textAlign: 'center',
  },
  logisticsMethodMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  logisticsMethodTitle: {
    color: V.colors.fg,
    flex: 1,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  logisticsMethodTitleWrap: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  locationListCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 0,
    overflow: 'hidden',
  },
  locationListRow: {
    alignItems: 'center',
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  periodFilterButton: {
    minHeight: 30,
    paddingHorizontal: 10,
  },
  periodFilterRow: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pricingMetricLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  pricingMuted: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  pricingValue: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20,
  },
  sectionCardFull: {
    gap: 0,
    minWidth: 320,
    overflow: 'hidden',
    padding: 0,
    width: '100%',
  },
  sectionDescription: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  sectionHeader: {
    alignItems: 'flex-start',
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 21,
  },
  sectionTitleWrap: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  statisticsBlockTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  statisticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statisticsListCard: {
    flex: 1,
    minWidth: 280,
  },
  statisticsListGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statisticsListHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 12,
  },
  statisticsStack: {
    gap: 12,
    padding: 12,
  },
  statisticsTile: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    minWidth: 132,
    padding: 12,
  },
  trendFill: {
    backgroundColor: V.colors.primary,
    borderRadius: 999,
    height: 7,
  },
  trendLabel: {
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    width: 86,
  },
  trendRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  trendRows: {
    gap: 8,
    padding: 12,
  },
  trendTrack: {
    backgroundColor: V.colors.mutedSoft,
    borderRadius: 999,
    flex: 1,
    height: 7,
    minWidth: 80,
    overflow: 'hidden',
  },
  trendValue: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
    minWidth: 96,
    textAlign: 'right',
  },
});
