import React from 'react';
import {View} from 'react-native';
import {getListFrameStyle} from './kolam-list-frame-style';
import type {KolamListFrameProps} from './kolam-list-frame-types';

export type {
  KolamListFrameProps,
  KolamListFrameVariant,
} from './kolam-list-frame-types';

export function KolamListFrame({
  accessibilityLabel,
  children,
  style,
  variant = 'wrap',
}: KolamListFrameProps) {
  const frameStyle = getListFrameStyle(variant);

  return (
    <View
      style={style ? [frameStyle, style] : frameStyle}
      accessibilityLabel={accessibilityLabel}>
      {children}
    </View>
  );
}
