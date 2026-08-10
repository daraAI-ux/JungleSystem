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

/**
 * Shared stats KPI strip — equal flex tiles that fill the wrapper width
 * (FE marketing hub `repeat(N, 1fr)`). No fixed tile minWidth/basis.
 */
export const statsCardStripStyles = StyleSheet.create({
  grid: {
    alignItems: 'stretch',
    alignSelf: 'stretch',
    backgroundColor: V.colors.bg,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 12,
    width: '100%',
  },
  card: {
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minHeight: 82,
    minWidth: 0,
    padding: 12,
    ...CARD_SHADOW,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  iconWrap: {
    height: 28,
    width: 28,
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
