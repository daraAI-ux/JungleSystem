import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  formatKolamSaleAnalyticsBucketLabel,
  getKolamSaleAnalyticsRangeHint,
  KOLAM_SALE_ANALYTICS_RANGE_OPTIONS,
  type KolamSaleAnalyticsOverview,
  type KolamSaleAnalyticsRange,
} from '../domain/kolam-sales';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { getDashboardSalesGraphVisualContract } from '../domain/dashboard-sales-graph';
import { KolamCardFrame } from './kolam-card-frame';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamDashboardSalesGraphRangeTrigger } from './kolam-dashboard-sales-graph-range-trigger';
import { KolamHeaderFrame } from './kolam-header-frame';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamStatusBadge } from './kolam-status-badge';

const GRAPH_VISUAL = getDashboardSalesGraphVisualContract();
const PLOT_HEIGHT = GRAPH_VISUAL.chart.innerPlotHeight;

/**
 * FE `/sales` SalesAnalyticsPanel — skin beranda, data `/sales/analytics/overview`.
 * Reuse: CardFrame inventory/sales-graph, range trigger, empty plot, RemoteImage.
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
              KOLAM_SALE_ANALYTICS_RANGE_OPTIONS.find(option => option.id === range)
                ?.label ?? 'Bulan Ini'
            }
            onSelect={id => onRangeChange(id as KolamSaleAnalyticsRange)}
            options={rangeOptions}
            selectedId={range}
          />
        </KolamHeaderFrame>

        {loading && analytics.bySource.length === 0 ? (
          <Text style={styles.loadingText}>Memuat data…</Text>
        ) : (
          <View style={styles.sourceGrid}>
            {analytics.bySource.map(source => (
              <View key={source.sourceId} style={styles.sourceItem}>
                {source.logoUri ? (
                  <KolamRemoteImage
                    accessibilityLabel={source.name}
                    style={styles.sourceLogo}
                    sourceUri={source.logoUri}
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
              </View>
            ))}
            {analytics.bySource.length === 0 ? (
              <Text style={styles.emptyInline}>
                Belum ada sumber penjualan aktif.
              </Text>
            ) : null}
          </View>
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
    fontSize: 15,
    fontWeight: '800',
  },
  sectionDesc: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    marginTop: 4,
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
  sourceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  sourceItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minWidth: 160,
    width: '47%',
  },
  sourceLogo: {
    borderRadius: 8,
    height: 46,
    width: 46,
  },
  sourceLogoFallback: {
    alignItems: 'center',
    backgroundColor: V.colors.secondary,
    borderRadius: 8,
    height: 46,
    justifyContent: 'center',
    width: 46,
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
    fontSize: 18,
    fontWeight: '800',
  },
  sourceLabel: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
  },
  sourceSub: {
    color: V.colors.mutedFg,
    fontSize: 11,
  },
  emptyInline: {
    color: V.colors.mutedFg,
    fontSize: 13,
    paddingVertical: 12,
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
