import {
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

const CARD_SHADOW = {
  shadowColor: V.colors.fg,
  shadowOffset: {width: 0, height: V.surface.cardShadow.offsetY},
  shadowOpacity: V.surface.cardShadow.opacity,
  shadowRadius: V.surface.cardShadow.radius,
  elevation: V.surface.cardShadow.elevation,
} satisfies ViewStyle;

export const statsCardStripStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: V.layout.tableCellPaddingX,
    paddingVertical: 12,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    backgroundColor: V.colors.bg,
  },
  card: {
    flex: 1,
    minHeight: 82,
    padding: 12,
    borderRadius: V.radius.lg,
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderWidth: 1,
    ...CARD_SHADOW,
  },
  label: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  value: {
    marginTop: 6,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 20,
    fontWeight: '900',
  },
  valueSuccess: {
    color: V.colors.success,
  },
  valueWarning: {
    color: V.colors.warning,
  },
  valueMuted: {
    color: V.colors.mutedFg,
  },
  detail: {
    marginTop: 5,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    lineHeight: 14,
  },
});
