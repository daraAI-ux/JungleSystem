import {getDashboardRailVisualContract} from '../domain/dashboard-rail';
import {getKolamButtonVisualContract} from '../domain/kolam-button';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const DASHBOARD_RAIL_VISUAL = getDashboardRailVisualContract();
export const KOLAM_BUTTON_VISUAL = getKolamButtonVisualContract();

export const liveCardShadow = {
  shadowColor: V.colors.fg,
  shadowOffset: {width: 0, height: V.surface.cardShadow.offsetY},
  shadowOpacity: 0,
  shadowRadius: 0,
  elevation: 0,
};

export const liveCardChrome = {
  borderRadius: DASHBOARD_RAIL_VISUAL.card.radius,
  backgroundColor: V.colors.bg,
  borderColor: V.colors.border,
  borderWidth: V.surface.cardChrome.borderWidth,
  ...liveCardShadow,
};

export const liveCardHeaderCompact = {
  paddingHorizontal: DASHBOARD_RAIL_VISUAL.layout.headerPaddingX,
  paddingVertical: V.layout.cardCompactSpacing,
};
