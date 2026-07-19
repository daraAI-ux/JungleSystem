import {StyleSheet} from 'react-native';
import {getDashboardStatsVisualContract} from '../domain/dashboard-stats';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

const DASHBOARD_STATS_VISUAL = getDashboardStatsVisualContract();

export const unifiedOverviewPanelStyles = StyleSheet.create({
  metricsRow: {
    flexDirection: 'row',
    gap: DASHBOARD_STATS_VISUAL.grid.gap,
    marginBottom: V.layout.cardSpacing,
  },
  dashboardLayout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: V.layout.dashboardSectionGap,
    marginBottom: V.layout.dashboardSectionGap,
  },
  dashboardMain: {
    flex: 1,
    minWidth: 0,
  },
});
