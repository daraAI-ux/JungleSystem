import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
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
  style,
}: {
  graph: DashboardSalesGraph;
  onRangeSelect?: (range: DashboardSalesGraphRange) => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <KolamCardFrame style={style} variant="dashboardSalesGraph">
      <KolamDashboardSalesGraphHeader
        graph={graph}
        onRangeSelect={onRangeSelect}
      />
      {graph.points.length ? (
        <KolamDashboardSalesGraphPlot mode="line" points={graph.points} />
      ) : (
        <KolamDashboardSalesGraphEmptyState />
      )}
    </KolamCardFrame>
  );
}
