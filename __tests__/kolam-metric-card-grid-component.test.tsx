import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamMetricCardGrid} from '../src/components/kolam-metric-card-grid';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamMetricCardGrid', () => {
  it('renders compact metric cards with labels and values', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamMetricCardGrid
          accessibilityLabel="settings metrics"
          items={[
            {id: 'routes', label: 'Routes', value: 3},
            {id: 'audit', label: 'Source Audit', value: 'Ready'},
          ]}
        />,
      );
    });

    expect(renderer!.root.findByProps({accessibilityLabel: 'settings metrics'})).toBeTruthy();
    expect(renderer!.root.findAllByType(Text).map(node => node.props.children)).toEqual([
      'Routes',
      3,
      'Source Audit',
      'Ready',
    ]);

    const cards = renderer!.root
      .findAllByType(View)
      .filter(node => node.props.style?.backgroundColor === V.colors.bg);

    expect(cards).toHaveLength(2);
  });
});
