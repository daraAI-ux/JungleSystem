import React from 'react';
import type {
  DashboardSalesGraph,
  DashboardSalesGraphRange,
} from '../domain/dashboard-sales-graph';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamDashboardSalesGraphEmptyState} from './kolam-dashboard-sales-graph-empty-state';
import {KolamDashboardSalesGraphHeader} from './kolam-dashboard-sales-graph-header';
import {KolamDashboardSalesGraphPlot} from './kolam-dashboard-sales-graph-plot';

export function KolamDashboardSalesGraphCard({
  graph,
  onRangeSelect,
}: {
  graph: DashboardSalesGraph;
  onRangeSelect?: (range: DashboardSalesGraphRange) => void;
}) {
  return (
    <KolamCardFrame variant="dashboardSalesGraph">
      <KolamDashboardSalesGraphHeader
        graph={graph}
        onRangeSelect={onRangeSelect}
      />
      {graph.points.length ? (
        <KolamDashboardSalesGraphPlot points={graph.points} />
      ) : (
        <KolamDashboardSalesGraphEmptyState />
      )}
    </KolamCardFrame>
  );
}
