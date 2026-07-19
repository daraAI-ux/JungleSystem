import React from 'react';
import type {SyncActivityEntry} from '../domain/sync-activity';
import {getStatusPanelDescriptor} from '../domain/status-panel';
import {getSyncActivityPanelMeta} from './kolam-sync-activity-meta';
import {KolamSyncActivityGrid} from './kolam-sync-activity-grid';
import {KolamStatusPanelFrame} from './kolam-status-panel-frame';

export function KolamSyncActivityPanel({entries}: {entries: SyncActivityEntry[]}) {
  return (
    <KolamStatusPanelFrame
      panel={getStatusPanelDescriptor('sync-activity')}
      meta={getSyncActivityPanelMeta(entries)}>
      <KolamSyncActivityGrid entries={entries} />
    </KolamStatusPanelFrame>
  );
}
