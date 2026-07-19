import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {ModuleNavIconGlyphProps} from './kolam-module-nav-icon-types';

export function ModuleNavSalesIcon({tintStyle}: ModuleNavIconGlyphProps) {
  return (
    <View style={styles.salesIcon}>
      <View style={[styles.salesBarOne, tintStyle]} />
      <View style={[styles.salesBarTwo, tintStyle]} />
      <View style={[styles.salesBarThree, tintStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  salesIcon: {
    width: 17,
    height: 17,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2,
  },
  salesBarOne: {
    width: 4,
    height: 7,
    borderRadius: 2,
  },
  salesBarTwo: {
    width: 4,
    height: 12,
    borderRadius: 2,
  },
  salesBarThree: {
    width: 4,
    height: 16,
    borderRadius: 2,
  },
});
