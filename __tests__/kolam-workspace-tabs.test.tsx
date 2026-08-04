import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamWorkspaceTabStrip} from '../src/components/kolam-workspace-tab-strip';
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
    renderer!.root.findByProps({accessibilityLabel: 'Tab baru'}).props.onPress();
    renderer!.root.findByProps({accessibilityLabel: 'Tutup Produk'}).props.onPress();

    expect(onCreateTab).toHaveBeenCalledTimes(1);
    expect(onTabClose).toHaveBeenCalledWith('products');
  });
});
