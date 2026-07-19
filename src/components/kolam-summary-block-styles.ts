import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const summaryBlockStyles = StyleSheet.create({
  title: {
    marginBottom: 8,
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  line: {
    minHeight: V.layout.tableRowMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
  },
  lineLabel: {
    flex: 1,
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '800',
  },
  lineValue: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'right',
  },
  lineWarning: {
    color: V.colors.warning,
  },
  empty: {
    paddingTop: 8,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    color: V.colors.mutedFg,
    fontSize: 12,
  },
});
