import React from 'react';
import Svg, {Path, Rect} from 'react-native-svg';
import ReactTestRenderer from 'react-test-renderer';
import {KolamDashboardCountIcon} from '../src/components/kolam-dashboard-count-icon';
import type {DashboardCountIconKind} from '../src/domain/dashboard-counts';

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

    expect(renderer!.root.findByType(Svg)).toBeTruthy();
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

  it('renders the life stock glyph as the native frog SVG artwork', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamDashboardCountIcon kind="book" />,
      );
    });

    const icon = renderer!.root.findByType(Svg);

    expect(icon.props.height).toBe(46);
    expect(icon.props.width).toBe(46);
    expect(icon.props.viewBox).toBe('0 0 512 512');
    expect(renderer!.root.findAllByType(Path).length).toBeGreaterThanOrEqual(10);
  });

  it('renders the service glyph from the provided native SVG artwork', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamDashboardCountIcon kind="service" />,
      );
    });

    const icon = renderer!.root.findByType(Svg);

    expect(icon.props.height).toBe(46);
    expect(icon.props.width).toBe(46);
    expect(icon.props.viewBox).toBe('220 140 584 690');
    expect(renderer!.root.findAllByType(Path)).toHaveLength(7);
    expect(renderer!.root.findAllByType(Rect)).toHaveLength(1);
  });
});
