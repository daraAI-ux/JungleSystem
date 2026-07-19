import React from 'react';
import type {DashboardStatCard} from '../domain/dashboard-stats';
import {KolamDashboardStatHeaderCopy} from './kolam-dashboard-stat-header-copy';
import {KolamHeaderFrame} from './kolam-header-frame';

export function KolamDashboardStatCardHeader({
  card,
}: {
  card: DashboardStatCard;
}) {
  return (
    <KolamHeaderFrame variant="metricCard">
      <KolamDashboardStatHeaderCopy card={card} />
    </KolamHeaderFrame>
  );
}
