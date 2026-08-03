import React from 'react';
import { Text, View } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { KolamSidebarContent } from '../src/components/kolam-sidebar-content';
import { getShellModuleRouteEntry } from '../src/domain/app-shell';
import { getAmCurrentUser } from '../src/services/am-api';

jest.mock('../src/services/am-api', () => ({
  getAmCurrentUser: jest.fn(() =>
    Promise.resolve({
      _id: 'super-admin',
      fullName: 'Super Admin',
      username: 'super@dunia-anura.com',
      role: {
        _id: 'role-super',
        name: 'Super Admin',
        permissions: ['user:read'],
        description: 'Full access',
      },
    }),
  ),
}));

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
  beforeEach(() => {
    jest.mocked(getAmCurrentUser).mockResolvedValue({
      _id: 'super-admin',
      fullName: 'Super Admin',
      username: 'super@dunia-anura.com',
      role: {
        _id: 'role-super',
        name: 'Super Admin',
        permissions: ['user:read'],
        description: 'Full access',
      },
    });
  });

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

  it('replaces the Kolam menu body with the AM FE sidebar sections', async () => {
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

    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
    });

    const text = renderText(renderer!);

    expect(text).toEqual(
      expect.arrayContaining([
        'AM',
        'Overview',
        'Dashboard',
        'Automation',
        'Services',
        'Infrastructure',
        'Hardware',
        'Webhooks',
        'Banking',
        'Transfers',
        'Mutations',
        'Administration',
        'Users',
        'Activity Log',
      ]),
    );
    expect(text).not.toContain('Account Settings');
    expect(text).not.toContain('JungleSystem');
    expect(text).not.toContain('Beranda');
    expect(text).not.toContain('Pengaturan');
    expect(text).not.toContain('POS');
    expect(text).not.toContain('Tasks');
    expect(text).not.toContain('Automation Management');
    expect(text).not.toContain('Kolam Menu');
    expect(text).not.toContain('Kembali ke Kolam');
  });

  it('uses the AM shell route as the active sidebar route', async () => {
    const activeModuleRoute = getShellModuleRouteEntry('am', 'hardware');
    let renderer: ReactTestRenderer.ReactTestRenderer;

    if (!activeModuleRoute) {
      throw new Error('AM hardware route is missing.');
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

    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
    });

    const selectedItems = renderer!.root.findAll(
      node => node.props.accessibilityState?.selected === true,
    );

    expect(
      selectedItems.some(item =>
        flattenNodeText(item).includes('Hardware'),
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

    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
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

  it('hides Super Admin-only Activity Log from read-only AM users', async () => {
    jest.mocked(getAmCurrentUser).mockResolvedValue({
      _id: 'read-only',
      fullName: 'Read Only',
      username: 'readonly@dunia-anura.com',
      role: {
        _id: 'role-read',
        name: 'User',
        permissions: ['user:read'],
        description: 'Read-only access',
      },
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamSidebarContent
            accessScope={{ am: true, kolam: true, pos: true }}
            activeModule="am"
            activeRoute="/admin/users"
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

    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
    });

    const text = renderText(renderer!);

    expect(text).toContain('Users');
    expect(text).not.toContain('Activity Log');
  });

  it('keeps AM admin routes closed when the live AM user cannot be read', async () => {
    jest.mocked(getAmCurrentUser).mockRejectedValue(new Error('Unauthorized'));
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

    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
    });

    const text = renderText(renderer!);

    expect(text).toEqual(
      expect.arrayContaining(['Dashboard', 'Services', 'Hardware', 'Webhooks']),
    );
    expect(text).not.toContain('Users');
    expect(text).not.toContain('Activity Log');
  });
});

function flattenNodeText(
  node: ReactTestRenderer.ReactTestInstance,
): string[] {
  return node.findAllByType(Text).flatMap(item => flattenText(item.props.children));
}
