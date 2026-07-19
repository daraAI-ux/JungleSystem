import React from 'react';
import type {DashboardPendingOrdersDescriptor} from '../domain/dashboard-pending-orders';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamDashboardPendingOrdersClockIcon} from './kolam-dashboard-pending-orders-clock-icon';
import {KolamHeaderFrame} from './kolam-header-frame';
import {pendingOrdersStyles as styles} from './kolam-dashboard-pending-orders-styles';

export function KolamDashboardPendingOrdersTitleRow({
  descriptor,
}: {
  descriptor: DashboardPendingOrdersDescriptor;
}) {
  return (
    <KolamHeaderFrame variant="pendingOrdersTitleRow">
      <KolamDashboardPendingOrdersClockIcon />
      <KolamCopyStack
        items={[
          {
            id: 'title',
            text: descriptor.title,
            style: styles.pendingOrdersTitle,
          },
        ]}
      />
    </KolamHeaderFrame>
  );
}
