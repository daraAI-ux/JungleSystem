import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {totalRowStyles as styles} from './kolam-total-row-styles';

export function KolamTotalRowLabel({
  label,
  strong,
}: {
  label: string;
  strong: boolean;
}) {
  return (
    <KolamCopyStack
      items={[
        {id: 'label', text: label, style: [styles.label, strong && styles.strong]},
      ]}
    />
  );
}

export function KolamTotalRowValue({
  strong,
  value,
}: {
  strong: boolean;
  value: string;
}) {
  return (
    <KolamCopyStack
      items={[
        {id: 'value', text: value, style: [styles.value, strong && styles.strong]},
      ]}
    />
  );
}
