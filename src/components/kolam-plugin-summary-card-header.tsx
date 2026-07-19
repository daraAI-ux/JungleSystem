import React from 'react';
import type {PluginSurfaceSummaryCard} from '../domain/plugin-surface';
import {KolamHeaderFrame} from './kolam-header-frame';
import {KolamPluginSummaryCardIcon} from './kolam-plugin-summary-card-icon';
import {KolamPluginSummaryCardValue} from './kolam-plugin-summary-card-value';

export function KolamPluginSummaryCardHeader({
  card,
}: {
  card: PluginSurfaceSummaryCard;
}) {
  return (
    <KolamHeaderFrame variant="pluginSummary">
      <KolamPluginSummaryCardIcon card={card} />
      <KolamPluginSummaryCardValue card={card} />
    </KolamHeaderFrame>
  );
}