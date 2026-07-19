import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import type {DashboardCountCard} from '../domain/dashboard-counts';
import {KolamDashboardCountCard} from './kolam-dashboard-count-card';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';

export function KolamDashboardCountStrip({
  cards,
  onOpenRoute,
  style,
}: {
  cards: DashboardCountCard[];
  onOpenRoute?: (route: string) => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <KolamListFrame variant="dashboardCount" style={style}>
      <KolamMappedList
        items={cards}
        getKey={card => card.id}
        renderItem={card => (
          <KolamDashboardCountCard
            card={card}
            onOpenRoute={onOpenRoute}
          />
        )}
      />
    </KolamListFrame>
  );
}
