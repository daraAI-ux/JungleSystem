import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {ModuleNavIconGlyphProps} from './kolam-module-nav-icon-types';

export function ModuleNavDashboardIcon({tintStyle}: ModuleNavIconGlyphProps) {
  return (
    <View style={styles.dashboardIcon}>
      <View style={[styles.dashboardTile, tintStyle]} />
      <View style={[styles.dashboardTile, tintStyle]} />
      <View style={[styles.dashboardTile, tintStyle]} />
      <View style={[styles.dashboardTile, tintStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  dashboardIcon: {
    width: 15,
    height: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  dashboardTile: {
    width: 6,
    height: 6,
    borderRadius: 2,
  },
});
