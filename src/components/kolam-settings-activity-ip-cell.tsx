import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {settingsActivityTableStyles as styles} from './kolam-settings-activity-table-styles';

export function KolamSettingsActivityIpCell({ip}: {ip: string}) {
  return (
    <KolamCopyStack
      items={[
        {id: 'ip', text: ip, style: styles.settingsActivityTableIpCell},
      ]}
    />
  );
}
