import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamMetricCard} from '../src/components/kolam-metric-card';
import {KolamModulePanel} from '../src/components/kolam-module-panel';
import {KolamPluginSummaryCard} from '../src/components/kolam-plugin-summary-card';
import {getPluginSurfaceSummaryCards} from '../src/domain/plugin-surface';
import {getPluginIntegrationStats, pluginRegistry} from '../src/domain/unified';

function renderText(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root
    .findAllByType(Text)
    .flatMap(node => flattenText(node.props.children));
}

function flattenText(value: React.ReactNode): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(flattenText);
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return [String(value)];
  }

  return [];
}

describe('surface split widgets', () => {
  it('renders direct imports for metric, plugin summary, and module panel', async () => {
    const [summaryCard] = getPluginSurfaceSummaryCards(
      getPluginIntegrationStats(pluginRegistry),
    );
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamMetricCard label="Total checkout" value="Rp 10.000" />
          <KolamPluginSummaryCard card={summaryCard} />
          <KolamModulePanel title="Katalog" hint="Panel module">
            <Text>Module child</Text>
          </KolamModulePanel>
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Total checkout',
        summaryCard.label,
        'Katalog',
        'Module child',
      ]),
    );
  });
});