import React from 'react';
import type {SettingsRolePermissionMatrixGroup} from '../domain/settings-surface';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamSettingsRolePermissionGroup} from './kolam-settings-role-permission-group';

export function KolamSettingsRolePermissionMatrix({
  groups,
}: {
  groups: SettingsRolePermissionMatrixGroup[];
}) {
  return (
    <KolamCardFrame variant="settingsPermissionMatrix">
      <KolamMappedList
        items={groups}
        getKey={group => group.id}
        renderItem={group => <KolamSettingsRolePermissionGroup group={group} />}
      />
    </KolamCardFrame>
  );
}