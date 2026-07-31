import {Platform, StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

/**
 * Shared chrome for form controls (text input + select trigger).
 * Keeps height identical across modules so rows stay aligned on Windows.
 */
export const kolamFormControlStyles = StyleSheet.create({
  input: {
    height: V.control.inputHeight,
    minHeight: V.control.inputHeight,
    maxHeight: V.control.inputHeight,
    paddingHorizontal: V.control.inputPaddingX,
    paddingVertical: 0,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: V.control.fontSize,
    fontWeight: '700',
    ...(Platform.OS === 'android' ? {textAlignVertical: 'center' as const} : {}),
  },
  inputMultiline: {
    height: undefined,
    minHeight: 96,
    maxHeight: undefined,
    paddingVertical: 10,
    ...(Platform.OS === 'android' ? {textAlignVertical: 'top' as const} : {}),
  },
  trigger: {
    height: V.control.inputHeight,
    minHeight: V.control.inputHeight,
    maxHeight: V.control.inputHeight,
    paddingHorizontal: V.control.inputPaddingX,
    paddingVertical: 0,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
});
