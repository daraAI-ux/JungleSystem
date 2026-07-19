import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const actionFrameStyles = StyleSheet.create({
  text: {
    minHeight: 28,
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: V.radius.lg,
  },
  table: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
  textLabelPrimaryUnderline: {
    color: V.colors.primary,
    textDecorationLine: 'underline',
  },
});
