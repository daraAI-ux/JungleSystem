import React from 'react';
import {StyleSheet, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export function KolamTopNavigationMediaIcon({
  color = V.colors.mutedFg,
}: {
  color?: string;
}) {
  return (
    <View style={styles.icon}>
      <View style={[styles.body, {borderColor: color}]} />
      <View style={[styles.top, {borderColor: color}]} />
      <View style={[styles.lens, {backgroundColor: color}]} />
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    height: 18,
    width: 18,
  },
  body: {
    borderRadius: 4,
    borderWidth: 1.6,
    bottom: 3,
    height: 11,
    left: 1,
    position: 'absolute',
    right: 1,
  },
  top: {
    borderLeftWidth: 1.6,
    borderRightWidth: 1.6,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    borderTopWidth: 1.6,
    height: 5,
    left: 5,
    position: 'absolute',
    top: 2,
    width: 8,
  },
  lens: {
    borderRadius: 999,
    height: 5,
    left: 6.5,
    position: 'absolute',
    top: 8,
    width: 5,
  },
});

