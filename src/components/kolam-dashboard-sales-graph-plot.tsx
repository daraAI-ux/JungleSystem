import React from 'react';
import type {DashboardSalesGraphPoint} from '../domain/dashboard-sales-graph';
import {KolamContentFrame} from './kolam-content-frame';
import {KolamDashboardSalesGraphPoint} from './kolam-dashboard-sales-graph-point';
import {KolamMappedList} from './kolam-mapped-list';

export function KolamDashboardSalesGraphPlot({
  points,
}: {
  points: DashboardSalesGraphPoint[];
}) {
  return (
    <KolamContentFrame variant="dashboardSalesGraphPlot">
      <KolamMappedList
        items={points}
        getKey={point => point.id}
        renderItem={point => <KolamDashboardSalesGraphPoint point={point} />}
      />
    </KolamContentFrame>
  );
}
