import React from 'react';
import {View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamDashboardHeaderActionIcon} from '../src/components/kolam-dashboard-header-action-icon';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamDashboardHeaderActionIcon', () => {
  it.each(['package', 'plus'] as const)('renders the %s glyph', async kind => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamDashboardHeaderActionIcon kind={kind} intent="outline" />,
      );
    });

    expect(renderer!.root.findAllByType(View).length).toBeGreaterThan(1);
  });

  it('uses primary foreground tint for primary action glyphs', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamDashboardHeaderActionIcon kind="plus" intent="primary" />,
      );
    });

    const rendered = JSON.stringify(
      renderer!.root.findAllByType(View).map(node => node.props.style),
    );

    expect(rendered).toContain(V.colors.primaryFg);
  });

  it('uses the positive shared action tint when requested by the header action', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamDashboardHeaderActionIcon
          kind="package"
          intent="outline"
          tone="positive"
        />,
      );
    });

    const rendered = JSON.stringify(
      renderer!.root.findAllByType(View).map(node => node.props.style),
    );

    expect(rendered).toContain(V.colors.success);
  });
});
