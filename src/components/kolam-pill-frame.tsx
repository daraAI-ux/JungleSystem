import React from 'react';
import {View} from 'react-native';
import {
  getPillFrameSelectedStyle,
  getPillFrameStyle,
} from './kolam-pill-frame-style';
import {pillFrameStyles as styles} from './kolam-pill-frame-styles';
import type {KolamPillFrameProps} from './kolam-pill-frame-types';

export type {
  KolamInteractivePillFrameProps,
  KolamPillFrameProps,
  KolamPillFrameVariant,
} from './kolam-pill-frame-types';

export function KolamPillFrame({
  children,
  disabled = false,
  selected = false,
  style,
  variant = 'state',
}: KolamPillFrameProps) {
  return (
    <View
      style={[
        getPillFrameStyle(variant),
        selected && getPillFrameSelectedStyle(variant),
        disabled && styles.stateDisabled,
        style,
      ]}>
      {children}
    </View>
  );
}
