import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { KolamHoverTooltip } from '../src/components/kolam-hover-tooltip';
import { KolamPressable } from '../src/components/kolam-pressable';

describe('KolamHoverTooltip', () => {
  it('shows the tooltip label only while hovered', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    const onOpenChange = jest.fn();

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamHoverTooltip label="Indonesia" onOpenChange={onOpenChange}>
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
    expect(onOpenChange).toHaveBeenCalledWith(true);

    await ReactTestRenderer.act(async () => {
      renderer!.root.findByType(KolamPressable).props.onHoverOut();
    });

    expect(
      renderer!.root.findAllByType(Text).map(node => node.props.children),
    ).toEqual(['ID']);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('supports pointer enter/leave as a Windows hover fallback', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamHoverTooltip label="Amidis" placement="bottom">
          <Text>Logo</Text>
        </KolamHoverTooltip>,
      );
    });

    await ReactTestRenderer.act(async () => {
      renderer!.root.findByType(KolamPressable).props.onPointerEnter?.();
    });

    expect(
      renderer!.root.findAllByType(Text).map(node => node.props.children),
    ).toEqual(['Logo', 'Amidis']);

    await ReactTestRenderer.act(async () => {
      renderer!.root.findByType(KolamPressable).props.onPointerLeave?.();
    });

    expect(
      renderer!.root.findAllByType(Text).map(node => node.props.children),
    ).toEqual(['Logo']);
  });
});
