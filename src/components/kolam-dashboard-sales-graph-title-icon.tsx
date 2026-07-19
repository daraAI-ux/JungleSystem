import React from 'react';
import {StyleSheet, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {DASHBOARD_SALES_GRAPH_VISUAL} from './kolam-dashboard-sales-graph-visual';

export function KolamDashboardSalesGraphTitleIcon() {
  return (
    <View style={styles.salesGraphTitleIcon}>
      <View style={styles.salesGraphTitleIconAxis} />
      <View style={styles.salesGraphTitleIconLineOne} />
      <View style={styles.salesGraphTitleIconLineTwo} />
    </View>
  );
}

const styles = StyleSheet.create({
  salesGraphTitleIcon: {
    width: DASHBOARD_SALES_GRAPH_VISUAL.header.iconSize,
    height: DASHBOARD_SALES_GRAPH_VISUAL.header.iconSize,
    borderLeftColor: V.colors.primary,
    borderBottomColor: V.colors.primary,
    borderLeftWidth: DASHBOARD_SALES_GRAPH_VISUAL.titleIcon.axisBorderWidth,
    borderBottomWidth: DASHBOARD_SALES_GRAPH_VISUAL.titleIcon.axisBorderWidth,
  },
  salesGraphTitleIconAxis: {
    position: 'absolute',
    left: DASHBOARD_SALES_GRAPH_VISUAL.titleIcon.axisLeft,
    bottom: DASHBOARD_SALES_GRAPH_VISUAL.titleIcon.axisBottom,
    width: DASHBOARD_SALES_GRAPH_VISUAL.titleIcon.axisWidth,
    height: DASHBOARD_SALES_GRAPH_VISUAL.titleIcon.axisHeight,
    borderRadius: DASHBOARD_SALES_GRAPH_VISUAL.titleIcon.lineRadius,
    backgroundColor: V.colors.primary,
    transform: [{rotate: DASHBOARD_SALES_GRAPH_VISUAL.titleIcon.axisRotation}],
  },
  salesGraphTitleIconLineOne: {
    position: 'absolute',
    right: DASHBOARD_SALES_GRAPH_VISUAL.titleIcon.lineOneRight,
    top: DASHBOARD_SALES_GRAPH_VISUAL.titleIcon.lineOneTop,
    width: DASHBOARD_SALES_GRAPH_VISUAL.titleIcon.lineOneWidth,
    height: DASHBOARD_SALES_GRAPH_VISUAL.titleIcon.lineOneHeight,
    borderRadius: DASHBOARD_SALES_GRAPH_VISUAL.titleIcon.lineRadius,
    backgroundColor: V.colors.primary,
    transform: [
      {rotate: DASHBOARD_SALES_GRAPH_VISUAL.titleIcon.lineOneRotation},
    ],
  },
  salesGraphTitleIconLineTwo: {
    position: 'absolute',
    right: DASHBOARD_SALES_GRAPH_VISUAL.titleIcon.lineTwoRight,
    top: DASHBOARD_SALES_GRAPH_VISUAL.titleIcon.lineTwoTop,
    width: DASHBOARD_SALES_GRAPH_VISUAL.titleIcon.lineTwoWidth,
    height: DASHBOARD_SALES_GRAPH_VISUAL.titleIcon.lineTwoHeight,
    borderRadius: DASHBOARD_SALES_GRAPH_VISUAL.titleIcon.lineRadius,
    backgroundColor: V.colors.primary,
  },
});
