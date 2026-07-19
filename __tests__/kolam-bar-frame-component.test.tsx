import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamCardFrame} from '../src/components/kolam-card-frame';
import {KolamListFrame} from '../src/components/kolam-list-frame';

describe('bar/list/card frame variants', () => {
  it('renders filter bar as a reusable wrapping row', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamListFrame variant="filterBar">
          <Text>Search</Text>
          <Text>Refresh</Text>
        </KolamListFrame>,
      );
    });

    expect(renderer!.root.findByType(View).props.style).toEqual(
      expect.objectContaining({
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
      }),
    );
  });

  it('renders dashboard rail rows from the shared card frame', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamCardFrame variant="dashboardRailRow">
          <Text>Rank</Text>
          <Text>Label</Text>
        </KolamCardFrame>,
      );
    });

    expect(renderer!.root.findByType(View).props.style).toEqual(
      expect.objectContaining({
        flexDirection: 'row',
        alignItems: 'center',
      }),
    );
  });
});