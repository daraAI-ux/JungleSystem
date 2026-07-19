import {
  getDashboardPendingOrdersVisualContract,
} from '../domain/dashboard-pending-orders';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const PENDING_ORDERS_VISUAL =
  getDashboardPendingOrdersVisualContract();

export const pendingOrdersCardShadow = {
  shadowColor: V.colors.fg,
  shadowOffset: {width: 0, height: V.surface.cardShadow.offsetY},
  shadowOpacity: V.surface.cardShadow.opacity,
  shadowRadius: V.surface.cardShadow.radius,
  elevation: V.surface.cardShadow.elevation,
};

export const pendingOrdersCardChrome = {
  borderRadius: PENDING_ORDERS_VISUAL.card.radius,
  backgroundColor: V.colors.bg,
  borderColor: V.colors.border,
  borderWidth: V.surface.cardChrome.borderWidth,
  ...pendingOrdersCardShadow,
};

export const pendingOrdersCardHeaderCompact = {
  paddingHorizontal: PENDING_ORDERS_VISUAL.header.paddingX,
  paddingVertical: PENDING_ORDERS_VISUAL.header.paddingY,
};

export const pendingOrdersCardContentCompact = {
  paddingHorizontal: 0,
  paddingVertical: V.layout.cardCompactSpacing,
};
