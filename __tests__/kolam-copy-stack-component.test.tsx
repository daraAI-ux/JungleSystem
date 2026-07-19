import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamCopyStack} from '../src/components/kolam-copy-stack';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamCopyStack', () => {
  it('renders ordered text items with an optional container style', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamCopyStack
          containerStyle={{backgroundColor: V.colors.bg}}
          items={[
            {id: 'label', text: 'Runtime', style: {color: V.colors.fg}},
            {
              id: 'meta',
              text: 'Server aktif',
              style: {color: V.colors.mutedFg},
              textProps: {numberOfLines: 1},
            },
          ]}
        />,
      );
    });

    expect(renderer!.root.findByType(View).props.style).toEqual(
      expect.objectContaining({backgroundColor: V.colors.bg}),
    );
    const textNodes = renderer!.root.findAllByType(Text);
    expect(textNodes.map(node => node.props.children)).toEqual([
      'Runtime',
      'Server aktif',
    ]);
    expect(textNodes[1].props.numberOfLines).toBe(1);
  });

  it('can render as a fragment when the caller already owns the container', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamCopyStack items={[{text: 'Inline'}, {text: 3}]} />
        </View>,
      );
    });

    expect(renderer!.root.findAllByType(Text).map(node => node.props.children)).toEqual([
      'Inline',
      3,
    ]);
  });
});
