import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {StyleSheet} from 'react-native';
import type {DashboardStatCard} from '../domain/dashboard-stats';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {DASHBOARD_STATS_VISUAL} from './kolam-dashboard-metric-visual';

type DashboardStatChannel = DashboardStatCard['channels'][number];

export function KolamDashboardStatChannelRow({
  channel,
}: {
  channel: DashboardStatChannel;
}) {
  return (
    <KolamCopyStack
      containerStyle={styles.metricChannelRow}
      items={[
        {
          id: 'label',
          text: channel.label,
          style: styles.metricChannelLabel,
        },
        {
          id: 'value',
          text: channel.value,
          style: styles.metricChannelValue,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  metricChannelRow: {
    flex: 1,
    minWidth: DASHBOARD_STATS_VISUAL.channelRows.itemMinWidth,
    minHeight: DASHBOARD_STATS_VISUAL.channelRows.itemMinHeight,
    paddingHorizontal: DASHBOARD_STATS_VISUAL.channelRows.itemPaddingX,
    paddingVertical: DASHBOARD_STATS_VISUAL.channelRows.itemPaddingY,
    borderRadius: DASHBOARD_STATS_VISUAL.channelRows.itemRadius,
    backgroundColor: V.colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricChannelLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: DASHBOARD_STATS_VISUAL.channelRows.labelFontSize,
    textAlign: 'center',
  },
  metricChannelValue: {
    marginTop: DASHBOARD_STATS_VISUAL.channelRows.valueGapY,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: DASHBOARD_STATS_VISUAL.channelRows.valueFontSize,
    fontWeight: '700',
    textAlign: 'center',
  },
});
