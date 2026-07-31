import React from 'react';
import {TextInput, type TextInputProps} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export type KolamTextFieldProps = TextInputProps;

export const KolamTextField = React.forwardRef<TextInput, KolamTextFieldProps>(
  ({placeholderTextColor = V.colors.mutedFg, ...props}, ref) => (
    <TextInput
      ref={ref}
      placeholderTextColor={placeholderTextColor}
      {...props}
    />
  ),
);

KolamTextField.displayName = 'KolamTextField';
