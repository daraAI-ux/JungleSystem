import React from 'react';
import {KolamActionControlButton} from './kolam-action-control-button';

export interface KolamSaleActionProps {
  disabled: boolean;
  label: string;
  onPress: () => void;
}

export function KolamSaleAction({
  disabled,
  label,
  onPress,
}: KolamSaleActionProps) {
  return (
    <KolamActionControlButton
      label={label}
      intent="primary"
      size="sm"
      disabled={disabled}
      onPress={onPress}
    />
  );
}
