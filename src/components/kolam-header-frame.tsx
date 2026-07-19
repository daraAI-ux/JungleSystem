import React from 'react';
import {View} from 'react-native';
import {getHeaderFrameStyle} from './kolam-header-frame-style';
import type {KolamHeaderFrameProps} from './kolam-header-frame-types';

export type {
  KolamHeaderFrameProps,
  KolamHeaderFrameVariant,
} from './kolam-header-frame-types';

export function KolamHeaderFrame({
  accessibilityLabel,
  children,
  style,
  variant,
}: KolamHeaderFrameProps) {
  const frameStyle = getHeaderFrameStyle(variant);

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={style ? [frameStyle, style] : frameStyle}>
      {children}
    </View>
  );
}