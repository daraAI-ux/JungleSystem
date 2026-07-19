import React from 'react';
import {KolamBadge} from './kolam-badge';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamInlineFrame} from './kolam-inline-frame';
import type {KolamDescriptionListRow} from './kolam-description-list-types';
import {getDescriptionListBadgeIntent} from './kolam-description-list-badge-intent';
import {descriptionListStyles as styles} from './kolam-description-list-styles';

export function KolamDescriptionListDetails({
  row,
}: {
  row: KolamDescriptionListRow;
}) {
  return (
    <KolamInlineFrame variant="descriptionDetails">
      <KolamBadge
        label={row.value}
        intent={getDescriptionListBadgeIntent(row.tone)}
        style={row.tone === 'default' && styles.valueDefault}
        weight="800"
      />
      <KolamCopyStack
        items={[{id: 'meta', text: row.meta, style: styles.meta}]}
      />
    </KolamInlineFrame>
  );
}