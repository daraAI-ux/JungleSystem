import React from 'react';
import {StyleSheet, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {DASHBOARD_SALES_GRAPH_VISUAL} from './kolam-dashboard-sales-graph-visual';

export function KolamDashboardSalesGraphEmptyIcon() {
  return (
    <View style={styles.salesGraphEmptyIcon}>
      <View style={styles.salesGraphEmptyIconLineOne} />
      <View style={styles.salesGraphEmptyIconLineTwo} />
    </View>
  );
}

const styles = StyleSheet.create({
  salesGraphEmptyIcon: {
    width: DASHBOARD_SALES_GRAPH_VISUAL.emptyIcon.size,
    height: DASHBOARD_SALES_GRAPH_VISUAL.emptyIcon.size,
    marginBottom: DASHBOARD_SALES_GRAPH_VISUAL.emptyIcon.marginBottom,
    borderRadius: DASHBOARD_SALES_GRAPH_VISUAL.emptyIcon.radius,
    borderColor: V.colors.border,
    borderWidth: DASHBOARD_SALES_GRAPH_VISUAL.emptyIcon.borderWidth,
    backgroundColor: V.colors.muted,
  },
  salesGraphEmptyIconLineOne: {
    position: 'absolute',
    left: DASHBOARD_SALES_GRAPH_VISUAL.emptyIcon.lineOneLeft,
    bottom: DASHBOARD_SALES_GRAPH_VISUAL.emptyIcon.lineOneBottom,
    width: DASHBOARD_SALES_GRAPH_VISUAL.emptyIcon.lineOneWidth,
    height: DASHBOARD_SALES_GRAPH_VISUAL.emptyIcon.lineOneHeight,
    borderRadius: DASHBOARD_SALES_GRAPH_VISUAL.emptyIcon.lineRadius,
    backgroundColor: V.colors.mutedFg,
    transform: [
      {rotate: DASHBOARD_SALES_GRAPH_VISUAL.emptyIcon.lineOneRotation},
    ],
  },
  salesGraphEmptyIconLineTwo: {
    position: 'absolute',
    right: DASHBOARD_SALES_GRAPH_VISUAL.emptyIcon.lineTwoRight,
    top: DASHBOARD_SALES_GRAPH_VISUAL.emptyIcon.lineTwoTop,
    width: DASHBOARD_SALES_GRAPH_VISUAL.emptyIcon.lineTwoWidth,
    height: DASHBOARD_SALES_GRAPH_VISUAL.emptyIcon.lineTwoHeight,
    borderRadius: DASHBOARD_SALES_GRAPH_VISUAL.emptyIcon.lineRadius,
    backgroundColor: V.colors.mutedFg,
  },
});
