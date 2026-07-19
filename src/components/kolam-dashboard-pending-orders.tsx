import React from 'react';
import type {
  DashboardPendingOrdersDescriptor,
  DashboardPendingOrdersPanel,
} from '../domain/dashboard-pending-orders';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamDashboardPendingOrdersGrid} from './kolam-dashboard-pending-orders-grid';
import {KolamDashboardPendingOrdersHeader} from './kolam-dashboard-pending-orders-header';

export function KolamDashboardPendingOrders({
  descriptor,
  onOpenRoute,
  panel,
}: {
  descriptor: DashboardPendingOrdersDescriptor;
  onOpenRoute?: (route: string) => void;
  panel: DashboardPendingOrdersPanel;
}) {
  return (
    <KolamCardFrame variant="dashboardPendingOrders">
      <KolamDashboardPendingOrdersHeader
        description={panel.description}
        descriptor={descriptor}
        onOpenRoute={onOpenRoute}
      />
      <KolamDashboardPendingOrdersGrid
        onOpenRoute={onOpenRoute}
        panel={panel}
      />
    </KolamCardFrame>
  );
}
