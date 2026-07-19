import React from 'react';
import type {SettingsActivityLogRow} from '../domain/settings-surface';
import {KolamTableActionButton} from './kolam-table-action-button';

export function KolamSettingsActivityActionCell({
  row,
  onSelectRow,
}: {
  row: SettingsActivityLogRow;
  onSelectRow: (rowId: string) => void;
}) {
  return (
    <KolamTableActionButton
      accessibilityLabel={`Detail log ${row.path}`}
      onPress={() => onSelectRow(row.id)}
    />
  );
}
