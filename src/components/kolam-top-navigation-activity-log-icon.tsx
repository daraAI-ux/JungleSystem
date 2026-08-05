import React from 'react';
import {StyleSheet, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export function KolamTopNavigationActivityLogIcon({
  color = V.colors.mutedFg,
}: {
  color?: string;
}) {
  return (
    <View style={styles.icon}>
      <View style={styles.inner}>
        <View style={[styles.shield, {borderColor: color}]} />
        <View style={[styles.checkStem, {backgroundColor: color}]} />
        <View style={[styles.checkArm, {backgroundColor: color}]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    alignItems: 'center',
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  inner: {
    height: 16,
    position: 'relative',
    width: 16,
  },
  shield: {
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.6,
    borderRightWidth: 1.6,
    borderBottomWidth: 1.5,
    height: 14,
    left: 2,
    position: 'absolute',
    top: 1,
    width: 12,
  },
  checkStem: {
    borderRadius: 1,
    height: 5,
    left: 6,
    position: 'absolute',
    top: 8,
    transform: [{rotate: '-38deg'}],
    width: 2,
  },
  checkArm: {
    borderRadius: 1,
    height: 8,
    left: 9,
    position: 'absolute',
    top: 5,
    transform: [{rotate: '42deg'}],
    width: 2,
  },
});
