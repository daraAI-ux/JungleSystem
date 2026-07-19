import {StyleSheet} from 'react-native';
import {getDashboardSalesGraphVisualContract} from '../domain/dashboard-sales-graph';
import {getKolamFormVisualContract} from '../domain/kolam-form';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

const DASHBOARD_SALES_GRAPH_VISUAL = getDashboardSalesGraphVisualContract();
const KOLAM_FORM_VISUAL = getKolamFormVisualContract();

export const contentFrameStyles = StyleSheet.create({
  checkoutPane: {
    width: 390,
    padding: V.layout.cardSpacing,
    borderRadius: 8,
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  checkoutCatalogPane: {
    flex: 1,
    minWidth: 520,
  },
  checkoutCartList: {
    marginTop: 14,
    gap: 10,
  },
  checkoutWorkspace: {
    flexDirection: 'row',
    gap: 18,
    alignItems: 'flex-start',
  },
  statusPanelBody: {
    paddingHorizontal: V.layout.cardSpacing,
    paddingBottom: V.layout.cardSpacing,
    paddingTop: V.layout.cardCompactSpacing,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
  },
  userMenuList: {
    paddingVertical: 4,
  },
  commandPaletteSection: {
    marginBottom: 22,
  },
  commandPaletteEmpty: {
    paddingHorizontal: V.layout.cardSpacing,
    paddingVertical: V.layout.cardSpacing,
  },
  dashboardSalesGraphEmpty: {
    minHeight: DASHBOARD_SALES_GRAPH_VISUAL.content.height,
    alignItems: 'center',
    justifyContent: 'center',
    gap: DASHBOARD_SALES_GRAPH_VISUAL.emptyState.gapY,
    paddingHorizontal: DASHBOARD_SALES_GRAPH_VISUAL.content.paddingX,
    paddingVertical: 0,
    paddingBottom: DASHBOARD_SALES_GRAPH_VISUAL.content.paddingBottom,
    borderTopColor: V.colors.border,
    borderTopWidth: DASHBOARD_SALES_GRAPH_VISUAL.content.borderTop ? 1 : 0,
  },
  dashboardSalesGraphPlot: {
    minHeight: DASHBOARD_SALES_GRAPH_VISUAL.content.height,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: DASHBOARD_SALES_GRAPH_VISUAL.content.plotGap,
    paddingHorizontal: DASHBOARD_SALES_GRAPH_VISUAL.content.paddingX,
    paddingVertical: 0,
    paddingTop: DASHBOARD_SALES_GRAPH_VISUAL.content.paddingTop,
    paddingBottom: DASHBOARD_SALES_GRAPH_VISUAL.content.paddingBottom,
    borderTopColor: V.colors.border,
    borderTopWidth: DASHBOARD_SALES_GRAPH_VISUAL.content.borderTop ? 1 : 0,
  },
  detailPanelBody: {
    gap: 10,
    paddingHorizontal: V.layout.tableCellPaddingX,
    paddingVertical: 13,
  },
  detailWarningBox: {
    gap: 6,
    padding: 12,
    borderRadius: V.radius.lg,
    borderColor: V.colors.warning,
    borderWidth: 1,
    backgroundColor: V.colors.warningSoft,
  },
  cashflowPreview: {
    marginTop: 14,
    padding: 12,
    borderRadius: 8,
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  nativeFormSection: {
    gap: 16,
    marginBottom: V.layout.cardSpacing,
    paddingTop: KOLAM_FORM_VISUAL.section.rowGap,
    borderTopColor: V.colors.border,
    borderTopWidth: KOLAM_FORM_VISUAL.section.separator ? 1 : 0,
  },
  nativeFormControls: {
    width: '100%',
    minWidth: 0,
  },
  settingsWebConfig: {
    backgroundColor: V.colors.bg,
  },
  settingsWebFormSections: {
    paddingHorizontal: V.layout.tableCellPaddingX,
    paddingVertical: 16,
    gap: 16,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    backgroundColor: V.colors.bg,
  },
  settingsWebFormSection: {
    gap: 12,
  },
});
