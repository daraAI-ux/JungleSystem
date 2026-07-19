import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {ModuleNavIconGlyphProps} from './kolam-module-nav-icon-types';

export function ModuleNavPeopleIcon({tintStyle}: ModuleNavIconGlyphProps) {
  return (
    <View style={styles.peopleIcon}>
      <View style={[styles.peopleHeadOne, tintStyle]} />
      <View style={[styles.peopleHeadTwo, tintStyle]} />
      <View style={[styles.peopleBody, tintStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  peopleIcon: {
    width: 18,
    height: 17,
  },
  peopleHeadOne: {
    position: 'absolute',
    left: 3,
    top: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  peopleHeadTwo: {
    position: 'absolute',
    right: 3,
    top: 4,
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  peopleBody: {
    position: 'absolute',
    left: 2,
    right: 2,
    bottom: 2,
    height: 6,
    borderRadius: 5,
  },
});
