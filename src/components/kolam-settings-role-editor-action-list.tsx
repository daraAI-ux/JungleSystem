import React from 'react';
import type {SettingsRoleEditorAction} from '../domain/settings-surface';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamSettingsRoleEditorAction as RoleAction} from './kolam-settings-role-editor-action';

export function KolamSettingsRoleEditorActionList({
  actions,
}: {
  actions: SettingsRoleEditorAction[];
}) {
  return (
    <KolamListFrame variant="roleEditorActions">
      <KolamMappedList
        items={actions}
        getKey={action => action.id}
        renderItem={action => <RoleAction action={action} />}
      />
    </KolamListFrame>
  );
}