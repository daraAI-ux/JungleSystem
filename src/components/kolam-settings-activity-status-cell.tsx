import React from 'react';
import {KolamStatusBadge} from './kolam-status-badge';
import {settingsActivityTableStyles as styles} from './kolam-settings-activity-table-styles';
import {getSettingsActivityStatusIntent} from './kolam-settings-activity-table-visual';

export function KolamSettingsActivityStatusCell({
  statusCode,
  tone,
}: {
  statusCode: string;
  tone: 'success' | 'warning' | 'muted';
}) {
  return (
    <KolamStatusBadge
      label={statusCode}
      intent={getSettingsActivityStatusIntent(tone)}
      style={styles.settingsActivityTableStatusCell}
      numberOfLines={1}
    />
  );
}
