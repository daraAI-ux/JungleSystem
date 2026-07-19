import React from 'react';
import type { StyleProp, TextStyle } from 'react-native';
import { KolamCopyStack } from './kolam-copy-stack';
import { dataTableRowStyles as styles } from './kolam-data-table-row-styles';

export function KolamDataTableMetaCell({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <KolamCopyStack
      items={[{ id: 'meta', text: children, style: [styles.meta, style] }]}
    />
  );
}

export function KolamDataTableAmountCell({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <KolamCopyStack
      items={[{ id: 'amount', text: children, style: [styles.amount, style] }]}
    />
  );
}
