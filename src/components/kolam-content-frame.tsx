import React from 'react';
import {View} from 'react-native';
import {getContentFrameStyle} from './kolam-content-frame-style';
import type {KolamContentFrameProps} from './kolam-content-frame-types';

export type {
  KolamContentFrameProps,
  KolamContentFrameVariant,
} from './kolam-content-frame-types';

export function KolamContentFrame({
  accessibilityLabel,
  children,
  style,
  variant,
}: KolamContentFrameProps) {
  const frameStyle = getContentFrameStyle(variant);

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={style ? [frameStyle, style] : frameStyle}>
      {children}
    </View>
  );
}