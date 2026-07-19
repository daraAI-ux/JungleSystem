import React from 'react';
import {View} from 'react-native';
import {filterBarStyles as styles} from './kolam-filter-bar-styles';

export function KolamRefreshIcon() {
  return (
    <View style={styles.refreshIcon}>
      <View style={styles.refreshArc} />
      <View style={styles.refreshArrow} />
    </View>
  );
}
