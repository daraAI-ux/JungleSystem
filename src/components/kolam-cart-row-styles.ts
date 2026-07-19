import {StyleSheet} from 'react-native';
import {getKolamFormVisualContract} from '../domain/kolam-form';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

const KOLAM_FORM_VISUAL = getKolamFormVisualContract();
const liveInputShadow = {
  shadowColor: V.colors.fg,
  shadowOffset: {width: 0, height: 1},
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 1,
};

export const cartRowStyles = StyleSheet.create({
  cartRow: {
    minHeight: V.layout.tableRowMinHeight,
    paddingVertical: V.layout.tableCellPaddingY,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
  },
  cartItemInfo: {
    marginBottom: 8,
  },
  cartItemName: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '900',
  },
  cartItemMeta: {
    marginTop: 2,
    color: V.colors.mutedFg,
    fontSize: 13,
  },
  cartActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  cartSubtotal: {
    flex: 1,
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'right',
  },
  lineDiscountLabel: {
    marginBottom: 6,
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  lineDiscountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lineDiscountInput: {
    minHeight: KOLAM_FORM_VISUAL.input.height,
    flex: 1,
    paddingHorizontal: V.control.inputPaddingX,
    borderRadius: KOLAM_FORM_VISUAL.input.radius,
    color: V.colors.fg,
    backgroundColor: V.colors.bg,
    borderColor: V.colors.input,
    borderWidth: 1,
    fontFamily: V.fontFamily,
    fontSize: KOLAM_FORM_VISUAL.input.fontSize,
    ...liveInputShadow,
  },
});
