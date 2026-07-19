import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const summaryCardListStyles = StyleSheet.create({
  list: {
    marginTop: 12,
    flexDirection: 'row',
  },
  panelList: {
    gap: 8,
  },
  compactList: {
    flexWrap: 'wrap',
    gap: 6,
  },
  card: {
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  panelCard: {
    flex: 1,
    minHeight: 74,
    padding: 10,
    borderRadius: V.radius.lg,
    backgroundColor: V.colors.secondary,
  },
  compactCard: {
    minWidth: 142,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: V.radius.md,
    backgroundColor: V.colors.bg,
  },
  panelTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  compactTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  panelMeta: {
    marginTop: 3,
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '900',
  },
  compactMeta: {
    marginTop: 3,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '800',
  },
  badges: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  badge: {
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: V.control.badgeRadius,
    color: V.colors.mutedFg,
    backgroundColor: V.colors.bg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '800',
  },
});
