import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {ModuleNavIconGlyphProps} from './kolam-module-nav-icon-types';

export function ModuleNavPluginIcon({tintStyle}: ModuleNavIconGlyphProps) {
  return (
    <View style={styles.pluginIcon}>
      <View style={[styles.pluginDot, tintStyle]} />
      <View style={[styles.pluginDot, tintStyle]} />
      <View style={[styles.pluginDot, tintStyle]} />
      <View style={[styles.pluginDot, tintStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  pluginIcon: {
    width: 16,
    height: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  pluginDot: {
    width: 6,
    height: 6,
    borderRadius: 2,
  },
});
