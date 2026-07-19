import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import type {PluginSurfaceSummaryCard} from '../domain/plugin-surface';
import {pluginSummaryCardStyles as styles} from './kolam-plugin-summary-card-styles';

export function KolamPluginSummaryCardLabel({
  card,
}: {
  card: PluginSurfaceSummaryCard;
}) {
  return (
    <KolamCopyStack
      items={[
        {
          id: 'label',
          text: card.label,
          style: styles.pluginSummaryLabel,
        },
      ]}
    />
  );
}
