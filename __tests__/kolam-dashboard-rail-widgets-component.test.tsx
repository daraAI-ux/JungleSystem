import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamDashboardRailIconShell} from '../src/components/kolam-dashboard-rail-icon-shell';
import {KolamDashboardRightRail} from '../src/components/kolam-dashboard-rail-widgets';
import {KolamEmptyState} from '../src/components/kolam-empty-state';
import {KolamPressable} from '../src/components/kolam-pressable';
import {
  getDashboardRailSections,
  getDashboardRailVisualContract,
} from '../src/domain/dashboard-rail';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';
import {seedUnifiedDataset} from '../src/services/unified-data';

function renderText(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root
    .findAllByType(Text)
    .flatMap(node => flattenText(node.props.children));
}

function flattenText(value: React.ReactNode): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(flattenText);
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return [String(value)];
  }

  return [];
}

describe('KolamDashboardRightRail', () => {
  it('renders rail sections from the dashboard rail contract', async () => {
    const sections = getDashboardRailSections(seedUnifiedDataset);
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamDashboardRightRail sections={sections} />
        </View>,
      );
    });

    const text = renderText(renderer!);

    expect(text).toEqual(
      expect.arrayContaining([sections[0].title, sections[0].actionLabel]),
    );
    expect(text).not.toContain(sections[2].description);
    expect(renderer!.root.findAllByType(KolamDashboardRailIconShell)).toEqual(
      [],
    );
    const actionText = renderer!.root
      .findAllByType(Text)
      .find(node => flattenText(node.props.children).includes('Lihat semua'));

    expect(actionText?.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({color: V.colors.danger}),
      ]),
    );
    const visual = getDashboardRailVisualContract();
    const railCard = renderer!.root.findAllByType(View).find(node => {
      const style = StyleSheet.flatten(node.props.style);

      return (
        style?.borderRadius === visual.card.radius &&
        style?.minWidth === visual.layout.cardMinWidth
      );
    });

    expect(StyleSheet.flatten(railCard?.props.style)).toEqual(
      expect.objectContaining({
        borderRadius: visual.card.radius,
      }),
    );
  });

  it('renders live dashboard product thumbnails in rail rows', async () => {
    const sections = getDashboardRailSections({
      ...seedUnifiedDataset,
      kolam: {
        ...seedUnifiedDataset.kolam,
        dashboardLatest: {
          outOfStockProducts: [
            {
              _id: 'product-live-empty',
              name: 'Live Empty Stock',
              stock: 0,
              photos: ['api/media/empty.jpg'],
            },
          ],
          lowStockProducts: [],
          topSellingProducts: [],
        },
      },
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamDashboardRightRail sections={sections} />
        </View>,
      );
    });

    const images = renderer!.root.findAllByType(Image);

    expect(images[0].props.source).toEqual({
      uri: 'https://amfibi.dunia-anura.com/media/empty.jpg',
    });
  });

  it('renders the live page rail cap of three products and hides the fourth', async () => {
    const liveProducts = Array.from({length: 6}, (_, index) => ({
      _id: `product-live-empty-${index + 1}`,
      name: `Live Empty Stock ${index + 1}`,
      stock: 0,
      photos: [],
    }));
    const sections = getDashboardRailSections({
      ...seedUnifiedDataset,
      kolam: {
        ...seedUnifiedDataset.kolam,
        dashboardLatest: {
          outOfStockProducts: liveProducts,
          lowStockProducts: [],
          topSellingProducts: [],
        },
      },
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamDashboardRightRail sections={sections} />
        </View>,
      );
    });

    const text = renderText(renderer!);

    expect(text).toEqual(expect.arrayContaining(['Live Empty Stock 3']));
    expect(text).not.toContain('Live Empty Stock 4');
  });

  it('renders live rail trailing values as danger circle, warning badge, and success text', async () => {
    const sections = getDashboardRailSections({
      ...seedUnifiedDataset,
      kolam: {
        ...seedUnifiedDataset.kolam,
        dashboardLatest: {
          outOfStockProducts: [
            {
              _id: 'product-live-empty',
              name: 'Live Empty Stock',
              stock: 0,
              photos: [],
            },
          ],
          lowStockProducts: [
            {
              _id: 'product-live-low',
              name: 'Live Low Stock',
              stock: 2,
              photos: [],
            },
          ],
          topSellingProducts: [
            {
              productId: 'product-live-top',
              name: 'Live Top Product',
              stock: 8,
              totalSold: 11,
              photo: null,
            },
          ],
        },
      },
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamDashboardRightRail sections={sections} />
        </View>,
      );
    });

    const textNodes = renderer!.root.findAllByType(Text);
    const dangerValue = textNodes.find(node =>
      flattenText(node.props.children).includes('0'),
    );
    const warningValue = textNodes.find(node =>
      flattenText(node.props.children).includes('2'),
    );
    const successValue = textNodes.find(node =>
      flattenText(node.props.children).includes('Terjual 11'),
    );
    const rowLabel = textNodes.find(node =>
      flattenText(node.props.children).includes('Live Top Product'),
    );
    const placeholder = textNodes.find(node =>
      flattenText(node.props.children).includes(
        getDashboardRailVisualContract().text.thumbPlaceholderText,
      ),
    );

    expect(StyleSheet.flatten(dangerValue?.props.style)).toEqual(
      expect.objectContaining({
        width: 28,
        height: 28,
        borderRadius: 14,
        color: V.colors.danger,
        backgroundColor: V.colors.dangerSoft,
        fontWeight: '600',
        textAlign: 'center',
      }),
    );
    expect(StyleSheet.flatten(warningValue?.props.style)).toEqual(
      expect.objectContaining({
        color: V.colors.warning,
        backgroundColor: V.colors.warningSoft,
        fontWeight: '500',
      }),
    );
    expect(StyleSheet.flatten(successValue?.props.style)).toEqual(
      expect.objectContaining({
        color: V.colors.fg,
        backgroundColor: 'transparent',
        fontWeight: '500',
      }),
    );
    expect(StyleSheet.flatten(rowLabel?.props.style)).toEqual(
      expect.objectContaining({
        fontSize: 14,
        fontWeight: '400',
      }),
    );
    expect(StyleSheet.flatten(placeholder?.props.style)).toEqual(
      expect.objectContaining({
        fontSize: 10,
      }),
    );
  });

  it('renders live right rail empty states as muted text without an icon', async () => {
    const sections = getDashboardRailSections({
      ...seedUnifiedDataset,
      catalog: [],
      recentSales: [],
      kolam: {
        ...seedUnifiedDataset.kolam,
        dashboardLatest: {
          outOfStockProducts: [],
          lowStockProducts: [],
          topSellingProducts: [],
        },
      },
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamDashboardRightRail sections={sections} />
        </View>,
      );
    });

    const emptyText = renderer!.root
      .findAllByType(Text)
      .find(node => flattenText(node.props.children).includes('Semua produk tersedia'));

    expect(StyleSheet.flatten(emptyText?.props.style)).toEqual(
      expect.objectContaining({
        color: V.colors.mutedFg,
        fontSize: 14,
        fontWeight: '400',
      }),
    );
    expect(
      renderer!.root
        .findAllByType(KolamEmptyState)
        .some(node => node.props.variant === 'dashboardRail'),
    ).toBe(true);
  });

  it('routes live right rail actions and rows through reusable pressable primitives', async () => {
    const sections = getDashboardRailSections(seedUnifiedDataset);
    const sectionWithItems = sections.find(section => section.items.length);
    const onOpenRoute = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    if (!sectionWithItems) {
      throw new Error('Seed dashboard rail did not include row items.');
    }

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamDashboardRightRail
            onOpenRoute={onOpenRoute}
            sections={sections}
          />
        </View>,
      );
    });

    const action = renderer!.root.findAllByType(KolamPressable).find(
      node =>
        node.props.accessibilityLabel ===
        `${sectionWithItems.actionLabel} - ${sectionWithItems.actionRoute}`,
    );
    const row = renderer!.root.findAllByType(KolamPressable).find(
      node =>
        node.props.accessibilityLabel ===
        `${sectionWithItems.items[0].label} - ${sectionWithItems.items[0].route}`,
    );

    if (!action || !row) {
      throw new Error('Right rail route pressables were not rendered.');
    }

    action.props.onPress();
    row.props.onPress();

    expect(onOpenRoute).toHaveBeenNthCalledWith(
      1,
      sectionWithItems.actionRoute,
    );
    expect(onOpenRoute).toHaveBeenNthCalledWith(
      2,
      sectionWithItems.items[0].route,
    );
  });
});
