import React from 'react';
import type {SettingsRoleAccessRow} from '../domain/settings-surface';
import {KolamSelectableRow} from './kolam-selectable-row';
import {KolamSettingsRoleFlagBadges} from './kolam-settings-role-flag-badges';

export function KolamSettingsRoleTableRow({
  row,
  selectedRoleId,
  onSelectRole,
}: {
  row: SettingsRoleAccessRow;
  selectedRoleId: string;
  onSelectRole: (roleId: string) => void;
}) {
  return (
    <KolamSelectableRow
      title={row.role}
      description={row.meta}
      selected={row.id === selectedRoleId}
      onPress={() => onSelectRole(row.id)}>
      <KolamSettingsRoleFlagBadges flags={[row.kolam, row.pos, row.am]} />
    </KolamSelectableRow>
  );
}
