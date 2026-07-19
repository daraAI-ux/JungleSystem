import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { KolamHoverTooltip } from '../src/components/kolam-hover-tooltip';
import { KolamPressable } from '../src/components/kolam-pressable';

describe('KolamHoverTooltip', () => {
  it('shows the tooltip label only while hovered', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamHoverTooltip label="Indonesia">
          <Text>ID</Text>
        </KolamHoverTooltip>,
      );
    });

    expect(
      renderer!.root.findAllByType(Text).map(node => node.props.children),
    ).toEqual(['ID']);

    await ReactTestRenderer.act(async () => {
      renderer!.root.findByType(KolamPressable).props.onHoverIn();
    });

    expect(
      renderer!.root.findAllByType(Text).map(node => node.props.children),
    ).toEqual(['ID', 'Indonesia']);

    await ReactTestRenderer.act(async () => {
      renderer!.root.findByType(KolamPressable).props.onHoverOut();
    });

    expect(
      renderer!.root.findAllByType(Text).map(node => node.props.children),
    ).toEqual(['ID']);
  });
});
