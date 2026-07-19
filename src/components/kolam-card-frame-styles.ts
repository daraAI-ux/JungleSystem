import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {getDashboardCustomerVisitConfirmationsVisualContract} from '../domain/dashboard-customer-visit-confirmations';
import {KOLAM_CUSTOMER_CARD_CHROME} from './kolam-customer-module-visual';
import {DASHBOARD_COUNT_VISUAL} from './kolam-dashboard-metric-visual';
import {
  DASHBOARD_RAIL_VISUAL,
  liveCardChrome as dashboardRailCardChrome,
} from './kolam-dashboard-rail-visual';
import {
  PENDING_ORDERS_VISUAL,
  pendingOrdersCardChrome,
} from './kolam-dashboard-pending-orders-visual';
import {
  DASHBOARD_SALES_GRAPH_VISUAL,
  liveCardChrome as salesGraphCardChrome,
} from './kolam-dashboard-sales-graph-visual';
import {salesPanelCardChrome} from './kolam-sales-panel-visual';

const compactChrome = {
  padding: V.layout.cardCompactSpacing,
  borderRadius: 8,
  backgroundColor: V.colors.bg,
  borderColor: V.colors.border,
  borderWidth: 1,
};

const liveCardShadow = {
  shadowColor: V.colors.fg,
  shadowOffset: {width: 0, height: V.surface.cardShadow.offsetY},
  shadowOpacity: V.surface.cardShadow.opacity,
  shadowRadius: V.surface.cardShadow.radius,
  elevation: V.surface.cardShadow.elevation,
};

const liveCardChrome = {
  borderRadius: V.surface.cardChrome.radius,
  backgroundColor: V.colors.bg,
  borderColor: V.colors.border,
  borderWidth: V.surface.cardChrome.borderWidth,
  ...liveCardShadow,
};

const VISIT_CONFIRMATIONS_VISUAL =
  getDashboardCustomerVisitConfirmationsVisualContract();

export const cardFrameStyles = StyleSheet.create({
  compact: compactChrome,
  summary: {
    flex: 1,
    minWidth: 220,
    ...compactChrome,
  },
  info: {
    marginTop: 12,
    padding: V.layout.cardCompactSpacing,
    borderRadius: 8,
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  metricGrid: {
    flex: 1,
    minHeight: 74,
    justifyContent: 'center',
    paddingHorizontal: V.layout.cardCompactSpacing,
    borderRadius: V.radius.lg,
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  readiness: {
    width: '32%',
    minHeight: 118,
    ...compactChrome,
  },
  syncActivity: {
    width: '32%',
    minHeight: 92,
    ...compactChrome,
  },
  syncStatusBar: {
    minHeight: V.control.buttonMdHeight,
    justifyContent: 'center',
    marginBottom: 18,
    paddingHorizontal: V.control.inputPaddingX,
    borderRadius: V.radius.lg,
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  dashboardCount: {
    flex: 1,
    flexBasis: DASHBOARD_COUNT_VISUAL.card.minWidth,
    minWidth: DASHBOARD_COUNT_VISUAL.card.minWidth,
    minHeight: DASHBOARD_COUNT_VISUAL.card.minHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: DASHBOARD_COUNT_VISUAL.card.gapX,
    padding: DASHBOARD_COUNT_VISUAL.card.padding,
    borderRadius: DASHBOARD_COUNT_VISUAL.card.radius,
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderWidth: DASHBOARD_COUNT_VISUAL.card.borderWidth,
  },
  dashboardInventoryCounts: {
    overflow: 'hidden',
    padding: 0,
    borderRadius: DASHBOARD_COUNT_VISUAL.section.frameRadius,
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderWidth: V.surface.cardChrome.borderWidth,
    ...liveCardShadow,
  },
  dashboardRail: {
    flex: 1,
    flexBasis: `${DASHBOARD_RAIL_VISUAL.layout.cardBasisPercent}%`,
    minWidth: DASHBOARD_RAIL_VISUAL.layout.cardMinWidth,
    overflow: 'hidden',
    padding: DASHBOARD_RAIL_VISUAL.layout.cardPadding,
    ...dashboardRailCardChrome,
  },
  dashboardRailEmpty: {
    minHeight: 78,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    gap: 6,
    paddingHorizontal: DASHBOARD_RAIL_VISUAL.layout.rowPaddingX,
    paddingVertical: DASHBOARD_RAIL_VISUAL.layout.rowPaddingY,
  },
  dashboardRailRow: {
    minHeight: DASHBOARD_RAIL_VISUAL.layout.rowMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: DASHBOARD_RAIL_VISUAL.layout.rowGapX,
    paddingHorizontal: DASHBOARD_RAIL_VISUAL.layout.rowPaddingX,
    paddingVertical: DASHBOARD_RAIL_VISUAL.layout.rowPaddingY,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
  },
  dashboardPendingOrders: {
    overflow: 'hidden',
    padding: PENDING_ORDERS_VISUAL.card.padding,
    ...pendingOrdersCardChrome,
  },
  dashboardPendingOrdersSectionHeader: {
    paddingHorizontal: PENDING_ORDERS_VISUAL.content.sectionHeaderPaddingX,
    paddingVertical: PENDING_ORDERS_VISUAL.content.sectionHeaderPaddingY,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    backgroundColor:
      V.colors[PENDING_ORDERS_VISUAL.content.sectionHeaderBackground],
  },
  dashboardPendingOrdersRow: {
    minHeight: 52,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: PENDING_ORDERS_VISUAL.content.rowGapX,
    rowGap: PENDING_ORDERS_VISUAL.content.rowGapY,
    paddingHorizontal: PENDING_ORDERS_VISUAL.content.rowPaddingX,
    paddingVertical: PENDING_ORDERS_VISUAL.content.rowPaddingY,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
  },
  dashboardPendingOrdersRange: {
    flex: 1,
    minWidth: 150,
    gap: PENDING_ORDERS_VISUAL.range.gapY,
  },
  dashboardSalesGraph: {
    overflow: 'hidden',
    padding: DASHBOARD_SALES_GRAPH_VISUAL.card.padding,
    ...salesGraphCardChrome,
  },
  dashboardVisitConfirmations: {
    flexDirection: 'column',
    gap: VISIT_CONFIRMATIONS_VISUAL.card.spacing,
    paddingVertical: VISIT_CONFIRMATIONS_VISUAL.card.paddingY,
    borderRadius: VISIT_CONFIRMATIONS_VISUAL.card.radius,
    backgroundColor: V.colors[VISIT_CONFIRMATIONS_VISUAL.card.background],
    borderColor: V.colors.border,
    borderWidth: VISIT_CONFIRMATIONS_VISUAL.card.borderWidth,
    ...liveCardShadow,
  },
  pluginTable: {
    overflow: 'hidden',
    ...liveCardChrome,
  },
  pluginSummary: {
    padding: V.layout.cardCompactSpacing,
    marginBottom: V.layout.cardCompactSpacing,
    ...liveCardChrome,
  },
  checkoutAdjustment: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  checkoutTotalBox: {
    marginTop: 16,
    paddingTop: 12,
  },
  catalogTable: {
    overflow: 'hidden',
    ...liveCardChrome,
  },
  customerTable: {
    overflow: 'hidden',
    ...KOLAM_CUSTOMER_CARD_CHROME,
  },
  menuDockItem: {
    width: 36,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: V.radius.md,
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  runtimeIdentityStrip: {
    marginBottom: 14,
    padding: V.layout.cardCompactSpacing,
    borderRadius: 8,
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  runtimeIdentityItem: {
    flexGrow: 1,
    flexBasis: '23%',
    minWidth: 190,
    minHeight: 88,
    padding: V.layout.cardCompactSpacing,
    borderRadius: 8,
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  salesPanel: {
    marginTop: 18,
    padding: 18,
    ...salesPanelCardChrome,
  },
  salesTable: {
    overflow: 'hidden',
    ...salesPanelCardChrome,
  },
  surfaceContractList: {
    gap: 0,
    overflow: 'hidden',
    borderRadius: 8,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  settingsRouteList: {
    overflow: 'hidden',
    borderRadius: V.radius.lg,
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  settingsActivityTable: {
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    backgroundColor: V.colors.bg,
  },
  settingsPermissionMatrix: {
    marginTop: 12,
    overflow: 'hidden',
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  settingsRoleInfoNotice: {
    paddingHorizontal: V.layout.tableCellPaddingX,
    paddingVertical: 9,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    backgroundColor: V.colors.warningSoft,
  },
  settingsRoleMatrix: {
    overflow: 'hidden',
    backgroundColor: V.colors.bg,
  },
  settingsRolePermissionGroup: {
    backgroundColor: V.colors.bg,
  },
  settingsWebLogoPreview: {
    width: 80,
    height: 80,
    borderRadius: V.radius.lg,
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  settingsWebSwitchRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 12,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  unifiedRuntimeFooter: {
    marginTop: 18,
    padding: V.layout.cardCompactSpacing,
    borderLeftColor: V.colors.info,
    borderLeftWidth: 3,
    backgroundColor: V.colors.infoSoft,
  },
  workflowNotice: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: V.colors.warningSoft,
    borderColor: V.colors.warningSoft,
    borderWidth: 1,
    gap: 8,
  },
  blocked: {
    opacity: 0.72,
    backgroundColor: V.colors.muted,
  },
});

