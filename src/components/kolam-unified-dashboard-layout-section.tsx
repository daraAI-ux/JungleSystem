import React from 'react';
import {
  KolamDashboardPendingOrders,
  KolamDashboardRightRail,
  KolamDashboardSalesGraphCard,
} from './kolam-dashboard-widgets';
import {KolamListFrame} from './kolam-list-frame';
import {KolamShellFrame} from './kolam-shell-frame';
import type {KolamUnifiedDashboardLayoutSectionProps} from './kolam-unified-overview-panel-types';

export function KolamUnifiedDashboardLayoutSection({
  dashboardSections,
  modulePanel,
  onDashboardRoute,
  onSalesGraphRangeSelect,
}: KolamUnifiedDashboardLayoutSectionProps) {
  if (!dashboardSections.isKolamDashboard) {
    return <>{modulePanel}</>;
  }

  if (
    !dashboardSections.salesGraph ||
    !dashboardSections.pendingOrdersPanel ||
    !dashboardSections.pendingOrdersDescriptor
  ) {
    return null;
  }

  return (
    <KolamShellFrame variant="dashboardLayout">
      <KolamDashboardRightRail
        onOpenRoute={onDashboardRoute}
        sections={dashboardSections.railSections}
      />
      <KolamShellFrame variant="dashboardMain">
        <KolamListFrame variant="operationalStack">
          <KolamDashboardSalesGraphCard
            graph={dashboardSections.salesGraph}
            onRangeSelect={onSalesGraphRangeSelect}
          />
          <KolamDashboardPendingOrders
            descriptor={dashboardSections.pendingOrdersDescriptor}
            onOpenRoute={onDashboardRoute}
            panel={dashboardSections.pendingOrdersPanel}
          />
        </KolamListFrame>
      </KolamShellFrame>
    </KolamShellFrame>
  );
}
