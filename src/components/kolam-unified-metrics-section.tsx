import React from 'react';
import {StyleSheet} from 'react-native';
import {getDashboardLayoutVisualContract} from '../domain/dashboard-layout';
import {formatRupiah} from '../lib/money';
import {KolamDashboardStatsStrip} from './kolam-dashboard-widgets';
import {KolamMetricCard} from './kolam-surface-widgets';
import {KolamListFrame} from './kolam-list-frame';
import type {KolamUnifiedMetricsSectionProps} from './kolam-unified-overview-panel-types';

const DASHBOARD_LAYOUT_VISUAL = getDashboardLayoutVisualContract();

export function KolamUnifiedMetricsSection({
  context,
  dashboardSections,
}: KolamUnifiedMetricsSectionProps) {
  const {amSummary, metrics, module, pluginRouteIndex, pluginStats} =
    context;

  if (module.id === 'kolam') {
    return (
      <KolamDashboardStatsStrip
        cards={dashboardSections.statCards}
        style={styles.berandaSectionGap}
      />
    );
  }

  return (
    <KolamListFrame variant="dashboardMetric">
      <KolamMetricCard
        label={module.id === 'plugins' ? 'Plugin tersedia' : 'Katalog aktif'}
        value={
          module.id === 'plugins'
            ? `${context.plugins.length}`
            : `${metrics.catalogCount}`
        }
      />
      <KolamMetricCard
        label={module.id === 'am' ? 'Device aktif' : 'Sales aktif'}
        value={
          module.id === 'am'
            ? `${amSummary?.activeDevices ?? 0}`
            : `${metrics.salesCount}`
        }
      />
      <KolamMetricCard
        label={
          module.id === 'plugins'
            ? 'Versi terdaftar'
            : 'Stok perlu perhatian'
        }
        value={
          module.id === 'plugins'
            ? `${pluginStats.ready}/${pluginStats.total} ready`
            : `${metrics.lowStockCount} item`
        }
        tone={
          module.id === 'plugins' && pluginStats.versionMismatch > 0
            ? 'warning'
            : module.id !== 'plugins' && metrics.lowStockCount > 0
              ? 'warning'
              : 'default'
        }
      />
      <KolamMetricCard
        label={
          module.id === 'am'
            ? 'Saldo AM'
            : module.id === 'plugins'
              ? 'Route plugin'
              : 'Cashflow'
        }
        value={
          module.id === 'am'
            ? formatRupiah(amSummary?.totalBalance ?? 0)
            : module.id === 'plugins'
              ? `${pluginRouteIndex.length} routes`
              : metrics.activeSession
                ? 'Open'
                : 'Closed'
        }
      />
    </KolamListFrame>
  );
}

const styles = StyleSheet.create({
  berandaSectionGap: {
    marginBottom: DASHBOARD_LAYOUT_VISUAL.main.gapY,
  },
});
