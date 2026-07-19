import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {toggleRowStyles as styles} from './kolam-toggle-row-styles';

export function KolamToggleRowCopy({
  description,
  label,
}: {
  description: string;
  label: string;
}) {
  return (
    <KolamCopyStack
      containerStyle={styles.copy}
      items={[
        {id: 'label', text: label, style: styles.label},
        {id: 'description', text: description, style: styles.description},
      ]}
    />
  );
}
