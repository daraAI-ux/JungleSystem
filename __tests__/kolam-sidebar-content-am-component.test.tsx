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
    jest.clearAllMocks();
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

  it('hides AM from the JungleSystem primary sidebar without AM access', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamSidebarContent
            accessScope={{ am: false, kolam: true, pos: true }}
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

    expect(text).toContain('POS');
    expect(text).not.toContain('AM');
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
    expect(text).toContain('JungleSystem');
    expect(text).toContain('Beranda');
    expect(text).toContain('Pengaturan');
    expect(text).not.toContain('POS');
    expect(text).not.toContain('Tasks');
    expect(text).not.toContain('Automation Management');
    expect(text).not.toContain('Kolam Menu');
    expect(text).not.toContain('Kembali ke Kolam');
    expect(text).not.toContain('Super Admin');
    expect(text).not.toContain('@super@dunia-anura.com');
    expect(text).not.toContain('Settings');
    expect(text).not.toContain('Log out');
    expect(text).not.toContain('Login');
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

  it('keeps concrete AM detail routes selected in the AM sidebar instead of the Kolam menu', async () => {
    const activeModuleRoute = getShellModuleRouteEntry('am', 'hardware/:rackId/:boxId/:deviceId');
    let renderer: ReactTestRenderer.ReactTestRenderer;

    if (!activeModuleRoute) {
      throw new Error('AM hardware detail route is missing.');
    }

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamSidebarContent
            accessScope={{ am: true, kolam: true, pos: true }}
            activeModule="am"
            activeModuleRoute={{
              ...activeModuleRoute,
              id: 'am:hardware/rack-1/box-1/device-1',
              route: 'hardware/rack-1/box-1/device-1',
            }}
            activeRoute="/products"
            collapsed={false}
            expandedSections={{ dashboard: true, catalog: true }}
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
    const selectedItems = renderer!.root.findAll(
      node => node.props.accessibilityState?.selected === true,
    );

    expect(text).toEqual(
      expect.arrayContaining(['AM', 'Hardware', 'JungleSystem', 'Beranda']),
    );
    expect(text).not.toContain('POS');
    expect(text).not.toContain('Produk');
    expect(text).not.toContain('Species');
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

  it('keeps the JungleSystem back modules in the AM sidebar like POS', async () => {
    const onSelectModule = jest.fn();
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
            onSelectModule={onSelectModule}
            onToggleMenuSection={() => undefined}
            sectionOrder={[]}
          />
        </View>,
      );
    });

    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
    });

    const homeButton = renderer!.root
      .findAll(node => typeof node.props.onPress === 'function')
      .find(node => flattenNodeText(node).includes('Beranda'));

    expect(homeButton).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      homeButton!.props.onPress();
    });

    expect(onSelectModule).toHaveBeenCalledWith('kolam');
  });

  it('keeps AM login and account actions out of the sidebar footer', async () => {
    const onModuleRouteSelect = jest.fn();
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

    expect(
      renderer!.root.findAllByProps({ accessibilityLabel: 'AM Sidebar Settings' }),
    ).toHaveLength(0);
    expect(
      renderer!.root.findAllByProps({ accessibilityLabel: 'AM Sidebar Login' }),
    ).toHaveLength(0);
    expect(
      renderer!.root.findAllByProps({ accessibilityLabel: 'AM Sidebar Logout' }),
    ).toHaveLength(0);
    expect(onModuleRouteSelect).not.toHaveBeenCalled();
  });

  it('refreshes the AM sidebar permissions after the AM route changes', async () => {
    jest
      .mocked(getAmCurrentUser)
      .mockRejectedValueOnce(new Error('Unauthorized'))
      .mockResolvedValueOnce({
        _id: 'logged-in',
        fullName: 'Logged In AM',
        username: 'logged@dunia-anura.com',
        role: {
          _id: 'role-user',
          name: 'User',
          permissions: ['user:read'],
          description: 'User role',
        },
      });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamSidebarContent
            accessScope={{ am: true, kolam: true, pos: true }}
            activeModule="am"
            activeRoute="/login"
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

    expect(renderText(renderer!)).not.toContain('Login');
    expect(renderText(renderer!)).not.toContain('Logged In AM');

    await ReactTestRenderer.act(async () => {
      renderer!.update(
        <View>
          <KolamSidebarContent
            accessScope={{ am: true, kolam: true, pos: true }}
            activeModule="am"
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

    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
    });

    const text = renderText(renderer!);

    expect(getAmCurrentUser).toHaveBeenCalledTimes(2);
    expect(text).not.toContain('Logged In AM');
    expect(text).not.toContain('@logged@dunia-anura.com');
    expect(text).not.toContain('Log out');
    expect(text).not.toContain('Login');
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

  it('keeps Users hidden for Super Admin role without user read permission', async () => {
    jest.mocked(getAmCurrentUser).mockResolvedValue({
      _id: 'super-no-read',
      fullName: 'Super No Read',
      username: 'super-no-read@dunia-anura.com',
      role: {
        _id: 'role-super',
        name: 'Super Admin',
        permissions: [],
        description: 'Role-only access',
      },
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamSidebarContent
            accessScope={{ am: true, kolam: true, pos: true }}
            activeModule="am"
            activeRoute="/admin/activity-log"
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

    expect(text).not.toContain('Users');
    expect(text).toContain('Activity Log');
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
