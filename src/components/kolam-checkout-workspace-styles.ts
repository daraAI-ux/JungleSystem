import {StyleSheet} from 'react-native';
import {getDashboardStatsVisualContract} from '../domain/dashboard-stats';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

const DASHBOARD_STATS_VISUAL = getDashboardStatsVisualContract();

export const checkoutWorkspaceStyles = StyleSheet.create({
  metricsRow: {
    flexDirection: 'row',
    gap: DASHBOARD_STATS_VISUAL.grid.gap,
    marginBottom: V.layout.cardSpacing,
  },
  workspace: {
    flexDirection: 'row',
    gap: 18,
    alignItems: 'flex-start',
  },
  catalogPane: {
    flex: 1,
    minWidth: 520,
  },
});
