import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {getKolamTableVisualContract} from '../domain/kolam-table';

export const KOLAM_TABLE_VISUAL = getKolamTableVisualContract();

export const dataTableHeaderStyles = StyleSheet.create({
  row: {
    minHeight: KOLAM_TABLE_VISUAL.body.rowMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: KOLAM_TABLE_VISUAL.header.columnPaddingX,
    paddingVertical: KOLAM_TABLE_VISUAL.header.gutterY,
    backgroundColor: V.colors.tableHeader,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
  },
  text: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: KOLAM_TABLE_VISUAL.header.fontSize,
    lineHeight: KOLAM_TABLE_VISUAL.header.lineHeight,
    fontWeight:
      KOLAM_TABLE_VISUAL.header.fontWeight === 'medium' ? '500' : '700',
  },
  primary: {
    flex: 1,
  },
  right: {
    textAlign: 'right',
  },
});
