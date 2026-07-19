import {
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

const LIVE_CARD_SHADOW = {
  shadowColor: V.colors.fg,
  shadowOffset: {width: 0, height: V.surface.cardShadow.offsetY},
  shadowOpacity: V.surface.cardShadow.opacity,
  shadowRadius: V.surface.cardShadow.radius,
  elevation: V.surface.cardShadow.elevation,
} satisfies ViewStyle;

const LIVE_CARD_CHROME = {
  borderRadius: V.surface.cardChrome.radius,
  backgroundColor: V.colors.bg,
  borderColor: V.colors.border,
  borderWidth: V.surface.cardChrome.borderWidth,
  ...LIVE_CARD_SHADOW,
} satisfies ViewStyle;

export const statusPanelFrameStyles = StyleSheet.create({
  statusPanelFrame: {
    marginBottom: 18,
    overflow: 'hidden',
    ...LIVE_CARD_CHROME,
  },
  statusPanelHeader: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: V.layout.cardSpacing,
    paddingTop: V.layout.cardCompactSpacing,
    paddingBottom: 12,
    backgroundColor: V.colors.bg,
  },
  statusPanelTitleRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusPanelGlyph: {
    width: 24,
    height: 24,
    borderRadius: V.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.infoSoft,
  },
  statusPanelCopy: {
    flex: 1,
    minWidth: 0,
  },
  statusPanelTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  statusPanelDescription: {
    marginTop: 3,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
  statusPanelMeta: {
    overflow: 'hidden',
    maxWidth: 360,
    alignSelf: 'flex-start',
    paddingHorizontal: V.control.badgePaddingX,
    paddingVertical: V.control.badgePaddingY,
    borderRadius: V.control.badgeRadius,
    color: V.colors.info,
    backgroundColor: V.colors.infoSoft,
    fontFamily: V.fontFamily,
    fontSize: V.control.badgeFontSize,
    fontWeight: '800',
    textAlign: 'right',
  },
  statusPanelBody: {
    paddingHorizontal: V.layout.cardSpacing,
    paddingBottom: V.layout.cardSpacing,
    paddingTop: V.layout.cardCompactSpacing,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
  },
});
