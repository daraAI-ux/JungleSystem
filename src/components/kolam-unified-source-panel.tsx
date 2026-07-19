import React from 'react';
import {StyleSheet} from 'react-native';
import type {ShellModule} from '../domain/app-shell';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {formatRupiah} from '../lib/money';
import type {UnifiedDataset} from '../services/unified-data';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamCopyStack} from './kolam-copy-stack';
import {getAmStatusText, getKolamStatusText} from './kolam-unified-status-text';

export function KolamUnifiedSourcePanel({
  module,
  dataset,
  pluginCount,
  totalPluginCount,
}: {
  module: ShellModule;
  dataset: UnifiedDataset;
  pluginCount: number;
  totalPluginCount: number;
}) {
  const amSummary = dataset.am.dashboard?.summary;

  return (
    <KolamCardFrame variant="info">
      <KolamCopyStack
        items={[
          {id: 'label', text: 'Source repo live', style: styles.sourceLabel},
          {id: 'path', text: module.sourceRepo, style: styles.sourcePath},
          {
            id: 'meta',
            text:
              module.id === 'kolam'
                ? `Kolam API: ${getKolamStatusText(dataset)}`
                : module.id === 'am'
                  ? `AM API: ${getAmStatusText(dataset)}`
                  : `${pluginCount}/${totalPluginCount} package cocok filter`,
            style: styles.sourceMeta,
          },
          ...(module.id === 'kolam' && dataset.kolam.saleCostSummary
            ? [
                {
                  id: 'margin',
                  text: [
                    'Margin: ',
                    formatRupiah(dataset.kolam.saleCostSummary.grossMargin),
                    ' dari ',
                    dataset.kolam.saleCostSummary.saleCount,
                    ' sale paid',
                  ],
                  style: styles.sourceMeta,
                },
              ]
            : []),
          ...(module.id === 'am' && amSummary
            ? [
                {
                  id: 'am',
                  text: [
                    'Account: ',
                    amSummary.totalAccounts,
                    ' / Mutasi masuk hari ini: ',
                    formatRupiah(amSummary.todayIncoming.total),
                  ],
                  style: styles.sourceMeta,
                },
              ]
            : []),
        ]}
      />
    </KolamCardFrame>
  );
}

const styles = StyleSheet.create({
  sourceLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  sourcePath: {
    marginTop: 4,
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '800',
  },
  sourceMeta: {
    marginTop: 4,
    color: V.colors.mutedFg,
    fontSize: 12,
  },
});