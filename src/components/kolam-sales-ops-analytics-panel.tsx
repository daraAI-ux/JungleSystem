import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  EMPTY_KOLAM_SALE_ANALYTICS,
  formatKolamSaleAnalyticsBucketLabel,
  getKolamSaleAnalyticsRangeHint,
  KOLAM_SALE_ANALYTICS_RANGE_OPTIONS,
  type KolamSaleAnalyticsOverview,
  type KolamSaleAnalyticsRange,
  type KolamSaleAnalyticsSourceRow,
} from '../domain/kolam-sales';
import { getDashboardCountVisualContract } from '../domain/dashboard-counts';
import { getDashboardSalesGraphVisualContract } from '../domain/dashboard-sales-graph';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamCardFrame } from './kolam-card-frame';
import { KolamContentFrame } from './kolam-content-frame';
import { DASHBOARD_COUNT_VISUAL } from './kolam-dashboard-metric-visual';
import { KolamDashboardSalesGraphRangeTrigger } from './kolam-dashboard-sales-graph-range-trigger';
import { KolamHeaderFrame } from './kolam-header-frame';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamStatusBadge } from './kolam-status-badge';

const GRAPH_VISUAL = getDashboardSalesGraphVisualContract();
const COUNT_VISUAL = getDashboardCountVisualContract();
const PLOT_HEIGHT = GRAPH_VISUAL.chart.innerPlotHeight;

/** FE beranda kanal order — POS / Website / Tokopedia / Shopee first. */
const SOURCE_DISPLAY_PRIORITY = [
  'pos',
  'website',
  'webstore',
  'tokopedia',
  'shopee',
] as const;

function rankSalesSourceName(name: string): number {
  const normalized = name.trim().toLowerCase();
  if (!normalized) {
    return 2000;
  }
  const index = SOURCE_DISPLAY_PRIORITY.findIndex(token => {
    if (token === 'pos') {
      return normalized === 'pos' || normalized.startsWith('pos ');
    }
    return normalized === token || normalized.includes(token);
  });
  return index >= 0 ? index : 1000 + (normalized.charCodeAt(0) || 0);
}

function sortSalesAnalyticsSources(
  sources: KolamSaleAnalyticsSourceRow[],
): KolamSaleAnalyticsSourceRow[] {
  return [...sources].sort((left, right) => {
    const rankDelta =
      rankSalesSourceName(left.name) - rankSalesSourceName(right.name);
    if (rankDelta !== 0) {
      return rankDelta;
    }
    return String(left.name || '').localeCompare(String(right.name || ''), 'id');
  });
}

function resolveAnalytics(
  analytics: KolamSaleAnalyticsOverview | null | undefined,
): KolamSaleAnalyticsOverview {
  if (!analytics || typeof analytics !== 'object') {
    return EMPTY_KOLAM_SALE_ANALYTICS;
  }
  return {
    range: analytics.range ?? EMPTY_KOLAM_SALE_ANALYTICS.range,
    bySource: Array.isArray(analytics.bySource) ? analytics.bySource : [],
    timeline: Array.isArray(analytics.timeline) ? analytics.timeline : [],
    totals: {
      orders: Number(analytics.totals?.orders) || 0,
      success: Number(analytics.totals?.success) || 0,
      failed: Number(analytics.totals?.failed) || 0,
    },
  };
}

/**
 * FE `/sales` SalesAnalyticsPanel — skin beranda, data `/sales/analytics/overview`.
 * Source tiles reuse dashboard inventory count card chrome in one horizontal row.
 */
export function KolamSalesOpsAnalyticsPanel({
  analytics,
  loading,
  onRangeChange,
  pendingApproval,
  range,
  onOpenApproval,
}: {
  analytics: KolamSaleAnalyticsOverview;
  loading: boolean;
  onOpenApproval?: () => void;
  onRangeChange: (range: KolamSaleAnalyticsRange) => void;
  pendingApproval: number;
  range: KolamSaleAnalyticsRange;
}) {
  const safeAnalytics = useMemo(() => resolveAnalytics(analytics), [analytics]);
  const rangeHint = getKolamSaleAnalyticsRangeHint(range);
  const rangeOptions = useMemo(
    () =>
      KOLAM_SALE_ANALYTICS_RANGE_OPTIONS.map(option => ({
        id: option.id,
        label: option.label,
        description: option.hint,
      })),
    [],
  );

  const sourceRows = useMemo(
    () => sortSalesAnalyticsSources(safeAnalytics.bySource),
    [safeAnalytics.bySource],
  );

  const maxBucket = useMemo(() => {
    if (!safeAnalytics.timeline.length) {
      return 1;
    }
    return Math.max(
      1,
      ...safeAnalytics.timeline.map(point =>
        Math.max(Number(point.successCount) || 0, Number(point.failedCount) || 0),
      ),
    );
  }, [safeAnalytics.timeline]);

  return (
    <View style={styles.root}>
      {pendingApproval > 0 ? (
        <Pressable onPress={onOpenApproval}>
          <KolamStatusBadge
            intent="warning"
            label={`${pendingApproval} menunggu persetujuan diskon`}
          />
        </Pressable>
      ) : null}

      <KolamCardFrame variant="dashboardInventoryCounts">
        <KolamHeaderFrame variant="dashboardCountSection">
          <View style={styles.headerCopy}>
            <Text style={styles.sectionTitle}>Pesanan per Sumber</Text>
            <Text style={styles.sectionDesc}>
              Jumlah pesanan (bukan omzet) — {rangeHint.toLowerCase()}.
            </Text>
          </View>
          <KolamDashboardSalesGraphRangeTrigger
            label={
              KOLAM_SALE_ANALYTICS_RANGE_OPTIONS.find(
                option => option.id === range,
              )?.label ?? 'Bulan Ini'
            }
            onSelect={id => onRangeChange(id)}
            options={rangeOptions}
            selectedId={range}
          />
        </KolamHeaderFrame>

        {loading && sourceRows.length === 0 ? (
          <Text style={styles.loadingText}>Memuat data…</Text>
        ) : sourceRows.length === 0 ? (
          <Text style={styles.emptyInline}>
            Belum ada sumber penjualan aktif.
          </Text>
        ) : (
          <View style={styles.sourceStrip}>
            {sourceRows.map(source => {
              const orderCount = Number(source.orderCount) || 0;
              const name = String(source.name || '—');
              return (
                <KolamCardFrame
                  accessibilityLabel={`${name}: ${orderCount} pesanan`}
                  key={source.sourceId || name}
                  style={styles.sourceCard}
                  variant="dashboardCount"
                >
                  {source.logoUri ? (
                    <KolamRemoteImage
                      accessibilityLabel={name}
                      resizeMode="contain"
                      sourceUri={source.logoUri}
                      style={styles.sourceLogo}
                    />
                  ) : (
                    <View style={styles.sourceLogoFallback}>
                      <Text style={styles.sourceLogoFallbackText}>
                        {name.slice(0, 2).toUpperCase() || '—'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.sourceCopy}>
                    <Text style={styles.sourceValue}>
                      {orderCount.toLocaleString('id-ID')}
                    </Text>
                    <Text numberOfLines={1} style={styles.sourceLabel}>
                      {name}
                    </Text>
                    <Text style={styles.sourceSub}>Jumlah pesanan</Text>
                  </View>
                </KolamCardFrame>
              );
            })}
          </View>
        )}
      </KolamCardFrame>

      <KolamCardFrame variant="dashboardSalesGraph">
        <View style={styles.chartHeader}>
          <Text style={styles.sectionTitle}>Berhasil vs Tidak Berhasil</Text>
          <Text style={styles.sectionDesc}>
            Total pesanan (rentang dipilih)
          </Text>
          <Text style={styles.totalValue}>
            {safeAnalytics.totals.orders.toLocaleString('id-ID')} pesanan
          </Text>
          <Text style={styles.sectionDesc}>
            {rangeHint} · Berhasil{' '}
            {safeAnalytics.totals.success.toLocaleString('id-ID')} · Tidak
            berhasil {safeAnalytics.totals.failed.toLocaleString('id-ID')}
          </Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendSwatch, styles.legendSuccess]} />
            <Text style={styles.legendText}>Berhasil</Text>
            <View style={[styles.legendSwatch, styles.legendFailed]} />
            <Text style={styles.legendText}>Tidak berhasil</Text>
          </View>
        </View>

        {loading && safeAnalytics.timeline.length === 0 ? (
          <KolamContentFrame variant="dashboardSalesGraphEmpty">
            <Text style={styles.loadingText}>Memuat data…</Text>
          </KolamContentFrame>
        ) : safeAnalytics.timeline.length === 0 ? (
          <KolamContentFrame variant="dashboardSalesGraphEmpty">
            <Text style={styles.loadingText}>
              Belum ada pesanan pada rentang ini.
            </Text>
          </KolamContentFrame>
        ) : (
          <KolamContentFrame variant="dashboardSalesGraphPlot">
            {safeAnalytics.timeline.map((point, index) => {
              const successCount = Number(point.successCount) || 0;
              const failedCount = Number(point.failedCount) || 0;
              const successHeight = Math.max(
                4,
                Math.round((successCount / maxBucket) * PLOT_HEIGHT),
              );
              const failedHeight =
                failedCount > 0
                  ? Math.max(
                      4,
                      Math.round((failedCount / maxBucket) * PLOT_HEIGHT),
                    )
                  : 0;
              const key = point.timestamp || `bucket-${index}`;
              return (
                <View key={key} style={styles.bucket}>
                  <View style={styles.bucketBars}>
                    <View
                      style={[styles.barSuccess, { height: successHeight }]}
                    />
                    {failedHeight > 0 ? (
                      <View
                        style={[styles.barFailed, { height: failedHeight }]}
                      />
                    ) : null}
                  </View>
                  <Text numberOfLines={1} style={styles.bucketLabel}>
                    {formatKolamSaleAnalyticsBucketLabel(
                      point.timestamp || '',
                      range,
                    )}
                  </Text>
                </View>
              );
            })}
          </KolamContentFrame>
        )}
      </KolamCardFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  chartHeader: {
    gap: 0,
    paddingHorizontal: GRAPH_VISUAL.header.paddingX,
    paddingVertical: GRAPH_VISUAL.header.paddingY,
    borderBottomColor: V.colors.border,
    borderBottomWidth: GRAPH_VISUAL.header.borderBottom ? 1 : 0,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: COUNT_VISUAL.section.titleFontSize,
    fontWeight: '800',
  },
  sectionDesc: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: COUNT_VISUAL.section.descriptionFontSize,
    marginTop: COUNT_VISUAL.section.descriptionGapY,
  },
  totalValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  loadingText: {
    color: V.colors.mutedFg,
    fontSize: 13,
    paddingHorizontal: 16,
    paddingVertical: 24,
    textAlign: 'center',
  },
  sourceStrip: {
    flexDirection: 'row',
    gap: COUNT_VISUAL.cardSpacing,
    paddingBottom: COUNT_VISUAL.section.gridPaddingBottom,
    paddingHorizontal: COUNT_VISUAL.section.gridPaddingX,
  },
  sourceCard: {
    // Equal-width row like FE `repeat(4, 1fr)` — avoid minWidth:220 wrap.
    flex: 1,
    flexBasis: 0,
    minWidth: 0,
  },
  sourceLogo: {
    backgroundColor: V.colors[DASHBOARD_COUNT_VISUAL.iconTile.background],
    borderRadius: DASHBOARD_COUNT_VISUAL.iconTile.radius,
    height: DASHBOARD_COUNT_VISUAL.iconTile.size,
    width: DASHBOARD_COUNT_VISUAL.iconTile.size,
  },
  sourceLogoFallback: {
    alignItems: 'center',
    backgroundColor: V.colors[DASHBOARD_COUNT_VISUAL.iconTile.background],
    borderRadius: DASHBOARD_COUNT_VISUAL.iconTile.radius,
    height: DASHBOARD_COUNT_VISUAL.iconTile.size,
    justifyContent: 'center',
    width: DASHBOARD_COUNT_VISUAL.iconTile.size,
  },
  sourceLogoFallbackText: {
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '700',
  },
  sourceCopy: {
    flex: 1,
    minWidth: 0,
  },
  sourceValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: DASHBOARD_COUNT_VISUAL.copy.valueFontSize,
    fontWeight: '700',
  },
  sourceLabel: {
    color: V.colors[DASHBOARD_COUNT_VISUAL.copy.labelTone],
    fontFamily: V.fontFamily,
    fontSize: DASHBOARD_COUNT_VISUAL.copy.labelFontSize,
    marginTop: DASHBOARD_COUNT_VISUAL.copy.labelGapY,
  },
  sourceSub: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: DASHBOARD_COUNT_VISUAL.copy.subLabelFontSize,
    marginTop: DASHBOARD_COUNT_VISUAL.copy.subLabelGapY,
  },
  emptyInline: {
    color: V.colors.mutedFg,
    fontSize: 13,
    paddingHorizontal: 16,
    paddingVertical: 16,
    textAlign: 'center',
    width: '100%',
  },
  legendRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  legendSwatch: {
    borderRadius: 2,
    height: 10,
    width: 14,
  },
  legendSuccess: {
    backgroundColor: V.colors.success,
  },
  legendFailed: {
    backgroundColor: V.colors.danger,
  },
  legendText: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '600',
    marginRight: 8,
  },
  bucket: {
    alignItems: 'center',
    flex: 1,
    gap: 6,
    minWidth: 28,
  },
  bucketBars: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 3,
    height: PLOT_HEIGHT,
    justifyContent: 'center',
  },
  barSuccess: {
    backgroundColor: V.colors.success,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    minHeight: 4,
    width: 8,
  },
  barFailed: {
    backgroundColor: V.colors.danger,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    width: 8,
  },
  bucketLabel: {
    color: V.colors.mutedFg,
    fontSize: 10,
    textAlign: 'center',
  },
});
