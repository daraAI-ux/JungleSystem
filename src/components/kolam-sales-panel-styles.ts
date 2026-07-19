import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {
  KOLAM_SALES_TABLE_VISUAL,
  salesPanelCardChrome,
} from './kolam-sales-panel-visual';

export const salesPanelStyles = StyleSheet.create({
  salesPanel: {
    marginTop: 18,
    padding: 18,
    ...salesPanelCardChrome,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionHint: {
    marginTop: 4,
    color: V.colors.mutedFg,
    fontSize: 13,
  },
  dataTable: {
    overflow: 'hidden',
    ...salesPanelCardChrome,
  },
  saleRow: {
    minHeight: KOLAM_SALES_TABLE_VISUAL.body.rowMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: V.layout.tableCellPaddingX,
    paddingVertical: V.layout.tableCellPaddingY,
    backgroundColor: V.colors.bg,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
  },
  saleIdentity: {
    flex: 1,
  },
  saleCode: {
    color: V.colors.fg,
    fontSize: KOLAM_SALES_TABLE_VISUAL.root.fontSize,
    lineHeight: KOLAM_SALES_TABLE_VISUAL.root.lineHeight,
    fontWeight: '900',
  },
  saleCustomer: {
    marginTop: 2,
    color: V.colors.mutedFg,
    fontSize: 13,
    lineHeight: 20,
  },
  saleStatus: {
    width: 92,
    color: V.colors.success,
    fontSize: V.control.badgeFontSize,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  saleTotal: {
    width: 150,
    color: V.colors.fg,
    fontSize: KOLAM_SALES_TABLE_VISUAL.root.fontSize,
    lineHeight: KOLAM_SALES_TABLE_VISUAL.root.lineHeight,
    fontWeight: '900',
    textAlign: 'right',
  },
  saleActions: {
    width: 180,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
  },
});
