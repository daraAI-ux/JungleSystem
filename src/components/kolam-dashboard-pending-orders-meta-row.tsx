import React from 'react';
import type {DashboardPendingOrderRange} from '../domain/dashboard-pending-orders';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamDashboardPendingOrdersBadges} from './kolam-dashboard-pending-orders-badges';
import {KolamHeaderFrame} from './kolam-header-frame';
import {pendingOrdersStyles as styles} from './kolam-dashboard-pending-orders-styles';

export function KolamDashboardPendingOrdersMetaRow({
  range,
}: {
  range: DashboardPendingOrderRange;
}) {
  return (
    <KolamHeaderFrame variant="pendingOrdersMetaRow">
      <KolamCopyStack
        items={[
          {
            id: 'count',
            text: `${range.count} order${range.count === 1 ? '' : 's'}`,
            style: styles.pendingOrdersCount,
          },
        ]}
      />
      <KolamDashboardPendingOrdersBadges channels={range.channels} />
    </KolamHeaderFrame>
  );
}