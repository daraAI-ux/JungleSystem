import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const avatarPillListStyles = StyleSheet.create({
  pill: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 3,
    paddingRight: 10,
    borderRadius: 999,
    backgroundColor: V.colors.muted,
  },
  avatar: {
    overflow: 'hidden',
    width: 22,
    height: 22,
    borderRadius: 999,
    color: V.colors.primary,
    backgroundColor: V.colors.successSoft,
    fontFamily: V.fontFamily,
    fontSize: 9,
    fontWeight: '900',
    lineHeight: 22,
    textAlign: 'center',
  },
  name: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
  empty: {
    marginTop: 8,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
});
