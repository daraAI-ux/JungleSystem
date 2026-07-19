import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const endpointListStyles = StyleSheet.create({
  list: {
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    backgroundColor: V.colors.bg,
  },
  row: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: V.layout.tableCellPaddingX,
    paddingVertical: V.layout.tableCellPaddingY,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  meta: {
    marginTop: 3,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    lineHeight: 14,
  },
  contract: {
    minWidth: 154,
    alignItems: 'flex-end',
  },
  method: {
    color: V.colors.success,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '900',
  },
  path: {
    marginTop: 3,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
});
