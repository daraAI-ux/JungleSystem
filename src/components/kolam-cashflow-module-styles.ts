import {
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import {getKolamFormVisualContract} from '../domain/kolam-form';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

const KOLAM_FORM_VISUAL = getKolamFormVisualContract();
const LIVE_CARD_SHADOW = {
  shadowColor: V.colors.fg,
  shadowOffset: {width: 0, height: V.surface.cardShadow.offsetY},
  shadowOpacity: V.surface.cardShadow.opacity,
  shadowRadius: V.surface.cardShadow.radius,
  elevation: V.surface.cardShadow.elevation,
} satisfies ViewStyle;
const LIVE_INPUT_SHADOW = LIVE_CARD_SHADOW;

export const cashflowModuleStyles = StyleSheet.create({
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: KOLAM_FORM_VISUAL.fieldGrid.gap,
  },
  formInput: {
    minWidth: 190,
    minHeight: KOLAM_FORM_VISUAL.input.height,
    flexGrow: 1,
    paddingHorizontal: V.control.inputPaddingX,
    borderRadius: KOLAM_FORM_VISUAL.input.radius,
    color: V.colors.fg,
    backgroundColor: V.colors.bg,
    borderColor: V.colors.input,
    borderWidth: 1,
    fontFamily: V.fontFamily,
    fontSize: KOLAM_FORM_VISUAL.input.fontSize,
    ...LIVE_INPUT_SHADOW,
  },
  moduleActionControl: {
    marginTop: 14,
  },
});
