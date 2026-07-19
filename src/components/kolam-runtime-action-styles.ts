import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const runtimeActionStyles = StyleSheet.create({
  runtimeActionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  runtimeActionCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  runtimeActionCardTitle: {
    flex: 1,
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '900',
  },
  runtimeActionDescription: {
    marginTop: 8,
    color: V.colors.mutedFg,
    fontSize: 11,
    lineHeight: 16,
  },
  runtimeActionContract: {
    marginTop: 8,
    color: V.colors.info,
    fontSize: 10,
    fontWeight: '800',
  },
});
