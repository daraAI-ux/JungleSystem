import React from 'react';
import {StyleSheet, View} from 'react-native';
import {
  transparent,
  type ModuleNavIconGlyphProps,
} from './kolam-module-nav-icon-types';

export function ModuleNavCartIcon({tintStyle}: ModuleNavIconGlyphProps) {
  return (
    <View style={styles.cartIcon}>
      <View style={[styles.cartBasket, tintStyle]} />
      <View style={[styles.cartHandle, tintStyle]} />
      <View style={[styles.cartWheelLeft, tintStyle]} />
      <View style={[styles.cartWheelRight, tintStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  cartIcon: {
    width: 18,
    height: 17,
  },
  cartBasket: {
    position: 'absolute',
    left: 3,
    bottom: 4,
    width: 12,
    height: 8,
    borderRadius: 2,
    borderWidth: 2,
    backgroundColor: transparent,
  },
  cartHandle: {
    position: 'absolute',
    left: 1,
    top: 2,
    width: 8,
    height: 2,
    borderRadius: 999,
    transform: [{rotate: '25deg'}],
  },
  cartWheelLeft: {
    position: 'absolute',
    left: 5,
    bottom: 1,
    width: 3,
    height: 3,
    borderRadius: 2,
  },
  cartWheelRight: {
    position: 'absolute',
    right: 4,
    bottom: 1,
    width: 3,
    height: 3,
    borderRadius: 2,
  },
});
