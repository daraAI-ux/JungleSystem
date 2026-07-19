import React from 'react';
import type {SettingsRoleInfoPanel} from '../domain/settings-surface';
import {KolamHeaderFrame} from './kolam-header-frame';
import {KolamSettingsRoleInfoActions} from './kolam-settings-role-info-actions';
import {KolamSettingsRoleInfoCopy} from './kolam-settings-role-info-copy';
import {KolamSettingsRoleInfoNotice} from './kolam-settings-role-info-notice';

export function KolamSettingsRoleInfoPanel({
  info,
}: {
  info: SettingsRoleInfoPanel;
}) {
  return (
    <>
      <KolamHeaderFrame variant="settingsRoleInfoPanel">
        <KolamSettingsRoleInfoCopy info={info} />
        <KolamSettingsRoleInfoActions info={info} />
      </KolamHeaderFrame>
      <KolamSettingsRoleInfoNotice notice={info.notice} />
    </>
  );
}