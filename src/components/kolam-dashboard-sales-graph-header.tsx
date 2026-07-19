import React from 'react';
import {StyleSheet} from 'react-native';
import type {
  DashboardSalesGraph,
  DashboardSalesGraphRange,
} from '../domain/dashboard-sales-graph';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamDashboardSalesGraphRangeTrigger} from './kolam-dashboard-sales-graph-range-trigger';
import {KolamDashboardSalesGraphTitleIcon} from './kolam-dashboard-sales-graph-title-icon';
import {DASHBOARD_SALES_GRAPH_VISUAL} from './kolam-dashboard-sales-graph-visual';
import {KolamHeaderFrame} from './kolam-header-frame';

export function KolamDashboardSalesGraphHeader({
  graph,
  onRangeSelect,
}: {
  graph: DashboardSalesGraph;
  onRangeSelect?: (range: DashboardSalesGraphRange) => void;
}) {
  return (
    <KolamHeaderFrame variant="salesGraph">
      <KolamHeaderFrame variant="salesGraphSummaryColumn">
        <KolamHeaderFrame variant="salesGraphTitleRow">
          {DASHBOARD_SALES_GRAPH_VISUAL.titleIcon.visibleInHeader ? (
            <KolamDashboardSalesGraphTitleIcon />
          ) : null}
          <KolamCopyStack
            items={[
              {id: 'title', text: graph.title, style: styles.salesGraphTitle},
            ]}
          />
        </KolamHeaderFrame>
        <KolamHeaderFrame variant="salesGraphDescriptionRow">
          <KolamCopyStack
            items={[
              {
                id: 'description',
                text: graph.description,
                style: styles.salesGraphDescription,
              },
              {
                id: 'total',
                text: graph.totalLabel,
                style: [styles.salesGraphDescription, styles.salesGraphTotal],
              },
              {
                id: 'range-hint',
                text: graph.rangeHint,
                style: [
                  styles.salesGraphDescription,
                  styles.salesGraphRangeHint,
                ],
              },
            ]}
          />
        </KolamHeaderFrame>
      </KolamHeaderFrame>
      <KolamDashboardSalesGraphRangeTrigger
        label={graph.rangeLabel}
        onSelect={onRangeSelect}
        options={graph.rangeOptions}
        selectedId={graph.selectedRangeId}
      />
    </KolamHeaderFrame>
  );
}

const styles = StyleSheet.create({
  salesGraphTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: DASHBOARD_SALES_GRAPH_VISUAL.header.titleFontSize,
    fontWeight: '800',
  },
  salesGraphDescription: {
    marginTop: DASHBOARD_SALES_GRAPH_VISUAL.header.descriptionGapY,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: DASHBOARD_SALES_GRAPH_VISUAL.header.descriptionFontSize,
  },
  salesGraphTotal: {
    color: V.colors[DASHBOARD_SALES_GRAPH_VISUAL.header.totalColor],
    fontSize: DASHBOARD_SALES_GRAPH_VISUAL.header.totalFontSize,
    fontWeight: '800',
  },
  salesGraphRangeHint: {
    marginTop: DASHBOARD_SALES_GRAPH_VISUAL.header.rangeHintGapY,
  },
});
