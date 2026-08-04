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

/** FE marketing KPI strip: wrap tiles with intrinsic min size (~2–4 cols). */
const STATS_CARD_SLOT_MIN_WIDTH = 160;

export const statsCardStripStyles = StyleSheet.create({
  grid: {
    alignItems: 'stretch',
    backgroundColor: V.colors.bg,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: V.layout.tableCellPaddingX,
    paddingVertical: 12,
  },
  /** Flex child of the strip — own basis so tiles wrap instead of crushing. */
  cardSlot: {
    flexBasis: STATS_CARD_SLOT_MIN_WIDTH,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: STATS_CARD_SLOT_MIN_WIDTH,
  },
  card: {
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    flex: 1,
    minHeight: 82,
    padding: 12,
    width: '100%',
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
