import React from 'react';
import {cardFrameStyles} from './kolam-card-frame-styles';
import {KolamInteractiveCardFrame} from './kolam-interactive-card-frame';
import {getSelectableCardLayoutStyle} from './kolam-selectable-card-layout';
import type {KolamSelectableCardProps} from './kolam-selectable-card-types';

export type {
  KolamSelectableCardLayout,
  KolamSelectableCardProps,
} from './kolam-selectable-card-types';

export function KolamSelectableCard({
  children,
  layout = 'half',
  minHeight,
  blocked = false,
  accessibilityLabel,
  onPress,
  style,
}: KolamSelectableCardProps) {
  return (
    <KolamInteractiveCardFrame
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{disabled: blocked}}
      onPress={onPress}
      style={[
        getSelectableCardLayoutStyle(layout),
        minHeight !== undefined && {minHeight},
        blocked && cardFrameStyles.blocked,
        style,
      ]}>
      {children}
    </KolamInteractiveCardFrame>
  );
}
