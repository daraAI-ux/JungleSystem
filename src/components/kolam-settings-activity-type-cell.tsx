import React from 'react';
import {KolamStatusBadge} from './kolam-status-badge';
import {settingsActivityTableStyles as styles} from './kolam-settings-activity-table-styles';

export function KolamSettingsActivityTypeCell({type}: {type: string}) {
  return (
    <KolamStatusBadge
      label={type}
      intent="success"
      style={styles.settingsActivityTableTypeCell}
      numberOfLines={1}
    />
  );
}
