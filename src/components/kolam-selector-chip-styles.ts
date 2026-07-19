import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const selectorChipStyles = StyleSheet.create({
  text: {
    color: V.colors.mutedFg,
    fontSize: V.control.badgeFontSize,
    fontWeight: '700',
  },
  textActive: {
    color: V.colors.primaryFg,
  },
});
