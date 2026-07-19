import React from 'react';
import {
  KolamSummaryCardList,
  type KolamSummaryCardItem,
  type KolamSummaryCardListProps,
} from './kolam-summary-card-list';

export interface KolamMappedSummaryCardListProps<Item>
  extends Omit<KolamSummaryCardListProps, 'items'> {
  getItem: (item: Item) => KolamSummaryCardItem;
  items: Item[];
}

export function KolamMappedSummaryCardList<Item>({
  getItem,
  items,
  ...props
}: KolamMappedSummaryCardListProps<Item>) {
  return (
    <KolamSummaryCardList
      {...props}
      items={items.map(item => getItem(item))}
    />
  );
}
