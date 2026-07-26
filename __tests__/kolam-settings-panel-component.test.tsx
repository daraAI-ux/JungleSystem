import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { KolamSettingsPanel } from '../src/components/kolam-settings-panel';
import {
  useKolamSettingsPanelController,
  type KolamSettingsPanelController,
} from '../src/components/kolam-settings-panel-controller';
import { getSyncActivityEntries } from '../src/domain/sync-activity';
import { seedUnifiedDataset } from '../src/services/unified-data';

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

describe('KolamSettingsPanel', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn();
  });

  it('renders the settings summary from the direct panel module', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSettingsPanel
          activityEntries={getSyncActivityEntries(seedUnifiedDataset, '10:00')}
        />,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Settings',
        'Umum',
        'Konten Web',
        'Plugin',
        'Web Settings form',
      ]),
    );
  });

  it('switches the native Settings tab without changing the pengaturan landing route', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSettingsPanel
          activityEntries={getSyncActivityEntries(seedUnifiedDataset, '10:00')}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      findTabByText(renderer!, 'Peran & Izin').props.onPress();
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['Peran & Izin', 'Role Management']),
    );
    expect(
      findTabByText(renderer!, 'Peran & Izin').props.accessibilityState,
    ).toEqual({ selected: true });
  });

  it('rehomes existing native panels under Settings tabs', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSettingsPanel
          activityEntries={getSyncActivityEntries(seedUnifiedDataset, '10:00')}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      findTabByText(renderer!, 'Plugin').props.onPress();
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['Plugin', 'Plugin Enclosure', 'Plugin DARA']),
    );
    expect(renderText(renderer!)).not.toEqual(
      expect.arrayContaining(['Marketplace Landing Overview']),
    );

    await ReactTestRenderer.act(async () => {
      findTabByText(renderer!, 'Konten Web').props.onPress();
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Konten Web',
        'Marketplace Landing Overview',
        'Marketplace Landing Controls',
      ]),
    );
    expect(renderText(renderer!)).not.toEqual(
      expect.arrayContaining(['Plugin Enclosure']),
    );
  });

  it('keeps the Umum tab focused on production general settings fields', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSettingsPanel
          activityEntries={getSyncActivityEntries(seedUnifiedDataset, '10:00')}
        />,
      );
    });

    const text = renderText(renderer!);

    expect(text).toEqual(
      expect.arrayContaining([
        'Umum',
        'Kolam Version',
        'Marketplace Version',
        'Company Tagline',
        'Phone',
        'Email',
        'Address',
        'Facebook',
        'Staff desktop only',
        'MAC access',
        'Allowed MAC addresses',
        'Logo',
      ]),
    );
    expect(text).not.toEqual(
      expect.arrayContaining([
        'Origin Address',
        'Marketplace maintenance',
        'Staff OTP login',
        'SMTP host',
        'Firebase',
        'DARA business',
        'Notification sound',
        'Plugin Enclosure',
        'Marketplace Landing Overview',
      ]),
    );
  });

  it('renders notification production fields in the Notifikasi tab', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSettingsPanel
          activityEntries={getSyncActivityEntries(seedUnifiedDataset, '10:00')}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      findTabByText(renderer!, 'Notifikasi').props.onPress();
    });

    const text = renderText(renderer!);

    expect(text).toEqual(
      expect.arrayContaining([
        'Notifikasi',
        'DARA handoff notify',
        'Handoff sound',
        'Team chat group call',
        'Group call ringtone',
        'Sales sound',
        'Notification sound',
        'Unassigned sound',
        'Firebase',
        'SMTP host',
        'Staff OTP login',
        'Save',
      ]),
    );
    expect(text).not.toEqual(
      expect.arrayContaining([
        'Company Tagline',
        'MAC access',
        'Plugin Enclosure',
        'Marketplace Landing Overview',
      ]),
    );
  });

  it('keeps local Web Settings draft intact when live update is rejected', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            _id: 'websetting-1',
            companyName: 'Dunia Anura',
            versions: { kolam: '1.0.0' },
          },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          app: 'kolam',
          version: '1.0.0',
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          versions: {
            kolam: '1.0.0',
            enclonura: '1.0.0',
            pos: '1.0.0',
            marketplace: '1.0.0',
          },
        }),
      )
      .mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: jest
          .fn()
          .mockResolvedValue(JSON.stringify({ message: 'Forbidden' })),
      });
    globalThis.fetch = fetchMock;
    let latest: KolamSettingsPanelController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <SettingsControllerHarness
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
    });

    await ReactTestRenderer.act(async () => {
      requireController(latest).setWebSettingDraftField(
        'companyName',
        'Dunia Anura Edited',
      );
    });

    await ReactTestRenderer.act(async () => {
      await requireController(latest).saveWebSetting();
    });

    expect(requireController(latest).webSettingSaveStatus).toBe('error');
    expect(requireController(latest).webSettingMessage).toContain(
      'permission websetting:update',
    );
    expect(requireController(latest).webSettingDraft.companyName).toBe(
      'Dunia Anura Edited',
    );
  });

  it('exposes the native Settings tab registry from controller state', async () => {
    let latest: KolamSettingsPanelController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <SettingsControllerHarness
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    expect(requireController(latest).activeSettingsTabId).toBe('umum');
    expect(requireController(latest).activeSettingsTab).toEqual(
      expect.objectContaining({
        id: 'umum',
        route: '/pengaturan',
        breadcrumbLabel: 'Umum',
      }),
    );
    expect(
      requireController(latest).settingsTabItems.map(item => item.id),
    ).toEqual([
      'umum',
      'notifikasi',
      'toko',
      'operasional',
      'finansial',
      'ai',
      'peran',
      'sitemap',
      'sync',
      'konten',
      'kpi',
      'plugin',
    ]);

    await ReactTestRenderer.act(async () => {
      requireController(latest).selectSettingsTab('finansial');
    });

    expect(requireController(latest).activeSettingsTab).toEqual(
      expect.objectContaining({
        id: 'finansial',
        breadcrumbLabel: 'Pajak',
      }),
    );
    expect(requireController(latest).activeSurfaceId).toBe('web-settings');

    await ReactTestRenderer.act(async () => {
      requireController(latest).selectSettingsTab('peran');
    });

    expect(requireController(latest).activeSurfaceId).toBe('role-management');
    expect(requireController(latest).activeSettingsTab?.route).toBe(
      '/pengaturan',
    );

    await ReactTestRenderer.act(async () => {
      requireController(latest).selectSettingsTab('plugin');
    });

    expect(requireController(latest).activeSurfaceId).toBe('web-settings');

    await ReactTestRenderer.act(async () => {
      requireController(latest).selectSettingsTab('konten');
    });

    expect(requireController(latest).activeSurfaceId).toBe('web-settings');
  });

  it('starts on the matching Settings tab when an existing surface is opened directly', async () => {
    let latest: KolamSettingsPanelController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <SettingsControllerHarness
          initialActiveSurfaceId="role-management"
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    expect(requireController(latest).activeSettingsTabId).toBe('peran');

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <SettingsControllerHarness
          initialActiveSurfaceId="activity-log"
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    expect(requireController(latest).activeSettingsTabId).toBe('sync');
  });
});

function findTabByText(
  renderer: ReactTestRenderer.ReactTestRenderer,
  label: string,
) {
  const tab = renderer.root.findAll(
    node =>
      node.props.accessibilityRole === 'tab' &&
      renderInstanceText(node).includes(label),
  )[0];

  if (!tab) {
    throw new Error(`Settings tab ${label} did not render.`);
  }

  return tab;
}

function renderInstanceText(instance: ReactTestRenderer.ReactTestInstance) {
  return instance
    .findAllByType(Text)
    .flatMap(node => flattenText(node.props.children));
}

function SettingsControllerHarness({
  initialActiveSurfaceId = 'web-settings',
  onRender,
}: {
  initialActiveSurfaceId?: KolamSettingsPanelController['activeSurfaceId'];
  onRender: (controller: KolamSettingsPanelController) => void;
}) {
  const controller = useKolamSettingsPanelController(
    [],
    initialActiveSurfaceId,
  );
  onRender(controller);
  return null;
}

function requireController(controller: KolamSettingsPanelController | null) {
  if (!controller) {
    throw new Error('Settings controller did not render.');
  }

  return controller;
}

function jsonResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    text: jest.fn().mockResolvedValue(JSON.stringify(payload)),
  };
}
