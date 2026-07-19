import React from 'react';
import {View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamXIcon} from '../src/components/kolam-x-icon';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamXIcon', () => {
  it.each(['close', 'md'] as const)(
    'renders the shared %s X icon with the requested color',
    async size => {
      let renderer: ReactTestRenderer.ReactTestRenderer;

      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <KolamXIcon color={V.colors.danger} size={size} />,
        );
      });

      const views = renderer!.root.findAllByType(View);
      const rendered = JSON.stringify(views.map(node => node.props.style));

      expect(views).toHaveLength(3);
      expect(rendered).toContain(V.colors.danger);
    },
  );
});
