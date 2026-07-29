import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { ModuleNavIconGlyphProps } from './kolam-module-nav-icon-types';

export function ModuleNavWalletIcon({ tintStyle }: ModuleNavIconGlyphProps) {
  return (
    <View style={styles.financeIcon}>
      <View style={[styles.financeBarShort, tintStyle]} />
      <View style={[styles.financeBarTall, tintStyle]} />
      <View style={[styles.financeBarMid, tintStyle]} />
      <View style={[styles.financeCoin, tintStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  financeIcon: {
    width: 18,
    height: 17,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2,
  },
  financeBarShort: {
    width: 4,
    height: 8,
    borderRadius: 2,
  },
  financeBarTall: {
    width: 4,
    height: 14,
    borderRadius: 2,
  },
  financeBarMid: {
    width: 4,
    height: 11,
    borderRadius: 2,
  },
  financeCoin: {
    position: 'absolute',
    right: 0,
    top: 1,
    width: 5,
    height: 5,
    borderRadius: 999,
  },
});
