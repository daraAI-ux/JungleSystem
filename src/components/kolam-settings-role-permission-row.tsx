import React from 'react';
import type {SettingsRolePermissionMatrixGroup} from '../domain/settings-surface';
import {KolamInteractionFrame} from './kolam-interaction-frame';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamRowFrame} from './kolam-row-frame';
import {KolamStatePill} from './kolam-state-pill';
import {KolamSettingsRolePermissionResource} from './kolam-settings-role-permission-resource';

type PermissionRow = SettingsRolePermissionMatrixGroup['rows'][number];

export function KolamSettingsRolePermissionRow({
  row,
  onTogglePermissionAction,
}: {
  row: PermissionRow;
  onTogglePermissionAction?: (resource: string, action: string) => void;
}) {
  return (
    <KolamRowFrame variant="settingsPermission">
      <KolamSettingsRolePermissionResource row={row} />
      <KolamListFrame
        variant="pill"
        accessibilityLabel={`${row.label} permission actions`}>
        <KolamMappedList
          items={row.actions}
          getKey={item => item.id}
          renderItem={item => (
            <KolamInteractionFrame
              accessibilityLabel={`${row.label} ${item.label}`}
              checked={item.selected}
              disabled={item.disabled}
              onPress={() => onTogglePermissionAction?.(row.resource, item.id)}>
              <KolamStatePill item={item} />
            </KolamInteractionFrame>
          )}
        />
      </KolamListFrame>
    </KolamRowFrame>
  );
}
