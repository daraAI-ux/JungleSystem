import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {detailValueRowStyles as styles} from './kolam-detail-value-row-styles';

export function KolamDetailValueCopy({
  label,
  meta,
}: {
  label: string;
  meta: string;
}) {
  return (
    <KolamCopyStack
      containerStyle={styles.copy}
      items={[
        {id: 'label', text: label, style: styles.label},
        {id: 'meta', text: meta, style: styles.meta},
      ]}
    />
  );
}
