import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamStatusBadge} from '../src/components/kolam-status-badge';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamStatusBadge', () => {
  it('renders a live-style status badge with an optional icon', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamStatusBadge
          label="live-api"
          intent="success"
          icon={<View testID="status-icon" />}
        />,
      );
    });

    const text = renderer!.root.findByType(Text);
    const icon = renderer!.root.findByProps({testID: 'status-icon'});
    const badge = icon.parent;

    expect(text.props.children).toBe('live-api');
    expect(badge?.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          alignSelf: 'flex-start',
          flexDirection: 'row',
          flexShrink: 1,
          gap: 6,
          paddingHorizontal: 6,
          paddingVertical: 3,
        }),
        expect.objectContaining({
          backgroundColor: V.colors.successSoft,
        }),
      ]),
    );
    expect(text.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 12,
          lineHeight: 16,
          fontWeight: '500',
        }),
        expect.objectContaining({
          color: V.colors.success,
        }),
      ]),
    );
  });

  it('keeps muted status badges aligned with secondary live badge intent', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamStatusBadge label="seed" intent="muted" numberOfLines={1} />,
      );
    });

    expect(renderer!.root.findByType(Text).props.numberOfLines).toBe(1);
    expect(renderer!.root.findByType(Text).props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          color: V.colors.mutedFg,
        }),
      ]),
    );
  });
});
