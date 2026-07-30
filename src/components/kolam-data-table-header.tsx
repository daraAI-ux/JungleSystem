import React from 'react';
import {KolamDataTableHeaderCell} from './kolam-data-table-header-cell';
import type {KolamDataTableHeaderProps} from './kolam-data-table-header-types';
import {
  KolamDataTableActionsTrack,
  KolamDataTableMainTrack,
} from './kolam-data-table-tracks';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamRowFrame} from './kolam-row-frame';
import {KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH} from './kolam-data-table-column-style';

export type {KolamDataTableHeaderProps} from './kolam-data-table-header-types';

export function KolamDataTableHeader({columns}: KolamDataTableHeaderProps) {
  const mainColumns = columns.filter(column => column.id !== 'actions');
  const actionsColumn = columns.find(column => column.id === 'actions');
  const actionsWidth = Math.max(
    actionsColumn?.width ?? KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
    KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
  );

  return (
    <KolamRowFrame variant="dataTableHeader">
      <KolamDataTableMainTrack>
        <KolamMappedList
          items={mainColumns}
          getKey={column => column.id}
          renderItem={column => <KolamDataTableHeaderCell column={column} />}
        />
      </KolamDataTableMainTrack>
      {actionsColumn ? (
        <KolamDataTableActionsTrack width={actionsWidth}>
          <KolamDataTableHeaderCell column={actionsColumn} />
        </KolamDataTableActionsTrack>
      ) : null}
    </KolamRowFrame>
  );
}
