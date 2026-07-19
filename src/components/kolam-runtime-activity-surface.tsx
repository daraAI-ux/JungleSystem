import React from 'react';
import type {SyncActivityEntry} from '../domain/sync-activity';
import {KolamSyncActivityPanel} from './kolam-status-runtime-widgets';

export function KolamRuntimeActivitySurface({
  syncActivity,
}: {
  syncActivity: SyncActivityEntry[];
}) {
  return <KolamSyncActivityPanel entries={syncActivity} />;
}
