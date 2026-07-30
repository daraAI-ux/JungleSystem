import React from 'react';
import {View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamChevronIcon} from '../src/components/kolam-chevron-icon';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

const PATH_BY_DIRECTION = {
  down: 'M1 3 L5 8 L9 3 Z',
  up: 'M1 7 L5 2 L9 7 Z',
  right: 'M3 1 L8 5 L3 9 Z',
  left: 'M7 1 L2 5 L7 9 Z',
} as const;

describe('KolamChevronIcon', () => {
  it.each(['right', 'down', 'up', 'left'] as const)(
    'renders a solid %s triangle path',
    async direction => {
      let renderer: ReactTestRenderer.ReactTestRenderer;

      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <KolamChevronIcon color={V.colors.danger} direction={direction} />,
        );
      });

      const tree = JSON.stringify(renderer!.toJSON());
      expect(tree).toContain(PATH_BY_DIRECTION[direction]);
      expect(renderer!.root.findAllByType(View).length).toBeGreaterThanOrEqual(1);
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

    expect(renderer!.root.findAllByType(View).length).toBeGreaterThanOrEqual(2);
  });
});
