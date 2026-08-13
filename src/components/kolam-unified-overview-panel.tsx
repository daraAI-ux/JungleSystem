import React from 'react';
import {pluginRegistry} from '../domain/unified';
import {StyleSheet, View} from 'react-native';
import {getDashboardLayoutVisualContract} from '../domain/dashboard-layout';
import {useKolamOverviewController} from '../hooks/use-kolam-overview-controller';
import {type KolamUnifiedOverviewPanelProps} from './kolam-unified-overview-panel-types';
import {
  KolamDashboardRightRail,
  KolamDashboardSalesGraphCard,
} from './kolam-dashboard-widgets';
import {KolamUnifiedDashboardCountSection} from './kolam-unified-dashboard-count-section';
import {KolamUnifiedDashboardLayoutSection} from './kolam-unified-dashboard-layout-section';
import {KolamUnifiedMetricsSection} from './kolam-unified-metrics-section';
import {KolamUnifiedModulePanel} from './kolam-unified-module-panel';
import {KolamUnifiedRuntimeFooter} from './kolam-unified-source-widgets';

const DASHBOARD_LAYOUT_VISUAL = getDashboardLayoutVisualContract();

export function KolamUnifiedOverviewPanel({
  module,
  dataset,
  plugins = pluginRegistry,
  pluginSearch = '',
  onDashboardRoute,
  onPluginSearchChange,
  onPluginRouteSelect,
  onSalesGraphRangeSelect,
  onSurfaceSelect,
  salesGraphRange,
}: KolamUnifiedOverviewPanelProps) {
  const {
    context,
    dashboardSections,
    showRuntimeFooter,
    surfaces,
  } = useKolamOverviewController({dataset, module, plugins, salesGraphRange});

  const modulePanel = dashboardSections.isKolamDashboard ? null : (
    <KolamUnifiedModulePanel
      context={context}
      pluginSearch={pluginSearch}
      onPluginSearchChange={onPluginSearchChange}
      onPluginRouteSelect={onPluginRouteSelect}
      onSurfaceSelect={onSurfaceSelect}
      surfaces={surfaces}
    />
  );

  return (
    <>
      <KolamUnifiedDashboardCountSection
        dashboardSections={dashboardSections}
        onDashboardRoute={onDashboardRoute}
      />
      {dashboardSections.isKolamDashboard && dashboardSections.salesGraph ? (
        <View style={styles.dashboardSalesSummarySection}>
          <View style={styles.dashboardSalesGraphPane}>
            <KolamDashboardSalesGraphCard
              graph={dashboardSections.salesGraph}
              onRangeSelect={onSalesGraphRangeSelect}
              style={styles.dashboardSalesGraphCard}
            />
          </View>
          <View style={styles.dashboardSalesRailPane}>
            <KolamDashboardRightRail
              cardStyle={styles.dashboardSalesRailCard}
              listStyle={styles.dashboardSalesRailList}
              onOpenRoute={onDashboardRoute}
              sections={dashboardSections.railSections}
            />
          </View>
        </View>
      ) : null}
      {dashboardSections.isKolamDashboard ? null : (
        <KolamUnifiedMetricsSection
          context={context}
          dashboardSections={dashboardSections}
        />
      )}
      <KolamUnifiedDashboardLayoutSection
        dashboardSections={dashboardSections}
        modulePanel={modulePanel}
        onDashboardRoute={onDashboardRoute}
        onSalesGraphRangeSelect={onSalesGraphRangeSelect}
      />
      {showRuntimeFooter ? <KolamUnifiedRuntimeFooter /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  dashboardSalesSummarySection: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DASHBOARD_LAYOUT_VISUAL.layout.gapY,
    marginBottom: DASHBOARD_LAYOUT_VISUAL.main.gapY,
  },
  dashboardSalesGraphPane: {
    flex: 3,
    minWidth: 520,
  },
  dashboardSalesGraphCard: {
    flex: 1,
  },
  dashboardSalesRailPane: {
    flex: 1,
    minWidth: 220,
  },
  dashboardSalesRailList: {
    flexDirection: 'column',
    flexWrap: 'nowrap',
    gap: DASHBOARD_LAYOUT_VISUAL.inventoryRail.gridGap,
    marginBottom: 0,
  },
  dashboardSalesRailCard: {
    flex: 0,
    flexBasis: 'auto',
    minWidth: 0,
    width: '100%',
  },
});

