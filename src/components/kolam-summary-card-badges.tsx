import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';
import {summaryCardListStyles as styles} from './kolam-summary-card-list-styles';

export function KolamSummaryCardBadges({badges}: {badges?: string[]}) {
  if (!badges?.length) {
    return null;
  }

  return (
    <KolamListFrame variant="summaryBadges">
      <KolamMappedList
        items={badges}
        getKey={badge => badge}
        renderItem={badge => (
          <KolamCopyStack
            items={[{id: 'badge', text: badge, style: styles.badge}]}
          />
        )}
      />
    </KolamListFrame>
  );
}