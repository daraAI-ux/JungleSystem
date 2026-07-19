import {StyleSheet} from 'react-native';
import {getDashboardSalesGraphVisualContract} from '../domain/dashboard-sales-graph';
import {getDashboardStatsVisualContract} from '../domain/dashboard-stats';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

const DASHBOARD_SALES_GRAPH_VISUAL = getDashboardSalesGraphVisualContract();
const DASHBOARD_STATS_VISUAL = getDashboardStatsVisualContract();

export const inlineFrameStyles = StyleSheet.create({
  attentionItemCopy: {
    flex: 1,
    minWidth: 0,
  },
  attentionItemTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  avatarPill: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 3,
    paddingRight: 10,
    borderRadius: 999,
    backgroundColor: V.colors.muted,
  },
  cartItemInfo: {
    marginBottom: 8,
  },
  descriptionDetails: {
    flex: 1,
    minWidth: 0,
  },
  detailField: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  dashboardSalesGraphPoint: {
    flex: 1,
    minWidth: DASHBOARD_SALES_GRAPH_VISUAL.point.minWidth,
    alignItems: 'center',
    gap: DASHBOARD_SALES_GRAPH_VISUAL.point.gapY,
  },
  dashboardSalesGraphAreaTrack: {
    width: '100%',
    height: DASHBOARD_SALES_GRAPH_VISUAL.chart.innerPlotHeight,
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderRadius: V.radius.lg,
    backgroundColor: V.colors.bg,
    borderBottomColor: V.colors.border,
    borderBottomWidth: DASHBOARD_SALES_GRAPH_VISUAL.point.trackBorderWidth,
    position: 'relative',
  },
  dashboardStatSparkline: {
    height: DASHBOARD_STATS_VISUAL.sparkline.height,
    marginTop: DASHBOARD_STATS_VISUAL.card.gapY,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: DASHBOARD_STATS_VISUAL.sparkline.gapX,
  },
  pluginIdentity: {
    flex: 1,
  },
  pluginCapabilities: {
    width: 360,
  },
  pluginRepoRoute: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
  },
  pluginStatusBox: {
    width: 150,
    alignItems: 'flex-end',
  },
  navItemBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  navItemCopy: {
    flex: 1,
    minWidth: 0,
  },
  navItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  navItemGlyph: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: V.radius.md,
    backgroundColor: 'transparent',
  },
  roleInfoCopy: {
    flex: 1,
    minWidth: 0,
  },
  roleInfoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  settingsActivityPathCell: {
    flex: 1,
    minWidth: 130,
  },
  settingsActivityTimeCell: {
    width: 92,
  },
  settingsActivityTimeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  settingsWebLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  topNavigationAvatar: {
    width: 32,
    height: 32,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  userMenuAvatar: {
    width: 40,
    height: 40,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  roleMemberPreview: {
    marginTop: 12,
    paddingTop: 12,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
  },
  roleMemberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rolePermissionResource: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  workflowNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
});
