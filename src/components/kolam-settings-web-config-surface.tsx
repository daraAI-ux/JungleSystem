import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type {
  SettingsTabId,
  SettingsWebConfigField,
  SettingsWebFormSection,
} from '../domain/settings-surface';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamActionControlButton } from './kolam-action-control-button';
import { KolamChoiceSegment } from './kolam-choice-segment';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamSettingsWebFormSections } from './kolam-settings-web-widgets';
import { KolamTextFieldRow } from './kolam-text-field-row';
import { KolamToggleRow } from './kolam-toggle-row';
import { geocodeKolamStaffAttendanceWorkSite } from '../services/kolam-api';
import type {
  KolamAnnouncementBanner,
  KolamBlog,
  KolamBlogTopic,
  KolamCategoryBanner,
  KolamCustomerTextNotice,
  KolamHeroSlide,
  KolamNotificationSoundType,
  KolamPluginConfigKey,
  KolamRegion,
  KolamRegionLevel,
  KolamRegionSyncScope,
  KolamSitemapChangeFrequency,
  KolamSitemapConfig,
  KolamSitemapSectionKey,
  KolamStaffAttendanceWorkSite,
  KolamTeamChatRoom,
  KolamUserPickerRow,
} from '../services/kolam-api';
import type {
  SettingsFinancialSummaryRow,
  MarketplaceLandingCtaDraft,
  MarketplaceLandingNoticeDraft,
  MarketplaceLandingOverview,
  MarketplaceLandingYoutubeDraft,
  KpiSettingsDraft,
  KpiSettingsSummaryRow,
  MarketplaceLandingTabItem,
  RegionSyncSummaryRow,
  WebContentLauncherItem,
} from './kolam-settings-panel-controller';
import type { KolamKpiWeeklyAnnouncePreview } from '../services/kolam-api';
import { getKolamFileUrl } from '../lib/file-url';
import { KolamMediaPlayer } from './kolam-media-player';

const DEFAULT_NOTIFICATION_BEEP_URI =
  'data:audio/wav;base64,UklGRqQMAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YYAMAAAAAOEdCy4UKUERhPFs2H/R6d8P/Y0bZy1qKvUTWPQU2jjR1N0g+h4ZlSyVK5UWN/fi2yDR4ts395UWlSuVLB4ZIPrU3TjRFNpY9PUTaipnLY0bD/3p33/RbNiE8UERFCkLLuEdAAAf4vXR7Na/7nwOlCeBLhcg8QJz5JnSltUL7KgL7CXILiwi4AXi5mvTa9Rr6ckIHiTgLh4kyQhr6WvUa9Pi5uAFLCLILuwlqAsL7JbVmdJz5PECFyCBLpQnfA6/7uzW9dEf4gAA4R0LLhQpQRGE8WzYf9Hp3w/9jRtnLWoq9RNY9BTaONHU3SD6HhmVLJUrlRY39+LbINHi2zf3lRaVK5UsHhkg+tTdONEU2lj09RNqKmctjRsP/enff9Fs2ITxQREUKQsu4R0AAB/i9dHs1r/ufA6UJ4EuFyDxAnPkmdKW1QvsqAvsJcguLCLgBeLma9Nr1GvpyQgeJOAuHiTJCGvpa9Rr0+Lm4AUsIsgu7CWoCwvsltWZ0nPk8QIXIIEulCd8Dr/u7Nb10R/iAADhHQsuFClBEYTxbNh/0enfD/2NG2ctair1E1j0FNo40dTdIPoeGZUslSuVFjf34tsg0eLbN/eVFpUrlSweGSD61N040RTaWPT1E2oqZy2NGw/96d9/0WzYhPFBERQpCy7hHQAAH+L10ezWv+58DpQngS4XIPECc+SZ0pbVC+yoC+wlyC4sIuAF4uZr02vUa+nJCB4k4C4eJMkIa+lr1GvT4ubgBSwiyC7sJagLC+yW1ZnSc+TxAhcggS6UJ3wOv+7s1vXRH+IAAOEdCy4UKUERhPFs2H/R6d8P/Y0bZy1qKvUTWPQU2jjR1N0g+h4ZlSyVK5UWN/fi2yDR4ts395UWlSuVLB4ZIPrU3TjRFNpY9PUTaipnLY0bD/3p33/RbNiE8UERFCkLLuEdAAAf4vXR7Na/7nwOlCeBLhcg8QJz5JnSltUL7KgL7CXILiwi4AXi5mvTa9Rr6ckIHiTgLh4kyQhr6WvUa9Pi5uAFLCLILuwlqAsL7JbVmdJz5PECFyCBLpQnfA6/7uzW9dEf4g==';

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
  staffAttendanceServiceCommissionInsideHoursPct: string;
  staffAttendanceServiceCommissionOutsideHoursPct: string;
  staffAttendanceTimezone: string;
  staffAttendanceLateToleranceMinutes: string;
  staffAttendanceLateTier2MaxMinutes: string;
  staffAttendanceLateCheckInDeadlineMinutes: string;
  staffAttendanceLateFineTier2: string;
  staffAttendanceLateFineTier3: string;
  staffAttendanceAbsentDailyDivisor: string;
  staffAttendanceMapProvider: string;
  staffAttendanceOsmNominatimUrl: string;
  staffAttendanceOsmTileUrl: string;
  staffAttendanceGoogleMapsBrowserApiKey: string;
  staffAttendanceRequireGps: boolean;
  staffAttendanceRequireFace: boolean;
  staffAttendanceFaceMatchThreshold: string;
  staffAttendanceWorkSites: KolamStaffAttendanceWorkSite[];
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
  storeOperatingHoursSpecialClosureDate: string;
  storeOperatingHoursSpecialClosureLabel: string;
  storeOperatingHoursSpecialClosuresText: string;
  storeOperatingHoursMessageBeforeOpen: string;
  storeOperatingHoursMessageAfterClose: string;
  storeOperatingHoursMessageWeeklyClosed: string;
  storeOperatingHoursMessageSpecialClosed: string;
  storeOperatingHoursMessageShippingDisclaimer: string;
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

const storeOperatingMessageRows: Array<{
  id: string;
  label: string;
  field: keyof WebSettingDraft;
}> = [
  {
    id: 'before-open',
    label: 'Sebelum buka',
    field: 'storeOperatingHoursMessageBeforeOpen',
  },
  {
    id: 'after-close',
    label: 'Setelah tutup',
    field: 'storeOperatingHoursMessageAfterClose',
  },
  {
    id: 'weekly-closed',
    label: 'Libur rutin mingguan',
    field: 'storeOperatingHoursMessageWeeklyClosed',
  },
  {
    id: 'special-closed',
    label: 'Libur khusus ({label})',
    field: 'storeOperatingHoursMessageSpecialClosed',
  },
  {
    id: 'shipping-disclaimer',
    label: 'Peringatan pengiriman (konteks AI)',
    field: 'storeOperatingHoursMessageShippingDisclaimer',
  },
];

export function KolamSettingsWebConfigSurface({
  fields,
  maintenanceMode,
  marketplaceLandingOverview,
  financialSummaryRows,
  operationalRooms,
  operationalStaffRows,
  regionLevel,
  regionParentCode,
  regionRows,
  regionSearch,
  regionSyncMessage,
  regionSyncStatus,
  regionSyncSummaryRows,
  marketplaceLandingCtaDraft,
  marketplaceLandingYoutubeDraft,
  marketplaceLandingNoticeDraft,
  marketplaceLandingSaveStatus,
  marketplaceLandingMessage,
  marketplaceLandingAssetStatus,
  marketplaceLandingTabId,
  marketplaceLandingTabItems,
  webContentLauncherItems,
  webContentMessage,
  webContentPanelId,
  webContentStatus,
  blogRows,
  blogTopicRows,
  kpiMessage,
  kpiPreview,
  kpiSettingsDraft,
  kpiStatus,
  kpiSummaryRows,
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
  onRefreshRegionSync,
  onRefreshKpiWeeklyPreview,
  onRunRegionSync,
  onSaveKpiSettings,
  onSaveOperationalGoogleAuth,
  onSaveOperationalLivechat,
  onSaveOperationalMaintenance,
  onSaveOperationalPoWorkflow,
  onSaveOperationalStaffAttendance,
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
  setMarketplaceLandingTabId,
  setKpiEnabledRule,
  setKpiSettingsDraftField,
  setMarketplaceLandingYoutubeDraftField,
  setMarketplaceLandingNoticeDraftField,
  setWebContentPanelId,
  setRegionFilter,
  setSitemapCustomUrlsDraftText,
  setSitemapExcludedSlugsDraftText,
  setSitemapMasterField,
  setSitemapSectionField,
  setDraftField,
  storefrontEnabled,
  draft,
  notificationSoundStatus,
  sitemapChangeFrequencies,
  sitemapCustomUrlsText,
  sitemapDraft,
  sitemapExcludedSlugsText,
  sitemapSectionKeys,
  webTitle,
}: {
  draft: WebSettingDraft;
  fields: SettingsWebConfigField[];
  maintenanceMode: boolean;
  marketplaceLandingOverview: MarketplaceLandingOverview;
  financialSummaryRows: SettingsFinancialSummaryRow[];
  operationalRooms: KolamTeamChatRoom[];
  operationalStaffRows: KolamUserPickerRow[];
  regionLevel: KolamRegionLevel | '';
  regionParentCode: string;
  regionRows: KolamRegion[];
  regionSearch: string;
  regionSyncMessage: string;
  regionSyncStatus: 'idle' | 'loading' | 'live' | 'syncing' | 'error';
  regionSyncSummaryRows: RegionSyncSummaryRow[];
  marketplaceLandingCtaDraft: MarketplaceLandingCtaDraft;
  marketplaceLandingYoutubeDraft: MarketplaceLandingYoutubeDraft;
  marketplaceLandingNoticeDraft: MarketplaceLandingNoticeDraft;
  marketplaceLandingSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  marketplaceLandingMessage: string;
  marketplaceLandingAssetStatus: Partial<
    Record<string, 'idle' | 'uploading' | 'deleting' | 'reordering'>
  >;
  marketplaceLandingTabId:
    | 'hero'
    | 'featured'
    | 'category'
    | 'cta'
    | 'youtube'
    | 'announcement'
    | 'notices';
  marketplaceLandingTabItems: MarketplaceLandingTabItem[];
  webContentLauncherItems: WebContentLauncherItem[];
  webContentMessage: string;
  webContentPanelId: 'marketplace' | 'blog' | 'blog-topics';
  webContentStatus: 'idle' | 'loading' | 'live' | 'error';
  blogRows: KolamBlog[];
  blogTopicRows: KolamBlogTopic[];
  kpiMessage: string;
  kpiPreview: KolamKpiWeeklyAnnouncePreview | null;
  kpiSettingsDraft: KpiSettingsDraft;
  kpiStatus: 'idle' | 'loading' | 'live' | 'saving' | 'error' | 'disabled';
  kpiSummaryRows: KpiSettingsSummaryRow[];
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
  onRefreshRegionSync: () => void;
  onRefreshKpiWeeklyPreview: () => void;
  onRunRegionSync: (scope: KolamRegionSyncScope) => void;
  onSaveKpiSettings: () => void;
  onSaveOperationalGoogleAuth: (
    patch: Partial<
      Pick<WebSettingDraft, 'webstoreGoogleAuthEnabled' | 'googleOAuthClientId'>
    >,
  ) => void;
  onSaveOperationalLivechat: (value: boolean) => void;
  onSaveOperationalMaintenance: (
    target: 'pos' | 'marketplace',
    value: boolean,
  ) => void;
  onSaveOperationalPoWorkflow: (patch: Partial<WebSettingDraft>) => void;
  onSaveOperationalStaffAttendance: () => void;
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
  setMarketplaceLandingTabId: (
    id:
      | 'hero'
      | 'featured'
      | 'category'
      | 'cta'
      | 'youtube'
      | 'announcement'
      | 'notices',
  ) => void;
  setKpiEnabledRule: (rule: string, enabled: boolean) => void;
  setKpiSettingsDraftField: <Key extends keyof KpiSettingsDraft>(
    key: Key,
    value: KpiSettingsDraft[Key],
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
  setWebContentPanelId: (id: 'marketplace' | 'blog' | 'blog-topics') => void;
  setRegionFilter: (
    key: 'level' | 'parentCode' | 'search',
    value: string,
  ) => void;
  setSitemapCustomUrlsDraftText: (value: string) => void;
  setSitemapExcludedSlugsDraftText: (
    section: KolamSitemapSectionKey,
    value: string,
  ) => void;
  setSitemapMasterField: (
    key: 'enabled' | 'includeImages',
    value: boolean,
  ) => void;
  setSitemapSectionField: (
    section: KolamSitemapSectionKey,
    key: 'enabled' | 'priority' | 'changeFrequency',
    value: string | boolean,
  ) => void;
  setDraftField: (
    key: keyof WebSettingDraft,
    value: WebSettingDraft[keyof WebSettingDraft],
  ) => void;
  sitemapChangeFrequencies: KolamSitemapChangeFrequency[];
  sitemapCustomUrlsText: string;
  sitemapDraft: KolamSitemapConfig;
  sitemapExcludedSlugsText: Partial<Record<KolamSitemapSectionKey, string>>;
  sitemapSectionKeys: KolamSitemapSectionKey[];
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
  const showSitemapSettings = activeTabId === 'sitemap';
  const showSyncSettings = activeTabId === 'sync';
  const showKpiSettings = activeTabId === 'kpi';
  const generalFormSections = sections.filter(section => section.id === 'logo');
  const settingsFieldWidth = 460;
  const chatPluginEnabled = draft.pluginControls.chat;
  const daraPluginEnabled = draft.pluginControls.dara;
  const kpiPluginEnabled = draft.pluginControls.kpi;
  const chatControlsDisabled = disabled || !chatPluginEnabled;
  const daraControlsDisabled = disabled || !daraPluginEnabled;
  const daraChatControlsDisabled =
    disabled || !chatPluginEnabled || !daraPluginEnabled;
  const notificationSoundItems = [
    {
      id: 'notification-sound',
      label: 'Suara notifikasi',
      type: 'assigned' as const,
      value: draft.notificationSound,
    },
    {
      id: 'unassigned-notification-sound',
      label: 'Suara chat belum ditugaskan',
      type: 'unassigned' as const,
      value: draft.unassignedNotificationSound,
    },
    {
      id: 'handoff-notification-sound',
      label: 'Suara alih tangan',
      type: 'handoff' as const,
      value: draft.handoffNotificationSound,
    },
    {
      id: 'group-call-ringtone',
      label: 'Nada panggilan grup',
      type: 'group-call' as const,
      value: draft.groupCallRingtone,
    },
    {
      id: 'sales-notification-sound',
      label: 'Suara notifikasi penjualan',
      type: 'sales' as const,
      value: draft.salesNotificationSound,
    },
  ];
  const [previewNotificationSound, setPreviewNotificationSound] =
    React.useState<{
      id: string;
      title: string;
      uri: string;
    } | null>(null);
  const [workSiteGeocodeQueries, setWorkSiteGeocodeQueries] = React.useState<
    Record<string, string>
  >({});
  const [workSiteGeocodeStatus, setWorkSiteGeocodeStatus] = React.useState<
    Record<
      string,
      { message: string; status: 'idle' | 'loading' | 'saved' | 'error' }
    >
  >({});
  const getNotificationSoundPreviewUri = (value: string | null | undefined) => {
    const trimmed = value?.trim() ?? '';

    return trimmed
      ? getKolamFileUrl(trimmed) ?? DEFAULT_NOTIFICATION_BEEP_URI
      : DEFAULT_NOTIFICATION_BEEP_URI;
  };
  const getNotificationSoundFileName = (value: string | null | undefined) => {
    const trimmed = value?.trim() ?? '';

    if (!trimmed) {
      return 'Default sistem';
    }

    return trimmed.split(/[\\/]/).pop() || trimmed;
  };
  const playNotificationSound = (
    item: (typeof notificationSoundItems)[number],
  ) => {
    setPreviewNotificationSound({
      id: `${item.id}:${item.value ?? 'default'}:${Date.now()}`,
      title: item.label,
      uri: getNotificationSoundPreviewUri(item.value),
    });
  };
  const storeSpecialClosureRows = draft.storeOperatingHoursSpecialClosuresText
    .split(/\r?\n/)
    .map((line, index) => {
      const [date = '', label = ''] = line.split('|');
      return {
        date: date.trim(),
        id: `${index}-${date.trim()}`,
        index,
        label: label.trim(),
        line,
      };
    })
    .filter(row => row.date.length > 0);
  const addStoreSpecialClosure = () => {
    const date = draft.storeOperatingHoursSpecialClosureDate.trim();

    if (!date || disabled) {
      return;
    }

    const label = draft.storeOperatingHoursSpecialClosureLabel.trim();
    const nextLine = [date, label].filter(Boolean).join('|');
    const current = draft.storeOperatingHoursSpecialClosuresText.trim();
    setDraftField(
      'storeOperatingHoursSpecialClosuresText',
      current ? `${current}\n${nextLine}` : nextLine,
    );
    setDraftField('storeOperatingHoursSpecialClosureDate', '');
    setDraftField('storeOperatingHoursSpecialClosureLabel', '');
  };
  const removeStoreSpecialClosure = (index: number) => {
    if (disabled) {
      return;
    }

    setDraftField(
      'storeOperatingHoursSpecialClosuresText',
      draft.storeOperatingHoursSpecialClosuresText
        .split(/\r?\n/)
        .filter((line, lineIndex) => line.trim() && lineIndex !== index)
        .join('\n'),
    );
  };
  const updateStaffAttendanceWorkSite = (
    index: number,
    patch: Partial<KolamStaffAttendanceWorkSite>,
  ) => {
    if (disabled) {
      return;
    }

    setDraftField(
      'staffAttendanceWorkSites',
      draft.staffAttendanceWorkSites.map((site, siteIndex) =>
        siteIndex === index ? { ...site, ...patch } : site,
      ),
    );
  };
  const addStaffAttendanceWorkSite = () => {
    if (disabled) {
      return;
    }

    setDraftField('staffAttendanceWorkSites', [
      ...draft.staffAttendanceWorkSites,
      {
        name: 'Kantor',
        latitude: -6.2088,
        longitude: 106.8456,
        radiusMeters: 150,
        active: true,
      },
    ]);
  };
  const removeStaffAttendanceWorkSite = (index: number) => {
    if (disabled) {
      return;
    }

    setDraftField(
      'staffAttendanceWorkSites',
      draft.staffAttendanceWorkSites.filter(
        (_, siteIndex) => siteIndex !== index,
      ),
    );
  };
  const geocodeStaffAttendanceWorkSite = async (
    index: number,
    site: KolamStaffAttendanceWorkSite,
  ) => {
    const siteKey = getWorkSiteDraftKey(site, index);
    const query = (workSiteGeocodeQueries[siteKey] ?? site.name ?? '').trim();

    if (!query || disabled || draft.staffAttendanceMapProvider === 'google') {
      return;
    }

    setWorkSiteGeocodeStatus(current => ({
      ...current,
      [siteKey]: { message: '', status: 'loading' },
    }));

    try {
      const result = await geocodeKolamStaffAttendanceWorkSite(query);
      updateStaffAttendanceWorkSite(index, {
        latitude: result.latitude,
        longitude: result.longitude,
      });
      setWorkSiteGeocodeStatus(current => ({
        ...current,
        [siteKey]: {
          message: result.displayName
            ? `Koordinat ditemukan: ${result.displayName}`
            : 'Koordinat ditemukan.',
          status: 'saved',
        },
      }));
    } catch (error) {
      setWorkSiteGeocodeStatus(current => ({
        ...current,
        [siteKey]: {
          message: getWorkSiteGeocodeErrorMessage(error),
          status: 'error',
        },
      }));
    }
  };
  const selectableOperationalRooms = operationalRooms.filter(
    room => room.category !== 'ai' && !room.isAiRoom,
  );
  const roomOptions =
    draft.poWorkflowReceivingRoomId &&
    !selectableOperationalRooms.some(
      room => room._id === draft.poWorkflowReceivingRoomId,
    )
      ? [
          {
            _id: draft.poWorkflowReceivingRoomId,
            name: 'Room tersimpan',
          } satisfies KolamTeamChatRoom,
          ...selectableOperationalRooms,
        ]
      : selectableOperationalRooms;
  const roomSummary = roomOptions.length
    ? roomOptions
        .slice(0, 5)
        .map(room => `${getTeamChatRoomLabel(room)} (${room._id})`)
        .join(' | ')
    : 'Room list belum tersedia.';
  const staffSummary = operationalStaffRows.length
    ? operationalStaffRows
        .slice(0, 5)
        .map(staff => `${getUserPickerLabel(staff)} (${staff._id})`)
        .join(' | ')
    : 'Staff list belum tersedia.';
  const togglePoWorkflowStaffOverride = (
    field:
      | 'poWorkflowNotifyReceiveUserIds'
      | 'poWorkflowNotifyCheckUserIds'
      | 'poWorkflowNotifyCompleteUserIds',
    userId: string,
  ) => {
    if (disabled) {
      return;
    }

    const current = new Set(parseDelimitedIds(draft[field]));
    if (current.has(userId)) {
      current.delete(userId);
    } else {
      current.add(userId);
    }
    onSaveOperationalPoWorkflow({
      [field]: Array.from(current).join('\n'),
    } as Partial<WebSettingDraft>);
  };
  const renderPoWorkflowStaffPicker = (
    field:
      | 'poWorkflowNotifyReceiveUserIds'
      | 'poWorkflowNotifyCheckUserIds'
      | 'poWorkflowNotifyCompleteUserIds',
    label: string,
  ) => {
    const selectedIds = new Set(parseDelimitedIds(draft[field]));

    return (
      <View style={styles.poStaffPicker} key={field}>
        <KolamCopyStack
          items={[
            {
              id: `${field}-label`,
              text: label,
              style: styles.marketplaceOverviewLabel,
            },
            {
              id: `${field}-meta`,
              text: 'Kosong = semua staff dengan permission tahap. Centang untuk override ke staff tertentu.',
              style: styles.marketplaceOverviewMeta,
            },
          ]}
        />
        {operationalStaffRows.length ? (
          <View style={styles.poStaffGrid}>
            {operationalStaffRows.map(staff => {
              const checked = selectedIds.has(staff._id);

              return (
                <Pressable
                  key={`${field}-${staff._id}`}
                  disabled={disabled}
                  onPress={() =>
                    togglePoWorkflowStaffOverride(field, staff._id)
                  }
                  style={[
                    styles.poStaffCheckbox,
                    checked && styles.poStaffCheckboxActive,
                    disabled && styles.poStaffCheckboxDisabled,
                  ]}
                >
                  <View
                    style={[
                      styles.poStaffCheckboxMark,
                      checked && styles.poStaffCheckboxMarkActive,
                    ]}
                  >
                    {checked ? (
                      <Text style={styles.poStaffCheckboxMarkText}>x</Text>
                    ) : null}
                  </View>
                  <KolamCopyStack
                    containerStyle={styles.poStaffCheckboxCopy}
                    items={[
                      {
                        id: `${field}-${staff._id}-name`,
                        text: getUserPickerLabel(staff),
                        style: styles.notificationSoundLabel,
                      },
                      {
                        id: `${field}-${staff._id}-id`,
                        text: staff._id,
                        style: styles.notificationSoundPath,
                      },
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>
        ) : (
          <KolamCopyStack
            items={[
              {
                id: `${field}-empty`,
                text: 'Staff list belum tersedia.',
                style: styles.marketplaceOverviewMeta,
              },
            ]}
          />
        )}
      </View>
    );
  };
  const renderNotificationSoundRow = (
    item: (typeof notificationSoundItems)[number],
  ) => {
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
              text: getNotificationSoundFileName(item.value),
              style: styles.notificationSoundPath,
            },
          ]}
        />
        <View style={styles.notificationSoundActions}>
          <KolamActionControlButton
            label="Tes suara"
            disabled={busy}
            onPress={() => playNotificationSound(item)}
          />
          <KolamActionControlButton
            label="Unggah"
            loading={status === 'uploading'}
            loadingLabel="Mengunggah..."
            disabled={disabled || busy}
            onPress={() => onUploadNotificationSound(item.type)}
          />
          <KolamActionControlButton
            label="Atur ulang"
            intent="danger"
            loading={status === 'deleting'}
            loadingLabel="Mengatur ulang..."
            disabled={disabled || busy || !item.value}
            onPress={() => onDeleteNotificationSound(item.type)}
          />
        </View>
      </View>
    );
  };

  return (
    <KolamContentFrame variant="settingsWebConfig">
      {showGeneralSettings ? (
        <>
          <KolamTextFieldRow
            variant="settingsForm"
            fieldWidth={settingsFieldWidth}
            label="Versi Kolam"
            description="Disimpan melalui PUT /websetting/version untuk app kolam."
            value={draft.versionKolam}
            onChangeText={value => setDraftField('versionKolam', value)}
            placeholder="1.0.0"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            fieldWidth={settingsFieldWidth}
            label="Versi Enclonura"
            description="Disimpan melalui endpoint version app enclonura."
            value={draft.versionEnclonura}
            onChangeText={value => setDraftField('versionEnclonura', value)}
            placeholder="1.0.0"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            fieldWidth={settingsFieldWidth}
            label="Versi POS"
            description="Disimpan melalui endpoint version app pos."
            value={draft.versionPos}
            onChangeText={value => setDraftField('versionPos', value)}
            placeholder="1.0.0"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            fieldWidth={settingsFieldWidth}
            label="Versi Marketplace"
            description="Disimpan melalui endpoint version app marketplace."
            value={draft.versionMarketplace}
            onChangeText={value => setDraftField('versionMarketplace', value)}
            placeholder="1.0.0"
          />
          <KolamSettingsWebFormSections
            sections={generalFormSections}
            onUploadFile={onUploadMarketplaceLogo}
          />
          <KolamTextFieldRow
            variant="settingsForm"
            fieldWidth={settingsFieldWidth}
            label="Nama Perusahaan"
            description="Nama perusahaan dan branding storefront."
            value={draft.companyName || webTitle}
            onChangeText={value => {
              if (disabled) {
                return;
              }
              setDraftField('companyName', value);
              onWebTitleChange(value);
            }}
            placeholder="Nama perusahaan"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            fieldWidth={settingsFieldWidth}
            label="Tagline Perusahaan"
            description="Tagline branding yang tampil di storefront."
            value={draft.companyTagline}
            onChangeText={value => setDraftField('companyTagline', value)}
            placeholder="Toko hewan terpercaya"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            fieldWidth={settingsFieldWidth}
            label="Telepon"
            description="Nomor kontak customer."
            value={draft.phone}
            onChangeText={value => setDraftField('phone', value)}
            placeholder="+62 812-3456-7890"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            fieldWidth={settingsFieldWidth}
            label="Email"
            description="Email kontak customer."
            value={draft.email}
            onChangeText={value => setDraftField('email', value)}
            placeholder="info@duniaanura.com"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            fieldWidth={settingsFieldWidth}
            label="Alamat"
            description="Alamat bisnis utama."
            multiline
            numberOfLines={4}
            value={draft.address}
            onChangeText={value => setDraftField('address', value)}
            placeholder="Jl. Contoh No. 1"
          />
          {showOperationalSettings ? (
            <>
              <KolamToggleRow
                variant="settingsForm"
                label={fields[1].label}
                description={fields[1].description}
                active={draft.livechatOnline}
                onPress={() => {
                  if (disabled) {
                    return;
                  }
                  onSaveOperationalLivechat(!draft.livechatOnline);
                }}
              />
              <KolamToggleRow
                variant="settingsForm"
                label={fields[2].label}
                description={fields[2].description}
                active={draft.maintenancePos}
                onPress={() => {
                  if (disabled) {
                    return;
                  }
                  onSaveOperationalMaintenance('pos', !draft.maintenancePos);
                }}
              />
              <KolamToggleRow
                variant="settingsForm"
                label="Maintenance marketplace"
                description="Aktifkan mode pemeliharaan untuk Marketplace."
                active={draft.maintenanceMarketplace}
                onPress={() =>
                  !disabled &&
                  onSaveOperationalMaintenance(
                    'marketplace',
                    !draft.maintenanceMarketplace,
                  )
                }
              />
            </>
          ) : null}
          {showStoreShippingSettings ? (
            <>
              <KolamTextFieldRow
                variant="settingsForm"
                fieldWidth={settingsFieldWidth}
                label="Alamat asal"
                description="Alamat asal pengiriman."
                multiline
                numberOfLines={4}
                value={draft.originAddressLine1}
                onChangeText={value =>
                  setDraftField('originAddressLine1', value)
                }
                placeholder="Jl. Taman Ratu Raya No.34"
              />
              <KolamTextFieldRow
                variant="settingsForm"
                fieldWidth={settingsFieldWidth}
                label="Kota asal"
                description="Kota asal pengiriman."
                value={draft.originCity}
                onChangeText={value => setDraftField('originCity', value)}
                placeholder="Jakarta Barat"
              />
              <KolamTextFieldRow
                variant="settingsForm"
                fieldWidth={settingsFieldWidth}
                label="Provinsi asal"
                description="Provinsi asal pengiriman."
                value={draft.originProvince}
                onChangeText={value => setDraftField('originProvince', value)}
                placeholder="DKI Jakarta"
              />
              <KolamTextFieldRow
                variant="settingsForm"
                fieldWidth={settingsFieldWidth}
                label="Kode pos asal"
                description="Kode pos asal pengiriman."
                value={draft.originPostalCode}
                onChangeText={value => setDraftField('originPostalCode', value)}
                placeholder="11550"
              />
              <KolamTextFieldRow
                variant="settingsForm"
                fieldWidth={settingsFieldWidth}
                label="Latitude asal"
                description="Koordinat latitude origin."
                value={draft.originLatitude}
                onChangeText={value => setDraftField('originLatitude', value)}
                placeholder="-6.1687829"
              />
              <KolamTextFieldRow
                variant="settingsForm"
                fieldWidth={settingsFieldWidth}
                label="Longitude asal"
                description="Koordinat longitude origin."
                value={draft.originLongitude}
                onChangeText={value => setDraftField('originLongitude', value)}
                placeholder="106.7676678"
              />
            </>
          ) : null}
          <KolamTextFieldRow
            variant="settingsForm"
            fieldWidth={settingsFieldWidth}
            label="Facebook"
            description="Tautan Facebook storefront."
            value={draft.facebook}
            onChangeText={value => setDraftField('facebook', value)}
            placeholder="https://facebook.com/..."
          />
          <KolamTextFieldRow
            variant="settingsForm"
            fieldWidth={settingsFieldWidth}
            label="Instagram"
            description="Tautan Instagram storefront."
            value={draft.instagram}
            onChangeText={value => setDraftField('instagram', value)}
            placeholder="https://instagram.com/..."
          />
          <KolamTextFieldRow
            variant="settingsForm"
            fieldWidth={settingsFieldWidth}
            label="Twitter"
            description="Tautan Twitter/X storefront."
            value={draft.twitter}
            onChangeText={value => setDraftField('twitter', value)}
            placeholder="https://twitter.com/..."
          />
          <KolamTextFieldRow
            variant="settingsForm"
            fieldWidth={settingsFieldWidth}
            label="YouTube"
            description="Tautan YouTube storefront."
            value={draft.youtube}
            onChangeText={value => setDraftField('youtube', value)}
            placeholder="https://youtube.com/..."
          />
          <KolamTextFieldRow
            variant="settingsForm"
            fieldWidth={settingsFieldWidth}
            label="TikTok"
            description="Tautan TikTok storefront."
            value={draft.tiktok}
            onChangeText={value => setDraftField('tiktok', value)}
            placeholder="https://tiktok.com/..."
          />
          <KolamToggleRow
            variant="settingsForm"
            label="Khusus desktop staff"
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
            variant="settingsForm"
            fieldWidth={settingsFieldWidth}
            label="URL redirect staff"
            description="URL redirect jika staff desktop-only aktif."
            value={draft.staffDesktopOnlyRedirectUrl}
            onChangeText={value =>
              setDraftField('staffDesktopOnlyRedirectUrl', value)
            }
            placeholder="https://..."
          />
          <KolamToggleRow
            variant="settingsForm"
            label="Akses MAC"
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
            variant="settingsForm"
            label="Izinkan browser web"
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
            variant="settingsForm"
            label="Lewati super admin"
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
            variant="settingsForm"
            fieldWidth={settingsFieldWidth}
            label="Daftar MAC diizinkan"
            description="Pisahkan dengan koma atau baris baru."
            multiline
            numberOfLines={4}
            value={draft.kolamMacAccessAllowedMacAddresses}
            onChangeText={value =>
              setDraftField('kolamMacAccessAllowedMacAddresses', value)
            }
            placeholder="AA:BB:CC:DD:EE:FF"
          />
          {showNotificationSettings ? (
            <>
              <KolamToggleRow
                variant="settingsForm"
                label="OTP masuk staf"
                description="Aktifkan OTP untuk masuk staf produksi."
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
                variant="settingsForm"
                label="Menit kedaluwarsa OTP"
                description="Durasi OTP aktif sebelum kadaluarsa."
                value={draft.staffOtpExpireMinutes}
                onChangeText={value =>
                  setDraftField('staffOtpExpireMinutes', value)
                }
                placeholder="10"
              />
              <KolamTextFieldRow
                variant="settingsForm"
                label="Jeda kirim ulang OTP"
                description="Jeda detik sebelum OTP boleh dikirim ulang."
                value={draft.staffOtpResendCooldownSeconds}
                onChangeText={value =>
                  setDraftField('staffOtpResendCooldownSeconds', value)
                }
                placeholder="60"
              />
              <KolamTextFieldRow
                variant="settingsForm"
                label="Maks percobaan OTP"
                description="Batas percobaan OTP sebelum lock."
                value={draft.staffOtpMaxAttempts}
                onChangeText={value =>
                  setDraftField('staffOtpMaxAttempts', value)
                }
                placeholder="5"
              />
              <KolamTextFieldRow
                variant="settingsForm"
                label="Menit lock OTP"
                description="Durasi lock setelah percobaan OTP melewati batas."
                value={draft.staffOtpLockMinutes}
                onChangeText={value =>
                  setDraftField('staffOtpLockMinutes', value)
                }
                placeholder="15"
              />
              <KolamTextFieldRow
                variant="settingsForm"
                label="Server SMTP"
                description="Server SMTP untuk email sistem."
                value={draft.smtpHost}
                onChangeText={value => setDraftField('smtpHost', value)}
                placeholder="smtp.gmail.com"
              />
              <KolamTextFieldRow
                variant="settingsForm"
                label="SMTP port"
                description="Port SMTP produksi."
                value={draft.smtpPort}
                onChangeText={value => setDraftField('smtpPort', value)}
                placeholder="465"
              />
              <KolamTextFieldRow
                variant="settingsForm"
                label="Pengguna SMTP"
                description="Nama pengguna SMTP."
                value={draft.smtpUser}
                onChangeText={value => setDraftField('smtpUser', value)}
                placeholder="mailer@duniaanura.com"
              />
              <KolamTextFieldRow
                variant="settingsForm"
                label="Kata sandi SMTP"
                description="Biarkan ******** agar secret BE tidak dikirim ulang."
                value={draft.smtpPass}
                onChangeText={value => setDraftField('smtpPass', value)}
                placeholder="********"
              />
              <KolamTextFieldRow
                variant="settingsForm"
                label="Email pengirim SMTP"
                description="Alamat pengirim email sistem."
                value={draft.smtpFromEmail}
                onChangeText={value => setDraftField('smtpFromEmail', value)}
                placeholder="no-reply@duniaanura.com"
              />
              <KolamTextFieldRow
                variant="settingsForm"
                label="Nama pengirim SMTP"
                description="Nama pengirim email sistem."
                value={draft.smtpFromName}
                onChangeText={value => setDraftField('smtpFromName', value)}
                placeholder="Kolam"
              />
              <KolamToggleRow
                variant="settingsForm"
                label="SMTP aman"
                description="Gunakan koneksi SMTP aman."
                active={draft.smtpSecure}
                onPress={() =>
                  !disabled && setDraftField('smtpSecure', !draft.smtpSecure)
                }
              />
              <KolamToggleRow
                variant="settingsForm"
                label="Firebase"
                description="Aktifkan Firebase Admin untuk notifikasi."
                active={draft.firebaseEnabled}
                onPress={() =>
                  !disabled &&
                  setDraftField('firebaseEnabled', !draft.firebaseEnabled)
                }
              />
              <KolamTextFieldRow
                variant="settingsForm"
                label="ID proyek Firebase"
                description="ID proyek Firebase produksi."
                value={draft.firebaseProjectId}
                onChangeText={value =>
                  setDraftField('firebaseProjectId', value)
                }
                placeholder="dunia-anura"
              />
              <KolamTextFieldRow
                variant="settingsForm"
                label="Email klien Firebase"
                description="Email klien akun layanan."
                value={draft.firebaseClientEmail}
                onChangeText={value =>
                  setDraftField('firebaseClientEmail', value)
                }
                placeholder="firebase-adminsdk@..."
              />
              <KolamTextFieldRow
                variant="settingsForm"
                label="Kunci privat Firebase"
                description="Biarkan ******** agar kunci privat BE tidak dikirim ulang."
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
                variant="settingsForm"
                label="Chat storefront"
                description="Aktifkan chat pada storefront."
                active={draft.chatStoreEnabled}
                onPress={() =>
                  !disabled &&
                  setDraftField('chatStoreEnabled', !draft.chatStoreEnabled)
                }
              />
              <KolamToggleRow
                variant="settingsForm"
                label="Panggilan grup chat tim"
                description="Aktifkan panggilan grup di chat tim."
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
                variant="settingsForm"
                label="Bisnis DARA"
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
                variant="settingsForm"
                label="Tools DARA"
                description="Aktifkan tool runtime DARA."
                active={draft.daraToolsEnabled}
                onPress={() =>
                  !disabled &&
                  setDraftField('daraToolsEnabled', !draft.daraToolsEnabled)
                }
              />
              <KolamToggleRow
                variant="settingsForm"
                label="Knowledge DARA"
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
                variant="settingsForm"
                label="Pajak DARA"
                description="Aktifkan modul pajak DARA."
                active={draft.daraTaxEnabled}
                onPress={() =>
                  !disabled &&
                  setDraftField('daraTaxEnabled', !draft.daraTaxEnabled)
                }
              />
              <KolamToggleRow
                variant="settingsForm"
                label="DARA SEO"
                description="Aktifkan fitur SEO DARA."
                active={draft.daraSeoEnabled}
                onPress={() =>
                  !disabled &&
                  setDraftField('daraSeoEnabled', !draft.daraSeoEnabled)
                }
              />
              <KolamToggleRow
                variant="settingsForm"
                label="Notifikasi alih tangan DARA"
                description="Kirim notifikasi saat pelanggan dialihkan."
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
                variant="settingsForm"
                label="Insight DARA"
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
                variant="settingsForm"
                label="Laporan otomatis DARA"
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
                variant="settingsForm"
                label="Analisis gambar DARA"
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
                variant="settingsForm"
                label="Watcher pajak DARA"
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
                variant="settingsForm"
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
                variant="settingsForm"
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
                variant="settingsForm"
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
                variant="settingsForm"
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
                variant="settingsForm"
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
                variant="settingsForm"
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
                variant="settingsForm"
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
                variant="settingsForm"
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
                variant="settingsForm"
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
                variant="settingsForm"
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
                          label="Unggah"
                          loading={status === 'uploading'}
                          loadingLabel="Mengunggah..."
                          disabled={disabled || busy}
                          onPress={() => onUploadNotificationSound(item.type)}
                        />
                        <KolamActionControlButton
                          label="Reset"
                          intent="danger"
                          loading={status === 'deleting'}
                          loadingLabel="Mereset..."
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
          <KolamCopyStack
            items={[
              {
                id: 'operational-maintenance-title',
                text: 'Mode pemeliharaan',
                style: styles.marketplaceOverviewTitle,
              },
              {
                id: 'operational-maintenance-meta',
                text: 'Aktifkan atau nonaktifkan mode pemeliharaan untuk POS dan Marketplace.',
                style: styles.marketplaceOverviewMeta,
              },
            ]}
          />
          <KolamToggleRow
            variant="settingsForm"
            label={fields[2].label}
            description={fields[2].description}
            active={draft.maintenancePos}
            onPress={() => {
              if (disabled) {
                return;
              }
              onSaveOperationalMaintenance('pos', !draft.maintenancePos);
            }}
          />
          <KolamToggleRow
            variant="settingsForm"
            label="Maintenance marketplace"
            description="Aktifkan mode pemeliharaan untuk Marketplace."
            active={draft.maintenanceMarketplace}
            onPress={() =>
              !disabled &&
              onSaveOperationalMaintenance(
                'marketplace',
                !draft.maintenanceMarketplace,
              )
            }
          />
          <KolamCopyStack
            items={[
              {
                id: 'operational-google-title',
                text: 'Google Sign-In (Webstore)',
                style: styles.marketplaceOverviewTitle,
              },
              {
                id: 'operational-google-meta',
                text: 'Izinkan pembeli daftar atau masuk dengan akun Google di webstore.',
                style: styles.marketplaceOverviewMeta,
              },
            ]}
          />
          <KolamToggleRow
            variant="settingsForm"
            label="Google Sign-In webstore"
            description="Aktifkan OAuth Google untuk customer webstore."
            active={draft.webstoreGoogleAuthEnabled}
            onPress={() =>
              !disabled &&
              onSaveOperationalGoogleAuth({
                webstoreGoogleAuthEnabled: !draft.webstoreGoogleAuthEnabled,
              })
            }
          />
          <KolamTextFieldRow
            variant="settingsForm"
            fieldWidth={settingsFieldWidth}
            label="Google OAuth client ID"
            description="OAuth 2.0 Web client ID untuk webstore."
            value={draft.googleOAuthClientId}
            onChangeText={value => setDraftField('googleOAuthClientId', value)}
            placeholder="xxxx.apps.googleusercontent.com"
          />
          <KolamActionControlButton
            label="Simpan Client ID"
            loading={saveStatus === 'saving'}
            loadingLabel="Menyimpan..."
            disabled={disabled}
            onPress={() =>
              onSaveOperationalGoogleAuth({
                googleOAuthClientId: draft.googleOAuthClientId.trim(),
              })
            }
          />
          <KolamCopyStack
            items={[
              {
                id: 'operational-attendance-title',
                text: 'Absensi karyawan',
                style: styles.marketplaceOverviewTitle,
              },
              {
                id: 'operational-attendance-meta',
                text: 'Cut-off gaji, jam kerja, toleransi telat, komisi layanan, lokasi GPS, dan verifikasi wajah.',
                style: styles.marketplaceOverviewMeta,
              },
            ]}
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Tanggal cut-off gaji"
            description="Tanggal cut-off payroll bulanan."
            value={draft.staffAttendancePayrollCutoffDay}
            onChangeText={value =>
              setDraftField('staffAttendancePayrollCutoffDay', value)
            }
            placeholder="28"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Jam mulai kerja (WIB)"
            description="Jam mulai kerja default."
            value={draft.staffAttendanceWorkStartTime}
            onChangeText={value =>
              setDraftField('staffAttendanceWorkStartTime', value)
            }
            placeholder="08:00"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Jam selesai kerja (WIB)"
            description="Jam selesai kerja default."
            value={draft.staffAttendanceWorkEndTime}
            onChangeText={value =>
              setDraftField('staffAttendanceWorkEndTime', value)
            }
            placeholder="17:00"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Komisi layanan dalam jam kerja (%)"
            description="Persentase komisi layanan saat masih dalam jam kerja."
            value={draft.staffAttendanceServiceCommissionInsideHoursPct}
            onChangeText={value =>
              setDraftField(
                'staffAttendanceServiceCommissionInsideHoursPct',
                value,
              )
            }
            placeholder="0"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Komisi layanan luar jam kerja (%)"
            description="Persentase komisi layanan saat di luar jam kerja."
            value={draft.staffAttendanceServiceCommissionOutsideHoursPct}
            onChangeText={value =>
              setDraftField(
                'staffAttendanceServiceCommissionOutsideHoursPct',
                value,
              )
            }
            placeholder="0"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Toleransi telat (menit)"
            description="Menit toleransi keterlambatan."
            value={draft.staffAttendanceLateToleranceMinutes}
            onChangeText={value =>
              setDraftField('staffAttendanceLateToleranceMinutes', value)
            }
            placeholder="15"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Maks tier 2 absensi"
            description="Batas menit tier keterlambatan kedua."
            value={draft.staffAttendanceLateTier2MaxMinutes}
            onChangeText={value =>
              setDraftField('staffAttendanceLateTier2MaxMinutes', value)
            }
            placeholder="120"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Batas check-in absensi"
            description="Batas menit clock-in terlambat."
            value={draft.staffAttendanceLateCheckInDeadlineMinutes}
            onChangeText={value =>
              setDraftField('staffAttendanceLateCheckInDeadlineMinutes', value)
            }
            placeholder="240"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Denda telat tier 2 (Rp)"
            description="Nominal denda tier 2."
            value={draft.staffAttendanceLateFineTier2}
            onChangeText={value =>
              setDraftField('staffAttendanceLateFineTier2', value)
            }
            placeholder="50000"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Denda telat tier 3 (Rp)"
            description="Nominal denda tier 3."
            value={draft.staffAttendanceLateFineTier3}
            onChangeText={value =>
              setDraftField('staffAttendanceLateFineTier3', value)
            }
            placeholder="100000"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Pembagi gaji harian (absen)"
            description="Pembagi harian untuk potongan absen."
            value={draft.staffAttendanceAbsentDailyDivisor}
            onChangeText={value =>
              setDraftField('staffAttendanceAbsentDailyDivisor', value)
            }
            placeholder="30"
          />
          <KolamToggleRow
            variant="settingsForm"
            label="Wajib GPS"
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
            variant="settingsForm"
            label="Wajib verifikasi wajah"
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
          <View style={styles.attendanceProviderRow}>
            <KolamCopyStack
              containerStyle={styles.attendanceProviderCopy}
              items={[
                {
                  id: 'attendance-provider-label',
                  text: 'Peta lokasi absen',
                  style: styles.notificationSoundLabel,
                },
                {
                  id: 'attendance-provider-description',
                  text: 'Pilih provider peta untuk lokasi kerja dan validasi radius check-in.',
                  style: styles.marketplaceOverviewDetail,
                },
              ]}
            />
            <View style={styles.attendanceProviderChoices}>
              <KolamChoiceSegment
                id="openstreetmap"
                label="OpenStreetMap (gratis, disarankan)"
                selectedId={
                  draft.staffAttendanceMapProvider === 'google'
                    ? 'google'
                    : 'openstreetmap'
                }
                onSelect={value =>
                  !disabled &&
                  setDraftField('staffAttendanceMapProvider', value)
                }
              />
              <KolamChoiceSegment
                id="google"
                label="Google Maps (butuh API key)"
                selectedId={
                  draft.staffAttendanceMapProvider === 'google'
                    ? 'google'
                    : 'openstreetmap'
                }
                onSelect={value =>
                  !disabled &&
                  setDraftField('staffAttendanceMapProvider', value)
                }
              />
            </View>
          </View>
          {draft.staffAttendanceMapProvider === 'google' ? (
            <KolamTextFieldRow
              variant="settingsForm"
              label="Google Maps API key (browser)"
              description="Opsional jika key yang sama sudah di tab Toko & Pengiriman. Kosongkan untuk pakai key Toko."
              value={draft.staffAttendanceGoogleMapsBrowserApiKey}
              onChangeText={value =>
                setDraftField('staffAttendanceGoogleMapsBrowserApiKey', value)
              }
              placeholder="AIza..."
            />
          ) : (
            <>
              <KolamTextFieldRow
                variant="settingsForm"
                label="URL Nominatim (geocoding)"
                description="Tanpa API key. Default server OSM; jangan spam request."
                value={draft.staffAttendanceOsmNominatimUrl}
                onChangeText={value =>
                  setDraftField('staffAttendanceOsmNominatimUrl', value)
                }
                placeholder="https://nominatim.openstreetmap.org"
              />
              <KolamTextFieldRow
                variant="settingsForm"
                label="URL tile peta"
                description="Dipakai jika provider peta absen memakai OpenStreetMap."
                value={draft.staffAttendanceOsmTileUrl}
                onChangeText={value =>
                  setDraftField('staffAttendanceOsmTileUrl', value)
                }
                placeholder="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </>
          )}
          <KolamTextFieldRow
            variant="settingsForm"
            label="Threshold face match"
            description="Ambang face match 0.5 sampai 0.99."
            value={draft.staffAttendanceFaceMatchThreshold}
            onChangeText={value =>
              setDraftField('staffAttendanceFaceMatchThreshold', value)
            }
            placeholder="0.72"
          />
          <View style={styles.workSiteSection}>
            <View style={styles.workSiteHeaderRow}>
              <KolamCopyStack
                containerStyle={styles.workSiteHeaderCopy}
                items={[
                  {
                    id: 'work-site-title',
                    text: 'Lokasi kerja (GPS + radius)',
                    style: styles.marketplaceOverviewLabel,
                  },
                  {
                    id: 'work-site-meta',
                    text: 'Editor list native sederhana. Map belum dipasang; isi koordinat dan radius validasi check-in.',
                    style: styles.marketplaceOverviewMeta,
                  },
                ]}
              />
              <KolamActionControlButton
                label="Tambah lokasi"
                disabled={disabled}
                onPress={addStaffAttendanceWorkSite}
              />
            </View>
            {draft.staffAttendanceWorkSites.length ? (
              <View style={styles.workSiteList}>
                {draft.staffAttendanceWorkSites.map((site, index) => {
                  const siteKey = getWorkSiteDraftKey(site, index);
                  const geocodeStatus = workSiteGeocodeStatus[siteKey];
                  const geocodeQuery =
                    workSiteGeocodeQueries[siteKey] ?? site.name ?? '';
                  const geocodeLoading = geocodeStatus?.status === 'loading';
                  const geocodeDisabled =
                    disabled ||
                    geocodeLoading ||
                    !geocodeQuery.trim() ||
                    draft.staffAttendanceMapProvider === 'google';

                  return (
                    <View key={siteKey} style={styles.workSiteRow}>
                      <View style={styles.workSiteRowHeader}>
                        <KolamCopyStack
                          containerStyle={styles.workSiteHeaderCopy}
                          items={[
                            {
                              id: `${siteKey}-title`,
                              text: site.name?.trim()
                                ? site.name
                                : `Lokasi ${index + 1}`,
                              style: styles.notificationSoundLabel,
                            },
                            {
                              id: `${siteKey}-meta`,
                              text: `${formatWorkSiteCoordinate(
                                site.latitude,
                              )}, ${formatWorkSiteCoordinate(
                                site.longitude,
                              )} - Radius ${formatWorkSiteRadius(
                                site.radiusMeters,
                              )} m`,
                              style: styles.notificationSoundPath,
                            },
                          ]}
                        />
                        <KolamActionControlButton
                          label="Hapus"
                          intent="danger"
                          disabled={disabled}
                          onPress={() => removeStaffAttendanceWorkSite(index)}
                        />
                      </View>
                      <KolamTextFieldRow
                        variant="settingsForm"
                        fieldWidth={settingsFieldWidth}
                        label="Nama lokasi"
                        description="Nama kantor, gudang, toko, atau area kerja."
                        value={site.name ?? ''}
                        onChangeText={value =>
                          updateStaffAttendanceWorkSite(index, { name: value })
                        }
                        placeholder="Kantor"
                      />
                      <View style={styles.workSiteGeocodeRow}>
                        <KolamTextFieldRow
                          variant="settingsForm"
                          fieldWidth={settingsFieldWidth}
                          label="Cari alamat"
                          description={
                            draft.staffAttendanceMapProvider === 'google'
                              ? 'Pencarian server tersedia untuk OpenStreetMap. Map Google native belum dipasang.'
                              : 'Cari alamat via endpoint geocode backend, lalu isi latitude/longitude otomatis.'
                          }
                          value={geocodeQuery}
                          onChangeText={value =>
                            setWorkSiteGeocodeQueries(current => ({
                              ...current,
                              [siteKey]: value,
                            }))
                          }
                          placeholder="Alamat kantor / toko"
                        />
                        <KolamActionControlButton
                          label="Cari koordinat"
                          loading={geocodeLoading}
                          loadingLabel="Mencari..."
                          disabled={geocodeDisabled}
                          onPress={() =>
                            void geocodeStaffAttendanceWorkSite(index, site)
                          }
                        />
                      </View>
                      {geocodeStatus?.message ? (
                        <KolamCopyStack
                          items={[
                            {
                              id: `${siteKey}-geocode-message`,
                              text: geocodeStatus.message,
                              style:
                                geocodeStatus.status === 'error'
                                  ? styles.marketplaceOverviewError
                                  : styles.marketplaceOverviewMeta,
                            },
                          ]}
                        />
                      ) : null}
                      <View style={styles.workSiteCoordinateGrid}>
                        <KolamTextFieldRow
                          variant="settingsForm"
                          fieldWidth={220}
                          label="Latitude"
                          description="Koordinat lintang."
                          value={formatWorkSiteInputValue(site.latitude)}
                          onChangeText={value =>
                            updateStaffAttendanceWorkSite(index, {
                              latitude: parseWorkSiteNumber(value),
                            })
                          }
                          placeholder="-6.2088"
                        />
                        <KolamTextFieldRow
                          variant="settingsForm"
                          fieldWidth={220}
                          label="Longitude"
                          description="Koordinat bujur."
                          value={formatWorkSiteInputValue(site.longitude)}
                          onChangeText={value =>
                            updateStaffAttendanceWorkSite(index, {
                              longitude: parseWorkSiteNumber(value),
                            })
                          }
                          placeholder="106.8456"
                        />
                        <KolamTextFieldRow
                          variant="settingsForm"
                          fieldWidth={220}
                          label="Radius absen (meter)"
                          description="Minimum backend 20 meter."
                          value={formatWorkSiteInputValue(site.radiusMeters)}
                          onChangeText={value =>
                            updateStaffAttendanceWorkSite(index, {
                              radiusMeters: parseWorkSiteNumber(value),
                            })
                          }
                          placeholder="150"
                        />
                      </View>
                      <KolamToggleRow
                        variant="settingsForm"
                        label="Aktif"
                        description="Lokasi aktif ikut dipakai validasi radius check-in."
                        active={site.active !== false}
                        onPress={() =>
                          updateStaffAttendanceWorkSite(index, {
                            active: site.active === false,
                          })
                        }
                      />
                    </View>
                  );
                })}
              </View>
            ) : (
              <KolamCopyStack
                items={[
                  {
                    id: 'work-sites-empty',
                    text: 'Belum ada lokasi kerja.',
                    style: styles.marketplaceOverviewMeta,
                  },
                ]}
              />
            )}
          </View>
          <KolamTextFieldRow
            variant="settingsForm"
            label="Zona waktu absensi"
            description="Zona waktu untuk perhitungan absensi."
            value={draft.staffAttendanceTimezone}
            onChangeText={value =>
              setDraftField('staffAttendanceTimezone', value)
            }
            placeholder="Asia/Jakarta"
          />
          <KolamActionControlButton
            label="Simpan absensi"
            loading={saveStatus === 'saving'}
            loadingLabel="Menyimpan..."
            disabled={disabled}
            onPress={onSaveOperationalStaffAttendance}
          />
          <KolamCopyStack
            items={[
              {
                id: 'operational-livechat-title',
                text: 'Livechat',
                style: styles.marketplaceOverviewTitle,
              },
              {
                id: 'operational-livechat-meta',
                text: 'Override darurat agar banner chat tampil online meski di luar jam buka.',
                style: styles.marketplaceOverviewMeta,
              },
            ]}
          />
          <KolamToggleRow
            variant="settingsForm"
            label="Livechat Always Online"
            description="Jika off, jam operasional mengatur banner tutup/libur di dunia-anura.com."
            active={draft.livechatOnline}
            onPress={() => {
              if (disabled) {
                return;
              }
              onSaveOperationalLivechat(!draft.livechatOnline);
            }}
          />
          <KolamCopyStack
            items={[
              {
                id: 'operational-po-title',
                text: 'Purchase Order - penerimaan barang',
                style: styles.marketplaceOverviewTitle,
              },
              {
                id: 'operational-po-meta',
                text: 'Room Team Chat untuk bukti terima/QC, notifikasi per tahap, dan gate partial.',
                style: styles.marketplaceOverviewMeta,
              },
              {
                id: 'po-room-options',
                text: `Room Team Chat: ${roomSummary}`,
                style: styles.marketplaceOverviewDetail,
              },
              {
                id: 'po-staff-options',
                text: `Picker staff: ${staffSummary}`,
                style: styles.marketplaceOverviewDetail,
              },
            ]}
          />
          <View style={styles.poRoomPicker}>
            <KolamCopyStack
              items={[
                {
                  id: 'po-room-picker-label',
                  text: 'Room penerimaan barang (Team Chat)',
                  style: styles.marketplaceOverviewLabel,
                },
                {
                  id: 'po-room-picker-meta',
                  text: 'Upload bukti PO otomatis diposting ke room ini. Room AI tidak ditampilkan.',
                  style: styles.marketplaceOverviewMeta,
                },
              ]}
            />
            <View style={styles.poRoomChoices}>
              <KolamChoiceSegment
                id=""
                label="Pilih room"
                selectedId={draft.poWorkflowReceivingRoomId}
                onSelect={value =>
                  !disabled &&
                  onSaveOperationalPoWorkflow({
                    poWorkflowReceivingRoomId: value,
                  })
                }
                variant="button"
              />
              {roomOptions.map(room => (
                <KolamChoiceSegment
                  key={room._id}
                  id={room._id}
                  label={`${getTeamChatRoomLabel(room)}${
                    room.category ? ` (${room.category})` : ''
                  }`}
                  selectedId={draft.poWorkflowReceivingRoomId}
                  onSelect={value =>
                    !disabled &&
                    onSaveOperationalPoWorkflow({
                      poWorkflowReceivingRoomId: value,
                    })
                  }
                  variant="button"
                />
              ))}
            </View>
            {!roomOptions.length ? (
              <KolamCopyStack
                items={[
                  {
                    id: 'po-room-picker-empty',
                    text: 'Room Team Chat belum tersedia.',
                    style: styles.marketplaceOverviewMeta,
                  },
                ]}
              />
            ) : null}
          </View>
          <KolamToggleRow
            variant="settingsForm"
            label="Notif saat PO siap diterima / sudah diterima"
            description="Kirim notifikasi saat barang PO diterima."
            active={draft.poWorkflowNotifyOnReceive}
            onPress={() =>
              !disabled &&
              onSaveOperationalPoWorkflow({
                poWorkflowNotifyOnReceive: !draft.poWorkflowNotifyOnReceive,
              })
            }
          />
          <KolamToggleRow
            variant="settingsForm"
            label="Notif saat PO siap quality check"
            description="Kirim notifikasi saat QC/check PO berjalan."
            active={draft.poWorkflowNotifyOnCheck}
            onPress={() =>
              !disabled &&
              onSaveOperationalPoWorkflow({
                poWorkflowNotifyOnCheck: !draft.poWorkflowNotifyOnCheck,
              })
            }
          />
          <KolamToggleRow
            variant="settingsForm"
            label="Notif saat partial receive"
            description="Kirim notifikasi saat PO diterima sebagian."
            active={draft.poWorkflowNotifyOnPartial}
            onPress={() =>
              !disabled &&
              onSaveOperationalPoWorkflow({
                poWorkflowNotifyOnPartial: !draft.poWorkflowNotifyOnPartial,
              })
            }
          />
          <KolamToggleRow
            variant="settingsForm"
            label="Post bukti ke Team Chat"
            description="Posting bukti penerimaan/QC ke room Team Chat."
            active={draft.poWorkflowPostProofToTeamChat}
            onPress={() =>
              !disabled &&
              onSaveOperationalPoWorkflow({
                poWorkflowPostProofToTeamChat:
                  !draft.poWorkflowPostProofToTeamChat,
              })
            }
          />
          <KolamToggleRow
            variant="settingsForm"
            label="Partial: complete stok hanya admin/purchasing"
            description="Penerimaan sebagian wajib approval admin."
            active={draft.poWorkflowPartialCompleteRequiresAdmin}
            onPress={() =>
              !disabled &&
              onSaveOperationalPoWorkflow({
                poWorkflowPartialCompleteRequiresAdmin:
                  !draft.poWorkflowPartialCompleteRequiresAdmin,
              })
            }
          />
          {renderPoWorkflowStaffPicker(
            'poWorkflowNotifyReceiveUserIds',
            'Notif terima - staff override',
          )}
          {renderPoWorkflowStaffPicker(
            'poWorkflowNotifyCheckUserIds',
            'Notif QC - staff override',
          )}
          {renderPoWorkflowStaffPicker(
            'poWorkflowNotifyCompleteUserIds',
            'Notif masuk stok - staff override',
          )}
        </>
      ) : null}
      {showFinancialTaxSummary ? (
        <View style={styles.marketplaceOverview}>
          <KolamCopyStack
            items={[
              {
                id: 'financial-title',
                text: 'Ringkasan Finansial / Pajak',
                style: styles.marketplaceOverviewTitle,
              },
              {
                id: 'financial-status',
                text: 'Ringkasan live read-only. Editor update ditunda sampai kontrak endpoint/body final.',
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
      {showKpiSettings ? (
        <KpiSettingsPanel
          disabled={disabled || kpiStatus === 'saving' || !kpiPluginEnabled}
          draft={kpiSettingsDraft}
          message={kpiMessage}
          onRefreshPreview={onRefreshKpiWeeklyPreview}
          onSave={onSaveKpiSettings}
          onSetField={setKpiSettingsDraftField}
          onToggleRule={setKpiEnabledRule}
          pluginEnabled={kpiPluginEnabled}
          preview={kpiPreview}
          status={kpiStatus}
          summaryRows={kpiSummaryRows}
        />
      ) : null}
      {showSitemapSettings ? (
        <>
          <KolamToggleRow
            variant="settingsForm"
            label="Sitemap enabled"
            description="Master switch untuk sitemap marketplace."
            active={sitemapDraft.enabled !== false}
            onPress={() =>
              !disabled &&
              setSitemapMasterField('enabled', sitemapDraft.enabled === false)
            }
          />
          <KolamToggleRow
            variant="settingsForm"
            label="Include images"
            description="Sertakan image metadata pada sitemap jika tersedia."
            active={sitemapDraft.includeImages !== false}
            onPress={() =>
              !disabled &&
              setSitemapMasterField(
                'includeImages',
                sitemapDraft.includeImages === false,
              )
            }
          />
          <View style={styles.marketplaceOverview}>
            <KolamCopyStack
              items={[
                {
                  id: 'sitemap-sections-title',
                  text: 'Dynamic sections',
                  style: styles.marketplaceOverviewTitle,
                },
                {
                  id: 'sitemap-sections-meta',
                  text: 'Priority memakai angka 0 sampai 1. Frequency menerima always, hourly, daily, weekly, monthly, yearly, never.',
                  style: styles.marketplaceOverviewMeta,
                },
              ]}
            />
            {sitemapSectionKeys.map(section => {
              const item = sitemapDraft.sections?.[section] ?? {};
              return (
                <View key={section} style={styles.storeHoursRow}>
                  <KolamToggleRow
                    variant="settingsForm"
                    label={getSitemapSectionLabel(section)}
                    description="Aktifkan section dinamis pada sitemap."
                    active={item.enabled !== false}
                    onPress={() =>
                      !disabled &&
                      setSitemapSectionField(
                        section,
                        'enabled',
                        item.enabled === false,
                      )
                    }
                  />
                  <View style={styles.storeHoursTimeGrid}>
                    <KolamTextFieldRow
                      variant="settingsForm"
                      fieldWidth={140}
                      label="Priority"
                      description="Nilai 0 sampai 1."
                      value={String(item.priority ?? 0.5)}
                      onChangeText={value =>
                        setSitemapSectionField(section, 'priority', value)
                      }
                      placeholder="0.7"
                    />
                    <KolamTextFieldRow
                      variant="settingsForm"
                      fieldWidth={180}
                      label="Change frequency"
                      description="daily, weekly, monthly..."
                      value={item.changeFrequency ?? 'weekly'}
                      onChangeText={value =>
                        setSitemapSectionField(
                          section,
                          'changeFrequency',
                          value,
                        )
                      }
                      placeholder={sitemapChangeFrequencies.join(', ')}
                    />
                  </View>
                </View>
              );
            })}
          </View>
          <KolamTextFieldRow
            variant="settingsForm"
            label="Custom URLs"
            description="Satu baris per URL: /path|0.5|weekly."
            value={sitemapCustomUrlsText}
            onChangeText={setSitemapCustomUrlsDraftText}
            placeholder="/promo|0.8|daily"
          />
          {sitemapSectionKeys.map(section => (
            <KolamTextFieldRow
              variant="settingsForm"
              key={`excluded-${section}`}
              label={`Excluded ${getSitemapSectionLabel(section)}`}
              description="Slug dipisah koma atau baris baru."
              value={sitemapExcludedSlugsText[section] ?? ''}
              onChangeText={value =>
                setSitemapExcludedSlugsDraftText(section, value)
              }
              placeholder="slug-lama, draft-internal"
            />
          ))}
        </>
      ) : null}
      {showSyncSettings ? (
        <>
          <View style={styles.marketplaceOverview}>
            <KolamCopyStack
              items={[
                {
                  id: 'region-sync-title',
                  text: 'Master Wilayah',
                  style: styles.marketplaceOverviewTitle,
                },
                {
                  id: 'region-sync-meta',
                  text: 'Live dari /regions, /regions/stats, dan /regions/sync. Filter kosong tidak dikirim.',
                  style: styles.marketplaceOverviewMeta,
                },
              ]}
            />
            <View style={styles.marketplaceOverviewRows}>
              {regionSyncSummaryRows.map(row => (
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
          <View style={styles.storeHoursTimeGrid}>
            <KolamTextFieldRow
              variant="settingsForm"
              fieldWidth={170}
              label="Level"
              description="province, regency, district, village."
              value={regionLevel}
              onChangeText={value => setRegionFilter('level', value)}
              placeholder="province"
            />
            <KolamTextFieldRow
              variant="settingsForm"
              fieldWidth={180}
              label="Parent code"
              description="Kode parent untuk city/district/village."
              value={regionParentCode}
              onChangeText={value => setRegionFilter('parentCode', value)}
              placeholder="32.73"
            />
            <KolamTextFieldRow
              variant="settingsForm"
              fieldWidth={220}
              label="Search"
              description="Cari nama, kode, atau postal code."
              value={regionSearch}
              onChangeText={value => setRegionFilter('search', value)}
              placeholder="Bandung / 40111"
            />
          </View>
          <View style={styles.notificationSoundActions}>
            <KolamActionControlButton
              label="Refresh"
              loading={regionSyncStatus === 'loading'}
              loadingLabel="Refreshing..."
              onPress={onRefreshRegionSync}
            />
            {(
              [
                'all',
                'provinces',
                'regencies',
                'districts',
                'villages',
              ] as const
            ).map(scope => (
              <KolamActionControlButton
                key={scope}
                label={`Sync ${scope}`}
                loading={regionSyncStatus === 'syncing'}
                loadingLabel="Syncing..."
                disabled={regionSyncStatus === 'syncing'}
                onPress={() => onRunRegionSync(scope)}
              />
            ))}
          </View>
          {regionSyncMessage ? (
            <KolamCopyStack
              items={[
                {
                  id: 'region-sync-message',
                  text: regionSyncMessage,
                },
              ]}
            />
          ) : null}
          <View style={styles.marketplaceOverview}>
            <KolamCopyStack
              items={[
                {
                  id: 'region-table-title',
                  text: 'Table Region',
                  style: styles.marketplaceOverviewTitle,
                },
                {
                  id: 'region-table-meta',
                  text: `${regionRows.length} rows ditampilkan, urut code dari backend.`,
                  style: styles.marketplaceOverviewMeta,
                },
              ]}
            />
            <View style={styles.marketplaceOverviewRows}>
              {regionRows.slice(0, 100).map(region => (
                <View
                  key={region._id || region.code}
                  style={styles.marketplaceOverviewRow}
                >
                  <KolamCopyStack
                    containerStyle={styles.marketplaceOverviewCopy}
                    items={[
                      {
                        id: `${region.code}-name`,
                        text: `${region.code} - ${region.name}`,
                        style: styles.marketplaceOverviewLabel,
                      },
                      {
                        id: `${region.code}-meta`,
                        text: `${getRegionLevelLabel(region.level)} | parent ${
                          region.parentCode || '-'
                        } | postal ${region.postalCode || '-'}`,
                        style: styles.marketplaceOverviewDetail,
                      },
                    ]}
                  />
                  <KolamCopyStack
                    items={[
                      {
                        id: `${region.code}-updated`,
                        text: region.updatedAt ?? '-',
                        style: styles.marketplaceOverviewValue,
                      },
                    ]}
                  />
                </View>
              ))}
              {regionRows.length === 0 ? (
                <KolamCopyStack
                  items={[
                    {
                      id: 'region-empty',
                      text:
                        regionSyncStatus === 'loading'
                          ? 'Memuat wilayah...'
                          : 'Belum ada region untuk filter ini.',
                      style: styles.marketplaceOverviewMeta,
                    },
                  ]}
                />
              ) : null}
            </View>
          </View>
        </>
      ) : null}
      {showAiSettings ? (
        <>
          <KolamCopyStack
            items={[
              {
                id: 'ai-plugin-gate',
                text:
                  chatPluginEnabled && daraPluginEnabled
                    ? 'Plugin Chat dan DARA aktif. Kontrol AI siap disimpan ke Pengaturan Web.'
                    : `State nonaktif: ${
                        chatPluginEnabled ? '' : 'Plugin Chat nonaktif. '
                      }${
                        daraPluginEnabled ? '' : 'Plugin DARA nonaktif. '
                      }Aktifkan dari tab Plugin untuk mengubah kontrol terkait.`,
              },
            ]}
          />
          <KolamToggleRow
            variant="settingsForm"
            label="Chat storefront"
            description="Aktifkan chat pada storefront."
            active={draft.chatStoreEnabled}
            onPress={() =>
              !chatControlsDisabled &&
              setDraftField('chatStoreEnabled', !draft.chatStoreEnabled)
            }
          />
          <KolamToggleRow
            variant="settingsForm"
            label="Panggilan grup chat tim"
            description="Aktifkan panggilan grup di chat tim."
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
            variant="settingsForm"
            label="Balasan DARA Team Chat"
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
            variant="settingsForm"
            label="Bisnis DARA"
            description="Aktifkan fitur bisnis DARA."
            active={draft.daraBusinessEnabled}
            onPress={() =>
              !daraControlsDisabled &&
              setDraftField('daraBusinessEnabled', !draft.daraBusinessEnabled)
            }
          />
          <KolamToggleRow
            variant="settingsForm"
            label="Tools DARA"
            description="Aktifkan tool runtime DARA."
            active={draft.daraToolsEnabled}
            onPress={() =>
              !daraControlsDisabled &&
              setDraftField('daraToolsEnabled', !draft.daraToolsEnabled)
            }
          />
          <KolamToggleRow
            variant="settingsForm"
            label="Knowledge / SOP DARA"
            description="Aktifkan knowledge base dan SOP lookup DARA."
            active={draft.daraKnowledgeEnabled}
            onPress={() =>
              !daraControlsDisabled &&
              setDraftField('daraKnowledgeEnabled', !draft.daraKnowledgeEnabled)
            }
          />
          <KolamToggleRow
            variant="settingsForm"
            label="Notifikasi alih tangan DARA"
            description="Kirim notifikasi saat pelanggan dialihkan."
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
            variant="settingsForm"
            label="Insight DARA"
            description="Aktifkan insight otomatis DARA."
            active={draft.daraInsightsEnabled}
            onPress={() =>
              !daraControlsDisabled &&
              setDraftField('daraInsightsEnabled', !draft.daraInsightsEnabled)
            }
          />
          <KolamToggleRow
            variant="settingsForm"
            label="Laporan otomatis DARA"
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
            variant="settingsForm"
            label="Analisis gambar DARA"
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
            variant="settingsForm"
            label="Pajak DARA"
            description="Aktifkan modul pajak DARA."
            active={draft.daraTaxEnabled}
            onPress={() =>
              !daraControlsDisabled &&
              setDraftField('daraTaxEnabled', !draft.daraTaxEnabled)
            }
          />
          <KolamToggleRow
            variant="settingsForm"
            label="DARA SEO"
            description="Aktifkan fitur SEO DARA."
            active={draft.daraSeoEnabled}
            onPress={() =>
              !daraControlsDisabled &&
              setDraftField('daraSeoEnabled', !draft.daraSeoEnabled)
            }
          />
          <KolamToggleRow
            variant="settingsForm"
            label="Watcher pajak DARA"
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
            variant="settingsForm"
            label="Kepatuhan pajak DARA"
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
            variant="settingsForm"
            label="Narasi pajak DARA"
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
            variant="settingsForm"
            label="Fulfillment DARA"
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
            variant="settingsForm"
            label="Operasional staff DARA"
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
            variant="settingsForm"
            label="WhatsApp staff DARA"
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
            variant="settingsForm"
            label="Notifikasi olshop DARA"
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
            variant="settingsForm"
            label="Digest owner DARA"
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
            variant="settingsForm"
            label="WhatsApp owner DARA"
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
            variant="settingsForm"
            label="FCM owner DARA"
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
            variant="settingsForm"
            label="FCM urgent DARA"
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
          <View style={styles.marketplaceControlSection}>
            <KolamCopyStack
              items={[
                {
                  id: 'shipping-origin-title',
                  text: 'Asal pengiriman (Biteship)',
                  style: styles.marketplaceOverviewLabel,
                },
              ]}
            />
            <KolamTextFieldRow
              variant="settingsForm"
              fieldWidth={settingsFieldWidth}
              label="Biteship API key"
              description="Webhook: https://amfibi.dunia-anura.com/api/biteship/webhook"
              value={draft.biteshipApiKey}
              onChangeText={value => setDraftField('biteshipApiKey', value)}
              placeholder="********"
            />
            <KolamTextFieldRow
              variant="settingsForm"
              fieldWidth={settingsFieldWidth}
              label="Alamat"
              description="Alamat asal pengiriman."
              multiline
              numberOfLines={4}
              value={draft.originAddressLine1}
              onChangeText={value => setDraftField('originAddressLine1', value)}
              placeholder="Jl. Taman Ratu Raya No.34"
            />
            <KolamTextFieldRow
              variant="settingsForm"
              fieldWidth={settingsFieldWidth}
              label="Kota"
              description="Kota asal pengiriman."
              value={draft.originCity}
              onChangeText={value => setDraftField('originCity', value)}
              placeholder="Jakarta Barat"
            />
            <KolamTextFieldRow
              variant="settingsForm"
              fieldWidth={settingsFieldWidth}
              label="Provinsi"
              description="Provinsi asal pengiriman."
              value={draft.originProvince}
              onChangeText={value => setDraftField('originProvince', value)}
              placeholder="DKI Jakarta"
            />
            <KolamTextFieldRow
              variant="settingsForm"
              fieldWidth={settingsFieldWidth}
              label="Kode pos"
              description="Kode pos asal pengiriman."
              value={draft.originPostalCode}
              onChangeText={value => setDraftField('originPostalCode', value)}
              placeholder="11550"
            />
            <KolamTextFieldRow
              variant="settingsForm"
              fieldWidth={settingsFieldWidth}
              label="Latitude"
              description="Koordinat latitude origin."
              value={draft.originLatitude}
              onChangeText={value => setDraftField('originLatitude', value)}
              placeholder="-6.1687829"
            />
            <KolamTextFieldRow
              variant="settingsForm"
              fieldWidth={settingsFieldWidth}
              label="Longitude"
              description="Koordinat longitude origin."
              value={draft.originLongitude}
              onChangeText={value => setDraftField('originLongitude', value)}
              placeholder="106.7676678"
            />
            <KolamTextFieldRow
              variant="settingsForm"
              fieldWidth={settingsFieldWidth}
              label="Google Maps API key (browser)"
              description="Biarkan ******** agar key browser tersimpan tidak dikirim ulang."
              value={draft.googleMapsBrowserApiKey}
              onChangeText={value =>
                setDraftField('googleMapsBrowserApiKey', value)
              }
              placeholder="********"
            />
            <KolamCopyStack
              items={[
                {
                  id: 'pinpoint-map-title',
                  text: 'Pinpoint peta',
                  style: styles.marketplaceOverviewLabel,
                },
                {
                  id: 'native-map-planned',
                  text: 'Map native planned: gunakan latitude/longitude sebagai fallback koordinat produksi.',
                  style: styles.marketplaceOverviewMeta,
                },
              ]}
            />
          </View>

          <View style={styles.marketplaceControlSection}>
            <KolamCopyStack
              items={[
                {
                  id: 'store-hours-title',
                  text: 'Jam operasional toko (dunia-anura.com)',
                  style: styles.marketplaceOverviewLabel,
                },
                {
                  id: 'store-hours-meta',
                  text: 'DARA tetap aktif untuk produk dan FAQ. Saat tutup atau libur, DARA mendapat konteks jam operasional dan mengingatkan pengiriman tertunda.',
                  style: styles.marketplaceOverviewMeta,
                },
              ]}
            />
            <KolamToggleRow
              variant="settingsForm"
              label="Aktifkan jadwal operasional"
              description="Jika off, tidak ada banner jam tutup di marketplace dan DARA tidak mendapat konteks jam operasional."
              active={draft.storeOperatingHoursEnabled}
              onPress={() =>
                !disabled &&
                setDraftField(
                  'storeOperatingHoursEnabled',
                  !draft.storeOperatingHoursEnabled,
                )
              }
            />
            <KolamTextFieldRow
              variant="settingsForm"
              fieldWidth={settingsFieldWidth}
              label="Zona waktu"
              description="Zona waktu jadwal toko."
              value={draft.storeOperatingHoursTimezone}
              onChangeText={value =>
                setDraftField('storeOperatingHoursTimezone', value)
              }
              placeholder="Asia/Jakarta"
            />
            <View style={styles.storeHoursCompactTable}>
              <View style={styles.storeHoursCompactHeader}>
                <Text style={styles.storeHoursHeaderDay}>Hari</Text>
                <Text style={styles.storeHoursHeaderOpen}>Buka</Text>
                <Text style={styles.storeHoursHeaderCell}>Jam buka</Text>
                <Text style={styles.storeHoursHeaderCell}>Jam tutup</Text>
              </View>
              {storeOperatingHourRows.map((row, index) => {
                const isOpen = draft[row.openField] === true;
                const controlsDisabled =
                  disabled || !draft.storeOperatingHoursEnabled;
                const timeDisabled = controlsDisabled || !isOpen;

                return (
                  <View
                    key={row.id}
                    style={[
                      styles.storeHoursCompactRow,
                      index === storeOperatingHourRows.length - 1 &&
                        styles.storeHoursCompactRowLast,
                    ]}
                  >
                    <Text style={styles.storeHoursDayText}>{row.label}</Text>
                    <Pressable
                      accessibilityRole="switch"
                      accessibilityState={{
                        checked: isOpen,
                        disabled: controlsDisabled,
                      }}
                      disabled={controlsDisabled}
                      onPress={() => setDraftField(row.openField, !isOpen)}
                      style={[
                        styles.storeHoursSwitch,
                        isOpen && styles.storeHoursSwitchActive,
                        controlsDisabled && styles.storeHoursSwitchDisabled,
                      ]}
                    >
                      <View
                        style={[
                          styles.storeHoursSwitchKnob,
                          isOpen && styles.storeHoursSwitchKnobActive,
                        ]}
                      />
                    </Pressable>
                    <TextInput
                      editable={!timeDisabled}
                      onChangeText={value =>
                        setDraftField(row.openAtField, value)
                      }
                      placeholder="09:00"
                      style={[
                        styles.storeHoursTimeInput,
                        timeDisabled && styles.storeHoursTimeInputDisabled,
                      ]}
                      value={String(draft[row.openAtField] ?? '')}
                    />
                    <TextInput
                      editable={!timeDisabled}
                      onChangeText={value =>
                        setDraftField(row.closeAtField, value)
                      }
                      placeholder="21:00"
                      style={[
                        styles.storeHoursTimeInput,
                        timeDisabled && styles.storeHoursTimeInputDisabled,
                      ]}
                      value={String(draft[row.closeAtField] ?? '')}
                    />
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.marketplaceControlSection}>
            <KolamCopyStack
              items={[
                {
                  id: 'special-closures-title',
                  text: 'Libur khusus (tanggal)',
                  style: styles.marketplaceOverviewLabel,
                },
              ]}
            />
            <View style={styles.storeHoursTimeGrid}>
              <KolamTextFieldRow
                variant="settingsForm"
                fieldWidth={220}
                label="Tanggal libur khusus"
                description="Format YYYY-MM-DD."
                value={draft.storeOperatingHoursSpecialClosureDate}
                onChangeText={value =>
                  setDraftField('storeOperatingHoursSpecialClosureDate', value)
                }
                placeholder="2026-04-10"
              />
              <KolamTextFieldRow
                variant="settingsForm"
                fieldWidth={settingsFieldWidth}
                label="Keterangan libur"
                description="Label libur yang ditampilkan ke pembeli."
                value={draft.storeOperatingHoursSpecialClosureLabel}
                onChangeText={value =>
                  setDraftField('storeOperatingHoursSpecialClosureLabel', value)
                }
                placeholder="Libur Idul Fitri"
              />
              <KolamActionControlButton
                label="Tambah"
                disabled={
                  disabled ||
                  !draft.storeOperatingHoursSpecialClosureDate.trim()
                }
                onPress={addStoreSpecialClosure}
              />
            </View>
            {storeSpecialClosureRows.length ? (
              <View style={styles.storeHoursList}>
                {storeSpecialClosureRows.map(row => (
                  <View key={row.id} style={styles.storeClosureRow}>
                    <KolamCopyStack
                      containerStyle={styles.notificationSoundCopy}
                      items={[
                        {
                          id: `${row.id}-date`,
                          text: row.date,
                          style: styles.notificationSoundLabel,
                        },
                        {
                          id: `${row.id}-label`,
                          text: row.label || '-',
                          style: styles.notificationSoundPath,
                        },
                      ]}
                    />
                    <KolamActionControlButton
                      label="Hapus"
                      intent="danger"
                      disabled={disabled}
                      onPress={() => removeStoreSpecialClosure(row.index)}
                    />
                  </View>
                ))}
              </View>
            ) : (
              <KolamCopyStack
                items={[
                  {
                    id: 'no-special-closure',
                    text: 'Belum ada libur khusus.',
                    style: styles.marketplaceOverviewMeta,
                  },
                ]}
              />
            )}
          </View>

          <View style={styles.marketplaceControlSection}>
            <KolamCopyStack
              items={[
                {
                  id: 'store-messages-title',
                  text: 'Pesan untuk pembeli / DARA',
                  style: styles.marketplaceOverviewLabel,
                },
              ]}
            />
            {storeOperatingMessageRows.map(row => (
              <KolamTextFieldRow
                variant="settingsForm"
                key={row.id}
                fieldWidth={settingsFieldWidth}
                label={row.label}
                description="Pesan konteks untuk marketplace dan DARA."
                multiline
                numberOfLines={4}
                value={String(draft[row.field] ?? '')}
                onChangeText={value => setDraftField(row.field, value)}
                placeholder="Tulis pesan..."
              />
            ))}
          </View>
        </>
      ) : null}
      {showNotificationSettings ? (
        <>
          <View style={styles.notificationSoundList}>
            {notificationSoundItems.slice(0, 2).map(renderNotificationSoundRow)}
          </View>
          <KolamToggleRow
            variant="settingsForm"
            label="Notifikasi alih tangan DARA"
            description="Kirim notifikasi saat pelanggan dialihkan."
            active={draft.daraHandoffNotifyEnabled}
            onPress={() =>
              !disabled &&
              setDraftField(
                'daraHandoffNotifyEnabled',
                !draft.daraHandoffNotifyEnabled,
              )
            }
          />
          <View style={styles.notificationSoundList}>
            {renderNotificationSoundRow(notificationSoundItems[2])}
          </View>
          <KolamToggleRow
            variant="settingsForm"
            label="Panggilan grup chat tim"
            description="Aktifkan panggilan grup di chat tim."
            active={draft.teamChatGroupCallEnabled}
            onPress={() =>
              !disabled &&
              setDraftField(
                'teamChatGroupCallEnabled',
                !draft.teamChatGroupCallEnabled,
              )
            }
          />
          <View style={styles.notificationSoundList}>
            {renderNotificationSoundRow(notificationSoundItems[3])}
            {renderNotificationSoundRow(notificationSoundItems[4])}
          </View>
          {previewNotificationSound ? (
            <View style={styles.notificationSoundPlayer}>
              <KolamMediaPlayer
                key={previewNotificationSound.id}
                autoPlay
                kind="audio"
                style={styles.notificationSoundPlayerFrame}
                title={previewNotificationSound.title}
                uri={previewNotificationSound.uri}
              />
            </View>
          ) : null}
          <KolamToggleRow
            variant="settingsForm"
            label="Firebase"
            description="Aktifkan Firebase Admin untuk notifikasi."
            active={draft.firebaseEnabled}
            onPress={() =>
              !disabled &&
              setDraftField('firebaseEnabled', !draft.firebaseEnabled)
            }
          />
          <KolamTextFieldRow
            variant="settingsForm"
            fieldWidth={settingsFieldWidth}
            label="ID proyek Firebase"
            description="ID proyek Firebase produksi."
            value={draft.firebaseProjectId}
            onChangeText={value => setDraftField('firebaseProjectId', value)}
            placeholder="dunia-anura"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            fieldWidth={settingsFieldWidth}
            label="Email klien Firebase"
            description="Email klien akun layanan."
            value={draft.firebaseClientEmail}
            onChangeText={value => setDraftField('firebaseClientEmail', value)}
            placeholder="firebase-adminsdk@..."
          />
          <KolamTextFieldRow
            variant="settingsForm"
            fieldWidth={settingsFieldWidth}
            label="Kunci privat Firebase"
            description="Biarkan ******** agar kunci privat BE tidak dikirim ulang."
            value={draft.firebasePrivateKey}
            onChangeText={value => setDraftField('firebasePrivateKey', value)}
            placeholder="********"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            fieldWidth={settingsFieldWidth}
            label="Server SMTP"
            description="Server SMTP untuk email sistem."
            value={draft.smtpHost}
            onChangeText={value => setDraftField('smtpHost', value)}
            placeholder="smtp.gmail.com"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            fieldWidth={settingsFieldWidth}
            label="Port SMTP"
            description="Port SMTP produksi."
            value={draft.smtpPort}
            onChangeText={value => setDraftField('smtpPort', value)}
            placeholder="465"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            fieldWidth={settingsFieldWidth}
            label="Pengguna SMTP"
            description="Nama pengguna SMTP."
            value={draft.smtpUser}
            onChangeText={value => setDraftField('smtpUser', value)}
            placeholder="mailer@duniaanura.com"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            fieldWidth={settingsFieldWidth}
            label="Kata sandi SMTP"
            description="Biarkan ******** agar rahasia BE tidak dikirim ulang."
            value={draft.smtpPass}
            onChangeText={value => setDraftField('smtpPass', value)}
            placeholder="********"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            fieldWidth={settingsFieldWidth}
            label="Email pengirim SMTP"
            description="Alamat pengirim email sistem."
            value={draft.smtpFromEmail}
            onChangeText={value => setDraftField('smtpFromEmail', value)}
            placeholder="no-reply@duniaanura.com"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            fieldWidth={settingsFieldWidth}
            label="Nama pengirim SMTP"
            description="Nama pengirim email sistem."
            value={draft.smtpFromName}
            onChangeText={value => setDraftField('smtpFromName', value)}
            placeholder="Kolam"
          />
          <KolamToggleRow
            variant="settingsForm"
            label="SMTP aman"
            description="Gunakan koneksi SMTP aman."
            active={draft.smtpSecure}
            onPress={() =>
              !disabled && setDraftField('smtpSecure', !draft.smtpSecure)
            }
          />
          <KolamToggleRow
            variant="settingsForm"
            label="OTP masuk staf"
            description="Aktifkan OTP untuk masuk staf produksi."
            active={draft.staffOtpLoginEnabled}
            onPress={() =>
              !disabled &&
              setDraftField('staffOtpLoginEnabled', !draft.staffOtpLoginEnabled)
            }
          />
          <KolamTextFieldRow
            variant="settingsForm"
            fieldWidth={settingsFieldWidth}
            label="Menit kedaluwarsa OTP"
            description="Durasi OTP aktif sebelum kadaluarsa."
            value={draft.staffOtpExpireMinutes}
            onChangeText={value =>
              setDraftField('staffOtpExpireMinutes', value)
            }
            placeholder="10"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            fieldWidth={settingsFieldWidth}
            label="Jeda kirim ulang OTP"
            description="Jeda detik sebelum OTP boleh dikirim ulang."
            value={draft.staffOtpResendCooldownSeconds}
            onChangeText={value =>
              setDraftField('staffOtpResendCooldownSeconds', value)
            }
            placeholder="60"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            fieldWidth={settingsFieldWidth}
            label="Batas percobaan OTP"
            description="Batas percobaan OTP sebelum dikunci."
            value={draft.staffOtpMaxAttempts}
            onChangeText={value => setDraftField('staffOtpMaxAttempts', value)}
            placeholder="5"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            fieldWidth={settingsFieldWidth}
            label="Menit kunci OTP"
            description="Durasi penguncian setelah percobaan OTP melewati batas."
            value={draft.staffOtpLockMinutes}
            onChangeText={value => setDraftField('staffOtpLockMinutes', value)}
            placeholder="15"
          />
        </>
      ) : null}
      {showGeneralSettings ||
      showStoreShippingSettings ||
      showAiSettings ||
      showNotificationSettings ||
      showSitemapSettings ? (
        <>
          <KolamActionControlButton
            label="Simpan"
            loading={saveStatus === 'saving'}
            loadingLabel="Menyimpan..."
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
      {showOperationalSettings && saveMessage ? (
        <KolamCopyStack
          items={[
            {
              id: 'operational-save-message',
              text: saveMessage,
            },
          ]}
        />
      ) : null}
      {showPluginControls ? (
        <>
          <KolamToggleRow
            variant="settingsForm"
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
            variant="settingsForm"
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
            variant="settingsForm"
            label="Plugin Layanan"
            description="Aktifkan route dan registry plugin layanan."
            active={draft.pluginControls.layanan}
            onPress={() =>
              !disabled &&
              onPluginControlChange('layanan', !draft.pluginControls.layanan)
            }
          />
          <KolamToggleRow
            variant="settingsForm"
            label="Plugin Freyer"
            description="Aktifkan route dan registry plugin Freyer."
            active={draft.pluginControls.freyer}
            onPress={() =>
              !disabled &&
              onPluginControlChange('freyer', !draft.pluginControls.freyer)
            }
          />
          <KolamToggleRow
            variant="settingsForm"
            label="Plugin KPI"
            description="Aktifkan route dan registry plugin KPI."
            active={draft.pluginControls.kpi}
            onPress={() =>
              !disabled &&
              onPluginControlChange('kpi', !draft.pluginControls.kpi)
            }
          />
          <KolamToggleRow
            variant="settingsForm"
            label="Plugin Chat"
            description="Aktifkan route dan registry plugin chat."
            active={draft.pluginControls.chat}
            onPress={() =>
              !disabled &&
              onPluginControlChange('chat', !draft.pluginControls.chat)
            }
          />
          <KolamToggleRow
            variant="settingsForm"
            label="Plugin DARA"
            description="Aktifkan route dan registry plugin DARA."
            active={draft.pluginControls.dara}
            onPress={() =>
              !disabled &&
              onPluginControlChange('dara', !draft.pluginControls.dara)
            }
          />
          <KolamToggleRow
            variant="settingsForm"
            label="Plugin Proyek"
            description="Aktifkan route dan registry plugin proyek."
            active={draft.pluginControls.proyek}
            onPress={() =>
              !disabled &&
              onPluginControlChange('proyek', !draft.pluginControls.proyek)
            }
          />
          <KolamActionControlButton
            label="Simpan"
            loading={saveStatus === 'saving'}
            loadingLabel="Menyimpan..."
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
          <WebContentLauncherPanel
            activePanelId={webContentPanelId}
            items={webContentLauncherItems}
            message={webContentMessage}
            onSelect={setWebContentPanelId}
            status={webContentStatus}
          />
          {webContentPanelId === 'marketplace' ? (
            <>
              <MarketplaceLandingSubTabs
                activeTabId={marketplaceLandingTabId}
                items={marketplaceLandingTabItems}
                onSelect={setMarketplaceLandingTabId}
              />
              <MarketplaceLandingOverviewPanel
                activeTabId={marketplaceLandingTabId}
                assetStatus={marketplaceLandingAssetStatus}
                disabled={disabled || marketplaceLandingSaveStatus === 'saving'}
                onDeleteAnnouncementBanner={
                  onDeleteMarketplaceAnnouncementBanner
                }
                onDeleteBioactiveStep={onDeleteMarketplaceBioactiveStep}
                onDeleteCategoryBanner={onDeleteMarketplaceCategoryBanner}
                onDeleteFeaturedCollection={
                  onDeleteMarketplaceFeaturedCollection
                }
                onDeleteHeroSlide={onDeleteMarketplaceHeroSlide}
                onMoveAnnouncementBanner={onMoveMarketplaceAnnouncementBanner}
                onMoveBioactiveStep={onMoveMarketplaceBioactiveStep}
                onMoveCategoryBanner={onMoveMarketplaceCategoryBanner}
                onMoveFeaturedCollection={onMoveMarketplaceFeaturedCollection}
                onMoveHeroSlide={onMoveMarketplaceHeroSlide}
                onUploadAnnouncementImage={onUploadMarketplaceAnnouncementImage}
                onUploadBioactiveStepImage={
                  onUploadMarketplaceBioactiveStepImage
                }
                onUploadCategoryBannerImage={
                  onUploadMarketplaceCategoryBannerImage
                }
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
                activeTabId={marketplaceLandingTabId}
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
          ) : (
            <WebContentRowsPanel
              blogs={blogRows}
              topics={blogTopicRows}
              type={webContentPanelId}
            />
          )}
        </>
      ) : null}
    </KolamContentFrame>
  );
}

function WebContentLauncherPanel({
  activePanelId,
  items,
  message,
  onSelect,
  status,
}: {
  activePanelId: 'marketplace' | 'blog' | 'blog-topics';
  items: WebContentLauncherItem[];
  message: string;
  onSelect: (id: 'marketplace' | 'blog' | 'blog-topics') => void;
  status: 'idle' | 'loading' | 'live' | 'error';
}) {
  return (
    <View style={styles.marketplaceOverview}>
      <KolamCopyStack
        items={[
          {
            id: 'title',
            text: 'Konten Web',
            style: styles.marketplaceOverviewTitle,
          },
          {
            id: 'meta',
            text:
              status === 'loading'
                ? 'Memuat Blog, Topik Blog, dan Landing Marketplace...'
                : status === 'error'
                ? message
                : 'Launcher produksi untuk Landing Marketplace, Blog, dan Blog Topics.',
            style:
              status === 'error'
                ? styles.marketplaceOverviewError
                : styles.marketplaceOverviewMeta,
          },
        ]}
      />
      <View style={styles.marketplaceOverviewRows}>
        {items.map(item => (
          <View key={item.id} style={styles.marketplaceOverviewRow}>
            <KolamCopyStack
              containerStyle={styles.marketplaceOverviewCopy}
              items={[
                {
                  id: `${item.id}-label`,
                  text: item.label,
                  style: styles.marketplaceOverviewLabel,
                },
                {
                  id: `${item.id}-detail`,
                  text: item.detail,
                  style: styles.marketplaceOverviewDetail,
                },
              ]}
            />
            <View style={styles.notificationSoundActions}>
              <KolamCopyStack
                items={[
                  {
                    id: `${item.id}-value`,
                    text: item.value,
                    style: styles.marketplaceOverviewValue,
                  },
                ]}
              />
              <KolamActionControlButton
                intent={activePanelId === item.id ? 'primary' : undefined}
                label={activePanelId === item.id ? 'Open' : 'View'}
                onPress={() => onSelect(item.id)}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function MarketplaceLandingSubTabs({
  activeTabId,
  items,
  onSelect,
}: {
  activeTabId:
    | 'hero'
    | 'featured'
    | 'category'
    | 'cta'
    | 'youtube'
    | 'announcement'
    | 'notices';
  items: MarketplaceLandingTabItem[];
  onSelect: (
    id:
      | 'hero'
      | 'featured'
      | 'category'
      | 'cta'
      | 'youtube'
      | 'announcement'
      | 'notices',
  ) => void;
}) {
  return (
    <View style={styles.marketplaceAssetActions}>
      {items.map(item => (
        <KolamActionControlButton
          key={item.id}
          intent={activeTabId === item.id ? 'primary' : undefined}
          label={`${item.label} ${item.value}`}
          onPress={() => onSelect(item.id)}
        />
      ))}
    </View>
  );
}

function WebContentRowsPanel({
  blogs,
  topics,
  type,
}: {
  blogs: KolamBlog[];
  topics: KolamBlogTopic[];
  type: 'blog' | 'blog-topics';
}) {
  const rows =
    type === 'blog'
      ? blogs.map(blog => ({
          id: blog._id,
          label: blog.title,
          value: blog.status,
          detail: `${blog.slug} | ${
            blog.topics?.map(topic => topic.name).join(', ') || 'Tanpa topik'
          } | views ${blog.viewCount ?? 0}`,
        }))
      : topics.map(topic => ({
          id: topic._id,
          label: topic.name,
          value: topic.status ?? 'active',
          detail: `${topic.slug} | ${topic.blogCount ?? 0} blogs | ${
            topic.color ?? '-'
          }`,
        }));

  return (
    <View style={styles.marketplaceOverview}>
      <KolamCopyStack
        items={[
          {
            id: 'title',
            text: type === 'blog' ? 'Blog' : 'Blog Topics',
            style: styles.marketplaceOverviewTitle,
          },
          {
            id: 'meta',
            text: 'Ringkasan live read-only. Editor penuh mengikuti kontrak FE lama Blog/Blog Topics.',
            style: styles.marketplaceOverviewMeta,
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
        {rows.length === 0 ? (
          <KolamCopyStack
            items={[
              {
                id: 'empty',
                text: 'Belum ada data live untuk panel ini.',
                style: styles.marketplaceOverviewMeta,
              },
            ]}
          />
        ) : null}
      </View>
    </View>
  );
}

function KpiSettingsPanel({
  disabled,
  draft,
  message,
  onRefreshPreview,
  onSave,
  onSetField,
  onToggleRule,
  pluginEnabled,
  preview,
  status,
  summaryRows,
}: {
  disabled: boolean;
  draft: KpiSettingsDraft;
  message: string;
  onRefreshPreview: () => void;
  onSave: () => void;
  onSetField: <Key extends keyof KpiSettingsDraft>(
    key: Key,
    value: KpiSettingsDraft[Key],
  ) => void;
  onToggleRule: (rule: string, enabled: boolean) => void;
  pluginEnabled: boolean;
  preview: KolamKpiWeeklyAnnouncePreview | null;
  status: 'idle' | 'loading' | 'live' | 'saving' | 'error' | 'disabled';
  summaryRows: KpiSettingsSummaryRow[];
}) {
  const busy = status === 'loading' || status === 'saving';
  const ruleRows = [
    ['task.base', 'Poin dasar task'],
    ['task.on_time', 'Task tepat waktu'],
    ['task.qc', 'QC task'],
    ['task.proof', 'Bukti task'],
    ['task.no_proof', 'Task tanpa bukti'],
    ['complaint', 'Poin komplain'],
    ['task.noshow', 'Task no-show'],
    ['attendance.radius', 'Radius absensi'],
    ['task.rating', 'Rating customer'],
    ['chat.fast_reply', 'Balasan chat cepat'],
    ['chat.late_reply', 'Balasan chat terlambat'],
    ['chat.no_reply', 'Chat tidak dibalas'],
  ] as const;

  return (
    <>
      <View style={styles.marketplaceOverview}>
        <KolamCopyStack
          items={[
            {
              id: 'kpi-title',
              text: 'Pengaturan Plugin KPI Staff',
              style: styles.marketplaceOverviewTitle,
            },
            {
              id: 'kpi-gate',
              text: pluginEnabled
                ? 'Plugin KPI aktif. Pengaturan dibaca dari /kpi/settings.'
                : 'Plugin KPI nonaktif. Aktifkan dari tab Plugin untuk mengubah pengaturan.',
              style: pluginEnabled
                ? styles.marketplaceOverviewMeta
                : styles.marketplaceOverviewError,
            },
          ]}
        />
        <View style={styles.marketplaceOverviewRows}>
          {summaryRows.map(row => (
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
      <View style={styles.storeHoursTimeGrid}>
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={120}
          label="Task rendah"
          description="Poin dasar prioritas rendah."
          value={draft.taskBaseLow}
          onChangeText={value => onSetField('taskBaseLow', value)}
          placeholder="5"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={120}
          label="Task sedang"
          description="Poin dasar prioritas sedang."
          value={draft.taskBaseMedium}
          onChangeText={value => onSetField('taskBaseMedium', value)}
          placeholder="10"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={120}
          label="Task tinggi"
          description="Poin dasar prioritas tinggi."
          value={draft.taskBaseHigh}
          onChangeText={value => onSetField('taskBaseHigh', value)}
          placeholder="20"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={120}
          label="Task urgent"
          description="Poin dasar prioritas urgent."
          value={draft.taskBaseUrgent}
          onChangeText={value => onSetField('taskBaseUrgent', value)}
          placeholder="30"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={120}
          label="Rasio bantuan"
          description="Ratio points untuk assistedBy."
          value={draft.assistedByRatio}
          onChangeText={value => onSetField('assistedByRatio', value)}
          placeholder="0.5"
        />
      </View>
      <View style={styles.storeHoursTimeGrid}>
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={130}
          label="Menit balasan cepat"
          description="Batas balasan cepat chat."
          value={draft.chatFastReplyMinutes}
          onChangeText={value => onSetField('chatFastReplyMinutes', value)}
          placeholder="5"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={130}
          label="Poin balasan cepat"
          description="Poin balasan cepat."
          value={draft.chatFastReplyPoints}
          onChangeText={value => onSetField('chatFastReplyPoints', value)}
          placeholder="5"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={130}
          label="Menit balasan telat"
          description="Batas balasan telat chat."
          value={draft.chatLateReplyMinutes}
          onChangeText={value => onSetField('chatLateReplyMinutes', value)}
          placeholder="14"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={130}
          label="Poin balasan telat"
          description="Poin balasan telat."
          value={draft.chatLateReplyPoints}
          onChangeText={value => onSetField('chatLateReplyPoints', value)}
          placeholder="-10"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={130}
          label="Poin tanpa balasan"
          description="Penalty chat tidak dibalas."
          value={draft.chatNoReplyPoints}
          onChangeText={value => onSetField('chatNoReplyPoints', value)}
          placeholder="-15"
        />
      </View>
      <View style={styles.storeHoursTimeGrid}>
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={120}
          label="Komplain ringan"
          description="Penalti komplain ringan."
          value={draft.complaintLight}
          onChangeText={value => onSetField('complaintLight', value)}
          placeholder="-10"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={120}
          label="Komplain valid"
          description="Penalti komplain valid."
          value={draft.complaintValid}
          onChangeText={value => onSetField('complaintValid', value)}
          placeholder="-25"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={120}
          label="Komplain berat"
          description="Penalti komplain berat."
          value={draft.complaintSevere}
          onChangeText={value => onSetField('complaintSevere', value)}
          placeholder="-50"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={160}
          label="Absensi di luar radius"
          description="Penalty absensi di luar radius."
          value={draft.attendanceOutsideRadius}
          onChangeText={value => onSetField('attendanceOutsideRadius', value)}
          placeholder="-20"
        />
      </View>
      <View style={styles.storeHoursTimeGrid}>
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={120}
          label="Tepat waktu sebelum"
          description="Poin sebelum deadline."
          value={draft.onTimeBeforeDeadline}
          onChangeText={value => onSetField('onTimeBeforeDeadline', value)}
          placeholder="5"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={120}
          label="Persen terlalu awal"
          description="Persen threshold terlalu awal."
          value={draft.onTimeFarEarlyPct}
          onChangeText={value => onSetField('onTimeFarEarlyPct', value)}
          placeholder="50"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={120}
          label="Bonus terlalu awal"
          description="Bonus terlalu awal."
          value={draft.onTimeFarEarlyBonus}
          onChangeText={value => onSetField('onTimeFarEarlyBonus', value)}
          placeholder="10"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={120}
          label="Task telat"
          description="Penalti task telat."
          value={draft.onTimeLate}
          onChangeText={value => onSetField('onTimeLate', value)}
          placeholder="-5"
        />
      </View>
      <View style={styles.storeHoursTimeGrid}>
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={120}
          label="QC lulus pertama"
          description="Poin QC pass pertama."
          value={draft.qcPassFirst}
          onChangeText={value => onSetField('qcPassFirst', value)}
          placeholder="10"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={120}
          label="QC revision 1"
          description="Poin revisi pertama."
          value={draft.qcRevision1}
          onChangeText={value => onSetField('qcRevision1', value)}
          placeholder="0"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={120}
          label="QC revisi banyak"
          description="Penalty banyak revisi."
          value={draft.qcRevisionMany}
          onChangeText={value => onSetField('qcRevisionMany', value)}
          placeholder="-5"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={120}
          label="Bukti lengkap"
          description="Poin bukti task lengkap."
          value={draft.proofComplete}
          onChangeText={value => onSetField('proofComplete', value)}
          placeholder="5"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={120}
          label="Tanpa bukti"
          description="Penalty bukti hilang."
          value={draft.noProofMissing}
          onChangeText={value => onSetField('noProofMissing', value)}
          placeholder="-10"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={150}
          label="Task no-show"
          description="Penalty reassign/cancel."
          value={draft.noShowReassignOrCancel}
          onChangeText={value => onSetField('noShowReassignOrCancel', value)}
          placeholder="-25"
        />
      </View>
      <KolamTextFieldRow
        variant="settingsForm"
        label="Level bulanan"
        description="Satu baris per level: id|label|min|max. Kosongkan max untuk open ended."
        value={draft.levelsText}
        onChangeText={value => onSetField('levelsText', value)}
        placeholder="gold|Gold|501|1000"
      />
      <KolamTextFieldRow
        variant="settingsForm"
        label="Reward bulanan"
        description="Satu baris per reward: levelId|amountRp."
        value={draft.rewardsText}
        onChangeText={value => onSetField('rewardsText', value)}
        placeholder="gold|250000"
      />
      <View style={styles.marketplaceOverview}>
        <KolamCopyStack
          items={[
            {
              id: 'rules-title',
              text: 'Rule Aktif',
              style: styles.marketplaceOverviewLabel,
            },
          ]}
        />
        {ruleRows.map(([key, label]) => (
          <KolamToggleRow
            variant="settingsForm"
            key={key}
            label={label}
            description={`Key rule ${key}`}
            active={draft.enabledRules[key] !== false}
            onPress={() =>
              !disabled && onToggleRule(key, draft.enabledRules[key] === false)
            }
          />
        ))}
      </View>
      <View style={styles.marketplaceOverview}>
        <KolamCopyStack
          items={[
            {
              id: 'preview-title',
              text: 'Preview Pengumuman Mingguan DARA',
              style: styles.marketplaceOverviewLabel,
            },
            {
              id: 'preview-body',
              text: preview?.body ?? 'Preview belum dimuat.',
              style: styles.marketplaceOverviewDetail,
            },
          ]}
        />
        <View style={styles.notificationSoundActions}>
          <KolamActionControlButton
            disabled={disabled || busy}
            label="Refresh preview"
            loading={status === 'loading'}
            loadingLabel="Memuat..."
            onPress={onRefreshPreview}
          />
          <KolamActionControlButton
            disabled={disabled || busy}
            intent="primary"
            label="Simpan KPI"
            loading={status === 'saving'}
            loadingLabel="Menyimpan..."
            onPress={onSave}
          />
        </View>
        {message ? (
          <KolamCopyStack
            items={[
              {
                id: 'message',
                text: message,
                style:
                  status === 'error' || status === 'disabled'
                    ? styles.marketplaceOverviewError
                    : styles.marketplaceOverviewMeta,
              },
            ]}
          />
        ) : null}
      </View>
    </>
  );
}

function MarketplaceLandingOverviewPanel({
  activeTabId,
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
  activeTabId:
    | 'hero'
    | 'featured'
    | 'category'
    | 'cta'
    | 'youtube'
    | 'announcement'
    | 'notices';
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
      label: 'Hero slide',
      value: getCollectionSummary(overview.heroSlides),
      detail: getFirstTitles(
        overview.heroSlides.map(item => item.title || item.image),
      ),
    },
    {
      id: 'category-banners',
      label: 'Banner kategori',
      value: getCollectionSummary(overview.categoryBanners),
      detail: getFirstTitles(
        overview.categoryBanners.map(item => item.categorySlug || item.image),
      ),
    },
    {
      id: 'cta',
      label: 'Bagian CTA',
      value: overview.ctaSection?.isActive === false ? 'Nonaktif' : 'Aktif',
      detail: overview.ctaSection?.title || '-',
    },
    {
      id: 'youtube',
      label: 'Bagian YouTube',
      value: overview.youtubeSection?.isActive === false ? 'Nonaktif' : 'Aktif',
      detail:
        overview.youtubeSection?.link || overview.youtubeSection?.title || '-',
    },
    {
      id: 'announcement-banners',
      label: 'Banner pengumuman',
      value: getCollectionSummary(overview.announcementBanners),
      detail: getFirstTitles(
        overview.announcementBanners.map(item => item.link || item.image),
      ),
    },
    {
      id: 'customer-notices',
      label: 'Notice customer',
      value: getCollectionSummary(overview.customerNotices),
      detail: getFirstTitles(
        overview.customerNotices.map(item => item.title || item.key),
      ),
    },
    {
      id: 'featured-collections',
      label: 'Koleksi unggulan',
      value: getCollectionSummary(featuredCollections),
      detail: getFirstTitles(featuredCollections.map(item => item.title)),
    },
    {
      id: 'bioactive-ecosystem',
      label: 'Ekosistem bioaktif',
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
            text: 'Ringkasan Landing Marketplace',
            style: styles.marketplaceOverviewTitle,
          },
          {
            id: 'status',
            text:
              overview.status === 'loading'
                ? 'Memuat data live landing marketplace...'
                : overview.status === 'error'
                ? overview.message
                : 'Data live read-only dari endpoint Landing Marketplace.',
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
              text: 'Unggah Aset Marketplace',
              style: styles.marketplaceOverviewLabel,
            },
            {
              id: 'asset-meta',
              text: 'Ganti, urutkan ulang, dan hapus item live landing marketplace.',
              style: styles.marketplaceOverviewMeta,
            },
          ]}
        />
        <View style={styles.marketplaceAssetActions}>
          <MarketplaceAssetButton
            disabled={disabled}
            id="websetting-logo"
            label="Unggah logo"
            onPress={onUploadLogo}
            status={assetStatus}
          />
          <MarketplaceAssetButton
            disabled={disabled}
            id="dara-avatar"
            label="Unggah avatar DARA"
            onPress={onUploadDaraAvatar}
            status={assetStatus}
          />
          <MarketplaceAssetButton
            disabled={disabled}
            id="cta-background"
            label="Unggah background CTA"
            onPress={onUploadCtaBackground}
            status={assetStatus}
          />
          <MarketplaceAssetButton
            disabled={disabled}
            id="youtube-background"
            label="Unggah background YouTube"
            onPress={onUploadYoutubeBackground}
            status={assetStatus}
          />
        </View>
        {activeTabId === 'hero' ? (
          <MarketplaceAssetRows
            disabled={disabled}
            emptyText="Belum ada hero slide untuk penggantian gambar."
            getId={item => `hero:${item._id}`}
            getLabel={item => item.title || item._id}
            items={overview.heroSlides}
            onDelete={onDeleteHeroSlide}
            onMove={onMoveHeroSlide}
            onUpload={onUploadHeroImage}
            status={assetStatus}
            title="Gambar hero slide"
          />
        ) : null}
        {activeTabId === 'category' ? (
          <MarketplaceAssetRows
            disabled={disabled}
            emptyText="Belum ada banner kategori untuk penggantian gambar."
            getId={item => `category:${item._id}`}
            getLabel={item => item.categorySlug || item._id}
            items={overview.categoryBanners}
            onDelete={onDeleteCategoryBanner}
            onMove={onMoveCategoryBanner}
            onUpload={onUploadCategoryBannerImage}
            status={assetStatus}
            title="Gambar banner kategori"
          />
        ) : null}
        {activeTabId === 'announcement' ? (
          <MarketplaceAssetRows
            disabled={disabled}
            emptyText="Belum ada banner pengumuman untuk penggantian gambar."
            getId={item => `announcement:${item._id}`}
            getLabel={item => item.link || item._id}
            items={overview.announcementBanners}
            onDelete={onDeleteAnnouncementBanner}
            onMove={onMoveAnnouncementBanner}
            onUpload={onUploadAnnouncementImage}
            status={assetStatus}
            title="Gambar banner pengumuman"
          />
        ) : null}
        {activeTabId === 'featured' ? (
          <>
            <MarketplaceIndexedAssetRows
              disabled={disabled}
              emptyText="Belum ada koleksi unggulan untuk unggah gambar."
              getId={index => `featured:${index}`}
              getLabel={item => item.title || '-'}
              items={featuredCollections}
              onDelete={onDeleteFeaturedCollection}
              onMove={onMoveFeaturedCollection}
              onUpload={onUploadFeaturedCollectionImage}
              status={assetStatus}
              title="Gambar koleksi unggulan"
            />
            <MarketplaceIndexedAssetRows
              disabled={disabled}
              emptyText="Belum ada step bioaktif untuk unggah gambar."
              getId={index => `bioactive:${index}`}
              getLabel={item => item.key || '-'}
              items={bioactiveSteps}
              onDelete={onDeleteBioactiveStep}
              onMove={onMoveBioactiveStep}
              onUpload={onUploadBioactiveStepImage}
              status={assetStatus}
              title="Gambar ekosistem bioaktif"
            />
          </>
        ) : null}
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
                  label="Naik"
                  onPress={() => onMove(item, -1)}
                  status={status}
                />
                <MarketplaceAssetButton
                  disabled={disabled || index === items.length - 1}
                  id={id}
                  label="Turun"
                  onPress={() => onMove(item, 1)}
                  status={status}
                />
                <MarketplaceAssetButton
                  disabled={disabled}
                  id={id}
                  label="Unggah gambar"
                  onPress={() => onUpload(item)}
                  status={status}
                />
                <MarketplaceAssetButton
                  disabled={disabled}
                  id={id}
                  intent="danger"
                  label="Hapus"
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
                  label="Naik"
                  onPress={() => onMove(index, -1)}
                  status={status}
                />
                <MarketplaceAssetButton
                  disabled={disabled || index === items.length - 1}
                  id={id}
                  label="Turun"
                  onPress={() => onMove(index, 1)}
                  status={status}
                />
                <MarketplaceAssetButton
                  disabled={disabled}
                  id={id}
                  label="Unggah gambar"
                  onPress={() => onUpload(index)}
                  status={status}
                />
                <MarketplaceAssetButton
                  disabled={disabled}
                  id={id}
                  intent="danger"
                  label="Hapus"
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
    return 'Menghapus...';
  }

  if (status === 'reordering') {
    return 'Memindahkan...';
  }

  return 'Mengunggah...';
}

function MarketplaceLandingControlsPanel({
  activeTabId,
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
  activeTabId:
    | 'hero'
    | 'featured'
    | 'category'
    | 'cta'
    | 'youtube'
    | 'announcement'
    | 'notices';
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
            text: 'Kontrol Landing Marketplace',
            style: styles.marketplaceOverviewTitle,
          },
          {
            id: 'meta',
            text: 'Kontrol teks dan toggle. Unggah aset dan reorder tetap memakai kontrak Fase 8D/8E.',
            style: styles.marketplaceOverviewMeta,
          },
        ]}
      />
      {activeTabId === 'cta' ? (
        <View style={styles.marketplaceControlSection}>
          <KolamCopyStack
            items={[
              {
                id: 'cta-title',
                text: 'Bagian CTA',
                style: styles.marketplaceOverviewLabel,
              },
            ]}
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Judul CTA"
            description="Judul section CTA marketplace."
            value={ctaDraft.title}
            onChangeText={value => setCtaDraftField('title', value)}
            placeholder="Jelajahi Dunia Species"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Deskripsi CTA"
            description="Deskripsi singkat CTA marketplace."
            value={ctaDraft.description}
            onChangeText={value => setCtaDraftField('description', value)}
            placeholder="Temukan koleksi lengkap..."
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Teks tombol CTA"
            description="Label tombol CTA."
            value={ctaDraft.buttonText}
            onChangeText={value => setCtaDraftField('buttonText', value)}
            placeholder="View All Species"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Link tombol CTA"
            description="Target URL tombol CTA."
            value={ctaDraft.buttonLink}
            onChangeText={value => setCtaDraftField('buttonLink', value)}
            placeholder="/species"
          />
          <KolamToggleRow
            variant="settingsForm"
            label="CTA aktif"
            description="Tampilkan CTA di marketplace landing."
            active={ctaDraft.isActive}
            onPress={() =>
              !disabled && setCtaDraftField('isActive', !ctaDraft.isActive)
            }
          />
          <KolamActionControlButton
            disabled={disabled}
            label="Simpan CTA"
            loading={saveStatus === 'saving'}
            loadingLabel="Menyimpan..."
            intent="primary"
            onPress={onSaveCta}
          />
        </View>
      ) : null}
      {activeTabId === 'youtube' ? (
        <View style={styles.marketplaceControlSection}>
          <KolamCopyStack
            items={[
              {
                id: 'youtube-title',
                text: 'Bagian YouTube',
                style: styles.marketplaceOverviewLabel,
              },
            ]}
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Link YouTube"
            description="URL channel atau video YouTube."
            value={youtubeDraft.link}
            onChangeText={value => setYoutubeDraftField('link', value)}
            placeholder="https://www.youtube.com/@DuniaAnura"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Judul YouTube"
            description="Judul section YouTube."
            value={youtubeDraft.title}
            onChangeText={value => setYoutubeDraftField('title', value)}
            placeholder="Dunia Anura"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Subtitle YouTube"
            description="Subtitle section YouTube."
            value={youtubeDraft.subtitle}
            onChangeText={value => setYoutubeDraftField('subtitle', value)}
            placeholder="YouTube"
          />
          <KolamToggleRow
            variant="settingsForm"
            label="YouTube aktif"
            description="Tampilkan YouTube section di marketplace landing."
            active={youtubeDraft.isActive}
            onPress={() =>
              !disabled &&
              setYoutubeDraftField('isActive', !youtubeDraft.isActive)
            }
          />
          <KolamActionControlButton
            disabled={disabled}
            label="Simpan YouTube"
            loading={saveStatus === 'saving'}
            loadingLabel="Menyimpan..."
            intent="primary"
            onPress={onSaveYoutube}
          />
        </View>
      ) : null}
      {activeTabId === 'notices' ? (
        <View style={styles.marketplaceControlSection}>
          <KolamCopyStack
            items={[
              {
                id: 'notice-title',
                text: 'Notice Customer',
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
                      label="Hapus"
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
                    text: 'Belum ada notice customer.',
                    style: styles.marketplaceOverviewMeta,
                  },
                ]}
              />
            )}
          </View>
          <KolamTextFieldRow
            variant="settingsForm"
            label="Key notice"
            description="Key unik notice. Untuk edit, pilih notice dari list."
            value={noticeDraft.key}
            onChangeText={value => setNoticeDraftField('key', value)}
            placeholder="enclonura-migration-2026"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Judul notice"
            description="Judul singkat notice."
            value={noticeDraft.title}
            onChangeText={value => setNoticeDraftField('title', value)}
            placeholder="Enclonura pindah ke Dunia Anura"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Pesan notice"
            description="Pesan teks untuk customer marketplace."
            value={noticeDraft.message}
            onChangeText={value => setNoticeDraftField('message', value)}
            placeholder="Kelola kandang, Freyr, dan layanan..."
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="URL CTA notice"
            description="URL tombol opsional."
            value={noticeDraft.ctaUrl}
            onChangeText={value => setNoticeDraftField('ctaUrl', value)}
            placeholder="/dashboard"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Label CTA notice"
            description="Label tombol opsional."
            value={noticeDraft.ctaLabel}
            onChangeText={value => setNoticeDraftField('ctaLabel', value)}
            placeholder="Buka dashboard"
          />
          <KolamToggleRow
            variant="settingsForm"
            label="Notice aktif"
            description="Aktifkan notice untuk customer."
            active={noticeDraft.isActive}
            onPress={() =>
              !disabled &&
              setNoticeDraftField('isActive', !noticeDraft.isActive)
            }
          />
          <KolamToggleRow
            variant="settingsForm"
            label="Tampilkan di home"
            description="Tampilkan notice di homepage marketplace."
            active={noticeDraft.showOnHome}
            onPress={() =>
              !disabled &&
              setNoticeDraftField('showOnHome', !noticeDraft.showOnHome)
            }
          />
          <KolamToggleRow
            variant="settingsForm"
            label="Tampilkan di dashboard"
            description="Tampilkan notice di dashboard customer."
            active={noticeDraft.showOnDashboard}
            onPress={() =>
              !disabled &&
              setNoticeDraftField(
                'showOnDashboard',
                !noticeDraft.showOnDashboard,
              )
            }
          />
          <View style={styles.notificationSoundActions}>
            <KolamActionControlButton
              disabled={disabled || !noticeCanSave}
              label="Simpan notice"
              loading={saveStatus === 'saving'}
              loadingLabel="Menyimpan..."
              intent="primary"
              onPress={onSaveNotice}
            />
            <KolamActionControlButton
              disabled={disabled}
              label="Notice baru"
              onPress={onClearNoticeDraft}
            />
          </View>
        </View>
      ) : null}
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
  return `${active}/${items.length} aktif`;
}

function getFirstTitles(values: string[]) {
  const visible = values.filter(Boolean).slice(0, 3);
  return visible.length ? visible.join(' | ') : '-';
}

function formatWorkSiteCoordinate(value: number | undefined) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toFixed(6)
    : '-';
}

function formatWorkSiteInputValue(value: number | undefined) {
  return typeof value === 'number' && Number.isFinite(value)
    ? String(value)
    : '';
}

function formatWorkSiteRadius(value: number | undefined) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(20, value)
    : 150;
}

function getWorkSiteDraftKey(
  site: KolamStaffAttendanceWorkSite,
  index: number,
) {
  return site._id || `draft-${index}`;
}

function getWorkSiteGeocodeErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Alamat tidak ditemukan.';
}

function parseWorkSiteNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseDelimitedIds(value: string) {
  return value
    .split(/[\n,]/)
    .map(item => item.trim())
    .filter(Boolean);
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

function getSitemapSectionLabel(section: KolamSitemapSectionKey) {
  const labels: Record<KolamSitemapSectionKey, string> = {
    products: 'Products',
    species: 'Species',
    blog: 'Blog',
    brands: 'Brands',
    categories: 'Categories',
    tags: 'Tags',
  };

  return labels[section];
}

function getRegionLevelLabel(level: KolamRegionLevel) {
  const labels: Record<KolamRegionLevel, string> = {
    province: 'Province',
    regency: 'City / Regency',
    district: 'District',
    village: 'Village',
  };

  return labels[level];
}

const styles = StyleSheet.create({
  attendanceProviderChoices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  attendanceProviderCopy: {
    flex: 1,
    gap: 4,
    minWidth: 260,
  },
  attendanceProviderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  marketplaceAssetSection: {
    gap: 10,
  },
  marketplaceControls: {
    gap: 14,
  },
  marketplaceControlSection: {
    gap: 10,
  },
  poRoomChoices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  poRoomPicker: {
    gap: 8,
  },
  poStaffCheckbox: {
    alignItems: 'center',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minWidth: 260,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  poStaffCheckboxActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
  },
  poStaffCheckboxCopy: {
    flex: 1,
    minWidth: 0,
  },
  poStaffCheckboxDisabled: {
    opacity: 0.6,
  },
  poStaffCheckboxMark: {
    alignItems: 'center',
    borderColor: '#9ca3af',
    borderWidth: 1,
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  poStaffCheckboxMarkActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  poStaffCheckboxMarkText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  poStaffGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  poStaffPicker: {
    gap: 8,
  },
  workSiteCoordinateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  workSiteGeocodeRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  workSiteHeaderCopy: {
    flex: 1,
    minWidth: 240,
  },
  workSiteHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  workSiteList: {
    gap: 10,
  },
  workSiteRow: {
    borderColor: '#e5e7eb',
    borderTopWidth: 1,
    gap: 10,
    paddingTop: 10,
  },
  workSiteRowHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  workSiteSection: {
    gap: 10,
  },
  marketplaceNoticeList: {
    gap: 8,
  },
  marketplaceNoticeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  marketplaceOverview: {
    gap: 12,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  marketplaceOverviewRows: {
    gap: 8,
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
  notificationSoundPlayer: {
    height: 52,
  },
  notificationSoundPlayerFrame: {
    height: 52,
    width: '100%',
  },
  notificationSoundRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  storeHoursList: {
    gap: 10,
  },
  storeHoursCompactDay: {
    minWidth: 96,
  },
  storeHoursCompactHeader: {
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  storeHoursCompactRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  storeHoursCompactRowLast: {},
  storeHoursCompactTable: {
    overflow: 'hidden',
  },
  storeHoursHeaderCell: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '800',
    width: 116,
  },
  storeHoursHeaderDay: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '800',
    width: 126,
  },
  storeHoursHeaderOpen: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '800',
    width: 76,
  },
  storeHoursDayText: {
    color: '#1f2937',
    fontSize: 13,
    fontWeight: '800',
    width: 126,
  },
  storeHoursSwitch: {
    backgroundColor: '#d1d5db',
    borderRadius: 999,
    height: 22,
    justifyContent: 'center',
    marginRight: 54,
    padding: 2,
    width: 40,
  },
  storeHoursSwitchActive: {
    backgroundColor: '#10b981',
  },
  storeHoursSwitchDisabled: {
    opacity: 0.45,
  },
  storeHoursSwitchKnob: {
    backgroundColor: '#ffffff',
    borderRadius: 999,
    height: 18,
    width: 18,
  },
  storeHoursSwitchKnobActive: {
    alignSelf: 'flex-end',
  },
  storeHoursTimeInput: {
    borderColor: '#d1d5db',
    borderRadius: 6,
    borderWidth: 1,
    color: '#111827',
    fontSize: 13,
    height: 32,
    marginRight: 12,
    paddingHorizontal: 8,
    width: 104,
  },
  storeHoursTimeInputDisabled: {
    backgroundColor: '#f3f4f6',
    color: '#9ca3af',
  },
  storeClosureRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  storeHoursRow: {
    gap: 10,
    paddingVertical: 10,
  },
  storeHoursTimeGrid: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
