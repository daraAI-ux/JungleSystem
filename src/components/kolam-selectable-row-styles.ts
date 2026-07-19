import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const selectableRowStyles = StyleSheet.create({
  row: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: V.layout.tableCellPaddingX,
    paddingVertical: V.layout.tableCellPaddingY,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
  },
  rowSelected: {
    backgroundColor: V.colors.successSoft,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
  },
  description: {
    marginTop: 3,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    lineHeight: 16,
  },
});
