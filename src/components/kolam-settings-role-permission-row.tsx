import React from 'react';
import type {SettingsRolePermissionMatrixGroup} from '../domain/settings-surface';
import {KolamRowFrame} from './kolam-row-frame';
import {KolamStatePillGroup} from './kolam-state-pill-group';
import {KolamSettingsRolePermissionResource} from './kolam-settings-role-permission-resource';

type PermissionRow = SettingsRolePermissionMatrixGroup['rows'][number];

export function KolamSettingsRolePermissionRow({row}: {row: PermissionRow}) {
  return (
    <KolamRowFrame variant="settingsPermission">
      <KolamSettingsRolePermissionResource row={row} />
      <KolamStatePillGroup
        accessibilityLabel={`${row.label} permission actions`}
        items={row.actions}
      />
    </KolamRowFrame>
  );
}