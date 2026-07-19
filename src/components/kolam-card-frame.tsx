import React from 'react';
import {View} from 'react-native';
import {getCardFrameStyle} from './kolam-card-frame-style';
import type {KolamCardFrameProps} from './kolam-card-frame-types';

export type {
  KolamCardFrameProps,
  KolamCardFrameVariant,
  KolamInteractiveCardFrameProps,
} from './kolam-card-frame-types';

export function KolamCardFrame({
  accessibilityLabel,
  children,
  style,
  variant = 'compact',
}: KolamCardFrameProps) {
  const frameStyle = getCardFrameStyle(variant);

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={style ? [frameStyle, style] : frameStyle}>
      {children}
    </View>
  );
}