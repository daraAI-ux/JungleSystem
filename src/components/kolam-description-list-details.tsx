import React from 'react';
import {Pressable} from 'react-native';
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
  const valueBadge = (
    <KolamBadge
      label={row.value}
      intent={getDescriptionListBadgeIntent(row.tone)}
      style={[
        row.tone === 'default' && styles.valueDefault,
        row.onPress ? styles.valueLink : null,
      ]}
      weight="800"
    />
  );

  return (
    <KolamInlineFrame variant="descriptionDetails">
      {row.onPress ? (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={row.value}
          onPress={row.onPress}
        >
          {valueBadge}
        </Pressable>
      ) : (
        valueBadge
      )}
      <KolamCopyStack
        items={[{id: 'meta', text: row.meta, style: styles.meta}]}
      />
    </KolamInlineFrame>
  );
}