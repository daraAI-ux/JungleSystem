import React from 'react';
import type {SyncActivityEntry} from '../domain/sync-activity';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamHeaderFrame} from './kolam-header-frame';
import {KolamSyncActivityStatusBadge} from './kolam-sync-activity-status-badge';
import {syncActivityStyles as styles} from './kolam-sync-activity-styles';

export function KolamSyncActivityItemHeader({
  entry,
}: {
  entry: SyncActivityEntry;
}) {
  return (
    <KolamHeaderFrame variant="syncActivityItem">
      <KolamCopyStack
        items={[{id: 'label', text: entry.label, style: styles.label}]}
      />
      <KolamSyncActivityStatusBadge entry={entry} />
    </KolamHeaderFrame>
  );
}