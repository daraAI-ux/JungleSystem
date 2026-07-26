import React from 'react';
import type {SettingsRolePermissionMatrixGroup} from '../domain/settings-surface';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamSettingsRolePermissionGroupHeader} from './kolam-settings-role-permission-group-header';
import {KolamSettingsRolePermissionRow} from './kolam-settings-role-permission-row';

export function KolamSettingsRolePermissionGroup({
  group,
  onTogglePermissionAction,
}: {
  group: SettingsRolePermissionMatrixGroup;
  onTogglePermissionAction?: (resource: string, action: string) => void;
}) {
  return (
    <KolamCardFrame variant="settingsRolePermissionGroup">
      <KolamSettingsRolePermissionGroupHeader group={group} />
      {group.expanded ? (
        <KolamMappedList
        items={group.rows}
        getKey={row => row.id}
        renderItem={row => (
          <KolamSettingsRolePermissionRow
            row={row}
            onTogglePermissionAction={onTogglePermissionAction}
          />
        )}
      />
      ) : null}
    </KolamCardFrame>
  );
}
