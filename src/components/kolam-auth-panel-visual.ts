import type {ViewStyle} from 'react-native';
import {getKolamFormVisualContract} from '../domain/kolam-form';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const KOLAM_AUTH_FORM_VISUAL = getKolamFormVisualContract();

export const KOLAM_AUTH_CARD_SHADOW = {
  shadowColor: V.colors.fg,
  shadowOffset: {width: 0, height: V.surface.cardShadow.offsetY},
  shadowOpacity: V.surface.cardShadow.opacity,
  shadowRadius: V.surface.cardShadow.radius,
  elevation: V.surface.cardShadow.elevation,
} satisfies ViewStyle;

export const KOLAM_AUTH_INPUT_SHADOW = KOLAM_AUTH_CARD_SHADOW;
