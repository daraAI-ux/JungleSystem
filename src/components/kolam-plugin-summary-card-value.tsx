import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import type {PluginSurfaceSummaryCard} from '../domain/plugin-surface';
import {pluginSummaryCardStyles as styles} from './kolam-plugin-summary-card-styles';
import {getPluginSummaryValueToneStyle} from './kolam-plugin-summary-tone-styles';

export function KolamPluginSummaryCardValue({
  card,
}: {
  card: PluginSurfaceSummaryCard;
}) {
  return (
    <KolamCopyStack
      items={[
        {
          id: 'value',
          text: card.value,
          style: [
            styles.pluginSummaryValue,
            getPluginSummaryValueToneStyle(card.tone),
          ],
        },
      ]}
    />
  );
}
