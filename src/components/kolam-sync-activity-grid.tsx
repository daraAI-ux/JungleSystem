import React from 'react';
import type {SyncActivityEntry} from '../domain/sync-activity';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamSyncActivityItem} from './kolam-sync-activity-item';

export function KolamSyncActivityGrid({entries}: {entries: SyncActivityEntry[]}) {
  return (
    <KolamListFrame>
      <KolamMappedList
        items={entries}
        limit={6}
        getKey={entry => entry.id}
        renderItem={entry => <KolamSyncActivityItem entry={entry} />}
      />
    </KolamListFrame>
  );
}
