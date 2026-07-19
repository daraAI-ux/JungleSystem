import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {View} from 'react-native';
import type {
  KolamSummaryCardItem,
  KolamSummaryCardListVariant,
} from './kolam-summary-card-list-types';
import {KolamSummaryCardBadges} from './kolam-summary-card-badges';
import {summaryCardListStyles as styles} from './kolam-summary-card-list-styles';

export function KolamSummaryCardListItem({
  item,
  variant,
}: {
  item: KolamSummaryCardItem;
  variant: KolamSummaryCardListVariant;
}) {
  const compact = variant === 'compact';

  return (
    <View style={[styles.card, compact ? styles.compactCard : styles.panelCard]}>
      <KolamCopyStack
        items={[
          {
            id: 'title',
            text: item.title,
            style: compact ? styles.compactTitle : styles.panelTitle,
          },
          {
            id: 'meta',
            text: item.meta,
            style: compact ? styles.compactMeta : styles.panelMeta,
          },
        ]}
      />
      <KolamSummaryCardBadges badges={item.badges} />
    </View>
  );
}
