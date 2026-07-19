import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const infoBlockStyles = StyleSheet.create({
  label: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  primary: {
    marginTop: 5,
    color: V.colors.fg,
    fontSize: 16,
    fontWeight: '900',
  },
  secondary: {
    marginTop: 2,
    color: V.colors.mutedFg,
    fontSize: 13,
  },
});
