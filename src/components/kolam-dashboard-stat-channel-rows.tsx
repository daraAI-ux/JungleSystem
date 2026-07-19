import React from 'react';
import type {DashboardStatCard} from '../domain/dashboard-stats';
import {KolamDashboardStatChannelRow} from './kolam-dashboard-stat-channel-row';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';
import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {DASHBOARD_STATS_VISUAL} from './kolam-dashboard-metric-visual';

export function KolamDashboardStatChannelRows({
  title,
  channels,
}: {
  title: DashboardStatCard['breakdownTitle'];
  channels: DashboardStatCard['channels'];
}) {
  return (
    <KolamListFrame variant="dashboardStatChannelRows">
      {channels.length ? (
        <KolamCopyStack
          items={[
            {
              id: 'title',
              text: title,
              style: styles.breakdownTitle,
            },
          ]}
        />
      ) : null}
      <KolamListFrame variant="dashboardStatChannelGrid">
        <KolamMappedList
          items={channels}
          getKey={channel => channel.id}
          renderItem={channel => (
            <KolamDashboardStatChannelRow channel={channel} />
          )}
        />
      </KolamListFrame>
    </KolamListFrame>
  );
}

const styles = StyleSheet.create({
  breakdownTitle: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: DASHBOARD_STATS_VISUAL.channelRows.titleFontSize,
    fontWeight: '800',
    marginBottom: DASHBOARD_STATS_VISUAL.channelRows.titleMarginBottom,
  },
});
