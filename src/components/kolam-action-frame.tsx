import React from 'react';
import {KolamInteractionFrame} from './kolam-interaction-frame';
import {getActionFrameStyle} from './kolam-action-frame-style';
import type {KolamActionFrameProps} from './kolam-action-frame-types';

export type {
  KolamActionFrameProps,
  KolamActionFrameVariant,
} from './kolam-action-frame-types';

export function KolamActionFrame({
  accessibilityLabel,
  children,
  onPress,
  style,
  variant = 'text',
}: KolamActionFrameProps) {
  return (
    <KolamInteractionFrame
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={[getActionFrameStyle(variant), style]}>
      {children}
    </KolamInteractionFrame>
  );
}
