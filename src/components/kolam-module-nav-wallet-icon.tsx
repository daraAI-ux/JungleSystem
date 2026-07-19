import React from 'react';
import {StyleSheet, View} from 'react-native';
import {
  transparent,
  type ModuleNavIconGlyphProps,
} from './kolam-module-nav-icon-types';

export function ModuleNavWalletIcon({tintStyle}: ModuleNavIconGlyphProps) {
  return (
    <View style={styles.walletIcon}>
      <View style={[styles.walletBody, tintStyle]} />
      <View style={[styles.walletDot, tintStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  walletIcon: {
    width: 18,
    height: 15,
    justifyContent: 'center',
  },
  walletBody: {
    width: 17,
    height: 12,
    borderRadius: 4,
    borderWidth: 2,
    backgroundColor: transparent,
  },
  walletDot: {
    position: 'absolute',
    right: 3,
    width: 3,
    height: 3,
    borderRadius: 2,
  },
});
