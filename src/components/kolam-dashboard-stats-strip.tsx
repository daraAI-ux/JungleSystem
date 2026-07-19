import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import type {DashboardStatCard} from '../domain/dashboard-stats';
import {KolamDashboardStatCard} from './kolam-dashboard-stat-card';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';

export function KolamDashboardStatsStrip({
  cards,
  style,
}: {
  cards: DashboardStatCard[];
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <KolamListFrame variant="dashboardMetric" style={style}>
      <KolamMappedList
        items={cards}
        getKey={card => card.id}
        renderItem={card => <KolamDashboardStatCard card={card} />}
      />
    </KolamListFrame>
  );
}
