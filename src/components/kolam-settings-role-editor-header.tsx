import React from 'react';
import type {SettingsRoleEditorAction} from '../domain/settings-surface';
import {KolamHeaderFrame} from './kolam-header-frame';
import {KolamSettingsRoleEditorActionList} from './kolam-settings-role-editor-action-list';
import {KolamSettingsRoleEditorTitleCopy} from './kolam-settings-role-editor-title-copy';

export function KolamSettingsRoleEditorHeader({
  actions,
  selectedRoleName,
}: {
  actions: SettingsRoleEditorAction[];
  selectedRoleName: string;
}) {
  return (
    <KolamHeaderFrame variant="settingsRoleEditorHeader">
      <KolamSettingsRoleEditorTitleCopy selectedRoleName={selectedRoleName} />
      <KolamSettingsRoleEditorActionList actions={actions} />
    </KolamHeaderFrame>
  );
}