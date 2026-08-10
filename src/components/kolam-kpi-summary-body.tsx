import React, {useMemo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Svg, {Circle, Polyline} from 'react-native-svg';
import {
  buildKolamKpiUserDetailRoute,
  formatKolamKpiPoints,
  KOLAM_KPI_GRANULARITY_OPTIONS,
  KOLAM_KPI_PERIOD_OPTIONS,
  KOLAM_KPI_PLUGIN_DISABLED,
  kolamKpiLeaderboardRowLabel,
  type KolamKpiLeaderboardRow,
} from '../domain/kolam-kpi';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {useKolamKpiSummaryController} from '../hooks/use-kolam-kpi-summary-controller';
import {KolamButton} from './kolam-button';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamListTableComposition} from './kolam-list-table-composition';
import {KolamRefreshButton} from './kolam-refresh-button';
import {KolamStatsCardStrip} from './kolam-stats-card-strip';
import {KolamStatusBadge} from './kolam-status-badge';
import {kolamTableToolbarStyles} from './kolam-table-toolbar-styles';

/** FE `KpiTeamPage` Ringkasan tab. */
export function KolamKpiSummaryBody({
  canView,
  onRouteChange,
}: {
  canView: boolean;
  onRouteChange?: (route: string) => void;
}) {
  const controller = useKolamKpiSummaryController({enabled: canView});

  const leaderboardColumns = useMemo(
    () => [
      {
        id: 'rank',
        label: '#',
        flex: 0.4,
        render: (row: KolamKpiLeaderboardRow) => (
          <Text style={styles.cellText}>{row.rank}</Text>
        ),
      },
      {
        id: 'staff',
        label: 'Staff',
        flex: 1.6,
        render: (row: KolamKpiLeaderboardRow) => (
          <Pressable
            accessibilityRole="link"
            onPress={() =>
              onRouteChange?.(buildKolamKpiUserDetailRoute(row.userId))
            }>
            <Text style={styles.linkText}>
              {kolamKpiLeaderboardRowLabel(row)}
            </Text>
          </Pressable>
        ),
      },
      {
        id: 'points',
        label: 'Poin',
        flex: 0.7,
        render: (row: KolamKpiLeaderboardRow) => (
          <Text style={styles.cellText}>{formatKolamKpiPoints(row.points)}</Text>
        ),
      },
    ],
    [onRouteChange],
  );

  const breakdownColumns = useMemo(
    () => [
      {
        id: 'rule',
        label: 'Rule',
        flex: 1.4,
        render: (row: {ruleKey: string; points: number; count: number}) => (
          <Text style={styles.cellText}>{row.ruleKey}</Text>
        ),
      },
      {
        id: 'events',
        label: 'Event',
        flex: 0.7,
        render: (row: {ruleKey: string; points: number; count: number}) => (
          <Text style={styles.meta}>{formatKolamKpiPoints(row.count)}</Text>
        ),
      },
      {
        id: 'points',
        label: 'Poin',
        flex: 0.7,
        render: (row: {ruleKey: string; points: number; count: number}) => (
          <Text style={styles.cellText}>{formatKolamKpiPoints(row.points)}</Text>
        ),
      },
    ],
    [],
  );

  if (!canView) {
    return (
      <Text style={styles.meta}>
        Gagal memuat data KPI tim. Periksa izin user:view_by_admin lalu refresh
        halaman.
      </Text>
    );
  }

  if (controller.pluginLoading) {
    return <Text style={styles.meta}>Memuat…</Text>;
  }

  if (!controller.pluginEnabled) {
    return <Text style={styles.meta}>{KOLAM_KPI_PLUGIN_DISABLED}</Text>;
  }

  return (
    <View style={styles.root}>
      <View style={styles.toolbarWrap}>
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters}>
              {KOLAM_KPI_PERIOD_OPTIONS.map(option => (
                <KolamButton
                  intent={
                    controller.periodView === option.id ? 'primary' : 'outline'
                  }
                  key={option.id}
                  label={option.label}
                  onPress={() => controller.setPeriodView(option.id)}
                  size="sm"
                />
              ))}
            </View>
            <View style={kolamTableToolbarStyles.actions}>
              <KolamRefreshButton
                accessibilityLabel="Muat ulang"
                disabled={controller.loading || controller.chartsLoading}
                onPress={() => {
                  void controller.onRefresh();
                }}
                size="sm"
              />
            </View>
          </View>
        </View>
      </View>

      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={4}
        />
      ) : null}

      {controller.showWeekEmptyHint ? (
        <View style={styles.hintBanner}>
          <Text style={styles.hintText}>
            Minggu baru ({controller.currentWeekKey}) belum ada poin KPI.
          </Text>
          <KolamButton
            intent="outline"
            label="Lihat minggu lalu"
            onPress={() => controller.setPeriodView('prev_week')}
            size="sm"
          />
          <Text style={styles.hintText}>atau pilih Bulan ini.</Text>
        </View>
      ) : null}

      {controller.cards.length > 0 ? (
        <KolamStatsCardStrip cards={controller.cards} />
      ) : null}

      {controller.summary?.topPerformer ? (
        <View style={styles.topRow}>
          <KolamStatusBadge intent="secondary" label="Top performer" />
          <Text style={styles.meta}>
            #{controller.summary.topPerformer.rank}{' '}
            {kolamKpiLeaderboardRowLabel(controller.summary.topPerformer)} —{' '}
            <Text style={styles.cellText}>
              {formatKolamKpiPoints(controller.summary.topPerformer.points)}
            </Text>{' '}
            poin
          </Text>
        </View>
      ) : null}

      <KolamCardFrame style={styles.card}>
        <Text style={styles.sectionTitle}>Leaderboard tim</Text>
        {controller.leaderboard?.periodKey ? (
          <Text style={styles.meta}>{controller.leaderboard.periodKey}</Text>
        ) : null}
        <KolamListTableComposition
          columns={leaderboardColumns}
          emptyTitle={
            controller.leaderboard
              ? `Belum ada poin pada periode ${controller.leaderboard.periodKey}.`
              : 'Tidak ada data.'
          }
          getRowKey={row => row.userId}
          loading={controller.loading}
          rows={controller.leaderboard?.rows ?? []}
          showFooter={false}
        />
        {controller.periodView === 'week' &&
        (controller.leaderboard?.rows.length ?? 0) === 0 &&
        !controller.loading ? (
          <KolamButton
            intent="outline"
            label="Coba minggu lalu"
            onPress={() => controller.setPeriodView('prev_week')}
            size="sm"
          />
        ) : null}
      </KolamCardFrame>

      <KolamCardFrame style={styles.card}>
        <Text style={styles.sectionTitle}>Tren poin tim</Text>
        <View style={styles.granularityRow}>
          {KOLAM_KPI_GRANULARITY_OPTIONS.map(option => (
            <KolamButton
              intent={
                controller.granularity === option.id ? 'primary' : 'outline'
              }
              key={option.id}
              label={option.label}
              onPress={() => controller.setGranularity(option.id)}
              size="sm"
            />
          ))}
        </View>
        {controller.chartsError ? (
          <Text style={styles.dangerText}>{controller.chartsError}</Text>
        ) : controller.chartsLoading && !controller.charts ? (
          <Text style={styles.meta}>Memuat…</Text>
        ) : (
          <KpiTeamLineChart series={controller.charts?.series ?? []} />
        )}
      </KolamCardFrame>

      <KolamCardFrame style={styles.card}>
        <Text style={styles.sectionTitle}>Breakdown aturan (tim)</Text>
        {controller.charts ? (
          <Text style={styles.meta}>
            Total {formatKolamKpiPoints(controller.charts.totalPoints)} poin
          </Text>
        ) : null}
        <KolamListTableComposition
          columns={breakdownColumns}
          emptyTitle="Belum ada event KPI pada periode ini."
          getRowKey={(row, index) => `${row.ruleKey}-${index}`}
          loading={controller.chartsLoading}
          rows={controller.charts?.breakdown ?? []}
          showFooter={false}
        />
      </KolamCardFrame>
    </View>
  );
}

function KpiTeamLineChart({
  series,
}: {
  series: Array<{label: string; points: number}>;
}) {
  if (series.length === 0) {
    return <Text style={styles.meta}>Tidak ada data.</Text>;
  }

  const width = 100;
  const height = 40;
  const pad = 4;
  const values = series.map(item => item.points);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const coords = series.map((item, index) => {
    const x =
      series.length === 1
        ? width / 2
        : (index / (series.length - 1)) * width;
    const y = height - pad - ((item.points - min) / span) * (height - pad * 2);
    return {x, y, label: item.label, points: item.points};
  });
  const line = coords.map(point => `${point.x},${point.y}`).join(' ');

  return (
    <View style={styles.chartWrap}>
      <Svg
        accessibilityLabel="Grafik tren poin tim"
        height={144}
        viewBox={`0 0 ${width} ${height}`}
        width="100%">
        <Polyline
          fill="none"
          points={line}
          stroke={V.colors.primary}
          strokeWidth="0.6"
        />
        {coords.map(point => (
          <Circle
            cx={point.x}
            cy={point.y}
            fill={V.colors.primary}
            key={point.label}
            r="0.9"
          />
        ))}
      </Svg>
      <View style={styles.chartLabels}>
        {series.map(item => (
          <Text key={item.label} numberOfLines={1} style={styles.chartLabel}>
            {item.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    gap: 12,
    minHeight: 0,
  },
  card: {
    gap: 8,
  },
  toolbarWrap: {
    elevation: 1000,
    flexShrink: 0,
    overflow: 'visible',
    position: 'relative',
    zIndex: 100000,
  },
  hintBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 12,
  },
  hintText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    lineHeight: 18,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  granularityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  chartWrap: {
    gap: 4,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartLabel: {
    color: V.colors.mutedFg,
    flex: 1,
    fontFamily: V.fontFamily,
    fontSize: 8,
  },
  cellText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  meta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
  dangerText: {
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  linkText: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});
