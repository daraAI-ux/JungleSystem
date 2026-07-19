import React from 'react';
import type {TextInputProps} from 'react-native';
import {KolamTextField, type KolamTextFieldProps} from './kolam-text-field';

export type KolamFormTextFieldMode =
  | 'email'
  | 'numeric'
  | 'password'
  | 'search'
  | 'text'
  | 'url';

export interface KolamFormTextFieldProps extends KolamTextFieldProps {
  mode?: KolamFormTextFieldMode;
}

export function KolamFormTextField({
  autoCapitalize,
  keyboardType,
  mode = 'text',
  secureTextEntry,
  ...props
}: KolamFormTextFieldProps) {
  const modeProps = getKolamFormTextFieldModeProps(mode);

  return (
    <KolamTextField
      {...props}
      autoCapitalize={autoCapitalize ?? modeProps.autoCapitalize}
      keyboardType={keyboardType ?? modeProps.keyboardType}
      secureTextEntry={secureTextEntry ?? modeProps.secureTextEntry}
    />
  );
}

function getKolamFormTextFieldModeProps(
  mode: KolamFormTextFieldMode,
): Pick<TextInputProps, 'autoCapitalize' | 'keyboardType' | 'secureTextEntry'> {
  switch (mode) {
    case 'email':
      return {
        autoCapitalize: 'none',
        keyboardType: 'email-address',
      };
    case 'numeric':
      return {
        keyboardType: 'numeric',
      };
    case 'password':
      return {
        secureTextEntry: true,
      };
    case 'search':
    case 'url':
      return {
        autoCapitalize: 'none',
      };
    case 'text':
    default:
      return {};
  }
}
