import React from 'react';
import {pluginRegistry} from '../domain/unified';
import {useKolamOverviewController} from '../hooks/use-kolam-overview-controller';
import {type KolamUnifiedOverviewPanelProps} from './kolam-unified-overview-panel-types';
import {KolamUnifiedDashboardCountSection} from './kolam-unified-dashboard-count-section';
import {KolamUnifiedDashboardLayoutSection} from './kolam-unified-dashboard-layout-section';
import {KolamUnifiedMetricsSection} from './kolam-unified-metrics-section';
import {KolamUnifiedModulePanel} from './kolam-unified-module-panel';
import {KolamUnifiedRuntimeFooter} from './kolam-unified-source-widgets';

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
      <KolamUnifiedMetricsSection
        context={context}
        dashboardSections={dashboardSections}
      />
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


