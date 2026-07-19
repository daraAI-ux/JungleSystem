import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const readinessStyles = StyleSheet.create({
  status: {
    alignSelf: 'flex-start',
  },
  label: {
    marginTop: 7,
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '900',
  },
  detail: {
    marginTop: 5,
    color: V.colors.mutedFg,
    fontSize: 11,
    lineHeight: 15,
  },
  evidence: {
    marginTop: 7,
    color: V.colors.mutedFg,
    fontSize: 10,
    fontWeight: '800',
  },
});
