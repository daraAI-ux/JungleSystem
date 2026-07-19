import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {
  KOLAM_CUSTOMER_CARD_CHROME,
  KOLAM_CUSTOMER_FORM_VISUAL,
  KOLAM_CUSTOMER_INPUT_SHADOW,
} from './kolam-customer-module-visual';

export const customerModuleStyles = StyleSheet.create({
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: KOLAM_CUSTOMER_FORM_VISUAL.fieldGrid.gap,
  },
  formInput: {
    minWidth: 190,
    minHeight: KOLAM_CUSTOMER_FORM_VISUAL.input.height,
    flexGrow: 1,
    paddingHorizontal: V.control.inputPaddingX,
    borderRadius: KOLAM_CUSTOMER_FORM_VISUAL.input.radius,
    color: V.colors.fg,
    backgroundColor: V.colors.bg,
    borderColor: V.colors.input,
    borderWidth: 1,
    fontFamily: V.fontFamily,
    fontSize: KOLAM_CUSTOMER_FORM_VISUAL.input.fontSize,
    ...KOLAM_CUSTOMER_INPUT_SHADOW,
  },
  formSubmitControl: {
    marginLeft: 'auto',
    borderRadius: KOLAM_CUSTOMER_FORM_VISUAL.input.radius,
  },
  dataTable: {
    overflow: 'hidden',
    ...KOLAM_CUSTOMER_CARD_CHROME,
  },
});
