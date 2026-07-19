import type {ViewStyle} from 'react-native';
import {getKolamFormVisualContract} from '../domain/kolam-form';
import {getKolamTableVisualContract} from '../domain/kolam-table';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const KOLAM_CUSTOMER_FORM_VISUAL = getKolamFormVisualContract();
export const KOLAM_CUSTOMER_TABLE_VISUAL = getKolamTableVisualContract();

export const KOLAM_CUSTOMER_CARD_SHADOW = {
  shadowColor: V.colors.fg,
  shadowOffset: {width: 0, height: V.surface.cardShadow.offsetY},
  shadowOpacity: V.surface.cardShadow.opacity,
  shadowRadius: V.surface.cardShadow.radius,
  elevation: V.surface.cardShadow.elevation,
} satisfies ViewStyle;

export const KOLAM_CUSTOMER_CARD_CHROME = {
  borderRadius: V.surface.cardChrome.radius,
  backgroundColor: V.colors.bg,
  borderColor: V.colors.border,
  borderWidth: V.surface.cardChrome.borderWidth,
  ...KOLAM_CUSTOMER_CARD_SHADOW,
} satisfies ViewStyle;

export const KOLAM_CUSTOMER_INPUT_SHADOW = KOLAM_CUSTOMER_CARD_SHADOW;
