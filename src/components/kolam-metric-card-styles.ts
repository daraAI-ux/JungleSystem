import {StyleSheet} from 'react-native';
import {getDashboardStatsVisualContract} from '../domain/dashboard-stats';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

const DASHBOARD_STATS_VISUAL = getDashboardStatsVisualContract();
const liveCardChrome = {
  borderRadius: V.surface.cardChrome.radius,
  backgroundColor: V.colors.bg,
  borderColor: V.colors.border,
  borderWidth: V.surface.cardChrome.borderWidth,
};

export const metricCardStyles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 118,
    padding: V.layout.cardCompactSpacing,
    ...liveCardChrome,
  },
  warning: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.warningSoft,
  },
  header: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  indicator: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: V.colors.successSoft,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  indicatorWarning: {
    backgroundColor: V.colors.warningSoft,
  },
  label: {
    flex: 1,
    color: V.colors.mutedFg,
    fontSize: DASHBOARD_STATS_VISUAL.header.labelFontSize,
    fontWeight: '800',
  },
  value: {
    marginTop: 14,
    color: V.colors.fg,
    fontSize: 24,
    fontWeight: '700',
  },
});
