import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const statePillGroupStyles = StyleSheet.create({
  label: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '900',
  },
  labelSelected: {
    color: V.colors.info,
  },
  labelDisabled: {
    color: V.colors.mutedFg,
  },
});
