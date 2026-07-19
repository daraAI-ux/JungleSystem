import React from 'react';
import {StyleSheet, View} from 'react-native';
import {
  transparent,
  type ModuleNavIconGlyphProps,
} from './kolam-module-nav-icon-types';

export function ModuleNavSettingsIcon({tintStyle}: ModuleNavIconGlyphProps) {
  return (
    <View style={styles.settingsIcon}>
      <View style={[styles.settingsRing, tintStyle]} />
      <View style={[styles.settingsToothVertical, tintStyle]} />
      <View style={[styles.settingsToothHorizontal, tintStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  settingsIcon: {
    width: 17,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsRing: {
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2,
    backgroundColor: transparent,
  },
  settingsToothVertical: {
    position: 'absolute',
    width: 3,
    height: 17,
    borderRadius: 999,
  },
  settingsToothHorizontal: {
    position: 'absolute',
    width: 17,
    height: 3,
    borderRadius: 999,
  },
});
