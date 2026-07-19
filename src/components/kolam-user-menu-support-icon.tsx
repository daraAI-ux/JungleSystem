import React from 'react';
import {View} from 'react-native';
import type {KolamUserMenuGlyphProps} from './kolam-user-menu-icon-types';
import {userMenuIconStyles as styles} from './kolam-user-menu-icon-styles';

export function KolamUserMenuSupportIcon({
  danger = false,
}: KolamUserMenuGlyphProps) {
  const tintStyle = danger ? styles.dangerTint : null;

  return (
    <View style={styles.supportIcon}>
      <View style={[styles.supportRing, tintStyle]} />
      <View style={[styles.supportLine, tintStyle]} />
      <View style={[styles.supportDot, tintStyle]} />
    </View>
  );
}
