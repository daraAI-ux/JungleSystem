import React from 'react';
import {View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamCommandPaletteKindIcon} from '../src/components/kolam-command-palette-kind-icon';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';
import type {CommandKind} from '../src/domain/command-index';

const commandKinds: CommandKind[] = [
  'module',
  'module-route',
  'kolam-surface',
  'navigation-route',
  'am-route',
  'runtime-action',
  'plugin-route',
];

describe('KolamCommandPaletteKindIcon', () => {
  it.each(commandKinds)('renders the %s glyph', async kind => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamCommandPaletteKindIcon kind={kind} />,
      );
    });

    expect(renderer!.root.findAllByType(View).length).toBeGreaterThan(1);
  });

  it('uses the command palette plugin success tint', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamCommandPaletteKindIcon kind="plugin-route" />,
      );
    });

    const rendered = JSON.stringify(
      renderer!.root.findAllByType(View).map(node => node.props.style),
    );

    expect(rendered).toContain(V.colors.success);
  });
});
