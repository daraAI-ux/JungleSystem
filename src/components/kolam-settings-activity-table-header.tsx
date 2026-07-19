import React from 'react';
import type {SettingsActivityLogTableColumn} from '../domain/settings-surface';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamRowFrame} from './kolam-row-frame';
import {KolamSettingsActivityTableHeaderCell} from './kolam-settings-activity-table-header-cell';

export function KolamSettingsActivityTableHeader({
  columns,
}: {
  columns: SettingsActivityLogTableColumn[];
}) {
  return (
    <KolamRowFrame variant="settingsActivityHeader">
      <KolamMappedList
        items={columns}
        getKey={column => column.id}
        renderItem={column => (
          <KolamSettingsActivityTableHeaderCell column={column} />
        )}
      />
    </KolamRowFrame>
  );
}