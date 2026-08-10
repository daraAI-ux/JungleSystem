import React from 'react';
import type {KolamSearchFieldProps} from './kolam-search-field-types';
import {searchFieldStyles as styles} from './kolam-search-field-styles';
import {KolamTextField} from './kolam-text-field';

type SearchInputProps = Pick<
  KolamSearchFieldProps,
  | 'accessibilityLabel'
  | 'autoFocus'
  | 'inputRef'
  | 'inputStyle'
  | 'onChangeText'
  | 'placeholder'
  | 'value'
>;

export function KolamSearchFieldInput({
  accessibilityLabel,
  autoFocus = false,
  inputRef,
  inputStyle,
  onChangeText,
  placeholder,
  value,
}: SearchInputProps) {
  return (
    <KolamTextField
      ref={inputRef}
      accessibilityLabel={accessibilityLabel}
      value={value}
      onChangeText={onChangeText}
      autoCapitalize="none"
      autoFocus={autoFocus}
      placeholder={placeholder}
      style={[styles.input, inputStyle]}
    />
  );
}
