import React from 'react';
import {View} from 'react-native';
import {KolamSearchFieldIcon} from './kolam-search-field-icon';
import {KolamSearchFieldInput} from './kolam-search-field-input';
import {KolamSearchFieldTrailingLabel} from './kolam-search-field-trailing-label';
import {type KolamSearchFieldProps} from './kolam-search-field-types';
import {searchFieldStyles as styles} from './kolam-search-field-styles';

export type {KolamSearchFieldProps};

export function KolamSearchField({
  accessibilityLabel,
  value,
  onChangeText,
  placeholder,
  autoFocus = false,
  containerStyle,
  style,
  inputRef,
  inputStyle,
  trailingLabel,
}: KolamSearchFieldProps) {
  return (
    <View style={[styles.field, containerStyle, style]}>
      <KolamSearchFieldIcon />
      <KolamSearchFieldInput
        accessibilityLabel={accessibilityLabel}
        value={value}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
        inputRef={inputRef}
        placeholder={placeholder}
        inputStyle={inputStyle}
      />
      <KolamSearchFieldTrailingLabel trailingLabel={trailingLabel} />
    </View>
  );
}
