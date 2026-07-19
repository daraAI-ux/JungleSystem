import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {selectableRowStyles as styles} from './kolam-selectable-row-styles';

export function KolamSelectableRowCopy({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <KolamCopyStack
      containerStyle={styles.copy}
      items={[
        {id: 'title', text: title, style: styles.title},
        {id: 'description', text: description, style: styles.description},
      ]}
    />
  );
}
