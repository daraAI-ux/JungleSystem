import React from 'react';
import type {KolamCheckoutSurfaceProps} from './kolam-workspace-module-surface-types';
import {KolamPosFullWindowSurface} from './kolam-pos-full-window-surface';

export function KolamCheckoutSurface({
  checkout,
  onBackToCenter,
}: {
  checkout: KolamCheckoutSurfaceProps;
  onBackToCenter: () => void;
}) {
  return (
    <KolamPosFullWindowSurface
      {...checkout}
      onBackToCenter={onBackToCenter}
    />
  );
}
