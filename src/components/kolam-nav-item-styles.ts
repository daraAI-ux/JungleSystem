import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

const transparent = 'transparent';

export const navItemStyles = StyleSheet.create({
  item: {
    minHeight: V.layout.navItemHeight,
    justifyContent: 'center',
    marginBottom: 2,
    paddingHorizontal: V.layout.navItemPaddingX,
    paddingVertical: 8,
    borderRadius: V.radius.lg,
    borderColor: transparent,
    borderWidth: 1,
  },
  itemCollapsed: {
    width: 36,
    minHeight: 36,
    marginBottom: 6,
    paddingHorizontal: 3,
    paddingVertical: 3,
    alignItems: 'center',
  },
  itemActive: {
    backgroundColor: V.colors.primarySoft,
    borderColor: transparent,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bodyCollapsed: {
    justifyContent: 'center',
    gap: 0,
  },
  glyph: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: V.radius.md,
    backgroundColor: transparent,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  text: {
    flex: 1,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  textActive: {
    color: V.colors.primary,
  },
  badge: {
    minWidth: 22,
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: V.control.badgeRadius,
    color: V.colors.mutedFg,
    backgroundColor: V.colors.muted,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  badgeActive: {
    color: V.colors.primary,
    backgroundColor: V.colors.bg,
  },
});
