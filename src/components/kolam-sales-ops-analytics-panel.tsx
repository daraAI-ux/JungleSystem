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
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamCardFrame } from './kolam-card-frame';
import { DASHBOARD_COUNT_VISUAL } from './kolam-dashboard-metric-visual';
import { KolamDashboardSalesGraphRangeTrigger } from './kolam-dashboard-sales-graph-range-trigger';
import { KolamHeaderFrame } from './kolam-header-frame';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamStatusBadge } from './kolam-status-badge';

const COUNT_VISUAL = getDashboardCountVisualContract();
/** Compact plot — full beranda graph height would push the sales table off-screen. */
const PLOT_HEIGHT = 72;

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

      <KolamCardFrame style={styles.chartCard} variant="dashboardInventoryCounts">
        <View style={styles.chartRow}>
          <View style={styles.chartSummary}>
            <Text style={styles.sectionTitle}>Berhasil vs Tidak Berhasil</Text>
            <Text style={styles.sectionDesc}>
              Total pesanan (rentang dipilih)
            </Text>
            <Text style={styles.totalValue}>
              {safeAnalytics.totals.orders.toLocaleString('id-ID')} pesanan
            </Text>
            <Text numberOfLines={2} style={styles.sectionDesc}>
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

          <View style={styles.chartPlot}>
            {loading && safeAnalytics.timeline.length === 0 ? (
              <Text style={styles.plotEmptyText}>Memuat…</Text>
            ) : safeAnalytics.timeline.length === 0 ? (
              <Text style={styles.plotEmptyText}>
                Belum ada pesanan pada rentang ini.
              </Text>
            ) : (
              safeAnalytics.timeline.map((point, index) => {
                const successCount = Number(point.successCount) || 0;
                const failedCount = Number(point.failedCount) || 0;
                const successHeight = Math.max(
                  3,
                  Math.round((successCount / maxBucket) * PLOT_HEIGHT),
                );
                const failedHeight =
                  failedCount > 0
                    ? Math.max(
                        3,
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
              })
            )}
          </View>
        </View>
      </KolamCardFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 8,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  chartCard: {
    overflow: 'hidden',
  },
  chartRow: {
    alignItems: 'stretch',
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 10,
    paddingHorizontal: COUNT_VISUAL.section.gridPaddingX,
    paddingTop: 10,
  },
  chartSummary: {
    flexGrow: 0,
    flexShrink: 1,
    maxWidth: 280,
    minWidth: 180,
  },
  chartPlot: {
    alignItems: 'flex-end',
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    minHeight: PLOT_HEIGHT + 18,
    minWidth: 0,
  },
  plotEmptyText: {
    alignSelf: 'center',
    color: V.colors.mutedFg,
    flex: 1,
    fontSize: 12,
    textAlign: 'center',
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
    fontSize: 12,
    marginTop: 2,
  },
  totalValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  loadingText: {
    color: V.colors.mutedFg,
    fontSize: 13,
    paddingHorizontal: 16,
    paddingVertical: 16,
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
    paddingVertical: 12,
    textAlign: 'center',
    width: '100%',
  },
  legendRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
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
    gap: 4,
    minWidth: 22,
  },
  bucketBars: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 2,
    height: PLOT_HEIGHT,
    justifyContent: 'center',
  },
  barSuccess: {
    backgroundColor: V.colors.success,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    minHeight: 3,
    width: 7,
  },
  barFailed: {
    backgroundColor: V.colors.danger,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    width: 7,
  },
  bucketLabel: {
    color: V.colors.mutedFg,
    fontSize: 9,
    textAlign: 'center',
  },
});
