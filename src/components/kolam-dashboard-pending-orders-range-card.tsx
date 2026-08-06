import React from 'react';
import type {DashboardPendingOrderRange} from '../domain/dashboard-pending-orders';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamDashboardPendingOrdersMetaRow} from './kolam-dashboard-pending-orders-meta-row';
import {pendingOrdersStyles as styles} from './kolam-dashboard-pending-orders-styles';

export function KolamDashboardPendingOrdersRangeCard({
  range,
}: {
  range: DashboardPendingOrderRange;
}) {
  return (
    <KolamCardFrame variant="dashboardPendingOrdersRange">
      <KolamCopyStack
        items={[
          {
            id: 'label',
            text: range.label,
            style: styles.pendingOrdersRangeLabel,
          },
          {id: 'value', text: range.value, style: styles.pendingOrdersValue},
        ]}
      />
      <KolamDashboardPendingOrdersMetaRow range={range} />
    </KolamCardFrame>
  );
}