import React from 'react';
import {View} from 'react-native';
import {KolamSearchIcon} from './kolam-search-icon';
import type {KolamFilterBarControl} from './kolam-filter-bar-types';
import {filterBarStyles as styles} from './kolam-filter-bar-styles';
import {KolamFormTextField} from './kolam-form-text-field';

export function KolamFilterSearchControl({
  control,
  value = '',
  onChange,
}: {
  control: KolamFilterBarControl;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <View
      style={[
        styles.search,
        control.triggerWidth === 'min-w-64' && styles.searchWide,
      ]}>
      <KolamSearchIcon variant="filter" />
      <KolamFormTextField
        mode="search"
        value={value}
        onChangeText={onChange}
        placeholder={control.placeholder}
        style={styles.searchInput}
      />
    </View>
  );
}
