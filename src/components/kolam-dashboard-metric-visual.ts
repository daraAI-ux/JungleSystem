import {getDashboardCountVisualContract} from '../domain/dashboard-counts';
import {getDashboardStatsVisualContract} from '../domain/dashboard-stats';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const DASHBOARD_COUNT_VISUAL = getDashboardCountVisualContract();
export const DASHBOARD_STATS_VISUAL = getDashboardStatsVisualContract();

export const liveCardShadow = {
  shadowColor: V.colors.fg,
  shadowOffset: {width: 0, height: V.surface.cardShadow.offsetY},
  shadowOpacity: 0,
  shadowRadius: 0,
  elevation: 0,
};

export const liveCardChrome = {
  borderRadius: DASHBOARD_STATS_VISUAL.card.radius,
  backgroundColor: V.colors.bg,
  borderColor: V.colors.border,
  borderWidth: V.surface.cardChrome.borderWidth,
  ...liveCardShadow,
};
