import React from 'react';
import { KolamFormTextField } from './kolam-form-text-field';
import { textFieldRowStyles as styles } from './kolam-text-field-row-styles';
import type { KolamTextFieldRowProps } from './kolam-text-field-row-types';

type KolamTextFieldRowInputProps = Pick<
  KolamTextFieldRowProps,
  | 'fieldWidth'
  | 'multiline'
  | 'numberOfLines'
  | 'onChangeText'
  | 'placeholder'
  | 'value'
>;

export function KolamTextFieldRowInput({
  fieldWidth,
  multiline,
  numberOfLines,
  onChangeText,
  placeholder,
  value,
}: KolamTextFieldRowInputProps) {
  return (
    <KolamFormTextField
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      numberOfLines={numberOfLines}
      placeholder={placeholder}
      style={[
        styles.input,
        multiline && styles.multilineInput,
        { width: fieldWidth },
      ]}
      textAlignVertical={multiline ? 'top' : undefined}
    />
  );
}
