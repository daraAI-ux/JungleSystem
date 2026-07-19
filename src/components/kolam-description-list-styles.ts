import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const descriptionListStyles = StyleSheet.create({
  list: {
    backgroundColor: V.colors.bg,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
  },
  row: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: V.layout.tableCellPaddingX,
    paddingVertical: 12,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
  },
  rowFirst: {
    borderTopWidth: 0,
  },
  term: {
    width: '46%',
    maxWidth: 320,
    paddingRight: 18,
  },
  termText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
  },
  details: {
    flex: 1,
    minWidth: 0,
  },
  valueDefault: {
    color: V.colors.fg,
    backgroundColor: V.colors.secondary,
  },
  meta: {
    marginTop: 6,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 18,
  },
});
