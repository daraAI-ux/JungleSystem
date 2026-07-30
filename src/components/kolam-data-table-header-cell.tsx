import React from 'react';
import { Text, View } from 'react-native';
import type { KolamTableColumn } from '../domain/kolam-table';
import { getKolamDataTableColumnStyle } from './kolam-data-table-column-style';
import { dataTableHeaderStyles as styles } from './kolam-data-table-header-styles';

export function KolamDataTableHeaderCell({
  column,
}: {
  column: KolamTableColumn;
}) {
  const headerAlign = column.headerAlign ?? column.align;
  const label = column.label.trim();

  return (
    <View
      style={[
        styles.cell,
        getKolamDataTableColumnStyle(column),
        headerAlign === 'center' ? styles.cellCenter : null,
        headerAlign === 'right' ? styles.cellRight : null,
      ]}
    >
      {label ? (
        <Text
          numberOfLines={2}
          style={[
            styles.text,
            headerAlign === 'center' || headerAlign === 'right'
              ? styles.labelFill
              : null,
            headerAlign === 'center' ? styles.center : null,
            headerAlign === 'right' ? styles.right : null,
            headerAlign === 'left' ? styles.left : null,
          ]}
        >
          {column.label}
        </Text>
      ) : null}
    </View>
  );
}
