import React from 'react';
import {View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamDashboardCountIcon} from '../src/components/kolam-dashboard-count-icon';
import type {DashboardCountIconKind} from '../src/domain/dashboard-counts';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

const iconKinds: DashboardCountIconKind[] = [
  'shopping-bag',
  'package',
  'book',
  'service',
];

describe('KolamDashboardCountIcon', () => {
  it.each(iconKinds)('renders the %s count glyph', async kind => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamDashboardCountIcon kind={kind} />,
      );
    });

    expect(renderer!.root.findAllByType(View).length).toBeGreaterThan(1);
  });

  it('uses the dashboard count success tint', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamDashboardCountIcon kind="service" />,
      );
    });

    const rendered = JSON.stringify(
      renderer!.root.findAllByType(View).map(node => node.props.style),
    );

    expect(rendered).toContain(V.colors.success);
  });
});
