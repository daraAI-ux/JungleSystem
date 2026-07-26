import React from 'react';
import { StyleSheet, View } from 'react-native';
import type {
  SettingsTabId,
  SettingsWebConfigField,
  SettingsWebFormSection,
} from '../domain/settings-surface';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamActionControlButton } from './kolam-action-control-button';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamSettingsWebFormSections } from './kolam-settings-web-widgets';
import { KolamTextFieldRow } from './kolam-text-field-row';
import { KolamToggleRow } from './kolam-toggle-row';
import type {
  KolamAnnouncementBanner,
  KolamCategoryBanner,
  KolamCustomerTextNotice,
  KolamHeroSlide,
  KolamNotificationSoundType,
  KolamPluginConfigKey,
  KolamTeamChatRoom,
  KolamUserPickerRow,
} from '../services/kolam-api';
import type {
  SettingsFinancialSummaryRow,
  MarketplaceLandingCtaDraft,
  MarketplaceLandingNoticeDraft,
  MarketplaceLandingOverview,
  MarketplaceLandingYoutubeDraft,
} from './kolam-settings-panel-controller';

type WebSettingDraft = {
  versionKolam: string;
  versionEnclonura: string;
  versionPos: string;
  versionMarketplace: string;
  companyName: string;
  companyTagline: string;
  address: string;
  phone: string;
  email: string;
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  tiktok: string;
  maintenancePos: boolean;
  maintenanceMarketplace: boolean;
  livechatOnline: boolean;
  webstoreGoogleAuthEnabled: boolean;
  googleOAuthClientId: string;
  poWorkflowReceivingRoomId: string;
  poWorkflowNotifyOnReceive: boolean;
  poWorkflowNotifyOnCheck: boolean;
  poWorkflowNotifyOnPartial: boolean;
  poWorkflowPostProofToTeamChat: boolean;
  poWorkflowPartialCompleteRequiresAdmin: boolean;
  poWorkflowNotifyReceiveUserIds: string;
  poWorkflowNotifyCheckUserIds: string;
  poWorkflowNotifyCompleteUserIds: string;
  staffAttendancePayrollCutoffDay: string;
  staffAttendanceWorkStartTime: string;
  staffAttendanceWorkEndTime: string;
  staffAttendanceTimezone: string;
  staffAttendanceLateToleranceMinutes: string;
  staffAttendanceLateTier2MaxMinutes: string;
  staffAttendanceLateCheckInDeadlineMinutes: string;
  staffAttendanceLateFineTier2: string;
  staffAttendanceLateFineTier3: string;
  staffAttendanceAbsentDailyDivisor: string;
  staffAttendanceMapProvider: string;
  staffAttendanceRequireGps: boolean;
  staffAttendanceRequireFace: boolean;
  staffAttendanceFaceMatchThreshold: string;
  biteshipApiKey: string;
  googleMapsBrowserApiKey: string;
  originAddressLine1: string;
  originCity: string;
  originProvince: string;
  originPostalCode: string;
  originLatitude: string;
  originLongitude: string;
  storeOperatingHoursEnabled: boolean;
  storeOperatingHoursDaraReplyWhenClosed: boolean;
  storeOperatingHoursTimezone: string;
  storeHoursMondayOpen: boolean;
  storeHoursMondayOpenAt: string;
  storeHoursMondayCloseAt: string;
  storeHoursTuesdayOpen: boolean;
  storeHoursTuesdayOpenAt: string;
  storeHoursTuesdayCloseAt: string;
  storeHoursWednesdayOpen: boolean;
  storeHoursWednesdayOpenAt: string;
  storeHoursWednesdayCloseAt: string;
  storeHoursThursdayOpen: boolean;
  storeHoursThursdayOpenAt: string;
  storeHoursThursdayCloseAt: string;
  storeHoursFridayOpen: boolean;
  storeHoursFridayOpenAt: string;
  storeHoursFridayCloseAt: string;
  storeHoursSaturdayOpen: boolean;
  storeHoursSaturdayOpenAt: string;
  storeHoursSaturdayCloseAt: string;
  storeHoursSundayOpen: boolean;
  storeHoursSundayOpenAt: string;
  storeHoursSundayCloseAt: string;
  staffDesktopOnlyEnabled: boolean;
  staffDesktopOnlyRedirectUrl: string;
  kolamMacAccessEnabled: boolean;
  kolamMacAccessAllowWebBrowser: boolean;
  kolamMacAccessBypassSuperAdmin: boolean;
  kolamMacAccessAllowedMacAddresses: string;
  staffOtpLoginEnabled: boolean;
  staffOtpExpireMinutes: string;
  staffOtpResendCooldownSeconds: string;
  staffOtpMaxAttempts: string;
  staffOtpLockMinutes: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  smtpFromEmail: string;
  smtpFromName: string;
  smtpSecure: boolean;
  firebaseEnabled: boolean;
  firebaseProjectId: string;
  firebaseClientEmail: string;
  firebasePrivateKey: string;
  chatStoreEnabled: boolean;
  teamChatDaraReplyEnabled: boolean;
  teamChatGroupCallEnabled: boolean;
  daraBusinessEnabled: boolean;
  daraToolsEnabled: boolean;
  daraKnowledgeEnabled: boolean;
  daraHandoffNotifyEnabled: boolean;
  daraInsightsEnabled: boolean;
  daraAutoReportEnabled: boolean;
  daraImageAnalysisEnabled: boolean;
  daraTaxEnabled: boolean;
  daraSeoEnabled: boolean;
  daraTaxRegulationWatcherEnabled: boolean;
  daraTaxComplianceJobEnabled: boolean;
  daraTaxLlmNarrativeEnabled: boolean;
  daraWebstoreFulfillmentEnabled: boolean;
  daraStaffOpsNotifyEnabled: boolean;
  daraStaffWaNotifyEnabled: boolean;
  daraOlshopCustomerNotifyEnabled: boolean;
  daraOwnerDigestEnabled: boolean;
  daraOwnerDigestWaEnabled: boolean;
  daraOwnerDigestFcmEnabled: boolean;
  daraOwnerFcmUrgentEnabled: boolean;
  notificationSound: string;
  unassignedNotificationSound: string;
  handoffNotificationSound: string;
  groupCallRingtone: string;
  salesNotificationSound: string;
  pluginControls: Record<KolamPluginConfigKey, boolean>;
};

const storeOperatingHourRows: Array<{
  id: string;
  label: string;
  openField: keyof WebSettingDraft;
  openAtField: keyof WebSettingDraft;
  closeAtField: keyof WebSettingDraft;
}> = [
  {
    id: 'monday',
    label: 'Senin',
    openField: 'storeHoursMondayOpen',
    openAtField: 'storeHoursMondayOpenAt',
    closeAtField: 'storeHoursMondayCloseAt',
  },
  {
    id: 'tuesday',
    label: 'Selasa',
    openField: 'storeHoursTuesdayOpen',
    openAtField: 'storeHoursTuesdayOpenAt',
    closeAtField: 'storeHoursTuesdayCloseAt',
  },
  {
    id: 'wednesday',
    label: 'Rabu',
    openField: 'storeHoursWednesdayOpen',
    openAtField: 'storeHoursWednesdayOpenAt',
    closeAtField: 'storeHoursWednesdayCloseAt',
  },
  {
    id: 'thursday',
    label: 'Kamis',
    openField: 'storeHoursThursdayOpen',
    openAtField: 'storeHoursThursdayOpenAt',
    closeAtField: 'storeHoursThursdayCloseAt',
  },
  {
    id: 'friday',
    label: 'Jumat',
    openField: 'storeHoursFridayOpen',
    openAtField: 'storeHoursFridayOpenAt',
    closeAtField: 'storeHoursFridayCloseAt',
  },
  {
    id: 'saturday',
    label: 'Sabtu',
    openField: 'storeHoursSaturdayOpen',
    openAtField: 'storeHoursSaturdayOpenAt',
    closeAtField: 'storeHoursSaturdayCloseAt',
  },
  {
    id: 'sunday',
    label: 'Minggu',
    openField: 'storeHoursSundayOpen',
    openAtField: 'storeHoursSundayOpenAt',
    closeAtField: 'storeHoursSundayCloseAt',
  },
];

export function KolamSettingsWebConfigSurface({
  fields,
  maintenanceMode,
  marketplaceLandingOverview,
  financialSummaryRows,
  operationalRooms,
  operationalStaffRows,
  marketplaceLandingCtaDraft,
  marketplaceLandingYoutubeDraft,
  marketplaceLandingNoticeDraft,
  marketplaceLandingSaveStatus,
  marketplaceLandingMessage,
  marketplaceLandingAssetStatus,
  onClearMarketplaceLandingNoticeDraft,
  onDeleteMarketplaceAnnouncementBanner,
  onDeleteMarketplaceBioactiveStep,
  onDeleteMarketplaceCategoryBanner,
  onDeleteMarketplaceFeaturedCollection,
  onDeleteMarketplaceHeroSlide,
  onDeleteMarketplaceLandingNotice,
  onEditMarketplaceLandingNotice,
  onMoveMarketplaceAnnouncementBanner,
  onMoveMarketplaceBioactiveStep,
  onMoveMarketplaceCategoryBanner,
  onMoveMarketplaceFeaturedCollection,
  onMoveMarketplaceHeroSlide,
  onSaveMarketplaceLandingCta,
  onSaveMarketplaceLandingYoutube,
  onSaveMarketplaceLandingNotice,
  onUploadMarketplaceAnnouncementImage,
  onUploadMarketplaceBioactiveStepImage,
  onUploadMarketplaceCategoryBannerImage,
  onUploadMarketplaceCtaBackground,
  onUploadMarketplaceDaraAvatar,
  onUploadMarketplaceFeaturedCollectionImage,
  onUploadMarketplaceHeroImage,
  onUploadMarketplaceLogo,
  onUploadMarketplaceYoutubeBackground,
  onToggleMaintenanceMode,
  onToggleStorefrontEnabled,
  onSave,
  onDeleteNotificationSound,
  onPluginControlChange,
  onUploadNotificationSound,
  onWebTitleChange,
  activeTabId = 'umum',
  readOnly = false,
  saveMessage,
  saveStatus,
  sections,
  setMarketplaceLandingCtaDraftField,
  setMarketplaceLandingYoutubeDraftField,
  setMarketplaceLandingNoticeDraftField,
  setDraftField,
  storefrontEnabled,
  draft,
  notificationSoundStatus,
  webTitle,
}: {
  draft: WebSettingDraft;
  fields: SettingsWebConfigField[];
  maintenanceMode: boolean;
  marketplaceLandingOverview: MarketplaceLandingOverview;
  financialSummaryRows: SettingsFinancialSummaryRow[];
  operationalRooms: KolamTeamChatRoom[];
  operationalStaffRows: KolamUserPickerRow[];
  marketplaceLandingCtaDraft: MarketplaceLandingCtaDraft;
  marketplaceLandingYoutubeDraft: MarketplaceLandingYoutubeDraft;
  marketplaceLandingNoticeDraft: MarketplaceLandingNoticeDraft;
  marketplaceLandingSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  marketplaceLandingMessage: string;
  marketplaceLandingAssetStatus: Partial<
    Record<string, 'idle' | 'uploading' | 'deleting' | 'reordering'>
  >;
  onClearMarketplaceLandingNoticeDraft: () => void;
  onDeleteMarketplaceAnnouncementBanner: (
    banner: KolamAnnouncementBanner,
  ) => void;
  onDeleteMarketplaceBioactiveStep: (index: number) => void;
  onDeleteMarketplaceCategoryBanner: (banner: KolamCategoryBanner) => void;
  onDeleteMarketplaceFeaturedCollection: (index: number) => void;
  onDeleteMarketplaceHeroSlide: (slide: KolamHeroSlide) => void;
  onDeleteMarketplaceLandingNotice: (key: string) => void;
  onEditMarketplaceLandingNotice: (notice: KolamCustomerTextNotice) => void;
  onMoveMarketplaceAnnouncementBanner: (
    banner: KolamAnnouncementBanner,
    direction: -1 | 1,
  ) => void;
  onMoveMarketplaceBioactiveStep: (index: number, direction: -1 | 1) => void;
  onMoveMarketplaceCategoryBanner: (
    banner: KolamCategoryBanner,
    direction: -1 | 1,
  ) => void;
  onMoveMarketplaceFeaturedCollection: (
    index: number,
    direction: -1 | 1,
  ) => void;
  onMoveMarketplaceHeroSlide: (
    slide: KolamHeroSlide,
    direction: -1 | 1,
  ) => void;
  onSaveMarketplaceLandingCta: () => void;
  onSaveMarketplaceLandingYoutube: () => void;
  onSaveMarketplaceLandingNotice: () => void;
  onUploadMarketplaceAnnouncementImage: (
    banner: KolamAnnouncementBanner,
  ) => void;
  onUploadMarketplaceBioactiveStepImage: (index: number) => void;
  onUploadMarketplaceCategoryBannerImage: (banner: KolamCategoryBanner) => void;
  onUploadMarketplaceCtaBackground: () => void;
  onUploadMarketplaceDaraAvatar: () => void;
  onUploadMarketplaceFeaturedCollectionImage: (index: number) => void;
  onUploadMarketplaceHeroImage: (slide: KolamHeroSlide) => void;
  onUploadMarketplaceLogo: () => void;
  onUploadMarketplaceYoutubeBackground: () => void;
  onToggleMaintenanceMode: () => void;
  onToggleStorefrontEnabled: () => void;
  onSave: () => void;
  onDeleteNotificationSound: (type: KolamNotificationSoundType) => void;
  onPluginControlChange: (key: KolamPluginConfigKey, enabled: boolean) => void;
  onUploadNotificationSound: (type: KolamNotificationSoundType) => void;
  onWebTitleChange: (value: string) => void;
  activeTabId?: SettingsTabId;
  notificationSoundStatus: Partial<
    Record<KolamNotificationSoundType, 'idle' | 'uploading' | 'deleting'>
  >;
  readOnly?: boolean;
  saveMessage: string;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  sections: SettingsWebFormSection[];
  setMarketplaceLandingCtaDraftField: <
    Key extends keyof MarketplaceLandingCtaDraft,
  >(
    key: Key,
    value: MarketplaceLandingCtaDraft[Key],
  ) => void;
  setMarketplaceLandingYoutubeDraftField: <
    Key extends keyof MarketplaceLandingYoutubeDraft,
  >(
    key: Key,
    value: MarketplaceLandingYoutubeDraft[Key],
  ) => void;
  setMarketplaceLandingNoticeDraftField: <
    Key extends keyof MarketplaceLandingNoticeDraft,
  >(
    key: Key,
    value: MarketplaceLandingNoticeDraft[Key],
  ) => void;
  setDraftField: (key: keyof WebSettingDraft, value: string | boolean) => void;
  storefrontEnabled: boolean;
  webTitle: string;
}) {
  const disabled = readOnly || saveStatus === 'saving';
  const showGeneralSettings = activeTabId === 'umum';
  const showStoreShippingSettings = activeTabId === 'toko';
  const showOperationalSettings = activeTabId === 'operasional';
  const showFinancialTaxSummary = activeTabId === 'finansial';
  const showNotificationSettings = activeTabId === 'notifikasi';
  const showAiSettings = activeTabId === 'ai';
  const showPluginControls = activeTabId === 'plugin';
  const showMarketplaceLanding = activeTabId === 'konten';
  const generalFormSections = sections.filter(section => section.id === 'logo');
  const chatPluginEnabled = draft.pluginControls.chat;
  const daraPluginEnabled = draft.pluginControls.dara;
  const chatControlsDisabled = disabled || !chatPluginEnabled;
  const daraControlsDisabled = disabled || !daraPluginEnabled;
  const daraChatControlsDisabled =
    disabled || !chatPluginEnabled || !daraPluginEnabled;
  const notificationSoundItems = [
    {
      id: 'notification-sound',
      label: 'Notification sound',
      type: 'assigned' as const,
      value: draft.notificationSound,
    },
    {
      id: 'unassigned-notification-sound',
      label: 'Unassigned sound',
      type: 'unassigned' as const,
      value: draft.unassignedNotificationSound,
    },
    {
      id: 'handoff-notification-sound',
      label: 'Handoff sound',
      type: 'handoff' as const,
      value: draft.handoffNotificationSound,
    },
    {
      id: 'group-call-ringtone',
      label: 'Group call ringtone',
      type: 'group-call' as const,
      value: draft.groupCallRingtone,
    },
    {
      id: 'sales-notification-sound',
      label: 'Sales sound',
      type: 'sales' as const,
      value: draft.salesNotificationSound,
    },
  ];
  const roomSummary = operationalRooms.length
    ? operationalRooms
        .slice(0, 5)
        .map(room => `${getTeamChatRoomLabel(room)} (${room._id})`)
        .join(' | ')
    : 'Room list belum tersedia. Isi Team Chat room ID manual.';
  const staffSummary = operationalStaffRows.length
    ? operationalStaffRows
        .slice(0, 5)
        .map(staff => `${getUserPickerLabel(staff)} (${staff._id})`)
        .join(' | ')
    : 'Staff list belum tersedia. Isi user ID manual, pisahkan koma atau baris baru.';

  return (
    <KolamContentFrame variant="settingsWebConfig">
      {showGeneralSettings ? (
        <>
          <KolamTextFieldRow
            label={fields[0].label}
            description={fields[0].description}
            value={draft.companyName || webTitle}
            onChangeText={value => {
              if (disabled) {
                return;
              }
              setDraftField('companyName', value);
              onWebTitleChange(value);
            }}
            placeholder="Storefront title"
          />
          <KolamTextFieldRow
            label="Company Tagline"
            description="Tagline branding yang tampil di storefront."
            value={draft.companyTagline}
            onChangeText={value => setDraftField('companyTagline', value)}
            placeholder="Your trusted pet store"
          />
          <KolamTextFieldRow
            label="Kolam Version"
            description="Disimpan melalui PUT /websetting/version untuk app kolam."
            value={draft.versionKolam}
            onChangeText={value => setDraftField('versionKolam', value)}
            placeholder="1.0.0"
          />
          <KolamTextFieldRow
            label="Enclonura Version"
            description="Disimpan melalui endpoint version app enclonura."
            value={draft.versionEnclonura}
            onChangeText={value => setDraftField('versionEnclonura', value)}
            placeholder="1.0.0"
          />
          <KolamTextFieldRow
            label="POS Version"
            description="Disimpan melalui endpoint version app pos."
            value={draft.versionPos}
            onChangeText={value => setDraftField('versionPos', value)}
            placeholder="1.0.0"
          />
          <KolamTextFieldRow
            label="Marketplace Version"
            description="Disimpan melalui endpoint version app marketplace."
            value={draft.versionMarketplace}
            onChangeText={value => setDraftField('versionMarketplace', value)}
            placeholder="1.0.0"
          />
          <KolamTextFieldRow
            label="Phone"
            description="Nomor kontak customer."
            value={draft.phone}
            onChangeText={value => setDraftField('phone', value)}
            placeholder="+62 812-3456-7890"
          />
          <KolamTextFieldRow
            label="Email"
            description="Email kontak customer."
            value={draft.email}
            onChangeText={value => setDraftField('email', value)}
            placeholder="info@duniaanura.com"
          />
          <KolamTextFieldRow
            label="Address"
            description="Alamat bisnis utama."
            value={draft.address}
            onChangeText={value => setDraftField('address', value)}
            placeholder="Jl. Contoh No. 1"
          />
          {showOperationalSettings ? (
            <>
              <KolamToggleRow
                label={fields[1].label}
                description={fields[1].description}
                active={draft.livechatOnline}
                onPress={() => {
                  if (disabled) {
                    return;
                  }
                  setDraftField('livechatOnline', !draft.livechatOnline);
                  onToggleStorefrontEnabled();
                }}
              />
              <KolamToggleRow
                label={fields[2].label}
                description={fields[2].description}
                active={draft.maintenancePos}
                onPress={() => {
                  if (disabled) {
                    return;
                  }
                  setDraftField('maintenancePos', !draft.maintenancePos);
                  onToggleMaintenanceMode();
                }}
              />
              <KolamToggleRow
                label="Marketplace maintenance"
                description="Aktifkan mode pemeliharaan untuk Marketplace."
                active={draft.maintenanceMarketplace}
                onPress={() =>
                  !disabled &&
                  setDraftField(
                    'maintenanceMarketplace',
                    !draft.maintenanceMarketplace,
                  )
                }
              />
            </>
          ) : null}
          {showStoreShippingSettings ? (
            <>
              <KolamTextFieldRow
                label="Origin Address"
                description="Alamat asal pengiriman."
                value={draft.originAddressLine1}
                onChangeText={value =>
                  setDraftField('originAddressLine1', value)
                }
                placeholder="Jl. Taman Ratu Raya No.34"
              />
              <KolamTextFieldRow
                label="Origin City"
                description="Kota asal pengiriman."
                value={draft.originCity}
                onChangeText={value => setDraftField('originCity', value)}
                placeholder="Jakarta Barat"
              />
              <KolamTextFieldRow
                label="Origin Province"
                description="Provinsi asal pengiriman."
                value={draft.originProvince}
                onChangeText={value => setDraftField('originProvince', value)}
                placeholder="DKI Jakarta"
              />
              <KolamTextFieldRow
                label="Origin Postal Code"
                description="Kode pos asal pengiriman."
                value={draft.originPostalCode}
                onChangeText={value => setDraftField('originPostalCode', value)}
                placeholder="11550"
              />
              <KolamTextFieldRow
                label="Origin Latitude"
                description="Koordinat latitude origin."
                value={draft.originLatitude}
                onChangeText={value => setDraftField('originLatitude', value)}
                placeholder="-6.1687829"
              />
              <KolamTextFieldRow
                label="Origin Longitude"
                description="Koordinat longitude origin."
                value={draft.originLongitude}
                onChangeText={value => setDraftField('originLongitude', value)}
                placeholder="106.7676678"
              />
            </>
          ) : null}
          <KolamTextFieldRow
            label="Facebook"
            description="Link Facebook storefront."
            value={draft.facebook}
            onChangeText={value => setDraftField('facebook', value)}
            placeholder="https://facebook.com/..."
          />
          <KolamTextFieldRow
            label="Instagram"
            description="Link Instagram storefront."
            value={draft.instagram}
            onChangeText={value => setDraftField('instagram', value)}
            placeholder="https://instagram.com/..."
          />
          <KolamTextFieldRow
            label="Twitter"
            description="Link Twitter/X storefront."
            value={draft.twitter}
            onChangeText={value => setDraftField('twitter', value)}
            placeholder="https://twitter.com/..."
          />
          <KolamTextFieldRow
            label="YouTube"
            description="Link YouTube storefront."
            value={draft.youtube}
            onChangeText={value => setDraftField('youtube', value)}
            placeholder="https://youtube.com/..."
          />
          <KolamTextFieldRow
            label="TikTok"
            description="Link TikTok storefront."
            value={draft.tiktok}
            onChangeText={value => setDraftField('tiktok', value)}
            placeholder="https://tiktok.com/..."
          />
          <KolamToggleRow
            label="Staff desktop only"
            description="Batasi staff ke aplikasi desktop sesuai policy BE."
            active={draft.staffDesktopOnlyEnabled}
            onPress={() =>
              !disabled &&
              setDraftField(
                'staffDesktopOnlyEnabled',
                !draft.staffDesktopOnlyEnabled,
              )
            }
          />
          <KolamTextFieldRow
            label="Staff redirect URL"
            description="URL redirect jika staff desktop-only aktif."
            value={draft.staffDesktopOnlyRedirectUrl}
            onChangeText={value =>
              setDraftField('staffDesktopOnlyRedirectUrl', value)
            }
            placeholder="https://..."
          />
          <KolamToggleRow
            label="MAC access"
            description="Batasi akses Kolam berdasarkan daftar MAC address."
            active={draft.kolamMacAccessEnabled}
            onPress={() =>
              !disabled &&
              setDraftField(
                'kolamMacAccessEnabled',
                !draft.kolamMacAccessEnabled,
              )
            }
          />
          <KolamToggleRow
            label="Allow web browser"
            description="Izinkan browser web tetap masuk saat MAC access aktif."
            active={draft.kolamMacAccessAllowWebBrowser}
            onPress={() =>
              !disabled &&
              setDraftField(
                'kolamMacAccessAllowWebBrowser',
                !draft.kolamMacAccessAllowWebBrowser,
              )
            }
          />
          <KolamToggleRow
            label="Bypass super admin"
            description="Super admin tidak diblokir oleh validasi MAC."
            active={draft.kolamMacAccessBypassSuperAdmin}
            onPress={() =>
              !disabled &&
              setDraftField(
                'kolamMacAccessBypassSuperAdmin',
                !draft.kolamMacAccessBypassSuperAdmin,
              )
            }
          />
          <KolamTextFieldRow
            label="Allowed MAC addresses"
            description="Pisahkan dengan koma atau baris baru."
            value={draft.kolamMacAccessAllowedMacAddresses}
            onChangeText={value =>
              setDraftField('kolamMacAccessAllowedMacAddresses', value)
            }
            placeholder="AA:BB:CC:DD:EE:FF"
          />
          {showNotificationSettings ? (
            <>
              <KolamToggleRow
                label="Staff OTP login"
                description="Aktifkan OTP untuk login staff produksi."
                active={draft.staffOtpLoginEnabled}
                onPress={() =>
                  !disabled &&
                  setDraftField(
                    'staffOtpLoginEnabled',
                    !draft.staffOtpLoginEnabled,
                  )
                }
              />
              <KolamTextFieldRow
                label="OTP expire minutes"
                description="Durasi OTP aktif sebelum kadaluarsa."
                value={draft.staffOtpExpireMinutes}
                onChangeText={value =>
                  setDraftField('staffOtpExpireMinutes', value)
                }
                placeholder="10"
              />
              <KolamTextFieldRow
                label="OTP resend cooldown"
                description="Jeda detik sebelum OTP boleh dikirim ulang."
                value={draft.staffOtpResendCooldownSeconds}
                onChangeText={value =>
                  setDraftField('staffOtpResendCooldownSeconds', value)
                }
                placeholder="60"
              />
              <KolamTextFieldRow
                label="OTP max attempts"
                description="Batas percobaan OTP sebelum lock."
                value={draft.staffOtpMaxAttempts}
                onChangeText={value =>
                  setDraftField('staffOtpMaxAttempts', value)
                }
                placeholder="5"
              />
              <KolamTextFieldRow
                label="OTP lock minutes"
                description="Durasi lock setelah percobaan OTP melewati batas."
                value={draft.staffOtpLockMinutes}
                onChangeText={value =>
                  setDraftField('staffOtpLockMinutes', value)
                }
                placeholder="15"
              />
              <KolamTextFieldRow
                label="SMTP host"
                description="Host SMTP untuk email system."
                value={draft.smtpHost}
                onChangeText={value => setDraftField('smtpHost', value)}
                placeholder="smtp.gmail.com"
              />
              <KolamTextFieldRow
                label="SMTP port"
                description="Port SMTP produksi."
                value={draft.smtpPort}
                onChangeText={value => setDraftField('smtpPort', value)}
                placeholder="465"
              />
              <KolamTextFieldRow
                label="SMTP user"
                description="Username SMTP."
                value={draft.smtpUser}
                onChangeText={value => setDraftField('smtpUser', value)}
                placeholder="mailer@duniaanura.com"
              />
              <KolamTextFieldRow
                label="SMTP password"
                description="Biarkan ******** agar secret BE tidak dikirim ulang."
                value={draft.smtpPass}
                onChangeText={value => setDraftField('smtpPass', value)}
                placeholder="********"
              />
              <KolamTextFieldRow
                label="SMTP from email"
                description="Alamat pengirim email system."
                value={draft.smtpFromEmail}
                onChangeText={value => setDraftField('smtpFromEmail', value)}
                placeholder="no-reply@duniaanura.com"
              />
              <KolamTextFieldRow
                label="SMTP from name"
                description="Nama pengirim email system."
                value={draft.smtpFromName}
                onChangeText={value => setDraftField('smtpFromName', value)}
                placeholder="Kolam"
              />
              <KolamToggleRow
                label="SMTP secure"
                description="Gunakan koneksi SMTP secure."
                active={draft.smtpSecure}
                onPress={() =>
                  !disabled && setDraftField('smtpSecure', !draft.smtpSecure)
                }
              />
              <KolamToggleRow
                label="Firebase"
                description="Aktifkan Firebase Admin untuk notifikasi."
                active={draft.firebaseEnabled}
                onPress={() =>
                  !disabled &&
                  setDraftField('firebaseEnabled', !draft.firebaseEnabled)
                }
              />
              <KolamTextFieldRow
                label="Firebase project ID"
                description="Project ID Firebase produksi."
                value={draft.firebaseProjectId}
                onChangeText={value =>
                  setDraftField('firebaseProjectId', value)
                }
                placeholder="dunia-anura"
              />
              <KolamTextFieldRow
                label="Firebase client email"
                description="Client email service account."
                value={draft.firebaseClientEmail}
                onChangeText={value =>
                  setDraftField('firebaseClientEmail', value)
                }
                placeholder="firebase-adminsdk@..."
              />
              <KolamTextFieldRow
                label="Firebase private key"
                description="Biarkan ******** agar private key BE tidak dikirim ulang."
                value={draft.firebasePrivateKey}
                onChangeText={value =>
                  setDraftField('firebasePrivateKey', value)
                }
                placeholder="********"
              />
            </>
          ) : null}
          {showAiSettings ? (
            <>
              <KolamToggleRow
                label="Chat store"
                description="Aktifkan chat pada storefront."
                active={draft.chatStoreEnabled}
                onPress={() =>
                  !disabled &&
                  setDraftField('chatStoreEnabled', !draft.chatStoreEnabled)
                }
              />
              <KolamToggleRow
                label="Team chat group call"
                description="Aktifkan panggilan grup di team chat."
                active={draft.teamChatGroupCallEnabled}
                onPress={() =>
                  !disabled &&
                  setDraftField(
                    'teamChatGroupCallEnabled',
                    !draft.teamChatGroupCallEnabled,
                  )
                }
              />
              <KolamToggleRow
                label="DARA business"
                description="Aktifkan fitur bisnis DARA."
                active={draft.daraBusinessEnabled}
                onPress={() =>
                  !disabled &&
                  setDraftField(
                    'daraBusinessEnabled',
                    !draft.daraBusinessEnabled,
                  )
                }
              />
              <KolamToggleRow
                label="DARA tools"
                description="Aktifkan tool runtime DARA."
                active={draft.daraToolsEnabled}
                onPress={() =>
                  !disabled &&
                  setDraftField('daraToolsEnabled', !draft.daraToolsEnabled)
                }
              />
              <KolamToggleRow
                label="DARA knowledge"
                description="Aktifkan knowledge base DARA."
                active={draft.daraKnowledgeEnabled}
                onPress={() =>
                  !disabled &&
                  setDraftField(
                    'daraKnowledgeEnabled',
                    !draft.daraKnowledgeEnabled,
                  )
                }
              />
              <KolamToggleRow
                label="DARA tax"
                description="Aktifkan modul pajak DARA."
                active={draft.daraTaxEnabled}
                onPress={() =>
                  !disabled &&
                  setDraftField('daraTaxEnabled', !draft.daraTaxEnabled)
                }
              />
              <KolamToggleRow
                label="DARA SEO"
                description="Aktifkan fitur SEO DARA."
                active={draft.daraSeoEnabled}
                onPress={() =>
                  !disabled &&
                  setDraftField('daraSeoEnabled', !draft.daraSeoEnabled)
                }
              />
              <KolamToggleRow
                label="DARA handoff notify"
                description="Kirim notifikasi saat handoff customer."
                active={draft.daraHandoffNotifyEnabled}
                onPress={() =>
                  !disabled &&
                  setDraftField(
                    'daraHandoffNotifyEnabled',
                    !draft.daraHandoffNotifyEnabled,
                  )
                }
              />
              <KolamToggleRow
                label="DARA insights"
                description="Aktifkan insight otomatis DARA."
                active={draft.daraInsightsEnabled}
                onPress={() =>
                  !disabled &&
                  setDraftField(
                    'daraInsightsEnabled',
                    !draft.daraInsightsEnabled,
                  )
                }
              />
              <KolamToggleRow
                label="DARA auto report"
                description="Aktifkan laporan otomatis DARA."
                active={draft.daraAutoReportEnabled}
                onPress={() =>
                  !disabled &&
                  setDraftField(
                    'daraAutoReportEnabled',
                    !draft.daraAutoReportEnabled,
                  )
                }
              />
              <KolamToggleRow
                label="DARA image analysis"
                description="Aktifkan analisis gambar DARA."
                active={draft.daraImageAnalysisEnabled}
                onPress={() =>
                  !disabled &&
                  setDraftField(
                    'daraImageAnalysisEnabled',
                    !draft.daraImageAnalysisEnabled,
                  )
                }
              />
              <KolamToggleRow
                label="DARA tax watcher"
                description="Pantau regulasi pajak secara otomatis."
                active={draft.daraTaxRegulationWatcherEnabled}
                onPress={() =>
                  !disabled &&
                  setDraftField(
                    'daraTaxRegulationWatcherEnabled',
                    !draft.daraTaxRegulationWatcherEnabled,
                  )
                }
              />
              <KolamToggleRow
                label="DARA tax compliance"
                description="Aktifkan job kepatuhan pajak."
                active={draft.daraTaxComplianceJobEnabled}
                onPress={() =>
                  !disabled &&
                  setDraftField(
                    'daraTaxComplianceJobEnabled',
                    !draft.daraTaxComplianceJobEnabled,
                  )
                }
              />
              <KolamToggleRow
                label="DARA tax narrative"
                description="Aktifkan narasi LLM untuk pajak."
                active={draft.daraTaxLlmNarrativeEnabled}
                onPress={() =>
                  !disabled &&
                  setDraftField(
                    'daraTaxLlmNarrativeEnabled',
                    !draft.daraTaxLlmNarrativeEnabled,
                  )
                }
              />
              <KolamToggleRow
                label="DARA fulfillment"
                description="Aktifkan fulfillment webstore DARA."
                active={draft.daraWebstoreFulfillmentEnabled}
                onPress={() =>
                  !disabled &&
                  setDraftField(
                    'daraWebstoreFulfillmentEnabled',
                    !draft.daraWebstoreFulfillmentEnabled,
                  )
                }
              />
              <KolamToggleRow
                label="DARA staff ops"
                description="Aktifkan notifikasi operasional staff."
                active={draft.daraStaffOpsNotifyEnabled}
                onPress={() =>
                  !disabled &&
                  setDraftField(
                    'daraStaffOpsNotifyEnabled',
                    !draft.daraStaffOpsNotifyEnabled,
                  )
                }
              />
              <KolamToggleRow
                label="DARA staff WhatsApp"
                description="Aktifkan notifikasi WhatsApp staff."
                active={draft.daraStaffWaNotifyEnabled}
                onPress={() =>
                  !disabled &&
                  setDraftField(
                    'daraStaffWaNotifyEnabled',
                    !draft.daraStaffWaNotifyEnabled,
                  )
                }
              />
              <KolamToggleRow
                label="DARA olshop notify"
                description="Aktifkan notifikasi customer olshop."
                active={draft.daraOlshopCustomerNotifyEnabled}
                onPress={() =>
                  !disabled &&
                  setDraftField(
                    'daraOlshopCustomerNotifyEnabled',
                    !draft.daraOlshopCustomerNotifyEnabled,
                  )
                }
              />
              <KolamToggleRow
                label="DARA owner digest"
                description="Aktifkan ringkasan owner."
                active={draft.daraOwnerDigestEnabled}
                onPress={() =>
                  !disabled &&
                  setDraftField(
                    'daraOwnerDigestEnabled',
                    !draft.daraOwnerDigestEnabled,
                  )
                }
              />
              <KolamToggleRow
                label="DARA owner WhatsApp"
                description="Kirim digest owner melalui WhatsApp."
                active={draft.daraOwnerDigestWaEnabled}
                onPress={() =>
                  !disabled &&
                  setDraftField(
                    'daraOwnerDigestWaEnabled',
                    !draft.daraOwnerDigestWaEnabled,
                  )
                }
              />
              <KolamToggleRow
                label="DARA owner FCM"
                description="Kirim digest owner melalui FCM."
                active={draft.daraOwnerDigestFcmEnabled}
                onPress={() =>
                  !disabled &&
                  setDraftField(
                    'daraOwnerDigestFcmEnabled',
                    !draft.daraOwnerDigestFcmEnabled,
                  )
                }
              />
              <KolamToggleRow
                label="DARA urgent FCM"
                description="Kirim notifikasi urgent owner melalui FCM."
                active={draft.daraOwnerFcmUrgentEnabled}
                onPress={() =>
                  !disabled &&
                  setDraftField(
                    'daraOwnerFcmUrgentEnabled',
                    !draft.daraOwnerFcmUrgentEnabled,
                  )
                }
              />
            </>
          ) : null}
          {showNotificationSettings ? (
            <>
              <View style={styles.notificationSoundList}>
                {notificationSoundItems.map(item => {
                  const status = notificationSoundStatus[item.type] ?? 'idle';
                  const busy = status === 'uploading' || status === 'deleting';

                  return (
                    <View key={item.id} style={styles.notificationSoundRow}>
                      <KolamCopyStack
                        containerStyle={styles.notificationSoundCopy}
                        items={[
                          {
                            id: `${item.id}-label`,
                            text: item.label,
                            style: styles.notificationSoundLabel,
                          },
                          {
                            id: `${item.id}-path`,
                            text: item.value || '-',
                            style: styles.notificationSoundPath,
                          },
                        ]}
                      />
                      <View style={styles.notificationSoundActions}>
                        <KolamActionControlButton
                          label="Upload"
                          loading={status === 'uploading'}
                          loadingLabel="Uploading..."
                          disabled={disabled || busy}
                          onPress={() => onUploadNotificationSound(item.type)}
                        />
                        <KolamActionControlButton
                          label="Reset"
                          intent="danger"
                          loading={status === 'deleting'}
                          loadingLabel="Resetting..."
                          disabled={disabled || busy || !item.value}
                          onPress={() => onDeleteNotificationSound(item.type)}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          ) : null}
        </>
      ) : null}
      {showOperationalSettings ? (
        <>
          <KolamToggleRow
            label={fields[1].label}
            description={fields[1].description}
            active={draft.livechatOnline}
            onPress={() => {
              if (disabled) {
                return;
              }
              setDraftField('livechatOnline', !draft.livechatOnline);
              onToggleStorefrontEnabled();
            }}
          />
          <KolamToggleRow
            label={fields[2].label}
            description={fields[2].description}
            active={draft.maintenancePos}
            onPress={() => {
              if (disabled) {
                return;
              }
              setDraftField('maintenancePos', !draft.maintenancePos);
              onToggleMaintenanceMode();
            }}
          />
          <KolamToggleRow
            label="Marketplace maintenance"
            description="Aktifkan mode pemeliharaan untuk Marketplace."
            active={draft.maintenanceMarketplace}
            onPress={() =>
              !disabled &&
              setDraftField(
                'maintenanceMarketplace',
                !draft.maintenanceMarketplace,
              )
            }
          />
          <KolamToggleRow
            label="Google Sign-In webstore"
            description="Aktifkan OAuth Google untuk customer webstore."
            active={draft.webstoreGoogleAuthEnabled}
            onPress={() =>
              !disabled &&
              setDraftField(
                'webstoreGoogleAuthEnabled',
                !draft.webstoreGoogleAuthEnabled,
              )
            }
          />
          <KolamTextFieldRow
            label="Google OAuth client ID"
            description="OAuth 2.0 Web client ID untuk webstore."
            value={draft.googleOAuthClientId}
            onChangeText={value => setDraftField('googleOAuthClientId', value)}
            placeholder="xxxx.apps.googleusercontent.com"
          />
          <KolamCopyStack
            items={[
              {
                id: 'po-room-options',
                text: `Team Chat rooms: ${roomSummary}`,
              },
              {
                id: 'po-staff-options',
                text: `Staff picker: ${staffSummary}`,
              },
            ]}
          />
          <KolamTextFieldRow
            label="PO receiving room ID"
            description="Room Team Chat untuk alur penerimaan/QC PO."
            value={draft.poWorkflowReceivingRoomId}
            onChangeText={value =>
              setDraftField('poWorkflowReceivingRoomId', value)
            }
            placeholder="Team Chat room ID"
          />
          <KolamToggleRow
            label="PO notify on receive"
            description="Kirim notifikasi saat barang PO diterima."
            active={draft.poWorkflowNotifyOnReceive}
            onPress={() =>
              !disabled &&
              setDraftField(
                'poWorkflowNotifyOnReceive',
                !draft.poWorkflowNotifyOnReceive,
              )
            }
          />
          <KolamToggleRow
            label="PO notify on check"
            description="Kirim notifikasi saat QC/check PO berjalan."
            active={draft.poWorkflowNotifyOnCheck}
            onPress={() =>
              !disabled &&
              setDraftField(
                'poWorkflowNotifyOnCheck',
                !draft.poWorkflowNotifyOnCheck,
              )
            }
          />
          <KolamToggleRow
            label="PO notify on partial"
            description="Kirim notifikasi saat PO diterima sebagian."
            active={draft.poWorkflowNotifyOnPartial}
            onPress={() =>
              !disabled &&
              setDraftField(
                'poWorkflowNotifyOnPartial',
                !draft.poWorkflowNotifyOnPartial,
              )
            }
          />
          <KolamToggleRow
            label="PO post proof to Team Chat"
            description="Posting bukti penerimaan/QC ke room Team Chat."
            active={draft.poWorkflowPostProofToTeamChat}
            onPress={() =>
              !disabled &&
              setDraftField(
                'poWorkflowPostProofToTeamChat',
                !draft.poWorkflowPostProofToTeamChat,
              )
            }
          />
          <KolamToggleRow
            label="PO partial requires admin"
            description="Penerimaan sebagian wajib approval admin."
            active={draft.poWorkflowPartialCompleteRequiresAdmin}
            onPress={() =>
              !disabled &&
              setDraftField(
                'poWorkflowPartialCompleteRequiresAdmin',
                !draft.poWorkflowPartialCompleteRequiresAdmin,
              )
            }
          />
          <KolamTextFieldRow
            label="PO receive notify user IDs"
            description="User ID penerima notif receive, pisahkan koma atau baris baru."
            value={draft.poWorkflowNotifyReceiveUserIds}
            onChangeText={value =>
              setDraftField('poWorkflowNotifyReceiveUserIds', value)
            }
            placeholder="userId1, userId2"
          />
          <KolamTextFieldRow
            label="PO check notify user IDs"
            description="User ID penerima notif check/QC."
            value={draft.poWorkflowNotifyCheckUserIds}
            onChangeText={value =>
              setDraftField('poWorkflowNotifyCheckUserIds', value)
            }
            placeholder="userId1, userId2"
          />
          <KolamTextFieldRow
            label="PO complete notify user IDs"
            description="User ID penerima notif complete."
            value={draft.poWorkflowNotifyCompleteUserIds}
            onChangeText={value =>
              setDraftField('poWorkflowNotifyCompleteUserIds', value)
            }
            placeholder="userId1, userId2"
          />
          <KolamTextFieldRow
            label="Attendance payroll cutoff day"
            description="Tanggal cutoff payroll bulanan."
            value={draft.staffAttendancePayrollCutoffDay}
            onChangeText={value =>
              setDraftField('staffAttendancePayrollCutoffDay', value)
            }
            placeholder="28"
          />
          <KolamTextFieldRow
            label="Attendance work start"
            description="Jam mulai kerja default."
            value={draft.staffAttendanceWorkStartTime}
            onChangeText={value =>
              setDraftField('staffAttendanceWorkStartTime', value)
            }
            placeholder="08:00"
          />
          <KolamTextFieldRow
            label="Attendance work end"
            description="Jam selesai kerja default."
            value={draft.staffAttendanceWorkEndTime}
            onChangeText={value =>
              setDraftField('staffAttendanceWorkEndTime', value)
            }
            placeholder="17:00"
          />
          <KolamTextFieldRow
            label="Attendance timezone"
            description="Timezone untuk perhitungan absensi."
            value={draft.staffAttendanceTimezone}
            onChangeText={value =>
              setDraftField('staffAttendanceTimezone', value)
            }
            placeholder="Asia/Jakarta"
          />
          <KolamTextFieldRow
            label="Attendance late tolerance"
            description="Menit toleransi keterlambatan."
            value={draft.staffAttendanceLateToleranceMinutes}
            onChangeText={value =>
              setDraftField('staffAttendanceLateToleranceMinutes', value)
            }
            placeholder="15"
          />
          <KolamTextFieldRow
            label="Attendance tier 2 max"
            description="Batas menit tier keterlambatan kedua."
            value={draft.staffAttendanceLateTier2MaxMinutes}
            onChangeText={value =>
              setDraftField('staffAttendanceLateTier2MaxMinutes', value)
            }
            placeholder="120"
          />
          <KolamTextFieldRow
            label="Attendance check-in deadline"
            description="Batas menit clock-in terlambat."
            value={draft.staffAttendanceLateCheckInDeadlineMinutes}
            onChangeText={value =>
              setDraftField('staffAttendanceLateCheckInDeadlineMinutes', value)
            }
            placeholder="240"
          />
          <KolamTextFieldRow
            label="Attendance late fine tier 2"
            description="Nominal denda tier 2."
            value={draft.staffAttendanceLateFineTier2}
            onChangeText={value =>
              setDraftField('staffAttendanceLateFineTier2', value)
            }
            placeholder="50000"
          />
          <KolamTextFieldRow
            label="Attendance late fine tier 3"
            description="Nominal denda tier 3."
            value={draft.staffAttendanceLateFineTier3}
            onChangeText={value =>
              setDraftField('staffAttendanceLateFineTier3', value)
            }
            placeholder="100000"
          />
          <KolamTextFieldRow
            label="Attendance absent divisor"
            description="Pembagi harian untuk potongan absen."
            value={draft.staffAttendanceAbsentDailyDivisor}
            onChangeText={value =>
              setDraftField('staffAttendanceAbsentDailyDivisor', value)
            }
            placeholder="30"
          />
          <KolamTextFieldRow
            label="Attendance map provider"
            description="Isi openstreetmap atau google."
            value={draft.staffAttendanceMapProvider}
            onChangeText={value =>
              setDraftField('staffAttendanceMapProvider', value)
            }
            placeholder="openstreetmap"
          />
          <KolamToggleRow
            label="Attendance require GPS"
            description="Wajibkan lokasi GPS saat clock-in/out."
            active={draft.staffAttendanceRequireGps}
            onPress={() =>
              !disabled &&
              setDraftField(
                'staffAttendanceRequireGps',
                !draft.staffAttendanceRequireGps,
              )
            }
          />
          <KolamToggleRow
            label="Attendance require face"
            description="Wajibkan face match saat clock-in/out."
            active={draft.staffAttendanceRequireFace}
            onPress={() =>
              !disabled &&
              setDraftField(
                'staffAttendanceRequireFace',
                !draft.staffAttendanceRequireFace,
              )
            }
          />
          <KolamTextFieldRow
            label="Attendance face threshold"
            description="Ambang face match 0.5 sampai 0.99."
            value={draft.staffAttendanceFaceMatchThreshold}
            onChangeText={value =>
              setDraftField('staffAttendanceFaceMatchThreshold', value)
            }
            placeholder="0.72"
          />
        </>
      ) : null}
      {showFinancialTaxSummary ? (
        <View style={styles.marketplaceOverview}>
          <KolamCopyStack
            items={[
              {
                id: 'financial-title',
                text: 'Finansial / Pajak Summary',
                style: styles.marketplaceOverviewTitle,
              },
              {
                id: 'financial-status',
                text: 'Read-only live summary. Update editor ditunda sampai kontrak endpoint/body final.',
                style: styles.marketplaceOverviewMeta,
              },
            ]}
          />
          <View style={styles.marketplaceOverviewRows}>
            {financialSummaryRows.map(row => (
              <View key={row.id} style={styles.marketplaceOverviewRow}>
                <KolamCopyStack
                  containerStyle={styles.marketplaceOverviewCopy}
                  items={[
                    {
                      id: `${row.id}-label`,
                      text: row.label,
                      style: styles.marketplaceOverviewLabel,
                    },
                    {
                      id: `${row.id}-detail`,
                      text: row.detail,
                      style: styles.marketplaceOverviewDetail,
                    },
                  ]}
                />
                <KolamCopyStack
                  items={[
                    {
                      id: `${row.id}-value`,
                      text: row.value,
                      style: styles.marketplaceOverviewValue,
                    },
                  ]}
                />
              </View>
            ))}
          </View>
        </View>
      ) : null}
      {showAiSettings ? (
        <>
          <KolamCopyStack
            items={[
              {
                id: 'ai-plugin-gate',
                text:
                  chatPluginEnabled && daraPluginEnabled
                    ? 'Plugin Chat dan DARA aktif. Kontrol AI siap disimpan ke Web Settings.'
                    : `Disabled state: ${
                        chatPluginEnabled ? '' : 'Plugin Chat nonaktif. '
                      }${
                        daraPluginEnabled ? '' : 'Plugin DARA nonaktif. '
                      }Aktifkan dari tab Plugin untuk mengubah kontrol terkait.`,
              },
            ]}
          />
          <KolamToggleRow
            label="Chat store"
            description="Aktifkan chat pada storefront."
            active={draft.chatStoreEnabled}
            onPress={() =>
              !chatControlsDisabled &&
              setDraftField('chatStoreEnabled', !draft.chatStoreEnabled)
            }
          />
          <KolamToggleRow
            label="Team chat group call"
            description="Aktifkan panggilan grup di team chat."
            active={draft.teamChatGroupCallEnabled}
            onPress={() =>
              !chatControlsDisabled &&
              setDraftField(
                'teamChatGroupCallEnabled',
                !draft.teamChatGroupCallEnabled,
              )
            }
          />
          <KolamToggleRow
            label="Team Chat DARA reply"
            description="Aktifkan balasan @dara di Team Chat."
            active={draft.teamChatDaraReplyEnabled}
            onPress={() =>
              !daraChatControlsDisabled &&
              setDraftField(
                'teamChatDaraReplyEnabled',
                !draft.teamChatDaraReplyEnabled,
              )
            }
          />
          <KolamToggleRow
            label="DARA business"
            description="Aktifkan fitur bisnis DARA."
            active={draft.daraBusinessEnabled}
            onPress={() =>
              !daraControlsDisabled &&
              setDraftField('daraBusinessEnabled', !draft.daraBusinessEnabled)
            }
          />
          <KolamToggleRow
            label="DARA tools"
            description="Aktifkan tool runtime DARA."
            active={draft.daraToolsEnabled}
            onPress={() =>
              !daraControlsDisabled &&
              setDraftField('daraToolsEnabled', !draft.daraToolsEnabled)
            }
          />
          <KolamToggleRow
            label="DARA knowledge / SOP"
            description="Aktifkan knowledge base dan SOP lookup DARA."
            active={draft.daraKnowledgeEnabled}
            onPress={() =>
              !daraControlsDisabled &&
              setDraftField('daraKnowledgeEnabled', !draft.daraKnowledgeEnabled)
            }
          />
          <KolamToggleRow
            label="DARA handoff notify"
            description="Kirim notifikasi saat handoff customer."
            active={draft.daraHandoffNotifyEnabled}
            onPress={() =>
              !daraControlsDisabled &&
              setDraftField(
                'daraHandoffNotifyEnabled',
                !draft.daraHandoffNotifyEnabled,
              )
            }
          />
          <KolamToggleRow
            label="DARA insights"
            description="Aktifkan insight otomatis DARA."
            active={draft.daraInsightsEnabled}
            onPress={() =>
              !daraControlsDisabled &&
              setDraftField('daraInsightsEnabled', !draft.daraInsightsEnabled)
            }
          />
          <KolamToggleRow
            label="DARA auto report"
            description="Aktifkan laporan otomatis DARA."
            active={draft.daraAutoReportEnabled}
            onPress={() =>
              !daraControlsDisabled &&
              setDraftField(
                'daraAutoReportEnabled',
                !draft.daraAutoReportEnabled,
              )
            }
          />
          <KolamToggleRow
            label="DARA image analysis"
            description="Aktifkan analisis gambar DARA."
            active={draft.daraImageAnalysisEnabled}
            onPress={() =>
              !daraControlsDisabled &&
              setDraftField(
                'daraImageAnalysisEnabled',
                !draft.daraImageAnalysisEnabled,
              )
            }
          />
          <KolamToggleRow
            label="DARA tax"
            description="Aktifkan modul pajak DARA."
            active={draft.daraTaxEnabled}
            onPress={() =>
              !daraControlsDisabled &&
              setDraftField('daraTaxEnabled', !draft.daraTaxEnabled)
            }
          />
          <KolamToggleRow
            label="DARA SEO"
            description="Aktifkan fitur SEO DARA."
            active={draft.daraSeoEnabled}
            onPress={() =>
              !daraControlsDisabled &&
              setDraftField('daraSeoEnabled', !draft.daraSeoEnabled)
            }
          />
          <KolamToggleRow
            label="DARA tax watcher"
            description="Pantau regulasi pajak secara otomatis."
            active={draft.daraTaxRegulationWatcherEnabled}
            onPress={() =>
              !daraControlsDisabled &&
              setDraftField(
                'daraTaxRegulationWatcherEnabled',
                !draft.daraTaxRegulationWatcherEnabled,
              )
            }
          />
          <KolamToggleRow
            label="DARA tax compliance"
            description="Aktifkan job kepatuhan pajak."
            active={draft.daraTaxComplianceJobEnabled}
            onPress={() =>
              !daraControlsDisabled &&
              setDraftField(
                'daraTaxComplianceJobEnabled',
                !draft.daraTaxComplianceJobEnabled,
              )
            }
          />
          <KolamToggleRow
            label="DARA tax narrative"
            description="Aktifkan narasi LLM untuk pajak."
            active={draft.daraTaxLlmNarrativeEnabled}
            onPress={() =>
              !daraControlsDisabled &&
              setDraftField(
                'daraTaxLlmNarrativeEnabled',
                !draft.daraTaxLlmNarrativeEnabled,
              )
            }
          />
          <KolamToggleRow
            label="DARA fulfillment"
            description="Aktifkan fulfillment webstore DARA."
            active={draft.daraWebstoreFulfillmentEnabled}
            onPress={() =>
              !daraControlsDisabled &&
              setDraftField(
                'daraWebstoreFulfillmentEnabled',
                !draft.daraWebstoreFulfillmentEnabled,
              )
            }
          />
          <KolamToggleRow
            label="DARA staff ops"
            description="Aktifkan notifikasi operasional staff."
            active={draft.daraStaffOpsNotifyEnabled}
            onPress={() =>
              !daraControlsDisabled &&
              setDraftField(
                'daraStaffOpsNotifyEnabled',
                !draft.daraStaffOpsNotifyEnabled,
              )
            }
          />
          <KolamToggleRow
            label="DARA staff WhatsApp"
            description="Aktifkan notifikasi WhatsApp staff."
            active={draft.daraStaffWaNotifyEnabled}
            onPress={() =>
              !daraControlsDisabled &&
              setDraftField(
                'daraStaffWaNotifyEnabled',
                !draft.daraStaffWaNotifyEnabled,
              )
            }
          />
          <KolamToggleRow
            label="DARA olshop notify"
            description="Aktifkan notifikasi customer olshop."
            active={draft.daraOlshopCustomerNotifyEnabled}
            onPress={() =>
              !daraControlsDisabled &&
              setDraftField(
                'daraOlshopCustomerNotifyEnabled',
                !draft.daraOlshopCustomerNotifyEnabled,
              )
            }
          />
          <KolamToggleRow
            label="DARA owner digest"
            description="Aktifkan ringkasan owner."
            active={draft.daraOwnerDigestEnabled}
            onPress={() =>
              !daraControlsDisabled &&
              setDraftField(
                'daraOwnerDigestEnabled',
                !draft.daraOwnerDigestEnabled,
              )
            }
          />
          <KolamToggleRow
            label="DARA owner WhatsApp"
            description="Kirim digest owner melalui WhatsApp."
            active={draft.daraOwnerDigestWaEnabled}
            onPress={() =>
              !daraControlsDisabled &&
              setDraftField(
                'daraOwnerDigestWaEnabled',
                !draft.daraOwnerDigestWaEnabled,
              )
            }
          />
          <KolamToggleRow
            label="DARA owner FCM"
            description="Kirim digest owner melalui FCM."
            active={draft.daraOwnerDigestFcmEnabled}
            onPress={() =>
              !daraControlsDisabled &&
              setDraftField(
                'daraOwnerDigestFcmEnabled',
                !draft.daraOwnerDigestFcmEnabled,
              )
            }
          />
          <KolamToggleRow
            label="DARA urgent FCM"
            description="Kirim notifikasi urgent owner melalui FCM."
            active={draft.daraOwnerFcmUrgentEnabled}
            onPress={() =>
              !daraControlsDisabled &&
              setDraftField(
                'daraOwnerFcmUrgentEnabled',
                !draft.daraOwnerFcmUrgentEnabled,
              )
            }
          />
        </>
      ) : null}
      {showStoreShippingSettings ? (
        <>
          <KolamTextFieldRow
            label="Biteship API key"
            description="Biarkan ******** agar secret BE tidak dikirim ulang."
            value={draft.biteshipApiKey}
            onChangeText={value => setDraftField('biteshipApiKey', value)}
            placeholder="********"
          />
          <KolamTextFieldRow
            label="Google Maps browser key"
            description="Biarkan ******** agar secret BE tidak dikirim ulang."
            value={draft.googleMapsBrowserApiKey}
            onChangeText={value =>
              setDraftField('googleMapsBrowserApiKey', value)
            }
            placeholder="********"
          />
          <KolamTextFieldRow
            label="Origin Address"
            description="Alamat asal pengiriman."
            value={draft.originAddressLine1}
            onChangeText={value => setDraftField('originAddressLine1', value)}
            placeholder="Jl. Taman Ratu Raya No.34"
          />
          <KolamTextFieldRow
            label="Origin City"
            description="Kota asal pengiriman."
            value={draft.originCity}
            onChangeText={value => setDraftField('originCity', value)}
            placeholder="Jakarta Barat"
          />
          <KolamTextFieldRow
            label="Origin Province"
            description="Provinsi asal pengiriman."
            value={draft.originProvince}
            onChangeText={value => setDraftField('originProvince', value)}
            placeholder="DKI Jakarta"
          />
          <KolamTextFieldRow
            label="Origin Postal Code"
            description="Kode pos asal pengiriman."
            value={draft.originPostalCode}
            onChangeText={value => setDraftField('originPostalCode', value)}
            placeholder="11550"
          />
          <KolamTextFieldRow
            label="Origin Latitude"
            description="Koordinat latitude origin."
            value={draft.originLatitude}
            onChangeText={value => setDraftField('originLatitude', value)}
            placeholder="-6.1687829"
          />
          <KolamTextFieldRow
            label="Origin Longitude"
            description="Koordinat longitude origin."
            value={draft.originLongitude}
            onChangeText={value => setDraftField('originLongitude', value)}
            placeholder="106.7676678"
          />
          <KolamCopyStack
            items={[
              {
                id: 'native-map-planned',
                text: 'Map native planned: gunakan latitude/longitude sebagai fallback koordinat produksi.',
              },
            ]}
          />
          <KolamToggleRow
            label="Store operating hours"
            description="Aktifkan jadwal toko untuk fulfillment dan DARA."
            active={draft.storeOperatingHoursEnabled}
            onPress={() =>
              !disabled &&
              setDraftField(
                'storeOperatingHoursEnabled',
                !draft.storeOperatingHoursEnabled,
              )
            }
          />
          <KolamToggleRow
            label="DARA reply when closed"
            description="DARA membalas status tutup berdasarkan jam operasional."
            active={draft.storeOperatingHoursDaraReplyWhenClosed}
            onPress={() =>
              !disabled &&
              setDraftField(
                'storeOperatingHoursDaraReplyWhenClosed',
                !draft.storeOperatingHoursDaraReplyWhenClosed,
              )
            }
          />
          <KolamTextFieldRow
            label="Timezone"
            description="Timezone jadwal toko."
            value={draft.storeOperatingHoursTimezone}
            onChangeText={value =>
              setDraftField('storeOperatingHoursTimezone', value)
            }
            placeholder="Asia/Jakarta"
          />
          <View style={styles.storeHoursList}>
            {storeOperatingHourRows.map(row => {
              const isOpen = draft[row.openField] === true;

              return (
                <View key={row.id} style={styles.storeHoursRow}>
                  <KolamToggleRow
                    label={`${row.label} open`}
                    description="Status buka pada hari ini."
                    active={isOpen}
                    onPress={() =>
                      !disabled && setDraftField(row.openField, !isOpen)
                    }
                  />
                  <View style={styles.storeHoursTimeGrid}>
                    <KolamTextFieldRow
                      label={`${row.label} open at`}
                      description="Jam buka format HH:mm."
                      value={String(draft[row.openAtField] ?? '')}
                      onChangeText={value =>
                        setDraftField(row.openAtField, value)
                      }
                      placeholder="09:00"
                    />
                    <KolamTextFieldRow
                      label={`${row.label} close at`}
                      description="Jam tutup format HH:mm."
                      value={String(draft[row.closeAtField] ?? '')}
                      onChangeText={value =>
                        setDraftField(row.closeAtField, value)
                      }
                      placeholder="21:00"
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </>
      ) : null}
      {showNotificationSettings ? (
        <>
          <KolamToggleRow
            label="DARA handoff notify"
            description="Kirim notifikasi saat handoff customer."
            active={draft.daraHandoffNotifyEnabled}
            onPress={() =>
              !disabled &&
              setDraftField(
                'daraHandoffNotifyEnabled',
                !draft.daraHandoffNotifyEnabled,
              )
            }
          />
          <KolamToggleRow
            label="Team chat group call"
            description="Aktifkan panggilan grup di team chat."
            active={draft.teamChatGroupCallEnabled}
            onPress={() =>
              !disabled &&
              setDraftField(
                'teamChatGroupCallEnabled',
                !draft.teamChatGroupCallEnabled,
              )
            }
          />
          <KolamToggleRow
            label="Staff OTP login"
            description="Aktifkan OTP untuk login staff produksi."
            active={draft.staffOtpLoginEnabled}
            onPress={() =>
              !disabled &&
              setDraftField('staffOtpLoginEnabled', !draft.staffOtpLoginEnabled)
            }
          />
          <KolamTextFieldRow
            label="OTP expire minutes"
            description="Durasi OTP aktif sebelum kadaluarsa."
            value={draft.staffOtpExpireMinutes}
            onChangeText={value =>
              setDraftField('staffOtpExpireMinutes', value)
            }
            placeholder="10"
          />
          <KolamTextFieldRow
            label="OTP resend cooldown"
            description="Jeda detik sebelum OTP boleh dikirim ulang."
            value={draft.staffOtpResendCooldownSeconds}
            onChangeText={value =>
              setDraftField('staffOtpResendCooldownSeconds', value)
            }
            placeholder="60"
          />
          <KolamTextFieldRow
            label="OTP max attempts"
            description="Batas percobaan OTP sebelum lock."
            value={draft.staffOtpMaxAttempts}
            onChangeText={value => setDraftField('staffOtpMaxAttempts', value)}
            placeholder="5"
          />
          <KolamTextFieldRow
            label="OTP lock minutes"
            description="Durasi lock setelah percobaan OTP melewati batas."
            value={draft.staffOtpLockMinutes}
            onChangeText={value => setDraftField('staffOtpLockMinutes', value)}
            placeholder="15"
          />
          <KolamTextFieldRow
            label="SMTP host"
            description="Host SMTP untuk email system."
            value={draft.smtpHost}
            onChangeText={value => setDraftField('smtpHost', value)}
            placeholder="smtp.gmail.com"
          />
          <KolamTextFieldRow
            label="SMTP port"
            description="Port SMTP produksi."
            value={draft.smtpPort}
            onChangeText={value => setDraftField('smtpPort', value)}
            placeholder="465"
          />
          <KolamTextFieldRow
            label="SMTP user"
            description="Username SMTP."
            value={draft.smtpUser}
            onChangeText={value => setDraftField('smtpUser', value)}
            placeholder="mailer@duniaanura.com"
          />
          <KolamTextFieldRow
            label="SMTP password"
            description="Biarkan ******** agar secret BE tidak dikirim ulang."
            value={draft.smtpPass}
            onChangeText={value => setDraftField('smtpPass', value)}
            placeholder="********"
          />
          <KolamTextFieldRow
            label="SMTP from email"
            description="Alamat pengirim email system."
            value={draft.smtpFromEmail}
            onChangeText={value => setDraftField('smtpFromEmail', value)}
            placeholder="no-reply@duniaanura.com"
          />
          <KolamTextFieldRow
            label="SMTP from name"
            description="Nama pengirim email system."
            value={draft.smtpFromName}
            onChangeText={value => setDraftField('smtpFromName', value)}
            placeholder="Kolam"
          />
          <KolamToggleRow
            label="SMTP secure"
            description="Gunakan koneksi SMTP secure."
            active={draft.smtpSecure}
            onPress={() =>
              !disabled && setDraftField('smtpSecure', !draft.smtpSecure)
            }
          />
          <KolamToggleRow
            label="Firebase"
            description="Aktifkan Firebase Admin untuk notifikasi."
            active={draft.firebaseEnabled}
            onPress={() =>
              !disabled &&
              setDraftField('firebaseEnabled', !draft.firebaseEnabled)
            }
          />
          <KolamTextFieldRow
            label="Firebase project ID"
            description="Project ID Firebase produksi."
            value={draft.firebaseProjectId}
            onChangeText={value => setDraftField('firebaseProjectId', value)}
            placeholder="dunia-anura"
          />
          <KolamTextFieldRow
            label="Firebase client email"
            description="Client email service account."
            value={draft.firebaseClientEmail}
            onChangeText={value => setDraftField('firebaseClientEmail', value)}
            placeholder="firebase-adminsdk@..."
          />
          <KolamTextFieldRow
            label="Firebase private key"
            description="Biarkan ******** agar private key BE tidak dikirim ulang."
            value={draft.firebasePrivateKey}
            onChangeText={value => setDraftField('firebasePrivateKey', value)}
            placeholder="********"
          />
          <View style={styles.notificationSoundList}>
            {notificationSoundItems.map(item => {
              const status = notificationSoundStatus[item.type] ?? 'idle';
              const busy = status === 'uploading' || status === 'deleting';

              return (
                <View key={item.id} style={styles.notificationSoundRow}>
                  <KolamCopyStack
                    containerStyle={styles.notificationSoundCopy}
                    items={[
                      {
                        id: `${item.id}-label`,
                        text: item.label,
                        style: styles.notificationSoundLabel,
                      },
                      {
                        id: `${item.id}-path`,
                        text: item.value || '-',
                        style: styles.notificationSoundPath,
                      },
                    ]}
                  />
                  <View style={styles.notificationSoundActions}>
                    <KolamActionControlButton
                      label="Upload"
                      loading={status === 'uploading'}
                      loadingLabel="Uploading..."
                      disabled={disabled || busy}
                      onPress={() => onUploadNotificationSound(item.type)}
                    />
                    <KolamActionControlButton
                      label="Reset"
                      intent="danger"
                      loading={status === 'deleting'}
                      loadingLabel="Resetting..."
                      disabled={disabled || busy || !item.value}
                      onPress={() => onDeleteNotificationSound(item.type)}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </>
      ) : null}
      {showGeneralSettings ||
      showOperationalSettings ||
      showStoreShippingSettings ||
      showAiSettings ||
      showNotificationSettings ? (
        <>
          <KolamActionControlButton
            label="Save"
            loading={saveStatus === 'saving'}
            loadingLabel="Saving..."
            intent="primary"
            onPress={disabled ? undefined : onSave}
          />
          {saveMessage ? (
            <KolamCopyStack
              items={[
                {
                  id: 'save-message',
                  text: saveMessage,
                },
              ]}
            />
          ) : null}
        </>
      ) : null}
      {showPluginControls ? (
        <>
          <KolamToggleRow
            label="Plugin Enclosure"
            description="Aktifkan route dan registry plugin enclosure."
            active={draft.pluginControls.enclosure}
            onPress={() =>
              !disabled &&
              onPluginControlChange(
                'enclosure',
                !draft.pluginControls.enclosure,
              )
            }
          />
          <KolamToggleRow
            label="Plugin Task Manager"
            description="Aktifkan route dan registry plugin manajemen tugas."
            active={draft.pluginControls.taskManager}
            onPress={() =>
              !disabled &&
              onPluginControlChange(
                'taskManager',
                !draft.pluginControls.taskManager,
              )
            }
          />
          <KolamToggleRow
            label="Plugin Layanan"
            description="Aktifkan route dan registry plugin layanan."
            active={draft.pluginControls.layanan}
            onPress={() =>
              !disabled &&
              onPluginControlChange('layanan', !draft.pluginControls.layanan)
            }
          />
          <KolamToggleRow
            label="Plugin Freyer"
            description="Aktifkan route dan registry plugin Freyer."
            active={draft.pluginControls.freyer}
            onPress={() =>
              !disabled &&
              onPluginControlChange('freyer', !draft.pluginControls.freyer)
            }
          />
          <KolamToggleRow
            label="Plugin KPI"
            description="Aktifkan route dan registry plugin KPI."
            active={draft.pluginControls.kpi}
            onPress={() =>
              !disabled &&
              onPluginControlChange('kpi', !draft.pluginControls.kpi)
            }
          />
          <KolamToggleRow
            label="Plugin Chat"
            description="Aktifkan route dan registry plugin chat."
            active={draft.pluginControls.chat}
            onPress={() =>
              !disabled &&
              onPluginControlChange('chat', !draft.pluginControls.chat)
            }
          />
          <KolamToggleRow
            label="Plugin DARA"
            description="Aktifkan route dan registry plugin DARA."
            active={draft.pluginControls.dara}
            onPress={() =>
              !disabled &&
              onPluginControlChange('dara', !draft.pluginControls.dara)
            }
          />
          <KolamToggleRow
            label="Plugin Proyek"
            description="Aktifkan route dan registry plugin proyek."
            active={draft.pluginControls.proyek}
            onPress={() =>
              !disabled &&
              onPluginControlChange('proyek', !draft.pluginControls.proyek)
            }
          />
          <KolamActionControlButton
            label="Save"
            loading={saveStatus === 'saving'}
            loadingLabel="Saving..."
            intent="primary"
            onPress={disabled ? undefined : onSave}
          />
          {saveMessage ? (
            <KolamCopyStack
              items={[
                {
                  id: 'save-message',
                  text: saveMessage,
                },
              ]}
            />
          ) : null}
        </>
      ) : null}
      {showMarketplaceLanding ? (
        <>
          <MarketplaceLandingOverviewPanel
            assetStatus={marketplaceLandingAssetStatus}
            disabled={disabled || marketplaceLandingSaveStatus === 'saving'}
            onDeleteAnnouncementBanner={onDeleteMarketplaceAnnouncementBanner}
            onDeleteBioactiveStep={onDeleteMarketplaceBioactiveStep}
            onDeleteCategoryBanner={onDeleteMarketplaceCategoryBanner}
            onDeleteFeaturedCollection={onDeleteMarketplaceFeaturedCollection}
            onDeleteHeroSlide={onDeleteMarketplaceHeroSlide}
            onMoveAnnouncementBanner={onMoveMarketplaceAnnouncementBanner}
            onMoveBioactiveStep={onMoveMarketplaceBioactiveStep}
            onMoveCategoryBanner={onMoveMarketplaceCategoryBanner}
            onMoveFeaturedCollection={onMoveMarketplaceFeaturedCollection}
            onMoveHeroSlide={onMoveMarketplaceHeroSlide}
            onUploadAnnouncementImage={onUploadMarketplaceAnnouncementImage}
            onUploadBioactiveStepImage={onUploadMarketplaceBioactiveStepImage}
            onUploadCategoryBannerImage={onUploadMarketplaceCategoryBannerImage}
            onUploadCtaBackground={onUploadMarketplaceCtaBackground}
            onUploadDaraAvatar={onUploadMarketplaceDaraAvatar}
            onUploadFeaturedCollectionImage={
              onUploadMarketplaceFeaturedCollectionImage
            }
            onUploadHeroImage={onUploadMarketplaceHeroImage}
            onUploadLogo={onUploadMarketplaceLogo}
            onUploadYoutubeBackground={onUploadMarketplaceYoutubeBackground}
            overview={marketplaceLandingOverview}
          />
          <MarketplaceLandingControlsPanel
            ctaDraft={marketplaceLandingCtaDraft}
            disabled={disabled || marketplaceLandingSaveStatus === 'saving'}
            message={marketplaceLandingMessage}
            noticeDraft={marketplaceLandingNoticeDraft}
            notices={marketplaceLandingOverview.customerNotices}
            onClearNoticeDraft={onClearMarketplaceLandingNoticeDraft}
            onDeleteNotice={onDeleteMarketplaceLandingNotice}
            onEditNotice={onEditMarketplaceLandingNotice}
            onSaveCta={onSaveMarketplaceLandingCta}
            onSaveNotice={onSaveMarketplaceLandingNotice}
            onSaveYoutube={onSaveMarketplaceLandingYoutube}
            saveStatus={marketplaceLandingSaveStatus}
            setCtaDraftField={setMarketplaceLandingCtaDraftField}
            setNoticeDraftField={setMarketplaceLandingNoticeDraftField}
            setYoutubeDraftField={setMarketplaceLandingYoutubeDraftField}
            youtubeDraft={marketplaceLandingYoutubeDraft}
          />
        </>
      ) : null}
      {showGeneralSettings ? (
        <KolamSettingsWebFormSections sections={generalFormSections} />
      ) : null}
    </KolamContentFrame>
  );
}

function MarketplaceLandingOverviewPanel({
  assetStatus,
  disabled,
  onDeleteAnnouncementBanner,
  onDeleteBioactiveStep,
  onDeleteCategoryBanner,
  onDeleteFeaturedCollection,
  onDeleteHeroSlide,
  onMoveAnnouncementBanner,
  onMoveBioactiveStep,
  onMoveCategoryBanner,
  onMoveFeaturedCollection,
  onMoveHeroSlide,
  onUploadAnnouncementImage,
  onUploadBioactiveStepImage,
  onUploadCategoryBannerImage,
  onUploadCtaBackground,
  onUploadDaraAvatar,
  onUploadFeaturedCollectionImage,
  onUploadHeroImage,
  onUploadLogo,
  onUploadYoutubeBackground,
  overview,
}: {
  assetStatus: Partial<
    Record<string, 'idle' | 'uploading' | 'deleting' | 'reordering'>
  >;
  disabled: boolean;
  onDeleteAnnouncementBanner: (banner: KolamAnnouncementBanner) => void;
  onDeleteBioactiveStep: (index: number) => void;
  onDeleteCategoryBanner: (banner: KolamCategoryBanner) => void;
  onDeleteFeaturedCollection: (index: number) => void;
  onDeleteHeroSlide: (slide: KolamHeroSlide) => void;
  onMoveAnnouncementBanner: (
    banner: KolamAnnouncementBanner,
    direction: -1 | 1,
  ) => void;
  onMoveBioactiveStep: (index: number, direction: -1 | 1) => void;
  onMoveCategoryBanner: (
    banner: KolamCategoryBanner,
    direction: -1 | 1,
  ) => void;
  onMoveFeaturedCollection: (index: number, direction: -1 | 1) => void;
  onMoveHeroSlide: (slide: KolamHeroSlide, direction: -1 | 1) => void;
  onUploadAnnouncementImage: (banner: KolamAnnouncementBanner) => void;
  onUploadBioactiveStepImage: (index: number) => void;
  onUploadCategoryBannerImage: (banner: KolamCategoryBanner) => void;
  onUploadCtaBackground: () => void;
  onUploadDaraAvatar: () => void;
  onUploadFeaturedCollectionImage: (index: number) => void;
  onUploadHeroImage: (slide: KolamHeroSlide) => void;
  onUploadLogo: () => void;
  onUploadYoutubeBackground: () => void;
  overview: MarketplaceLandingOverview;
}) {
  const featuredCollections =
    overview.marketplaceContent.featuredCollections ?? [];
  const bioactiveSteps =
    overview.marketplaceContent.bioactiveEcosystem?.steps ?? [];
  const rows = [
    {
      id: 'hero-slides',
      label: 'Hero slides',
      value: getCollectionSummary(overview.heroSlides),
      detail: getFirstTitles(
        overview.heroSlides.map(item => item.title || item.image),
      ),
    },
    {
      id: 'category-banners',
      label: 'Category banners',
      value: getCollectionSummary(overview.categoryBanners),
      detail: getFirstTitles(
        overview.categoryBanners.map(item => item.categorySlug || item.image),
      ),
    },
    {
      id: 'cta',
      label: 'CTA section',
      value: overview.ctaSection?.isActive === false ? 'Inactive' : 'Active',
      detail: overview.ctaSection?.title || '-',
    },
    {
      id: 'youtube',
      label: 'YouTube section',
      value:
        overview.youtubeSection?.isActive === false ? 'Inactive' : 'Active',
      detail:
        overview.youtubeSection?.link || overview.youtubeSection?.title || '-',
    },
    {
      id: 'announcement-banners',
      label: 'Announcement banners',
      value: getCollectionSummary(overview.announcementBanners),
      detail: getFirstTitles(
        overview.announcementBanners.map(item => item.link || item.image),
      ),
    },
    {
      id: 'customer-notices',
      label: 'Customer notices',
      value: getCollectionSummary(overview.customerNotices),
      detail: getFirstTitles(
        overview.customerNotices.map(item => item.title || item.key),
      ),
    },
    {
      id: 'featured-collections',
      label: 'Featured collections',
      value: getCollectionSummary(featuredCollections),
      detail: getFirstTitles(featuredCollections.map(item => item.title)),
    },
    {
      id: 'bioactive-ecosystem',
      label: 'Bioactive ecosystem',
      value: getCollectionSummary(bioactiveSteps),
      detail: getFirstTitles(bioactiveSteps.map(item => item.key)),
    },
  ];

  return (
    <View style={styles.marketplaceOverview}>
      <KolamCopyStack
        items={[
          {
            id: 'title',
            text: 'Marketplace Landing Overview',
            style: styles.marketplaceOverviewTitle,
          },
          {
            id: 'status',
            text:
              overview.status === 'loading'
                ? 'Loading live marketplace landing data...'
                : overview.status === 'error'
                ? overview.message
                : 'Read-only live data from Marketplace Landing endpoints.',
            style:
              overview.status === 'error'
                ? styles.marketplaceOverviewError
                : styles.marketplaceOverviewMeta,
          },
        ]}
      />
      <View style={styles.marketplaceOverviewRows}>
        {rows.map(row => (
          <View key={row.id} style={styles.marketplaceOverviewRow}>
            <KolamCopyStack
              containerStyle={styles.marketplaceOverviewCopy}
              items={[
                {
                  id: `${row.id}-label`,
                  text: row.label,
                  style: styles.marketplaceOverviewLabel,
                },
                {
                  id: `${row.id}-detail`,
                  text: row.detail,
                  style: styles.marketplaceOverviewDetail,
                },
              ]}
            />
            <KolamCopyStack
              items={[
                {
                  id: `${row.id}-value`,
                  text: row.value,
                  style: styles.marketplaceOverviewValue,
                },
              ]}
            />
          </View>
        ))}
      </View>
      <View style={styles.marketplaceAssetSection}>
        <KolamCopyStack
          items={[
            {
              id: 'asset-title',
              text: 'Marketplace Asset Uploads',
              style: styles.marketplaceOverviewLabel,
            },
            {
              id: 'asset-meta',
              text: 'Replace, reorder, and delete existing live marketplace landing items.',
              style: styles.marketplaceOverviewMeta,
            },
          ]}
        />
        <View style={styles.marketplaceAssetActions}>
          <MarketplaceAssetButton
            disabled={disabled}
            id="websetting-logo"
            label="Upload logo"
            onPress={onUploadLogo}
            status={assetStatus}
          />
          <MarketplaceAssetButton
            disabled={disabled}
            id="dara-avatar"
            label="Upload DARA avatar"
            onPress={onUploadDaraAvatar}
            status={assetStatus}
          />
          <MarketplaceAssetButton
            disabled={disabled}
            id="cta-background"
            label="Upload CTA background"
            onPress={onUploadCtaBackground}
            status={assetStatus}
          />
          <MarketplaceAssetButton
            disabled={disabled}
            id="youtube-background"
            label="Upload YouTube background"
            onPress={onUploadYoutubeBackground}
            status={assetStatus}
          />
        </View>
        <MarketplaceAssetRows
          disabled={disabled}
          emptyText="No hero slides available for image replacement."
          getId={item => `hero:${item._id}`}
          getLabel={item => item.title || item._id}
          items={overview.heroSlides}
          onDelete={onDeleteHeroSlide}
          onMove={onMoveHeroSlide}
          onUpload={onUploadHeroImage}
          status={assetStatus}
          title="Hero slide images"
        />
        <MarketplaceAssetRows
          disabled={disabled}
          emptyText="No category banners available for image replacement."
          getId={item => `category:${item._id}`}
          getLabel={item => item.categorySlug || item._id}
          items={overview.categoryBanners}
          onDelete={onDeleteCategoryBanner}
          onMove={onMoveCategoryBanner}
          onUpload={onUploadCategoryBannerImage}
          status={assetStatus}
          title="Category banner images"
        />
        <MarketplaceAssetRows
          disabled={disabled}
          emptyText="No announcement banners available for image replacement."
          getId={item => `announcement:${item._id}`}
          getLabel={item => item.link || item._id}
          items={overview.announcementBanners}
          onDelete={onDeleteAnnouncementBanner}
          onMove={onMoveAnnouncementBanner}
          onUpload={onUploadAnnouncementImage}
          status={assetStatus}
          title="Announcement banner images"
        />
        <MarketplaceIndexedAssetRows
          disabled={disabled}
          emptyText="No featured collections available for image upload."
          getId={index => `featured:${index}`}
          getLabel={item => item.title || '-'}
          items={featuredCollections}
          onDelete={onDeleteFeaturedCollection}
          onMove={onMoveFeaturedCollection}
          onUpload={onUploadFeaturedCollectionImage}
          status={assetStatus}
          title="Featured collection images"
        />
        <MarketplaceIndexedAssetRows
          disabled={disabled}
          emptyText="No bioactive steps available for image upload."
          getId={index => `bioactive:${index}`}
          getLabel={item => item.key || '-'}
          items={bioactiveSteps}
          onDelete={onDeleteBioactiveStep}
          onMove={onMoveBioactiveStep}
          onUpload={onUploadBioactiveStepImage}
          status={assetStatus}
          title="Bioactive ecosystem images"
        />
      </View>
    </View>
  );
}

function MarketplaceAssetRows<Item>({
  disabled,
  emptyText,
  getId,
  getLabel,
  items,
  onDelete,
  onMove,
  onUpload,
  status,
  title,
}: {
  disabled: boolean;
  emptyText: string;
  getId: (item: Item) => string;
  getLabel: (item: Item) => string;
  items: Item[];
  onDelete: (item: Item) => void;
  onMove: (item: Item, direction: -1 | 1) => void;
  onUpload: (item: Item) => void;
  status: Partial<
    Record<string, 'idle' | 'uploading' | 'deleting' | 'reordering'>
  >;
  title: string;
}) {
  return (
    <View style={styles.marketplaceAssetGroup}>
      <KolamCopyStack
        items={[
          { id: 'title', text: title, style: styles.marketplaceOverviewMeta },
        ]}
      />
      {items.length ? (
        items.map((item, index) => {
          const id = getId(item);
          return (
            <View key={id} style={styles.marketplaceAssetRow}>
              <KolamCopyStack
                containerStyle={styles.marketplaceOverviewCopy}
                items={[
                  {
                    id: `${id}-label`,
                    text: getLabel(item),
                    style: styles.marketplaceOverviewDetail,
                  },
                ]}
              />
              <View style={styles.marketplaceAssetActions}>
                <MarketplaceAssetButton
                  disabled={disabled || index === 0}
                  id={id}
                  label="Move up"
                  onPress={() => onMove(item, -1)}
                  status={status}
                />
                <MarketplaceAssetButton
                  disabled={disabled || index === items.length - 1}
                  id={id}
                  label="Move down"
                  onPress={() => onMove(item, 1)}
                  status={status}
                />
                <MarketplaceAssetButton
                  disabled={disabled}
                  id={id}
                  label="Upload image"
                  onPress={() => onUpload(item)}
                  status={status}
                />
                <MarketplaceAssetButton
                  disabled={disabled}
                  id={id}
                  intent="danger"
                  label="Delete"
                  onPress={() => onDelete(item)}
                  status={status}
                />
              </View>
            </View>
          );
        })
      ) : (
        <KolamCopyStack
          items={[
            {
              id: 'empty',
              text: emptyText,
              style: styles.marketplaceOverviewMeta,
            },
          ]}
        />
      )}
    </View>
  );
}

function MarketplaceIndexedAssetRows<Item>({
  disabled,
  emptyText,
  getId,
  getLabel,
  items,
  onDelete,
  onMove,
  onUpload,
  status,
  title,
}: {
  disabled: boolean;
  emptyText: string;
  getId: (index: number) => string;
  getLabel: (item: Item) => string;
  items: Item[];
  onDelete: (index: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onUpload: (index: number) => void;
  status: Partial<
    Record<string, 'idle' | 'uploading' | 'deleting' | 'reordering'>
  >;
  title: string;
}) {
  return (
    <View style={styles.marketplaceAssetGroup}>
      <KolamCopyStack
        items={[
          { id: 'title', text: title, style: styles.marketplaceOverviewMeta },
        ]}
      />
      {items.length ? (
        items.map((item, index) => {
          const id = getId(index);
          return (
            <View key={id} style={styles.marketplaceAssetRow}>
              <KolamCopyStack
                containerStyle={styles.marketplaceOverviewCopy}
                items={[
                  {
                    id: `${id}-label`,
                    text: getLabel(item),
                    style: styles.marketplaceOverviewDetail,
                  },
                ]}
              />
              <View style={styles.marketplaceAssetActions}>
                <MarketplaceAssetButton
                  disabled={disabled || index === 0}
                  id={id}
                  label="Move up"
                  onPress={() => onMove(index, -1)}
                  status={status}
                />
                <MarketplaceAssetButton
                  disabled={disabled || index === items.length - 1}
                  id={id}
                  label="Move down"
                  onPress={() => onMove(index, 1)}
                  status={status}
                />
                <MarketplaceAssetButton
                  disabled={disabled}
                  id={id}
                  label="Upload image"
                  onPress={() => onUpload(index)}
                  status={status}
                />
                <MarketplaceAssetButton
                  disabled={disabled}
                  id={id}
                  intent="danger"
                  label="Delete"
                  onPress={() => onDelete(index)}
                  status={status}
                />
              </View>
            </View>
          );
        })
      ) : (
        <KolamCopyStack
          items={[
            {
              id: 'empty',
              text: emptyText,
              style: styles.marketplaceOverviewMeta,
            },
          ]}
        />
      )}
    </View>
  );
}

function MarketplaceAssetButton({
  disabled,
  id,
  intent,
  label,
  onPress,
  status,
}: {
  disabled: boolean;
  id: string;
  intent?: 'danger' | 'primary';
  label: string;
  onPress: () => void;
  status: Partial<
    Record<string, 'idle' | 'uploading' | 'deleting' | 'reordering'>
  >;
}) {
  const actionStatus = status[id];
  const busy =
    actionStatus === 'uploading' ||
    actionStatus === 'deleting' ||
    actionStatus === 'reordering';
  return (
    <KolamActionControlButton
      disabled={disabled || busy}
      intent={intent}
      label={label}
      loading={busy}
      loadingLabel={getMarketplaceAssetLoadingLabel(actionStatus)}
      onPress={onPress}
    />
  );
}

function getMarketplaceAssetLoadingLabel(
  status: 'idle' | 'uploading' | 'deleting' | 'reordering' | undefined,
) {
  if (status === 'deleting') {
    return 'Deleting...';
  }

  if (status === 'reordering') {
    return 'Moving...';
  }

  return 'Uploading...';
}

function MarketplaceLandingControlsPanel({
  ctaDraft,
  disabled,
  message,
  noticeDraft,
  notices,
  onClearNoticeDraft,
  onDeleteNotice,
  onEditNotice,
  onSaveCta,
  onSaveNotice,
  onSaveYoutube,
  saveStatus,
  setCtaDraftField,
  setNoticeDraftField,
  setYoutubeDraftField,
  youtubeDraft,
}: {
  ctaDraft: MarketplaceLandingCtaDraft;
  disabled: boolean;
  message: string;
  noticeDraft: MarketplaceLandingNoticeDraft;
  notices: KolamCustomerTextNotice[];
  onClearNoticeDraft: () => void;
  onDeleteNotice: (key: string) => void;
  onEditNotice: (notice: KolamCustomerTextNotice) => void;
  onSaveCta: () => void;
  onSaveNotice: () => void;
  onSaveYoutube: () => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  setCtaDraftField: <Key extends keyof MarketplaceLandingCtaDraft>(
    key: Key,
    value: MarketplaceLandingCtaDraft[Key],
  ) => void;
  setNoticeDraftField: <Key extends keyof MarketplaceLandingNoticeDraft>(
    key: Key,
    value: MarketplaceLandingNoticeDraft[Key],
  ) => void;
  setYoutubeDraftField: <Key extends keyof MarketplaceLandingYoutubeDraft>(
    key: Key,
    value: MarketplaceLandingYoutubeDraft[Key],
  ) => void;
  youtubeDraft: MarketplaceLandingYoutubeDraft;
}) {
  const noticeCanSave =
    !!noticeDraft.key.trim() &&
    !!noticeDraft.title.trim() &&
    !!noticeDraft.message.trim();

  return (
    <View style={styles.marketplaceControls}>
      <KolamCopyStack
        items={[
          {
            id: 'title',
            text: 'Marketplace Landing Controls',
            style: styles.marketplaceOverviewTitle,
          },
          {
            id: 'meta',
            text: 'Text and toggle controls only. Asset upload and reorder stay out of Fase 8C.',
            style: styles.marketplaceOverviewMeta,
          },
        ]}
      />
      <View style={styles.marketplaceControlSection}>
        <KolamCopyStack
          items={[
            {
              id: 'cta-title',
              text: 'CTA Section',
              style: styles.marketplaceOverviewLabel,
            },
          ]}
        />
        <KolamTextFieldRow
          label="CTA title"
          description="Judul section CTA marketplace."
          value={ctaDraft.title}
          onChangeText={value => setCtaDraftField('title', value)}
          placeholder="Jelajahi Dunia Species"
        />
        <KolamTextFieldRow
          label="CTA description"
          description="Deskripsi singkat CTA marketplace."
          value={ctaDraft.description}
          onChangeText={value => setCtaDraftField('description', value)}
          placeholder="Temukan koleksi lengkap..."
        />
        <KolamTextFieldRow
          label="CTA button text"
          description="Label tombol CTA."
          value={ctaDraft.buttonText}
          onChangeText={value => setCtaDraftField('buttonText', value)}
          placeholder="View All Species"
        />
        <KolamTextFieldRow
          label="CTA button link"
          description="Target URL tombol CTA."
          value={ctaDraft.buttonLink}
          onChangeText={value => setCtaDraftField('buttonLink', value)}
          placeholder="/species"
        />
        <KolamToggleRow
          label="CTA active"
          description="Tampilkan CTA di marketplace landing."
          active={ctaDraft.isActive}
          onPress={() =>
            !disabled && setCtaDraftField('isActive', !ctaDraft.isActive)
          }
        />
        <KolamActionControlButton
          disabled={disabled}
          label="Save CTA"
          loading={saveStatus === 'saving'}
          loadingLabel="Saving..."
          intent="primary"
          onPress={onSaveCta}
        />
      </View>
      <View style={styles.marketplaceControlSection}>
        <KolamCopyStack
          items={[
            {
              id: 'youtube-title',
              text: 'YouTube Section',
              style: styles.marketplaceOverviewLabel,
            },
          ]}
        />
        <KolamTextFieldRow
          label="YouTube link"
          description="URL channel atau video YouTube."
          value={youtubeDraft.link}
          onChangeText={value => setYoutubeDraftField('link', value)}
          placeholder="https://www.youtube.com/@DuniaAnura"
        />
        <KolamTextFieldRow
          label="YouTube title"
          description="Judul section YouTube."
          value={youtubeDraft.title}
          onChangeText={value => setYoutubeDraftField('title', value)}
          placeholder="Dunia Anura"
        />
        <KolamTextFieldRow
          label="YouTube subtitle"
          description="Subtitle section YouTube."
          value={youtubeDraft.subtitle}
          onChangeText={value => setYoutubeDraftField('subtitle', value)}
          placeholder="YouTube"
        />
        <KolamToggleRow
          label="YouTube active"
          description="Tampilkan YouTube section di marketplace landing."
          active={youtubeDraft.isActive}
          onPress={() =>
            !disabled &&
            setYoutubeDraftField('isActive', !youtubeDraft.isActive)
          }
        />
        <KolamActionControlButton
          disabled={disabled}
          label="Save YouTube"
          loading={saveStatus === 'saving'}
          loadingLabel="Saving..."
          intent="primary"
          onPress={onSaveYoutube}
        />
      </View>
      <View style={styles.marketplaceControlSection}>
        <KolamCopyStack
          items={[
            {
              id: 'notice-title',
              text: 'Customer Notices',
              style: styles.marketplaceOverviewLabel,
            },
          ]}
        />
        <View style={styles.marketplaceNoticeList}>
          {notices.length ? (
            notices.map(notice => (
              <View key={notice.key} style={styles.marketplaceNoticeRow}>
                <KolamCopyStack
                  containerStyle={styles.marketplaceOverviewCopy}
                  items={[
                    {
                      id: `${notice.key}-title`,
                      text: notice.title || notice.key,
                      style: styles.marketplaceOverviewLabel,
                    },
                    {
                      id: `${notice.key}-message`,
                      text: notice.message || '-',
                      style: styles.marketplaceOverviewDetail,
                    },
                  ]}
                />
                <View style={styles.notificationSoundActions}>
                  <KolamActionControlButton
                    disabled={disabled}
                    label="Edit"
                    onPress={() => onEditNotice(notice)}
                  />
                  <KolamActionControlButton
                    disabled={disabled}
                    intent="danger"
                    label="Delete"
                    onPress={() => onDeleteNotice(notice.key)}
                  />
                </View>
              </View>
            ))
          ) : (
            <KolamCopyStack
              items={[
                {
                  id: 'empty',
                  text: 'No customer notices configured.',
                  style: styles.marketplaceOverviewMeta,
                },
              ]}
            />
          )}
        </View>
        <KolamTextFieldRow
          label="Notice key"
          description="Key unik notice. Untuk edit, pilih notice dari list."
          value={noticeDraft.key}
          onChangeText={value => setNoticeDraftField('key', value)}
          placeholder="enclonura-migration-2026"
        />
        <KolamTextFieldRow
          label="Notice title"
          description="Judul singkat notice."
          value={noticeDraft.title}
          onChangeText={value => setNoticeDraftField('title', value)}
          placeholder="Enclonura pindah ke Dunia Anura"
        />
        <KolamTextFieldRow
          label="Notice message"
          description="Pesan teks untuk customer marketplace."
          value={noticeDraft.message}
          onChangeText={value => setNoticeDraftField('message', value)}
          placeholder="Kelola kandang, Freyr, dan layanan..."
        />
        <KolamTextFieldRow
          label="Notice CTA URL"
          description="URL tombol opsional."
          value={noticeDraft.ctaUrl}
          onChangeText={value => setNoticeDraftField('ctaUrl', value)}
          placeholder="/dashboard"
        />
        <KolamTextFieldRow
          label="Notice CTA label"
          description="Label tombol opsional."
          value={noticeDraft.ctaLabel}
          onChangeText={value => setNoticeDraftField('ctaLabel', value)}
          placeholder="Buka dashboard"
        />
        <KolamToggleRow
          label="Notice active"
          description="Aktifkan notice untuk customer."
          active={noticeDraft.isActive}
          onPress={() =>
            !disabled && setNoticeDraftField('isActive', !noticeDraft.isActive)
          }
        />
        <KolamToggleRow
          label="Show on home"
          description="Tampilkan notice di homepage marketplace."
          active={noticeDraft.showOnHome}
          onPress={() =>
            !disabled &&
            setNoticeDraftField('showOnHome', !noticeDraft.showOnHome)
          }
        />
        <KolamToggleRow
          label="Show on dashboard"
          description="Tampilkan notice di dashboard customer."
          active={noticeDraft.showOnDashboard}
          onPress={() =>
            !disabled &&
            setNoticeDraftField('showOnDashboard', !noticeDraft.showOnDashboard)
          }
        />
        <View style={styles.notificationSoundActions}>
          <KolamActionControlButton
            disabled={disabled || !noticeCanSave}
            label="Save Notice"
            loading={saveStatus === 'saving'}
            loadingLabel="Saving..."
            intent="primary"
            onPress={onSaveNotice}
          />
          <KolamActionControlButton
            disabled={disabled}
            label="New Notice"
            onPress={onClearNoticeDraft}
          />
        </View>
      </View>
      {message ? (
        <KolamCopyStack
          items={[
            {
              id: 'message',
              text: message,
              style:
                saveStatus === 'error'
                  ? styles.marketplaceOverviewError
                  : styles.marketplaceOverviewMeta,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

function getCollectionSummary(items: Array<{ isActive?: boolean }>) {
  const active = items.filter(item => item.isActive !== false).length;
  return `${active}/${items.length} active`;
}

function getFirstTitles(values: string[]) {
  const visible = values.filter(Boolean).slice(0, 3);
  return visible.length ? visible.join(' | ') : '-';
}

function getTeamChatRoomLabel(room: KolamTeamChatRoom) {
  if (room.name) {
    return room.name;
  }

  if (room.isGeneral) {
    return 'General Chat';
  }

  if (room.isAiRoom) {
    return 'Chat dengan DARA';
  }

  return room.category || 'Team Chat';
}

function getUserPickerLabel(user: KolamUserPickerRow) {
  return (
    [user.first_name, user.last_name].filter(Boolean).join(' ').trim() ||
    user.username ||
    'Staff'
  );
}

const styles = StyleSheet.create({
  marketplaceAssetActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  marketplaceAssetGroup: {
    gap: 8,
  },
  marketplaceAssetRow: {
    alignItems: 'center',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    padding: 10,
  },
  marketplaceAssetSection: {
    gap: 10,
  },
  marketplaceControls: {
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderWidth: 1,
    gap: 14,
    padding: 14,
  },
  marketplaceControlSection: {
    gap: 10,
  },
  marketplaceNoticeList: {
    gap: 8,
  },
  marketplaceNoticeRow: {
    alignItems: 'center',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    padding: 10,
  },
  marketplaceOverview: {
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  marketplaceOverviewCopy: {
    flex: 1,
    gap: 4,
    minWidth: 260,
  },
  marketplaceOverviewDetail: {
    color: '#6b7280',
    fontSize: 12,
  },
  marketplaceOverviewError: {
    color: '#b91c1c',
    fontSize: 12,
  },
  marketplaceOverviewLabel: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '700',
  },
  marketplaceOverviewMeta: {
    color: '#6b7280',
    fontSize: 12,
  },
  marketplaceOverviewRow: {
    alignItems: 'center',
    borderColor: '#e5e7eb',
    borderTopWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  marketplaceOverviewRows: {
    gap: 0,
  },
  marketplaceOverviewTitle: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '800',
  },
  marketplaceOverviewValue: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '700',
  },
  notificationSoundActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  notificationSoundCopy: {
    flex: 1,
    gap: 4,
    minWidth: 260,
  },
  notificationSoundLabel: {
    color: '#1f2937',
    fontSize: 13,
    fontWeight: '700',
  },
  notificationSoundList: {
    gap: 10,
  },
  notificationSoundPath: {
    color: '#6b7280',
    fontSize: 12,
  },
  notificationSoundRow: {
    alignItems: 'center',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    padding: 12,
  },
  storeHoursList: {
    gap: 10,
  },
  storeHoursRow: {
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  storeHoursTimeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
