import React from 'react';
import {View} from 'react-native';
import {getInlineFrameStyle} from './kolam-inline-frame-style';
import type {KolamInlineFrameProps} from './kolam-inline-frame-types';

export type {
  KolamInlineFrameProps,
  KolamInlineFrameVariant,
} from './kolam-inline-frame-types';

export function KolamInlineFrame({
  accessibilityLabel,
  children,
  style,
  variant,
}: KolamInlineFrameProps) {
  const frameStyle = getInlineFrameStyle(variant);

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={style ? [frameStyle, style] : frameStyle}>
      {children}
    </View>
  );
}