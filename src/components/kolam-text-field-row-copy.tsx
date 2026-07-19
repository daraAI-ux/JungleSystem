import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {textFieldRowStyles as styles} from './kolam-text-field-row-styles';

export function KolamTextFieldRowCopy({
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
