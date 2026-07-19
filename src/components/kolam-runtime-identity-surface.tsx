import React from 'react';
import {KolamRuntimeIdentityStrip} from './kolam-status-runtime-widgets';
import type {KolamRuntimeIdentityProps} from './kolam-runtime-panel-surface-types';

export function KolamRuntimeIdentitySurface({
  runtimeIdentity,
}: {
  runtimeIdentity: KolamRuntimeIdentityProps;
}) {
  return <KolamRuntimeIdentityStrip {...runtimeIdentity} />;
}
