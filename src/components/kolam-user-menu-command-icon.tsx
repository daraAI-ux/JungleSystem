import React from 'react';
import {View} from 'react-native';
import type {KolamUserMenuGlyphProps} from './kolam-user-menu-icon-types';
import {userMenuIconStyles as styles} from './kolam-user-menu-icon-styles';

export function KolamUserMenuCommandIcon({
  danger = false,
}: KolamUserMenuGlyphProps) {
  const tintStyle = danger ? styles.dangerTint : null;

  return (
    <View style={styles.commandIcon}>
      <View style={[styles.commandCorner, tintStyle]} />
      <View
        style={[styles.commandCorner, styles.commandCornerTopRight, tintStyle]}
      />
      <View
        style={[
          styles.commandCorner,
          styles.commandCornerBottomLeft,
          tintStyle,
        ]}
      />
      <View
        style={[
          styles.commandCorner,
          styles.commandCornerBottomRight,
          tintStyle,
        ]}
      />
    </View>
  );
}
