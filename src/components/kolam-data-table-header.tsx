import React from 'react';
import {KolamDataTableHeaderCell} from './kolam-data-table-header-cell';
import type {KolamDataTableHeaderProps} from './kolam-data-table-header-types';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamRowFrame} from './kolam-row-frame';

export type {KolamDataTableHeaderProps} from './kolam-data-table-header-types';

export function KolamDataTableHeader({columns}: KolamDataTableHeaderProps) {
  return (
    <KolamRowFrame variant="dataTableHeader">
      <KolamMappedList
        items={columns}
        getKey={column => column.id}
        renderItem={column => <KolamDataTableHeaderCell column={column} />}
      />
    </KolamRowFrame>
  );
}