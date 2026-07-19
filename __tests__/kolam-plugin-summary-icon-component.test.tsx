import React from 'react';
import {View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamPluginSummaryIcon} from '../src/components/kolam-plugin-summary-icon';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';
import type {PluginSurfaceSummaryCard} from '../src/domain/plugin-surface';

const iconKinds: PluginSurfaceSummaryCard['iconKind'][] = [
  'plugin',
  'check',
  'warning',
  'route',
];

describe('KolamPluginSummaryIcon', () => {
  it.each(iconKinds)('renders the %s summary glyph', async kind => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamPluginSummaryIcon kind={kind} tone="default" />,
      );
    });

    expect(renderer!.root.findAllByType(View).length).toBeGreaterThan(1);
  });

  it('uses info tint for route summary glyphs', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamPluginSummaryIcon kind="route" tone="info" />,
      );
    });

    const rendered = JSON.stringify(
      renderer!.root.findAllByType(View).map(node => node.props.style),
    );

    expect(rendered).toContain(V.colors.info);
  });
});
