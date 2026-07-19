import React from 'react';
import {View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamUserMenuIcon} from '../src/components/kolam-user-menu-icon';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';
import type {TopNavUserMenuIconKind} from '../src/domain/top-nav';

const iconKinds: TopNavUserMenuIconKind[] = [
  'dashboard',
  'settings',
  'command',
  'support',
  'logout',
];

describe('KolamUserMenuIcon', () => {
  it.each(iconKinds)('renders the %s glyph', async kind => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<KolamUserMenuIcon kind={kind} />);
    });

    expect(renderer!.root.findAllByType(View).length).toBeGreaterThan(1);
  });

  it('applies danger tint to logout glyph parts', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamUserMenuIcon kind="logout" danger />,
      );
    });

    const rendered = JSON.stringify(
      renderer!.root.findAllByType(View).map(node => node.props.style),
    );

    expect(rendered).toContain(V.colors.danger);
  });
});
