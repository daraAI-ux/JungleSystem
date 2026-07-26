import React from 'react';
import type {
  SettingsRoleEditorAction,
  SettingsRoleEditorActionId,
} from '../domain/settings-surface';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamSettingsRoleEditorAction as RoleAction} from './kolam-settings-role-editor-action';

export function KolamSettingsRoleEditorActionList({
  actions,
  onAction = noopRoleEditorAction,
}: {
  actions: SettingsRoleEditorAction[];
  onAction?: (actionId: SettingsRoleEditorActionId) => void;
}) {
  return (
    <KolamListFrame variant="roleEditorActions">
      <KolamMappedList
        items={actions}
        getKey={action => action.id}
        renderItem={action => (
          <RoleAction
            action={action}
            onPress={() => onAction(action.id)}
          />
        )}
      />
    </KolamListFrame>
  );
}

function noopRoleEditorAction() {}
