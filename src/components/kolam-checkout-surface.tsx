import React from 'react';
import type {KolamCheckoutSurfaceProps} from './kolam-workspace-module-surface-types';
import {KolamCheckoutWorkspace} from './kolam-pos-workspace-widgets';

export function KolamCheckoutSurface({
  checkout,
}: {
  checkout: KolamCheckoutSurfaceProps;
}) {
  return <KolamCheckoutWorkspace {...checkout} />;
}
