import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const checkoutSummaryStyles = StyleSheet.create({
  checkoutPane: {
    width: 390,
    padding: V.layout.cardSpacing,
    borderRadius: 8,
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  checkoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 18,
    fontWeight: '700',
  },
  cartList: {
    marginTop: 14,
    gap: 10,
  },
  totalBox: {
    marginTop: 16,
    paddingTop: 12,
  },
  adjustmentBox: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  adjustmentLabel: {
    marginBottom: 6,
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  adjustmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  adjustmentInput: {
    minHeight: V.control.inputHeight,
    flex: 1,
    paddingHorizontal: V.control.inputPaddingX,
    borderRadius: V.radius.lg,
    color: V.colors.fg,
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderWidth: 1,
    fontSize: V.control.fontSize,
  },
  adjustmentInputFull: {
    minHeight: V.control.inputHeight,
    paddingHorizontal: V.control.inputPaddingX,
    borderRadius: V.radius.lg,
    color: V.colors.fg,
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderWidth: 1,
    fontSize: V.control.fontSize,
  },
  totalDivider: {
    height: 1,
    marginVertical: 8,
    backgroundColor: V.colors.border,
  },
});
