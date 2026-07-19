import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamSummaryCardList} from '../src/components/kolam-summary-card-list';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamSummaryCardList', () => {
  it('renders panel cards with meta and badges', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSummaryCardList
          accessibilityLabel="permission preview"
          items={[
            {
              id: 'role',
              title: 'Role',
              meta: 'role',
              badges: ['view', 'update'],
            },
          ]}
        />,
      );
    });

    expect(
      renderer!.root.findByProps({accessibilityLabel: 'permission preview'}),
    ).toBeTruthy();
    expect(renderer!.root.findAllByType(Text).map(node => node.props.children)).toEqual([
      'Role',
      'role',
      'view',
      'update',
    ]);
  });

  it('renders compact resource cards without badges', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSummaryCardList
          accessibilityLabel="resource summary"
          variant="compact"
          items={[{id: 'settings', title: 'Settings', meta: '3 resources'}]}
        />,
      );
    });

    const cards = renderer!.root
      .findAllByType(View)
      .filter(node => Array.isArray(node.props.style));

    expect(renderer!.root.findAllByType(Text).map(node => node.props.children)).toEqual([
      'Settings',
      '3 resources',
    ]);
    expect(cards[1].props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({backgroundColor: V.colors.bg}),
      ]),
    );
  });
});
