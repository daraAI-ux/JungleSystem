import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {
  DASHBOARD_STATS_VISUAL,
  liveCardChrome,
} from './kolam-dashboard-metric-visual';

export const dashboardStatCardStyles = StyleSheet.create({
  metricCard: {
    flex: 1,
    minHeight: DASHBOARD_STATS_VISUAL.card.baseMinHeight,
    padding: V.layout.cardCompactSpacing,
    ...liveCardChrome,
  },
  dashboardStatMetricCard: {
    flexBasis: DASHBOARD_STATS_VISUAL.card.minWidth,
    minWidth: DASHBOARD_STATS_VISUAL.card.minWidth,
    minHeight: DASHBOARD_STATS_VISUAL.card.dashboardMinHeight,
    padding: DASHBOARD_STATS_VISUAL.card.spacing,
  },
  metricCardHeader: {
    minHeight: DASHBOARD_STATS_VISUAL.header.minHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: DASHBOARD_STATS_VISUAL.header.gapX,
  },
  metricLabel: {
    flex: 1,
    color: V.colors.mutedFg,
    fontSize: DASHBOARD_STATS_VISUAL.header.labelFontSize,
    fontWeight: '800',
  },
  metricValue: {
    marginTop: DASHBOARD_STATS_VISUAL.header.baseValueGapY,
    color: V.colors.fg,
    fontSize: DASHBOARD_STATS_VISUAL.header.valueFontSize,
    fontWeight: '700',
  },
  metricTrend: {
    marginTop: DASHBOARD_STATS_VISUAL.trend.marginTop,
    color: V.colors.mutedFg,
    fontSize: DASHBOARD_STATS_VISUAL.trend.fontSize,
    fontWeight: DASHBOARD_STATS_VISUAL.trend.fontWeight,
  },
  dashboardStatHeaderCopy: {
    flex: 1,
    minWidth: 0,
    gap: DASHBOARD_STATS_VISUAL.header.gapY,
  },
  dashboardStatValue: {
    marginTop: DASHBOARD_STATS_VISUAL.header.dashboardValueGapY,
    fontSize: DASHBOARD_STATS_VISUAL.header.valueFontSize,
  },
});
