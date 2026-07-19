import React from 'react';
import type {SettingsRoleAccessRow} from '../domain/settings-surface';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamSettingsRoleTableHeader} from './kolam-settings-role-table-header';
import {KolamSettingsRoleTableRow} from './kolam-settings-role-table-row';

export function KolamSettingsRoleTable({
  rows,
  selectedRoleId,
  onSelectRole,
}: {
  rows: SettingsRoleAccessRow[];
  selectedRoleId: string;
  onSelectRole: (roleId: string) => void;
}) {
  return (
    <>
      <KolamSettingsRoleTableHeader />
      <KolamMappedList
        items={rows}
        getKey={row => row.id}
        renderItem={row => (
          <KolamSettingsRoleTableRow
            row={row}
            selectedRoleId={selectedRoleId}
            onSelectRole={onSelectRole}
          />
        )}
      />
    </>
  );
}
