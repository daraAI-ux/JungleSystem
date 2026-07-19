import React from 'react';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamStatsCard} from './kolam-stats-card';
import {
  type KolamStatsCardItem,
  type KolamStatsCardStripProps,
  type KolamStatsCardTone,
} from './kolam-stats-card-strip-types';

export type {
  KolamStatsCardItem,
  KolamStatsCardStripProps,
  KolamStatsCardTone,
};

export function KolamStatsCardStrip({cards}: KolamStatsCardStripProps) {
  return (
    <KolamListFrame variant="statsCardStrip">
      <KolamMappedList
        items={cards}
        getKey={card => card.id}
        renderItem={card => <KolamStatsCard card={card} />}
      />
    </KolamListFrame>
  );
}
