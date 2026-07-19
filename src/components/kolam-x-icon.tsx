import React from 'react';
import {StyleSheet, View, type StyleProp, type ViewStyle} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export type KolamXIconSize = 'close' | 'md';

export interface KolamXIconProps {
  color?: string;
  size?: KolamXIconSize;
  style?: StyleProp<ViewStyle>;
}

export function KolamXIcon({
  color = V.colors.fg,
  size = 'close',
  style,
}: KolamXIconProps) {
  const colorStyle = {backgroundColor: color};

  return (
    <View style={[getIconStyle(size), style]}>
      <View style={[getLineStyle(size), styles.lineOne, colorStyle]} />
      <View style={[getLineStyle(size), styles.lineTwo, colorStyle]} />
    </View>
  );
}

function getIconStyle(size: KolamXIconSize) {
  return size === 'md' ? styles.mdIcon : styles.closeIcon;
}

function getLineStyle(size: KolamXIconSize) {
  return size === 'md' ? styles.mdLine : styles.closeLine;
}

const lineBase = {
  position: 'absolute' as const,
  height: 2,
  borderRadius: 999,
};

const styles = StyleSheet.create({
  closeIcon: {
    width: 14,
    height: 14,
    position: 'relative',
  },
  closeLine: {
    ...lineBase,
    top: 6,
    left: 2,
    width: 10,
  },
  mdIcon: {
    width: 17,
    height: 17,
    position: 'relative',
  },
  mdLine: {
    ...lineBase,
    left: 3,
    top: 6,
    width: 8,
  },
  lineOne: {
    transform: [{rotate: '45deg'}],
  },
  lineTwo: {
    transform: [{rotate: '-45deg'}],
  },
});
