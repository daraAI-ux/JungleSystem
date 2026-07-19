import React from 'react';
import {KolamStatusBadge} from './kolam-status-badge';
import {settingsActivityTableStyles as styles} from './kolam-settings-activity-table-styles';

export function KolamSettingsActivityMethodCell({method}: {method: string}) {
  return (
    <KolamStatusBadge
      label={method}
      intent={method === '-' ? 'muted' : 'info'}
      style={styles.settingsActivityTableMethodCell}
      numberOfLines={1}
    />
  );
}
