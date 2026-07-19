import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const totalRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    color: V.colors.mutedFg,
    fontSize: 14,
  },
  value: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '800',
  },
  strong: {
    color: V.colors.fg,
    fontSize: 18,
    fontWeight: '900',
  },
});
