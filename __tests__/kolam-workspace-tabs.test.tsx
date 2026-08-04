import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamWorkspaceTabStrip} from '../src/components/kolam-workspace-tab-strip';
import {KolamXIcon} from '../src/components/kolam-x-icon';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';
import {
  getKolamWorkspaceTabLabel,
  getKolamWorkspaceTabRouteKey,
  type KolamWorkspaceTabSnapshot,
} from '../src/domain/kolam-workspace-tabs';
import {useKolamWorkspaceTabsController} from '../src/hooks/use-kolam-workspace-tabs-controller';

type WorkspaceTabsController = ReturnType<
  typeof useKolamWorkspaceTabsController
>;

const productsSnapshot: KolamWorkspaceTabSnapshot = {
  activeModule: 'catalog',
  activeNavigationItem: {
    description: 'Daftar produk yang dijual',
    label: 'Produk',
    requiredAccess: ['kolam', 'pos'],
    route: '/products',
  },
};

const speciesSnapshot: KolamWorkspaceTabSnapshot = {
  activeModule: 'kolam',
  activeNavigationItem: {
    description: 'Kelola data spesies',
    label: 'Spesies',
    requiredAccess: ['kolam', 'pos'],
    route: '/species',
  },
};

function WorkspaceTabsHarness({
  onRender,
  snapshot,
}: {
  onRender: (controller: WorkspaceTabsController) => void;
  snapshot: KolamWorkspaceTabSnapshot;
}) {
  const controller = useKolamWorkspaceTabsController({snapshot});
  onRender(controller);
  return null;
}

function requireController(controller: WorkspaceTabsController | null) {
  if (!controller) {
    throw new Error('Workspace tabs controller did not render.');
  }

  return controller;
}

describe('Kolam workspace tabs', () => {
  it('derives compact labels and route keys from active workspace snapshots', () => {
    expect(getKolamWorkspaceTabLabel(productsSnapshot)).toBe('Produk');
    expect(getKolamWorkspaceTabRouteKey(productsSnapshot)).toBe(
      'catalog:/products',
    );
    expect(getKolamWorkspaceTabLabel({activeModule: 'kolam'})).toBe('Beranda');
  });

  it('keeps each browser-style tab snapshot isolated while navigation changes', async () => {
    let latest: WorkspaceTabsController | null = null;
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <WorkspaceTabsHarness
          snapshot={productsSnapshot}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    const firstTabId = requireController(latest).activeTabId;
    expect(requireController(latest).tabs).toHaveLength(1);
    expect(requireController(latest).tabs[0].label).toBe('Produk');

    await ReactTestRenderer.act(async () => {
      requireController(latest).handleCreateTab();
    });

    const secondTabId = requireController(latest).activeTabId;
    expect(secondTabId).not.toBe(firstTabId);
    expect(requireController(latest).tabs).toHaveLength(2);

    await ReactTestRenderer.act(async () => {
      renderer!.update(
        <WorkspaceTabsHarness
          snapshot={speciesSnapshot}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    expect(
      requireController(latest).tabs.find(tab => tab.id === secondTabId)?.label,
    ).toBe('Spesies');

    let restored: KolamWorkspaceTabSnapshot | null = null;
    await ReactTestRenderer.act(async () => {
      restored = requireController(latest).handleTabSelect(firstTabId);
    });
    expect(restored).toEqual(productsSnapshot);
    let closeRestore: KolamWorkspaceTabSnapshot | null = null;
    await ReactTestRenderer.act(async () => {
      closeRestore = requireController(latest).handleTabClose(firstTabId);
    });
    expect(closeRestore).toEqual(speciesSnapshot);
  });

  it('generates unique tab ids across repeated create actions', async () => {
    let latest: WorkspaceTabsController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <WorkspaceTabsHarness
          snapshot={productsSnapshot}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      requireController(latest).handleCreateTab();
      requireController(latest).handleCreateTab();
      requireController(latest).handleCreateTab();
    });

    const tabIds = requireController(latest).tabs.map(tab => tab.id);
    expect(tabIds).toHaveLength(4);
    expect(new Set(tabIds).size).toBe(tabIds.length);
  });

  it('renders shell tabs with close and add controls', async () => {
    const onCreateTab = jest.fn();
    const onTabClose = jest.fn();
    const onTabSelect = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamWorkspaceTabStrip
          activeTabId="products"
          onCreateTab={onCreateTab}
          onTabClose={onTabClose}
          onTabSelect={onTabSelect}
          tabs={[
            {
              id: 'products',
              label: 'Produk',
              snapshot: productsSnapshot,
            },
            {
              id: 'species',
              label: 'Spesies',
              snapshot: speciesSnapshot,
            },
          ]}
        />,
      );
    });

    const textLabels = renderer!.root
      .findAllByType(Text)
      .map(node => node.props.children);

    expect(textLabels).toEqual(expect.arrayContaining(['Produk', 'Spesies']));
    const closeButton = renderer!.root.findByProps({
      accessibilityLabel: 'Tutup Produk',
    });

    const closeDefaultStyle = closeButton.props.style({
      hovered: false,
      pressed: false,
    });
    const closeHoverStyle = closeButton.props.style({
      hovered: true,
      pressed: false,
    });

    expect(closeDefaultStyle).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: V.colors.mutedFg,
          borderRadius: 7.5,
          height: 15,
          width: 15,
        }),
      ]),
    );
    expect(closeHoverStyle).toEqual(
      expect.arrayContaining([
        expect.objectContaining({backgroundColor: V.colors.mutedFg}),
      ]),
    );
    await ReactTestRenderer.act(async () => {
      closeButton.props.onHoverIn();
    });
    const hoveredCloseButton = renderer!.root.findByProps({
      accessibilityLabel: 'Tutup Produk',
    });
    const hoveredCloseStyle = hoveredCloseButton.props.style({
      hovered: false,
      pressed: false,
    });

    expect(hoveredCloseStyle).toEqual(
      expect.arrayContaining([
        expect.objectContaining({backgroundColor: V.colors.danger}),
      ]),
    );
    await ReactTestRenderer.act(async () => {
      hoveredCloseButton.props.onHoverOut();
    });
    expect(renderer!.root.findAllByType(KolamXIcon)[0].props.color).toBe(
      V.colors.primaryFg,
    );
    expect(renderer!.root.findAllByType(KolamXIcon)[0].props.size).toBe('sm');
    renderer!.root.findByProps({accessibilityLabel: 'Tab baru'}).props.onPress();
    closeButton.props.onPress();

    expect(onCreateTab).toHaveBeenCalledTimes(1);
    expect(onTabClose).toHaveBeenCalledWith('products');
  });
});
