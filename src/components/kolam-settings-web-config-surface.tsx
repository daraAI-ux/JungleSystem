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
  setDraftField: (key: keyof WebSettingDraft, value: string | boolean) => void;
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
            fieldWidth={settingsFieldWidth}
            label="Versi Kolam"
            description="Disimpan melalui PUT /websetting/version untuk app kolam."
            value={draft.versionKolam}
            onChangeText={value => setDraftField('versionKolam', value)}
            placeholder="1.0.0"
          />
          <KolamTextFieldRow
            fieldWidth={settingsFieldWidth}
            label="Versi Enclonura"
            description="Disimpan melalui endpoint version app enclonura."
            value={draft.versionEnclonura}
            onChangeText={value => setDraftField('versionEnclonura', value)}
            placeholder="1.0.0"
          />
          <KolamTextFieldRow
            fieldWidth={settingsFieldWidth}
            label="Versi POS"
            description="Disimpan melalui endpoint version app pos."
            value={draft.versionPos}
            onChangeText={value => setDraftField('versionPos', value)}
            placeholder="1.0.0"
          />
          <KolamTextFieldRow
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
            fieldWidth={settingsFieldWidth}
            label="Tagline Perusahaan"
            description="Tagline branding yang tampil di storefront."
            value={draft.companyTagline}
            onChangeText={value => setDraftField('companyTagline', value)}
            placeholder="Toko hewan terpercaya"
          />
          <KolamTextFieldRow
            fieldWidth={settingsFieldWidth}
            label="Telepon"
            description="Nomor kontak customer."
            value={draft.phone}
            onChangeText={value => setDraftField('phone', value)}
            placeholder="+62 812-3456-7890"
          />
          <KolamTextFieldRow
            fieldWidth={settingsFieldWidth}
            label="Email"
            description="Email kontak customer."
            value={draft.email}
            onChangeText={value => setDraftField('email', value)}
            placeholder="info@duniaanura.com"
          />
          <KolamTextFieldRow
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
                label="Maintenance marketplace"
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
                fieldWidth={settingsFieldWidth}
                label="Kota asal"
                description="Kota asal pengiriman."
                value={draft.originCity}
                onChangeText={value => setDraftField('originCity', value)}
                placeholder="Jakarta Barat"
              />
              <KolamTextFieldRow
                fieldWidth={settingsFieldWidth}
                label="Provinsi asal"
                description="Provinsi asal pengiriman."
                value={draft.originProvince}
                onChangeText={value => setDraftField('originProvince', value)}
                placeholder="DKI Jakarta"
              />
              <KolamTextFieldRow
                fieldWidth={settingsFieldWidth}
                label="Kode pos asal"
                description="Kode pos asal pengiriman."
                value={draft.originPostalCode}
                onChangeText={value => setDraftField('originPostalCode', value)}
                placeholder="11550"
              />
              <KolamTextFieldRow
                fieldWidth={settingsFieldWidth}
                label="Latitude asal"
                description="Koordinat latitude origin."
                value={draft.originLatitude}
                onChangeText={value => setDraftField('originLatitude', value)}
                placeholder="-6.1687829"
              />
              <KolamTextFieldRow
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
            fieldWidth={settingsFieldWidth}
            label="Facebook"
            description="Tautan Facebook storefront."
            value={draft.facebook}
            onChangeText={value => setDraftField('facebook', value)}
            placeholder="https://facebook.com/..."
          />
          <KolamTextFieldRow
            fieldWidth={settingsFieldWidth}
            label="Instagram"
            description="Tautan Instagram storefront."
            value={draft.instagram}
            onChangeText={value => setDraftField('instagram', value)}
            placeholder="https://instagram.com/..."
          />
          <KolamTextFieldRow
            fieldWidth={settingsFieldWidth}
            label="Twitter"
            description="Tautan Twitter/X storefront."
            value={draft.twitter}
            onChangeText={value => setDraftField('twitter', value)}
            placeholder="https://twitter.com/..."
          />
          <KolamTextFieldRow
            fieldWidth={settingsFieldWidth}
            label="YouTube"
            description="Tautan YouTube storefront."
            value={draft.youtube}
            onChangeText={value => setDraftField('youtube', value)}
            placeholder="https://youtube.com/..."
          />
          <KolamTextFieldRow
            fieldWidth={settingsFieldWidth}
            label="TikTok"
            description="Tautan TikTok storefront."
            value={draft.tiktok}
            onChangeText={value => setDraftField('tiktok', value)}
            placeholder="https://tiktok.com/..."
          />
          <KolamToggleRow
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
                label="Menit kedaluwarsa OTP"
                description="Durasi OTP aktif sebelum kadaluarsa."
                value={draft.staffOtpExpireMinutes}
                onChangeText={value =>
                  setDraftField('staffOtpExpireMinutes', value)
                }
                placeholder="10"
              />
              <KolamTextFieldRow
                label="Jeda kirim ulang OTP"
                description="Jeda detik sebelum OTP boleh dikirim ulang."
                value={draft.staffOtpResendCooldownSeconds}
                onChangeText={value =>
                  setDraftField('staffOtpResendCooldownSeconds', value)
                }
                placeholder="60"
              />
              <KolamTextFieldRow
                label="Maks percobaan OTP"
                description="Batas percobaan OTP sebelum lock."
                value={draft.staffOtpMaxAttempts}
                onChangeText={value =>
                  setDraftField('staffOtpMaxAttempts', value)
                }
                placeholder="5"
              />
              <KolamTextFieldRow
                label="Menit lock OTP"
                description="Durasi lock setelah percobaan OTP melewati batas."
                value={draft.staffOtpLockMinutes}
                onChangeText={value =>
                  setDraftField('staffOtpLockMinutes', value)
                }
                placeholder="15"
              />
              <KolamTextFieldRow
                label="Server SMTP"
                description="Server SMTP untuk email sistem."
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
                label="Pengguna SMTP"
                description="Nama pengguna SMTP."
                value={draft.smtpUser}
                onChangeText={value => setDraftField('smtpUser', value)}
                placeholder="mailer@duniaanura.com"
              />
              <KolamTextFieldRow
                label="Kata sandi SMTP"
                description="Biarkan ******** agar secret BE tidak dikirim ulang."
                value={draft.smtpPass}
                onChangeText={value => setDraftField('smtpPass', value)}
                placeholder="********"
              />
              <KolamTextFieldRow
                label="Email pengirim SMTP"
                description="Alamat pengirim email sistem."
                value={draft.smtpFromEmail}
                onChangeText={value => setDraftField('smtpFromEmail', value)}
                placeholder="no-reply@duniaanura.com"
              />
              <KolamTextFieldRow
                label="Nama pengirim SMTP"
                description="Nama pengirim email sistem."
                value={draft.smtpFromName}
                onChangeText={value => setDraftField('smtpFromName', value)}
                placeholder="Kolam"
              />
              <KolamToggleRow
                label="SMTP aman"
                description="Gunakan koneksi SMTP aman."
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
                label="ID proyek Firebase"
                description="ID proyek Firebase produksi."
                value={draft.firebaseProjectId}
                onChangeText={value =>
                  setDraftField('firebaseProjectId', value)
                }
                placeholder="dunia-anura"
              />
              <KolamTextFieldRow
                label="Email klien Firebase"
                description="Email klien akun layanan."
                value={draft.firebaseClientEmail}
                onChangeText={value =>
                  setDraftField('firebaseClientEmail', value)
                }
                placeholder="firebase-adminsdk@..."
              />
              <KolamTextFieldRow
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
                label="Chat storefront"
                description="Aktifkan chat pada storefront."
                active={draft.chatStoreEnabled}
                onPress={() =>
                  !disabled &&
                  setDraftField('chatStoreEnabled', !draft.chatStoreEnabled)
                }
              />
              <KolamToggleRow
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
                label="Tools DARA"
                description="Aktifkan tool runtime DARA."
                active={draft.daraToolsEnabled}
                onPress={() =>
                  !disabled &&
                  setDraftField('daraToolsEnabled', !draft.daraToolsEnabled)
                }
              />
              <KolamToggleRow
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
                label="Pajak DARA"
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
            label="Maintenance marketplace"
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
                text: `Room Team Chat: ${roomSummary}`,
              },
              {
                id: 'po-staff-options',
                text: `Picker staff: ${staffSummary}`,
              },
            ]}
          />
          <KolamTextFieldRow
            label="ID room penerimaan PO"
            description="Room Team Chat untuk alur penerimaan/QC PO."
            value={draft.poWorkflowReceivingRoomId}
            onChangeText={value =>
              setDraftField('poWorkflowReceivingRoomId', value)
            }
            placeholder="Team Chat room ID"
          />
          <KolamToggleRow
            label="Notifikasi PO diterima"
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
            label="Notifikasi PO check"
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
            label="Notifikasi PO parsial"
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
            label="Post bukti PO ke Team Chat"
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
            label="PO parsial wajib admin"
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
            label="User ID notif PO diterima"
            description="User ID penerima notif receive, pisahkan koma atau baris baru."
            value={draft.poWorkflowNotifyReceiveUserIds}
            onChangeText={value =>
              setDraftField('poWorkflowNotifyReceiveUserIds', value)
            }
            placeholder="userId1, userId2"
          />
          <KolamTextFieldRow
            label="User ID notif PO check"
            description="User ID penerima notif check/QC."
            value={draft.poWorkflowNotifyCheckUserIds}
            onChangeText={value =>
              setDraftField('poWorkflowNotifyCheckUserIds', value)
            }
            placeholder="userId1, userId2"
          />
          <KolamTextFieldRow
            label="User ID notif PO selesai"
            description="User ID penerima notif complete."
            value={draft.poWorkflowNotifyCompleteUserIds}
            onChangeText={value =>
              setDraftField('poWorkflowNotifyCompleteUserIds', value)
            }
            placeholder="userId1, userId2"
          />
          <KolamTextFieldRow
            label="Tanggal cutoff payroll absensi"
            description="Tanggal cutoff payroll bulanan."
            value={draft.staffAttendancePayrollCutoffDay}
            onChangeText={value =>
              setDraftField('staffAttendancePayrollCutoffDay', value)
            }
            placeholder="28"
          />
          <KolamTextFieldRow
            label="Jam mulai kerja absensi"
            description="Jam mulai kerja default."
            value={draft.staffAttendanceWorkStartTime}
            onChangeText={value =>
              setDraftField('staffAttendanceWorkStartTime', value)
            }
            placeholder="08:00"
          />
          <KolamTextFieldRow
            label="Jam selesai kerja absensi"
            description="Jam selesai kerja default."
            value={draft.staffAttendanceWorkEndTime}
            onChangeText={value =>
              setDraftField('staffAttendanceWorkEndTime', value)
            }
            placeholder="17:00"
          />
          <KolamTextFieldRow
            label="Zona waktu absensi"
            description="Zona waktu untuk perhitungan absensi."
            value={draft.staffAttendanceTimezone}
            onChangeText={value =>
              setDraftField('staffAttendanceTimezone', value)
            }
            placeholder="Asia/Jakarta"
          />
          <KolamTextFieldRow
            label="Toleransi terlambat absensi"
            description="Menit toleransi keterlambatan."
            value={draft.staffAttendanceLateToleranceMinutes}
            onChangeText={value =>
              setDraftField('staffAttendanceLateToleranceMinutes', value)
            }
            placeholder="15"
          />
          <KolamTextFieldRow
            label="Maks tier 2 absensi"
            description="Batas menit tier keterlambatan kedua."
            value={draft.staffAttendanceLateTier2MaxMinutes}
            onChangeText={value =>
              setDraftField('staffAttendanceLateTier2MaxMinutes', value)
            }
            placeholder="120"
          />
          <KolamTextFieldRow
            label="Batas check-in absensi"
            description="Batas menit clock-in terlambat."
            value={draft.staffAttendanceLateCheckInDeadlineMinutes}
            onChangeText={value =>
              setDraftField('staffAttendanceLateCheckInDeadlineMinutes', value)
            }
            placeholder="240"
          />
          <KolamTextFieldRow
            label="Denda telat absensi tier 2"
            description="Nominal denda tier 2."
            value={draft.staffAttendanceLateFineTier2}
            onChangeText={value =>
              setDraftField('staffAttendanceLateFineTier2', value)
            }
            placeholder="50000"
          />
          <KolamTextFieldRow
            label="Denda telat absensi tier 3"
            description="Nominal denda tier 3."
            value={draft.staffAttendanceLateFineTier3}
            onChangeText={value =>
              setDraftField('staffAttendanceLateFineTier3', value)
            }
            placeholder="100000"
          />
          <KolamTextFieldRow
            label="Pembagi absen"
            description="Pembagi harian untuk potongan absen."
            value={draft.staffAttendanceAbsentDailyDivisor}
            onChangeText={value =>
              setDraftField('staffAttendanceAbsentDailyDivisor', value)
            }
            placeholder="30"
          />
          <KolamTextFieldRow
            label="Provider map absensi"
            description="Isi openstreetmap atau google."
            value={draft.staffAttendanceMapProvider}
            onChangeText={value =>
              setDraftField('staffAttendanceMapProvider', value)
            }
            placeholder="openstreetmap"
          />
          <KolamToggleRow
            label="Absensi wajib GPS"
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
            label="Absensi wajib face match"
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
            label="Threshold face match absensi"
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
            label="Sitemap enabled"
            description="Master switch untuk sitemap marketplace."
            active={sitemapDraft.enabled !== false}
            onPress={() =>
              !disabled &&
              setSitemapMasterField('enabled', sitemapDraft.enabled === false)
            }
          />
          <KolamToggleRow
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
            label="Custom URLs"
            description="Satu baris per URL: /path|0.5|weekly."
            value={sitemapCustomUrlsText}
            onChangeText={setSitemapCustomUrlsDraftText}
            placeholder="/promo|0.8|daily"
          />
          {sitemapSectionKeys.map(section => (
            <KolamTextFieldRow
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
              fieldWidth={170}
              label="Level"
              description="province, regency, district, village."
              value={regionLevel}
              onChangeText={value => setRegionFilter('level', value)}
              placeholder="province"
            />
            <KolamTextFieldRow
              fieldWidth={180}
              label="Parent code"
              description="Kode parent untuk city/district/village."
              value={regionParentCode}
              onChangeText={value => setRegionFilter('parentCode', value)}
              placeholder="32.73"
            />
            <KolamTextFieldRow
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
            label="Chat storefront"
            description="Aktifkan chat pada storefront."
            active={draft.chatStoreEnabled}
            onPress={() =>
              !chatControlsDisabled &&
              setDraftField('chatStoreEnabled', !draft.chatStoreEnabled)
            }
          />
          <KolamToggleRow
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
            label="Bisnis DARA"
            description="Aktifkan fitur bisnis DARA."
            active={draft.daraBusinessEnabled}
            onPress={() =>
              !daraControlsDisabled &&
              setDraftField('daraBusinessEnabled', !draft.daraBusinessEnabled)
            }
          />
          <KolamToggleRow
            label="Tools DARA"
            description="Aktifkan tool runtime DARA."
            active={draft.daraToolsEnabled}
            onPress={() =>
              !daraControlsDisabled &&
              setDraftField('daraToolsEnabled', !draft.daraToolsEnabled)
            }
          />
          <KolamToggleRow
            label="Knowledge / SOP DARA"
            description="Aktifkan knowledge base dan SOP lookup DARA."
            active={draft.daraKnowledgeEnabled}
            onPress={() =>
              !daraControlsDisabled &&
              setDraftField('daraKnowledgeEnabled', !draft.daraKnowledgeEnabled)
            }
          />
          <KolamToggleRow
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
            label="Insight DARA"
            description="Aktifkan insight otomatis DARA."
            active={draft.daraInsightsEnabled}
            onPress={() =>
              !daraControlsDisabled &&
              setDraftField('daraInsightsEnabled', !draft.daraInsightsEnabled)
            }
          />
          <KolamToggleRow
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
            label="Pajak DARA"
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
              fieldWidth={settingsFieldWidth}
              label="Biteship API key"
              description="Webhook: https://amfibi.dunia-anura.com/api/biteship/webhook"
              value={draft.biteshipApiKey}
              onChangeText={value => setDraftField('biteshipApiKey', value)}
              placeholder="********"
            />
            <KolamTextFieldRow
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
              fieldWidth={settingsFieldWidth}
              label="Kota"
              description="Kota asal pengiriman."
              value={draft.originCity}
              onChangeText={value => setDraftField('originCity', value)}
              placeholder="Jakarta Barat"
            />
            <KolamTextFieldRow
              fieldWidth={settingsFieldWidth}
              label="Provinsi"
              description="Provinsi asal pengiriman."
              value={draft.originProvince}
              onChangeText={value => setDraftField('originProvince', value)}
              placeholder="DKI Jakarta"
            />
            <KolamTextFieldRow
              fieldWidth={settingsFieldWidth}
              label="Kode pos"
              description="Kode pos asal pengiriman."
              value={draft.originPostalCode}
              onChangeText={value => setDraftField('originPostalCode', value)}
              placeholder="11550"
            />
            <KolamTextFieldRow
              fieldWidth={settingsFieldWidth}
              label="Latitude"
              description="Koordinat latitude origin."
              value={draft.originLatitude}
              onChangeText={value => setDraftField('originLatitude', value)}
              placeholder="-6.1687829"
            />
            <KolamTextFieldRow
              fieldWidth={settingsFieldWidth}
              label="Longitude"
              description="Koordinat longitude origin."
              value={draft.originLongitude}
              onChangeText={value => setDraftField('originLongitude', value)}
              placeholder="106.7676678"
            />
            <KolamTextFieldRow
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
              <KolamCopyStack
                containerStyle={styles.storeHoursCompactHeader}
                items={[
                  {
                    id: 'store-hours-day-header',
                    text: 'Hari',
                    style: styles.storeHoursHeaderDay,
                  },
                  {
                    id: 'store-hours-open-header',
                    text: 'Buka',
                    style: styles.storeHoursHeaderCell,
                  },
                  {
                    id: 'store-hours-open-at-header',
                    text: 'Jam buka',
                    style: styles.storeHoursHeaderCell,
                  },
                  {
                    id: 'store-hours-close-at-header',
                    text: 'Jam tutup',
                    style: styles.storeHoursHeaderCell,
                  },
                ]}
              />
              {storeOperatingHourRows.map(row => {
                const isOpen = draft[row.openField] === true;

                return (
                  <View key={row.id} style={styles.storeHoursCompactRow}>
                    <KolamCopyStack
                      containerStyle={styles.storeHoursCompactDay}
                      items={[
                        {
                          id: `${row.id}-day`,
                          text: row.label,
                          style: styles.notificationSoundLabel,
                        },
                      ]}
                    />
                    <View style={styles.storeHoursCompactToggle}>
                      <KolamToggleRow
                        label="Buka"
                        description="Status buka."
                        active={isOpen}
                        onPress={() =>
                          !disabled && setDraftField(row.openField, !isOpen)
                        }
                      />
                    </View>
                    <View style={styles.storeHoursCompactTimes}>
                      <KolamTextFieldRow
                        fieldWidth={140}
                        label="Jam buka"
                        description="Format HH:mm."
                        value={String(draft[row.openAtField] ?? '')}
                        onChangeText={value =>
                          setDraftField(row.openAtField, value)
                        }
                        placeholder="09:00"
                      />
                      <KolamTextFieldRow
                        fieldWidth={140}
                        label="Jam tutup"
                        description="Format HH:mm."
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
            label="Firebase"
            description="Aktifkan Firebase Admin untuk notifikasi."
            active={draft.firebaseEnabled}
            onPress={() =>
              !disabled &&
              setDraftField('firebaseEnabled', !draft.firebaseEnabled)
            }
          />
          <KolamTextFieldRow
            fieldWidth={settingsFieldWidth}
            label="ID proyek Firebase"
            description="ID proyek Firebase produksi."
            value={draft.firebaseProjectId}
            onChangeText={value => setDraftField('firebaseProjectId', value)}
            placeholder="dunia-anura"
          />
          <KolamTextFieldRow
            fieldWidth={settingsFieldWidth}
            label="Email klien Firebase"
            description="Email klien akun layanan."
            value={draft.firebaseClientEmail}
            onChangeText={value => setDraftField('firebaseClientEmail', value)}
            placeholder="firebase-adminsdk@..."
          />
          <KolamTextFieldRow
            fieldWidth={settingsFieldWidth}
            label="Kunci privat Firebase"
            description="Biarkan ******** agar kunci privat BE tidak dikirim ulang."
            value={draft.firebasePrivateKey}
            onChangeText={value => setDraftField('firebasePrivateKey', value)}
            placeholder="********"
          />
          <KolamTextFieldRow
            fieldWidth={settingsFieldWidth}
            label="Server SMTP"
            description="Server SMTP untuk email sistem."
            value={draft.smtpHost}
            onChangeText={value => setDraftField('smtpHost', value)}
            placeholder="smtp.gmail.com"
          />
          <KolamTextFieldRow
            fieldWidth={settingsFieldWidth}
            label="Port SMTP"
            description="Port SMTP produksi."
            value={draft.smtpPort}
            onChangeText={value => setDraftField('smtpPort', value)}
            placeholder="465"
          />
          <KolamTextFieldRow
            fieldWidth={settingsFieldWidth}
            label="Pengguna SMTP"
            description="Nama pengguna SMTP."
            value={draft.smtpUser}
            onChangeText={value => setDraftField('smtpUser', value)}
            placeholder="mailer@duniaanura.com"
          />
          <KolamTextFieldRow
            fieldWidth={settingsFieldWidth}
            label="Kata sandi SMTP"
            description="Biarkan ******** agar rahasia BE tidak dikirim ulang."
            value={draft.smtpPass}
            onChangeText={value => setDraftField('smtpPass', value)}
            placeholder="********"
          />
          <KolamTextFieldRow
            fieldWidth={settingsFieldWidth}
            label="Email pengirim SMTP"
            description="Alamat pengirim email sistem."
            value={draft.smtpFromEmail}
            onChangeText={value => setDraftField('smtpFromEmail', value)}
            placeholder="no-reply@duniaanura.com"
          />
          <KolamTextFieldRow
            fieldWidth={settingsFieldWidth}
            label="Nama pengirim SMTP"
            description="Nama pengirim email sistem."
            value={draft.smtpFromName}
            onChangeText={value => setDraftField('smtpFromName', value)}
            placeholder="Kolam"
          />
          <KolamToggleRow
            label="SMTP aman"
            description="Gunakan koneksi SMTP aman."
            active={draft.smtpSecure}
            onPress={() =>
              !disabled && setDraftField('smtpSecure', !draft.smtpSecure)
            }
          />
          <KolamToggleRow
            label="OTP masuk staf"
            description="Aktifkan OTP untuk masuk staf produksi."
            active={draft.staffOtpLoginEnabled}
            onPress={() =>
              !disabled &&
              setDraftField('staffOtpLoginEnabled', !draft.staffOtpLoginEnabled)
            }
          />
          <KolamTextFieldRow
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
            fieldWidth={settingsFieldWidth}
            label="Batas percobaan OTP"
            description="Batas percobaan OTP sebelum dikunci."
            value={draft.staffOtpMaxAttempts}
            onChangeText={value => setDraftField('staffOtpMaxAttempts', value)}
            placeholder="5"
          />
          <KolamTextFieldRow
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
      showOperationalSettings ||
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
          fieldWidth={120}
          label="Task rendah"
          description="Poin dasar prioritas rendah."
          value={draft.taskBaseLow}
          onChangeText={value => onSetField('taskBaseLow', value)}
          placeholder="5"
        />
        <KolamTextFieldRow
          fieldWidth={120}
          label="Task sedang"
          description="Poin dasar prioritas sedang."
          value={draft.taskBaseMedium}
          onChangeText={value => onSetField('taskBaseMedium', value)}
          placeholder="10"
        />
        <KolamTextFieldRow
          fieldWidth={120}
          label="Task tinggi"
          description="Poin dasar prioritas tinggi."
          value={draft.taskBaseHigh}
          onChangeText={value => onSetField('taskBaseHigh', value)}
          placeholder="20"
        />
        <KolamTextFieldRow
          fieldWidth={120}
          label="Task urgent"
          description="Poin dasar prioritas urgent."
          value={draft.taskBaseUrgent}
          onChangeText={value => onSetField('taskBaseUrgent', value)}
          placeholder="30"
        />
        <KolamTextFieldRow
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
          fieldWidth={130}
          label="Menit balasan cepat"
          description="Batas balasan cepat chat."
          value={draft.chatFastReplyMinutes}
          onChangeText={value => onSetField('chatFastReplyMinutes', value)}
          placeholder="5"
        />
        <KolamTextFieldRow
          fieldWidth={130}
          label="Poin balasan cepat"
          description="Poin balasan cepat."
          value={draft.chatFastReplyPoints}
          onChangeText={value => onSetField('chatFastReplyPoints', value)}
          placeholder="5"
        />
        <KolamTextFieldRow
          fieldWidth={130}
          label="Menit balasan telat"
          description="Batas balasan telat chat."
          value={draft.chatLateReplyMinutes}
          onChangeText={value => onSetField('chatLateReplyMinutes', value)}
          placeholder="14"
        />
        <KolamTextFieldRow
          fieldWidth={130}
          label="Poin balasan telat"
          description="Poin balasan telat."
          value={draft.chatLateReplyPoints}
          onChangeText={value => onSetField('chatLateReplyPoints', value)}
          placeholder="-10"
        />
        <KolamTextFieldRow
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
          fieldWidth={120}
          label="Komplain ringan"
          description="Penalti komplain ringan."
          value={draft.complaintLight}
          onChangeText={value => onSetField('complaintLight', value)}
          placeholder="-10"
        />
        <KolamTextFieldRow
          fieldWidth={120}
          label="Komplain valid"
          description="Penalti komplain valid."
          value={draft.complaintValid}
          onChangeText={value => onSetField('complaintValid', value)}
          placeholder="-25"
        />
        <KolamTextFieldRow
          fieldWidth={120}
          label="Komplain berat"
          description="Penalti komplain berat."
          value={draft.complaintSevere}
          onChangeText={value => onSetField('complaintSevere', value)}
          placeholder="-50"
        />
        <KolamTextFieldRow
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
          fieldWidth={120}
          label="Tepat waktu sebelum"
          description="Poin sebelum deadline."
          value={draft.onTimeBeforeDeadline}
          onChangeText={value => onSetField('onTimeBeforeDeadline', value)}
          placeholder="5"
        />
        <KolamTextFieldRow
          fieldWidth={120}
          label="Persen terlalu awal"
          description="Persen threshold terlalu awal."
          value={draft.onTimeFarEarlyPct}
          onChangeText={value => onSetField('onTimeFarEarlyPct', value)}
          placeholder="50"
        />
        <KolamTextFieldRow
          fieldWidth={120}
          label="Bonus terlalu awal"
          description="Bonus terlalu awal."
          value={draft.onTimeFarEarlyBonus}
          onChangeText={value => onSetField('onTimeFarEarlyBonus', value)}
          placeholder="10"
        />
        <KolamTextFieldRow
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
          fieldWidth={120}
          label="QC lulus pertama"
          description="Poin QC pass pertama."
          value={draft.qcPassFirst}
          onChangeText={value => onSetField('qcPassFirst', value)}
          placeholder="10"
        />
        <KolamTextFieldRow
          fieldWidth={120}
          label="QC revision 1"
          description="Poin revisi pertama."
          value={draft.qcRevision1}
          onChangeText={value => onSetField('qcRevision1', value)}
          placeholder="0"
        />
        <KolamTextFieldRow
          fieldWidth={120}
          label="QC revisi banyak"
          description="Penalty banyak revisi."
          value={draft.qcRevisionMany}
          onChangeText={value => onSetField('qcRevisionMany', value)}
          placeholder="-5"
        />
        <KolamTextFieldRow
          fieldWidth={120}
          label="Bukti lengkap"
          description="Poin bukti task lengkap."
          value={draft.proofComplete}
          onChangeText={value => onSetField('proofComplete', value)}
          placeholder="5"
        />
        <KolamTextFieldRow
          fieldWidth={120}
          label="Tanpa bukti"
          description="Penalty bukti hilang."
          value={draft.noProofMissing}
          onChangeText={value => onSetField('noProofMissing', value)}
          placeholder="-10"
        />
        <KolamTextFieldRow
          fieldWidth={150}
          label="Task no-show"
          description="Penalty reassign/cancel."
          value={draft.noShowReassignOrCancel}
          onChangeText={value => onSetField('noShowReassignOrCancel', value)}
          placeholder="-25"
        />
      </View>
      <KolamTextFieldRow
        label="Level bulanan"
        description="Satu baris per level: id|label|min|max. Kosongkan max untuk open ended."
        value={draft.levelsText}
        onChangeText={value => onSetField('levelsText', value)}
        placeholder="gold|Gold|501|1000"
      />
      <KolamTextFieldRow
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
            label="Judul CTA"
            description="Judul section CTA marketplace."
            value={ctaDraft.title}
            onChangeText={value => setCtaDraftField('title', value)}
            placeholder="Jelajahi Dunia Species"
          />
          <KolamTextFieldRow
            label="Deskripsi CTA"
            description="Deskripsi singkat CTA marketplace."
            value={ctaDraft.description}
            onChangeText={value => setCtaDraftField('description', value)}
            placeholder="Temukan koleksi lengkap..."
          />
          <KolamTextFieldRow
            label="Teks tombol CTA"
            description="Label tombol CTA."
            value={ctaDraft.buttonText}
            onChangeText={value => setCtaDraftField('buttonText', value)}
            placeholder="View All Species"
          />
          <KolamTextFieldRow
            label="Link tombol CTA"
            description="Target URL tombol CTA."
            value={ctaDraft.buttonLink}
            onChangeText={value => setCtaDraftField('buttonLink', value)}
            placeholder="/species"
          />
          <KolamToggleRow
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
            label="Link YouTube"
            description="URL channel atau video YouTube."
            value={youtubeDraft.link}
            onChangeText={value => setYoutubeDraftField('link', value)}
            placeholder="https://www.youtube.com/@DuniaAnura"
          />
          <KolamTextFieldRow
            label="Judul YouTube"
            description="Judul section YouTube."
            value={youtubeDraft.title}
            onChangeText={value => setYoutubeDraftField('title', value)}
            placeholder="Dunia Anura"
          />
          <KolamTextFieldRow
            label="Subtitle YouTube"
            description="Subtitle section YouTube."
            value={youtubeDraft.subtitle}
            onChangeText={value => setYoutubeDraftField('subtitle', value)}
            placeholder="YouTube"
          />
          <KolamToggleRow
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
            label="Key notice"
            description="Key unik notice. Untuk edit, pilih notice dari list."
            value={noticeDraft.key}
            onChangeText={value => setNoticeDraftField('key', value)}
            placeholder="enclonura-migration-2026"
          />
          <KolamTextFieldRow
            label="Judul notice"
            description="Judul singkat notice."
            value={noticeDraft.title}
            onChangeText={value => setNoticeDraftField('title', value)}
            placeholder="Enclonura pindah ke Dunia Anura"
          />
          <KolamTextFieldRow
            label="Pesan notice"
            description="Pesan teks untuk customer marketplace."
            value={noticeDraft.message}
            onChangeText={value => setNoticeDraftField('message', value)}
            placeholder="Kelola kandang, Freyr, dan layanan..."
          />
          <KolamTextFieldRow
            label="URL CTA notice"
            description="URL tombol opsional."
            value={noticeDraft.ctaUrl}
            onChangeText={value => setNoticeDraftField('ctaUrl', value)}
            placeholder="/dashboard"
          />
          <KolamTextFieldRow
            label="Label CTA notice"
            description="Label tombol opsional."
            value={noticeDraft.ctaLabel}
            onChangeText={value => setNoticeDraftField('ctaLabel', value)}
            placeholder="Buka dashboard"
          />
          <KolamToggleRow
            label="Notice aktif"
            description="Aktifkan notice untuk customer."
            active={noticeDraft.isActive}
            onPress={() =>
              !disabled &&
              setNoticeDraftField('isActive', !noticeDraft.isActive)
            }
          />
          <KolamToggleRow
            label="Tampilkan di home"
            description="Tampilkan notice di homepage marketplace."
            active={noticeDraft.showOnHome}
            onPress={() =>
              !disabled &&
              setNoticeDraftField('showOnHome', !noticeDraft.showOnHome)
            }
          />
          <KolamToggleRow
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
  notificationSoundPlayer: {
    height: 52,
  },
  notificationSoundPlayerFrame: {
    height: 52,
    width: '100%',
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
  storeHoursCompactDay: {
    minWidth: 96,
  },
  storeHoursCompactHeader: {
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  storeHoursCompactRow: {
    alignItems: 'center',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 10,
  },
  storeHoursCompactTable: {
    gap: 8,
  },
  storeHoursCompactTimes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  storeHoursCompactToggle: {
    minWidth: 180,
  },
  storeHoursHeaderCell: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '800',
    width: 140,
  },
  storeHoursHeaderDay: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '800',
    width: 96,
  },
  storeClosureRow: {
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
