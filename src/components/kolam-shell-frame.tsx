import React from 'react';
import {View} from 'react-native';
import {getShellFrameStyle} from './kolam-shell-frame-style';
import type {KolamShellFrameProps} from './kolam-shell-frame-types';

export type {
  KolamShellFrameProps,
  KolamShellFrameVariant,
} from './kolam-shell-frame-types';

export function KolamShellFrame({
  accessibilityLabel,
  children,
  style,
  variant,
}: KolamShellFrameProps) {
  const frameStyle = getShellFrameStyle(variant);

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={style ? [frameStyle, style] : frameStyle}>
      {children}
    </View>
  );
}