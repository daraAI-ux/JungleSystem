import React from 'react';
import {View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamSearchIcon} from '../src/components/kolam-search-icon';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamSearchIcon', () => {
  it.each(['sidebar', 'filter', 'panel'] as const)(
    'renders the shared %s search icon with the requested color',
    async variant => {
      let renderer: ReactTestRenderer.ReactTestRenderer;

      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <KolamSearchIcon color={V.colors.info} variant={variant} />,
        );
      });

      const views = renderer!.root.findAllByType(View);
      const rendered = JSON.stringify(views.map(node => node.props.style));

      expect(views).toHaveLength(3);
      expect(rendered).toContain(V.colors.info);
    },
  );
});
