import React from 'react';
import {View} from 'react-native';
import {searchFieldStyles as styles} from './kolam-search-field-styles';

export function KolamSearchFieldIcon() {
  return (
    <View style={styles.icon}>
      <View style={styles.lens} />
      <View style={styles.handle} />
    </View>
  );
}
