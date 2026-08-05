import React from 'react';
import {StyleSheet, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export function KolamTopNavigationDownloadIcon({
  color = V.colors.mutedFg,
}: {
  color?: string;
}) {
  return (
    <View style={styles.icon}>
      <View style={[styles.stem, {backgroundColor: color}]} />
      <View style={[styles.leftWing, {backgroundColor: color}]} />
      <View style={[styles.rightWing, {backgroundColor: color}]} />
      <View style={[styles.tray, {borderColor: color}]} />
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    height: 18,
    width: 18,
  },
  stem: {
    borderRadius: 1,
    height: 9,
    left: 8,
    position: 'absolute',
    top: 2,
    width: 2,
  },
  leftWing: {
    borderRadius: 1,
    height: 6,
    left: 5,
    position: 'absolute',
    top: 8,
    transform: [{rotate: '-45deg'}],
    width: 2,
  },
  rightWing: {
    borderRadius: 1,
    height: 6,
    left: 11,
    position: 'absolute',
    top: 8,
    transform: [{rotate: '45deg'}],
    width: 2,
  },
  tray: {
    borderBottomWidth: 1.6,
    borderLeftWidth: 1.6,
    borderRadius: 3,
    borderRightWidth: 1.6,
    bottom: 2,
    height: 5,
    left: 2,
    position: 'absolute',
    right: 2,
  },
});
