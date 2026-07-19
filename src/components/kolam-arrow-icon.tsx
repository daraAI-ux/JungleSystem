import React from 'react';
import {StyleSheet, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export interface KolamArrowIconProps {
  color?: string;
}

export function KolamArrowIcon({color = V.colors.mutedFg}: KolamArrowIconProps) {
  const tintStyle = {backgroundColor: color};

  return (
    <View style={styles.icon}>
      <View style={[styles.stem, tintStyle]} />
      <View style={[styles.lineTop, tintStyle]} />
      <View style={[styles.lineBottom, tintStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 14,
    height: 10,
    position: 'relative',
  },
  stem: {
    position: 'absolute',
    left: 2,
    top: 4,
    width: 8,
    height: 2,
    borderRadius: 999,
  },
  lineTop: {
    position: 'absolute',
    right: 2,
    top: 2,
    width: 5,
    height: 2,
    borderRadius: 999,
    transform: [{rotate: '45deg'}],
  },
  lineBottom: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 5,
    height: 2,
    borderRadius: 999,
    transform: [{rotate: '-45deg'}],
  },
});
