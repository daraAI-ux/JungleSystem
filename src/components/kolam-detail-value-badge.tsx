import React from 'react';
import {KolamBadge} from './kolam-badge';
import {getDetailValueBadgeIntent} from './kolam-detail-value-intent';
import {detailValueRowStyles as styles} from './kolam-detail-value-row-styles';
import type {KolamDetailValueTone} from './kolam-detail-value-row-types';

export function KolamDetailValueBadge({
  tone,
  value,
}: {
  tone: KolamDetailValueTone;
  value: string;
}) {
  return (
    <KolamBadge
      label={value}
      intent={getDetailValueBadgeIntent(tone)}
      align="right"
      weight="800"
      style={styles.value}
    />
  );
}
