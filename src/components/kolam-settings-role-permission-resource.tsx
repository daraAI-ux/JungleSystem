import React from 'react';
import type {SettingsRolePermissionMatrixGroup} from '../domain/settings-surface';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamInlineFrame} from './kolam-inline-frame';
import {settingsRolePermissionMatrixStyles as styles} from './kolam-settings-role-permission-matrix-styles';
import {KolamSettingsRolePermissionToneDot} from './kolam-settings-role-permission-tone-dot';

type PermissionRow = SettingsRolePermissionMatrixGroup['rows'][number];

export function KolamSettingsRolePermissionResource({
  row,
}: {
  row: PermissionRow;
}) {
  return (
    <KolamInlineFrame variant="rolePermissionResource">
      <KolamSettingsRolePermissionToneDot tone={row.tone} />
      <KolamCopyStack
        items={[
          {
            id: 'label',
            text: row.label,
            style: styles.settingsRolePermissionMatrixLabel,
          },
          {
            id: 'meta',
            text: `${row.activeCount}/${row.totalCount} ${row.resource}`,
            style: styles.settingsRolePermissionMatrixMeta,
          },
        ]}
      />
    </KolamInlineFrame>
  );
}