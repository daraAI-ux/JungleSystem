import React from 'react';
import {View} from 'react-native';
import type {KolamUserMenuGlyphProps} from './kolam-user-menu-icon-types';
import {userMenuIconStyles as styles} from './kolam-user-menu-icon-styles';

export function KolamUserMenuSettingsIcon({
  danger = false,
}: KolamUserMenuGlyphProps) {
  const tintStyle = danger ? styles.dangerTint : null;

  return (
    <View style={styles.settingsIcon}>
      <View style={[styles.settingsRing, tintStyle]} />
      <View style={[styles.settingsToothVertical, tintStyle]} />
      <View style={[styles.settingsToothHorizontal, tintStyle]} />
    </View>
  );
}
