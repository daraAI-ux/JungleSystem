import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const detailValueRowStyles = StyleSheet.create({
  row: {
    minHeight: V.layout.tableRowMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: V.layout.tableCellPaddingX,
    paddingVertical: V.layout.tableCellPaddingY,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
  },
  meta: {
    marginTop: 3,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    lineHeight: 16,
  },
  value: {
    maxWidth: 180,
  },
});
