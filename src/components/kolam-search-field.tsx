import React from 'react';
import {View} from 'react-native';
import {KolamSearchFieldIcon} from './kolam-search-field-icon';
import {KolamSearchFieldInput} from './kolam-search-field-input';
import {KolamSearchFieldTrailingLabel} from './kolam-search-field-trailing-label';
import {type KolamSearchFieldProps} from './kolam-search-field-types';
import {searchFieldStyles as styles} from './kolam-search-field-styles';

export type {KolamSearchFieldProps};

export function KolamSearchField({
  value,
  onChangeText,
  placeholder,
  autoFocus = false,
  containerStyle,
  inputStyle,
  trailingLabel,
}: KolamSearchFieldProps) {
  return (
    <View style={[styles.field, containerStyle]}>
      <KolamSearchFieldIcon />
      <KolamSearchFieldInput
        value={value}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
        placeholder={placeholder}
        inputStyle={inputStyle}
      />
      <KolamSearchFieldTrailingLabel trailingLabel={trailingLabel} />
    </View>
  );
}
