import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamAvatarPillList} from '../src/components/kolam-avatar-pill-list';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamAvatarPillList', () => {
  it('renders avatar pills with initials and names', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAvatarPillList
          accessibilityLabel="role members"
          items={[
            {id: 'a', initials: 'AR', name: 'Ari'},
            {id: 'b', initials: 'SN', name: 'Sena'},
          ]}
        />,
      );
    });

    expect(renderer!.root.findByProps({accessibilityLabel: 'role members'})).toBeTruthy();
    expect(renderer!.root.findAllByType(Text).map(node => node.props.children)).toEqual([
      'AR',
      'Ari',
      'SN',
      'Sena',
    ]);
    expect(renderer!.root.findAllByType(View)[1].props.style).toEqual(
      expect.objectContaining({backgroundColor: V.colors.muted}),
    );
  });

  it('renders an empty label when no items are available', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamAvatarPillList items={[]} emptyLabel="No members yet" />,
      );
    });

    expect(renderer!.root.findByType(Text).props.children).toBe('No members yet');
  });
});
