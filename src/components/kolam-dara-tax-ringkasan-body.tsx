import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {KOLAM_NETTO_ICON_SVG} from '../assets/icons/netto-icon-svg';
import {KOLAM_PPH21_ICON_SVG} from '../assets/icons/pph21-icon-svg';
import {KOLAM_PPN_ICON_SVG} from '../assets/icons/ppn-icon-svg';
import {KOLAM_TAX_ICON_SVG} from '../assets/icons/tax-icon-svg';
import {
  formatKolamDaraTaxDateId,
  formatKolamDaraTaxIdr,
  KOLAM_DARA_TAX_COMPLIANCE_LABELS,
  type KolamDaraTaxDashboard,
  type KolamDaraTaxOverviewSeries,
} from '../domain/kolam-dara-tax';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamStatusBadge} from './kolam-status-badge';

/** FE `TaxIntelligenceDashboard` tab Ringkasan. */
export function KolamDaraTaxRingkasanBody({
  dashboard,
  error,
  loading,
  series,
}: {
  dashboard: KolamDaraTaxDashboard | null;
  error: string;
  loading: boolean;
  series: KolamDaraTaxOverviewSeries | null;
}) {
  const overview = dashboard?.overview ?? null;
  const scores = dashboard?.complianceScores ?? null;
  const overall =
    scores && typeof scores.overall === 'number' ? scores.overall : null;

  const seriesMax = useMemo(() => {
    if (!series?.ppnOutputByMonth.length) {
      return 1;
    }
    return Math.max(...series.ppnOutputByMonth.map(row => row.ppnIdr), 1);
  }, [series]);

  if (loading && !dashboard) {
    return <Text style={styles.meta}>Memuat ringkasan…</Text>;
  }

  if (error && !dashboard) {
    return <KolamEmptyState message={error} title="Gagal memuat" />;
  }

  if (!dashboard) {
    return null;
  }

  return (
    <View style={styles.root}>
      {error ? <Text style={styles.warn}>{error}</Text> : null}

      {overview ? (
        <View style={styles.kpiGrid}>
          <KpiCard
            icon={KOLAM_TAX_ICON_SVG}
            label="Penjualan (paid, est. PPN)"
            meta={`${overview.sales.orderCount} order`}
            value={formatKolamDaraTaxIdr(overview.sales.revenueIdr)}
          />
          <KpiCard
            icon={KOLAM_PPN_ICON_SVG}
            label="PPN keluaran"
            meta={`DPP ${formatKolamDaraTaxIdr(overview.sales.ppnOutput.dpp)}`}
            tone="violet"
            value={formatKolamDaraTaxIdr(overview.sales.ppnOutput.ppn)}
          />
          <KpiCard
            icon={KOLAM_NETTO_ICON_SVG}
            label="PPN neto (est.)"
            meta={`Masukan ${formatKolamDaraTaxIdr(
              overview.purchases.ppnInput.ppn,
            )}`}
            value={formatKolamDaraTaxIdr(overview.netPpnEstimate)}
          />
          <KpiCard
            icon={KOLAM_PPH21_ICON_SVG}
            label="PPh 21 komisi"
            meta={`Bruto ${formatKolamDaraTaxIdr(
              overview.commissionPph21?.grossIdr ?? 0,
            )}`}
            tone="amber"
            value={formatKolamDaraTaxIdr(
              overview.commissionPph21?.withheldIdr ?? 0,
            )}
          />
        </View>
      ) : null}

      <View style={styles.summaryGrid}>
        {series && series.ppnOutputByMonth.length > 1 ? (
          <View style={[styles.card, styles.summaryMainCard]}>
            <Text style={styles.sectionTitle}>
              PPN keluaran per bulan (estimasi faktur)
            </Text>
            {series.ppnOutputByMonth.map(row => (
              <View key={row.period} style={styles.seriesRow}>
                <Text style={styles.seriesPeriod}>{row.period}</Text>
                <View style={styles.seriesTrack}>
                  <View
                    style={[
                      styles.seriesFill,
                      {
                        width: `${Math.round(
                          (row.ppnIdr / seriesMax) * 100,
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.seriesAmount}>
                  {formatKolamDaraTaxIdr(row.ppnIdr)}
                </Text>
                <Text style={styles.seriesMeta}>{`${row.orderCount} ord`}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {(scores && Object.keys(scores).length) || dashboard.deadlines.length ? (
          <View style={styles.summarySideColumn}>
            {scores && Object.keys(scores).length ? (
              <View style={styles.card}>
                <Text style={styles.meta}>Compliance Score</Text>
                <Text style={styles.scoreHero}>
                  {overall != null ? `${overall}/100` : '—'}
                </Text>
                <View style={styles.scoreList}>
                  {KOLAM_DARA_TAX_COMPLIANCE_LABELS.map(item => (
                    <View key={item.key} style={styles.scoreRow}>
                      <Text style={styles.meta}>{item.label}</Text>
                      <Text style={styles.scoreValue}>
                        {scores[item.key] != null
                          ? `${scores[item.key]}%`
                          : '—'}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {dashboard.deadlines.length > 0 ? (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Deadline pajak</Text>
                {dashboard.deadlines.map((item, index) => (
                  <View
                    key={`${item.title}-${index}`}
                    style={styles.deadlineRow}>
                    <View style={styles.deadlineBody}>
                      <Text style={styles.alertTitle}>{item.title}</Text>
                      {item.taxType ? (
                        <Text style={styles.meta}>{item.taxType}</Text>
                      ) : null}
                    </View>
                    <Text style={styles.meta}>
                      {formatKolamDaraTaxDateId(item.dueDate)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}
      </View>

      {dashboard.risks.count > 0 ? (
        <View style={[styles.card, styles.riskCard]}>
          <Text style={styles.sectionTitle}>
            {`Perlu perhatian (${dashboard.risks.count})`}
          </Text>
          {dashboard.risks.alerts.map((alert, index) => (
            <View
              key={`${alert.code || alert.title}-${index}`}
              style={styles.alertRow}>
              <KolamStatusBadge
                intent={severityIntent(alert.severity)}
                label={alert.severity}
              />
              <View style={styles.alertBody}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                {alert.message ? (
                  <Text style={styles.meta}>{alert.message}</Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      ) : dashboard.complianceHighlights.length > 0 ? (
        <View style={[styles.card, styles.highlightCard]}>
          <Text style={styles.sectionTitle}>Perlu perhatian</Text>
          {dashboard.complianceHighlights.map(item => (
            <Text key={item} style={styles.meta}>
              {`• ${item}`}
            </Text>
          ))}
        </View>
      ) : null}

    </View>
  );
}

function KpiCard({
  icon,
  label,
  meta,
  tone,
  value,
}: {
  icon?: string;
  label: string;
  meta: string;
  tone?: 'violet' | 'amber';
  value: string;
}) {
  return (
    <View style={[styles.kpiCard, icon ? styles.kpiCardWithIcon : null]}>
      <View style={styles.kpiCopy}>
        <Text style={styles.kpiLabel}>{label}</Text>
        <Text
          style={[
            styles.kpiValue,
            tone === 'violet' ? styles.kpiViolet : null,
            tone === 'amber' ? styles.kpiAmber : null,
          ]}>
          {value}
        </Text>
        <Text style={styles.meta}>{meta}</Text>
      </View>
      {icon ? (
        <View style={styles.kpiIcon}>
          <SvgXml height="100%" width="100%" xml={icon} />
        </View>
      ) : null}
    </View>
  );
}

function severityIntent(
  severity: string,
): 'danger' | 'warning' | 'secondary' {
  if (severity === 'high') {
    return 'danger';
  }
  if (severity === 'medium') {
    return 'warning';
  }
  return 'secondary';
}

const styles = StyleSheet.create({
  root: {
    gap: 12,
  },
  meta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
  warn: {
    color: V.colors.warning,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryGrid: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryMainCard: {
    flexBasis: 0,
    flexGrow: 3,
    minWidth: 360,
  },
  summarySideColumn: {
    flexBasis: 0,
    flexGrow: 1,
    gap: 12,
    minWidth: 220,
  },
  kpiCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    gap: 4,
    minWidth: 160,
    padding: 12,
  },
  kpiCardWithIcon: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kpiCopy: {
    flexShrink: 1,
    gap: 4,
    minWidth: 0,
  },
  kpiIcon: {
    flexShrink: 0,
    height: 54,
    marginLeft: 12,
    width: 54,
  },
  kpiLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  kpiValue: {
    color: '#6d28d9',
    fontFamily: V.fontFamily,
    fontSize: 18,
    fontWeight: '800',
  },
  kpiViolet: {
    color: '#6d28d9',
  },
  kpiAmber: {
    color: '#6d28d9',
  },
  card: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 12,
  },
  riskCard: {
    backgroundColor: '#fff1f2',
    borderColor: '#fecdd3',
  },
  highlightCard: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  sectionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  seriesRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  seriesPeriod: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    width: 56,
  },
  seriesTrack: {
    backgroundColor: V.colors.muted,
    borderRadius: 4,
    flex: 1,
    height: 16,
    overflow: 'hidden',
  },
  seriesFill: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 4,
    borderWidth: 1,
    height: '100%',
  },
  seriesAmount: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
    minWidth: 88,
    textAlign: 'right',
  },
  seriesMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    width: 44,
  },
  scoreHero: {
    color: '#6d28d9',
    fontFamily: V.fontFamily,
    fontSize: 32,
    fontWeight: '800',
  },
  scoreList: {
    gap: 2,
  },
  scoreRow: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  scoreValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  alertRow: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 10,
  },
  alertBody: {
    flex: 1,
    gap: 2,
    minWidth: 140,
  },
  alertTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  deadlineRow: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  deadlineBody: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
});
