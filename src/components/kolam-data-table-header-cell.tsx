import React from 'react';
import { View } from 'react-native';
import { KolamCopyStack } from './kolam-copy-stack';
import type { KolamTableColumn } from '../domain/kolam-table';
import { dataTableHeaderStyles as styles } from './kolam-data-table-header-styles';

export function KolamDataTableHeaderCell({
  column,
}: {
  column: KolamTableColumn;
}) {
  const headerAlign = column.headerAlign ?? column.align;
  const isPrimaryFlex = column.id === 'primary' && !column.width;

  return (
    <View
      style={[
        styles.cell,
        isPrimaryFlex ? styles.primary : null,
        column.width != null ? { width: column.width } : null,
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
