import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {dataTableRowStyles as styles} from './kolam-data-table-row-styles';

export function KolamDataTablePrimaryCell({
  subtitle,
  title,
}: {
  subtitle: React.ReactNode;
  title: React.ReactNode;
}) {
  return (
    <KolamCopyStack
      containerStyle={styles.primary}
      items={[
        {id: 'title', text: title, style: styles.title},
        {id: 'subtitle', text: subtitle, style: styles.subtitle},
      ]}
    />
  );
}
