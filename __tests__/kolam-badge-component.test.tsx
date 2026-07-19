import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamBadge} from '../src/components/kolam-badge';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamBadge', () => {
  it('renders a live-style text badge with the requested label and intent', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamBadge label="Ready" intent="success" />,
      );
    });

    const badge = renderer!.root.findByType(Text);

    expect(badge.props.children).toBe('Ready');
    expect(badge.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 12,
          lineHeight: 20,
          fontWeight: '500',
        }),
        expect.objectContaining({
          color: V.colors.success,
          backgroundColor: V.colors.successSoft,
        }),
      ]),
    );
  });

  it('supports square badges for non-pill contexts', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamBadge label="Mismatch" intent="warning" shape="square" />,
      );
    });

    expect(renderer!.root.findByType(Text).props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          paddingHorizontal: 6,
          borderRadius: V.radius.sm,
        }),
        expect.objectContaining({
          color: V.colors.warning,
          backgroundColor: V.colors.warningSoft,
        }),
      ]),
    );
  });

  it('supports fixed-width matrix badges without changing the default primitive', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamBadge
          label="yes"
          intent="success"
          align="center"
          horizontalPadding={0}
          weight="900"
          width={58}
        />,
      );
    });

    expect(renderer!.root.findByType(Text).props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({width: 58}),
        expect.objectContaining({textAlign: 'center'}),
        expect.objectContaining({fontWeight: '900'}),
        expect.objectContaining({paddingHorizontal: 0}),
      ]),
    );
  });
});
