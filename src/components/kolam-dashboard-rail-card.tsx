import React from 'react';
import type {DashboardRailSection} from '../domain/dashboard-rail';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamDashboardRailEmptyState} from './kolam-dashboard-rail-empty-state';
import {KolamDashboardRailHeader} from './kolam-dashboard-rail-header';
import {KolamDashboardRailRow} from './kolam-dashboard-rail-row';
import {KolamMappedList} from './kolam-mapped-list';

export function KolamDashboardRailCard({
  onOpenRoute,
  section,
}: {
  onOpenRoute?: (route: string) => void;
  section: DashboardRailSection;
}) {
  return (
    <KolamCardFrame variant="dashboardRail">
      <KolamDashboardRailHeader
        onOpenRoute={onOpenRoute}
        section={section}
      />
      {section.items.length ? (
        <KolamMappedList
          items={section.items}
          getKey={item => item.id}
          renderItem={item => (
            <KolamDashboardRailRow
              item={item}
              onOpenRoute={onOpenRoute}
            />
          )}
        />
      ) : (
        <KolamDashboardRailEmptyState section={section} />
      )}
    </KolamCardFrame>
  );
}
