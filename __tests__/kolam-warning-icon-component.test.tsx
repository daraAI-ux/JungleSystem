import React from 'react';
import {View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamWarningIcon} from '../src/components/kolam-warning-icon';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamWarningIcon', () => {
  it.each(['activity', 'rail', 'summary'] as const)(
    'renders the shared %s warning icon with the requested color',
    async variant => {
      let renderer: ReactTestRenderer.ReactTestRenderer;

      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <KolamWarningIcon color={V.colors.warning} variant={variant} />,
        );
      });

      const views = renderer!.root.findAllByType(View);
      const rendered = JSON.stringify(views.map(node => node.props.style));

      expect(views.length).toBeGreaterThanOrEqual(3);
      expect(rendered).toContain(V.colors.warning);
    },
  );
});
