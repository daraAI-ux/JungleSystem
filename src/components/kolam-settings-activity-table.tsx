import React from 'react';
import type {
  SettingsActivityLogRow,
  SettingsActivityLogTableColumn,
} from '../domain/settings-surface';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamSettingsActivityTableHeader} from './kolam-settings-activity-table-header';
import {KolamSettingsActivityTableRow} from './kolam-settings-activity-table-row';
import {
  KOLAM_SETTINGS_ACTIVITY_TABLE_VISUAL,
} from './kolam-settings-activity-table-visual';

export function KolamSettingsActivityLogTable({
  columns,
  rows,
  selectedRowId,
  onSelectRow,
}: {
  columns: SettingsActivityLogTableColumn[];
  rows: SettingsActivityLogRow[];
  selectedRowId: string;
  onSelectRow: (rowId: string) => void;
}) {
  return (
    <KolamCardFrame
      variant="settingsActivityTable"
      accessibilityLabel="Activity logs table">
      <KolamSettingsActivityTableHeader columns={columns} />
      <KolamMappedList
        items={rows}
        getKey={row => row.id}
        renderItem={(row, index, visibleRows) => (
          <KolamSettingsActivityTableRow
            row={row}
            isActive={selectedRowId === row.id}
            isLast={
              index === visibleRows.length - 1 &&
              !KOLAM_SETTINGS_ACTIVITY_TABLE_VISUAL.body.lastRowBorderBottom
            }
            onSelectRow={onSelectRow}
          />
        )}
      />
    </KolamCardFrame>
  );
}