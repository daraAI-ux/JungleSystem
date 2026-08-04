import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamListFrame} from '../src/components/kolam-list-frame';
import {KolamStatsCardStrip} from '../src/components/kolam-stats-card-strip';
import {statsCardStripStyles} from '../src/components/kolam-stats-card-strip-styles';
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

  it('wraps cards in sized slots inside a wrapping strip frame', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamStatsCardStrip
          cards={[
            {
              id: 'seoScore',
              label: 'Skor SEO',
              value: '72',
              detail: '',
              tone: 'default',
            },
            {
              id: 'approvals',
              label: 'Persetujuan',
              value: '3',
              detail: '',
              tone: 'warning',
            },
            {
              id: 'serp',
              label: 'Snapshot SERP',
              value: '12',
              detail: '',
              tone: 'default',
            },
            {
              id: 'keywords',
              label: 'Keywords',
              value: '40',
              detail: '',
              tone: 'muted',
            },
          ]}
        />,
      );
    });

    const frame = renderer!.root.findByType(KolamListFrame);
    expect(frame.props.variant).toBe('statsCardStrip');
    expect(frame.props.children).toBeTruthy();

    const slots = renderer!.root
      .findAllByType(View)
      .filter(node => node.props.style === statsCardStripStyles.cardSlot);
    expect(slots).toHaveLength(4);
    expect(statsCardStripStyles.cardSlot).toEqual(
      expect.objectContaining({
        flexGrow: 1,
        flexShrink: 1,
        minWidth: 160,
        flexBasis: 160,
      }),
    );
  });
});
