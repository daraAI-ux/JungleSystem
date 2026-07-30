import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
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
import { KolamListFrame } from './kolam-list-frame';
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
  const index = SOURCE_DISPLAY_PRIORITY.findIndex(
    token => normalized === token || normalized.includes(token),
  );
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
    return left.name.localeCompare(right.name, 'id');
  });
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
    () => sortSalesAnalyticsSources(analytics.bySource),
    [analytics.bySource],
  );

  const maxBucket = useMemo(() => {
    return Math.max(
      1,
      ...analytics.timeline.map(point =>
        Math.max(point.successCount, point.failedCount),
      ),
    );
  }, [analytics.timeline]);

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
            onSelect={id => onRangeChange(id as KolamSaleAnalyticsRange)}
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
          <KolamListFrame variant="dashboardCount" style={styles.sourceStrip}>
            {sourceRows.map(source => (
              <KolamCardFrame
                accessibilityLabel={`${source.name}: ${source.orderCount} pesanan`}
                key={source.sourceId}
                style={styles.sourceCard}
                variant="dashboardCount"
              >
                {source.logoUri ? (
                  <KolamRemoteImage
                    accessibilityLabel={source.name}
                    resizeMode="contain"
                    sourceUri={source.logoUri}
                    style={styles.sourceLogo}
                  />
                ) : (
                  <View style={styles.sourceLogoFallback}>
                    <Text style={styles.sourceLogoFallbackText}>
                      {source.name.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.sourceCopy}>
                  <Text style={styles.sourceValue}>
                    {source.orderCount.toLocaleString('id-ID')}
                  </Text>
                  <Text numberOfLines={1} style={styles.sourceLabel}>
                    {source.name}
                  </Text>
                  <Text style={styles.sourceSub}>Jumlah pesanan</Text>
                </View>
              </KolamCardFrame>
            ))}
          </KolamListFrame>
        )}
      </KolamCardFrame>

      <KolamCardFrame variant="dashboardSalesGraph">
        <KolamHeaderFrame variant="salesGraph">
          <KolamHeaderFrame variant="salesGraphSummaryColumn">
            <Text style={styles.sectionTitle}>Berhasil vs Tidak Berhasil</Text>
            <Text style={styles.sectionDesc}>
              Total pesanan (rentang dipilih)
            </Text>
            <Text style={styles.totalValue}>
              {analytics.totals.orders.toLocaleString('id-ID')} pesanan
            </Text>
            <Text style={styles.sectionDesc}>
              {rangeHint} · Berhasil{' '}
              {analytics.totals.success.toLocaleString('id-ID')} · Tidak berhasil{' '}
              {analytics.totals.failed.toLocaleString('id-ID')}
            </Text>
            <View style={styles.legendRow}>
              <View style={[styles.legendSwatch, styles.legendSuccess]} />
              <Text style={styles.legendText}>Berhasil</Text>
              <View style={[styles.legendSwatch, styles.legendFailed]} />
              <Text style={styles.legendText}>Tidak berhasil</Text>
            </View>
          </KolamHeaderFrame>
        </KolamHeaderFrame>

        {loading && analytics.timeline.length === 0 ? (
          <KolamContentFrame variant="dashboardSalesGraphEmpty">
            <Text style={styles.loadingText}>Memuat data…</Text>
          </KolamContentFrame>
        ) : analytics.timeline.length === 0 ? (
          <KolamContentFrame variant="dashboardSalesGraphEmpty">
            <Text style={styles.loadingText}>
              Belum ada pesanan pada rentang ini.
            </Text>
          </KolamContentFrame>
        ) : (
          <KolamContentFrame variant="dashboardSalesGraphPlot">
            {analytics.timeline.map(point => {
              const successHeight = Math.max(
                4,
                Math.round((point.successCount / maxBucket) * PLOT_HEIGHT),
              );
              const failedHeight = Math.max(
                point.failedCount > 0 ? 4 : 0,
                Math.round((point.failedCount / maxBucket) * PLOT_HEIGHT),
              );
              return (
                <View key={point.timestamp} style={styles.bucket}>
                  <View style={styles.bucketBars}>
                    <View
                      style={[
                        styles.barSuccess,
                        { height: successHeight || 4 },
                      ]}
                    />
                    <View
                      style={[
                        styles.barFailed,
                        { height: failedHeight || 0 },
                      ]}
                    />
                  </View>
                  <Text numberOfLines={1} style={styles.bucketLabel}>
                    {formatKolamSaleAnalyticsBucketLabel(point.timestamp, range)}
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
    flexWrap: 'nowrap',
    marginBottom: 0,
    paddingBottom: COUNT_VISUAL.section.gridPaddingBottom,
    paddingHorizontal: COUNT_VISUAL.section.gridPaddingX,
  },
  sourceCard: {
    // Equal-width row like FE inventoryGrid `repeat(4, 1fr)` — override
    // dashboardCount minWidth/basis so POS/Website/Tokopedia/Shopee stay berjejer.
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
