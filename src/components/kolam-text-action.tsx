import React from 'react';
import {KolamActionFrame} from './kolam-action-frame';
import {
  KolamTextActionLabel,
  type KolamTextActionLabelVariant,
} from './kolam-text-action-label';

export interface KolamTextActionProps {
  accessibilityLabel?: string;
  label: string;
  onPress: () => void;
  variant?: KolamTextActionLabelVariant;
}

export function KolamTextAction({
  accessibilityLabel,
  label,
  onPress,
  variant,
}: KolamTextActionProps) {
  return (
    <KolamActionFrame
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}>
      <KolamTextActionLabel label={label} variant={variant} />
    </KolamActionFrame>
  );
}
