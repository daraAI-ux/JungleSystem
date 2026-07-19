import {getDashboardSalesGraphVisualContract} from '../domain/dashboard-sales-graph';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const DASHBOARD_SALES_GRAPH_VISUAL =
  getDashboardSalesGraphVisualContract();

export const liveCardShadow = {
  shadowColor: V.colors.fg,
  shadowOffset: {width: 0, height: V.surface.cardShadow.offsetY},
  shadowOpacity: V.surface.cardShadow.opacity,
  shadowRadius: V.surface.cardShadow.radius,
  elevation: V.surface.cardShadow.elevation,
};

export const liveCardChrome = {
  borderRadius: DASHBOARD_SALES_GRAPH_VISUAL.card.radius,
  backgroundColor: V.colors.bg,
  borderColor: V.colors.border,
  borderWidth: V.surface.cardChrome.borderWidth,
  ...liveCardShadow,
};

export const liveCardHeaderCompact = {
  paddingHorizontal: DASHBOARD_SALES_GRAPH_VISUAL.header.paddingX,
  paddingVertical: DASHBOARD_SALES_GRAPH_VISUAL.header.paddingY,
};

export const liveCardContentCompact = {
  paddingHorizontal: DASHBOARD_SALES_GRAPH_VISUAL.content.paddingX,
  paddingVertical: 0,
};
