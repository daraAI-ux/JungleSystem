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

export const catalogModuleStyles = StyleSheet.create({
  searchInput: {
    minHeight: V.control.inputHeight,
    marginBottom: 14,
    paddingHorizontal: V.control.inputPaddingX,
    borderRadius: V.radius.lg,
    color: V.colors.fg,
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderWidth: 1,
    fontSize: V.control.fontSize,
  },
  dataTable: {
    overflow: 'hidden',
    ...LIVE_CARD_CHROME,
  },
});
