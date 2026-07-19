import React from 'react';
import type {KolamSearchFieldProps} from './kolam-search-field-types';
import {searchFieldStyles as styles} from './kolam-search-field-styles';
import {KolamTextField} from './kolam-text-field';

type SearchInputProps = Pick<
  KolamSearchFieldProps,
  'autoFocus' | 'inputStyle' | 'onChangeText' | 'placeholder' | 'value'
>;

export function KolamSearchFieldInput({
  autoFocus = false,
  inputStyle,
  onChangeText,
  placeholder,
  value,
}: SearchInputProps) {
  return (
    <KolamTextField
      value={value}
      onChangeText={onChangeText}
      autoCapitalize="none"
      autoFocus={autoFocus}
      placeholder={placeholder}
      style={[styles.input, inputStyle]}
    />
  );
}
