import {StyleSheet, type ViewStyle} from 'react-native';
import {getKolamFormVisualContract} from '../domain/kolam-form';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

const KOLAM_FORM_VISUAL = getKolamFormVisualContract();
const INPUT_SHADOW = {
  shadowColor: V.colors.fg,
  shadowOffset: {width: 0, height: V.surface.cardShadow.offsetY},
  shadowOpacity: V.surface.cardShadow.opacity,
  shadowRadius: V.surface.cardShadow.radius,
  elevation: V.surface.cardShadow.elevation,
} satisfies ViewStyle;

export const textFieldRowStyles = StyleSheet.create({
  row: {
    minHeight: V.layout.tableRowMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: V.layout.tableCellPaddingX,
    paddingVertical: V.layout.tableCellPaddingY,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
  },
  description: {
    marginTop: 3,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    lineHeight: 16,
  },
  input: {
    minHeight: KOLAM_FORM_VISUAL.input.height,
    paddingHorizontal: V.control.inputPaddingX,
    borderRadius: KOLAM_FORM_VISUAL.input.radius,
    borderColor: V.colors.input,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: KOLAM_FORM_VISUAL.input.fontSize,
    fontWeight: '800',
    ...INPUT_SHADOW,
  },
});
