import React from 'react';
import {TextInput, type TextInputProps} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export type KolamTextFieldProps = TextInputProps;

export function KolamTextField({
  placeholderTextColor = V.colors.mutedFg,
  ...props
}: KolamTextFieldProps) {
  return <TextInput placeholderTextColor={placeholderTextColor} {...props} />;
}
