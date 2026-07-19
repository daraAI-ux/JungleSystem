import React from 'react';
import {KolamInteractionFrame} from './kolam-interaction-frame';
import {getRowFrameStyle} from './kolam-row-frame-style';
import {rowFrameStyles as styles} from './kolam-row-frame-styles';
import type {KolamInteractiveRowFrameProps} from './kolam-row-frame-types';

export function KolamInteractiveRowFrame({
  accessibilityLabel,
  accessibilityState,
  children,
  onPress,
  selected = false,
  style,
  variant = 'selectable',
}: KolamInteractiveRowFrameProps) {
  return (
    <KolamInteractionFrame
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      onPress={onPress}
      style={[
        getRowFrameStyle(variant),
        selected && styles.selectableSelected,
        style,
      ]}>
      {children}
    </KolamInteractionFrame>
  );
}
