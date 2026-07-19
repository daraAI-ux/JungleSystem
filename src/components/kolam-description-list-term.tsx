import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {descriptionListStyles as styles} from './kolam-description-list-styles';

export function KolamDescriptionListTerm({label}: {label: string}) {
  return (
    <KolamCopyStack
      containerStyle={styles.term}
      items={[{id: 'label', text: label, style: styles.termText}]}
    />
  );
}
