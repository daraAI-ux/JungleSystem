import type {ReactNode} from 'react';
import type {AppModule, ShellModule} from '../domain/app-shell';
import type {KolamDashboardSectionsController} from '../hooks/use-kolam-dashboard-sections-controller';
import type {DashboardCustomerVisitConfirmation} from '../domain/dashboard-customer-visit-confirmations';
import type {DashboardSalesGraphRange} from '../domain/dashboard-sales-graph';
import type {CommandEntry} from '../domain/command-index';
import {
  getPluginIntegrationStats,
  getPluginRouteIndex,
  getUnifiedOverviewMetrics,
  pluginRegistry,
  type PluginDescriptor,
  type PluginRouteEntry,
  type UnifiedSurface,
} from '../domain/unified';
import type {UnifiedDataset} from '../services/unified-data';

export interface KolamUnifiedOverviewPanelProps {
  module: ShellModule;
  dataset: UnifiedDataset;
  plugins?: PluginDescriptor[];
  pluginSearch?: string;
  onCustomerVisitConfirm?: (row: DashboardCustomerVisitConfirmation) => void;
  onDashboardRoute?: (route: string) => void;
  onCommandSelect?: (command: CommandEntry) => void;
  onSalesGraphRangeSelect?: (range: DashboardSalesGraphRange) => void;
  onPluginSearchChange?: (query: string) => void;
  onPluginRouteSelect?: (route: PluginRouteEntry) => void;
  onSurfaceSelect?: (surface: UnifiedSurface) => void;
  onSelectModule?: (module: AppModule) => void;
  salesGraphRange?: DashboardSalesGraphRange;
}

export interface KolamUnifiedOverviewContext {
  amSummary: NonNullable<UnifiedDataset['am']['dashboard']>['summary'] | undefined;
  dataset: UnifiedDataset;
  metrics: ReturnType<typeof getUnifiedOverviewMetrics>;
  module: ShellModule;
  pluginRouteIndex: ReturnType<typeof getPluginRouteIndex>;
  plugins: PluginDescriptor[];
  pluginStats: ReturnType<typeof getPluginIntegrationStats>;
  totalPluginCount: number;
}

export interface KolamUnifiedModulePanelProps {
  context: KolamUnifiedOverviewContext;
  pluginSearch: string;
  onPluginSearchChange?: (query: string) => void;
  onPluginRouteSelect?: (route: PluginRouteEntry) => void;
  onSurfaceSelect?: (surface: UnifiedSurface) => void;
  surfaces: UnifiedSurface[];
}

export interface KolamUnifiedDashboardLayoutSectionProps {
  dashboardSections: KolamDashboardSectionsController;
  modulePanel: ReactNode;
  onDashboardRoute?: (route: string) => void;
  onSalesGraphRangeSelect?: (range: DashboardSalesGraphRange) => void;
}

export interface KolamUnifiedDashboardCountSectionProps {
  dashboardSections: KolamDashboardSectionsController;
  onDashboardRoute?: (route: string) => void;
}

export interface KolamUnifiedMetricsSectionProps {
  context: KolamUnifiedOverviewContext;
  dashboardSections: KolamDashboardSectionsController;
}

export function getUnifiedOverviewContext({
  dataset,
  module,
  plugins,
}: {
  dataset: UnifiedDataset;
  module: ShellModule;
  plugins: PluginDescriptor[];
}): KolamUnifiedOverviewContext {
  return {
    amSummary: dataset.am.dashboard?.summary,
    dataset,
    metrics: getUnifiedOverviewMetrics(dataset),
    module,
    pluginRouteIndex: getPluginRouteIndex(plugins),
    plugins,
    pluginStats: getPluginIntegrationStats(plugins),
    totalPluginCount: pluginRegistry.length,
  };
}


