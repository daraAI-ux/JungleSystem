import React from 'react';
import {View} from 'react-native';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamSummaryCardListItem} from './kolam-summary-card-list-item';
import {
  type KolamSummaryCardItem,
  type KolamSummaryCardListProps,
  type KolamSummaryCardListVariant,
} from './kolam-summary-card-list-types';
import {summaryCardListStyles as styles} from './kolam-summary-card-list-styles';

export type {
  KolamSummaryCardItem,
  KolamSummaryCardListProps,
  KolamSummaryCardListVariant,
};

export function KolamSummaryCardList({
  accessibilityLabel,
  items,
  variant = 'panel',
}: KolamSummaryCardListProps) {
  const compact = variant === 'compact';

  return (
    <View
      style={[styles.list, compact ? styles.compactList : styles.panelList]}
      accessibilityLabel={accessibilityLabel}>
      <KolamMappedList
        items={items}
        getKey={item => item.id}
        renderItem={item => (
          <KolamSummaryCardListItem
            item={item}
            variant={variant}
          />
        )}
      />
    </View>
  );
}
