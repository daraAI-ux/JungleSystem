import React from 'react';
import {View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamDashboardRailIcon} from '../src/components/kolam-dashboard-rail-icon';
import type {
  DashboardRailIconKind,
  DashboardRailSection,
} from '../src/domain/dashboard-rail';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

const iconKinds: DashboardRailIconKind[] = [
  'circle-x',
  'triangle-warning',
  'trending',
  'circle-check',
];

const tones: DashboardRailSection['tone'][] = [
  'danger',
  'warning',
  'success',
];

describe('KolamDashboardRailIcon', () => {
  it.each(iconKinds)('renders the %s rail glyph', async kind => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamDashboardRailIcon kind={kind} tone="success" />,
      );
    });

    expect(renderer!.root.findAllByType(View).length).toBeGreaterThan(0);
  });

  it.each(tones)('uses %s tone styling', async tone => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamDashboardRailIcon kind="trending" tone={tone} />,
      );
    });

    const rendered = JSON.stringify(
      renderer!.root.findAllByType(View).map(node => node.props.style),
    );

    expect(rendered).toContain(
      tone === 'danger'
        ? V.colors.danger
        : tone === 'warning'
          ? V.colors.warning
          : V.colors.success,
    );
  });
});
