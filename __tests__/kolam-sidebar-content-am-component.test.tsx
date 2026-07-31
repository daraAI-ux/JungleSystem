import React from 'react';
import { Text, View } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { KolamSidebarContent } from '../src/components/kolam-sidebar-content';
import { getShellModuleRouteEntry } from '../src/domain/app-shell';

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

describe('KolamSidebarContent AM mode', () => {
  it('keeps AM directly under POS in the JungleSystem primary sidebar', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamSidebarContent
            accessScope={{ am: true, kolam: true, pos: true }}
            activeModule="kolam"
            activeRoute="/"
            collapsed={false}
            expandedSections={{ dashboard: true }}
            filterMenuByAccess={false}
            onModuleRouteSelect={() => undefined}
            onMoveMenuSection={() => undefined}
            onQuickSearch={() => undefined}
            onSelectMenuItem={() => undefined}
            onSelectModule={() => undefined}
            onToggleMenuSection={() => undefined}
            sectionOrder={[]}
          />
        </View>,
      );
    });

    const text = renderText(renderer!);
    const posIndex = text.indexOf('POS');
    const amIndex = text.indexOf('AM');

    expect(posIndex).toBeGreaterThanOrEqual(0);
    expect(amIndex).toBe(posIndex + 1);
    expect(text).not.toContain('38');
  });

  it('replaces the Kolam menu body with a POS-style AM route group in the main sidebar', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamSidebarContent
            accessScope={{ am: true, kolam: true, pos: true }}
            activeModule="am"
            activeRoute="/services"
            collapsed={false}
            expandedSections={{ dashboard: true }}
            filterMenuByAccess={false}
            onModuleRouteSelect={() => undefined}
            onMoveMenuSection={() => undefined}
            onQuickSearch={() => undefined}
            onSelectMenuItem={() => undefined}
            onSelectModule={() => undefined}
            onToggleMenuSection={() => undefined}
            sectionOrder={[]}
          />
        </View>,
      );
    });

    const text = renderText(renderer!);

    expect(text).toEqual(
      expect.arrayContaining([
        'AM',
        'Dashboard',
        'Tasks',
        'Services',
        'Hardware',
        'Webhooks',
        'Transfers',
        'Mutations',
        'Users',
        'Activity Log',
        'Account Settings',
        'JungleSystem',
        'Beranda',
        'Pengaturan',
        'POS',
      ]),
    );
    expect(text).not.toContain('Automation Management');
    expect(text).not.toContain('Overview');
    expect(text).not.toContain('Automation');
    expect(text).not.toContain('Infrastructure');
    expect(text).not.toContain('Banking');
    expect(text).not.toContain('Administration');
    expect(text).not.toContain('Kolam Menu');
    expect(text).not.toContain('Kembali ke Kolam');
  });

  it('uses the AM shell route as the active sidebar route', async () => {
    const activeModuleRoute = getShellModuleRouteEntry('am', 'settings/account');
    let renderer: ReactTestRenderer.ReactTestRenderer;

    if (!activeModuleRoute) {
      throw new Error('AM account settings route is missing.');
    }

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamSidebarContent
            accessScope={{ am: true, kolam: true, pos: true }}
            activeModule="am"
            activeModuleRoute={activeModuleRoute}
            activeRoute="/products"
            collapsed={false}
            expandedSections={{ dashboard: true }}
            filterMenuByAccess={false}
            onModuleRouteSelect={() => undefined}
            onMoveMenuSection={() => undefined}
            onQuickSearch={() => undefined}
            onSelectMenuItem={() => undefined}
            onSelectModule={() => undefined}
            onToggleMenuSection={() => undefined}
            sectionOrder={[]}
          />
        </View>,
      );
    });

    const selectedItems = renderer!.root.findAll(
      node => node.props.accessibilityState?.selected === true,
    );

    expect(
      selectedItems.some(item =>
        flattenNodeText(item).includes('Account Settings'),
      ),
    ).toBe(true);
    expect(
      selectedItems.some(item => flattenNodeText(item).includes('Produk')),
    ).toBe(false);
  });

  it('opens AM routes from the sidebar route group instead of a local page menu', async () => {
    const onModuleRouteSelect = jest.fn();
    const onSelectMenuItem = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamSidebarContent
            accessScope={{ am: true, kolam: true, pos: true }}
            activeModule="am"
            activeRoute="/"
            collapsed={false}
            expandedSections={{ dashboard: true }}
            filterMenuByAccess={false}
            onModuleRouteSelect={onModuleRouteSelect}
            onMoveMenuSection={() => undefined}
            onQuickSearch={() => undefined}
            onSelectMenuItem={onSelectMenuItem}
            onSelectModule={() => undefined}
            onToggleMenuSection={() => undefined}
            sectionOrder={[]}
          />
        </View>,
      );
    });

    const servicesRouteButton = renderer!.root
      .findAll(node => typeof node.props.onPress === 'function')
      .find(node => flattenNodeText(node).includes('Services'));

    expect(servicesRouteButton).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      servicesRouteButton!.props.onPress();
    });

    expect(onModuleRouteSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        moduleId: 'am',
        route: 'services',
      }),
    );
    expect(onSelectMenuItem).not.toHaveBeenCalled();
  });
});

function flattenNodeText(
  node: ReactTestRenderer.ReactTestInstance,
): string[] {
  return node.findAllByType(Text).flatMap(item => flattenText(item.props.children));
}
