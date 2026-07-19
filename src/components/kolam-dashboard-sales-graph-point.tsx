import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {DashboardSalesGraphPoint} from '../domain/dashboard-sales-graph';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCopyStack} from './kolam-copy-stack';
import {DASHBOARD_SALES_GRAPH_VISUAL} from './kolam-dashboard-sales-graph-visual';
import {KolamInlineFrame} from './kolam-inline-frame';

export function KolamDashboardSalesGraphPoint({
  point,
}: {
  point: DashboardSalesGraphPoint;
}) {
  return (
    <KolamInlineFrame variant="dashboardSalesGraphPoint">
      <KolamCopyStack
        items={[
          {
            id: 'value',
            text: point.valueLabel,
            style: styles.salesGraphValue,
          },
        ]}
      />
      <KolamInlineFrame variant="dashboardSalesGraphAreaTrack">
        <View
          style={[
            styles.salesGraphAreaFill,
            {height: point.areaHeight},
          ]}
        />
        <View
          style={[
            styles.salesGraphLineDot,
            {top: point.lineOffsetTop},
          ]}
        />
      </KolamInlineFrame>
      <KolamCopyStack
        items={[{id: 'label', text: point.label, style: styles.salesGraphLabel}]}
      />
    </KolamInlineFrame>
  );
}

const styles = StyleSheet.create({
  salesGraphValue: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: DASHBOARD_SALES_GRAPH_VISUAL.point.valueFontSize,
    fontWeight: '700',
  },
  salesGraphAreaFill: {
    width: '100%',
    borderTopLeftRadius: V.radius.lg,
    borderTopRightRadius: V.radius.lg,
    backgroundColor: V.colors.successSoft,
    borderTopColor: V.colors.success,
    borderTopWidth: DASHBOARD_SALES_GRAPH_VISUAL.point.fillBorderTopWidth,
  },
  salesGraphLineDot: {
    position: 'absolute',
    width: DASHBOARD_SALES_GRAPH_VISUAL.point.dotSize,
    height: DASHBOARD_SALES_GRAPH_VISUAL.point.dotSize,
    marginTop: -DASHBOARD_SALES_GRAPH_VISUAL.point.dotSize / 2,
    borderRadius: DASHBOARD_SALES_GRAPH_VISUAL.point.dotSize / 2,
    backgroundColor: V.colors.primary,
    borderColor: V.colors.bg,
    borderWidth: DASHBOARD_SALES_GRAPH_VISUAL.point.dotBorderWidth,
  },
  salesGraphLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: DASHBOARD_SALES_GRAPH_VISUAL.point.labelFontSize,
    fontWeight: '700',
  },
});
