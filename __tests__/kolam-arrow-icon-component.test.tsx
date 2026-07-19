import React from 'react';
import {View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamArrowIcon} from '../src/components/kolam-arrow-icon';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamArrowIcon', () => {
  it('renders the shared arrow glyph with muted tint by default', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<KolamArrowIcon />);
    });

    const rendered = JSON.stringify(
      renderer!.root.findAllByType(View).map(node => node.props.style),
    );

    expect(renderer!.root.findAllByType(View)).toHaveLength(4);
    expect(rendered).toContain(V.colors.mutedFg);
  });

  it('supports a custom arrow tint', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamArrowIcon color={V.colors.info} />,
      );
    });

    const rendered = JSON.stringify(
      renderer!.root.findAllByType(View).map(node => node.props.style),
    );

    expect(rendered).toContain(V.colors.info);
  });
});
