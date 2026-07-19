import React from 'react';
import {KolamReadinessPanel} from './kolam-status-runtime-widgets';
import type {KolamReadinessPanelProps} from './kolam-runtime-panel-surface-types';

export function KolamRuntimeReadinessSurface({
  readiness,
}: {
  readiness: KolamReadinessPanelProps;
}) {
  return <KolamReadinessPanel {...readiness} />;
}
