import React from 'react';
import {KolamStatusBadge} from './kolam-status-badge';
import {settingsActivityTableStyles as styles} from './kolam-settings-activity-table-styles';

export function KolamSettingsActivitySourceCell({source}: {source: string}) {
  return (
    <KolamStatusBadge
      label={source}
      intent={source === 'Kolam' ? 'info' : 'muted'}
      style={styles.settingsActivityTableSourceCell}
      numberOfLines={1}
    />
  );
}
