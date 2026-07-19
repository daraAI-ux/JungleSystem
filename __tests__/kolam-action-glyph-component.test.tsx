import React from 'react';
import {View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamActionGlyph} from '../src/components/kolam-action-glyph';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamActionGlyph', () => {
  it('renders plus glyph with default tint', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<KolamActionGlyph variant="plus" />);
    });

    const parts = renderer!.root
      .findAllByType(View)
      .filter(node => Array.isArray(node.props.style));

    expect(parts).toHaveLength(2);
    expect(parts[0].props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({backgroundColor: V.colors.fg}),
      ]),
    );
  });

  it('renders danger delete glyph with warning tint', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamActionGlyph variant="delete" tone="danger" />,
      );
    });

    const parts = renderer!.root
      .findAllByType(View)
      .filter(node => Array.isArray(node.props.style));

    expect(parts[0].props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({backgroundColor: V.colors.warning}),
      ]),
    );
  });
});
