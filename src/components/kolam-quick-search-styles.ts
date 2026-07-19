import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const quickSearchStyles = StyleSheet.create({
  quickSearch: {
    minHeight: V.layout.quickSearchHeight,
    marginBottom: 18,
    paddingHorizontal: 10,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  quickSearchCollapsed: {
    width: 36,
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 0,
    marginBottom: 14,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  identityCollapsed: {
    justifyContent: 'center',
    gap: 0,
  },
  text: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  key: {
    overflow: 'hidden',
    paddingHorizontal: V.control.badgePaddingX,
    paddingVertical: V.control.badgePaddingY,
    borderRadius: V.control.badgeRadius,
    backgroundColor: V.colors.muted,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: V.control.badgeFontSize,
    fontWeight: '700',
  },
});
