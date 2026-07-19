import React from 'react';
import type {DashboardRailSection} from '../domain/dashboard-rail';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamEmptyState} from './kolam-empty-state';

export function KolamDashboardRailEmptyState({
  section,
}: {
  section: DashboardRailSection;
}) {
  return (
    <KolamCardFrame variant="dashboardRailEmpty">
      <KolamEmptyState title={section.emptyTitle} variant="dashboardRail" />
    </KolamCardFrame>
  );
}
