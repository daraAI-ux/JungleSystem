import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const serverMetricsStripStyles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    flexShrink: 0,
    maxWidth: 330,
  },
  badge: {
    minWidth: 64,
    justifyContent: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  text: {
    fontFamily: V.fontFamily,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
});
