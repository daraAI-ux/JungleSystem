import React from 'react';
import {StyleSheet} from 'react-native';
import type {
  DashboardSalesGraphRange,
  DashboardSalesGraphRangeOption,
} from '../domain/dashboard-sales-graph';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamChoiceSegmentGroup} from './kolam-choice-segment-group';
import {DASHBOARD_SALES_GRAPH_VISUAL} from './kolam-dashboard-sales-graph-visual';

export function KolamDashboardSalesGraphRangeTrigger({
  label,
  onSelect,
  options,
  selectedId,
}: {
  label: string;
  onSelect?: (optionId: DashboardSalesGraphRange) => void;
  options?: DashboardSalesGraphRangeOption[];
  selectedId?: DashboardSalesGraphRange;
}) {
  const rangeOptions = options?.length
    ? options
    : [{id: selectedId ?? 'month', label}];

  return (
    <KolamChoiceSegmentGroup
      options={rangeOptions}
      selectedId={selectedId ?? rangeOptions[0].id}
      onSelect={onSelect ?? (() => undefined)}
      style={styles.salesGraphRangeTabs}
      variant="range"
    />
  );
}

const styles = StyleSheet.create({
  salesGraphRangeTabs: {
    alignSelf: DASHBOARD_SALES_GRAPH_VISUAL.rangeTrigger.alignSelf,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DASHBOARD_SALES_GRAPH_VISUAL.rangeTrigger.gap,
    paddingHorizontal: DASHBOARD_SALES_GRAPH_VISUAL.rangeTrigger.wrapperPaddingX,
    paddingVertical: DASHBOARD_SALES_GRAPH_VISUAL.rangeTrigger.wrapperPaddingY,
    borderRadius: DASHBOARD_SALES_GRAPH_VISUAL.rangeTrigger.radius,
    backgroundColor: V.colors.secondary,
    borderColor: V.colors[DASHBOARD_SALES_GRAPH_VISUAL.rangeTrigger.borderColor],
    borderWidth: DASHBOARD_SALES_GRAPH_VISUAL.rangeTrigger.borderWidth,
  },
});
