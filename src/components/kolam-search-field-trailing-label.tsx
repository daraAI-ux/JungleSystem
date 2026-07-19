import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {searchFieldStyles as styles} from './kolam-search-field-styles';

export function KolamSearchFieldTrailingLabel({
  trailingLabel,
}: {
  trailingLabel?: string;
}) {
  return trailingLabel ? (
    <KolamCopyStack
      items={[
        {id: 'trailing', text: trailingLabel, style: styles.trailing},
      ]}
    />
  ) : null;
}
