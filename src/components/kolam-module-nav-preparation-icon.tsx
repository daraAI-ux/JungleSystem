import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { ModuleNavIconGlyphProps } from './kolam-module-nav-icon-types';

export function ModuleNavPreparationIcon({
  tintStyle,
}: ModuleNavIconGlyphProps) {
  return (
    <View style={styles.preparationIcon}>
      <View style={[styles.preparationBase, tintStyle]} />
      <View style={[styles.preparationClip, tintStyle]} />
      <View style={[styles.preparationLineTop, tintStyle]} />
      <View style={[styles.preparationLineBottom, tintStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  preparationIcon: {
    width: 17,
    height: 18,
  },
  preparationBase: {
    position: 'absolute',
    left: 3,
    top: 3,
    width: 11,
    height: 13,
    borderRadius: 3,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  preparationClip: {
    position: 'absolute',
    left: 6,
    top: 1,
    width: 5,
    height: 4,
    borderRadius: 2,
  },
  preparationLineTop: {
    position: 'absolute',
    left: 6,
    top: 8,
    width: 5,
    height: 2,
    borderRadius: 999,
  },
  preparationLineBottom: {
    position: 'absolute',
    left: 6,
    top: 12,
    width: 4,
    height: 2,
    borderRadius: 999,
  },
});
