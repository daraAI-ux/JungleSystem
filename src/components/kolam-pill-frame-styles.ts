import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const pillFrameStyles = StyleSheet.create({
  state: {
    minHeight: 26,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 9,
    borderRadius: V.radius.sm,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  stateSelected: {
    borderColor: V.colors.primary,
    backgroundColor: V.colors.infoSoft,
  },
  stateDisabled: {
    opacity: 0.78,
  },
  selector: {
    minHeight: V.control.buttonSmHeight,
    justifyContent: 'center',
    paddingHorizontal: V.control.buttonPaddingX,
    borderRadius: V.radius.lg,
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  selectorSelected: {
    backgroundColor: V.colors.primary,
    borderColor: V.colors.primary,
  },
});
