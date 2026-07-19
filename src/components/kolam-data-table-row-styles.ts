import {StyleSheet} from 'react-native';
import {getKolamTableVisualContract} from '../domain/kolam-table';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

const KOLAM_TABLE_VISUAL = getKolamTableVisualContract();

export const dataTableRowStyles = StyleSheet.create({
  row: {
    minHeight: KOLAM_TABLE_VISUAL.body.rowMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: KOLAM_TABLE_VISUAL.body.cellPaddingX,
    paddingVertical: KOLAM_TABLE_VISUAL.body.gutterY,
    backgroundColor: V.colors.bg,
    borderBottomColor: V.colors.border,
    borderBottomWidth: KOLAM_TABLE_VISUAL.body.rowBorderBottom ? 1 : 0,
  },
  primary: {
    flex: 1,
  },
  title: {
    color: V.colors.fg,
    fontSize: KOLAM_TABLE_VISUAL.root.fontSize,
    lineHeight: KOLAM_TABLE_VISUAL.root.lineHeight,
    fontWeight:
      KOLAM_TABLE_VISUAL.body.primaryWeight === 'semibold' ? '600' : '700',
  },
  subtitle: {
    marginTop: 2,
    color: V.colors.mutedFg,
    fontSize: 13,
    lineHeight: 20,
  },
  meta: {
    width: 150,
    color: V.colors.fg,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
  },
  amount: {
    width: 170,
    color: V.colors.fg,
    fontSize: 13,
    lineHeight: 20,
    fontWeight:
      KOLAM_TABLE_VISUAL.body.amountWeight === 'semibold' ? '600' : '700',
    textAlign: 'right',
  },
});
