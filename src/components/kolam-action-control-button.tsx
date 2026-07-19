import React from 'react';
import {type KolamButtonProps, KolamButton} from './kolam-button';

export interface KolamActionControlButtonProps extends KolamButtonProps {
  canRun?: boolean;
  loading?: boolean;
  loadingLabel?: string;
}

export function KolamActionControlButton({
  canRun,
  label,
  loading = false,
  loadingLabel,
  muted,
  ...buttonProps
}: KolamActionControlButtonProps) {
  return (
    <KolamButton
      {...buttonProps}
      label={loading && loadingLabel ? loadingLabel : label}
      muted={muted || canRun === false}
    />
  );
}
