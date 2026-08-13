import React from 'react';
import {StyleSheet} from 'react-native';
import {KolamDashboardCountStrip} from './kolam-dashboard-widgets';
import type {KolamUnifiedDashboardCountSectionProps} from './kolam-unified-overview-panel-types';

export function KolamUnifiedDashboardCountSection({
  dashboardSections,
  onDashboardRoute,
}: KolamUnifiedDashboardCountSectionProps) {
  if (!dashboardSections.isKolamDashboard) {
    return null;
  }

  return (
    <KolamDashboardCountStrip
      cards={dashboardSections.countCards}
      onOpenRoute={onDashboardRoute}
      style={styles.countGrid}
    />
  );
}

const styles = StyleSheet.create({
  countGrid: {
    marginBottom: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
  },
});
