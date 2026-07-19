import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {View} from 'react-native';
import {KolamSearchIcon} from './kolam-search-icon';
import type {KolamFilterBarControl} from './kolam-filter-bar-types';
import {filterBarStyles as styles} from './kolam-filter-bar-styles';

export function KolamFilterSearchControl({
  control,
}: {
  control: KolamFilterBarControl;
}) {
  return (
    <View
      style={[
        styles.search,
        control.triggerWidth === 'min-w-64' && styles.searchWide,
      ]}>
      <KolamSearchIcon variant="filter" />
      <KolamCopyStack
        items={[
          {
            id: 'placeholder',
            text: control.placeholder,
            style: styles.placeholder,
          },
        ]}
      />
    </View>
  );
}
