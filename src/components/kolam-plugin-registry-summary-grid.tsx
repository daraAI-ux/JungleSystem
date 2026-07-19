import React from 'react';
import type {PluginIntegrationStats} from '../domain/unified';
import {getPluginSurfaceSummaryCards} from '../domain/plugin-surface';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamPluginSummaryCard} from './kolam-surface-widgets';

export function KolamPluginRegistrySummaryGrid({
  stats,
}: {
  stats: PluginIntegrationStats;
}) {
  const summaryCards = getPluginSurfaceSummaryCards(stats);

  return (
    <KolamListFrame variant="pluginSummaryGrid">
      <KolamMappedList
        items={summaryCards}
        getKey={card => card.id}
        renderItem={card => <KolamPluginSummaryCard card={card} />}
      />
    </KolamListFrame>
  );
}

