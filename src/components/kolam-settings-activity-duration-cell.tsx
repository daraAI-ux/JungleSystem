import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {settingsActivityTableStyles as styles} from './kolam-settings-activity-table-styles';

export function KolamSettingsActivityDurationCell({
  duration,
}: {
  duration: string;
}) {
  return (
    <KolamCopyStack
      items={[
        {
          id: 'duration',
          text: duration,
          style: styles.settingsActivityTableDurationCell,
        },
      ]}
    />
  );
}
