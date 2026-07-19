import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamContentFrame} from './kolam-content-frame';
import {KolamDashboardSalesGraphEmptyIcon} from './kolam-dashboard-sales-graph-empty-icon';
import {DASHBOARD_SALES_GRAPH_VISUAL} from './kolam-dashboard-sales-graph-visual';

export function KolamDashboardSalesGraphEmptyState() {
  return (
    <KolamContentFrame variant="dashboardSalesGraphEmpty">
      {DASHBOARD_SALES_GRAPH_VISUAL.emptyState.iconVisible ? (
        <KolamDashboardSalesGraphEmptyIcon />
      ) : null}
      <KolamCopyStack
        items={[
          {
            id: 'title',
            text: DASHBOARD_SALES_GRAPH_VISUAL.emptyState.title,
            style: styles.salesGraphEmptyTitle,
          },
          ...(DASHBOARD_SALES_GRAPH_VISUAL.emptyState.description
            ? [
                {
                  id: 'description',
                  text: DASHBOARD_SALES_GRAPH_VISUAL.emptyState.description,
                  style: styles.salesGraphEmptyText,
                },
              ]
            : []),
        ]}
      />
    </KolamContentFrame>
  );
}

const styles = StyleSheet.create({
  salesGraphEmptyTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: DASHBOARD_SALES_GRAPH_VISUAL.emptyState.titleFontSize,
    fontWeight: '800',
  },
  salesGraphEmptyText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: DASHBOARD_SALES_GRAPH_VISUAL.emptyState.descriptionFontSize,
  },
});
