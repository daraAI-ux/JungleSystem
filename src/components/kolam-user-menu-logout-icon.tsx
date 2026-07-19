import React from 'react';
import {View} from 'react-native';
import type {KolamUserMenuGlyphProps} from './kolam-user-menu-icon-types';
import {userMenuIconStyles as styles} from './kolam-user-menu-icon-styles';

export function KolamUserMenuLogoutIcon({
  danger = false,
}: KolamUserMenuGlyphProps) {
  const tintStyle = danger ? styles.dangerTint : null;

  return (
    <View style={styles.logoutIcon}>
      <View style={[styles.logoutDoor, tintStyle]} />
      <View style={[styles.logoutArrow, tintStyle]} />
      <View style={[styles.logoutArrowHead, tintStyle]} />
    </View>
  );
}
