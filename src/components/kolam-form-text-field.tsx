import React from 'react';
import type {TextInputProps} from 'react-native';
import {StyleSheet, Text, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
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
  label?: string;
  mode?: KolamFormTextFieldMode;
  nestedScrollEnabled?: boolean;
}

export function KolamFormTextField({
  autoCapitalize,
  keyboardType,
  label,
  mode = 'text',
  multiline,
  nestedScrollEnabled,
  secureTextEntry,
  style,
  ...props
}: KolamFormTextFieldProps) {
  const modeProps = getKolamFormTextFieldModeProps(mode);
  const input = (
    <KolamTextField
      {...props}
      {...({nestedScrollEnabled} as TextInputProps)}
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

  if (!label) {
    return input;
  }

  return (
    <View style={styles.fieldStack}>
      <Text style={styles.label}>{label}</Text>
      {input}
    </View>
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

const styles = StyleSheet.create({
  fieldStack: {
    gap: 6,
  },
  label: {
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '700',
  },
});
