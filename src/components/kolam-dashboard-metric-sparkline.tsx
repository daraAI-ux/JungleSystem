import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {DashboardStatCard} from '../domain/dashboard-stats';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {DASHBOARD_STATS_VISUAL} from './kolam-dashboard-metric-visual';
import {KolamInlineFrame} from './kolam-inline-frame';
import {KolamMappedList} from './kolam-mapped-list';

export function KolamDashboardMetricSparkline({
  values,
  tone,
}: {
  tone: DashboardStatCard['changeTone'];
  values: number[];
}) {
  if (!values.length) {
    return null;
  }

  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const spread = Math.max(maxValue - minValue, 1);

  return (
    <KolamInlineFrame variant="dashboardStatSparkline">
      <KolamMappedList
        items={values}
        getKey={(value, index) => `${value}-${index}`}
        renderItem={value => {
          const normalized = (value - minValue) / spread;
          const height =
            DASHBOARD_STATS_VISUAL.sparkline.barMinHeight +
            Math.round(
              normalized * DASHBOARD_STATS_VISUAL.sparkline.barHeightRange,
            );

          return (
            <View
              style={[
                styles.metricSparklineBar,
                {height},
                tone === 'danger' && styles.metricSparklineBarDanger,
              ]}
            />
          );
        }}
      />
    </KolamInlineFrame>
  );
}

const styles = StyleSheet.create({
  metricSparklineBar: {
    flex: 1,
    minWidth: DASHBOARD_STATS_VISUAL.sparkline.barMinWidth,
    borderRadius: DASHBOARD_STATS_VISUAL.sparkline.barRadius,
    backgroundColor: V.colors.successSoft,
    borderColor: V.colors.success,
    borderWidth: DASHBOARD_STATS_VISUAL.sparkline.barBorderWidth,
  },
  metricSparklineBarDanger: {
    backgroundColor: V.colors.warningSoft,
    borderColor: V.colors.warning,
  },
});
