import React from 'react';
import type {SettingsRolePermissionMatrixGroup} from '../domain/settings-surface';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamHeaderFrame} from './kolam-header-frame';
import {KolamSettingsRolePermissionCountPill} from './kolam-settings-role-permission-count-pill';
import {settingsRolePermissionMatrixStyles as styles} from './kolam-settings-role-permission-matrix-styles';

export function KolamSettingsRolePermissionGroupHeader({
  group,
}: {
  group: SettingsRolePermissionMatrixGroup;
}) {
  return (
    <KolamHeaderFrame variant="rolePermissionGroup">
      <KolamCopyStack
        items={[
          {
            id: 'title',
            text: group.label,
            style: styles.settingsRolePermissionMatrixGroupTitle,
          },
          {
            id: 'meta',
            text: `${group.resourceCount} resources`,
            style: styles.settingsRolePermissionMatrixGroupMeta,
          },
        ]}
      />
      <KolamSettingsRolePermissionCountPill
        activeCount={group.activeCount}
        totalPossible={group.totalPossible}
      />
    </KolamHeaderFrame>
  );
}