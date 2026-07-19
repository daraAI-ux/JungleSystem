import React from 'react';
import {View} from 'react-native';
import {getRowFrameStyle} from './kolam-row-frame-style';
import type {KolamRowFrameProps} from './kolam-row-frame-types';

export type {
  KolamInteractiveRowFrameProps,
  KolamRowFrameProps,
  KolamRowFrameVariant,
} from './kolam-row-frame-types';

export function KolamRowFrame({
  children,
  style,
  variant = 'form',
}: KolamRowFrameProps) {
  return <View style={[getRowFrameStyle(variant), style]}>{children}</View>;
}
