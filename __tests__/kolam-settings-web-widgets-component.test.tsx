import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamSettingsWebConfigSurface} from '../src/components/kolam-settings-panel-surfaces';
import {KolamSettingsWebFormSections} from '../src/components/kolam-settings-web-widgets';
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
      expect.arrayContaining(['Web Settings form', 'Save']),
    );
  });

  it('renders marketplace landing overview in Web Settings', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSettingsWebConfigSurface
          draft={createWebSettingDraft()}
          fields={getSettingsWebConfigFields()}
          maintenanceMode={false}
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
                steps: [{key: 'setup', image: '', order: 0, isActive: true}],
              },
            },
          }}
          notificationSoundStatus={{}}
          onDeleteNotificationSound={jest.fn()}
          onPluginControlChange={jest.fn()}
          onSave={jest.fn()}
          onToggleMaintenanceMode={jest.fn()}
          onToggleStorefrontEnabled={jest.fn()}
          onUploadNotificationSound={jest.fn()}
          onWebTitleChange={jest.fn()}
          saveMessage=""
          saveStatus="idle"
          sections={[]}
          setDraftField={jest.fn()}
          storefrontEnabled
          webTitle="Dunia Anura"
        />,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Marketplace Landing Overview',
        'Hero slides',
        '1/1 active',
        'Featured collections',
        'Amphibians',
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
    originAddressLine1: '',
    originCity: '',
    originProvince: '',
    originPostalCode: '',
    originLatitude: '',
    originLongitude: '',
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
