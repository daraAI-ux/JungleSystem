import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  transparent,
  type ModuleNavIconGlyphProps,
} from './kolam-module-nav-icon-types';

export function ModuleNavPreparationIcon({
  tintStyle,
}: ModuleNavIconGlyphProps) {
  return (
    <View style={styles.preparationIcon}>
      <View style={[styles.preparationBoard, tintStyle]} />
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
  preparationBoard: {
    position: 'absolute',
    left: 3,
    top: 4,
    width: 11,
    height: 12,
    borderRadius: 3,
    borderWidth: 2,
    backgroundColor: transparent,
  },
  preparationClip: {
    position: 'absolute',
    left: 6,
    top: 2,
    width: 5,
    height: 3,
    borderRadius: 2,
  },
  preparationLineTop: {
    position: 'absolute',
    left: 6,
    top: 9,
    width: 6,
    height: 2,
    borderRadius: 999,
  },
  preparationLineBottom: {
    position: 'absolute',
    left: 6,
    top: 13,
    width: 4,
    height: 2,
    borderRadius: 999,
  },
});
