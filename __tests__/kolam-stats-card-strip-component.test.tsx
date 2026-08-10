import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {getListFrameStyle} from '../src/components/kolam-list-frame-style';
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

  it('fills the wrapper with equal flex tiles (no fixed tile sizes or side padding)', () => {
    const frameStyle = getListFrameStyle('statsCardStrip') as Record<
      string,
      unknown
    >;
    expect(frameStyle).toEqual(
      expect.objectContaining({
        alignSelf: 'stretch',
        flexDirection: 'row',
        width: '100%',
      }),
    );
    expect(frameStyle).not.toEqual(
      expect.objectContaining({paddingHorizontal: expect.anything()}),
    );
    expect(frameStyle.paddingHorizontal).toBeUndefined();

    expect(statsCardStripStyles.card).toEqual(
      expect.objectContaining({
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 0,
        minWidth: 0,
      }),
    );
    expect(
      (statsCardStripStyles as {cardSlot?: unknown}).cardSlot,
    ).toBeUndefined();
  });

  it('renders cards as direct flex children of the strip frame', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamStatsCardStrip
          cards={[
            {
              id: 'seoScore',
              label: 'Skor SEO',
              value: '61',
              detail: '',
              tone: 'default',
            },
            {
              id: 'approvals',
              label: 'Persetujuan',
              value: '126',
              detail: '',
              tone: 'warning',
            },
          ]}
        />,
      );
    });

    expect(renderer!.root.findByType(KolamListFrame).props.variant).toBe(
      'statsCardStrip',
    );
  });
});
