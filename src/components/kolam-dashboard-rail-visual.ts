import {getDashboardRailVisualContract} from '../domain/dashboard-rail';
import {getKolamButtonVisualContract} from '../domain/kolam-button';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const DASHBOARD_RAIL_VISUAL = getDashboardRailVisualContract();
export const KOLAM_BUTTON_VISUAL = getKolamButtonVisualContract();

export const liveCardShadow = {
  shadowColor: V.colors.fg,
  shadowOffset: {width: 0, height: V.surface.cardShadow.offsetY},
  shadowOpacity: V.surface.cardShadow.opacity,
  shadowRadius: V.surface.cardShadow.radius,
  elevation: V.surface.cardShadow.elevation,
};

export const liveCardChrome = {
  borderRadius: DASHBOARD_RAIL_VISUAL.card.radius,
  backgroundColor: V.colors.bg,
  borderColor: V.colors.border,
  borderWidth: V.surface.cardChrome.borderWidth,
  ...liveCardShadow,
};

export const liveCardHeaderCompact = {
  paddingHorizontal: 0,
  paddingVertical: V.layout.cardCompactSpacing,
};
