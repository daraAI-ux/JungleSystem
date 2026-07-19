import React from 'react';
import {StyleSheet, View, type StyleProp, type ViewStyle} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export type KolamCheckmarkIconSize = 'xs' | 'sm' | 'md' | 'checklist';

export interface KolamCheckmarkIconProps {
  color?: string;
  size?: KolamCheckmarkIconSize;
  style?: StyleProp<ViewStyle>;
}

export function KolamCheckmarkIcon({
  color = V.colors.success,
  size = 'xs',
  style,
}: KolamCheckmarkIconProps) {
  const colorStyle = {backgroundColor: color};

  if (size === 'checklist') {
    return (
      <View style={[styles.checklistIcon, style]}>
        <View style={[styles.checklistLineOne, colorStyle]} />
        <View style={[styles.checklistLineTwo, colorStyle]} />
        <View style={[styles.checklistRow, colorStyle]} />
      </View>
    );
  }

  return (
    <View style={[getIconStyle(size), style]}>
      <View style={[getLineOneStyle(size), colorStyle]} />
      <View style={[getLineTwoStyle(size), colorStyle]} />
    </View>
  );
}

function getIconStyle(size: KolamCheckmarkIconSize) {
  switch (size) {
    case 'sm':
      return styles.smIcon;
    case 'md':
      return styles.mdIcon;
    case 'xs':
    default:
      return styles.xsIcon;
  }
}

function getLineOneStyle(size: KolamCheckmarkIconSize) {
  switch (size) {
    case 'sm':
      return styles.smLineOne;
    case 'md':
      return styles.mdLineOne;
    case 'xs':
    default:
      return styles.xsLineOne;
  }
}

function getLineTwoStyle(size: KolamCheckmarkIconSize) {
  switch (size) {
    case 'sm':
      return styles.smLineTwo;
    case 'md':
      return styles.mdLineTwo;
    case 'xs':
    default:
      return styles.xsLineTwo;
  }
}

const baseLine = {
  position: 'absolute' as const,
  height: 2,
  borderRadius: 999,
};

const styles = StyleSheet.create({
  xsIcon: {
    width: 11,
    height: 11,
    position: 'relative',
  },
  xsLineOne: {
    ...baseLine,
    left: 1,
    top: 6,
    width: 4,
    transform: [{rotate: '45deg'}],
  },
  xsLineTwo: {
    ...baseLine,
    right: 1,
    top: 5,
    width: 8,
    transform: [{rotate: '-45deg'}],
  },
  smIcon: {
    width: 15,
    height: 15,
    position: 'relative',
  },
  smLineOne: {
    ...baseLine,
    left: 1,
    top: 8,
    width: 6,
    transform: [{rotate: '40deg'}],
  },
  smLineTwo: {
    ...baseLine,
    left: 6,
    top: 6,
    width: 9,
    transform: [{rotate: '-45deg'}],
  },
  mdIcon: {
    width: 17,
    height: 17,
    position: 'relative',
  },
  mdLineOne: {
    ...baseLine,
    left: 3,
    top: 7,
    width: 5,
    transform: [{rotate: '42deg'}],
  },
  mdLineTwo: {
    ...baseLine,
    left: 7,
    top: 5,
    width: 8,
    transform: [{rotate: '-48deg'}],
  },
  checklistIcon: {
    width: 18,
    height: 18,
    position: 'relative',
  },
  checklistLineOne: {
    ...baseLine,
    left: 1,
    top: 8,
    width: 6,
    transform: [{rotate: '40deg'}],
  },
  checklistLineTwo: {
    ...baseLine,
    left: 6,
    top: 6,
    width: 10,
    transform: [{rotate: '-45deg'}],
  },
  checklistRow: {
    position: 'absolute',
    left: 3,
    right: 1,
    bottom: 3,
    height: 2,
    borderRadius: 999,
  },
});
