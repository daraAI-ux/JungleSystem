import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import type {KolamStatsCardItem} from './kolam-stats-card-strip-types';
import {statsCardStripStyles as styles} from './kolam-stats-card-strip-styles';
import {getStatsCardValueToneStyle} from './kolam-stats-card-value-style';

export function KolamStatsCard({card}: {card: KolamStatsCardItem}) {
  return (
    <KolamCopyStack
      containerStyle={styles.card}
      items={[
        {id: 'label', text: card.label, style: styles.label},
        {
          id: 'value',
          text: card.value,
          style: [styles.value, getStatsCardValueToneStyle(card.tone)],
        },
        {id: 'detail', text: card.detail, style: styles.detail},
      ]}
    />
  );
}
