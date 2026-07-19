import React from 'react';
import {KolamSyncStatusBar} from './kolam-shell-widgets';
import type {KolamSyncStatusProps} from './kolam-runtime-panel-surface-types';

export function KolamRuntimeSyncSurface({
  syncStatus,
}: {
  syncStatus: KolamSyncStatusProps;
}) {
  return <KolamSyncStatusBar {...syncStatus} />;
}
