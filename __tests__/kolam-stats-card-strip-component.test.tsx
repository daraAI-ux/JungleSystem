import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamStatsCardStrip} from '../src/components/kolam-stats-card-strip';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamStatsCardStrip', () => {
  it('renders reusable stats cards with tone-aware values', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamStatsCardStrip
          cards={[
            {
              id: 'success',
              label: 'Success',
              value: '98%',
              detail: 'HTTP 2xx',
              tone: 'success',
            },
            {
              id: 'attention',
              label: 'Attention',
              value: '3',
              detail: 'Needs review',
              tone: 'warning',
            },
          ]}
        />,
      );
    });

    expect(renderer!.root.findAllByType(Text).map(node => node.props.children)).toEqual([
      'Success',
      '98%',
      'HTTP 2xx',
      'Attention',
      '3',
      'Needs review',
    ]);
    expect(renderer!.root.findByProps({children: '98%'}).props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({color: V.colors.success})]),
    );
    expect(renderer!.root.findByProps({children: '3'}).props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({color: V.colors.warning})]),
    );
  });
});
