import React from 'react';
import type {TextInputProps} from 'react-native';
import {kolamFormControlStyles} from './kolam-form-control-styles';
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
  multiline,
  secureTextEntry,
  style,
  ...props
}: KolamFormTextFieldProps) {
  const modeProps = getKolamFormTextFieldModeProps(mode);

  return (
    <KolamTextField
      {...props}
      autoCapitalize={autoCapitalize ?? modeProps.autoCapitalize}
      keyboardType={keyboardType ?? modeProps.keyboardType}
      multiline={multiline}
      secureTextEntry={secureTextEntry ?? modeProps.secureTextEntry}
      style={[
        kolamFormControlStyles.input,
        multiline ? kolamFormControlStyles.inputMultiline : null,
        style,
      ]}
      textAlignVertical={
        props.textAlignVertical ?? (multiline ? 'top' : 'center')
      }
    />
  );
}

function getKolamFormTextFieldModeProps(
  mode: KolamFormTextFieldMode,
): Pick<TextInputProps, 'autoCapitalize' | 'keyboardType' | 'secureTextEntry'> {
  switch (mode) {
    case 'email':
      return {autoCapitalize: 'none', keyboardType: 'email-address'};
    case 'numeric':
      return {keyboardType: 'numeric'};
    case 'password':
      return {autoCapitalize: 'none', secureTextEntry: true};
    case 'search':
      return {autoCapitalize: 'none'};
    case 'url':
      return {autoCapitalize: 'none', keyboardType: 'url'};
    case 'text':
    default:
      return {};
  }
}
