import React from 'react';
import type {SyncActivityEntry} from '../domain/sync-activity';
import {KolamStatusBadge} from './kolam-status-badge';
import {KolamStatusIndicatorIcon} from './kolam-status-indicator-icon';
import {
  getStatusIndicatorIconKind,
  getSyncActivityStatusIconColor,
} from './kolam-status-indicator-utils';

export function KolamSyncActivityStatusBadge({
  entry,
}: {
  entry: SyncActivityEntry;
}) {
  return (
    <KolamStatusBadge
      label={entry.status}
      intent={
        entry.tone === 'success'
          ? 'success'
          : entry.tone === 'warning'
            ? 'warning'
            : 'muted'
      }
      icon={
        <KolamStatusIndicatorIcon
          color={getSyncActivityStatusIconColor(entry.tone)}
          kind={getStatusIndicatorIconKind(entry.statusIconKind)}
        />
      }
    />
  );
}
