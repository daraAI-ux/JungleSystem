import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import type {DashboardRailSection} from '../domain/dashboard-rail';
import {KolamDashboardRailCard} from './kolam-dashboard-rail-card';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';

export function KolamDashboardRightRail({
  cardStyle,
  listStyle,
  onOpenRoute,
  sections,
}: {
  cardStyle?: StyleProp<ViewStyle>;
  listStyle?: StyleProp<ViewStyle>;
  onOpenRoute?: (route: string) => void;
  sections: DashboardRailSection[];
}) {
  return (
    <KolamListFrame style={listStyle} variant="dashboardRail">
      <KolamMappedList
        items={sections}
        getKey={section => section.id}
        renderItem={section => (
          <KolamDashboardRailCard
            cardStyle={cardStyle}
            onOpenRoute={onOpenRoute}
            section={section}
          />
        )}
      />
    </KolamListFrame>
  );
}
