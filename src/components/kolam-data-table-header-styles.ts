import { StyleSheet } from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { getKolamTableVisualContract } from '../domain/kolam-table';
import { KOLAM_DATA_TABLE_COLUMN_GAP } from './kolam-data-table-column-style';

export const KOLAM_TABLE_VISUAL = getKolamTableVisualContract();

export const dataTableHeaderStyles = StyleSheet.create({
  row: {
    minHeight: KOLAM_TABLE_VISUAL.body.rowMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: KOLAM_DATA_TABLE_COLUMN_GAP,
    paddingHorizontal: KOLAM_TABLE_VISUAL.header.columnPaddingX,
    paddingVertical: KOLAM_TABLE_VISUAL.header.gutterY,
    backgroundColor: V.colors.tableHeader,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
  },
  cell: {
    justifyContent: 'center',
    minWidth: 0,
    overflow: 'hidden',
  },
  cellCenter: {
    alignItems: 'center',
  },
  cellRight: {
    alignItems: 'flex-end',
  },
  labelFill: {
    width: '100%',
  },
  text: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: KOLAM_TABLE_VISUAL.header.fontSize,
    lineHeight: 18,
    fontWeight:
      KOLAM_TABLE_VISUAL.header.fontWeight === 'medium' ? '500' : '700',
  },
  primary: {
    flex: 1,
    minWidth: 180,
  },
  left: {
    textAlign: 'left',
  },
  center: {
    textAlign: 'center',
  },
  right: {
    textAlign: 'right',
  },
});
