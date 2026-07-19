import React from 'react';
import {View} from 'react-native';
import type {KolamUserMenuGlyphProps} from './kolam-user-menu-icon-types';
import {userMenuIconStyles as styles} from './kolam-user-menu-icon-styles';

export function KolamUserMenuDashboardIcon({
  danger = false,
}: KolamUserMenuGlyphProps) {
  const tintStyle = danger ? styles.dangerTint : null;

  return (
    <View style={styles.dashboardIcon}>
      <View style={[styles.dashboardTile, tintStyle]} />
      <View style={[styles.dashboardTile, tintStyle]} />
      <View style={[styles.dashboardTile, tintStyle]} />
      <View style={[styles.dashboardTile, tintStyle]} />
    </View>
  );
}
