import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {settingsRolePermissionMatrixStyles as styles} from './kolam-settings-role-permission-matrix-styles';

export function KolamSettingsRolePermissionCountPill({
  activeCount,
  totalPossible,
}: {
  activeCount: number;
  totalPossible: number;
}) {
  return (
    <KolamCopyStack
      items={[
        {
          id: 'count',
          text:
            activeCount > 0
              ? `${activeCount}/${totalPossible} permissions`
              : 'No permissions',
          style: [
            styles.settingsRolePermissionMatrixCount,
            activeCount > 0 && styles.settingsRolePermissionMatrixCountActive,
          ],
        },
      ]}
    />
  );
}
