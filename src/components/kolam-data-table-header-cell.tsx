import React from 'react';
import { KolamCopyStack } from './kolam-copy-stack';
import type { KolamTableColumn } from '../domain/kolam-table';
import { dataTableHeaderStyles as styles } from './kolam-data-table-header-styles';

export function KolamDataTableHeaderCell({
  column,
}: {
  column: KolamTableColumn;
}) {
  const headerAlign = column.headerAlign ?? column.align;

  return (
    <KolamCopyStack
      items={[
        {
          id: column.id,
          text: column.label,
          textProps: { numberOfLines: 2 },
          style: [
            styles.text,
            column.id === 'primary' && !column.width && styles.primary,
            headerAlign === 'center' && styles.center,
            headerAlign === 'right' && styles.right,
            column.width ? { width: column.width } : null,
          ],
        },
      ]}
    />
  );
}
