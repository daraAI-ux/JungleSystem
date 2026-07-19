import React from 'react';
import {pluginRegistry} from '../domain/unified';
import {useKolamOverviewController} from '../hooks/use-kolam-overview-controller';
import {type KolamUnifiedOverviewPanelProps} from './kolam-unified-overview-panel-types';
import {KolamDashboardCustomerVisitConfirmations} from './kolam-dashboard-widgets';
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
  onCustomerVisitConfirm,
  onDashboardRoute,
  onPluginSearchChange,
  onPluginRouteSelect,
  onSalesGraphRangeSelect,
  onSurfaceSelect,
  salesGraphRange,
}: KolamUnifiedOverviewPanelProps) {
  const {
    context,
    customerVisitPanel,
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
      <KolamUnifiedMetricsSection
        context={context}
        dashboardSections={dashboardSections}
      />
      {customerVisitPanel.isVisible ? (
        <KolamDashboardCustomerVisitConfirmations
          descriptor={customerVisitPanel.descriptor}
          onConfirm={onCustomerVisitConfirm}
          rows={customerVisitPanel.rows}
        />
      ) : null}
      <KolamUnifiedDashboardCountSection
        dashboardSections={dashboardSections}
        onDashboardRoute={onDashboardRoute}
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


