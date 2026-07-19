import {StyleSheet} from 'react-native';
import {getDashboardCountVisualContract} from '../domain/dashboard-counts';
import {getDashboardCustomerVisitConfirmationsVisualContract} from '../domain/dashboard-customer-visit-confirmations';
import {getDashboardHeaderVisualContract} from '../domain/dashboard-header';
import {getDashboardLayoutVisualContract} from '../domain/dashboard-layout';
import {getDashboardStatsVisualContract} from '../domain/dashboard-stats';
import {getKolamControlTabsVisualContract} from '../domain/kolam-control-tabs';
import {getKolamFormVisualContract} from '../domain/kolam-form';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {
  getSettingsActivityLogFilterVisualContract,
  getSettingsPaginationVisualContract,
} from '../domain/settings-surface';
import {KOLAM_COMMAND_MENU_VISUAL} from './kolam-command-palette-visual';
import {
  DASHBOARD_RAIL_VISUAL,
  KOLAM_BUTTON_VISUAL,
} from './kolam-dashboard-rail-visual';
import {
  PENDING_ORDERS_VISUAL,
  pendingOrdersCardContentCompact,
} from './kolam-dashboard-pending-orders-visual';
import {TOP_NAV_CHROME} from './kolam-top-navigation-visual';

const DASHBOARD_HEADER_VISUAL = getDashboardHeaderVisualContract();
const DASHBOARD_COUNT_VISUAL = getDashboardCountVisualContract();
const DASHBOARD_VISIT_CONFIRMATIONS_VISUAL =
  getDashboardCustomerVisitConfirmationsVisualContract();
const DASHBOARD_LAYOUT_VISUAL = getDashboardLayoutVisualContract();
const DASHBOARD_STATS_VISUAL = getDashboardStatsVisualContract();
const FILTER_VISUAL = getSettingsActivityLogFilterVisualContract();
const KOLAM_CONTROL_TABS_VISUAL = getKolamControlTabsVisualContract();
const KOLAM_FORM_VISUAL = getKolamFormVisualContract();
const SETTINGS_PAGINATION_VISUAL = getSettingsPaginationVisualContract();

export const listFrameStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    maxWidth: 360,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 6,
  },
  avatar: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  metric: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: V.layout.cardCompactSpacing,
  },
  dashboardCount: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DASHBOARD_COUNT_VISUAL.cardSpacing,
    marginBottom: V.layout.cardSpacing,
  },
  dashboardMetric: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DASHBOARD_STATS_VISUAL.grid.gap,
    marginBottom: V.layout.cardSpacing,
  },
  runtimeActionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  runtimeIdentityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pluginSummaryGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statsCardStrip: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: V.layout.tableCellPaddingX,
    paddingVertical: 12,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    backgroundColor: V.colors.bg,
  },
  pendingOrdersGrid: {
    gap: 0,
    ...pendingOrdersCardContentCompact,
    paddingBottom: PENDING_ORDERS_VISUAL.content.paddingBottom,
  },
  catalogGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dashboardRail: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    gap: DASHBOARD_RAIL_VISUAL.layout.cardGap,
  },
  dashboardRailAction: {
    minHeight: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  breadcrumbTrail: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pluginList: {
    gap: 0,
    overflow: 'hidden',
  },
  attentionList: {
    maxHeight: 420,
  },
  attentionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authControls: {
    flex: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  authSourcePicker: {
    flexDirection: 'row',
    gap: 6,
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: KOLAM_FORM_VISUAL.fieldGrid.gap,
  },
  operationalGrid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: V.layout.cardCompactSpacing,
    marginBottom: V.layout.cardCompactSpacing,
    paddingTop: 4,
  },
  operationalStack: {
    gap: DASHBOARD_LAYOUT_VISUAL.main.gapY,
    marginBottom: V.layout.cardCompactSpacing,
  },
  commandList: {
    gap: 0,
  },
  descriptionList: {
    backgroundColor: V.colors.bg,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
  },
  endpointList: {
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    backgroundColor: V.colors.bg,
  },
  menuDockGroup: {
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 12,
  },
  cartActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  discountControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saleActions: {
    width: 180,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
  },
  dashboardHeaderActions: {
    flexDirection: 'row',
    flexWrap: DASHBOARD_HEADER_VISUAL.actions.flexWrap,
    alignItems: DASHBOARD_HEADER_VISUAL.actions.alignItems,
    justifyContent: DASHBOARD_HEADER_VISUAL.actions.justifyContent,
    flexShrink: DASHBOARD_HEADER_VISUAL.actions.flexShrink,
    gap: DASHBOARD_HEADER_VISUAL.actions.gapX,
  },
  dashboardVisitConfirmationsList: {
    borderTopColor: V.colors.border,
    borderTopWidth: DASHBOARD_VISIT_CONFIRMATIONS_VISUAL.list.borderTopWidth,
    gap: DASHBOARD_VISIT_CONFIRMATIONS_VISUAL.list.gapY,
    paddingHorizontal: DASHBOARD_VISIT_CONFIRMATIONS_VISUAL.list.paddingX,
    paddingVertical: DASHBOARD_VISIT_CONFIRMATIONS_VISUAL.list.paddingY,
  },
  topNavLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: TOP_NAV_CHROME.leftGap,
  },
  topNavRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: TOP_NAV_CHROME.rightGap,
  },
  controlTabShell: {
    minHeight: KOLAM_CONTROL_TABS_VISUAL.tabMinHeight,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderTopColor: V.colors.border,
    borderTopWidth: 0,
    borderBottomColor: V.colors.border,
    borderBottomWidth: KOLAM_CONTROL_TABS_VISUAL.tabListBorderBottom ? 1 : 0,
    backgroundColor: V.colors.bg,
  },
  filterBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: FILTER_VISUAL.gapPx,
    paddingHorizontal: V.layout.tableCellPaddingX,
    paddingVertical: 12,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    backgroundColor: V.colors.bg,
  },
  menuSectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pendingOrdersActionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pendingOrdersBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: PENDING_ORDERS_VISUAL.row.badgesGapX,
    rowGap: PENDING_ORDERS_VISUAL.row.badgesGapY,
  },
  pendingOrdersStatusBadges: {
    marginLeft: PENDING_ORDERS_VISUAL.row.statusGroupMarginLeft,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    columnGap: PENDING_ORDERS_VISUAL.row.badgesGapX,
    rowGap: PENDING_ORDERS_VISUAL.row.badgesGapY,
  },
  roleEditorActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleEditorToolbar: {
    paddingHorizontal: V.layout.tableCellPaddingX,
    paddingVertical: 14,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    backgroundColor: V.colors.bg,
  },
  roleInfoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sellableCatalogTabs: {
    flexDirection: 'row',
    gap: KOLAM_CONTROL_TABS_VISUAL.tabListGap,
    marginBottom: 14,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
  },
  summaryBadges: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  surfacePanelTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: KOLAM_CONTROL_TABS_VISUAL.tabListGap,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
  },
  commandPaletteSearchRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomColor: V.colors.border,
    borderBottomWidth: KOLAM_COMMAND_MENU_VISUAL.searchBorderBottom ? 1 : 0,
  },
  dashboardStatChannelRows: {
    marginTop: DASHBOARD_STATS_VISUAL.card.gapY,
    paddingTop: DASHBOARD_STATS_VISUAL.channelRows.paddingTop,
    paddingHorizontal: DASHBOARD_STATS_VISUAL.channelRows.paddingX,
    paddingBottom: DASHBOARD_STATS_VISUAL.channelRows.paddingBottom,
    borderTopColor: V.colors.border,
    borderTopWidth: DASHBOARD_STATS_VISUAL.channelRows.borderTopWidth,
  },
  dashboardStatChannelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DASHBOARD_STATS_VISUAL.channelRows.gridGap,
  },
  paginationNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SETTINGS_PAGINATION_VISUAL.gapPx,
  },
  dashboardRailActionTextHint: {
    fontSize: KOLAM_BUTTON_VISUAL.sizes.sm.fontSize,
  },
});
