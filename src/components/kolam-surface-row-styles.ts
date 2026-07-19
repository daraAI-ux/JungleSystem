import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const surfaceRowStyles = StyleSheet.create({
  row: {
    minHeight: V.layout.tableRowMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: V.layout.tableCellPaddingX,
    paddingVertical: V.layout.tableCellPaddingY,
    backgroundColor: V.colors.bg,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
  },
  identity: {
    flex: 1,
  },
  title: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '900',
  },
  description: {
    marginTop: 3,
    color: V.colors.mutedFg,
    fontSize: 13,
  },
  metaBox: {
    width: 360,
  },
  route: {
    color: V.colors.info,
    fontSize: 12,
    fontWeight: '800',
  },
  repo: {
    marginTop: 3,
    color: V.colors.mutedFg,
    fontSize: 11,
  },
});
