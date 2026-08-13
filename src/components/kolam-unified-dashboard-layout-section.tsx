import React from 'react';
import {
  KolamDashboardPendingOrders,
  KolamDashboardRightRail,
} from './kolam-dashboard-widgets';
import {KolamListFrame} from './kolam-list-frame';
import {KolamShellFrame} from './kolam-shell-frame';
import type {KolamUnifiedDashboardLayoutSectionProps} from './kolam-unified-overview-panel-types';

export function KolamUnifiedDashboardLayoutSection({
  dashboardSections,
  modulePanel,
  onDashboardRoute,
}: KolamUnifiedDashboardLayoutSectionProps) {
  if (!dashboardSections.isKolamDashboard) {
    return <>{modulePanel}</>;
  }

  if (
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
