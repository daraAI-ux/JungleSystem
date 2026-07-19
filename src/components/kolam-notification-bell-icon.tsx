import React from 'react';
import {StyleSheet, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export interface KolamNotificationBellIconProps {
  color?: string;
}

export function KolamNotificationBellIcon({
  color = V.colors.mutedFg,
}: KolamNotificationBellIconProps) {
  const strokeStyle = {borderColor: color};
  const fillStyle = {backgroundColor: color};

  return (
    <View style={styles.icon}>
      <View style={[styles.dome, strokeStyle]} />
      <View style={[styles.body, strokeStyle]} />
      <View style={[styles.clapper, fillStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dome: {
    width: 10,
    height: 5,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
  },
  body: {
    width: 14,
    height: 8,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
  },
  clapper: {
    width: 4,
    height: 2,
    marginTop: 1,
    borderRadius: 2,
  },
});
