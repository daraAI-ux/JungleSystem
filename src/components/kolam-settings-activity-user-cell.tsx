import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {settingsActivityTableStyles as styles} from './kolam-settings-activity-table-styles';

export function KolamSettingsActivityUserCell({user}: {user: string}) {
  return (
    <KolamCopyStack
      items={[
        {
          id: 'user',
          text: user,
          style: styles.settingsActivityTableUserCell,
          textProps: {numberOfLines: 1},
        },
      ]}
    />
  );
}
