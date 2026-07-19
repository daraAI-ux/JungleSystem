import React from 'react';
import type {DashboardRailSection} from '../domain/dashboard-rail';
import {KolamDashboardRailCard} from './kolam-dashboard-rail-card';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';

export function KolamDashboardRightRail({
  onOpenRoute,
  sections,
}: {
  onOpenRoute?: (route: string) => void;
  sections: DashboardRailSection[];
}) {
  return (
    <KolamListFrame variant="dashboardRail">
      <KolamMappedList
        items={sections}
        getKey={section => section.id}
        renderItem={section => (
          <KolamDashboardRailCard
            onOpenRoute={onOpenRoute}
            section={section}
          />
        )}
      />
    </KolamListFrame>
  );
}
