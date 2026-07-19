import React from 'react';
import {KolamInteractionFrame} from './kolam-interaction-frame';
import {getCardFrameStyle} from './kolam-card-frame-style';
import type {KolamInteractiveCardFrameProps} from './kolam-card-frame-types';

export function KolamInteractiveCardFrame({
  accessibilityLabel,
  accessibilityState,
  children,
  onPress,
  style,
  variant = 'compact',
}: KolamInteractiveCardFrameProps) {
  const frameStyle = getCardFrameStyle(variant);

  return (
    <KolamInteractionFrame
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      onPress={onPress}
      style={style ? [frameStyle, style] : frameStyle}>
      {children}
    </KolamInteractionFrame>
  );
}
