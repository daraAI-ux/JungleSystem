import React from 'react';
import {View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamChevronIcon} from '../src/components/kolam-chevron-icon';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamChevronIcon', () => {
  it.each(['right', 'down', 'up'] as const)(
    'renders a shared %s chevron with the requested color',
    async direction => {
      let renderer: ReactTestRenderer.ReactTestRenderer;

      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <KolamChevronIcon color={V.colors.danger} direction={direction} />,
        );
      });

      const views = renderer!.root.findAllByType(View);
      const rendered = JSON.stringify(views.map(node => node.props.style));

      expect(views).toHaveLength(3);
      expect(rendered).toContain(V.colors.danger);
    },
  );

  it('keeps compact menu and user variants available for dense controls', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <>
          <KolamChevronIcon size="menu-sm" />
          <KolamChevronIcon size="user" />
        </>,
      );
    });

    expect(renderer!.root.findAllByType(View)).toHaveLength(6);
  });
});
