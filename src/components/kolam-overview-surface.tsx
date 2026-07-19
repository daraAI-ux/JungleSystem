import React from 'react';
import {getShellModule, type AppModule} from '../domain/app-shell';
import type {CommandEntry} from '../domain/command-index';
import type {UnifiedSurface} from '../domain/unified';
import type {DashboardCustomerVisitConfirmation} from '../domain/dashboard-customer-visit-confirmations';
import type {DashboardSalesGraphRange} from '../domain/dashboard-sales-graph';
import type {KolamOverviewDataset} from './kolam-workspace-module-surface-types';
import {KolamUnifiedOverviewPanel} from './kolam-unified-overview-widgets';

export function KolamOverviewSurface({
  dataset,
  moduleId,
  onCustomerVisitConfirm,
  onCommandSelect,
  onDashboardRoute,
  onSelectModule,
  onSurfaceSelect,
  onSalesGraphRangeSelect,
  salesGraphRange,
}: {
  dataset: KolamOverviewDataset;
  moduleId: 'kolam' | 'am';
  onCustomerVisitConfirm?: (row: DashboardCustomerVisitConfirmation) => void;
  onCommandSelect?: (command: CommandEntry) => void;
  onDashboardRoute?: (route: string) => void;
  onSelectModule?: (module: AppModule) => void;
  onSurfaceSelect?: (surface: UnifiedSurface) => void;
  onSalesGraphRangeSelect?: (range: DashboardSalesGraphRange) => void;
  salesGraphRange?: DashboardSalesGraphRange;
}) {
  return (
    <KolamUnifiedOverviewPanel
      module={getShellModule(moduleId)}
      dataset={dataset}
      onCustomerVisitConfirm={onCustomerVisitConfirm}
      onCommandSelect={onCommandSelect}
      onDashboardRoute={onDashboardRoute}
      onSelectModule={onSelectModule}
      onSurfaceSelect={onSurfaceSelect}
      onSalesGraphRangeSelect={onSalesGraphRangeSelect}
      salesGraphRange={salesGraphRange}
    />
  );
}

