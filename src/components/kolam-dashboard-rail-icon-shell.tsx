import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {DashboardRailSection} from '../domain/dashboard-rail';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamDashboardRailIcon} from './kolam-dashboard-rail-icon';
import {DASHBOARD_RAIL_VISUAL} from './kolam-dashboard-rail-visual';

export function KolamDashboardRailIconShell({
  iconKind,
  tone,
}: {
  iconKind: DashboardRailSection['iconKind'];
  tone: DashboardRailSection['tone'];
}) {
  return (
    <View
      style={[
        styles.dashboardRailIcon,
        tone === 'danger' && styles.dashboardRailIconDanger,
        tone === 'warning' && styles.dashboardRailIconWarning,
        tone === 'success' && styles.dashboardRailIconSuccess,
      ]}>
      <KolamDashboardRailIcon kind={iconKind} tone={tone} />
    </View>
  );
}

const styles = StyleSheet.create({
  dashboardRailIcon: {
    width: DASHBOARD_RAIL_VISUAL.layout.iconShellSize,
    height: DASHBOARD_RAIL_VISUAL.layout.iconShellSize,
    borderRadius: DASHBOARD_RAIL_VISUAL.layout.iconShellRadius,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.muted,
  },
  dashboardRailIconDanger: {
    backgroundColor: V.colors.warningSoft,
  },
  dashboardRailIconWarning: {
    backgroundColor: V.colors.warningSoft,
  },
  dashboardRailIconSuccess: {
    backgroundColor: V.colors.successSoft,
  },
});
