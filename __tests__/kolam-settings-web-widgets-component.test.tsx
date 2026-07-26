import React from 'react';
import { Text, View } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { KolamSettingsWebConfigSurface } from '../src/components/kolam-settings-panel-surfaces';
import { KolamRemoteImage } from '../src/components/kolam-remote-image';
import { KolamSettingsWebFileField } from '../src/components/kolam-settings-web-file-field';
import { KolamSettingsWebFormSections } from '../src/components/kolam-settings-web-widgets';
import {
  getSettingsWebConfigFields,
  getSettingsWebFormSections,
} from '../src/domain/settings-surface';

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
          onToggleMaintenanceMode={jest.fn()}
          onToggleStorefrontEnabled={jest.fn()}
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
});

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
    staffAttendanceTimezone: 'Asia/Jakarta',
    staffAttendanceLateToleranceMinutes: '15',
    staffAttendanceLateTier2MaxMinutes: '120',
    staffAttendanceLateCheckInDeadlineMinutes: '240',
    staffAttendanceLateFineTier2: '50000',
    staffAttendanceLateFineTier3: '100000',
    staffAttendanceAbsentDailyDivisor: '30',
    staffAttendanceMapProvider: 'openstreetmap',
    staffAttendanceRequireGps: true,
    staffAttendanceRequireFace: false,
    staffAttendanceFaceMatchThreshold: '0.72',
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
    daraBusinessEnabled: true,
    daraToolsEnabled: true,
    daraKnowledgeEnabled: true,
    daraHandoffNotifyEnabled: true,
    daraInsightsEnabled: true,
    daraAutoReportEnabled: true,
    daraImageAnalysisEnabled: true,
    daraTaxEnabled: true,
    daraSeoEnabled: true,
    daraTaxRegulationWatcherEnabled: false,
    daraTaxComplianceJobEnabled: true,
    daraTaxLlmNarrativeEnabled: false,
    daraWebstoreFulfillmentEnabled: true,
    daraStaffOpsNotifyEnabled: true,
    daraStaffWaNotifyEnabled: true,
    daraOlshopCustomerNotifyEnabled: true,
    daraOwnerDigestEnabled: true,
    daraOwnerDigestWaEnabled: true,
    daraOwnerDigestFcmEnabled: true,
    daraOwnerFcmUrgentEnabled: true,
    notificationSound: '',
    unassignedNotificationSound: '',
    handoffNotificationSound: '',
    groupCallRingtone: '',
    salesNotificationSound: '',
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
