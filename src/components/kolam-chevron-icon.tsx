import React from 'react';
import {StyleSheet, View, type StyleProp, type ViewStyle} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export type KolamChevronDirection = 'down' | 'right' | 'up';
export type KolamChevronSize = 'dashboard' | 'dashboard-sm' | 'menu' | 'menu-sm' | 'user';

export interface KolamChevronIconProps {
  color?: string;
  direction?: KolamChevronDirection;
  size?: KolamChevronSize;
  style?: StyleProp<ViewStyle>;
}

export function KolamChevronIcon({
  color = V.colors.mutedFg,
  direction = 'right',
  size = 'dashboard',
  style,
}: KolamChevronIconProps) {
  const colorStyle = {backgroundColor: color};

  return (
    <View style={[getIconStyle(size), style]}>
      <View style={[getLineStyle(size), getLineOneStyle(direction, size), colorStyle]} />
      <View style={[getLineStyle(size), getLineTwoStyle(direction, size), colorStyle]} />
    </View>
  );
}

function getIconStyle(size: KolamChevronSize) {
  switch (size) {
    case 'menu':
      return styles.menuIcon;
    case 'menu-sm':
      return styles.menuIconCompact;
    case 'user':
      return styles.userIcon;
    case 'dashboard-sm':
      return styles.dashboardIconSmall;
    case 'dashboard':
    default:
      return styles.dashboardIcon;
  }
}

function getLineStyle(size: KolamChevronSize) {
  switch (size) {
    case 'menu':
    case 'menu-sm':
      return styles.menuLine;
    case 'user':
      return styles.userLine;
    case 'dashboard-sm':
      return styles.dashboardLineSmall;
    case 'dashboard':
    default:
      return styles.dashboardLine;
  }
}

function getLineOneStyle(direction: KolamChevronDirection, size: KolamChevronSize) {
  if (direction === 'down') {
    return styles.downLineLeft;
  }
  if (direction === 'up') {
    return styles.upLineLeft;
  }
  return size === 'user' ? styles.userRightLineTop : styles.rightLineTop;
}

function getLineTwoStyle(direction: KolamChevronDirection, size: KolamChevronSize) {
  if (direction === 'down') {
    return styles.downLineRight;
  }
  if (direction === 'up') {
    return styles.upLineRight;
  }
  return size === 'user' ? styles.userRightLineBottom : styles.rightLineBottom;
}

const iconBase = {
  position: 'relative' as const,
};

const lineBase = {
  position: 'absolute' as const,
  height: 2,
  borderRadius: 999,
};

const styles = StyleSheet.create({
  dashboardIcon: {
    ...iconBase,
    width: 14,
    height: 14,
  },
  dashboardIconSmall: {
    ...iconBase,
    width: 12,
    height: 12,
  },
  dashboardLine: {
    ...lineBase,
    width: 7,
  },
  dashboardLineSmall: {
    ...lineBase,
    width: 6,
  },
  menuIcon: {
    ...iconBase,
    width: 12,
    height: 12,
  },
  menuIconCompact: {
    ...iconBase,
    width: 10,
    height: 10,
  },
  menuLine: {
    ...lineBase,
    width: 6,
  },
  userIcon: {
    ...iconBase,
    width: 16,
    height: 16,
  },
  userLine: {
    ...lineBase,
    width: 7,
  },
  rightLineTop: {
    top: 3,
    right: 2,
    transform: [{rotate: '45deg'}],
  },
  rightLineBottom: {
    right: 2,
    bottom: 3,
    transform: [{rotate: '-45deg'}],
  },
  userRightLineTop: {
    top: 4,
    right: 3,
    transform: [{rotate: '45deg'}],
  },
  userRightLineBottom: {
    right: 3,
    bottom: 4,
    transform: [{rotate: '-45deg'}],
  },
  downLineLeft: {
    top: 5,
    left: 1,
    transform: [{rotate: '45deg'}],
  },
  downLineRight: {
    top: 5,
    right: 1,
    transform: [{rotate: '-45deg'}],
  },
  upLineLeft: {
    top: 3,
    left: 1,
    transform: [{rotate: '-45deg'}],
  },
  upLineRight: {
    top: 3,
    right: 1,
    transform: [{rotate: '45deg'}],
  },
});
