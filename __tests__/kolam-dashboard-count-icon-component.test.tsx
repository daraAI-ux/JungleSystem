import React from 'react';
import {View} from 'react-native';
import Svg, {Path} from 'react-native-svg';
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

    if (kind === 'shopping-bag' || kind === 'package') {
      expect(renderer!.root.findByType(Svg)).toBeTruthy();
    } else {
      expect(renderer!.root.findAllByType(View).length).toBeGreaterThan(1);
    }
  });

  it('renders the products glyph as the native product box SVG artwork', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamDashboardCountIcon kind="shopping-bag" />,
      );
    });

    const icon = renderer!.root.findByType(Svg);

    expect(icon.props.height).toBe(46);
    expect(icon.props.width).toBe(46);
    expect(icon.props.viewBox).toBe('0 0 512 512');
    expect(renderer!.root.findAllByType(Path).length).toBeGreaterThanOrEqual(8);
  });

  it('renders the raw materials glyph as the native material bag SVG artwork', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamDashboardCountIcon kind="package" />,
      );
    });

    const icon = renderer!.root.findByType(Svg);

    expect(icon.props.height).toBe(46);
    expect(icon.props.width).toBe(46);
    expect(icon.props.viewBox).toBe('0 0 512 512');
    expect(renderer!.root.findAllByType(Path).length).toBeGreaterThanOrEqual(8);
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
