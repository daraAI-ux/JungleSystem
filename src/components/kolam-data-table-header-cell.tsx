import React from 'react';
import { View } from 'react-native';
import { KolamCopyStack } from './kolam-copy-stack';
import type { KolamTableColumn } from '../domain/kolam-table';
import { getKolamDataTableColumnStyle } from './kolam-data-table-column-style';
import { dataTableHeaderStyles as styles } from './kolam-data-table-header-styles';

export function KolamDataTableHeaderCell({
  column,
}: {
  column: KolamTableColumn;
}) {
  const headerAlign = column.headerAlign ?? column.align;

  return (
    <View
      style={[
        styles.cell,
        getKolamDataTableColumnStyle(column),
        headerAlign === 'center' ? styles.cellCenter : null,
        headerAlign === 'right' ? styles.cellRight : null,
      ]}
    >
      <KolamCopyStack
        items={[
          {
            id: column.id,
            text: column.label,
            textProps: { numberOfLines: 2 },
            style: [
              styles.text,
              headerAlign === 'center' && styles.center,
              headerAlign === 'right' && styles.right,
            ],
          },
        ]}
      />
    </View>
  );
}
