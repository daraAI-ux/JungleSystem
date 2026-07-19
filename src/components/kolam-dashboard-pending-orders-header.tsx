import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import type {DashboardPendingOrdersDescriptor} from '../domain/dashboard-pending-orders';
import {KolamDashboardPendingOrdersActionLink} from './kolam-dashboard-pending-orders-action-link';
import {KolamDashboardPendingOrdersTitleRow} from './kolam-dashboard-pending-orders-title-row';
import {KolamHeaderFrame} from './kolam-header-frame';
import {pendingOrdersStyles as styles} from './kolam-dashboard-pending-orders-styles';

export function KolamDashboardPendingOrdersHeader({
  description,
  descriptor,
  onOpenRoute,
}: {
  description: string;
  descriptor: DashboardPendingOrdersDescriptor;
  onOpenRoute?: (route: string) => void;
}) {
  return (
    <KolamHeaderFrame variant="pendingOrders">
      <>
        <KolamDashboardPendingOrdersTitleRow descriptor={descriptor} />
        <KolamCopyStack
          items={[
            {
              id: 'description',
              text: description,
              style: styles.pendingOrdersDescription,
            },
          ]}
        />
      </>
      <KolamDashboardPendingOrdersActionLink
        descriptor={descriptor}
        onOpenRoute={onOpenRoute}
      />
    </KolamHeaderFrame>
  );
}
