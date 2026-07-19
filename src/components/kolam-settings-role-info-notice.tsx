import React from 'react';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamCopyStack} from './kolam-copy-stack';
import {settingsRoleInfoPanelStyles as styles} from './kolam-settings-role-info-panel-styles';

export function KolamSettingsRoleInfoNotice({notice}: {notice?: string}) {
  if (!notice) {
    return null;
  }

  return (
    <KolamCardFrame variant="settingsRoleInfoNotice">
      <KolamCopyStack
        items={[
          {
            id: 'notice',
            text: notice,
            style: styles.settingsRoleInfoNoticeText,
          },
        ]}
      />
    </KolamCardFrame>
  );
}