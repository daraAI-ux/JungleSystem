import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const syncActivityStyles = StyleSheet.create({
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  label: {
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '900',
  },
  detail: {
    marginTop: 7,
    color: V.colors.mutedFg,
    fontSize: 11,
    lineHeight: 15,
  },
  time: {
    marginTop: 6,
    color: V.colors.mutedFg,
    fontSize: 10,
    fontWeight: '800',
  },
});
