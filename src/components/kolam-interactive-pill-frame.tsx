import React from 'react';
import {KolamInteractionFrame} from './kolam-interaction-frame';
import {
  getPillFrameSelectedStyle,
  getPillFrameStyle,
} from './kolam-pill-frame-style';
import {pillFrameStyles as styles} from './kolam-pill-frame-styles';
import type {KolamInteractivePillFrameProps} from './kolam-pill-frame-types';

export function KolamInteractivePillFrame({
  accessibilityLabel,
  accessibilityState,
  children,
  disabled = false,
  onPress,
  selected = false,
  style,
  variant = 'selector',
}: KolamInteractivePillFrameProps) {
  return (
    <KolamInteractionFrame
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      onPress={onPress}
      style={[
        getPillFrameStyle(variant),
        selected && getPillFrameSelectedStyle(variant),
        disabled && styles.stateDisabled,
        style,
      ]}>
      {children}
    </KolamInteractionFrame>
  );
}
