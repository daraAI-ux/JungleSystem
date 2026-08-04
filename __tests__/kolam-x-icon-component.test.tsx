import React from 'react';
import {View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import Svg, {Path} from 'react-native-svg';
import {KolamXIcon} from '../src/components/kolam-x-icon';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamXIcon', () => {
  it.each(['sm', 'close', 'md'] as const)(
    'renders the shared %s X icon with the requested color',
    async size => {
      let renderer: ReactTestRenderer.ReactTestRenderer;

      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <KolamXIcon color={V.colors.danger} size={size} />,
        );
      });

      const views = renderer!.root.findAllByType(View);
      const svg = renderer!.root.findByType(Svg);
      const path = renderer!.root.findByType(Path);
      const expectedGlyphSize = size === 'sm' ? 6 : size === 'md' ? 13 : 11;

      expect(views).toHaveLength(1);
      expect(svg.props.viewBox).toBe('0 0 12 12');
      expect(svg.props.height).toBe(expectedGlyphSize);
      expect(svg.props.width).toBe(expectedGlyphSize);
      expect(path.props).toEqual(
        expect.objectContaining({
          d: 'M2 2 L10 10 M10 2 L2 10',
          stroke: V.colors.danger,
          strokeLinecap: 'round',
        }),
      );
    },
  );
});
