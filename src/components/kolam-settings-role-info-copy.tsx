import React from 'react';
import type {SettingsRoleInfoPanel} from '../domain/settings-surface';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamInlineFrame} from './kolam-inline-frame';
import {KolamSettingsRoleInfoBadgeList} from './kolam-settings-role-info-badge-list';
import {settingsRoleInfoPanelStyles as styles} from './kolam-settings-role-info-panel-styles';

export function KolamSettingsRoleInfoCopy({
  info,
}: {
  info: SettingsRoleInfoPanel;
}) {
  return (
    <KolamInlineFrame variant="roleInfoCopy">
      <KolamInlineFrame variant="roleInfoTitleRow">
        <KolamCopyStack
          items={[
            {
              id: 'title',
              text: info.name,
              style: styles.settingsRoleInfoTitle,
            },
          ]}
        />
        <KolamSettingsRoleInfoBadgeList badges={info.badges} />
      </KolamInlineFrame>
      <KolamCopyStack
        items={[
          {
            id: 'description',
            text: info.description,
            style: styles.settingsRoleInfoDescription,
          },
        ]}
      />
    </KolamInlineFrame>
  );
}