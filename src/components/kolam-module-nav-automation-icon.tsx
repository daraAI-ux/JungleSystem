import React from 'react';
import {StyleSheet, View} from 'react-native';
import {
  transparent,
  type ModuleNavIconGlyphProps,
} from './kolam-module-nav-icon-types';

export function ModuleNavAutomationIcon({tintStyle}: ModuleNavIconGlyphProps) {
  return (
    <View style={styles.automationIcon}>
      <View style={[styles.automationAntenna, tintStyle]} />
      <View style={[styles.automationHead, tintStyle]} />
      <View style={[styles.automationEyeLeft, tintStyle]} />
      <View style={[styles.automationEyeRight, tintStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  automationIcon: {
    width: 18,
    height: 18,
    alignItems: 'center',
  },
  automationAntenna: {
    width: 2,
    height: 4,
    borderRadius: 999,
  },
  automationHead: {
    width: 15,
    height: 12,
    borderRadius: 4,
    borderWidth: 2,
    backgroundColor: transparent,
  },
  automationEyeLeft: {
    position: 'absolute',
    left: 5,
    top: 10,
    width: 3,
    height: 3,
    borderRadius: 2,
  },
  automationEyeRight: {
    position: 'absolute',
    right: 5,
    top: 10,
    width: 3,
    height: 3,
    borderRadius: 2,
  },
});
