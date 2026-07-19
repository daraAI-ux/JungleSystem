import React from 'react';
import {StyleSheet, View, type StyleProp, type ViewStyle} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export type KolamSearchIconVariant = 'filter' | 'panel' | 'sidebar';

export interface KolamSearchIconProps {
  color?: string;
  style?: StyleProp<ViewStyle>;
  variant?: KolamSearchIconVariant;
}

export function KolamSearchIcon({
  color = V.colors.mutedFg,
  style,
  variant = 'sidebar',
}: KolamSearchIconProps) {
  const colorStyle = {
    backgroundColor: color,
    borderColor: color,
  };

  return (
    <View style={[getIconStyle(variant), style]}>
      <View style={[getRingStyle(variant), colorStyle]} />
      <View style={[getHandleStyle(variant), colorStyle]} />
    </View>
  );
}

function getIconStyle(variant: KolamSearchIconVariant) {
  switch (variant) {
    case 'panel':
      return styles.panelIcon;
    case 'filter':
    case 'sidebar':
    default:
      return styles.compactIcon;
  }
}

function getRingStyle(variant: KolamSearchIconVariant) {
  switch (variant) {
    case 'panel':
      return styles.panelRing;
    case 'filter':
      return styles.filterRing;
    case 'sidebar':
    default:
      return styles.sidebarRing;
  }
}

function getHandleStyle(variant: KolamSearchIconVariant) {
  switch (variant) {
    case 'panel':
      return styles.panelHandle;
    case 'filter':
      return styles.filterHandle;
    case 'sidebar':
    default:
      return styles.sidebarHandle;
  }
}

const baseIcon = {
  position: 'relative' as const,
};

const baseHandle = {
  position: 'absolute' as const,
  borderRadius: 999,
  transform: [{rotate: '45deg'}],
};

const styles = StyleSheet.create({
  compactIcon: {
    ...baseIcon,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelIcon: {
    ...baseIcon,
    width: 18,
    height: 18,
  },
  sidebarRing: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  filterRing: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  panelRing: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  sidebarHandle: {
    ...baseHandle,
    right: 2,
    bottom: 2,
    width: 6,
    height: 1.5,
  },
  filterHandle: {
    ...baseHandle,
    right: 2,
    bottom: 1,
    width: 7,
    height: 2,
  },
  panelHandle: {
    ...baseHandle,
    right: 1,
    bottom: 2,
    width: 8,
    height: 2,
  },
});
