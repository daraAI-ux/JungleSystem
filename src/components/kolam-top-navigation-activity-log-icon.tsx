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
      <View style={[styles.shield, {borderColor: color}]} />
      <View style={[styles.checkStem, {backgroundColor: color}]} />
      <View style={[styles.checkArm, {backgroundColor: color}]} />
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    height: 18,
    width: 18,
  },
  shield: {
    borderRadius: 5,
    borderTopWidth: 1.6,
    borderLeftWidth: 1.6,
    borderRightWidth: 1.6,
    borderBottomWidth: 1.6,
    height: 15,
    left: 3,
    position: 'absolute',
    top: 1,
    transform: [{rotate: '45deg'}],
    width: 12,
  },
  checkStem: {
    borderRadius: 1,
    height: 5,
    left: 7,
    position: 'absolute',
    top: 9,
    transform: [{rotate: '-38deg'}],
    width: 2,
  },
  checkArm: {
    borderRadius: 1,
    height: 8,
    left: 10,
    position: 'absolute',
    top: 6,
    transform: [{rotate: '42deg'}],
    width: 2,
  },
});
