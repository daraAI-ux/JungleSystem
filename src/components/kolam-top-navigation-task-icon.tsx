import React from 'react';
import {StyleSheet, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export function KolamTopNavigationTaskIcon({
  color = V.colors.mutedFg,
}: {
  color?: string;
}) {
  return (
    <View style={styles.icon}>
      <View style={[styles.box, {borderColor: color}]}>
        <View style={[styles.checkStem, {backgroundColor: color}]} />
        <View style={[styles.checkArm, {backgroundColor: color}]} />
      </View>
      <View style={[styles.lineOne, {backgroundColor: color}]} />
      <View style={[styles.lineTwo, {backgroundColor: color}]} />
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 18,
    height: 18,
    justifyContent: 'center',
  },
  box: {
    position: 'absolute',
    left: 1,
    top: 3,
    width: 7,
    height: 7,
    borderWidth: 1.5,
    borderRadius: 2,
  },
  checkStem: {
    position: 'absolute',
    left: 1.5,
    top: 3,
    width: 1.5,
    height: 4,
    borderRadius: 1,
    transform: [{rotate: '-38deg'}],
  },
  checkArm: {
    position: 'absolute',
    left: 3.5,
    top: 1,
    width: 1.5,
    height: 6,
    borderRadius: 1,
    transform: [{rotate: '42deg'}],
  },
  lineOne: {
    position: 'absolute',
    left: 11,
    right: 1,
    top: 5,
    height: 1.5,
    borderRadius: 1,
  },
  lineTwo: {
    position: 'absolute',
    left: 11,
    right: 3,
    top: 11,
    height: 1.5,
    borderRadius: 1,
  },
});
