import React from 'react';
import {StyleSheet, View} from 'react-native';
import {
  transparent,
  type ModuleNavIconGlyphProps,
} from './kolam-module-nav-icon-types';

export function ModuleNavCatalogIcon({tintStyle}: ModuleNavIconGlyphProps) {
  return (
    <View style={styles.catalogIcon}>
      <View style={[styles.catalogBox, tintStyle]} />
      <View style={[styles.catalogLid, tintStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  catalogIcon: {
    width: 17,
    height: 16,
  },
  catalogBox: {
    position: 'absolute',
    left: 2,
    right: 2,
    bottom: 1,
    height: 10,
    borderRadius: 3,
    borderWidth: 2,
    backgroundColor: transparent,
  },
  catalogLid: {
    position: 'absolute',
    left: 4,
    top: 1,
    width: 9,
    height: 2,
    borderRadius: 999,
  },
});
