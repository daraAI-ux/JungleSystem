import React from 'react';
import { Text, TextInput, View } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { KolamActionControlButton } from '../src/components/kolam-action-control-button';
import { KolamDropdownSelect } from '../src/components/kolam-dropdown-select';
import { KolamSettingsWebConfigSurface } from '../src/components/kolam-settings-panel-surfaces';
import { KolamRemoteImage } from '../src/components/kolam-remote-image';
import { KolamSettingsWebFileField } from '../src/components/kolam-settings-web-file-field';
import { KolamSettingsWebFormSections } from '../src/components/kolam-settings-web-widgets';
import { KolamTextFieldRow } from '../src/components/kolam-text-field-row';
import * as KolamApi from '../src/services/kolam-api';
import { KolamToggleRow } from '../src/components/kolam-toggle-row';
import {
  getSettingsWebConfigFields,
  getSettingsWebFormSections,
} from '../src/domain/settings-surface';

jest.mock('react-native-webview', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    __esModule: true,
    default: (props: Record<string, unknown>) =>
      React.createElement(View, props),
  };
});

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

describe('settings web widgets', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders web form sections directly', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamSettingsWebFormSections
            sections={getSettingsWebFormSections()}
          />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['Form Pengaturan Web', 'Simpan']),
    );
  });

  it('renders the websetting logo preview with an upload action', async () => {
    const onUpload = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSettingsWebFileField
          value="media/logo.png"
          onUpload={onUpload}
        />,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['Unggah logo']),
    );
    expect(renderer!.root.findByType(KolamRemoteImage).props).toEqual(
      expect.objectContaining({
        accessibilityLabel: 'Logo WebSetting',
        scope: 'websetting-logo',
      }),
    );

    await ReactTestRenderer.act(async () => {
      renderer!.root.findByProps({ label: 'Unggah logo' }).props.onPress();
    });

    expect(onUpload).toHaveBeenCalledTimes(1);
  });

  it('renders marketplace landing overview in Web Settings', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSettingsWebConfigSurface
          activeTabId="konten"
          draft={createWebSettingDraft()}
          fields={getSettingsWebConfigFields()}
          maintenanceMode={false}
          marketplaceLandingCtaDraft={{
            title: 'Jelajahi Dunia Species',
            description: 'Temukan koleksi',
            buttonText: 'View',
            buttonLink: '/species',
            isActive: true,
          }}
          marketplaceLandingYoutubeDraft={{
            link: 'https://youtube.com/@DuniaAnura',
            title: 'Dunia Anura',
            subtitle: 'YouTube',
            isActive: true,
          }}
          marketplaceLandingNoticeDraft={{
            key: '',
            title: '',
            message: '',
            ctaUrl: '',
            ctaLabel: '',
            showOnHome: true,
            showOnDashboard: true,
            isActive: true,
          }}
          marketplaceLandingSaveStatus="idle"
          marketplaceLandingMessage=""
          marketplaceLandingAssetStatus={{}}
          marketplaceLandingTabId="hero"
          marketplaceLandingTabItems={[
            { id: 'hero', label: 'Hero Slides', value: '1' },
            { id: 'featured', label: 'Featured Collections', value: '1' },
            { id: 'category', label: 'Category Banners', value: '0' },
            { id: 'cta', label: 'CTA Section', value: 'On' },
            { id: 'youtube', label: 'YouTube Section', value: 'On' },
            { id: 'announcement', label: 'Announcement Banner', value: '0' },
            { id: 'notices', label: 'Customer Notices', value: '0' },
          ]}
          webContentLauncherItems={[
            {
              id: 'marketplace',
              label: 'Landing Marketplace',
              value: 'Live',
              detail: '1 hero',
            },
            {
              id: 'blog',
              label: 'Blog',
              value: '0',
              detail: 'No blog',
            },
            {
              id: 'blog-topics',
              label: 'Blog Topics',
              value: '0',
              detail: 'No topic',
            },
          ]}
          webContentMessage=""
          webContentPanelId="marketplace"
          webContentStatus="live"
          blogRows={[]}
          blogTopicRows={[]}
          kpiMessage=""
          kpiPreview={null}
          kpiSettingsDraft={createKpiSettingsDraft()}
          kpiStatus="idle"
          kpiSummaryRows={[]}
          financialSummaryRows={[]}
          operationalRooms={[]}
          operationalStaffRows={[]}
          regionLevel="province"
          regionParentCode=""
          regionRows={[]}
          regionSearch=""
          regionSyncMessage=""
          regionSyncStatus="idle"
          regionSyncSummaryRows={[]}
          marketplaceLandingOverview={{
            status: 'live',
            message: '',
            heroSlides: [
              {
                _id: 'hero-1',
                title: 'Dunia Anura',
                subtitle: '',
                description: '',
                image: 'media/hero.jpg',
                link: '/',
                linkText: 'Shop Now',
                order: 0,
                isActive: true,
              },
            ],
            categoryBanners: [],
            ctaSection: {
              title: 'Jelajahi Dunia Species',
              description: '',
              buttonText: 'View',
              buttonLink: '/species',
              isActive: true,
            },
            youtubeSection: {
              link: 'https://youtube.com/@DuniaAnura',
              title: 'Dunia Anura',
              subtitle: 'YouTube',
              isActive: true,
            },
            announcementBanners: [],
            customerNotices: [],
            marketplaceContent: {
              featuredCollections: [
                {
                  title: 'Amphibians',
                  image: '',
                  order: 0,
                  isActive: true,
                },
              ],
              bioactiveEcosystem: {
                steps: [{ key: 'setup', image: '', order: 0, isActive: true }],
              },
            },
          }}
          notificationSoundStatus={{}}
          onClearMarketplaceLandingNoticeDraft={jest.fn()}
          onDeleteMarketplaceAnnouncementBanner={jest.fn()}
          onDeleteMarketplaceBioactiveStep={jest.fn()}
          onDeleteMarketplaceCategoryBanner={jest.fn()}
          onDeleteMarketplaceFeaturedCollection={jest.fn()}
          onDeleteMarketplaceHeroSlide={jest.fn()}
          onDeleteMarketplaceLandingNotice={jest.fn()}
          onDeleteNotificationSound={jest.fn()}
          onEditMarketplaceLandingNotice={jest.fn()}
          onMoveMarketplaceAnnouncementBanner={jest.fn()}
          onMoveMarketplaceBioactiveStep={jest.fn()}
          onMoveMarketplaceCategoryBanner={jest.fn()}
          onMoveMarketplaceFeaturedCollection={jest.fn()}
          onMoveMarketplaceHeroSlide={jest.fn()}
          onPluginControlChange={jest.fn()}
          onSave={jest.fn()}
          onSaveMarketplaceLandingCta={jest.fn()}
          onSaveMarketplaceLandingYoutube={jest.fn()}
          onSaveMarketplaceLandingNotice={jest.fn()}
          onUploadMarketplaceAnnouncementImage={jest.fn()}
          onUploadMarketplaceBioactiveStepImage={jest.fn()}
          onUploadMarketplaceCategoryBannerImage={jest.fn()}
          onUploadMarketplaceCtaBackground={jest.fn()}
          onUploadMarketplaceDaraAvatar={jest.fn()}
          onUploadMarketplaceFeaturedCollectionImage={jest.fn()}
          onUploadMarketplaceHeroImage={jest.fn()}
          onUploadMarketplaceLogo={jest.fn()}
          onUploadMarketplaceYoutubeBackground={jest.fn()}
          onRefreshRegionSync={jest.fn()}
          onRefreshKpiWeeklyPreview={jest.fn()}
          onRunRegionSync={jest.fn()}
          onSaveKpiSettings={jest.fn()}
          onSaveOperationalGoogleAuth={jest.fn()}
          onSaveOperationalLivechat={jest.fn()}
          onSaveOperationalMaintenance={jest.fn()}
          onSaveOperationalPoWorkflow={jest.fn()}
          onSaveOperationalStaffAttendance={jest.fn()}
          onUploadNotificationSound={jest.fn()}
          onWebTitleChange={jest.fn()}
          saveMessage=""
          saveStatus="idle"
          sections={[]}
          setMarketplaceLandingCtaDraftField={jest.fn()}
          setMarketplaceLandingTabId={jest.fn()}
          setKpiEnabledRule={jest.fn()}
          setKpiSettingsDraftField={jest.fn()}
          setMarketplaceLandingYoutubeDraftField={jest.fn()}
          setMarketplaceLandingNoticeDraftField={jest.fn()}
          setWebContentPanelId={jest.fn()}
          setRegionFilter={jest.fn()}
          setSitemapCustomUrlsDraftText={jest.fn()}
          setSitemapExcludedSlugsDraftText={jest.fn()}
          setSitemapMasterField={jest.fn()}
          setSitemapSectionField={jest.fn()}
          setDraftField={jest.fn()}
          sitemapChangeFrequencies={[
            'always',
            'hourly',
            'daily',
            'weekly',
            'monthly',
            'yearly',
            'never',
          ]}
          sitemapCustomUrlsText=""
          sitemapDraft={{
            enabled: true,
            includeImages: true,
            sections: {},
            customUrls: [],
            excludedSlugs: {},
          }}
          sitemapExcludedSlugsText={{}}
          sitemapSectionKeys={[
            'products',
            'species',
            'blog',
            'brands',
            'categories',
            'tags',
          ]}
          storefrontEnabled
          webTitle="Dunia Anura"
        />,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Konten Web',
        'Landing Marketplace',
        'Blog',
        'Blog Topics',
        'Ringkasan Landing Marketplace',
        'Unggah Aset Marketplace',
        'Unggah logo',
        'Unggah avatar DARA',
        'Hero slide',
        '1/1 aktif',
        'Naik',
        'Turun',
        'Hapus',
      ]),
    );
  });

  it('renders DARA avatar from websetting draft in AI settings', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSettingsWebConfigSurface
          {...createSurfaceProps({
            activeTabId: 'ai',
            draft: {
              ...createWebSettingDraft(),
              daraAvatarUrl: '/media/dara/avatar.png',
            },
          })}
        />,
      );
    });

    const daraAvatar = renderer!.root
      .findAllByType(KolamRemoteImage)
      .find(node => node.props.accessibilityLabel === 'Avatar DARA');

    expect(daraAvatar?.props).toEqual(
      expect.objectContaining({
        scope: 'dara-avatar',
      }),
    );
    expect(renderText(renderer!)).not.toContain('Avatar belum diatur');

    await ReactTestRenderer.act(async () => {
      renderer!.unmount();
    });
  });

  it('renders KPI staff settings with native level and reward editors', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSettingsWebConfigSurface
          {...createSurfaceProps({
            activeTabId: 'kpi',
            kpiSummaryRows: [
              {
                id: 'task-points',
                label: 'Poin task',
                value: '5/10/20/30',
                detail: 'Rendah / sedang / tinggi / urgent.',
              },
            ],
          })}
        />,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'KPI Staff',
        'Poin dasar prioritas task',
        'Waktu, QC, dan bukti task',
        'Chat Inbox (SLA CS)',
        'Penalti komplain dan absensi',
        'Level bulanan dan bonus Rp',
        'ID level',
        'Nominal bonus',
        'Muat ulang preview',
        'Simpan KPI',
      ]),
    );
  });

  it('renders financial payment methods without duplicate financial title', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSettingsWebConfigSurface
          {...createSurfaceProps({
            activeTabId: 'finansial',
            financialSectionVisibility: {
              paymentMethods: true,
              taxProfile: false,
              overtime: false,
              enclosureCommission: false,
              taxEdit: false,
              any: true,
            },
            financialStatus: 'live',
            paymentMethods: [],
          })}
        />,
      );
    });

    const text = renderText(renderer!);

    expect(text).toContain('Metode pembayaran');
    expect(text).not.toContain('Finansial');
    expect(text).not.toContain('Data live dari backend Kolam.');

    await ReactTestRenderer.act(async () => {
      renderer!.root
        .findAllByType(KolamActionControlButton)
        .find(node => node.props.label === 'Tambah metode')!
        .props.onPress();
    });

    expect(
      renderer!.root
        .findAllByType(KolamDropdownSelect)
        .map(node => node.props.label),
    ).toEqual(
      expect.arrayContaining(['Tipe Pembayaran', 'Provider Pembayaran']),
    );
  });

  it('renders Umum social media and staff access cards', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSettingsWebConfigSurface
          {...createSurfaceProps({
            activeTabId: 'umum',
          })}
        />,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Sosial media',
        'Facebook',
        'Instagram',
        'Twitter / X',
        'YouTube',
        'TikTok',
        'Pembatasan MAC Kolam',
        'Redirect browser ke https://dunia-anura.com',
        'Aktifkan pembatasan MAC',
        'Izinkan login browser',
        'Lewati super administrator',
        'MAC terdeteksi',
        'MAC address',
        'Belum ada MAC terdeteksi.',
        'Belum ada MAC terdaftar.',
      ]),
    );
  });

  it('routes notification sections through scoped save handlers', async () => {
    const onSave = jest.fn();
    const onSaveNotificationFirebase = jest.fn();
    const onSaveNotificationOtpSmtp = jest.fn();
    const onSaveNotificationToggle = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSettingsWebConfigSurface
          {...createSurfaceProps({
            activeTabId: 'notifikasi',
            onSave,
            onSaveNotificationFirebase,
            onSaveNotificationOtpSmtp,
            onSaveNotificationToggle,
          })}
        />,
      );
    });

    const buttons = renderer!.root.findAllByType(KolamActionControlButton);

    expect(buttons.map(node => node.props.label)).toEqual(
      expect.arrayContaining(['Simpan Firebase', 'Simpan OTP & SMTP']),
    );

    await ReactTestRenderer.act(async () => {
      buttons
        .find(node => node.props.label === 'Simpan Firebase')!
        .props.onPress();
      buttons
        .find(node => node.props.label === 'Simpan OTP & SMTP')!
        .props.onPress();
    });

    expect(onSaveNotificationFirebase).toHaveBeenCalledTimes(1);
    expect(onSaveNotificationOtpSmtp).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();

    await ReactTestRenderer.act(async () => {
      renderer!.root
        .findAll(
          node =>
            node.props.accessibilityLabel === 'Notifikasi alih tangan DARA',
        )[0]
        .props.onPress();
      renderer!.root
        .findAll(
          node => node.props.accessibilityLabel === 'Panggilan grup chat tim',
        )[0]
        .props.onPress();
    });

    expect(onSaveNotificationToggle).toHaveBeenCalledWith(
      'daraHandoffNotifyEnabled',
      false,
    );
    expect(onSaveNotificationToggle).toHaveBeenCalledWith(
      'teamChatGroupCallEnabled',
      true,
    );
  });

  it('routes operational controls through scoped save handlers', async () => {
    const onSave = jest.fn();
    const onSaveOperationalGoogleAuth = jest.fn();
    const onSaveOperationalLivechat = jest.fn();
    const onSaveOperationalMaintenance = jest.fn();
    const onSaveOperationalPoWorkflow = jest.fn();
    const onSaveOperationalStaffAttendance = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSettingsWebConfigSurface
          {...createSurfaceProps({
            activeTabId: 'operasional',
            draft: {
              ...createWebSettingDraft(),
              googleOAuthClientId: 'client-1',
              poWorkflowReceivingRoomId: 'room-a',
            },
            operationalRooms: [
              {
                _id: 'room-a',
                name: 'Gudang',
                category: 'warehouse',
              },
            ],
            operationalStaffRows: [
              {
                _id: 'staff-1',
                first_name: 'Maya',
                last_name: 'Staff',
                username: 'maya',
              },
              {
                _id: 'staff-2',
                email: 'bima@dunia-anura.test',
              },
            ],
            onSave,
            onSaveOperationalGoogleAuth,
            onSaveOperationalLivechat,
            onSaveOperationalMaintenance,
            onSaveOperationalPoWorkflow,
            onSaveOperationalStaffAttendance,
          })}
        />,
      );
    });

    const toggles = renderer!.root.findAllByType(KolamToggleRow);
    const buttons = renderer!.root.findAllByType(KolamActionControlButton);
    const dropdowns = renderer!.root.findAllByType(KolamDropdownSelect);
    const text = renderText(renderer!);

    expect(text).toContain('Maya Staff');
    expect(text).toContain('bima@dunia-anura.test');
    expect(text).not.toContain('staff-1');
    expect(text).not.toContain('staff-2');
    const staffCheckboxes = renderer!.root.findAll(
      node => node.props.accessibilityRole === 'checkbox',
    );

    expect(staffCheckboxes.length).toBeGreaterThanOrEqual(6);

    await ReactTestRenderer.act(async () => {
      toggles.find(node => node.props.label === 'Marketplace')!.props.onPress();
      toggles
        .find(node => node.props.label === 'Live chat selalu online')!
        .props.onPress();
      toggles
        .find(node => node.props.label === 'Google Sign-In webstore')!
        .props.onPress();
      dropdowns
        .find(node => node.props.label === 'Room Team Chat')!
        .props.onChange('');
      staffCheckboxes[0].props.onPress();
      buttons
        .find(node => node.props.label === 'Simpan Client ID')!
        .props.onPress();
      buttons
        .find(node => node.props.label === 'Simpan absensi')!
        .props.onPress();
    });

    expect(onSaveOperationalMaintenance).toHaveBeenCalledWith(
      'marketplace',
      true,
    );
    expect(onSaveOperationalLivechat).toHaveBeenCalledWith(false);
    expect(onSaveOperationalGoogleAuth).toHaveBeenCalledWith({
      webstoreGoogleAuthEnabled: true,
    });
    expect(onSaveOperationalGoogleAuth).toHaveBeenCalledWith({
      googleOAuthClientId: 'client-1',
    });
    expect(onSaveOperationalPoWorkflow).toHaveBeenCalledWith({
      poWorkflowReceivingRoomId: '',
    });
    expect(onSaveOperationalPoWorkflow).toHaveBeenCalledWith({
      poWorkflowNotifyReceiveUserIds: 'staff-1',
    });
    expect(onSaveOperationalStaffAttendance).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('fills work site coordinates from backend geocode', async () => {
    const setDraftField = jest.fn();
    jest
      .spyOn(KolamApi, 'geocodeKolamStaffAttendanceWorkSite')
      .mockResolvedValueOnce({
        latitude: -6.2088,
        longitude: 106.8456,
        displayName: 'Kantor Dunia Anura',
      });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSettingsWebConfigSurface
          {...createSurfaceProps({
            activeTabId: 'operasional',
            draft: {
              ...createWebSettingDraft(),
              staffAttendanceWorkSites: [
                {
                  name: 'Kantor Dunia Anura',
                  latitude: 0,
                  longitude: 0,
                  radiusMeters: 150,
                  active: true,
                },
              ],
            },
            setDraftField,
          })}
        />,
      );
    });

    expect(
      renderer!.root
        .findAllByType(TextInput)
        .some(node => node.props.placeholder === 'Cari alamat kantor / toko'),
    ).toBe(true);

    await ReactTestRenderer.act(async () => {
      renderer!.root
        .findAllByType(KolamActionControlButton)
        .find(node => node.props.label === 'Cari koordinat')!
        .props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(KolamApi.geocodeKolamStaffAttendanceWorkSite).toHaveBeenCalledWith(
      'Kantor Dunia Anura',
    );
    expect(setDraftField).toHaveBeenCalledWith(
      'staffAttendanceWorkSites',
      expect.arrayContaining([
        expect.objectContaining({
          latitude: -6.2088,
          longitude: 106.8456,
        }),
      ]),
    );
  });
});

function createSurfaceProps(
  overrides: Partial<
    React.ComponentProps<typeof KolamSettingsWebConfigSurface>
  > = {},
) {
  return {
    activeTabId: 'konten',
    draft: createWebSettingDraft(),
    fields: getSettingsWebConfigFields(),
    maintenanceMode: false,
    marketplaceLandingCtaDraft: {
      title: 'Jelajahi Dunia Species',
      description: 'Temukan koleksi',
      buttonText: 'View',
      buttonLink: '/species',
      isActive: true,
    },
    marketplaceLandingYoutubeDraft: {
      link: 'https://youtube.com/@DuniaAnura',
      title: 'Dunia Anura',
      subtitle: 'YouTube',
      isActive: true,
    },
    marketplaceLandingNoticeDraft: {
      key: '',
      title: '',
      message: '',
      ctaUrl: '',
      ctaLabel: '',
      showOnHome: true,
      showOnDashboard: true,
      isActive: true,
    },
    marketplaceLandingSaveStatus: 'idle',
    marketplaceLandingMessage: '',
    marketplaceLandingAssetStatus: {},
    marketplaceLandingTabId: 'hero',
    marketplaceLandingTabItems: [],
    webContentLauncherItems: [],
    webContentMessage: '',
    webContentPanelId: 'marketplace',
    webContentStatus: 'live',
    blogRows: [],
    blogTopicRows: [],
    kpiMessage: '',
    kpiPreview: null,
    kpiSettingsDraft: createKpiSettingsDraft(),
    kpiStatus: 'idle',
    kpiSummaryRows: [],
    financialSummaryRows: [],
    operationalRooms: [],
    operationalStaffRows: [],
    regionLevel: 'province',
    regionParentCode: '',
    regionRows: [],
    regionSearch: '',
    regionSyncMessage: '',
    regionSyncStatus: 'idle',
    regionSyncSummaryRows: [],
    marketplaceLandingOverview: {
      status: 'live',
      message: '',
      heroSlides: [],
      categoryBanners: [],
      ctaSection: {
        title: 'Jelajahi Dunia Species',
        description: '',
        buttonText: 'View',
        buttonLink: '/species',
        isActive: true,
      },
      youtubeSection: {
        link: 'https://youtube.com/@DuniaAnura',
        title: 'Dunia Anura',
        subtitle: 'YouTube',
        isActive: true,
      },
      announcementBanners: [],
      customerNotices: [],
      marketplaceContent: {
        featuredCollections: [],
        bioactiveEcosystem: { steps: [] },
        logo: '',
        daraAvatar: '',
      },
    },
    notificationSoundStatus: {},
    onClearMarketplaceLandingNoticeDraft: jest.fn(),
    onDeleteMarketplaceAnnouncementBanner: jest.fn(),
    onDeleteMarketplaceBioactiveStep: jest.fn(),
    onDeleteMarketplaceCategoryBanner: jest.fn(),
    onDeleteMarketplaceFeaturedCollection: jest.fn(),
    onDeleteMarketplaceHeroSlide: jest.fn(),
    onDeleteMarketplaceLandingNotice: jest.fn(),
    onDeleteNotificationSound: jest.fn(),
    onEditMarketplaceLandingNotice: jest.fn(),
    onMoveMarketplaceAnnouncementBanner: jest.fn(),
    onMoveMarketplaceBioactiveStep: jest.fn(),
    onMoveMarketplaceCategoryBanner: jest.fn(),
    onMoveMarketplaceFeaturedCollection: jest.fn(),
    onMoveMarketplaceHeroSlide: jest.fn(),
    onPluginControlChange: jest.fn(),
    onSave: jest.fn(),
    onSaveMarketplaceLandingCta: jest.fn(),
    onSaveMarketplaceLandingYoutube: jest.fn(),
    onSaveMarketplaceLandingNotice: jest.fn(),
    onUploadMarketplaceAnnouncementImage: jest.fn(),
    onUploadMarketplaceBioactiveStepImage: jest.fn(),
    onUploadMarketplaceCategoryBannerImage: jest.fn(),
    onUploadMarketplaceCtaBackground: jest.fn(),
    onUploadMarketplaceDaraAvatar: jest.fn(),
    onUploadMarketplaceFeaturedCollectionImage: jest.fn(),
    onUploadMarketplaceHeroImage: jest.fn(),
    onUploadMarketplaceLogo: jest.fn(),
    onUploadMarketplaceYoutubeBackground: jest.fn(),
    onRefreshRegionSync: jest.fn(),
    onRefreshKpiWeeklyPreview: jest.fn(),
    onRunRegionSync: jest.fn(),
    onSaveKpiSettings: jest.fn(),
    onSaveOperationalGoogleAuth: jest.fn(),
    onSaveOperationalLivechat: jest.fn(),
    onSaveOperationalMaintenance: jest.fn(),
    onSaveOperationalPoWorkflow: jest.fn(),
    onSaveOperationalStaffAttendance: jest.fn(),
    onUploadNotificationSound: jest.fn(),
    onWebTitleChange: jest.fn(),
    saveMessage: '',
    saveStatus: 'idle',
    sections: [],
    setMarketplaceLandingCtaDraftField: jest.fn(),
    setMarketplaceLandingTabId: jest.fn(),
    setKpiEnabledRule: jest.fn(),
    setKpiSettingsDraftField: jest.fn(),
    setMarketplaceLandingYoutubeDraftField: jest.fn(),
    setMarketplaceLandingNoticeDraftField: jest.fn(),
    setWebContentPanelId: jest.fn(),
    setRegionFilter: jest.fn(),
    setSitemapCustomUrlsDraftText: jest.fn(),
    setSitemapExcludedSlugsDraftText: jest.fn(),
    setSitemapMasterField: jest.fn(),
    setSitemapSectionField: jest.fn(),
    setDraftField: jest.fn(),
    sitemapChangeFrequencies: [
      'always',
      'hourly',
      'daily',
      'weekly',
      'monthly',
      'yearly',
      'never',
    ],
    sitemapCustomUrlsText: '',
    sitemapDraft: {
      enabled: true,
      includeImages: true,
      sections: {},
      customUrls: [],
      excludedSlugs: {},
    },
    sitemapExcludedSlugsText: {},
    sitemapSectionKeys: [
      'products',
      'species',
      'blog',
      'brands',
      'categories',
      'tags',
    ],
    storefrontEnabled: true,
    webTitle: 'Dunia Anura',
    ...overrides,
  } as React.ComponentProps<typeof KolamSettingsWebConfigSurface>;
}

function createWebSettingDraft() {
  return {
    versionKolam: '',
    versionEnclonura: '',
    versionPos: '',
    versionMarketplace: '',
    companyName: 'Dunia Anura',
    companyTagline: '',
    address: '',
    phone: '',
    email: '',
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
    tiktok: '',
    maintenancePos: false,
    maintenanceMarketplace: false,
    livechatOnline: true,
    webstoreGoogleAuthEnabled: false,
    googleOAuthClientId: '',
    poWorkflowReceivingRoomId: '',
    poWorkflowNotifyOnReceive: true,
    poWorkflowNotifyOnCheck: true,
    poWorkflowNotifyOnPartial: true,
    poWorkflowPostProofToTeamChat: true,
    poWorkflowPartialCompleteRequiresAdmin: true,
    poWorkflowNotifyReceiveUserIds: '',
    poWorkflowNotifyCheckUserIds: '',
    poWorkflowNotifyCompleteUserIds: '',
    staffAttendancePayrollCutoffDay: '28',
    staffAttendanceWorkStartTime: '08:00',
    staffAttendanceWorkEndTime: '17:00',
    staffAttendanceServiceCommissionInsideHoursPct: '0',
    staffAttendanceServiceCommissionOutsideHoursPct: '0',
    staffAttendanceTimezone: 'Asia/Jakarta',
    staffAttendanceLateToleranceMinutes: '15',
    staffAttendanceLateTier2MaxMinutes: '120',
    staffAttendanceLateCheckInDeadlineMinutes: '240',
    staffAttendanceLateFineTier2: '50000',
    staffAttendanceLateFineTier3: '100000',
    staffAttendanceAbsentDailyDivisor: '30',
    staffAttendanceMapProvider: 'openstreetmap',
    staffAttendanceOsmNominatimUrl: '',
    staffAttendanceOsmTileUrl: '',
    staffAttendanceGoogleMapsBrowserApiKey: '',
    staffAttendanceRequireGps: true,
    staffAttendanceRequireFace: false,
    staffAttendanceFaceMatchThreshold: '0.72',
    staffAttendanceWorkSites: [],
    biteshipApiKey: '',
    googleMapsBrowserApiKey: '',
    originAddressLine1: '',
    originCity: '',
    originProvince: '',
    originPostalCode: '',
    originLatitude: '',
    originLongitude: '',
    storeOperatingHoursEnabled: false,
    storeOperatingHoursDaraReplyWhenClosed: false,
    storeOperatingHoursTimezone: 'Asia/Jakarta',
    storeOperatingHoursSpecialClosureDate: '',
    storeOperatingHoursSpecialClosureLabel: '',
    storeOperatingHoursSpecialClosuresText: '',
    storeOperatingHoursMessageBeforeOpen: '',
    storeOperatingHoursMessageAfterClose: '',
    storeOperatingHoursMessageWeeklyClosed: '',
    storeOperatingHoursMessageSpecialClosed: '',
    storeOperatingHoursMessageShippingDisclaimer: '',
    storeHoursMondayOpen: true,
    storeHoursMondayOpenAt: '09:00',
    storeHoursMondayCloseAt: '21:00',
    storeHoursTuesdayOpen: true,
    storeHoursTuesdayOpenAt: '09:00',
    storeHoursTuesdayCloseAt: '21:00',
    storeHoursWednesdayOpen: true,
    storeHoursWednesdayOpenAt: '09:00',
    storeHoursWednesdayCloseAt: '21:00',
    storeHoursThursdayOpen: true,
    storeHoursThursdayOpenAt: '09:00',
    storeHoursThursdayCloseAt: '21:00',
    storeHoursFridayOpen: true,
    storeHoursFridayOpenAt: '09:00',
    storeHoursFridayCloseAt: '21:00',
    storeHoursSaturdayOpen: true,
    storeHoursSaturdayOpenAt: '09:00',
    storeHoursSaturdayCloseAt: '21:00',
    storeHoursSundayOpen: true,
    storeHoursSundayOpenAt: '09:00',
    storeHoursSundayCloseAt: '21:00',
    staffDesktopOnlyEnabled: false,
    staffDesktopOnlyRedirectUrl: '',
    kolamMacAccessEnabled: false,
    kolamMacAccessAllowWebBrowser: false,
    kolamMacAccessBypassSuperAdmin: true,
    kolamMacAccessAllowedMacAddresses: '',
    staffOtpLoginEnabled: false,
    staffOtpExpireMinutes: '10',
    staffOtpResendCooldownSeconds: '60',
    staffOtpMaxAttempts: '5',
    staffOtpLockMinutes: '15',
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    smtpPass: '',
    smtpFromEmail: '',
    smtpFromName: '',
    smtpSecure: true,
    firebaseEnabled: false,
    firebaseProjectId: '',
    firebaseClientEmail: '',
    firebasePrivateKey: '',
    chatStoreEnabled: true,
    teamChatDaraReplyEnabled: true,
    teamChatGroupCallEnabled: false,
    inboxAiReplyStore: false,
    inboxAiReplyWhatsapp: true,
    inboxAiReplyTiktok: true,
    inboxAiReplyInstagram: true,
    inboxAiReplyTokopedia: false,
    inboxAiReplyShopee: false,
    daraFulfillmentTeamRoomId: '',
    daraBusinessEnabled: true,
    daraToolsEnabled: true,
    daraKnowledgeEnabled: true,
    daraHandoffNotifyEnabled: true,
    daraInsightsEnabled: true,
    daraInsightsCronSchedule: '0 8,14 * * *',
    daraAutoReportEnabled: true,
    daraImageAnalysisEnabled: true,
    daraTaxEnabled: true,
    daraSeoEnabled: true,
    daraSeoMonitorEnabled: true,
    daraSeoSentimentLlmEnabled: false,
    daraMarketScanCronEnabled: true,
    daraTaxRegulationWatcherEnabled: false,
    daraTaxComplianceJobEnabled: true,
    daraTaxLlmNarrativeEnabled: false,
    autoOlshopFulfillmentEnabled: false,
    autoOlshopShopeeEnabled: false,
    autoOlshopTokopediaEnabled: false,
    daraWebstoreFulfillmentEnabled: true,
    daraFulfillmentPackingMinutes: '30',
    daraFulfillmentPackingMaxExtensions: '1',
    daraAvatarUrl: '',
    katakTerbangWorkerName: '',
    daraStaffOpsNotifyEnabled: true,
    daraStaffWaNotifyEnabled: true,
    daraPenjualanTeamRoomId: '',
    daraOlshopCustomerNotifyEnabled: true,
    daraOlshopDeferredCron: '*/10 * * * *',
    daraOlshopDeferredBatch: '20',
    daraOlshopStockGateEnabled: true,
    daraOlshopStockSyncMaxAgeMs: '21600000',
    daraOlshopStockGateCron: '*/5 * * * *',
    daraOlshopStockGateBatch: '20',
    daraOpsAuditEnabled: true,
    daraOwnerDigestEnabled: true,
    daraOwnerDigestCron: '0 7 * * *',
    daraOwnerDigestWaEnabled: true,
    daraOwnerDigestFcmEnabled: true,
    daraOwnerFcmUrgentEnabled: true,
    daraOpsDigestLookbackHours: '12',
    notificationSound: '',
    unassignedNotificationSound: '',
    handoffNotificationSound: '',
    groupCallRingtone: '',
    salesNotificationSound: '',
    salePricesIncludeTax: true,
    commissionPph21Enabled: true,
    overtimeCalculationMode: 'per_hour' as const,
    overtimeUseSalaryDerivedRate: true,
    overtimeRatePerHour: '0',
    overtimeRatePerDay: '0',
    overtimeDefaultHoursPerRequest: '3',
    overtimeMidnightCutoff: '23:59',
    overtimeUseStoreCloseForPerDay: true,
    enclosureSaleCommissionEnabled: false,
    enclosureSaleCommissionType: 'percentage' as const,
    enclosureSaleCommissionValue: '0',
    pluginControls: {
      enclosure: true,
      taskManager: true,
      layanan: true,
      freyer: true,
      kpi: true,
      chat: true,
      dara: true,
      proyek: true,
    },
  };
}

function createKpiSettingsDraft() {
  return {
    taskBaseLow: '5',
    taskBaseMedium: '10',
    taskBaseHigh: '20',
    taskBaseUrgent: '30',
    assistedByRatio: '0.5',
    onTimeBeforeDeadline: '5',
    onTimeFarEarlyPct: '50',
    onTimeFarEarlyBonus: '10',
    onTimeLate: '-5',
    qcPassFirst: '10',
    qcRevision1: '0',
    qcRevisionMany: '-5',
    proofComplete: '5',
    noProofMissing: '-10',
    noShowReassignOrCancel: '-25',
    chatFastReplyMinutes: '5',
    chatFastReplyPoints: '5',
    chatLateReplyMinutes: '14',
    chatLateReplyPoints: '-10',
    chatNoReplyPoints: '-15',
    complaintLight: '-10',
    complaintValid: '-25',
    complaintSevere: '-50',
    attendanceOutsideRadius: '-20',
    levelsText: 'bronze|Bronze|0|200',
    rewardsText: 'bronze|0',
    enabledRules: {
      'task.base': true,
      'task.on_time': true,
      'task.qc': true,
      'task.proof': true,
      'task.no_proof': true,
      complaint: true,
      'task.noshow': true,
      'attendance.radius': true,
      'task.rating': true,
      'chat.fast_reply': true,
      'chat.late_reply': true,
      'chat.no_reply': true,
    },
  };
}
