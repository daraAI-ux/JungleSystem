import React from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { KolamMediaPlayer } from '../src/components/kolam-media-player';
import { KolamSettingsPanel } from '../src/components/kolam-settings-panel';
import {
  useKolamSettingsPanelController,
  type KolamSettingsPanelController,
} from '../src/components/kolam-settings-panel-controller';
import { getCurrentUser } from '../src/services/auth-api';
import { getSyncActivityEntries } from '../src/domain/sync-activity';
import { seedUnifiedDataset } from '../src/services/unified-data';

jest.mock('react-native-webview', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    __esModule: true,
    default: (props: Record<string, unknown>) =>
      React.createElement(View, props),
  };
});

jest.mock('../src/services/auth-api', () => {
  const actual = jest.requireActual('../src/services/auth-api');

  return {
    ...actual,
    getCurrentUser: jest.fn(),
  };
});

const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<
  typeof getCurrentUser
>;

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
    mockedGetCurrentUser.mockResolvedValue({
      roleKey: 'super-admin',
      permissions: [],
    });
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
        'Pengaturan',
        'Umum',
        'Konten Web',
        'Plugin',
        'Form Pengaturan Web',
      ]),
    );
    expect(renderText(renderer!)).not.toEqual(
      expect.arrayContaining([
        'Pengaturan Web',
        'Pembaruan Pengaturan Web',
        '/websetting',
        'Storefront display',
        'Runtime API config',
        'Native summary untuk Web Settings, Role Management, dan Activity Log Kolam.',
        'Routes',
        'Native Summary',
        'Source Audit',
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
      expect.arrayContaining(['Ringkasan Landing Marketplace']),
    );

    await ReactTestRenderer.act(async () => {
      findTabByText(renderer!, 'Konten Web').props.onPress();
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Konten Web',
        'Ringkasan Landing Marketplace',
        'Kontrol Landing Marketplace',
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
        'Versi Kolam',
        'Versi Marketplace',
        'Nama Perusahaan',
        'Tagline Perusahaan',
        'Telepon',
        'Email',
        'Alamat',
        'Facebook',
        'Khusus desktop staff',
        'Akses MAC',
        'Daftar MAC diizinkan',
        'Logo',
      ]),
    );
    expect(text.indexOf('Versi Kolam')).toBeLessThan(
      text.indexOf('Versi Enclonura'),
    );
    expect(text.indexOf('Versi Enclonura')).toBeLessThan(
      text.indexOf('Versi POS'),
    );
    expect(text.indexOf('Versi POS')).toBeLessThan(
      text.indexOf('Versi Marketplace'),
    );
    expect(text.indexOf('Versi Marketplace')).toBeLessThan(
      text.indexOf('Logo'),
    );
    expect(text.indexOf('Logo')).toBeLessThan(text.indexOf('Nama Perusahaan'));
    expect(text.indexOf('Nama Perusahaan')).toBeLessThan(
      text.indexOf('Tagline Perusahaan'),
    );
    expect(text.indexOf('Tagline Perusahaan')).toBeLessThan(
      text.indexOf('Telepon'),
    );
    expect(text.indexOf('Alamat')).toBeLessThan(text.indexOf('Facebook'));
    expect(text.indexOf('TikTok')).toBeLessThan(
      text.indexOf('Khusus desktop staff'),
    );
    expect(text.indexOf('URL redirect staff')).toBeLessThan(
      text.indexOf('Akses MAC'),
    );
    expect(text).not.toEqual(
      expect.arrayContaining([
        'Alamat asal',
        'Maintenance marketplace',
        'OTP masuk staf',
        'Server SMTP',
        'Firebase',
        'DARA business',
        'Suara notifikasi',
        'Plugin Enclosure',
        'Ringkasan Landing Marketplace',
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
        'Notifikasi alih tangan DARA',
        'Suara alih tangan',
        'Panggilan grup chat tim',
        'Nada panggilan grup',
        'Suara notifikasi penjualan',
        'Suara notifikasi',
        'Suara chat belum ditugaskan',
        'Firebase',
        'Server SMTP',
        'OTP masuk staf',
        'Tes suara',
        'Simpan',
      ]),
    );
    expect(text.indexOf('Suara notifikasi')).toBeLessThan(
      text.indexOf('Suara chat belum ditugaskan'),
    );
    expect(text.indexOf('Suara chat belum ditugaskan')).toBeLessThan(
      text.indexOf('Notifikasi alih tangan DARA'),
    );
    expect(text.indexOf('Notifikasi alih tangan DARA')).toBeLessThan(
      text.indexOf('Suara alih tangan'),
    );
    expect(text.indexOf('Suara alih tangan')).toBeLessThan(
      text.indexOf('Panggilan grup chat tim'),
    );
    expect(text.indexOf('Panggilan grup chat tim')).toBeLessThan(
      text.indexOf('Nada panggilan grup'),
    );
    expect(text.indexOf('Suara notifikasi penjualan')).toBeLessThan(
      text.indexOf('Firebase'),
    );
    expect(text.indexOf('Firebase')).toBeLessThan(text.indexOf('Server SMTP'));
    expect(text.indexOf('Server SMTP')).toBeLessThan(
      text.indexOf('OTP masuk staf'),
    );

    const smtpHostInput = renderer!.root
      .findAllByType(TextInput)
      .find(node => node.props.placeholder === 'smtp.gmail.com');
    const otpInput = renderer!.root
      .findAllByType(TextInput)
      .find(node => node.props.placeholder === '10');
    expect(StyleSheet.flatten(smtpHostInput?.props.style).width).toBe(460);
    expect(StyleSheet.flatten(otpInput?.props.style).width).toBe(460);

    await ReactTestRenderer.act(async () => {
      renderer!.root.findAllByProps({ label: 'Tes suara' })[0].props.onPress();
    });

    const previewPlayer = renderer!.root.findByType(KolamMediaPlayer);
    expect(previewPlayer.props).toEqual(
      expect.objectContaining({
        autoPlay: true,
        kind: 'audio',
        title: 'Suara notifikasi',
      }),
    );
    expect(previewPlayer.props.uri).toMatch(/^data:audio\/wav;base64,/);
    expect(text).not.toEqual(
      expect.arrayContaining([
        'Tagline Perusahaan',
        'Akses MAC',
        'Plugin Enclosure',
        'Ringkasan Landing Marketplace',
      ]),
    );
  });

  it('renders store and shipping production fields in the Pengiriman tab', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSettingsPanel
          activityEntries={getSyncActivityEntries(seedUnifiedDataset, '10:00')}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      findTabByText(renderer!, 'Pengiriman').props.onPress();
    });

    const text = renderText(renderer!);

    expect(text).toEqual(
      expect.arrayContaining([
        'Pengiriman',
        'Asal pengiriman (Biteship)',
        'Biteship API key',
        'Alamat',
        'Kota',
        'Provinsi',
        'Kode pos',
        'Latitude',
        'Longitude',
        'Google Maps API key (browser)',
        'Pinpoint peta',
        'Map native planned: gunakan latitude/longitude sebagai fallback koordinat produksi.',
        'Jam operasional toko (dunia-anura.com)',
        'Aktifkan jadwal operasional',
        'Zona waktu',
        'Hari',
        'Buka',
        'Senin',
        'Jam buka',
        'Jam tutup',
        'Libur khusus (tanggal)',
        'Tanggal libur khusus',
        'Keterangan libur',
        'Tambah',
        'Belum ada libur khusus.',
        'Pesan untuk pembeli / DARA',
        'Sebelum buka',
        'Setelah tutup',
        'Libur rutin mingguan',
        'Libur khusus ({label})',
        'Peringatan pengiriman (konteks AI)',
        'Simpan',
      ]),
    );
    expect(text.indexOf('Biteship API key')).toBeLessThan(
      text.indexOf('Alamat'),
    );
    expect(text.indexOf('Longitude')).toBeLessThan(
      text.indexOf('Google Maps API key (browser)'),
    );
    expect(text.indexOf('Pinpoint peta')).toBeLessThan(
      text.indexOf('Jam operasional toko (dunia-anura.com)'),
    );
    expect(text.indexOf('Libur khusus (tanggal)')).toBeLessThan(
      text.indexOf('Pesan untuk pembeli / DARA'),
    );

    const dateInput = renderer!.root
      .findAllByType(TextInput)
      .find(node => node.props.placeholder === '2026-04-10');
    const labelInput = renderer!.root
      .findAllByType(TextInput)
      .find(node => node.props.placeholder === 'Libur Idul Fitri');

    await ReactTestRenderer.act(async () => {
      dateInput?.props.onChangeText('2026-04-10');
      labelInput?.props.onChangeText('Libur Idul Fitri');
    });
    await ReactTestRenderer.act(async () => {
      renderer!.root.findByProps({ label: 'Tambah' }).props.onPress();
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['2026-04-10', 'Libur Idul Fitri', 'Hapus']),
    );
    expect(text).not.toEqual(
      expect.arrayContaining([
        'Tagline Perusahaan',
        'OTP masuk staf',
        'Plugin Enclosure',
        'Ringkasan Landing Marketplace',
        'Google Maps browser key',
        'Alamat asal',
        'Balasan DARA saat tutup',
      ]),
    );
  });

  it('renders operational production fields in the Operasional tab', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSettingsPanel
          activityEntries={getSyncActivityEntries(seedUnifiedDataset, '10:00')}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      findTabByText(renderer!, 'Operasional').props.onPress();
    });

    const text = renderText(renderer!);

    expect(text).toEqual(
      expect.arrayContaining([
        'Operasional',
        'Mode pemeliharaan',
        'POS',
        'Marketplace',
        'Google Sign-In (Webstore)',
        'Absensi karyawan',
        'Purchase Order - penerimaan barang',
        'Livechat',
      ]),
    );
    expect(text.indexOf('Mode pemeliharaan')).toBeLessThan(
      text.indexOf('Google Sign-In (Webstore)'),
    );
    expect(text.indexOf('Google Sign-In (Webstore)')).toBeLessThan(
      text.indexOf('Absensi karyawan'),
    );
    expect(text.indexOf('Absensi karyawan')).toBeLessThan(
      text.indexOf('Purchase Order - penerimaan barang'),
    );
    expect(text.indexOf('Purchase Order - penerimaan barang')).toBeLessThan(
      text.indexOf('Livechat'),
    );
    expect(text).not.toEqual(
      expect.arrayContaining([
        'Tagline Perusahaan',
        'Biteship API key',
        'OTP masuk staf',
        'Plugin Enclosure',
        'Ringkasan Landing Marketplace',
      ]),
    );
  });

  it('renders financial and tax settings as a read-only summary', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSettingsPanel
          activityEntries={getSyncActivityEntries(seedUnifiedDataset, '10:00')}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      findTabByText(renderer!, 'Finansial').props.onPress();
    });

    const text = renderText(renderer!);

    expect(text).toEqual(
      expect.arrayContaining([
        'Finansial',
        'Ringkasan Finansial / Pajak',
        'Metode pembayaran',
        'Metode nonaktif',
        'Harga jual include PPN',
        'PPh 21 komisi',
        'Overtime calculation',
        'Overtime policy',
        'Enclosure sale commission',
        'Ringkasan live read-only. Editor update ditunda sampai kontrak endpoint/body final.',
      ]),
    );
    expect(text).not.toEqual(
      expect.arrayContaining([
        'Google Sign-In webstore',
        'Biteship API key',
        'Plugin Enclosure',
        'Ringkasan Landing Marketplace',
      ]),
    );
  });

  it('renders AI settings with plugin gate aware controls', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSettingsPanel
          activityEntries={getSyncActivityEntries(seedUnifiedDataset, '10:00')}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      findTabByText(renderer!, 'AI / DARA').props.onPress();
    });

    const text = renderText(renderer!);

    expect(text).toEqual(
      expect.arrayContaining([
        'AI / DARA',
        'Plugin Chat dan DARA aktif. Kontrol AI siap disimpan ke Pengaturan Web.',
        'Chat storefront',
        'Balasan DARA Team Chat',
        'Bisnis DARA',
        'Tools DARA',
        'Knowledge / SOP DARA',
        'Notifikasi alih tangan DARA',
        'Laporan otomatis DARA',
        'Fulfillment DARA',
        'Simpan',
      ]),
    );
    expect(text).not.toEqual(
      expect.arrayContaining([
        'Tagline Perusahaan',
        'Biteship API key',
        'Ringkasan Landing Marketplace',
      ]),
    );
  });

  it('keeps AI controls visible with disabled state when plugins are off', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            _id: 'websetting-1',
            kolamPlugins: {
              chat: { enabled: false, storeEnabled: false },
              dara: { enabled: false },
            },
          },
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ app: 'kolam', version: '1.0.0' }))
      .mockResolvedValueOnce(jsonResponse({ versions: { kolam: '1.0.0' } }))
      .mockResolvedValueOnce(jsonResponse({ data: [] }))
      .mockResolvedValueOnce(jsonResponse({ data: [] }))
      .mockResolvedValueOnce(jsonResponse({ data: null }))
      .mockResolvedValueOnce(jsonResponse({ data: null }))
      .mockResolvedValueOnce(jsonResponse({ data: [] }))
      .mockResolvedValueOnce(jsonResponse({ data: [] }))
      .mockResolvedValueOnce(
        jsonResponse({ data: { marketplaceContent: {} } }),
      );
    globalThis.fetch = fetchMock;

    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSettingsPanel
          activityEntries={getSyncActivityEntries(seedUnifiedDataset, '10:00')}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
    });

    await ReactTestRenderer.act(async () => {
      findTabByText(renderer!, 'AI / DARA').props.onPress();
    });

    const text = renderText(renderer!);

    expect(text).toEqual(
      expect.arrayContaining([
        'AI / DARA',
        'State nonaktif: Plugin Chat nonaktif. Plugin DARA nonaktif. Aktifkan dari tab Plugin untuk mengubah kontrol terkait.',
        'Chat storefront',
        'Knowledge / SOP DARA',
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
      .mockResolvedValueOnce(jsonResponse({ data: [] }))
      .mockResolvedValueOnce(jsonResponse({ data: [] }))
      .mockResolvedValueOnce(jsonResponse({ data: null }))
      .mockResolvedValueOnce(jsonResponse({ data: null }))
      .mockResolvedValueOnce(jsonResponse({ data: [] }))
      .mockResolvedValueOnce(jsonResponse({ data: [] }))
      .mockResolvedValueOnce(jsonResponse({ data: { marketplaceContent: {} } }))
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
        breadcrumbLabel: 'Finansial',
      }),
    );
    expect(requireController(latest).activeSurfaceId).toBe('web-settings');

    await ReactTestRenderer.act(async () => {
      requireController(latest).selectSettingsTab('toko');
    });

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

    await ReactTestRenderer.act(async () => {
      requireController(latest).selectSettingsTab('sitemap');
    });

    expect(requireController(latest).activeSurfaceId).toBe('web-settings');

    await ReactTestRenderer.act(async () => {
      requireController(latest).selectSettingsTab('sync');
    });

    expect(requireController(latest).activeSurfaceId).toBe('web-settings');

    await ReactTestRenderer.act(async () => {
      requireController(latest).selectSettingsTab('kpi');
    });

    expect(requireController(latest).activeSurfaceId).toBe('web-settings');
  });

  it('hides Settings tabs that are not visible for the current user permissions', async () => {
    mockedGetCurrentUser.mockResolvedValueOnce({
      roleKey: 'staff',
      permissions: [{ resource: 'websetting', actions: ['view'] }],
    });
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

    expect(
      requireController(latest).settingsTabItems.map(item => item.id),
    ).toEqual([
      'umum',
      'notifikasi',
      'toko',
      'operasional',
      'sitemap',
      'sync',
      'konten',
    ]);

    await ReactTestRenderer.act(async () => {
      requireController(latest).selectSettingsTab('plugin');
    });

    expect(requireController(latest).activeSettingsTabId).toBe('umum');
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

    expect(requireController(latest).activeSettingsTabId).toBe('umum');
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
