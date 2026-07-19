import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import type {KolamTableColumn} from '../domain/kolam-table';
import {dataTableHeaderStyles as styles} from './kolam-data-table-header-styles';

export function KolamDataTableHeaderCell({
  column,
}: {
  column: KolamTableColumn;
}) {
  return (
    <KolamCopyStack
      items={[
        {
          id: column.id,
          text: column.label,
          style: [
            styles.text,
            column.id === 'primary' && styles.primary,
            column.align === 'right' && styles.right,
            column.width ? {width: column.width} : null,
          ],
        },
      ]}
    />
  );
}
