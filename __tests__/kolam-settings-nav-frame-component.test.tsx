import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamInlineFrame} from '../src/components/kolam-inline-frame';
import {KolamRowFrame} from '../src/components/kolam-row-frame';

describe('settings/nav/table frame variants', () => {
  it('renders nav item header from the shared inline frame', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamInlineFrame variant="navItemHeader">
          <Text>Label</Text>
          <Text>Badge</Text>
        </KolamInlineFrame>,
      );
    });

    expect(renderer!.root.findByType(View).props.style).toEqual(
      expect.objectContaining({
        flexDirection: 'row',
        justifyContent: 'space-between',
      }),
    );
  });

  it('renders data table rows from the shared row frame', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamRowFrame variant="dataTable">
          <Text>Cell</Text>
        </KolamRowFrame>,
      );
    });

    expect(StyleSheet.flatten(renderer!.root.findByType(View).props.style)).toEqual(
      expect.objectContaining({
        flexDirection: 'row',
        alignItems: 'center',
      }),
    );
  });
});