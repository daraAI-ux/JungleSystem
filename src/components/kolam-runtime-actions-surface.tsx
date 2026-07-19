import React from 'react';
import {KolamRuntimeActionStrip} from './kolam-status-runtime-widgets';
import type {KolamRuntimeActionSurfaceProps} from './kolam-runtime-panel-surface-types';

export function KolamRuntimeActionsSurface({
  runtimeActions,
}: {
  runtimeActions: KolamRuntimeActionSurfaceProps;
}) {
  return <KolamRuntimeActionStrip {...runtimeActions} />;
}
