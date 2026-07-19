import React from 'react';
import {KolamFormTextField} from './kolam-form-text-field';
import {textFieldRowStyles as styles} from './kolam-text-field-row-styles';
import type {KolamTextFieldRowProps} from './kolam-text-field-row-types';

type KolamTextFieldRowInputProps = Pick<
  KolamTextFieldRowProps,
  'fieldWidth' | 'onChangeText' | 'placeholder' | 'value'
>;

export function KolamTextFieldRowInput({
  fieldWidth,
  onChangeText,
  placeholder,
  value,
}: KolamTextFieldRowInputProps) {
  return (
    <KolamFormTextField
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      style={[styles.input, {width: fieldWidth}]}
    />
  );
}
