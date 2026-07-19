import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import type {SyncActivityEntry} from '../domain/sync-activity';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamSyncActivityItemHeader} from './kolam-sync-activity-item-header';
import {syncActivityStyles as styles} from './kolam-sync-activity-styles';

export function KolamSyncActivityItem({entry}: {entry: SyncActivityEntry}) {
  return (
    <KolamCardFrame variant="syncActivity">
      <KolamSyncActivityItemHeader entry={entry} />
      <KolamCopyStack
        items={[
          {id: 'detail', text: entry.detail, style: styles.detail},
          {id: 'time', text: entry.timestamp, style: styles.time},
        ]}
      />
    </KolamCardFrame>
  );
}
