import React from 'react';
import {View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamStatusGlyph} from '../src/components/kolam-status-glyph';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamStatusGlyph', () => {
  it.each(['activity', 'clock', 'search', 'seed'] as const)(
    'renders the shared %s glyph with the requested color',
    async kind => {
      let renderer: ReactTestRenderer.ReactTestRenderer;

      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <KolamStatusGlyph color={V.colors.warning} kind={kind} />,
        );
      });

      const rendered = JSON.stringify(
        renderer!.root.findAllByType(View).map(node => node.props.style),
      );

      expect(rendered).toContain(V.colors.warning);
    },
  );
});
