import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import type {DashboardStatCard} from '../domain/dashboard-stats';
import {dashboardStatCardStyles as styles} from './kolam-dashboard-stat-card-styles';

export function KolamDashboardStatHeaderCopy({
  card,
}: {
  card: DashboardStatCard;
}) {
  return (
    <KolamCopyStack
      containerStyle={styles.dashboardStatHeaderCopy}
      items={[
        {id: 'label', text: card.label, style: styles.metricLabel},
        {
          id: 'value',
          text: card.value,
          style: [
            styles.metricValue,
            styles.dashboardStatValue,
          ],
        },
        {
          id: 'trend',
          text: card.changeLabel,
          style: styles.metricTrend,
        },
      ]}
    />
  );
}
