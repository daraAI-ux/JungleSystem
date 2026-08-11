import { useEffect, useState } from 'react';
import {
  getSettingsActivityLogDetailFields,
  getSettingsActivityLogDetailFieldsFromLive,
  getSettingsActivityLogFilterControls,
  getSettingsActivityLogPagination,
  getSettingsActivityLogRows,
  getSettingsActivityLogRowsFromLive,
  getSettingsActivityLogStatsCards,
  getSettingsActivityLogStatsCardsFromLive,
  getSettingsActivityLogTableColumns,
  getSettingsDetailRows,
  getSettingsLiveEndpoints,
  getSettingsRoleAccessRowsFromLive,
  getSettingsRoleActionsForResource,
  getSettingsRoleAccessRows,
  getSettingsRoleEditorActions,
  getSettingsRoleInfoPanel,
  getSettingsRoleMemberPreview,
  getSettingsRolePermissionMatrixGroups,
  getSettingsRolePermissionPreviewRows,
  getSettingsRoleResourceGroups,
  getSettingsRoleTabItems,
  getSettingsSurfaceIdForTab,
  getSettingsSurfaceStats,
  getDefaultSettingsTabIdForSurface,
  getSettingsTabItemById,
  getSettingsTabItems,
  getVisibleSettingsTabItems,
  hasSettingsFinancialSectionPermission,
  hasSettingsPermission,
  hasSettingsRoleMutationPermission,
  isSettingsTabId,
  getSettingsWebConfigFields,
  getSettingsWebFormSections,
  isSettingsDefaultRoleKey,
  isSettingsSuperAdminRoleKey,
  settingsSurfaceItems,
  type SettingsActivityLogFilterState,
  type SettingsRoleMemberPreview,
  type SettingsSurfaceItem,
  type SettingsTabId,
  type SettingsTabVisibilityContext,
} from '../domain/settings-surface';
import type { SyncActivityEntry } from '../domain/sync-activity';
import {
  normalizeKolamComplaintPeriodDays,
  validateKolamComplaintPeriodDaysInput,
} from '../domain/kolam-complaint';
import {
  createKolamAnnouncementBanner,
  createKolamCategoryBanner,
  createKolamHeroSlide,
  createKolamRole,
  deleteKolamRole,
  getKolamActivityLogs,
  getKolamActivityLogStats,
  getKolamAnnouncementBannersAdmin,
  getKolamCategoryBannersAdmin,
  getKolamCtaSectionAdmin,
  getKolamCustomerNoticesAdmin,
  getKolamHeroSlidesAdmin,
  getKolamBlogs,
  getKolamBlogTopics,
  getKolamKpiSettings,
  getKolamKpiWeeklyAnnouncePreview,
  getKolamMarketplaceContentAdmin,
  getKolamRegionStats,
  getKolamRegions,
  getKolamStaffAttendanceSettings,
  getKolamTeamChatRooms,
  getKolamUserPickerRows,
  getKolamWebSetting,
  getKolamWebSettingVersion,
  getKolamWebSettingVersions,
  getKolamRoles,
  getKolamYoutubeSectionAdmin,
  deleteKolamAnnouncementBanner,
  deleteKolamCategoryBanner,
  deleteKolamHeroSlide,
  deleteKolamNotificationSound,
  deleteKolamCustomerNotice,
  reorderKolamAnnouncementBanners,
  reorderKolamCategoryBanners,
  reorderKolamHeroSlides,
  updateKolamAnnouncementBanner,
  updateKolamBioactiveEcosystem,
  updateKolamCategoryBanner,
  updateKolamRole,
  updateKolamStaffAttendanceSettings,
  updateKolamCtaSection,
  updateKolamFeaturedCollections,
  updateKolamHeroSlide,
  updateKolamKpiSettings,
  updateKolamSitemapConfig,
  updateKolamYoutubeSection,
  updateKolamWebSetting,
  updateKolamWebSettingVersion,
  syncKolamRegions,
  uploadKolamDaraAvatar,
  uploadKolamMarketplaceContentImage,
  uploadKolamNotificationSound,
  uploadKolamWebSettingLogo,
  upsertKolamCustomerNotice,
  type KolamPluginConfigKey,
  type KolamActivityLog,
  type KolamActivityLogListParams,
  type KolamActivityLogStatsResponse,
  type KolamAnnouncementBanner,
  type KolamBlog,
  type KolamBlogTopic,
  type KolamCategoryBanner,
  type KolamCtaSection,
  type KolamCustomerTextNotice,
  type KolamHeroSlide,
  type KolamKpiSettings,
  type KolamKpiWeeklyAnnouncePreview,
  type KolamMarketplaceContent,
  type KolamNotificationSoundType,
  type KolamRole,
  type KolamRolePermission,
  type KolamRegion,
  type KolamRegionLevel,
  type KolamRegionStats,
  type KolamRegionSyncScope,
  type KolamSitemapChangeFrequency,
  type KolamSitemapConfig,
  type KolamSitemapSectionKey,
  type KolamStaffAttendanceSettings,
  type KolamStaffAttendanceWorkSite,
  type KolamStoreOperatingHours,
  type KolamStoreOperatingWeekday,
  type KolamTeamChatRoom,
  type KolamUserPickerRow,
  type KolamWebSetting,
  type KolamWebSettingVersion,
  type KolamWebSettingVersions,
  type KolamYoutubeSection,
} from '../services/kolam-api';
import {
  createKolamPaymentMethod,
  deleteKolamPaymentMethod,
  deleteKolamPaymentMethodPhoto,
  getKolamFinancialWallets,
  getKolamPaymentMethods,
  getKolamTaxCompanyProfile,
  getKolamTaxPartyGaps,
  updateKolamPaymentMethod,
  updateKolamTaxCompanyProfile,
  uploadKolamPaymentMethodPhoto,
  type KolamFinancialPermissionKey,
  type KolamFinancialWallet,
  type KolamPaymentMethod,
  type KolamPaymentMethodListParams,
  type KolamPaymentMethodSaveBody,
  type KolamTaxCompanyProfile,
  type KolamTaxPartyGapsSummary,
} from '../services/kolam-financial-settings-api';
import {
  createKolamDaraKnowledge,
  uploadKolamKatakTerbangWorkerPhoto,
} from '../services/kolam-ai-dara-settings-api';
import { getCurrentUser } from '../services/auth-api';
import { getKolamUserList } from '../services/kolam-user-api';
import { ApiError } from '../lib/api-error';
import {
  pickNativeAudioFile,
  pickNativeImageFile,
} from '../services/native-file-picker';

const STAFF_DESKTOP_REDIRECT_URL = 'https://dunia-anura.com';

type WebSettingSaveStatus = 'idle' | 'saving' | 'saved' | 'error';
type RoleSaveStatus = 'idle' | 'loading' | 'saving' | 'saved' | 'error';
type ActivityLogStatus = 'idle' | 'loading' | 'live' | 'error';
type RegionSyncStatus = 'idle' | 'loading' | 'live' | 'syncing' | 'error';
type NotificationSoundStatus = 'idle' | 'uploading' | 'deleting';
type MarketplaceLandingOverviewStatus = 'idle' | 'loading' | 'live' | 'error';
type MarketplaceLandingSaveStatus = 'idle' | 'saving' | 'saved' | 'error';
type MarketplaceLandingAssetStatus =
  | 'idle'
  | 'uploading'
  | 'deleting'
  | 'reordering';
type FinancialDataStatus = 'idle' | 'loading' | 'live' | 'saving' | 'error';
type DaraKnowledgeSaveStatus = 'idle' | 'saving' | 'saved' | 'error';
type WebContentPanelId = 'marketplace' | 'blog' | 'blog-topics';
type MarketplaceLandingTabId =
  | 'hero'
  | 'featured'
  | 'category'
  | 'cta'
  | 'youtube'
  | 'announcement'
  | 'notices';
export interface SettingsFinancialSummaryRow {
  id: string;
  label: string;
  value: string;
  detail: string;
}
export interface SettingsFinancialSectionVisibility {
  paymentMethods: boolean;
  taxProfile: boolean;
  overtime: boolean;
  enclosureCommission: boolean;
  taxEdit: boolean;
  any: boolean;
}
export interface SettingsPaymentMethodFilters {
  search: string;
  isAvailableOnWebstore: '' | 'true' | 'false';
  page: number;
  limit: number;
}
export interface SettingsPaymentMethodDraft {
  id: string;
  name: string;
  type: KolamPaymentMethod['type'];
  provider: string;
  wallet: string;
  accountNumber: string;
  accountName: string;
  notes: string;
  isActive: boolean;
  isAvailableOnWebstore: boolean;
  requireSaleProof: boolean;
  costsText: string;
}
export interface DaraKnowledgeDraft {
  title: string;
  category: string;
  body: string;
}
export interface RegionSyncSummaryRow {
  id: string;
  label: string;
  value: string;
  detail: string;
}
export interface WebContentLauncherItem {
  id: WebContentPanelId;
  label: string;
  value: string;
  detail: string;
}
export interface MarketplaceLandingTabItem {
  id: MarketplaceLandingTabId;
  label: string;
  value: string;
}
const maskedSecretPlaceholder = '********';
const sitemapSectionKeys: KolamSitemapSectionKey[] = [
  'products',
  'species',
  'blog',
  'brands',
  'categories',
  'tags',
];
const regionLevels: KolamRegionLevel[] = [
  'province',
  'regency',
  'district',
  'village',
];
const sitemapChangeFrequencies: KolamSitemapChangeFrequency[] = [
  'always',
  'hourly',
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'never',
];
const defaultSitemapStaticPages = [
  {path: '/', enabled: true, priority: 1.0, changeFrequency: 'daily'},
  {path: '/products', enabled: true, priority: 0.9, changeFrequency: 'daily'},
  {path: '/species', enabled: true, priority: 0.9, changeFrequency: 'daily'},
  {path: '/blog', enabled: true, priority: 0.8, changeFrequency: 'daily'},
  {path: '/category', enabled: true, priority: 0.7, changeFrequency: 'weekly'},
  {path: '/tag', enabled: true, priority: 0.6, changeFrequency: 'weekly'},
  {path: '/collections', enabled: true, priority: 0.8, changeFrequency: 'daily'},
  {
    path: '/collections/deals',
    enabled: true,
    priority: 0.8,
    changeFrequency: 'daily',
  },
  {
    path: '/collections/new-arrivals',
    enabled: true,
    priority: 0.8,
    changeFrequency: 'daily',
  },
  {path: '/about', enabled: true, priority: 0.5, changeFrequency: 'monthly'},
  {path: '/contact', enabled: true, priority: 0.5, changeFrequency: 'monthly'},
  {path: '/faq', enabled: true, priority: 0.5, changeFrequency: 'monthly'},
  {path: '/shipping', enabled: true, priority: 0.4, changeFrequency: 'monthly'},
  {path: '/returns', enabled: true, priority: 0.4, changeFrequency: 'monthly'},
  {path: '/terms', enabled: true, priority: 0.3, changeFrequency: 'yearly'},
  {path: '/privacy', enabled: true, priority: 0.3, changeFrequency: 'yearly'},
] satisfies NonNullable<KolamSitemapConfig['staticPages']>;
const storeOperatingWeekdays: Array<{
  key: KolamStoreOperatingWeekday;
  label: string;
}> = [
  { key: 'monday', label: 'Senin' },
  { key: 'tuesday', label: 'Selasa' },
  { key: 'wednesday', label: 'Rabu' },
  { key: 'thursday', label: 'Kamis' },
  { key: 'friday', label: 'Jumat' },
  { key: 'saturday', label: 'Sabtu' },
  { key: 'sunday', label: 'Minggu' },
];
const notificationSoundDraftFieldByType: Record<
  KolamNotificationSoundType,
  keyof Pick<
    WebSettingDraft,
    | 'notificationSound'
    | 'unassignedNotificationSound'
    | 'handoffNotificationSound'
    | 'groupCallRingtone'
    | 'salesNotificationSound'
  >
> = {
  assigned: 'notificationSound',
  unassigned: 'unassignedNotificationSound',
  handoff: 'handoffNotificationSound',
  'group-call': 'groupCallRingtone',
  sales: 'salesNotificationSound',
};

interface WebSettingDraft {
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
  complaintPeriodDays: string;
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
  inboxAiReplyStore: boolean;
  inboxAiReplyWhatsapp: boolean;
  inboxAiReplyTiktok: boolean;
  inboxAiReplyInstagram: boolean;
  inboxAiReplyTokopedia: boolean;
  inboxAiReplyShopee: boolean;
  daraFulfillmentTeamRoomId: string;
  daraBusinessEnabled: boolean;
  daraToolsEnabled: boolean;
  daraKnowledgeEnabled: boolean;
  daraHandoffNotifyEnabled: boolean;
  daraInsightsEnabled: boolean;
  daraInsightsCronSchedule: string;
  daraAutoReportEnabled: boolean;
  daraImageAnalysisEnabled: boolean;
  daraTaxEnabled: boolean;
  daraSeoEnabled: boolean;
  daraSeoMonitorEnabled: boolean;
  daraSeoSentimentLlmEnabled: boolean;
  daraMarketScanCronEnabled: boolean;
  daraTaxRegulationWatcherEnabled: boolean;
  daraTaxComplianceJobEnabled: boolean;
  daraTaxLlmNarrativeEnabled: boolean;
  autoOlshopFulfillmentEnabled: boolean;
  autoOlshopShopeeEnabled: boolean;
  autoOlshopTokopediaEnabled: boolean;
  daraWebstoreFulfillmentEnabled: boolean;
  daraFulfillmentPackingMinutes: string;
  daraFulfillmentPackingMaxExtensions: string;
  daraAvatarUrl: string;
  katakTerbangWorkerName: string;
  daraStaffOpsNotifyEnabled: boolean;
  daraStaffWaNotifyEnabled: boolean;
  daraPenjualanTeamRoomId: string;
  daraOlshopCustomerNotifyEnabled: boolean;
  daraOlshopDeferredCron: string;
  daraOlshopDeferredBatch: string;
  daraOlshopStockGateEnabled: boolean;
  daraOlshopStockSyncMaxAgeMs: string;
  daraOlshopStockGateCron: string;
  daraOlshopStockGateBatch: string;
  daraOpsAuditEnabled: boolean;
  daraOwnerDigestEnabled: boolean;
  daraOwnerDigestCron: string;
  daraOwnerDigestWaEnabled: boolean;
  daraOwnerDigestFcmEnabled: boolean;
  daraOwnerFcmUrgentEnabled: boolean;
  daraOpsDigestLookbackHours: string;
  notificationSound: string;
  unassignedNotificationSound: string;
  handoffNotificationSound: string;
  groupCallRingtone: string;
  salesNotificationSound: string;
  salePricesIncludeTax: boolean;
  commissionPph21Enabled: boolean;
  overtimeCalculationMode: 'per_hour' | 'per_day';
  overtimeUseSalaryDerivedRate: boolean;
  overtimeRatePerHour: string;
  overtimeRatePerDay: string;
  overtimeDefaultHoursPerRequest: string;
  overtimeMidnightCutoff: string;
  overtimeUseStoreCloseForPerDay: boolean;
  enclosureSaleCommissionEnabled: boolean;
  enclosureSaleCommissionType: 'percentage' | 'fixed';
  enclosureSaleCommissionValue: string;
  pluginControls: Record<KolamPluginConfigKey, boolean>;
}

interface RoleDraft {
  name: string;
  key: string;
  description: string;
}

export interface MarketplaceLandingCtaDraft {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
}

export interface MarketplaceLandingHeroDraft {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  link: string;
  linkText: string;
  secondaryLink: string;
  secondaryLinkText: string;
  order: string;
  isActive: boolean;
  imageLocalUri: string;
}

export interface MarketplaceLandingCategoryDraft {
  id: string;
  categorySlug: string;
  order: string;
  isActive: boolean;
  imageLocalUri: string;
}

export interface MarketplaceLandingAnnouncementDraft {
  id: string;
  link: string;
  order: string;
  isActive: boolean;
  imageLocalUri: string;
}

export interface MarketplaceLandingYoutubeDraft {
  link: string;
  title: string;
  subtitle: string;
  isActive: boolean;
}

export interface MarketplaceLandingNoticeDraft {
  key: string;
  title: string;
  message: string;
  ctaUrl: string;
  ctaLabel: string;
  showOnHome: boolean;
  showOnDashboard: boolean;
  isActive: boolean;
}

export interface MarketplaceLandingOverview {
  status: MarketplaceLandingOverviewStatus;
  message: string;
  heroSlides: KolamHeroSlide[];
  categoryBanners: KolamCategoryBanner[];
  ctaSection: KolamCtaSection | null;
  youtubeSection: KolamYoutubeSection | null;
  announcementBanners: KolamAnnouncementBanner[];
  customerNotices: KolamCustomerTextNotice[];
  marketplaceContent: KolamMarketplaceContent;
}

export interface KpiSettingsDraft {
  taskBaseLow: string;
  taskBaseMedium: string;
  taskBaseHigh: string;
  taskBaseUrgent: string;
  assistedByRatio: string;
  onTimeBeforeDeadline: string;
  onTimeFarEarlyPct: string;
  onTimeFarEarlyBonus: string;
  onTimeLate: string;
  qcPassFirst: string;
  qcRevision1: string;
  qcRevisionMany: string;
  proofComplete: string;
  noProofMissing: string;
  noShowReassignOrCancel: string;
  chatFastReplyMinutes: string;
  chatFastReplyPoints: string;
  chatLateReplyMinutes: string;
  chatLateReplyPoints: string;
  chatNoReplyPoints: string;
  complaintLight: string;
  complaintValid: string;
  complaintSevere: string;
  attendanceOutsideRadius: string;
  levelsText: string;
  rewardsText: string;
  enabledRules: Record<string, boolean>;
}

export interface KpiSettingsSummaryRow {
  id: string;
  label: string;
  value: string;
  detail: string;
}

const defaultStoreOperatingHoursMessages = {
  beforeOpen:
    'Toko belum buka. Pesanan & pengiriman biasanya diproses setelah jam buka.',
  afterClose:
    'Toko sudah tutup. Pesanan & pengiriman bisa tertunda sampai jam operasional berikutnya.',
  weeklyClosed:
    'Hari ini libur rutin. Chat tetap bisa, tapi proses pesanan & pengiriman menunggu hari buka.',
  specialClosed:
    'Hari ini libur. Pengiriman & layanan CS bisa tertunda sampai toko buka kembali.',
  shippingDisclaimer:
    'Catatan: di luar jam operasional / saat libur, pengiriman dan balasan CS bisa lebih lambat.',
};

const emptyWebSettingDraft: WebSettingDraft = {
  versionKolam: '',
  versionEnclonura: '',
  versionPos: '',
  versionMarketplace: '',
  companyName: '',
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
  livechatOnline: false,
  webstoreGoogleAuthEnabled: false,
  googleOAuthClientId: '',
  complaintPeriodDays: '3',
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
  storeOperatingHoursMessageBeforeOpen:
    defaultStoreOperatingHoursMessages.beforeOpen,
  storeOperatingHoursMessageAfterClose:
    defaultStoreOperatingHoursMessages.afterClose,
  storeOperatingHoursMessageWeeklyClosed:
    defaultStoreOperatingHoursMessages.weeklyClosed,
  storeOperatingHoursMessageSpecialClosed:
    defaultStoreOperatingHoursMessages.specialClosed,
  storeOperatingHoursMessageShippingDisclaimer:
    defaultStoreOperatingHoursMessages.shippingDisclaimer,
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
  smtpHost: 'smtp.gmail.com',
  smtpPort: '465',
  smtpUser: '',
  smtpPass: '',
  smtpFromEmail: '',
  smtpFromName: 'Kolam',
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
  overtimeCalculationMode: 'per_hour',
  overtimeUseSalaryDerivedRate: true,
  overtimeRatePerHour: '0',
  overtimeRatePerDay: '0',
  overtimeDefaultHoursPerRequest: '3',
  overtimeMidnightCutoff: '23:59',
  overtimeUseStoreCloseForPerDay: true,
  enclosureSaleCommissionEnabled: false,
  enclosureSaleCommissionType: 'percentage',
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

const emptyRoleDraft: RoleDraft = {
  name: '',
  key: '',
  description: '',
};

const emptyPaymentMethodDraft: SettingsPaymentMethodDraft = {
  id: '',
  name: '',
  type: 'transfer',
  provider: '',
  wallet: '',
  accountNumber: '',
  accountName: '',
  notes: '',
  isActive: true,
  isAvailableOnWebstore: true,
  requireSaleProof: false,
  costsText: '',
};

const emptyDaraKnowledgeDraft: DaraKnowledgeDraft = {
  title: '',
  category: 'sop_kasir',
  body: '',
};

const emptyMarketplaceLandingCtaDraft: MarketplaceLandingCtaDraft = {
  title: '',
  description: '',
  buttonText: '',
  buttonLink: '',
  isActive: true,
};

const emptyMarketplaceLandingHeroDraft: MarketplaceLandingHeroDraft = {
  id: '',
  eyebrow: '',
  title: '',
  subtitle: '',
  description: '',
  link: '',
  linkText: '',
  secondaryLink: '',
  secondaryLinkText: '',
  order: '',
  isActive: true,
  imageLocalUri: '',
};

const emptyMarketplaceLandingCategoryDraft: MarketplaceLandingCategoryDraft = {
  id: '',
  categorySlug: '',
  order: '',
  isActive: true,
  imageLocalUri: '',
};

const emptyMarketplaceLandingAnnouncementDraft: MarketplaceLandingAnnouncementDraft =
  {
    id: '',
    link: '',
    order: '',
    isActive: true,
    imageLocalUri: '',
  };

const emptyMarketplaceLandingYoutubeDraft: MarketplaceLandingYoutubeDraft = {
  link: '',
  title: '',
  subtitle: '',
  isActive: true,
};

const emptyMarketplaceLandingNoticeDraft: MarketplaceLandingNoticeDraft = {
  key: '',
  title: '',
  message: '',
  ctaUrl: '',
  ctaLabel: '',
  showOnHome: true,
  showOnDashboard: true,
  isActive: true,
};

const emptyMarketplaceLandingOverview: MarketplaceLandingOverview = {
  status: 'idle',
  message: '',
  heroSlides: [],
  categoryBanners: [],
  ctaSection: null,
  youtubeSection: null,
  announcementBanners: [],
  customerNotices: [],
  marketplaceContent: {},
};

const emptyKpiSettingsDraft: KpiSettingsDraft = {
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
  levelsText:
    'bronze|Bronze|0|200\nsilver|Silver|201|500\ngold|Gold|501|1000\nplatinum|Platinum|1001|',
  rewardsText: 'bronze|0\nsilver|100000\ngold|250000\nplatinum|500000',
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

const defaultSitemapConfig: KolamSitemapConfig = {
  enabled: true,
  includeImages: true,
  sections: {
    products: { enabled: true, priority: 0.7, changeFrequency: 'weekly' },
    species: { enabled: true, priority: 0.7, changeFrequency: 'weekly' },
    blog: { enabled: true, priority: 0.6, changeFrequency: 'monthly' },
    brands: { enabled: true, priority: 0.5, changeFrequency: 'weekly' },
    categories: { enabled: true, priority: 0.6, changeFrequency: 'weekly' },
    tags: { enabled: true, priority: 0.4, changeFrequency: 'weekly' },
  },
  staticPages: defaultSitemapStaticPages,
  customUrls: [],
  excludedSlugs: {
    products: [],
    species: [],
    blog: [],
    brands: [],
    categories: [],
    tags: [],
  },
};

const activityLogPageSize = 10;

const emptyActivityLogFilters: SettingsActivityLogFilterState = {
  search: '',
  type: '',
  status: '',
  method: '',
  source: '',
  suspicious: '',
};

export function useKolamSettingsPanelController(
  activityEntries: SyncActivityEntry[],
  initialActiveSurfaceId: SettingsSurfaceItem['id'] = 'web-settings',
  initialActiveSettingsTabId: SettingsTabId = getDefaultSettingsTabIdForSurface(
    initialActiveSurfaceId,
  ),
) {
  const stats = getSettingsSurfaceStats();
  const [activeSurfaceId, setActiveSurfaceId] = useState<
    SettingsSurfaceItem['id']
  >(initialActiveSurfaceId);
  const [activeSettingsTabId, setActiveSettingsTabId] = useState<SettingsTabId>(
    initialActiveSettingsTabId,
  );
  const [settingsVisibilityContext, setSettingsVisibilityContext] = useState<
    SettingsTabVisibilityContext | null | undefined
  >(undefined);
  const [selectedActivityLogId, setSelectedActivityLogId] = useState('');
  const [activityPage, setActivityPage] = useState(1);
  const [activityLogs, setActivityLogs] = useState<KolamActivityLog[]>([]);
  const [activityLogStats, setActivityLogStats] =
    useState<KolamActivityLogStatsResponse | null>(null);
  const [activityLogTotal, setActivityLogTotal] = useState(0);
  const [activityLogStatus, setActivityLogStatus] =
    useState<ActivityLogStatus>('idle');
  const [activityLogMessage, setActivityLogMessage] = useState('');
  const [activityReloadKey, setActivityReloadKey] = useState(0);
  const [activityLogFilters, setActivityLogFilters] =
    useState<SettingsActivityLogFilterState>(emptyActivityLogFilters);
  const [webTitle, setWebTitle] = useState(
    getSettingsWebConfigFields()[0].value,
  );
  const [storefrontEnabled, setStorefrontEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [webSetting, setWebSetting] = useState<KolamWebSetting | null>(null);
  const [webSettingVersion, setWebSettingVersion] =
    useState<KolamWebSettingVersion | null>(null);
  const [webSettingVersions, setWebSettingVersions] =
    useState<KolamWebSettingVersions | null>(null);
  const [webSettingStatus, setWebSettingStatus] = useState<
    'idle' | 'loading' | 'live' | 'error'
  >('idle');
  const [webSettingSaveStatus, setWebSettingSaveStatus] =
    useState<WebSettingSaveStatus>('idle');
  const [webSettingMessage, setWebSettingMessage] = useState('');
  const [notificationSoundStatus, setNotificationSoundStatus] = useState<
    Partial<Record<KolamNotificationSoundType, NotificationSoundStatus>>
  >({});
  const [marketplaceLandingOverview, setMarketplaceLandingOverview] =
    useState<MarketplaceLandingOverview>(emptyMarketplaceLandingOverview);
  const [marketplaceLandingCtaDraft, setMarketplaceLandingCtaDraft] =
    useState<MarketplaceLandingCtaDraft>(emptyMarketplaceLandingCtaDraft);
  const [marketplaceLandingHeroDraft, setMarketplaceLandingHeroDraft] =
    useState<MarketplaceLandingHeroDraft>(emptyMarketplaceLandingHeroDraft);
  const [marketplaceLandingCategoryDraft, setMarketplaceLandingCategoryDraft] =
    useState<MarketplaceLandingCategoryDraft>(
      emptyMarketplaceLandingCategoryDraft,
    );
  const [
    marketplaceLandingAnnouncementDraft,
    setMarketplaceLandingAnnouncementDraft,
  ] = useState<MarketplaceLandingAnnouncementDraft>(
    emptyMarketplaceLandingAnnouncementDraft,
  );
  const [marketplaceLandingYoutubeDraft, setMarketplaceLandingYoutubeDraft] =
    useState<MarketplaceLandingYoutubeDraft>(
      emptyMarketplaceLandingYoutubeDraft,
    );
  const [marketplaceLandingNoticeDraft, setMarketplaceLandingNoticeDraft] =
    useState<MarketplaceLandingNoticeDraft>(emptyMarketplaceLandingNoticeDraft);
  const [marketplaceLandingSaveStatus, setMarketplaceLandingSaveStatus] =
    useState<MarketplaceLandingSaveStatus>('idle');
  const [marketplaceLandingMessage, setMarketplaceLandingMessage] =
    useState('');
  const [marketplaceLandingAssetStatus, setMarketplaceLandingAssetStatus] =
    useState<Partial<Record<string, MarketplaceLandingAssetStatus>>>({});
  const [webContentPanelId, setWebContentPanelId] =
    useState<WebContentPanelId>('marketplace');
  const [marketplaceLandingTabId, setMarketplaceLandingTabId] =
    useState<MarketplaceLandingTabId>('hero');
  const allSettingsTabItems = getSettingsTabItems();
  const settingsVisibilityPending =
    settingsVisibilityContext === undefined ||
    settingsVisibilityContext === null ||
    !Array.isArray(settingsVisibilityContext.permissions);
  const visibleSettingsTabItems = settingsVisibilityPending
    ? allSettingsTabItems
    : getVisibleSettingsTabItems(settingsVisibilityContext);
  const visibleSettingsTabIdSignature = visibleSettingsTabItems
    .map(item => item.id)
    .join('|');
  const [blogRows, setBlogRows] = useState<KolamBlog[]>([]);
  const [blogTopicRows, setBlogTopicRows] = useState<KolamBlogTopic[]>([]);
  const [blogTotal, setBlogTotal] = useState(0);
  const [blogTopicTotal, setBlogTopicTotal] = useState(0);
  const [webContentStatus, setWebContentStatus] = useState<
    'idle' | 'loading' | 'live' | 'error'
  >('idle');
  const [webContentMessage, setWebContentMessage] = useState('');
  const [kpiSettings, setKpiSettings] = useState<KolamKpiSettings | null>(null);
  const [kpiSettingsDraft, setKpiSettingsDraft] = useState<KpiSettingsDraft>(
    emptyKpiSettingsDraft,
  );
  const [kpiPreview, setKpiPreview] =
    useState<KolamKpiWeeklyAnnouncePreview | null>(null);
  const [kpiStatus, setKpiStatus] = useState<
    'idle' | 'loading' | 'live' | 'saving' | 'error' | 'disabled'
  >('idle');
  const [kpiMessage, setKpiMessage] = useState('');
  const [webSettingDraft, setWebSettingDraft] =
    useState<WebSettingDraft>(emptyWebSettingDraft);
  const [daraKnowledgeDraft, setDaraKnowledgeDraft] =
    useState<DaraKnowledgeDraft>(emptyDaraKnowledgeDraft);
  const [daraKnowledgeSaveStatus, setDaraKnowledgeSaveStatus] =
    useState<DaraKnowledgeSaveStatus>('idle');
  const [daraKnowledgeMessage, setDaraKnowledgeMessage] = useState('');
  const [sitemapDraft, setSitemapDraft] =
    useState<KolamSitemapConfig>(defaultSitemapConfig);
  const [sitemapCustomUrlsText, setSitemapCustomUrlsText] = useState('');
  const [sitemapExcludedSlugsText, setSitemapExcludedSlugsText] = useState<
    Partial<Record<KolamSitemapSectionKey, string>>
  >({});
  const [regionProvinceRows, setRegionProvinceRows] = useState<KolamRegion[]>(
    [],
  );
  const [regionRegencyRows, setRegionRegencyRows] = useState<KolamRegion[]>([]);
  const [regionDistrictRows, setRegionDistrictRows] = useState<KolamRegion[]>(
    [],
  );
  const [regionVillageRows, setRegionVillageRows] = useState<KolamRegion[]>([]);
  const [regionStats, setRegionStats] = useState<KolamRegionStats | null>(null);
  const [regionSyncStatus, setRegionSyncStatus] =
    useState<RegionSyncStatus>('idle');
  const [regionSyncMessage, setRegionSyncMessage] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedRegency, setSelectedRegency] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const activeRegionHierarchy = createRegionHierarchyQuery({
    selectedDistrict,
    selectedProvince,
    selectedRegency,
  });
  const [regionReloadKey, setRegionReloadKey] = useState(0);
  const [operationalRooms, setOperationalRooms] = useState<KolamTeamChatRoom[]>(
    [],
  );
  const [operationalStaffRows, setOperationalStaffRows] = useState<
    KolamUserPickerRow[]
  >([]);
  const [staffAttendanceSettings, setStaffAttendanceSettings] =
    useState<KolamStaffAttendanceSettings | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<KolamPaymentMethod[]>(
    [],
  );
  const [paymentMethodFilters, setPaymentMethodFilters] =
    useState<SettingsPaymentMethodFilters>({
      search: '',
      isAvailableOnWebstore: '',
      page: 1,
      limit: 10,
    });
  const [paymentMethodTotalPages, setPaymentMethodTotalPages] = useState(1);
  const [paymentMethodTotal, setPaymentMethodTotal] = useState(0);
  const [paymentMethodDraft, setPaymentMethodDraft] =
    useState<SettingsPaymentMethodDraft>(emptyPaymentMethodDraft);
  const [financialWallets, setFinancialWallets] = useState<
    KolamFinancialWallet[]
  >([]);
  const [financialStatus, setFinancialStatus] =
    useState<FinancialDataStatus>('idle');
  const [financialMessage, setFinancialMessage] = useState('');
  const [taxCompanyProfile, setTaxCompanyProfile] =
    useState<KolamTaxCompanyProfile | null>(null);
  const [taxCompanyProfileDraft, setTaxCompanyProfileDraft] =
    useState<KolamTaxCompanyProfile>({});
  const [taxPartyGaps, setTaxPartyGaps] =
    useState<KolamTaxPartyGapsSummary | null>(null);
  const fallbackRoleRows = getSettingsRoleAccessRows();
  const [roles, setRoles] = useState<KolamRole[]>([]);
  const [roleStatus, setRoleStatus] = useState<RoleSaveStatus>('idle');
  const [roleSaveStatus, setRoleSaveStatus] = useState<RoleSaveStatus>('idle');
  const [roleMessage, setRoleMessage] = useState('');
  const [roleDraft, setRoleDraft] = useState<RoleDraft>(emptyRoleDraft);
  const [roleMemberPreview, setRoleMemberPreview] =
    useState<SettingsRoleMemberPreview | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<KolamRole | null>(null);
  const roleRows = roles.length
    ? getSettingsRoleAccessRowsFromLive(roles)
    : fallbackRoleRows;
  const [selectedRoleId, setSelectedRoleId] = useState(
    fallbackRoleRows[0]?.id ?? '',
  );

  useEffect(() => {
    let mounted = true;

    getCurrentUser()
      .then(user => {
        if (!mounted) {
          return;
        }

        setSettingsVisibilityContext({
          roleKey: user.roleKey,
          permissions: user.permissions,
        });
      })
      .catch(() => {
        if (mounted) {
          setSettingsVisibilityContext(null);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (settingsVisibilityContext === undefined) {
      return;
    }

    if (visibleSettingsTabItems.some(item => item.id === activeSettingsTabId)) {
      return;
    }

    const nextTab = visibleSettingsTabItems[0];
    if (!nextTab) {
      return;
    }

    setActiveSettingsTabId(nextTab.id);
    setActiveSurfaceId(nextTab.surfaceId);
    setActivityPage(1);
    setSelectedActivityLogId('');
  }, [
    activeSettingsTabId,
    settingsVisibilityContext,
    visibleSettingsTabIdSignature,
    visibleSettingsTabItems,
  ]);

  useEffect(() => {
    if (activeSurfaceId !== 'web-settings') {
      return;
    }

    let mounted = true;
    setWebSettingStatus('loading');

    Promise.allSettled([
      getKolamWebSetting(),
      getKolamWebSettingVersion('kolam'),
      getKolamWebSettingVersions(),
    ])
      .then(([settingResult, versionResult, versionsResult]) => {
        if (!mounted) {
          return;
        }

        if (settingResult.status !== 'fulfilled') {
          setWebSettingStatus('error');
          return;
        }

        const setting = settingResult.value;
        const version =
          versionResult.status === 'fulfilled' ? versionResult.value : null;
        const versions =
          versionsResult.status === 'fulfilled' ? versionsResult.value : null;

        setWebSetting(setting);
        setWebSettingVersion(version);
        setWebSettingVersions(versions);
        setWebSettingDraft(createWebSettingDraft(setting, versions, version));
        const nextSitemapDraft = normalizeSitemapConfig(setting.sitemapConfig);
        setSitemapDraft(nextSitemapDraft);
        setSitemapCustomUrlsText(formatSitemapCustomUrlsText(nextSitemapDraft));
        setSitemapExcludedSlugsText(
          formatSitemapExcludedSlugsText(nextSitemapDraft),
        );
        setWebTitle(getSettingsWebConfigFields(setting)[0].value);
        setStorefrontEnabled(setting.livechatOnline === true);
        setMaintenanceMode(setting.maintenance?.pos === true);
        setWebSettingStatus('live');
        setWebSettingMessage('');
      })
      .catch(() => {
        if (mounted) {
          setWebSettingStatus('error');
          setWebSettingMessage('Gagal membaca Web Settings live.');
        }
      });

    return () => {
      mounted = false;
    };
  }, [activeSurfaceId]);

  useEffect(() => {
    if (activeSurfaceId !== 'web-settings') {
      return;
    }

    let mounted = true;
    setMarketplaceLandingOverview(current => ({
      ...current,
      status: 'loading',
      message: '',
    }));

    Promise.all([
      getKolamHeroSlidesAdmin(),
      getKolamCategoryBannersAdmin(),
      getKolamCtaSectionAdmin(),
      getKolamYoutubeSectionAdmin(),
      getKolamAnnouncementBannersAdmin(),
      getKolamCustomerNoticesAdmin(),
      getKolamMarketplaceContentAdmin(),
    ])
      .then(
        ([
          heroSlides,
          categoryBanners,
          ctaSection,
          youtubeSection,
          announcementBanners,
          customerNotices,
          marketplaceContent,
        ]) => {
          if (!mounted) {
            return;
          }

          setMarketplaceLandingOverview({
            status: 'live',
            message: '',
            heroSlides,
            categoryBanners,
            ctaSection,
            youtubeSection,
            announcementBanners,
            customerNotices,
            marketplaceContent,
          });
          setMarketplaceLandingCtaDraft(
            createMarketplaceLandingCtaDraft(ctaSection),
          );
          setMarketplaceLandingYoutubeDraft(
            createMarketplaceLandingYoutubeDraft(youtubeSection),
          );
          setMarketplaceLandingHeroDraft(emptyMarketplaceLandingHeroDraft);
          setMarketplaceLandingCategoryDraft(
            emptyMarketplaceLandingCategoryDraft,
          );
          setMarketplaceLandingAnnouncementDraft(
            emptyMarketplaceLandingAnnouncementDraft,
          );
          setMarketplaceLandingNoticeDraft(emptyMarketplaceLandingNoticeDraft);
          setMarketplaceLandingSaveStatus('idle');
          setMarketplaceLandingMessage('');
        },
      )
      .catch(error => {
        if (mounted) {
          setMarketplaceLandingOverview(current => ({
            ...current,
            status: 'error',
            message: getMarketplaceLandingOverviewErrorMessage(error),
          }));
        }
      });

    return () => {
      mounted = false;
    };
  }, [activeSurfaceId]);

  useEffect(() => {
    if (activeSurfaceId !== 'role-management') {
      return;
    }

    let mounted = true;
    setRoleStatus('loading');

    getKolamRoles()
      .then(nextRoles => {
        if (!mounted) {
          return;
        }

        setRoles(nextRoles);
        setRoleStatus('saved');
        setRoleMessage('');
        setSelectedRoleId(current =>
          nextRoles.some(role => role._id === current)
            ? current
            : nextRoles[0]?._id ?? '',
        );
      })
      .catch(error => {
        if (mounted) {
          setRoleStatus('error');
          setRoleMessage(getRoleSaveErrorMessage(error));
        }
      });

    return () => {
      mounted = false;
    };
  }, [activeSurfaceId]);

  useEffect(() => {
    if (activeSettingsTabId !== 'operasional' && activeSettingsTabId !== 'ai') {
      return;
    }

    let mounted = true;

    Promise.allSettled([
      activeSettingsTabId === 'operasional'
        ? getKolamStaffAttendanceSettings()
        : Promise.resolve(null),
      getKolamTeamChatRooms(),
      activeSettingsTabId === 'operasional'
        ? getKolamUserPickerRows()
        : Promise.resolve([]),
    ]).then(([attendanceResult, roomsResult, staffResult]) => {
      if (!mounted) {
        return;
      }

      if (
        activeSettingsTabId === 'operasional' &&
        attendanceResult.status === 'fulfilled' &&
        attendanceResult.value
      ) {
        const attendanceSettings = attendanceResult.value;
        setStaffAttendanceSettings(attendanceSettings);
        setWebSettingDraft(current => ({
          ...current,
          ...createStaffAttendanceDraftFields(attendanceSettings),
        }));
      } else if (
        activeSettingsTabId === 'operasional' &&
        attendanceResult.status === 'rejected'
      ) {
        setWebSettingMessage(
          `Gagal memuat pengaturan absensi: ${getWebSettingSaveErrorMessage(
            attendanceResult.reason,
          )}`,
        );
      }

      if (roomsResult.status === 'fulfilled') {
        setOperationalRooms(roomsResult.value);
      }

      if (
        activeSettingsTabId === 'operasional' &&
        staffResult.status === 'fulfilled'
      ) {
        setOperationalStaffRows(staffResult.value);
      }
    });

    return () => {
      mounted = false;
    };
  }, [activeSettingsTabId]);

  useEffect(() => {
    if (activeSettingsTabId !== 'finansial') {
      return;
    }

    let mounted = true;
    setFinancialStatus('loading');
    setFinancialMessage('');

    Promise.allSettled([
      getKolamPaymentMethods(
        createPaymentMethodListParams(paymentMethodFilters),
      ),
      getKolamFinancialWallets(),
      getKolamTaxCompanyProfile(),
      getKolamTaxPartyGaps(),
    ])
      .then(([methodsResult, walletsResult, profileResult, gapsResult]) => {
        if (!mounted) {
          return;
        }

        if (methodsResult.status === 'fulfilled') {
          setPaymentMethods(methodsResult.value.rows);
          setPaymentMethodTotal(methodsResult.value.pagination.total);
          setPaymentMethodTotalPages(methodsResult.value.pagination.totalPages);
        } else {
          setPaymentMethods([]);
          setPaymentMethodTotal(0);
          setPaymentMethodTotalPages(1);
        }

        if (walletsResult.status === 'fulfilled') {
          setFinancialWallets(walletsResult.value);
        }

        if (profileResult.status === 'fulfilled') {
          setTaxCompanyProfile(profileResult.value);
          setTaxCompanyProfileDraft(profileResult.value);
        }

        if (gapsResult.status === 'fulfilled') {
          setTaxPartyGaps(gapsResult.value);
        }

        setFinancialStatus('live');
        setFinancialMessage(
          methodsResult.status === 'rejected' &&
            profileResult.status === 'rejected'
            ? 'Gagal memuat data Finansial live.'
            : '',
        );
      })
      .catch(error => {
        if (!mounted) {
          return;
        }

        setFinancialStatus('error');
        setFinancialMessage(getFinancialErrorMessage(error));
      });

    return () => {
      mounted = false;
    };
  }, [activeSettingsTabId, paymentMethodFilters]);

  useEffect(() => {
    if (activeSettingsTabId !== 'konten') {
      return;
    }

    let mounted = true;
    setWebContentStatus('loading');

    Promise.allSettled([
      getKolamBlogs({ page: 1, limit: 10, sort: 'createdAt:desc' }),
      getKolamBlogTopics({ page: 1, limit: 50, sort: 'name:asc' }),
    ])
      .then(([blogsResult, topicsResult]) => {
        if (!mounted) {
          return;
        }

        if (
          blogsResult.status !== 'fulfilled' ||
          topicsResult.status !== 'fulfilled'
        ) {
          setWebContentStatus('error');
          setWebContentMessage('Gagal membaca Blog atau Blog Topics live.');
          return;
        }

        setBlogRows(blogsResult.value.data ?? []);
        setBlogTopicRows(topicsResult.value.data ?? []);
        setBlogTotal(blogsResult.value.pagination?.total ?? 0);
        setBlogTopicTotal(topicsResult.value.pagination?.total ?? 0);
        setWebContentStatus('live');
        setWebContentMessage('');
      })
      .catch(() => {
        if (mounted) {
          setWebContentStatus('error');
          setWebContentMessage('Gagal membaca Konten Web live.');
        }
      });

    return () => {
      mounted = false;
    };
  }, [activeSettingsTabId]);

  useEffect(() => {
    if (activeSettingsTabId !== 'kpi') {
      return;
    }

    if (!webSettingDraft.pluginControls.kpi) {
      setKpiStatus('disabled');
      setKpiMessage('Plugin KPI nonaktif. Aktifkan dari tab Plugin.');
      return;
    }

    let mounted = true;
    setKpiStatus('loading');

    Promise.allSettled([
      getKolamKpiSettings(),
      getKolamKpiWeeklyAnnouncePreview({ limit: 5 }),
    ])
      .then(([settingsResult, previewResult]) => {
        if (!mounted) {
          return;
        }

        if (settingsResult.status !== 'fulfilled') {
          setKpiStatus('error');
          setKpiMessage(getKpiSettingsErrorMessage(settingsResult.reason));
          return;
        }

        setKpiSettings(settingsResult.value);
        setKpiSettingsDraft(createKpiSettingsDraft(settingsResult.value));
        setKpiPreview(
          previewResult.status === 'fulfilled' ? previewResult.value : null,
        );
        setKpiStatus('live');
        setKpiMessage('');
      })
      .catch(error => {
        if (mounted) {
          setKpiStatus('error');
          setKpiMessage(getKpiSettingsErrorMessage(error));
        }
      });

    return () => {
      mounted = false;
    };
  }, [activeSettingsTabId, webSettingDraft.pluginControls.kpi]);

  useEffect(() => {
    if (activeSettingsTabId !== 'sync') {
      return;
    }

    let mounted = true;
    setRegionSyncStatus(current =>
      current === 'syncing' ? 'syncing' : 'loading',
    );

    fetchKolamRegionHierarchy({
      selectedDistrict,
      selectedProvince,
      selectedRegency,
    })
      .then(result => {
        if (!mounted) {
          return;
        }

        setRegionProvinceRows(result.provinces);
        setRegionRegencyRows(result.regencies);
        setRegionDistrictRows(result.districts);
        setRegionVillageRows(result.villages);
        setRegionStats(result.stats);
        setRegionSyncStatus('live');
        setRegionSyncMessage('');
      })
      .catch(error => {
        if (mounted) {
          setRegionSyncStatus('error');
          setRegionSyncMessage(getRegionSyncErrorMessage(error));
        }
      });

    return () => {
      mounted = false;
    };
  }, [
    activeSettingsTabId,
    selectedDistrict,
    selectedProvince,
    selectedRegency,
    regionReloadKey,
  ]);

  useEffect(() => {
    if (activeSurfaceId !== 'activity-log') {
      return;
    }

    let mounted = true;
    setActivityLogStatus('loading');

    Promise.allSettled([
      getKolamActivityLogs(
        createActivityLogListParams(activityLogFilters, activityPage),
      ),
      getKolamActivityLogStats(7),
    ])
      .then(([logsResult, statsResult]) => {
        if (!mounted) {
          return;
        }

        if (logsResult.status !== 'fulfilled') {
          setActivityLogStatus('error');
          setActivityLogMessage(getActivityLogErrorMessage(logsResult.reason));
          return;
        }

        setActivityLogs(logsResult.value.data);
        setActivityLogTotal(Math.max(0, logsResult.value.meta.total));
        setActivityLogStats(
          statsResult.status === 'fulfilled' ? statsResult.value : null,
        );
        setActivityLogStatus('live');
        setActivityLogMessage('');
      })
      .catch(error => {
        if (mounted) {
          setActivityLogStatus('error');
          setActivityLogMessage(getActivityLogErrorMessage(error));
        }
      });

    return () => {
      mounted = false;
    };
  }, [activeSurfaceId, activityLogFilters, activityPage, activityReloadKey]);

  const activeSurface =
    settingsSurfaceItems.find(item => item.id === activeSurfaceId) ??
    settingsSurfaceItems[0];
  const detailRows = getSettingsDetailRows(activeSurface.id);
  const useLiveActivityLogs =
    activeSurfaceId === 'activity-log' && activityLogStatus !== 'idle';
  const activityRows = useLiveActivityLogs
    ? getSettingsActivityLogRowsFromLive(activityLogs)
    : getSettingsActivityLogRows(activityEntries, activityLogPageSize, 1);
  const activityPagination = getSettingsActivityLogPagination(
    useLiveActivityLogs ? activityLogTotal : activityEntries.length,
    activityPage,
    activityLogPageSize,
  );
  const selectedActivityLog =
    activityRows.find(row => row.id === selectedActivityLogId) ?? null;
  const selectedLiveActivityLog =
    activityLogs.find(log => log._id === selectedActivityLogId) ?? null;
  const selectedActivityLogFields = selectedLiveActivityLog
    ? getSettingsActivityLogDetailFieldsFromLive(selectedLiveActivityLog)
    : selectedActivityLog
    ? getSettingsActivityLogDetailFields(selectedActivityLog)
    : [];
  const selectedRole =
    roleRows.find(row => row.id === selectedRoleId) ?? roleRows[0];
  const selectedLiveRole =
    roles.find(role => role._id === selectedRole?.id) ?? null;
  const canViewRoleMembers =
    isSettingsSuperAdminRoleKey(settingsVisibilityContext?.roleKey ?? '') ||
    hasSettingsPermission(settingsVisibilityContext, 'user', 'view_by_admin');
  const canUpdateRoles = hasSettingsRoleMutationPermission(
    settingsVisibilityContext,
    'update',
  );
  const liveEndpoints = getSettingsLiveEndpoints().filter(endpoint => {
    if (activeSurfaceId === 'web-settings') {
      return endpoint.path.startsWith('/websetting');
    }
    if (activeSurfaceId === 'role-management') {
      return endpoint.path.startsWith('/roles');
    }
    return endpoint.path.startsWith('/activity-log');
  });
  const financialSummaryRows = createFinancialSummaryRows(
    webSetting,
    paymentMethods,
  );
  const financialSectionVisibility = createFinancialSectionVisibility(
    settingsVisibilityContext,
  );
  const visibleRegionRows = selectedDistrict
    ? regionVillageRows
    : selectedRegency
      ? regionDistrictRows
      : selectedProvince
        ? regionRegencyRows
        : regionProvinceRows;
  const filteredRegionRows = selectedVillage
    ? visibleRegionRows.filter(region => region.code === selectedVillage)
    : visibleRegionRows;
  const regionSyncSummaryRows = createRegionSyncSummaryRows(regionStats);
  const webContentLauncherItems = createWebContentLauncherItems({
    blogRows,
    blogTopicRows,
    blogTotal,
    blogTopicTotal,
    marketplaceLandingOverview,
  });
  const marketplaceLandingTabItems = createMarketplaceLandingTabItems(
    marketplaceLandingOverview,
  );
  const kpiSummaryRows = createKpiSettingsSummaryRows(kpiSettings, kpiPreview);

  const selectSurface = (id: SettingsSurfaceItem['id']) => {
    setActiveSurfaceId(id);
    setActiveSettingsTabId(getDefaultSettingsTabIdForSurface(id));
    setActivityPage(1);
    setSelectedActivityLogId('');
  };

  const selectSettingsTab = (id: SettingsTabId | string) => {
    if (!isSettingsTabId(id)) {
      return;
    }

    if (
      settingsVisibilityContext !== undefined &&
      !visibleSettingsTabItems.some(item => item.id === id)
    ) {
      return;
    }

    setActiveSettingsTabId(id);
    setActiveSurfaceId(getSettingsSurfaceIdForTab(id));
    setActivityPage(1);
    setSelectedActivityLogId('');
  };

  useEffect(() => {
    if (!selectedLiveRole) {
      setRoleMemberPreview(null);
      return;
    }

    setRoleDraft({
      name: selectedLiveRole.name ?? '',
      key: selectedLiveRole.key ?? '',
      description: selectedLiveRole.description ?? '',
    });
    setRoleSaveStatus('idle');
  }, [selectedLiveRole]);

  useEffect(() => {
    if (!selectedLiveRole || !canViewRoleMembers) {
      setRoleMemberPreview(null);
      return;
    }

    let mounted = true;

    getKolamUserList({
      roleId: selectedLiveRole._id,
      limit: 50,
      includeResigned: 'false',
    })
      .then(result => {
        if (!mounted) {
          return;
        }

        setRoleMemberPreview({
          roleId: selectedLiveRole._id,
          label: 'Anggota',
          count: result.pagination.total || result.items.length,
          members: result.items
            .filter(user => !user.resignedAt)
            .map(user => ({
              id: user.id,
              name: user.displayName,
              initials: getRoleMemberInitials(user.displayName),
            })),
          sourceComponent: 'settings/roles/list.tsx',
        });
      })
      .catch(() => {
        if (mounted) {
          setRoleMemberPreview({
            roleId: selectedLiveRole._id,
            label: 'Anggota',
            count: 0,
            members: [],
            sourceComponent: 'settings/roles/list.tsx',
          });
        }
      });

    return () => {
      mounted = false;
    };
  }, [canViewRoleMembers, selectedLiveRole]);

  const changeActivityPage = (page: number) => {
    setActivityPage(page);
    setSelectedActivityLogId('');
  };
  const setActivityLogFilter = (
    key: keyof SettingsActivityLogFilterState,
    value: string,
  ) => {
    setActivityLogFilters(current => ({
      ...current,
      [key]: value,
    }));
    setActivityPage(1);
    setSelectedActivityLogId('');
  };
  const refreshActivityLogs = () => {
    setActivityReloadKey(current => current + 1);
  };
  const setWebSettingDraftField = <Key extends keyof WebSettingDraft>(
    key: Key,
    value: WebSettingDraft[Key],
  ) => {
    setWebSettingDraft(current => ({
      ...current,
      [key]: value,
    }));
    setWebSettingSaveStatus('idle');
  };
  const setWebSettingDraftFields = (
    patch: Partial<WebSettingDraft>,
    resetSaveStatus = true,
  ) => {
    setWebSettingDraft(current => ({
      ...current,
      ...patch,
    }));
    if (resetSaveStatus) {
      setWebSettingSaveStatus('idle');
    }
  };
  const setDaraKnowledgeDraftField = <Key extends keyof DaraKnowledgeDraft>(
    key: Key,
    value: DaraKnowledgeDraft[Key],
  ) => {
    setDaraKnowledgeDraft(current => ({
      ...current,
      [key]: value,
    }));
    setDaraKnowledgeSaveStatus('idle');
    setDaraKnowledgeMessage('');
  };
  const setWebSettingPluginControl = (
    key: KolamPluginConfigKey,
    enabled: boolean,
  ) => {
    setWebSettingDraft(current => ({
      ...current,
      pluginControls: {
        ...current.pluginControls,
        [key]: enabled,
      },
    }));
    setWebSettingSaveStatus('idle');
  };
  const setSitemapMasterField = (
    key: 'enabled' | 'includeImages',
    value: boolean,
  ) => {
    setSitemapDraft(current => ({ ...current, [key]: value }));
    setWebSettingSaveStatus('idle');
  };
  const setSitemapSectionField = (
    section: KolamSitemapSectionKey,
    key: 'enabled' | 'priority' | 'changeFrequency',
    value: string | boolean,
  ) => {
    setSitemapDraft(current => ({
      ...current,
      sections: {
        ...(current.sections ?? {}),
        [section]: {
          ...(current.sections?.[section] ?? {}),
          [key]:
            key === 'priority'
              ? parseNumberOrFallback(String(value), 0.5)
              : value,
        },
      },
    }));
    setWebSettingSaveStatus('idle');
  };
  const setSitemapStaticPageField = (
    index: number,
    key: 'path' | 'enabled' | 'priority' | 'changeFrequency',
    value: string | boolean,
  ) => {
    setSitemapDraft(current => ({
      ...current,
      staticPages: (current.staticPages ?? []).map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [key]:
                key === 'priority'
                  ? parseNumberOrFallback(String(value), 0.5)
                  : key === 'changeFrequency'
                  ? normalizeSitemapChangeFrequency(String(value))
                  : value,
            }
          : item,
      ),
    }));
    setWebSettingSaveStatus('idle');
  };
  const addSitemapStaticPage = () => {
    setSitemapDraft(current => ({
      ...current,
      staticPages: [
        ...(current.staticPages ?? []),
        {
          path: '',
          enabled: true,
          priority: 0.5,
          changeFrequency: 'monthly',
        },
      ],
    }));
    setWebSettingSaveStatus('idle');
  };
  const removeSitemapStaticPage = (index: number) => {
    setSitemapDraft(current => ({
      ...current,
      staticPages: (current.staticPages ?? []).filter(
        (_item, itemIndex) => itemIndex !== index,
      ),
    }));
    setWebSettingSaveStatus('idle');
  };
  const setSitemapCustomUrlField = (
    index: number,
    key: 'path' | 'priority' | 'changeFrequency',
    value: string,
  ) => {
    setSitemapDraft(current => ({
      ...current,
      customUrls: (current.customUrls ?? []).map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [key]:
                key === 'priority'
                  ? parseNumberOrFallback(value, 0.5)
                  : key === 'changeFrequency'
                  ? normalizeSitemapChangeFrequency(value)
                  : value,
            }
          : item,
      ),
    }));
    setWebSettingSaveStatus('idle');
  };
  const addSitemapCustomUrl = () => {
    setSitemapDraft(current => ({
      ...current,
      customUrls: [
        ...(current.customUrls ?? []),
        {path: '', priority: 0.5, changeFrequency: 'weekly'},
      ],
    }));
    setWebSettingSaveStatus('idle');
  };
  const removeSitemapCustomUrl = (index: number) => {
    setSitemapDraft(current => ({
      ...current,
      customUrls: (current.customUrls ?? []).filter(
        (_item, itemIndex) => itemIndex !== index,
      ),
    }));
    setWebSettingSaveStatus('idle');
  };
  const setSitemapCustomUrlsDraftText = (value: string) => {
    setSitemapCustomUrlsText(value);
    setSitemapDraft(current => ({
      ...current,
      customUrls: parseSitemapCustomUrlsText(value),
    }));
    setWebSettingSaveStatus('idle');
  };
  const setSitemapExcludedSlugsDraftText = (
    section: KolamSitemapSectionKey,
    value: string,
  ) => {
    setSitemapExcludedSlugsText(current => ({
      ...current,
      [section]: value,
    }));
    setWebSettingSaveStatus('idle');
  };
  const setRegionSelection = (
    key: 'province' | 'regency' | 'district' | 'village',
    value: string,
  ) => {
    if (key === 'province') {
      setSelectedProvince(value.trim());
      setSelectedRegency('');
      setSelectedDistrict('');
      setSelectedVillage('');
    } else if (key === 'regency') {
      setSelectedRegency(value.trim());
      setSelectedDistrict('');
      setSelectedVillage('');
    } else if (key === 'district') {
      setSelectedDistrict(value.trim());
      setSelectedVillage('');
    } else {
      setSelectedVillage(value.trim());
    }
  };
  const refreshRegionSync = () => {
    setRegionSyncStatus('loading');
    setRegionReloadKey(current => current + 1);
  };
  const runRegionSync = async (scope: KolamRegionSyncScope) => {
    const parentCode = getRegionSyncParentSelectionCode(scope, {
      selectedDistrict,
      selectedProvince,
      selectedRegency,
    });
    const missingParentMessage = getRegionSyncMissingParentMessage(
      scope,
      parentCode,
    );

    if (missingParentMessage) {
      setRegionSyncStatus('error');
      setRegionSyncMessage(missingParentMessage);
      return;
    }

    setRegionSyncStatus('syncing');
    setRegionSyncMessage('');

    try {
      const result = await syncKolamRegions({
        scope,
        parentCode,
      });
      const stats = result.data;
      setRegionSyncMessage(
        `Synced ${formatNumber(stats.upserted)} rows, ${formatNumber(
          stats.withPostalCode,
        )} postal codes.`,
      );
      const nextHierarchy = await fetchKolamRegionHierarchy({
        selectedDistrict,
        selectedProvince,
        selectedRegency,
      });
      setRegionProvinceRows(nextHierarchy.provinces);
      setRegionRegencyRows(nextHierarchy.regencies);
      setRegionDistrictRows(nextHierarchy.districts);
      setRegionVillageRows(nextHierarchy.villages);
      setRegionStats(nextHierarchy.stats);
      setRegionSyncStatus('live');
    } catch (error) {
      setRegionSyncStatus('error');
      setRegionSyncMessage(getRegionSyncErrorMessage(error));
    }
  };
  const setKpiSettingsDraftField = <Key extends keyof KpiSettingsDraft>(
    key: Key,
    value: KpiSettingsDraft[Key],
  ) => {
    setKpiSettingsDraft(current => ({ ...current, [key]: value }));
    setKpiStatus(current => (current === 'disabled' ? current : 'live'));
    setKpiMessage('');
  };
  const setKpiEnabledRule = (rule: string, enabled: boolean) => {
    setKpiSettingsDraft(current => ({
      ...current,
      enabledRules: {
        ...current.enabledRules,
        [rule]: enabled,
      },
    }));
    setKpiStatus(current => (current === 'disabled' ? current : 'live'));
    setKpiMessage('');
  };
  const refreshKpiWeeklyPreview = async () => {
    if (!webSettingDraft.pluginControls.kpi) {
      setKpiStatus('disabled');
      setKpiMessage('Plugin KPI nonaktif. Aktifkan dari tab Plugin.');
      return;
    }

    setKpiStatus('loading');
    try {
      const preview = await getKolamKpiWeeklyAnnouncePreview({ limit: 5 });
      setKpiPreview(preview);
      setKpiStatus('live');
      setKpiMessage('');
    } catch (error) {
      setKpiStatus('error');
      setKpiMessage(getKpiSettingsErrorMessage(error));
    }
  };
  const saveKpiSettings = async () => {
    if (!webSettingDraft.pluginControls.kpi) {
      setKpiStatus('disabled');
      setKpiMessage('Plugin KPI nonaktif. Aktifkan dari tab Plugin.');
      return;
    }

    const previousSettings = kpiSettings;
    const previousDraft = kpiSettingsDraft;
    setKpiStatus('saving');
    setKpiMessage('');

    try {
      const updated = await updateKolamKpiSettings(
        createKpiSettingsUpdateBody(kpiSettingsDraft, kpiSettings),
      );
      setKpiSettings(updated);
      setKpiSettingsDraft(createKpiSettingsDraft(updated));
      setKpiPreview(await getKolamKpiWeeklyAnnouncePreview({ limit: 5 }));
      setKpiStatus('live');
      setKpiMessage('Pengaturan KPI berhasil disimpan.');
    } catch (error) {
      setKpiSettings(previousSettings);
      setKpiSettingsDraft(previousDraft);
      setKpiStatus('error');
      setKpiMessage(getKpiSettingsErrorMessage(error));
    }
  };
  const setMarketplaceLandingCtaDraftField = <
    Key extends keyof MarketplaceLandingCtaDraft,
  >(
    key: Key,
    value: MarketplaceLandingCtaDraft[Key],
  ) => {
    setMarketplaceLandingCtaDraft(current => ({ ...current, [key]: value }));
    setMarketplaceLandingSaveStatus('idle');
  };
  const setMarketplaceLandingHeroDraftField = <
    Key extends keyof MarketplaceLandingHeroDraft,
  >(
    key: Key,
    value: MarketplaceLandingHeroDraft[Key],
  ) => {
    setMarketplaceLandingHeroDraft(current => ({ ...current, [key]: value }));
    setMarketplaceLandingSaveStatus('idle');
  };
  const setMarketplaceLandingCategoryDraftField = <
    Key extends keyof MarketplaceLandingCategoryDraft,
  >(
    key: Key,
    value: MarketplaceLandingCategoryDraft[Key],
  ) => {
    setMarketplaceLandingCategoryDraft(current => ({
      ...current,
      [key]: value,
    }));
    setMarketplaceLandingSaveStatus('idle');
  };
  const setMarketplaceLandingAnnouncementDraftField = <
    Key extends keyof MarketplaceLandingAnnouncementDraft,
  >(
    key: Key,
    value: MarketplaceLandingAnnouncementDraft[Key],
  ) => {
    setMarketplaceLandingAnnouncementDraft(current => ({
      ...current,
      [key]: value,
    }));
    setMarketplaceLandingSaveStatus('idle');
  };
  const setMarketplaceLandingYoutubeDraftField = <
    Key extends keyof MarketplaceLandingYoutubeDraft,
  >(
    key: Key,
    value: MarketplaceLandingYoutubeDraft[Key],
  ) => {
    setMarketplaceLandingYoutubeDraft(current => ({
      ...current,
      [key]: value,
    }));
    setMarketplaceLandingSaveStatus('idle');
  };
  const setMarketplaceLandingNoticeDraftField = <
    Key extends keyof MarketplaceLandingNoticeDraft,
  >(
    key: Key,
    value: MarketplaceLandingNoticeDraft[Key],
  ) => {
    setMarketplaceLandingNoticeDraft(current => ({ ...current, [key]: value }));
    setMarketplaceLandingSaveStatus('idle');
  };
  const editMarketplaceLandingNotice = (notice: KolamCustomerTextNotice) => {
    setMarketplaceLandingNoticeDraft(
      createMarketplaceLandingNoticeDraft(notice),
    );
    setMarketplaceLandingSaveStatus('idle');
    setMarketplaceLandingMessage('');
  };
  const clearMarketplaceLandingNoticeDraft = () => {
    setMarketplaceLandingNoticeDraft(emptyMarketplaceLandingNoticeDraft);
    setMarketplaceLandingSaveStatus('idle');
    setMarketplaceLandingMessage('');
  };
  const editMarketplaceHeroSlide = (slide: KolamHeroSlide) => {
    setMarketplaceLandingHeroDraft(createMarketplaceLandingHeroDraft(slide));
    setMarketplaceLandingSaveStatus('idle');
    setMarketplaceLandingMessage('');
  };
  const clearMarketplaceHeroDraft = () => {
    setMarketplaceLandingHeroDraft(emptyMarketplaceLandingHeroDraft);
    setMarketplaceLandingSaveStatus('idle');
    setMarketplaceLandingMessage('');
  };
  const editMarketplaceCategoryBanner = (banner: KolamCategoryBanner) => {
    setMarketplaceLandingCategoryDraft(
      createMarketplaceLandingCategoryDraft(banner),
    );
    setMarketplaceLandingSaveStatus('idle');
    setMarketplaceLandingMessage('');
  };
  const clearMarketplaceCategoryDraft = () => {
    setMarketplaceLandingCategoryDraft(emptyMarketplaceLandingCategoryDraft);
    setMarketplaceLandingSaveStatus('idle');
    setMarketplaceLandingMessage('');
  };
  const editMarketplaceAnnouncementBanner = (
    banner: KolamAnnouncementBanner,
  ) => {
    setMarketplaceLandingAnnouncementDraft(
      createMarketplaceLandingAnnouncementDraft(banner),
    );
    setMarketplaceLandingSaveStatus('idle');
    setMarketplaceLandingMessage('');
  };
  const clearMarketplaceAnnouncementDraft = () => {
    setMarketplaceLandingAnnouncementDraft(
      emptyMarketplaceLandingAnnouncementDraft,
    );
    setMarketplaceLandingSaveStatus('idle');
    setMarketplaceLandingMessage('');
  };
  const pickMarketplaceLandingHeroImage = () =>
    pickMarketplaceLandingDraftImage(localUri =>
      setMarketplaceLandingHeroDraftField('imageLocalUri', localUri),
    );
  const pickMarketplaceLandingCategoryImage = () =>
    pickMarketplaceLandingDraftImage(localUri =>
      setMarketplaceLandingCategoryDraftField('imageLocalUri', localUri),
    );
  const pickMarketplaceLandingAnnouncementImage = () =>
    pickMarketplaceLandingDraftImage(localUri =>
      setMarketplaceLandingAnnouncementDraftField('imageLocalUri', localUri),
    );
  const pickMarketplaceLandingDraftImage = async (
    applyLocalUri: (localUri: string) => void,
  ) => {
    setMarketplaceLandingMessage('');

    try {
      const picked = await pickNativeImageFile();
      if (picked.cancelled) {
        return;
      }

      const localUri = picked.uri || picked.path || '';
      if (!localUri) {
        setMarketplaceLandingMessage('File image tidak valid.');
        return;
      }

      if (!isAllowedMarketplaceImageFile(localUri, picked.extension)) {
        setMarketplaceLandingMessage(
          'Asset image hanya menerima JPG, PNG, WEBP, GIF, SVG, HEIC, atau HEIF.',
        );
        return;
      }

      applyLocalUri(localUri);
    } catch (error) {
      setMarketplaceLandingSaveStatus('error');
      setMarketplaceLandingMessage(
        getMarketplaceLandingSaveErrorMessage(error),
      );
    }
  };
  const saveMarketplaceHeroSlide = async () => {
    const title = marketplaceLandingHeroDraft.title.trim();
    if (!title) {
      setMarketplaceLandingSaveStatus('error');
      setMarketplaceLandingMessage('Judul wajib diisi.');
      return;
    }

    if (
      !marketplaceLandingHeroDraft.id &&
      !marketplaceLandingHeroDraft.imageLocalUri
    ) {
      setMarketplaceLandingSaveStatus('error');
      setMarketplaceLandingMessage('Gambar wajib dipilih.');
      return;
    }

    setMarketplaceLandingSaveStatus('saving');
    setMarketplaceLandingMessage('');

    try {
      const body = {
        eyebrow: marketplaceLandingHeroDraft.eyebrow.trim(),
        title,
        subtitle: marketplaceLandingHeroDraft.subtitle.trim(),
        description: marketplaceLandingHeroDraft.description.trim(),
        link: marketplaceLandingHeroDraft.link.trim(),
        linkText: marketplaceLandingHeroDraft.linkText.trim(),
        secondaryLink: marketplaceLandingHeroDraft.secondaryLink.trim(),
        secondaryLinkText: marketplaceLandingHeroDraft.secondaryLinkText.trim(),
        order: parseMarketplaceLandingOrder(marketplaceLandingHeroDraft.order),
        isActive: marketplaceLandingHeroDraft.isActive,
        imageLocalUri: marketplaceLandingHeroDraft.imageLocalUri || undefined,
      };
      const slide = marketplaceLandingHeroDraft.id
        ? await updateKolamHeroSlide(marketplaceLandingHeroDraft.id, body)
        : await createKolamHeroSlide(body);
      setMarketplaceLandingOverview(current => ({
        ...current,
        heroSlides: upsertMarketplaceLandingItem(current.heroSlides, slide),
      }));
      setMarketplaceLandingHeroDraft(createMarketplaceLandingHeroDraft(slide));
      setMarketplaceLandingSaveStatus('saved');
      setMarketplaceLandingMessage('Hero disimpan.');
    } catch (error) {
      setMarketplaceLandingSaveStatus('error');
      setMarketplaceLandingMessage(
        getMarketplaceLandingSaveErrorMessage(error),
      );
    }
  };
  const saveMarketplaceCategoryBanner = async () => {
    const categorySlug = marketplaceLandingCategoryDraft.categorySlug.trim();
    if (!categorySlug) {
      setMarketplaceLandingSaveStatus('error');
      setMarketplaceLandingMessage('Slug kategori wajib diisi.');
      return;
    }

    if (
      !marketplaceLandingCategoryDraft.id &&
      !marketplaceLandingCategoryDraft.imageLocalUri
    ) {
      setMarketplaceLandingSaveStatus('error');
      setMarketplaceLandingMessage('Gambar wajib dipilih.');
      return;
    }

    setMarketplaceLandingSaveStatus('saving');
    setMarketplaceLandingMessage('');

    try {
      const body = {
        categorySlug,
        order: parseMarketplaceLandingOrder(
          marketplaceLandingCategoryDraft.order,
        ),
        isActive: marketplaceLandingCategoryDraft.isActive,
        imageLocalUri:
          marketplaceLandingCategoryDraft.imageLocalUri || undefined,
      };
      const banner = marketplaceLandingCategoryDraft.id
        ? await updateKolamCategoryBanner(
            marketplaceLandingCategoryDraft.id,
            body,
          )
        : await createKolamCategoryBanner(body);
      setMarketplaceLandingOverview(current => ({
        ...current,
        categoryBanners: upsertMarketplaceLandingItem(
          current.categoryBanners,
          banner,
        ),
      }));
      setMarketplaceLandingCategoryDraft(
        createMarketplaceLandingCategoryDraft(banner),
      );
      setMarketplaceLandingSaveStatus('saved');
      setMarketplaceLandingMessage('Kategori disimpan.');
    } catch (error) {
      setMarketplaceLandingSaveStatus('error');
      setMarketplaceLandingMessage(
        getMarketplaceLandingSaveErrorMessage(error),
      );
    }
  };
  const saveMarketplaceAnnouncementBanner = async () => {
    if (
      !marketplaceLandingAnnouncementDraft.id &&
      !marketplaceLandingAnnouncementDraft.imageLocalUri
    ) {
      setMarketplaceLandingSaveStatus('error');
      setMarketplaceLandingMessage('Gambar wajib dipilih.');
      return;
    }

    setMarketplaceLandingSaveStatus('saving');
    setMarketplaceLandingMessage('');

    try {
      const body = {
        link: marketplaceLandingAnnouncementDraft.link.trim(),
        order: parseMarketplaceLandingOrder(
          marketplaceLandingAnnouncementDraft.order,
        ),
        isActive: marketplaceLandingAnnouncementDraft.isActive,
        imageLocalUri:
          marketplaceLandingAnnouncementDraft.imageLocalUri || undefined,
      };
      const banner = marketplaceLandingAnnouncementDraft.id
        ? await updateKolamAnnouncementBanner(
            marketplaceLandingAnnouncementDraft.id,
            body,
          )
        : await createKolamAnnouncementBanner(body);
      setMarketplaceLandingOverview(current => ({
        ...current,
        announcementBanners: upsertMarketplaceLandingItem(
          current.announcementBanners,
          banner,
        ),
      }));
      setMarketplaceLandingAnnouncementDraft(
        createMarketplaceLandingAnnouncementDraft(banner),
      );
      setMarketplaceLandingSaveStatus('saved');
      setMarketplaceLandingMessage('Announcement disimpan.');
    } catch (error) {
      setMarketplaceLandingSaveStatus('error');
      setMarketplaceLandingMessage(
        getMarketplaceLandingSaveErrorMessage(error),
      );
    }
  };
  const saveMarketplaceLandingCta = async () => {
    setMarketplaceLandingSaveStatus('saving');
    setMarketplaceLandingMessage('');

    try {
      const ctaSection = await updateKolamCtaSection({
        title: marketplaceLandingCtaDraft.title.trim(),
        description: marketplaceLandingCtaDraft.description.trim(),
        buttonText: marketplaceLandingCtaDraft.buttonText.trim(),
        buttonLink: marketplaceLandingCtaDraft.buttonLink.trim(),
        isActive: marketplaceLandingCtaDraft.isActive,
      });
      setMarketplaceLandingCtaDraft(
        createMarketplaceLandingCtaDraft(ctaSection),
      );
      setMarketplaceLandingOverview(current => ({ ...current, ctaSection }));
      setMarketplaceLandingSaveStatus('saved');
      setMarketplaceLandingMessage('CTA section berhasil disimpan.');
    } catch (error) {
      setMarketplaceLandingSaveStatus('error');
      setMarketplaceLandingMessage(
        getMarketplaceLandingSaveErrorMessage(error),
      );
    }
  };
  const saveMarketplaceLandingYoutube = async () => {
    setMarketplaceLandingSaveStatus('saving');
    setMarketplaceLandingMessage('');

    try {
      const youtubeSection = await updateKolamYoutubeSection({
        link: marketplaceLandingYoutubeDraft.link.trim(),
        title: marketplaceLandingYoutubeDraft.title.trim(),
        subtitle: marketplaceLandingYoutubeDraft.subtitle.trim(),
        isActive: marketplaceLandingYoutubeDraft.isActive,
      });
      setMarketplaceLandingYoutubeDraft(
        createMarketplaceLandingYoutubeDraft(youtubeSection),
      );
      setMarketplaceLandingOverview(current => ({
        ...current,
        youtubeSection,
      }));
      setMarketplaceLandingSaveStatus('saved');
      setMarketplaceLandingMessage('YouTube section berhasil disimpan.');
    } catch (error) {
      setMarketplaceLandingSaveStatus('error');
      setMarketplaceLandingMessage(
        getMarketplaceLandingSaveErrorMessage(error),
      );
    }
  };
  const saveMarketplaceLandingNotice = async () => {
    setMarketplaceLandingSaveStatus('saving');
    setMarketplaceLandingMessage('');

    try {
      const notice = await upsertKolamCustomerNotice({
        key: marketplaceLandingNoticeDraft.key.trim(),
        title: marketplaceLandingNoticeDraft.title.trim(),
        message: marketplaceLandingNoticeDraft.message.trim(),
        ctaUrl: marketplaceLandingNoticeDraft.ctaUrl.trim(),
        ctaLabel: marketplaceLandingNoticeDraft.ctaLabel.trim(),
        showOnHome: marketplaceLandingNoticeDraft.showOnHome,
        showOnDashboard: marketplaceLandingNoticeDraft.showOnDashboard,
        isActive: marketplaceLandingNoticeDraft.isActive,
      });
      setMarketplaceLandingOverview(current => ({
        ...current,
        customerNotices: upsertMarketplaceNotice(
          current.customerNotices,
          notice,
        ),
      }));
      setMarketplaceLandingNoticeDraft(
        createMarketplaceLandingNoticeDraft(notice),
      );
      setMarketplaceLandingSaveStatus('saved');
      setMarketplaceLandingMessage('Customer notice berhasil disimpan.');
    } catch (error) {
      setMarketplaceLandingSaveStatus('error');
      setMarketplaceLandingMessage(
        getMarketplaceLandingSaveErrorMessage(error),
      );
    }
  };
  const deleteMarketplaceLandingNotice = async (key: string) => {
    setMarketplaceLandingSaveStatus('saving');
    setMarketplaceLandingMessage('');

    try {
      await deleteKolamCustomerNotice(key);
      setMarketplaceLandingOverview(current => ({
        ...current,
        customerNotices: current.customerNotices.filter(
          notice => notice.key !== key,
        ),
      }));
      setMarketplaceLandingNoticeDraft(current =>
        current.key === key ? emptyMarketplaceLandingNoticeDraft : current,
      );
      setMarketplaceLandingSaveStatus('saved');
      setMarketplaceLandingMessage('Customer notice berhasil dihapus.');
    } catch (error) {
      setMarketplaceLandingSaveStatus('error');
      setMarketplaceLandingMessage(
        getMarketplaceLandingSaveErrorMessage(error),
      );
    }
  };
  const runMarketplaceLandingAssetAction = async (
    key: string,
    status: MarketplaceLandingAssetStatus,
    action: () => Promise<void>,
  ) => {
    setMarketplaceLandingMessage('');
    setMarketplaceLandingAssetStatus(current => ({
      ...current,
      [key]: status,
    }));
    setMarketplaceLandingSaveStatus('saving');

    try {
      await action();
      setMarketplaceLandingSaveStatus('saved');
    } catch (error) {
      setMarketplaceLandingSaveStatus('error');
      setMarketplaceLandingMessage(
        getMarketplaceLandingSaveErrorMessage(error),
      );
    } finally {
      setMarketplaceLandingAssetStatus(current => ({
        ...current,
        [key]: 'idle',
      }));
    }
  };
  const deleteMarketplaceHeroSlide = (slide: KolamHeroSlide) =>
    runMarketplaceLandingAssetAction(
      `hero:${slide._id}`,
      'deleting',
      async () => {
        await deleteKolamHeroSlide(slide._id);
        setMarketplaceLandingOverview(current => ({
          ...current,
          heroSlides: current.heroSlides.filter(item => item._id !== slide._id),
        }));
        setMarketplaceLandingMessage('Hero slide berhasil dihapus.');
      },
    );
  const moveMarketplaceHeroSlide = (
    slide: KolamHeroSlide,
    direction: -1 | 1,
  ) => {
    const nextRows = moveOrderedItemById(
      marketplaceLandingOverview.heroSlides,
      slide._id,
      direction,
    );
    if (!nextRows) {
      return Promise.resolve();
    }

    return runMarketplaceLandingAssetAction(
      `hero:${slide._id}`,
      'reordering',
      async () => {
        const heroSlides = await reorderKolamHeroSlides(
          nextRows.map(item => item._id),
        );
        setMarketplaceLandingOverview(current => ({ ...current, heroSlides }));
        setMarketplaceLandingMessage('Urutan hero slide berhasil diperbarui.');
      },
    );
  };
  const deleteMarketplaceCategoryBanner = (banner: KolamCategoryBanner) =>
    runMarketplaceLandingAssetAction(
      `category:${banner._id}`,
      'deleting',
      async () => {
        await deleteKolamCategoryBanner(banner._id);
        setMarketplaceLandingOverview(current => ({
          ...current,
          categoryBanners: current.categoryBanners.filter(
            item => item._id !== banner._id,
          ),
        }));
        setMarketplaceLandingMessage('Category banner berhasil dihapus.');
      },
    );
  const moveMarketplaceCategoryBanner = (
    banner: KolamCategoryBanner,
    direction: -1 | 1,
  ) => {
    const nextRows = moveOrderedItemById(
      marketplaceLandingOverview.categoryBanners,
      banner._id,
      direction,
    );
    if (!nextRows) {
      return Promise.resolve();
    }

    return runMarketplaceLandingAssetAction(
      `category:${banner._id}`,
      'reordering',
      async () => {
        const categoryBanners = await reorderKolamCategoryBanners(
          nextRows.map(item => item._id),
        );
        setMarketplaceLandingOverview(current => ({
          ...current,
          categoryBanners,
        }));
        setMarketplaceLandingMessage(
          'Urutan category banner berhasil diperbarui.',
        );
      },
    );
  };
  const deleteMarketplaceAnnouncementBanner = (
    banner: KolamAnnouncementBanner,
  ) =>
    runMarketplaceLandingAssetAction(
      `announcement:${banner._id}`,
      'deleting',
      async () => {
        await deleteKolamAnnouncementBanner(banner._id);
        setMarketplaceLandingOverview(current => ({
          ...current,
          announcementBanners: current.announcementBanners.filter(
            item => item._id !== banner._id,
          ),
        }));
        setMarketplaceLandingMessage('Announcement banner berhasil dihapus.');
      },
    );
  const moveMarketplaceAnnouncementBanner = (
    banner: KolamAnnouncementBanner,
    direction: -1 | 1,
  ) => {
    const nextRows = moveOrderedItemById(
      marketplaceLandingOverview.announcementBanners,
      banner._id,
      direction,
    );
    if (!nextRows) {
      return Promise.resolve();
    }

    return runMarketplaceLandingAssetAction(
      `announcement:${banner._id}`,
      'reordering',
      async () => {
        const announcementBanners = await reorderKolamAnnouncementBanners(
          nextRows.map(item => item._id),
        );
        setMarketplaceLandingOverview(current => ({
          ...current,
          announcementBanners,
        }));
        setMarketplaceLandingMessage(
          'Urutan announcement banner berhasil diperbarui.',
        );
      },
    );
  };
  const deleteMarketplaceFeaturedCollection = (index: number) => {
    const nextRows = removeOrderedItemAt(
      marketplaceLandingOverview.marketplaceContent.featuredCollections ?? [],
      index,
    );
    if (!nextRows) {
      return Promise.resolve();
    }

    return runMarketplaceLandingAssetAction(
      `featured:${index}`,
      'deleting',
      async () => {
        const marketplaceContent = await updateKolamFeaturedCollections(
          nextRows,
        );
        setMarketplaceLandingOverview(current => ({
          ...current,
          marketplaceContent,
        }));
        setMarketplaceLandingMessage('Featured collection berhasil dihapus.');
      },
    );
  };
  const moveMarketplaceFeaturedCollection = (
    index: number,
    direction: -1 | 1,
  ) => {
    const nextRows = moveOrderedItemAt(
      marketplaceLandingOverview.marketplaceContent.featuredCollections ?? [],
      index,
      direction,
    );
    if (!nextRows) {
      return Promise.resolve();
    }

    return runMarketplaceLandingAssetAction(
      `featured:${index}`,
      'reordering',
      async () => {
        const marketplaceContent = await updateKolamFeaturedCollections(
          nextRows,
        );
        setMarketplaceLandingOverview(current => ({
          ...current,
          marketplaceContent,
        }));
        setMarketplaceLandingMessage(
          'Urutan featured collection berhasil diperbarui.',
        );
      },
    );
  };
  const deleteMarketplaceBioactiveStep = (index: number) => {
    const steps = removeOrderedItemAt(
      marketplaceLandingOverview.marketplaceContent.bioactiveEcosystem?.steps ??
        [],
      index,
    );
    if (!steps) {
      return Promise.resolve();
    }

    return runMarketplaceLandingAssetAction(
      `bioactive:${index}`,
      'deleting',
      async () => {
        const marketplaceContent = await updateKolamBioactiveEcosystem({
          steps,
        });
        setMarketplaceLandingOverview(current => ({
          ...current,
          marketplaceContent,
        }));
        setMarketplaceLandingMessage(
          'Bioactive ecosystem step berhasil dihapus.',
        );
      },
    );
  };
  const moveMarketplaceBioactiveStep = (index: number, direction: -1 | 1) => {
    const steps = moveOrderedItemAt(
      marketplaceLandingOverview.marketplaceContent.bioactiveEcosystem?.steps ??
        [],
      index,
      direction,
    );
    if (!steps) {
      return Promise.resolve();
    }

    return runMarketplaceLandingAssetAction(
      `bioactive:${index}`,
      'reordering',
      async () => {
        const marketplaceContent = await updateKolamBioactiveEcosystem({
          steps,
        });
        setMarketplaceLandingOverview(current => ({
          ...current,
          marketplaceContent,
        }));
        setMarketplaceLandingMessage(
          'Urutan bioactive ecosystem berhasil diperbarui.',
        );
      },
    );
  };
  const uploadMarketplaceHeroImage = (slide: KolamHeroSlide) =>
    uploadMarketplaceAsset(`hero:${slide._id}`, async localUri => {
      const updated = await updateKolamHeroSlide(slide._id, {
        eyebrow: slide.eyebrow ?? '',
        title: slide.title,
        subtitle: slide.subtitle,
        description: slide.description,
        link: slide.link,
        linkText: slide.linkText,
        secondaryLink: slide.secondaryLink,
        secondaryLinkText: slide.secondaryLinkText,
        order: slide.order,
        isActive: slide.isActive,
        imageLocalUri: localUri,
      });
      setMarketplaceLandingOverview(current => ({
        ...current,
        heroSlides: replaceById(current.heroSlides, updated),
      }));
      setMarketplaceLandingMessage('Hero slide image berhasil diupload.');
    });
  const uploadMarketplaceCategoryBannerImage = (banner: KolamCategoryBanner) =>
    uploadMarketplaceAsset(`category:${banner._id}`, async localUri => {
      const updated = await updateKolamCategoryBanner(banner._id, {
        categorySlug: banner.categorySlug,
        order: banner.order,
        isActive: banner.isActive,
        imageLocalUri: localUri,
      });
      setMarketplaceLandingOverview(current => ({
        ...current,
        categoryBanners: replaceById(current.categoryBanners, updated),
      }));
      setMarketplaceLandingMessage('Category banner image berhasil diupload.');
    });
  const uploadMarketplaceAnnouncementImage = (
    banner: KolamAnnouncementBanner,
  ) =>
    uploadMarketplaceAsset(`announcement:${banner._id}`, async localUri => {
      const updated = await updateKolamAnnouncementBanner(banner._id, {
        link: banner.link,
        order: banner.order,
        isActive: banner.isActive,
        imageLocalUri: localUri,
      });
      setMarketplaceLandingOverview(current => ({
        ...current,
        announcementBanners: replaceById(current.announcementBanners, updated),
      }));
      setMarketplaceLandingMessage(
        'Announcement banner image berhasil diupload.',
      );
    });
  const uploadMarketplaceCtaBackground = () =>
    uploadMarketplaceAsset('cta-background', async localUri => {
      const ctaSection = await updateKolamCtaSection({
        title: marketplaceLandingCtaDraft.title.trim(),
        description: marketplaceLandingCtaDraft.description.trim(),
        buttonText: marketplaceLandingCtaDraft.buttonText.trim(),
        buttonLink: marketplaceLandingCtaDraft.buttonLink.trim(),
        isActive: marketplaceLandingCtaDraft.isActive,
        backgroundImageLocalUri: localUri,
      });
      setMarketplaceLandingCtaDraft(
        createMarketplaceLandingCtaDraft(ctaSection),
      );
      setMarketplaceLandingOverview(current => ({ ...current, ctaSection }));
      setMarketplaceLandingMessage('CTA background berhasil diupload.');
    });
  const uploadMarketplaceYoutubeBackground = () =>
    uploadMarketplaceAsset('youtube-background', async localUri => {
      const youtubeSection = await updateKolamYoutubeSection({
        link: marketplaceLandingYoutubeDraft.link.trim(),
        title: marketplaceLandingYoutubeDraft.title.trim(),
        subtitle: marketplaceLandingYoutubeDraft.subtitle.trim(),
        isActive: marketplaceLandingYoutubeDraft.isActive,
        backgroundImageLocalUri: localUri,
      });
      setMarketplaceLandingYoutubeDraft(
        createMarketplaceLandingYoutubeDraft(youtubeSection),
      );
      setMarketplaceLandingOverview(current => ({
        ...current,
        youtubeSection,
      }));
      setMarketplaceLandingMessage('YouTube background berhasil diupload.');
    });
  const uploadMarketplaceFeaturedCollectionImage = (index: number) =>
    uploadMarketplaceAsset(`featured:${index}`, async localUri => {
      const image = await uploadKolamMarketplaceContentImage(
        'featured-collections',
        localUri,
      );
      const currentRows =
        marketplaceLandingOverview.marketplaceContent.featuredCollections ?? [];
      const nextRows = currentRows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, image } : row,
      );
      const marketplaceContent = await updateKolamFeaturedCollections(nextRows);
      setMarketplaceLandingOverview(current => ({
        ...current,
        marketplaceContent,
      }));
      setMarketplaceLandingMessage(
        'Featured collection image berhasil diupload.',
      );
    });
  const uploadMarketplaceBioactiveStepImage = (index: number) =>
    uploadMarketplaceAsset(`bioactive:${index}`, async localUri => {
      const image = await uploadKolamMarketplaceContentImage(
        'bioactive-ecosystem',
        localUri,
      );
      const currentSteps =
        marketplaceLandingOverview.marketplaceContent.bioactiveEcosystem
          ?.steps ?? [];
      const steps = currentSteps.map((step, stepIndex) =>
        stepIndex === index ? { ...step, image } : step,
      );
      const marketplaceContent = await updateKolamBioactiveEcosystem({ steps });
      setMarketplaceLandingOverview(current => ({
        ...current,
        marketplaceContent,
      }));
      setMarketplaceLandingMessage(
        'Bioactive ecosystem image berhasil diupload.',
      );
    });
  const uploadMarketplaceLogo = () =>
    uploadMarketplaceAsset('websetting-logo', async localUri => {
      const setting = await uploadKolamWebSettingLogo(localUri);
      setWebSetting(setting);
      setMarketplaceLandingMessage('Websetting logo berhasil diupload.');
    });
  const uploadMarketplaceDaraAvatar = () =>
    uploadMarketplaceAsset('dara-avatar', async localUri => {
      const response = await uploadKolamDaraAvatar(localUri);
      if (response.daraAvatarUrl) {
        setWebSetting(current =>
          current
            ? ({
                ...current,
                daraAvatarUrl: response.daraAvatarUrl,
              } as KolamWebSetting)
            : current,
        );
      }
      setMarketplaceLandingMessage('DARA avatar berhasil diupload.');
      setWebSettingMessage('Avatar DARA berhasil diupload.');
    });
  const uploadMarketplaceAsset = async (
    key: string,
    upload: (localUri: string) => Promise<void>,
  ) => {
    setMarketplaceLandingMessage('');

    try {
      const picked = await pickNativeImageFile();
      if (picked.cancelled) {
        return;
      }

      const localUri = picked.uri || picked.path || '';
      if (!localUri) {
        setMarketplaceLandingMessage('File image tidak valid.');
        return;
      }

      if (!isAllowedMarketplaceImageFile(localUri, picked.extension)) {
        setMarketplaceLandingMessage(
          'Asset image hanya menerima JPG, PNG, WEBP, GIF, SVG, HEIC, atau HEIF.',
        );
        return;
      }

      setMarketplaceLandingAssetStatus(current => ({
        ...current,
        [key]: 'uploading',
      }));
      setMarketplaceLandingSaveStatus('saving');
      await upload(localUri);
      setMarketplaceLandingSaveStatus('saved');
    } catch (error) {
      setMarketplaceLandingSaveStatus('error');
      setMarketplaceLandingMessage(
        getMarketplaceLandingSaveErrorMessage(error),
      );
    } finally {
      setMarketplaceLandingAssetStatus(current => ({
        ...current,
        [key]: 'idle',
      }));
    }
  };
  const uploadDaraWorkerPhoto = async () => {
    setWebSettingMessage('');

    try {
      const picked = await pickNativeImageFile();
      if (picked.cancelled) {
        return;
      }

      const localUri = picked.uri || picked.path || '';
      if (!localUri) {
        setWebSettingMessage('File image tidak valid.');
        return;
      }

      if (!isAllowedMarketplaceImageFile(localUri, picked.extension)) {
        setWebSettingMessage(
          'Foto hanya menerima JPG, PNG, WEBP, GIF, SVG, HEIC, atau HEIF.',
        );
        return;
      }

      setWebSettingSaveStatus('saving');
      const response = await uploadKolamKatakTerbangWorkerPhoto(localUri);
      if (response.katakTerbangWorkerPhotoUrl) {
        setWebSetting(current =>
          current
            ? ({
                ...current,
                katakTerbangWorkerPhotoUrl: response.katakTerbangWorkerPhotoUrl,
              } as KolamWebSetting)
            : current,
        );
      }
      setWebSettingSaveStatus('saved');
      setWebSettingMessage('Foto Katak Terbang berhasil diupload.');
    } catch (error) {
      setWebSettingSaveStatus('error');
      setWebSettingMessage(getWebSettingSaveErrorMessage(error));
    }
  };
  const saveDaraKnowledge = async () => {
    const title = daraKnowledgeDraft.title.trim();
    const contentMarkdown = daraKnowledgeDraft.body.trim();

    if (!title || !contentMarkdown) {
      setDaraKnowledgeSaveStatus('error');
      setDaraKnowledgeMessage('Judul dan isi SOP wajib diisi.');
      return;
    }

    setDaraKnowledgeSaveStatus('saving');
    setDaraKnowledgeMessage('');

    try {
      await createKolamDaraKnowledge({
        title,
        category: daraKnowledgeDraft.category,
        contentMarkdown,
      });
      setDaraKnowledgeDraft(emptyDaraKnowledgeDraft);
      setDaraKnowledgeSaveStatus('saved');
      setDaraKnowledgeMessage('SOP berhasil disimpan ke knowledge DARA.');
    } catch (error) {
      setDaraKnowledgeSaveStatus('error');
      setDaraKnowledgeMessage(getWebSettingSaveErrorMessage(error));
    }
  };
  const uploadNotificationSound = async (type: KolamNotificationSoundType) => {
    setWebSettingMessage('');

    try {
      const picked = await pickNativeAudioFile();
      if (picked.cancelled) {
        return;
      }

      const localUri = picked.uri || picked.path || '';
      if (!localUri) {
        setWebSettingMessage('File audio tidak valid.');
        return;
      }

      if (!isAllowedNotificationSoundFile(localUri, picked.extension)) {
        setWebSettingMessage('Notification sound hanya menerima MP3 atau WAV.');
        return;
      }

      if (!isAllowedNotificationSoundSize(picked)) {
        setWebSettingMessage('Notification sound maksimal 5 MB.');
        return;
      }

      setNotificationSoundStatus(current => ({
        ...current,
        [type]: 'uploading',
      }));
      const response = await uploadKolamNotificationSound(type, localUri);
      const field = notificationSoundDraftFieldByType[type];
      const nextPath = getNotificationSoundPathFromResponse(response, field);

      setWebSettingDraft(current => ({ ...current, [field]: nextPath }));
      setWebSetting(current =>
        current
          ? ({ ...current, [field]: nextPath } as KolamWebSetting)
          : current,
      );
      setWebSettingMessage('Notification sound berhasil diupload.');
    } catch (error) {
      setWebSettingMessage(getNotificationSoundErrorMessage(error));
    } finally {
      setNotificationSoundStatus(current => ({ ...current, [type]: 'idle' }));
    }
  };
  const deleteNotificationSound = async (type: KolamNotificationSoundType) => {
    setWebSettingMessage('');
    setNotificationSoundStatus(current => ({ ...current, [type]: 'deleting' }));

    try {
      await deleteKolamNotificationSound(type);
      const field = notificationSoundDraftFieldByType[type];

      setWebSettingDraft(current => ({ ...current, [field]: '' }));
      setWebSetting(current =>
        current ? ({ ...current, [field]: '' } as KolamWebSetting) : current,
      );
      setWebSettingMessage('Notification sound berhasil direset.');
    } catch (error) {
      setWebSettingMessage(getNotificationSoundErrorMessage(error));
    } finally {
      setNotificationSoundStatus(current => ({ ...current, [type]: 'idle' }));
    }
  };
  const saveWebSetting = async () => {
    setWebSettingSaveStatus('saving');
    setWebSettingMessage('');

    try {
      if (activeSettingsTabId === 'sitemap') {
        const nextSitemap = createSitemapConfigUpdateBody(
          sitemapDraft,
          sitemapCustomUrlsText,
          sitemapExcludedSlugsText,
        );
        const updatedSitemap = await updateKolamSitemapConfig(nextSitemap);
        const normalized = normalizeSitemapConfig(updatedSitemap);

        setSitemapDraft(normalized);
        setSitemapCustomUrlsText(formatSitemapCustomUrlsText(normalized));
        setSitemapExcludedSlugsText(formatSitemapExcludedSlugsText(normalized));
        setWebSetting(current =>
          current ? { ...current, sitemapConfig: normalized } : current,
        );
        setWebSettingSaveStatus('saved');
        setWebSettingMessage('Sitemap berhasil disimpan.');
        return;
      }

      const updated = await updateKolamWebSetting({
        companyName: cleanOptionalString(webSettingDraft.companyName),
        companyTagline: cleanOptionalString(webSettingDraft.companyTagline),
        address: cleanOptionalString(webSettingDraft.address),
        phone: cleanOptionalString(webSettingDraft.phone),
        email: cleanOptionalString(webSettingDraft.email),
        socialMedia: {
          facebook: cleanOptionalString(webSettingDraft.facebook),
          instagram: cleanOptionalString(webSettingDraft.instagram),
          twitter: cleanOptionalString(webSettingDraft.twitter),
          youtube: cleanOptionalString(webSettingDraft.youtube),
          tiktok: cleanOptionalString(webSettingDraft.tiktok),
        },
        maintenanceMode: {
          pos: webSettingDraft.maintenancePos,
          marketplace: webSettingDraft.maintenanceMarketplace,
        },
        livechatOnline: webSettingDraft.livechatOnline,
        webstoreGoogleAuthEnabled: webSettingDraft.webstoreGoogleAuthEnabled,
        googleOAuthClientId: webSettingDraft.googleOAuthClientId.trim(),
        poWorkflow: createPoWorkflowUpdateBody(webSettingDraft),
        ...(createSecretUpdateField(
          'biteshipApiKey',
          webSettingDraft.biteshipApiKey,
        ) as Pick<KolamWebSetting, 'biteshipApiKey'>),
        ...(createSecretUpdateField(
          'googleMapsBrowserApiKey',
          webSettingDraft.googleMapsBrowserApiKey,
        ) as Pick<KolamWebSetting, 'googleMapsBrowserApiKey'>),
        originAddress: {
          addressLine1: webSettingDraft.originAddressLine1.trim(),
          city: webSettingDraft.originCity.trim(),
          province: webSettingDraft.originProvince.trim(),
          postalCode: webSettingDraft.originPostalCode.trim(),
          latitude: parseOptionalNumber(webSettingDraft.originLatitude),
          longitude: parseOptionalNumber(webSettingDraft.originLongitude),
        },
        storeOperatingHours:
          createStoreOperatingHoursUpdateBody(webSettingDraft),
        staffDesktopOnly: {
          enabled: webSettingDraft.staffDesktopOnlyEnabled,
          redirectUrl: STAFF_DESKTOP_REDIRECT_URL,
        },
        kolamMacAccess: {
          enabled: webSettingDraft.kolamMacAccessEnabled,
          allowWebBrowser: webSettingDraft.kolamMacAccessAllowWebBrowser,
          bypassSuperAdmin: webSettingDraft.kolamMacAccessBypassSuperAdmin,
          allowedMacAddresses: parseMacAddressList(
            webSettingDraft.kolamMacAccessAllowedMacAddresses,
          ),
        },
        staffOtpLogin: {
          enabled: webSettingDraft.staffOtpLoginEnabled,
          otpExpireMinutes: parseIntegerOrFallback(
            webSettingDraft.staffOtpExpireMinutes,
            10,
          ),
          resendCooldownSeconds: parseIntegerOrFallback(
            webSettingDraft.staffOtpResendCooldownSeconds,
            60,
          ),
          maxAttempts: parseIntegerOrFallback(
            webSettingDraft.staffOtpMaxAttempts,
            5,
          ),
          lockMinutes: parseIntegerOrFallback(
            webSettingDraft.staffOtpLockMinutes,
            15,
          ),
        },
        smtp: createSmtpUpdateBody(webSettingDraft),
        firebase: createFirebaseUpdateBody(webSettingDraft),
        teamChatDaraReplyEnabled: webSettingDraft.teamChatDaraReplyEnabled,
        teamChatGroupCallEnabled: webSettingDraft.teamChatGroupCallEnabled,
        inboxAiReplyPlatforms: {
          store: webSettingDraft.inboxAiReplyStore,
          whatsapp: webSettingDraft.inboxAiReplyWhatsapp,
          tiktok: webSettingDraft.inboxAiReplyTiktok,
          instagram: webSettingDraft.inboxAiReplyInstagram,
          tokopedia: webSettingDraft.inboxAiReplyTokopedia,
          shopee: webSettingDraft.inboxAiReplyShopee,
        },
        daraFulfillmentTeamRoomId:
          webSettingDraft.daraFulfillmentTeamRoomId.trim(),
        daraBusinessEnabled: webSettingDraft.daraBusinessEnabled,
        daraToolsEnabled: webSettingDraft.daraToolsEnabled,
        daraKnowledgeEnabled: webSettingDraft.daraKnowledgeEnabled,
        daraHandoffNotifyEnabled: webSettingDraft.daraHandoffNotifyEnabled,
        daraInsightsEnabled: webSettingDraft.daraInsightsEnabled,
        daraInsightsCronSchedule:
          webSettingDraft.daraInsightsCronSchedule.trim(),
        daraAutoReportEnabled: webSettingDraft.daraAutoReportEnabled,
        daraImageAnalysisEnabled: webSettingDraft.daraImageAnalysisEnabled,
        daraTaxEnabled: webSettingDraft.daraTaxEnabled,
        daraSeoEnabled: webSettingDraft.daraSeoEnabled,
        daraSeoMonitorEnabled: webSettingDraft.daraSeoMonitorEnabled,
        daraSeoSentimentLlmEnabled: webSettingDraft.daraSeoSentimentLlmEnabled,
        daraMarketScanCronEnabled: webSettingDraft.daraMarketScanCronEnabled,
        daraTaxRegulationWatcherEnabled:
          webSettingDraft.daraTaxRegulationWatcherEnabled,
        daraTaxComplianceJobEnabled:
          webSettingDraft.daraTaxComplianceJobEnabled,
        daraTaxLlmNarrativeEnabled: webSettingDraft.daraTaxLlmNarrativeEnabled,
        autoOlshopFulfillmentEnabled:
          webSettingDraft.autoOlshopFulfillmentEnabled,
        autoOlshopShopeeEnabled: webSettingDraft.autoOlshopShopeeEnabled,
        autoOlshopTokopediaEnabled: webSettingDraft.autoOlshopTokopediaEnabled,
        daraWebstoreFulfillmentEnabled:
          webSettingDraft.daraWebstoreFulfillmentEnabled,
        daraFulfillmentPackingMinutes: clampNumber(
          parseIntegerOrFallback(
            webSettingDraft.daraFulfillmentPackingMinutes,
            30,
          ),
          5,
          240,
        ),
        daraFulfillmentPackingMaxExtensions: clampNumber(
          parseIntegerOrFallback(
            webSettingDraft.daraFulfillmentPackingMaxExtensions,
            1,
          ),
          0,
          5,
        ),
        katakTerbangWorkerName: webSettingDraft.katakTerbangWorkerName
          .trim()
          .slice(0, 80),
        daraStaffOpsNotifyEnabled: webSettingDraft.daraStaffOpsNotifyEnabled,
        daraStaffWaNotifyEnabled: webSettingDraft.daraStaffWaNotifyEnabled,
        daraPenjualanTeamRoomId: webSettingDraft.daraPenjualanTeamRoomId.trim(),
        daraOlshopCustomerNotifyEnabled:
          webSettingDraft.daraOlshopCustomerNotifyEnabled,
        daraOlshopDeferredCron: webSettingDraft.daraOlshopDeferredCron.trim(),
        daraOlshopDeferredBatch: clampNumber(
          parseIntegerOrFallback(webSettingDraft.daraOlshopDeferredBatch, 20),
          1,
          200,
        ),
        daraOlshopStockGateEnabled: webSettingDraft.daraOlshopStockGateEnabled,
        daraOlshopStockSyncMaxAgeMs: Math.max(
          60000,
          parseIntegerOrFallback(
            webSettingDraft.daraOlshopStockSyncMaxAgeMs,
            21600000,
          ),
        ),
        daraOlshopStockGateCron: webSettingDraft.daraOlshopStockGateCron.trim(),
        daraOlshopStockGateBatch: clampNumber(
          parseIntegerOrFallback(webSettingDraft.daraOlshopStockGateBatch, 20),
          1,
          200,
        ),
        daraOpsAuditEnabled: webSettingDraft.daraOpsAuditEnabled,
        daraOwnerDigestEnabled: webSettingDraft.daraOwnerDigestEnabled,
        daraOwnerDigestCron: webSettingDraft.daraOwnerDigestCron.trim(),
        daraOwnerDigestWaEnabled: webSettingDraft.daraOwnerDigestWaEnabled,
        daraOwnerDigestFcmEnabled: webSettingDraft.daraOwnerDigestFcmEnabled,
        daraOwnerFcmUrgentEnabled: webSettingDraft.daraOwnerFcmUrgentEnabled,
        daraOpsDigestLookbackHours: clampNumber(
          parseIntegerOrFallback(
            webSettingDraft.daraOpsDigestLookbackHours,
            12,
          ),
          1,
          72,
        ),
        kolamPlugins: createKolamPluginsUpdateBody(
          webSettingDraft.pluginControls,
          webSetting?.kolamPlugins,
          webSettingDraft.chatStoreEnabled,
        ),
      });

      await Promise.all(
        [
          ['kolam', webSettingDraft.versionKolam],
          ['enclonura', webSettingDraft.versionEnclonura],
          ['pos', webSettingDraft.versionPos],
          ['marketplace', webSettingDraft.versionMarketplace],
        ].map(([app, version]) =>
          updateKolamWebSettingVersion({
            app: app as 'kolam' | 'enclonura' | 'pos' | 'marketplace',
            version: version.trim(),
          }),
        ),
      );

      const nextVersions = {
        versions: {
          ...(webSettingVersions?.versions ?? {}),
          kolam: webSettingDraft.versionKolam.trim(),
          enclonura: webSettingDraft.versionEnclonura.trim(),
          pos: webSettingDraft.versionPos.trim(),
          marketplace: webSettingDraft.versionMarketplace.trim(),
        },
        updatedAt: updated.updatedAt,
      };

      setWebSetting({
        ...updated,
        versions: nextVersions.versions,
        maintenance: {
          ...(updated.maintenance ?? {}),
          pos: webSettingDraft.maintenancePos,
          marketplace: webSettingDraft.maintenanceMarketplace,
        },
        livechatOnline: webSettingDraft.livechatOnline,
        webstoreGoogleAuthEnabled: webSettingDraft.webstoreGoogleAuthEnabled,
        googleOAuthClientId: webSettingDraft.googleOAuthClientId.trim(),
        poWorkflow: createPoWorkflowUpdateBody(webSettingDraft),
        originAddress: {
          ...(updated.originAddress ?? {}),
          addressLine1: webSettingDraft.originAddressLine1.trim(),
          city: webSettingDraft.originCity.trim(),
          province: webSettingDraft.originProvince.trim(),
          postalCode: webSettingDraft.originPostalCode.trim(),
          latitude: parseOptionalNumber(webSettingDraft.originLatitude),
          longitude: parseOptionalNumber(webSettingDraft.originLongitude),
        },
        biteshipApiKeyConfigured:
          updated.biteshipApiKeyConfigured ??
          webSetting?.biteshipApiKeyConfigured ??
          isConfiguredSecretDraft(webSettingDraft.biteshipApiKey),
        googleMapsBrowserApiKeyConfigured:
          updated.googleMapsBrowserApiKeyConfigured ??
          webSetting?.googleMapsBrowserApiKeyConfigured ??
          isConfiguredSecretDraft(webSettingDraft.googleMapsBrowserApiKey),
        storeOperatingHours:
          createStoreOperatingHoursUpdateBody(webSettingDraft),
        staffDesktopOnly: {
          ...(updated.staffDesktopOnly ?? {}),
          enabled: webSettingDraft.staffDesktopOnlyEnabled,
          redirectUrl: STAFF_DESKTOP_REDIRECT_URL,
        },
        kolamMacAccess: {
          ...(updated.kolamMacAccess ?? {}),
          enabled: webSettingDraft.kolamMacAccessEnabled,
          allowWebBrowser: webSettingDraft.kolamMacAccessAllowWebBrowser,
          bypassSuperAdmin: webSettingDraft.kolamMacAccessBypassSuperAdmin,
          allowedMacAddresses: parseMacAddressList(
            webSettingDraft.kolamMacAccessAllowedMacAddresses,
          ),
        },
        staffOtpLogin: {
          ...(updated.staffOtpLogin ?? {}),
          enabled: webSettingDraft.staffOtpLoginEnabled,
          otpExpireMinutes: parseIntegerOrFallback(
            webSettingDraft.staffOtpExpireMinutes,
            10,
          ),
          resendCooldownSeconds: parseIntegerOrFallback(
            webSettingDraft.staffOtpResendCooldownSeconds,
            60,
          ),
          maxAttempts: parseIntegerOrFallback(
            webSettingDraft.staffOtpMaxAttempts,
            5,
          ),
          lockMinutes: parseIntegerOrFallback(
            webSettingDraft.staffOtpLockMinutes,
            15,
          ),
        },
        smtp: {
          ...(updated.smtp ?? {}),
          ...createSmtpUpdateBody(webSettingDraft),
          passConfigured:
            updated.smtp?.passConfigured ??
            webSetting?.smtp?.passConfigured ??
            webSettingDraft.smtpPass === maskedSecretPlaceholder,
        },
        firebase: {
          ...(updated.firebase ?? {}),
          ...createFirebaseUpdateBody(webSettingDraft),
          privateKeyConfigured:
            updated.firebase?.privateKeyConfigured ??
            webSetting?.firebase?.privateKeyConfigured ??
            webSettingDraft.firebasePrivateKey === maskedSecretPlaceholder,
        },
        teamChatDaraReplyEnabled: webSettingDraft.teamChatDaraReplyEnabled,
        teamChatGroupCallEnabled: webSettingDraft.teamChatGroupCallEnabled,
        inboxAiReplyPlatforms: {
          store: webSettingDraft.inboxAiReplyStore,
          whatsapp: webSettingDraft.inboxAiReplyWhatsapp,
          tiktok: webSettingDraft.inboxAiReplyTiktok,
          instagram: webSettingDraft.inboxAiReplyInstagram,
          tokopedia: webSettingDraft.inboxAiReplyTokopedia,
          shopee: webSettingDraft.inboxAiReplyShopee,
        },
        daraFulfillmentTeamRoomId:
          webSettingDraft.daraFulfillmentTeamRoomId.trim(),
        daraBusinessEnabled: webSettingDraft.daraBusinessEnabled,
        daraToolsEnabled: webSettingDraft.daraToolsEnabled,
        daraKnowledgeEnabled: webSettingDraft.daraKnowledgeEnabled,
        daraHandoffNotifyEnabled: webSettingDraft.daraHandoffNotifyEnabled,
        daraInsightsEnabled: webSettingDraft.daraInsightsEnabled,
        daraInsightsCronSchedule:
          webSettingDraft.daraInsightsCronSchedule.trim(),
        daraAutoReportEnabled: webSettingDraft.daraAutoReportEnabled,
        daraImageAnalysisEnabled: webSettingDraft.daraImageAnalysisEnabled,
        daraTaxEnabled: webSettingDraft.daraTaxEnabled,
        daraSeoEnabled: webSettingDraft.daraSeoEnabled,
        daraSeoMonitorEnabled: webSettingDraft.daraSeoMonitorEnabled,
        daraSeoSentimentLlmEnabled: webSettingDraft.daraSeoSentimentLlmEnabled,
        daraMarketScanCronEnabled: webSettingDraft.daraMarketScanCronEnabled,
        daraTaxRegulationWatcherEnabled:
          webSettingDraft.daraTaxRegulationWatcherEnabled,
        daraTaxComplianceJobEnabled:
          webSettingDraft.daraTaxComplianceJobEnabled,
        daraTaxLlmNarrativeEnabled: webSettingDraft.daraTaxLlmNarrativeEnabled,
        autoOlshopFulfillmentEnabled:
          webSettingDraft.autoOlshopFulfillmentEnabled,
        autoOlshopShopeeEnabled: webSettingDraft.autoOlshopShopeeEnabled,
        autoOlshopTokopediaEnabled: webSettingDraft.autoOlshopTokopediaEnabled,
        daraWebstoreFulfillmentEnabled:
          webSettingDraft.daraWebstoreFulfillmentEnabled,
        daraFulfillmentPackingMinutes: clampNumber(
          parseIntegerOrFallback(
            webSettingDraft.daraFulfillmentPackingMinutes,
            30,
          ),
          5,
          240,
        ),
        daraFulfillmentPackingMaxExtensions: clampNumber(
          parseIntegerOrFallback(
            webSettingDraft.daraFulfillmentPackingMaxExtensions,
            1,
          ),
          0,
          5,
        ),
        katakTerbangWorkerName: webSettingDraft.katakTerbangWorkerName
          .trim()
          .slice(0, 80),
        daraStaffOpsNotifyEnabled: webSettingDraft.daraStaffOpsNotifyEnabled,
        daraStaffWaNotifyEnabled: webSettingDraft.daraStaffWaNotifyEnabled,
        daraPenjualanTeamRoomId: webSettingDraft.daraPenjualanTeamRoomId.trim(),
        daraOlshopCustomerNotifyEnabled:
          webSettingDraft.daraOlshopCustomerNotifyEnabled,
        daraOlshopDeferredCron: webSettingDraft.daraOlshopDeferredCron.trim(),
        daraOlshopDeferredBatch: clampNumber(
          parseIntegerOrFallback(webSettingDraft.daraOlshopDeferredBatch, 20),
          1,
          200,
        ),
        daraOlshopStockGateEnabled: webSettingDraft.daraOlshopStockGateEnabled,
        daraOlshopStockSyncMaxAgeMs: Math.max(
          60000,
          parseIntegerOrFallback(
            webSettingDraft.daraOlshopStockSyncMaxAgeMs,
            21600000,
          ),
        ),
        daraOlshopStockGateCron: webSettingDraft.daraOlshopStockGateCron.trim(),
        daraOlshopStockGateBatch: clampNumber(
          parseIntegerOrFallback(webSettingDraft.daraOlshopStockGateBatch, 20),
          1,
          200,
        ),
        daraOpsAuditEnabled: webSettingDraft.daraOpsAuditEnabled,
        daraOwnerDigestEnabled: webSettingDraft.daraOwnerDigestEnabled,
        daraOwnerDigestCron: webSettingDraft.daraOwnerDigestCron.trim(),
        daraOwnerDigestWaEnabled: webSettingDraft.daraOwnerDigestWaEnabled,
        daraOwnerDigestFcmEnabled: webSettingDraft.daraOwnerDigestFcmEnabled,
        daraOwnerFcmUrgentEnabled: webSettingDraft.daraOwnerFcmUrgentEnabled,
        daraOpsDigestLookbackHours: clampNumber(
          parseIntegerOrFallback(
            webSettingDraft.daraOpsDigestLookbackHours,
            12,
          ),
          1,
          72,
        ),
        kolamPlugins: createKolamPluginsUpdateBody(
          webSettingDraft.pluginControls,
          updated.kolamPlugins,
          webSettingDraft.chatStoreEnabled,
        ),
      });
      setWebSettingVersions(nextVersions);
      setWebSettingVersion({
        app: 'kolam',
        version: webSettingDraft.versionKolam.trim(),
        updatedAt: updated.updatedAt,
      });
      setWebTitle(webSettingDraft.companyName);
      setStorefrontEnabled(webSettingDraft.livechatOnline);
      setMaintenanceMode(webSettingDraft.maintenancePos);
      setWebSettingSaveStatus('saved');
      setWebSettingMessage('Web Settings berhasil disimpan.');
    } catch (error) {
      setWebSettingSaveStatus('error');
      setWebSettingMessage(getWebSettingSaveErrorMessage(error));
    }
  };

  const saveShippingOrigin = async () => {
    if (
      isInvalidOptionalNumber(webSettingDraft.originLatitude) ||
      isInvalidOptionalNumber(webSettingDraft.originLongitude)
    ) {
      setWebSettingSaveStatus('error');
      setWebSettingMessage('Koordinat asal pengiriman tidak valid.');
      return;
    }

    const originAddress =
      createShippingOriginAddressUpdateBody(webSettingDraft);
    const body = {
      originAddress,
      ...(createSecretUpdateField(
        'biteshipApiKey',
        webSettingDraft.biteshipApiKey,
      ) as Pick<KolamWebSetting, 'biteshipApiKey'>),
      ...(createSecretUpdateField(
        'googleMapsBrowserApiKey',
        webSettingDraft.googleMapsBrowserApiKey,
      ) as Pick<KolamWebSetting, 'googleMapsBrowserApiKey'>),
    };

    setWebSettingSaveStatus('saving');
    setWebSettingMessage('');

    try {
      const updated = await updateKolamWebSetting(body);

      setWebSetting({
        ...updated,
        originAddress: {
          ...(updated.originAddress ?? {}),
          ...originAddress,
        },
        biteshipApiKeyConfigured:
          updated.biteshipApiKeyConfigured ??
          webSetting?.biteshipApiKeyConfigured ??
          isConfiguredSecretDraft(webSettingDraft.biteshipApiKey),
        googleMapsBrowserApiKeyConfigured:
          updated.googleMapsBrowserApiKeyConfigured ??
          webSetting?.googleMapsBrowserApiKeyConfigured ??
          isConfiguredSecretDraft(webSettingDraft.googleMapsBrowserApiKey),
      });
      setWebSettingSaveStatus('saved');
      setWebSettingMessage('Asal pengiriman berhasil disimpan.');
    } catch (error) {
      setWebSettingSaveStatus('error');
      setWebSettingMessage(getWebSettingSaveErrorMessage(error));
    }
  };

  const saveStoreOperatingHours = async () => {
    const storeOperatingHours =
      createStoreOperatingHoursUpdateBody(webSettingDraft);

    setWebSettingSaveStatus('saving');
    setWebSettingMessage('');

    try {
      const updated = await updateKolamWebSetting({ storeOperatingHours });

      setWebSetting({
        ...updated,
        storeOperatingHours,
      });
      setWebSettingSaveStatus('saved');
      setWebSettingMessage('Jam operasional berhasil disimpan.');
    } catch (error) {
      setWebSettingSaveStatus('error');
      setWebSettingMessage(getWebSettingSaveErrorMessage(error));
    }
  };

  const saveOperationalMaintenance = async (
    target: 'pos' | 'marketplace',
    value: boolean,
  ) => {
    const previousDraft = {
      maintenancePos: webSettingDraft.maintenancePos,
      maintenanceMarketplace: webSettingDraft.maintenanceMarketplace,
    };
    const nextMaintenance = {
      pos: target === 'pos' ? value : webSettingDraft.maintenancePos,
      marketplace:
        target === 'marketplace'
          ? value
          : webSettingDraft.maintenanceMarketplace,
    };

    setWebSettingSaveStatus('saving');
    setWebSettingMessage('');
    setWebSettingDraftFields(
      {
        maintenancePos: nextMaintenance.pos,
        maintenanceMarketplace: nextMaintenance.marketplace,
      },
      false,
    );
    if (target === 'pos') {
      setMaintenanceMode(value);
    }

    try {
      const updated = await updateKolamWebSetting({
        maintenanceMode: nextMaintenance,
      });
      setWebSetting({
        ...updated,
        maintenance: {
          ...(updated.maintenance ?? {}),
          pos: nextMaintenance.pos,
          marketplace: nextMaintenance.marketplace,
        },
      });
      setWebSettingSaveStatus('saved');
      setWebSettingMessage(
        target === 'pos'
          ? 'Maintenance POS berhasil diperbarui.'
          : 'Maintenance marketplace berhasil diperbarui.',
      );
    } catch (error) {
      setWebSettingDraftFields(previousDraft, false);
      if (target === 'pos') {
        setMaintenanceMode(previousDraft.maintenancePos);
      }
      setWebSettingSaveStatus('error');
      setWebSettingMessage(getWebSettingSaveErrorMessage(error));
    }
  };

  const saveOperationalLivechat = async (value: boolean) => {
    const previous = webSettingDraft.livechatOnline;

    setWebSettingSaveStatus('saving');
    setWebSettingMessage('');
    setWebSettingDraftFields({ livechatOnline: value }, false);
    setStorefrontEnabled(value);

    try {
      const updated = await updateKolamWebSetting({ livechatOnline: value });
      setWebSetting({
        ...updated,
        livechatOnline: value,
      });
      setWebSettingSaveStatus('saved');
      setWebSettingMessage('Livechat berhasil diperbarui.');
    } catch (error) {
      setWebSettingDraftFields({ livechatOnline: previous }, false);
      setStorefrontEnabled(previous);
      setWebSettingSaveStatus('error');
      setWebSettingMessage(getWebSettingSaveErrorMessage(error));
    }
  };

  const saveOperationalComplaintPeriod = async () => {
    const previous = webSettingDraft.complaintPeriodDays;
    const validationError = validateKolamComplaintPeriodDaysInput(
      webSettingDraft.complaintPeriodDays,
    );
    if (validationError) {
      setWebSettingSaveStatus('error');
      setWebSettingMessage(validationError);
      return;
    }

    const days = normalizeKolamComplaintPeriodDays(
      webSettingDraft.complaintPeriodDays,
    );

    setWebSettingSaveStatus('saving');
    setWebSettingMessage('');
    setWebSettingDraftFields({ complaintPeriodDays: String(days) }, false);

    try {
      const updated = await updateKolamWebSetting({
        complaintPeriodDays: days,
      });
      setWebSetting({
        ...updated,
        complaintPeriodDays: days,
      });
      setWebSettingSaveStatus('saved');
      setWebSettingMessage('Periode keluhan diperbarui.');
    } catch (error) {
      setWebSettingDraftFields({ complaintPeriodDays: previous }, false);
      setWebSettingSaveStatus('error');
      setWebSettingMessage(getWebSettingSaveErrorMessage(error));
    }
  };

  const saveOperationalGoogleAuth = async (
    patch: Partial<
      Pick<WebSettingDraft, 'webstoreGoogleAuthEnabled' | 'googleOAuthClientId'>
    >,
  ) => {
    const previous = {
      webstoreGoogleAuthEnabled: webSettingDraft.webstoreGoogleAuthEnabled,
      googleOAuthClientId: webSettingDraft.googleOAuthClientId,
    };
    const nextDraft = { ...previous, ...patch };

    setWebSettingSaveStatus('saving');
    setWebSettingMessage('');
    setWebSettingDraftFields(nextDraft, false);

    try {
      const updated = await updateKolamWebSetting({
        ...(patch.webstoreGoogleAuthEnabled !== undefined
          ? { webstoreGoogleAuthEnabled: nextDraft.webstoreGoogleAuthEnabled }
          : {}),
        ...(patch.googleOAuthClientId !== undefined
          ? { googleOAuthClientId: nextDraft.googleOAuthClientId.trim() }
          : {}),
      });
      setWebSetting({
        ...updated,
        webstoreGoogleAuthEnabled: nextDraft.webstoreGoogleAuthEnabled,
        googleOAuthClientId: nextDraft.googleOAuthClientId.trim(),
      });
      setWebSettingSaveStatus('saved');
      setWebSettingMessage('Google Sign-In berhasil disimpan.');
    } catch (error) {
      setWebSettingDraftFields(previous, false);
      setWebSettingSaveStatus('error');
      setWebSettingMessage(getWebSettingSaveErrorMessage(error));
    }
  };

  const saveOperationalPoWorkflow = async (patch: Partial<WebSettingDraft>) => {
    const previous = pickPoWorkflowDraftFields(webSettingDraft);
    const nextDraft = {
      ...webSettingDraft,
      ...patch,
    };
    const nextPoWorkflow = createPoWorkflowUpdateBody(nextDraft);

    setWebSettingSaveStatus('saving');
    setWebSettingMessage('');
    setWebSettingDraftFields(patch, false);

    try {
      const updated = await updateKolamWebSetting({
        poWorkflow: nextPoWorkflow,
      });
      setWebSetting({
        ...updated,
        poWorkflow: nextPoWorkflow,
      });
      setWebSettingSaveStatus('saved');
      setWebSettingMessage('Alur PO berhasil diperbarui.');
    } catch (error) {
      setWebSettingDraftFields(previous, false);
      setWebSettingSaveStatus('error');
      setWebSettingMessage(getWebSettingSaveErrorMessage(error));
    }
  };

  const saveOperationalStaffAttendance = async () => {
    const previous = createStaffAttendanceDraftPatch(webSettingDraft);

    setWebSettingSaveStatus('saving');
    setWebSettingMessage('');

    try {
      const attendance = await updateKolamStaffAttendanceSettings(
        createStaffAttendanceUpdateBody(webSettingDraft),
      );
      setStaffAttendanceSettings(attendance);
      setWebSettingDraftFields(
        createStaffAttendanceDraftFields(attendance),
        false,
      );
      setWebSettingSaveStatus('saved');
      setWebSettingMessage('Pengaturan absensi berhasil disimpan.');
    } catch (error) {
      setWebSettingDraftFields(previous, false);
      setWebSettingSaveStatus('error');
      setWebSettingMessage(getWebSettingSaveErrorMessage(error));
    }
  };

  const saveNotificationToggle = async (
    key: 'daraHandoffNotifyEnabled' | 'teamChatGroupCallEnabled',
    value: boolean,
  ) => {
    const previous = webSettingDraft[key];

    setWebSettingSaveStatus('saving');
    setWebSettingMessage('');
    setWebSettingDraftFields(
      { [key]: value } as Partial<WebSettingDraft>,
      false,
    );

    try {
      const updated = await updateKolamWebSetting({ [key]: value });
      setWebSetting({
        ...updated,
        [key]: value,
      } as KolamWebSetting);
      setWebSettingSaveStatus('saved');
      setWebSettingMessage(
        key === 'daraHandoffNotifyEnabled'
          ? 'Notifikasi alih tangan DARA berhasil diperbarui.'
          : 'Panggilan grup chat tim berhasil diperbarui.',
      );
    } catch (error) {
      setWebSettingDraftFields(
        { [key]: previous } as Partial<WebSettingDraft>,
        false,
      );
      setWebSettingSaveStatus('error');
      setWebSettingMessage(getWebSettingSaveErrorMessage(error));
    }
  };

  const saveNotificationFirebase = async () => {
    const previous = {
      firebaseEnabled: webSettingDraft.firebaseEnabled,
      firebaseProjectId: webSettingDraft.firebaseProjectId,
      firebaseClientEmail: webSettingDraft.firebaseClientEmail,
      firebasePrivateKey: webSettingDraft.firebasePrivateKey,
    };
    const firebase = createFirebaseUpdateBody(webSettingDraft);
    const hasConfiguredPrivateKey =
      webSetting?.firebase?.privateKeyConfigured === true ||
      Boolean(firebase.privateKey?.trim());

    if (
      firebase.enabled &&
      (!firebase.projectId?.trim() ||
        !firebase.clientEmail?.trim() ||
        !hasConfiguredPrivateKey)
    ) {
      setWebSettingSaveStatus('error');
      setWebSettingMessage(
        'Project ID, client email, dan private key Firebase wajib diisi saat Firebase aktif.',
      );
      return;
    }

    setWebSettingSaveStatus('saving');
    setWebSettingMessage('');

    try {
      const updated = await updateKolamWebSetting({ firebase });
      const nextFirebase = {
        ...(updated.firebase ?? {}),
        ...firebase,
        privateKeyConfigured:
          updated.firebase?.privateKeyConfigured ??
          webSetting?.firebase?.privateKeyConfigured ??
          Boolean(firebase.privateKey),
      };

      setWebSetting({
        ...updated,
        firebase: nextFirebase,
      });
      setWebSettingDraftFields(
        {
          firebaseEnabled: nextFirebase.enabled === true,
          firebaseProjectId: nextFirebase.projectId ?? '',
          firebaseClientEmail: nextFirebase.clientEmail ?? '',
          firebasePrivateKey: nextFirebase.privateKeyConfigured
            ? maskedSecretPlaceholder
            : '',
        },
        false,
      );
      setWebSettingSaveStatus('saved');
      setWebSettingMessage('Firebase push berhasil disimpan.');
    } catch (error) {
      setWebSettingDraftFields(previous, false);
      setWebSettingSaveStatus('error');
      setWebSettingMessage(getWebSettingSaveErrorMessage(error));
    }
  };

  const saveNotificationOtpSmtp = async () => {
    const previous = {
      staffOtpLoginEnabled: webSettingDraft.staffOtpLoginEnabled,
      staffOtpExpireMinutes: webSettingDraft.staffOtpExpireMinutes,
      staffOtpResendCooldownSeconds:
        webSettingDraft.staffOtpResendCooldownSeconds,
      staffOtpMaxAttempts: webSettingDraft.staffOtpMaxAttempts,
      staffOtpLockMinutes: webSettingDraft.staffOtpLockMinutes,
      smtpHost: webSettingDraft.smtpHost,
      smtpPort: webSettingDraft.smtpPort,
      smtpUser: webSettingDraft.smtpUser,
      smtpPass: webSettingDraft.smtpPass,
      smtpFromEmail: webSettingDraft.smtpFromEmail,
      smtpFromName: webSettingDraft.smtpFromName,
      smtpSecure: webSettingDraft.smtpSecure,
    };
    const staffOtpLogin = {
      enabled: webSettingDraft.staffOtpLoginEnabled,
      otpExpireMinutes: clampIntegerOrFallback(
        webSettingDraft.staffOtpExpireMinutes,
        10,
        1,
        60,
      ),
      resendCooldownSeconds: clampIntegerOrFallback(
        webSettingDraft.staffOtpResendCooldownSeconds,
        60,
        30,
        600,
      ),
      maxAttempts: clampIntegerOrFallback(
        webSettingDraft.staffOtpMaxAttempts,
        5,
        1,
        10,
      ),
      lockMinutes: clampIntegerOrFallback(
        webSettingDraft.staffOtpLockMinutes,
        15,
        1,
        120,
      ),
    };
    const smtp = createSmtpUpdateBody(webSettingDraft);

    setWebSettingSaveStatus('saving');
    setWebSettingMessage('');

    try {
      const updated = await updateKolamWebSetting({
        staffOtpLogin,
        smtp,
      });
      const nextSmtp = {
        ...(updated.smtp ?? {}),
        ...smtp,
        passConfigured:
          updated.smtp?.passConfigured ??
          webSetting?.smtp?.passConfigured ??
          Boolean(smtp.pass),
      };

      setWebSetting({
        ...updated,
        staffOtpLogin: {
          ...(updated.staffOtpLogin ?? {}),
          ...staffOtpLogin,
        },
        smtp: nextSmtp,
      });
      setWebSettingDraftFields(
        {
          staffOtpLoginEnabled: staffOtpLogin.enabled,
          staffOtpExpireMinutes: String(staffOtpLogin.otpExpireMinutes),
          staffOtpResendCooldownSeconds: String(
            staffOtpLogin.resendCooldownSeconds,
          ),
          staffOtpMaxAttempts: String(staffOtpLogin.maxAttempts),
          staffOtpLockMinutes: String(staffOtpLogin.lockMinutes),
          smtpHost: nextSmtp.host ?? '',
          smtpPort: String(nextSmtp.port ?? 465),
          smtpUser: nextSmtp.user ?? '',
          smtpPass: nextSmtp.passConfigured ? maskedSecretPlaceholder : '',
          smtpFromEmail: nextSmtp.fromEmail ?? '',
          smtpFromName: nextSmtp.fromName ?? 'Kolam',
          smtpSecure: nextSmtp.secure !== false,
        },
        false,
      );
      setWebSettingSaveStatus('saved');
      setWebSettingMessage('OTP staf dan SMTP berhasil disimpan.');
    } catch (error) {
      setWebSettingDraftFields(previous, false);
      setWebSettingSaveStatus('error');
      setWebSettingMessage(getWebSettingSaveErrorMessage(error));
    }
  };

  const setRoleDraftField = <Key extends keyof RoleDraft>(
    key: Key,
    value: RoleDraft[Key],
  ) => {
    if (
      key === 'key' &&
      selectedLiveRole &&
      (isSettingsDefaultRoleKey(selectedLiveRole.key) ||
        isSettingsSuperAdminRoleKey(selectedLiveRole.key))
    ) {
      setRoleSaveStatus('error');
      setRoleMessage('Key role sistem tidak boleh diubah dari native.');
      return;
    }

    setRoleDraft(current => ({
      ...current,
      [key]: value,
    }));
    setRoleSaveStatus('idle');
  };

  const reloadRoles = async () => {
    const nextRoles = await getKolamRoles();
    setRoles(nextRoles);
    setSelectedRoleId(current =>
      nextRoles.some(role => role._id === current)
        ? current
        : nextRoles[0]?._id ?? '',
    );
    return nextRoles;
  };

  const refreshRolePermissionCache = async () => {
    const user = await getCurrentUser().catch(() => null);
    setSettingsVisibilityContext(
      user
        ? {
            roleKey: user.roleKey,
            permissions: user.permissions,
          }
        : null,
    );
  };

  const createRole = async () => {
    if (
      !hasSettingsRoleMutationPermission(settingsVisibilityContext, 'create')
    ) {
      setRoleSaveStatus('error');
      setRoleMessage('Akses ditolak: permission role:create diperlukan.');
      return;
    }

    if (!roleDraft.name.trim() || !roleDraft.key.trim()) {
      setRoleSaveStatus('error');
      setRoleMessage('Nama role dan key role wajib diisi.');
      return;
    }

    setRoleSaveStatus('saving');
    setRoleMessage('');

    try {
      const created = await createKolamRole({
        name: roleDraft.name.trim(),
        key: roleDraft.key.trim(),
        description: cleanOptionalString(roleDraft.description),
        permissions: [{ resource: 'role', actions: ['view'] }],
      });

      await reloadRoles();
      await refreshRolePermissionCache();
      setSelectedRoleId(created._id);
      setRoleSaveStatus('saved');
      setRoleMessage('Role berhasil dibuat dari data live.');
    } catch (error) {
      setRoleSaveStatus('error');
      setRoleMessage(getRoleSaveErrorMessage(error));
    }
  };

  const updateRole = async () => {
    if (!selectedLiveRole) {
      return;
    }

    if (!canUpdateRoles) {
      setRoleSaveStatus('error');
      setRoleMessage('Akses ditolak: permission role:update diperlukan.');
      return;
    }

    if (!roleDraft.name.trim() || !roleDraft.key.trim()) {
      setRoleSaveStatus('error');
      setRoleMessage('Nama role dan key role wajib diisi.');
      return;
    }

    const protectedRole =
      isSettingsDefaultRoleKey(selectedLiveRole.key) ||
      isSettingsSuperAdminRoleKey(selectedLiveRole.key);
    const nextKey = protectedRole ? selectedLiveRole.key : roleDraft.key.trim();

    setRoleSaveStatus('saving');
    setRoleMessage('');

    try {
      const updated = await updateKolamRole(selectedLiveRole._id, {
        name: roleDraft.name.trim(),
        key: nextKey,
        description: cleanOptionalString(roleDraft.description),
        permissions: selectedLiveRole.permissions ?? [],
      });

      setRoles(current =>
        current.map(role => (role._id === updated._id ? updated : role)),
      );
      await reloadRoles();
      await refreshRolePermissionCache();
      setRoleSaveStatus('saved');
      setRoleMessage('Role berhasil diperbarui dan permission user direfresh.');
    } catch (error) {
      setRoleSaveStatus('error');
      setRoleMessage(getRoleSaveErrorMessage(error));
    }
  };

  const deleteRole = async (role = roleToDelete) => {
    if (!role) {
      return;
    }

    if (
      !hasSettingsRoleMutationPermission(settingsVisibilityContext, 'delete')
    ) {
      setRoleSaveStatus('error');
      setRoleMessage('Akses ditolak: permission role:delete diperlukan.');
      return;
    }

    if (isSettingsDefaultRoleKey(role.key)) {
      setRoleSaveStatus('error');
      setRoleMessage('Default role tidak boleh dihapus.');
      setRoleToDelete(null);
      return;
    }

    setRoleSaveStatus('saving');
    setRoleMessage('');

    try {
      await deleteKolamRole(role._id);
      const nextRoles = await reloadRoles();
      await refreshRolePermissionCache();
      setRoleSaveStatus('saved');
      setRoleMessage('Role berhasil dihapus dari data live.');
      setSelectedRoleId(nextRoles[0]?._id ?? '');
      setRoleToDelete(null);
    } catch (error) {
      setRoleSaveStatus('error');
      setRoleMessage(getRoleSaveErrorMessage(error));
    }
  };

  const toggleRolePermissionAction = async (
    resource: string,
    action: string,
  ) => {
    if (
      !selectedLiveRole ||
      isSettingsSuperAdminRoleKey(selectedLiveRole.key) ||
      roleSaveStatus === 'saving' ||
      !canUpdateRoles
    ) {
      return;
    }

    setRoleSaveStatus('saving');
    setRoleMessage('');

    try {
      const permissions = createUpdatedRolePermissions(
        selectedLiveRole.permissions ?? [],
        resource,
        action,
      );
      const updated = await updateKolamRole(selectedLiveRole._id, {
        name: selectedLiveRole.name,
        key: selectedLiveRole.key,
        description: selectedLiveRole.description,
        permissions,
      });

      setRoles(current =>
        current.map(role => (role._id === updated._id ? updated : role)),
      );
      await refreshRolePermissionCache();
      setRoleSaveStatus('saved');
      setRoleMessage('Permission role berhasil diperbarui.');
    } catch (error) {
      setRoleSaveStatus('error');
      setRoleMessage(getRoleSaveErrorMessage(error));
    }
  };

  const roleActionHandlers = {
    'create-role': createRole,
    'update-role': updateRole,
    'delete-role': () => {
      if (selectedLiveRole) {
        setRoleToDelete(selectedLiveRole);
      }
    },
  };

  const setPaymentMethodFilter = (
    key: keyof SettingsPaymentMethodFilters,
    value: string | number,
  ) => {
    setPaymentMethodFilters(current => ({
      ...current,
      [key]: value,
      page: key === 'page' ? Number(value) : 1,
    }));
  };

  const setPaymentMethodDraftField = <
    Key extends keyof SettingsPaymentMethodDraft,
  >(
    key: Key,
    value: SettingsPaymentMethodDraft[Key],
  ) => {
    setPaymentMethodDraft(current => ({ ...current, [key]: value }));
  };

  const editPaymentMethod = (method: KolamPaymentMethod) => {
    setPaymentMethodDraft(createPaymentMethodDraft(method));
  };

  const clearPaymentMethodDraft = () => {
    setPaymentMethodDraft(emptyPaymentMethodDraft);
  };

  const refreshPaymentMethods = async () => {
    const result = await getKolamPaymentMethods(
      createPaymentMethodListParams(paymentMethodFilters),
    );
    setPaymentMethods(result.rows);
    setPaymentMethodTotal(result.pagination.total);
    setPaymentMethodTotalPages(result.pagination.totalPages);
  };

  const savePaymentMethod = async () => {
    setFinancialStatus('saving');
    setFinancialMessage('');

    try {
      const body = createPaymentMethodSaveBody(paymentMethodDraft);
      if (paymentMethodDraft.id) {
        await updateKolamPaymentMethod(paymentMethodDraft.id, body);
        setFinancialMessage('Metode pembayaran berhasil diperbarui.');
      } else {
        const created = await createKolamPaymentMethod(body);
        if (
          body.requireSaleProof === true &&
          created.id &&
          created.requireSaleProof !== true
        ) {
          await updateKolamPaymentMethod(created.id, {
            requireSaleProof: true,
          });
        }
        setFinancialMessage('Metode pembayaran berhasil dibuat.');
      }
      clearPaymentMethodDraft();
      await refreshPaymentMethods();
      setFinancialStatus('live');
    } catch (error) {
      setFinancialStatus('error');
      setFinancialMessage(getFinancialErrorMessage(error));
    }
  };

  const deletePaymentMethod = async (id: string) => {
    setFinancialStatus('saving');
    setFinancialMessage('');

    try {
      await deleteKolamPaymentMethod(id);
      await refreshPaymentMethods();
      setFinancialStatus('live');
      setFinancialMessage('Metode pembayaran berhasil dihapus.');
    } catch (error) {
      setFinancialStatus('error');
      setFinancialMessage(getFinancialErrorMessage(error));
    }
  };

  const uploadPaymentMethodPhoto = async (id: string) => {
    try {
      const picked = await pickNativeImageFile();
      const localUri = picked.uri ?? picked.path ?? '';
      if (picked.cancelled || !localUri) {
        return;
      }

      setFinancialStatus('saving');
      await uploadKolamPaymentMethodPhoto(id, localUri);
      await refreshPaymentMethods();
      setFinancialStatus('live');
      setFinancialMessage('Foto metode pembayaran berhasil diunggah.');
    } catch (error) {
      setFinancialStatus('error');
      setFinancialMessage(getFinancialErrorMessage(error));
    }
  };

  const deletePaymentMethodPhoto = async (id: string) => {
    setFinancialStatus('saving');
    setFinancialMessage('');

    try {
      await deleteKolamPaymentMethodPhoto(id);
      await refreshPaymentMethods();
      setFinancialStatus('live');
      setFinancialMessage('Foto metode pembayaran berhasil dihapus.');
    } catch (error) {
      setFinancialStatus('error');
      setFinancialMessage(getFinancialErrorMessage(error));
    }
  };

  const setTaxCompanyProfileDraftField = <
    Key extends keyof KolamTaxCompanyProfile,
  >(
    key: Key,
    value: KolamTaxCompanyProfile[Key],
  ) => {
    setTaxCompanyProfileDraft(current => ({ ...current, [key]: value }));
  };

  const saveTaxCompanyProfile = async () => {
    if (!taxCompanyProfileDraft.companyName?.trim()) {
      setFinancialStatus('error');
      setFinancialMessage('Nama perusahaan wajib diisi.');
      return;
    }

    setFinancialStatus('saving');
    setFinancialMessage('');

    try {
      const updated = await updateKolamTaxCompanyProfile(
        createTaxCompanyProfileSaveBody(taxCompanyProfileDraft),
      );
      const gaps = await getKolamTaxPartyGaps().catch(() => taxPartyGaps);
      setTaxCompanyProfile(updated);
      setTaxCompanyProfileDraft(updated);
      setTaxPartyGaps(gaps);
      setFinancialStatus('live');
      setFinancialMessage('Profil pajak berhasil disimpan.');
    } catch (error) {
      setFinancialStatus('error');
      setFinancialMessage(getFinancialErrorMessage(error));
    }
  };

  const saveFinancialWebSettingPatch = async (
    patch: Partial<KolamWebSetting>,
    message: string,
  ) => {
    const previous = webSetting;
    setFinancialStatus('saving');
    setFinancialMessage('');

    try {
      const updated = await updateKolamWebSetting(patch);
      const merged = { ...(previous ?? {}), ...updated, ...patch };
      setWebSetting(merged);
      setWebSettingDraft(current => ({
        ...current,
        ...createFinancialDraftFields(merged),
      }));
      setFinancialStatus('live');
      setFinancialMessage(message);
    } catch (error) {
      if (previous) {
        setWebSetting(previous);
        setWebSettingDraft(current => ({
          ...current,
          ...createFinancialDraftFields(previous),
        }));
      }
      setFinancialStatus('error');
      setFinancialMessage(getFinancialErrorMessage(error));
    }
  };

  const saveFinancialTaxToggle = (
    key: 'salePricesIncludeTax' | 'commissionPph21Enabled',
    value: boolean,
  ) => {
    setWebSettingDraft(current => ({ ...current, [key]: value }));
    void saveFinancialWebSettingPatch(
      { [key]: value },
      key === 'salePricesIncludeTax'
        ? 'Toggle harga include PPN berhasil disimpan.'
        : 'Toggle PPh 21 komisi berhasil disimpan.',
    );
  };

  const saveOvertimeSettings = () => {
    void saveFinancialWebSettingPatch(
      { overtimeSettings: createOvertimeSettingsUpdateBody(webSettingDraft) },
      'Pengaturan lembur berhasil disimpan.',
    );
  };

  const saveEnclosureSaleCommission = () => {
    void saveFinancialWebSettingPatch(
      {
        enclosureSaleCommission:
          createEnclosureSaleCommissionUpdateBody(webSettingDraft),
      },
      'Komisi penjualan kandang berhasil disimpan.',
    );
  };

  return {
    activeSettingsTab: getSettingsTabItemById(activeSettingsTabId),
    activeSettingsTabId,
    activeSurface,
    activeSurfaceId,
    activityEntries,
    activityLogFilters,
    activityLogMessage,
    activityLogStatus,
    activityPagination,
    activityRows,
    changeActivityPage,
    detailRows,
    liveEndpoints,
    financialSummaryRows,
    financialMessage,
    financialSectionVisibility,
    financialStatus,
    financialWallets,
    daraKnowledgeDraft,
    daraKnowledgeMessage,
    daraKnowledgeSaveStatus,
    kpiMessage,
    kpiPreview,
    kpiSettingsDraft,
    kpiStatus,
    kpiSummaryRows,
    maintenanceMode,
    marketplaceLandingOverview,
    marketplaceLandingCtaDraft,
    marketplaceLandingHeroDraft,
    marketplaceLandingCategoryDraft,
    marketplaceLandingAnnouncementDraft,
    marketplaceLandingYoutubeDraft,
    marketplaceLandingNoticeDraft,
    marketplaceLandingSaveStatus,
    marketplaceLandingMessage,
    marketplaceLandingAssetStatus,
    marketplaceLandingTabId,
    marketplaceLandingTabItems,
    operationalRooms,
    operationalStaffRows,
    selectedProvince,
    selectedRegency,
    selectedDistrict,
    selectedVillage,
    regionLevel: activeRegionHierarchy.level,
    regionProvinceRows,
    regionRegencyRows,
    regionDistrictRows,
    regionVillageRows,
    regionRows: filteredRegionRows,
    regionSyncMessage,
    regionSyncStatus,
    regionSyncSummaryRows,
    paymentMethodDraft,
    paymentMethodFilters,
    paymentMethodTotal,
    paymentMethodTotalPages,
    paymentMethods,
    roleRows,
    roles,
    roleDraft,
    roleMessage,
    roleSaveStatus,
    roleStatus,
    selectSettingsTab,
    selectSurface,
    selectedActivityLog,
    selectedActivityLogFields,
    selectedActivityLogId,
    setSelectedActivityLogId,
    selectedRole,
    selectedRoleId,
    setMaintenanceMode,
    setActivityLogFilter,
    setKpiEnabledRule,
    setKpiSettingsDraftField,
    setMarketplaceLandingTabId,
    setMarketplaceLandingHeroDraftField,
    setMarketplaceLandingCategoryDraftField,
    setMarketplaceLandingAnnouncementDraftField,
    setPaymentMethodDraftField,
    setPaymentMethodFilter,
    setDaraKnowledgeDraftField,
    setRegionSelection,
    setRoleDraftField,
    setSelectedRoleId,
    setTaxCompanyProfileDraftField,
    setStorefrontEnabled,
    setWebContentPanelId,
    setWebTitle,
    settingsTabItems: visibleSettingsTabItems,
    settingsSurfaceItems,
    stats,
    storefrontEnabled,
    webTitle,
    webConfigFields: getSettingsWebConfigFields(webSetting),
    webContentLauncherItems,
    webContentMessage,
    webContentPanelId,
    webContentStatus,
    blogRows,
    blogTopicRows,
    webFormSections: getSettingsWebFormSections(
      webSetting,
      webSettingVersions,
      webSettingVersion,
    ),
    saveWebSetting,
    deleteNotificationSound,
    notificationSoundStatus,
    uploadNotificationSound,
    setWebSettingDraftField,
    setWebSettingPluginControl,
    setMarketplaceLandingCtaDraftField,
    setMarketplaceLandingYoutubeDraftField,
    setMarketplaceLandingNoticeDraftField,
    setSitemapCustomUrlsDraftText,
    setSitemapExcludedSlugsDraftText,
    setSitemapMasterField,
    setSitemapSectionField,
    setSitemapStaticPageField,
    addSitemapStaticPage,
    removeSitemapStaticPage,
    setSitemapCustomUrlField,
    addSitemapCustomUrl,
    removeSitemapCustomUrl,
    clearMarketplaceLandingNoticeDraft,
    clearMarketplaceHeroDraft,
    clearMarketplaceCategoryDraft,
    clearMarketplaceAnnouncementDraft,
    deleteMarketplaceAnnouncementBanner,
    deleteMarketplaceBioactiveStep,
    deleteMarketplaceCategoryBanner,
    deleteMarketplaceFeaturedCollection,
    deleteMarketplaceHeroSlide,
    deleteMarketplaceLandingNotice,
    editMarketplaceHeroSlide,
    editMarketplaceCategoryBanner,
    editMarketplaceAnnouncementBanner,
    editMarketplaceLandingNotice,
    moveMarketplaceAnnouncementBanner,
    moveMarketplaceBioactiveStep,
    moveMarketplaceCategoryBanner,
    moveMarketplaceFeaturedCollection,
    moveMarketplaceHeroSlide,
    saveMarketplaceLandingCta,
    saveMarketplaceHeroSlide,
    saveMarketplaceCategoryBanner,
    saveMarketplaceAnnouncementBanner,
    saveMarketplaceLandingYoutube,
    saveMarketplaceLandingNotice,
    saveDaraKnowledge,
    clearPaymentMethodDraft,
    deletePaymentMethod,
    deletePaymentMethodPhoto,
    editPaymentMethod,
    saveEnclosureSaleCommission,
    saveFinancialTaxToggle,
    saveOvertimeSettings,
    savePaymentMethod,
    saveTaxCompanyProfile,
    saveKpiSettings,
    saveNotificationFirebase,
    saveNotificationOtpSmtp,
    saveNotificationToggle,
    saveShippingOrigin,
    saveStoreOperatingHours,
    saveOperationalComplaintPeriod,
    saveOperationalGoogleAuth,
    saveOperationalLivechat,
    saveOperationalMaintenance,
    saveOperationalPoWorkflow,
    saveOperationalStaffAttendance,
    uploadMarketplaceAnnouncementImage,
    uploadMarketplaceBioactiveStepImage,
    uploadMarketplaceCategoryBannerImage,
    uploadMarketplaceCtaBackground,
    uploadMarketplaceDaraAvatar,
    uploadMarketplaceFeaturedCollectionImage,
    uploadMarketplaceHeroImage,
    uploadMarketplaceLogo,
    uploadMarketplaceYoutubeBackground,
    pickMarketplaceLandingHeroImage,
    pickMarketplaceLandingCategoryImage,
    pickMarketplaceLandingAnnouncementImage,
    uploadDaraWorkerPhoto,
    uploadPaymentMethodPhoto,
    taxCompanyProfile,
    taxCompanyProfileDraft,
    taxPartyGaps,
    webSettingDraft,
    webSettingMessage,
    webSettingSaveStatus,
    webSettingStatus,
    roleEditorActions: getSettingsRoleEditorActions(
      selectedRole?.id,
      selectedRole?.defaultRole,
      settingsVisibilityContext,
    ),
    roleInfoPanel: getSettingsRoleInfoPanel(selectedRole?.id, roleRows),
    roleMemberPreview:
      roleMemberPreview ??
      getSettingsRoleMemberPreview(
        selectedRole?.id ?? roleRows[0]?.id ?? 'super-admin',
      ),
    roleToDelete,
    cancelRoleDelete: () => {
      setRoleToDelete(null);
    },
    confirmRoleDelete: () => {
      void deleteRole();
    },
    rolePermissionMatrixGroups: getSettingsRolePermissionMatrixGroups(
      selectedLiveRole ?? selectedRole?.id,
      selectedRole?.defaultRole,
      canUpdateRoles,
    ),
    rolePermissionPreviewRows: getSettingsRolePermissionPreviewRows(),
    roleResourceGroups: getSettingsRoleResourceGroups(),
    roleTabItems: getSettingsRoleTabItems(roleRows, roles),
    onRoleAction: (actionId: keyof typeof roleActionHandlers) => {
      void roleActionHandlers[actionId]?.();
    },
    onToggleRolePermissionAction: toggleRolePermissionAction,
    activityColumns: getSettingsActivityLogTableColumns(),
    activityFilterControls: getSettingsActivityLogFilterControls(),
    activityStatsCards: useLiveActivityLogs
      ? getSettingsActivityLogStatsCardsFromLive(
          activityLogStats,
          activityLogTotal,
        )
      : getSettingsActivityLogStatsCards(activityEntries),
    refreshActivityLogs,
    refreshKpiWeeklyPreview,
    refreshRegionSync,
    runRegionSync,
    sitemapChangeFrequencies,
    sitemapCustomUrlsText,
    sitemapDraft,
    sitemapExcludedSlugsText,
    sitemapSectionKeys,
  };
}

export type KolamSettingsPanelController = ReturnType<
  typeof useKolamSettingsPanelController
>;

function createWebSettingDraft(
  setting: KolamWebSetting,
  versions: KolamWebSettingVersions | null,
  version: KolamWebSettingVersion | null,
): WebSettingDraft {
  const mergedVersions = {
    ...(setting.versions ?? {}),
    ...(versions?.versions ?? {}),
  };
  const origin = setting.originAddress ?? {};
  const social = setting.socialMedia ?? {};
  const macAccess = setting.kolamMacAccess ?? {};
  const staffOtpLogin = setting.staffOtpLogin ?? {};
  const smtp = setting.smtp ?? {};
  const firebase = setting.firebase ?? {};
  const storeOperatingHours = setting.storeOperatingHours ?? {};
  const poWorkflow = setting.poWorkflow ?? {};
  const weeklyHours = storeOperatingHours.weeklyHours ?? {};
  const storeMessages = storeOperatingHours.messages ?? {};
  const mondayHours = weeklyHours.monday ?? {};
  const tuesdayHours = weeklyHours.tuesday ?? {};
  const wednesdayHours = weeklyHours.wednesday ?? {};
  const thursdayHours = weeklyHours.thursday ?? {};
  const fridayHours = weeklyHours.friday ?? {};
  const saturdayHours = weeklyHours.saturday ?? {};
  const sundayHours = weeklyHours.sunday ?? {};
  const inboxAiReplyPlatforms =
    (setting.inboxAiReplyPlatforms as Record<string, unknown> | undefined) ??
    {};

  return {
    versionKolam:
      mergedVersions.kolam ?? version?.version ?? setting.version ?? '',
    versionEnclonura: mergedVersions.enclonura ?? '',
    versionPos: mergedVersions.pos ?? '',
    versionMarketplace: mergedVersions.marketplace ?? '',
    companyName: setting.companyName ?? '',
    companyTagline: setting.companyTagline ?? '',
    address: setting.address ?? '',
    phone: setting.phone ?? '',
    email: setting.email ?? '',
    facebook: social.facebook ?? '',
    instagram: social.instagram ?? '',
    twitter: social.twitter ?? '',
    youtube: social.youtube ?? '',
    tiktok: social.tiktok ?? '',
    maintenancePos: setting.maintenance?.pos === true,
    maintenanceMarketplace: setting.maintenance?.marketplace === true,
    livechatOnline: setting.livechatOnline === true,
    webstoreGoogleAuthEnabled: setting.webstoreGoogleAuthEnabled === true,
    googleOAuthClientId: setting.googleOAuthClientId ?? '',
    complaintPeriodDays: String(
      normalizeKolamComplaintPeriodDays(setting.complaintPeriodDays),
    ),
    poWorkflowReceivingRoomId: poWorkflow.receivingRoomId ?? '',
    poWorkflowNotifyOnReceive: poWorkflow.notifyOnReceive !== false,
    poWorkflowNotifyOnCheck: poWorkflow.notifyOnCheck !== false,
    poWorkflowNotifyOnPartial: poWorkflow.notifyOnPartial !== false,
    poWorkflowPostProofToTeamChat: poWorkflow.postProofToTeamChat !== false,
    poWorkflowPartialCompleteRequiresAdmin:
      poWorkflow.partialCompleteRequiresAdmin !== false,
    poWorkflowNotifyReceiveUserIds: (
      poWorkflow.notifyReceiveUserIds ?? []
    ).join('\n'),
    poWorkflowNotifyCheckUserIds: (poWorkflow.notifyCheckUserIds ?? []).join(
      '\n',
    ),
    poWorkflowNotifyCompleteUserIds: (
      poWorkflow.notifyCompleteUserIds ?? []
    ).join('\n'),
    ...createStaffAttendanceDraftFields({}),
    biteshipApiKey: setting.biteshipApiKeyConfigured
      ? maskedSecretPlaceholder
      : setting.biteshipApiKey ?? '',
    googleMapsBrowserApiKey: setting.googleMapsBrowserApiKeyConfigured
      ? maskedSecretPlaceholder
      : setting.googleMapsBrowserApiKey ?? '',
    originAddressLine1: origin.addressLine1 ?? '',
    originCity: origin.city ?? '',
    originProvince: origin.province ?? '',
    originPostalCode: origin.postalCode ?? '',
    originLatitude:
      origin.latitude === null || origin.latitude === undefined
        ? ''
        : String(origin.latitude),
    originLongitude:
      origin.longitude === null || origin.longitude === undefined
        ? ''
        : String(origin.longitude),
    storeOperatingHoursEnabled: storeOperatingHours.enabled === true,
    storeOperatingHoursDaraReplyWhenClosed:
      storeOperatingHours.daraReplyWhenClosed === true,
    storeOperatingHoursTimezone:
      storeOperatingHours.timezone ??
      emptyWebSettingDraft.storeOperatingHoursTimezone,
    storeOperatingHoursSpecialClosureDate: '',
    storeOperatingHoursSpecialClosureLabel: '',
    storeOperatingHoursSpecialClosuresText: serializeStoreSpecialClosures(
      storeOperatingHours.specialClosures,
    ),
    storeOperatingHoursMessageBeforeOpen:
      storeMessages.beforeOpen || defaultStoreOperatingHoursMessages.beforeOpen,
    storeOperatingHoursMessageAfterClose:
      storeMessages.afterClose || defaultStoreOperatingHoursMessages.afterClose,
    storeOperatingHoursMessageWeeklyClosed:
      storeMessages.weeklyClosed ||
      defaultStoreOperatingHoursMessages.weeklyClosed,
    storeOperatingHoursMessageSpecialClosed:
      storeMessages.specialClosed ||
      defaultStoreOperatingHoursMessages.specialClosed,
    storeOperatingHoursMessageShippingDisclaimer:
      storeMessages.shippingDisclaimer ||
      defaultStoreOperatingHoursMessages.shippingDisclaimer,
    storeHoursMondayOpen: mondayHours.open !== false,
    storeHoursMondayOpenAt:
      mondayHours.openAt ?? emptyWebSettingDraft.storeHoursMondayOpenAt,
    storeHoursMondayCloseAt:
      mondayHours.closeAt ?? emptyWebSettingDraft.storeHoursMondayCloseAt,
    storeHoursTuesdayOpen: tuesdayHours.open !== false,
    storeHoursTuesdayOpenAt:
      tuesdayHours.openAt ?? emptyWebSettingDraft.storeHoursTuesdayOpenAt,
    storeHoursTuesdayCloseAt:
      tuesdayHours.closeAt ?? emptyWebSettingDraft.storeHoursTuesdayCloseAt,
    storeHoursWednesdayOpen: wednesdayHours.open !== false,
    storeHoursWednesdayOpenAt:
      wednesdayHours.openAt ?? emptyWebSettingDraft.storeHoursWednesdayOpenAt,
    storeHoursWednesdayCloseAt:
      wednesdayHours.closeAt ?? emptyWebSettingDraft.storeHoursWednesdayCloseAt,
    storeHoursThursdayOpen: thursdayHours.open !== false,
    storeHoursThursdayOpenAt:
      thursdayHours.openAt ?? emptyWebSettingDraft.storeHoursThursdayOpenAt,
    storeHoursThursdayCloseAt:
      thursdayHours.closeAt ?? emptyWebSettingDraft.storeHoursThursdayCloseAt,
    storeHoursFridayOpen: fridayHours.open !== false,
    storeHoursFridayOpenAt:
      fridayHours.openAt ?? emptyWebSettingDraft.storeHoursFridayOpenAt,
    storeHoursFridayCloseAt:
      fridayHours.closeAt ?? emptyWebSettingDraft.storeHoursFridayCloseAt,
    storeHoursSaturdayOpen: saturdayHours.open !== false,
    storeHoursSaturdayOpenAt:
      saturdayHours.openAt ?? emptyWebSettingDraft.storeHoursSaturdayOpenAt,
    storeHoursSaturdayCloseAt:
      saturdayHours.closeAt ?? emptyWebSettingDraft.storeHoursSaturdayCloseAt,
    storeHoursSundayOpen: sundayHours.open !== false,
    storeHoursSundayOpenAt:
      sundayHours.openAt ?? emptyWebSettingDraft.storeHoursSundayOpenAt,
    storeHoursSundayCloseAt:
      sundayHours.closeAt ?? emptyWebSettingDraft.storeHoursSundayCloseAt,
    staffDesktopOnlyEnabled: setting.staffDesktopOnly?.enabled === true,
    staffDesktopOnlyRedirectUrl: setting.staffDesktopOnly?.redirectUrl ?? '',
    kolamMacAccessEnabled: macAccess.enabled === true,
    kolamMacAccessAllowWebBrowser: macAccess.allowWebBrowser === true,
    kolamMacAccessBypassSuperAdmin: macAccess.bypassSuperAdmin !== false,
    kolamMacAccessAllowedMacAddresses: (
      macAccess.allowedMacAddresses ?? []
    ).join('\n'),
    staffOtpLoginEnabled: staffOtpLogin.enabled === true,
    staffOtpExpireMinutes: String(staffOtpLogin.otpExpireMinutes ?? 10),
    staffOtpResendCooldownSeconds: String(
      staffOtpLogin.resendCooldownSeconds ?? 60,
    ),
    staffOtpMaxAttempts: String(staffOtpLogin.maxAttempts ?? 5),
    staffOtpLockMinutes: String(staffOtpLogin.lockMinutes ?? 15),
    smtpHost: smtp.host ?? '',
    smtpPort: String(smtp.port ?? ''),
    smtpUser: smtp.user ?? '',
    smtpPass: smtp.passConfigured ? maskedSecretPlaceholder : '',
    smtpFromEmail: smtp.fromEmail ?? '',
    smtpFromName: smtp.fromName ?? '',
    smtpSecure: smtp.secure !== false,
    firebaseEnabled: firebase.enabled === true,
    firebaseProjectId: firebase.projectId ?? '',
    firebaseClientEmail: firebase.clientEmail ?? '',
    firebasePrivateKey: firebase.privateKeyConfigured
      ? maskedSecretPlaceholder
      : '',
    chatStoreEnabled: setting.kolamPlugins?.chat?.storeEnabled !== false,
    teamChatDaraReplyEnabled: setting.teamChatDaraReplyEnabled !== false,
    teamChatGroupCallEnabled: setting.teamChatGroupCallEnabled === true,
    inboxAiReplyStore: inboxAiReplyPlatforms.store === true,
    inboxAiReplyWhatsapp: inboxAiReplyPlatforms.whatsapp !== false,
    inboxAiReplyTiktok: inboxAiReplyPlatforms.tiktok !== false,
    inboxAiReplyInstagram: inboxAiReplyPlatforms.instagram !== false,
    inboxAiReplyTokopedia: inboxAiReplyPlatforms.tokopedia === true,
    inboxAiReplyShopee: inboxAiReplyPlatforms.shopee === true,
    daraFulfillmentTeamRoomId:
      typeof setting.daraFulfillmentTeamRoomId === 'string'
        ? setting.daraFulfillmentTeamRoomId
        : '',
    daraBusinessEnabled: setting.daraBusinessEnabled !== false,
    daraToolsEnabled: setting.daraToolsEnabled !== false,
    daraKnowledgeEnabled: setting.daraKnowledgeEnabled !== false,
    daraHandoffNotifyEnabled: setting.daraHandoffNotifyEnabled !== false,
    daraInsightsEnabled: setting.daraInsightsEnabled !== false,
    daraInsightsCronSchedule:
      typeof setting.daraInsightsCronSchedule === 'string'
        ? setting.daraInsightsCronSchedule
        : emptyWebSettingDraft.daraInsightsCronSchedule,
    daraAutoReportEnabled: setting.daraAutoReportEnabled !== false,
    daraImageAnalysisEnabled: setting.daraImageAnalysisEnabled !== false,
    daraTaxEnabled: setting.daraTaxEnabled !== false,
    daraSeoEnabled: setting.daraSeoEnabled !== false,
    daraSeoMonitorEnabled: setting.daraSeoMonitorEnabled !== false,
    daraSeoSentimentLlmEnabled: setting.daraSeoSentimentLlmEnabled === true,
    daraMarketScanCronEnabled: setting.daraMarketScanCronEnabled !== false,
    daraTaxRegulationWatcherEnabled:
      setting.daraTaxRegulationWatcherEnabled === true,
    daraTaxComplianceJobEnabled: setting.daraTaxComplianceJobEnabled !== false,
    daraTaxLlmNarrativeEnabled: setting.daraTaxLlmNarrativeEnabled === true,
    autoOlshopFulfillmentEnabled: setting.autoOlshopFulfillmentEnabled === true,
    autoOlshopShopeeEnabled: setting.autoOlshopShopeeEnabled === true,
    autoOlshopTokopediaEnabled: setting.autoOlshopTokopediaEnabled === true,
    daraWebstoreFulfillmentEnabled:
      setting.daraWebstoreFulfillmentEnabled !== false,
    daraFulfillmentPackingMinutes: String(
      setting.daraFulfillmentPackingMinutes ?? 30,
    ),
    daraFulfillmentPackingMaxExtensions: String(
      setting.daraFulfillmentPackingMaxExtensions ?? 1,
    ),
    daraAvatarUrl:
      typeof setting.daraAvatarUrl === 'string' ? setting.daraAvatarUrl : '',
    katakTerbangWorkerName:
      typeof setting.katakTerbangWorkerName === 'string'
        ? setting.katakTerbangWorkerName
        : '',
    daraStaffOpsNotifyEnabled: setting.daraStaffOpsNotifyEnabled !== false,
    daraStaffWaNotifyEnabled: setting.daraStaffWaNotifyEnabled !== false,
    daraPenjualanTeamRoomId:
      typeof setting.daraPenjualanTeamRoomId === 'string'
        ? setting.daraPenjualanTeamRoomId
        : '',
    daraOlshopCustomerNotifyEnabled:
      setting.daraOlshopCustomerNotifyEnabled !== false,
    daraOlshopDeferredCron:
      typeof setting.daraOlshopDeferredCron === 'string'
        ? setting.daraOlshopDeferredCron
        : emptyWebSettingDraft.daraOlshopDeferredCron,
    daraOlshopDeferredBatch: String(setting.daraOlshopDeferredBatch ?? 20),
    daraOlshopStockGateEnabled: setting.daraOlshopStockGateEnabled !== false,
    daraOlshopStockSyncMaxAgeMs: String(
      setting.daraOlshopStockSyncMaxAgeMs ?? 21600000,
    ),
    daraOlshopStockGateCron:
      typeof setting.daraOlshopStockGateCron === 'string'
        ? setting.daraOlshopStockGateCron
        : emptyWebSettingDraft.daraOlshopStockGateCron,
    daraOlshopStockGateBatch: String(setting.daraOlshopStockGateBatch ?? 20),
    daraOpsAuditEnabled: setting.daraOpsAuditEnabled !== false,
    daraOwnerDigestEnabled: setting.daraOwnerDigestEnabled !== false,
    daraOwnerDigestCron:
      typeof setting.daraOwnerDigestCron === 'string'
        ? setting.daraOwnerDigestCron
        : emptyWebSettingDraft.daraOwnerDigestCron,
    daraOwnerDigestWaEnabled: setting.daraOwnerDigestWaEnabled !== false,
    daraOwnerDigestFcmEnabled: setting.daraOwnerDigestFcmEnabled !== false,
    daraOwnerFcmUrgentEnabled: setting.daraOwnerFcmUrgentEnabled !== false,
    daraOpsDigestLookbackHours: String(
      setting.daraOpsDigestLookbackHours ?? 12,
    ),
    notificationSound: setting.notificationSound ?? '',
    unassignedNotificationSound: setting.unassignedNotificationSound ?? '',
    handoffNotificationSound: setting.handoffNotificationSound ?? '',
    groupCallRingtone: setting.groupCallRingtone ?? '',
    salesNotificationSound: setting.salesNotificationSound ?? '',
    ...createFinancialDraftFields(setting),
    pluginControls: {
      enclosure: setting.kolamPlugins?.enclosure?.enabled !== false,
      taskManager: setting.kolamPlugins?.taskManager?.enabled !== false,
      layanan: setting.kolamPlugins?.layanan?.enabled !== false,
      freyer: setting.kolamPlugins?.freyer?.enabled !== false,
      kpi: setting.kolamPlugins?.kpi?.enabled !== false,
      chat: setting.kolamPlugins?.chat?.enabled !== false,
      dara: setting.kolamPlugins?.dara?.enabled !== false,
      proyek: setting.kolamPlugins?.proyek?.enabled !== false,
    },
  };
}

function createKolamPluginsUpdateBody(
  controls: Record<KolamPluginConfigKey, boolean>,
  current: KolamWebSetting['kolamPlugins'],
  chatStoreEnabled: boolean,
) {
  return {
    enclosure: {
      ...(current?.enclosure ?? {}),
      enabled: controls.enclosure,
    },
    taskManager: {
      ...(current?.taskManager ?? {}),
      enabled: controls.taskManager,
    },
    layanan: {
      ...(current?.layanan ?? {}),
      enabled: controls.layanan,
    },
    freyer: {
      ...(current?.freyer ?? {}),
      enabled: controls.freyer,
    },
    kpi: {
      ...(current?.kpi ?? {}),
      enabled: controls.kpi,
    },
    chat: {
      ...(current?.chat ?? {}),
      enabled: controls.chat,
      storeEnabled: chatStoreEnabled,
    },
    dara: {
      ...(current?.dara ?? {}),
      enabled: controls.dara,
    },
    proyek: {
      ...(current?.proyek ?? {}),
      enabled: controls.proyek,
    },
  };
}

function createPoWorkflowUpdateBody(draft: WebSettingDraft) {
  return {
    receivingRoomId: draft.poWorkflowReceivingRoomId.trim(),
    notifyOnReceive: draft.poWorkflowNotifyOnReceive,
    notifyOnCheck: draft.poWorkflowNotifyOnCheck,
    notifyOnPartial: draft.poWorkflowNotifyOnPartial,
    postProofToTeamChat: draft.poWorkflowPostProofToTeamChat,
    partialCompleteRequiresAdmin: draft.poWorkflowPartialCompleteRequiresAdmin,
    notifyReceiveUserIds: parseIdList(draft.poWorkflowNotifyReceiveUserIds),
    notifyCheckUserIds: parseIdList(draft.poWorkflowNotifyCheckUserIds),
    notifyCompleteUserIds: parseIdList(draft.poWorkflowNotifyCompleteUserIds),
  };
}

function pickPoWorkflowDraftFields(draft: WebSettingDraft) {
  return {
    poWorkflowReceivingRoomId: draft.poWorkflowReceivingRoomId,
    poWorkflowNotifyOnReceive: draft.poWorkflowNotifyOnReceive,
    poWorkflowNotifyOnCheck: draft.poWorkflowNotifyOnCheck,
    poWorkflowNotifyOnPartial: draft.poWorkflowNotifyOnPartial,
    poWorkflowPostProofToTeamChat: draft.poWorkflowPostProofToTeamChat,
    poWorkflowPartialCompleteRequiresAdmin:
      draft.poWorkflowPartialCompleteRequiresAdmin,
    poWorkflowNotifyReceiveUserIds: draft.poWorkflowNotifyReceiveUserIds,
    poWorkflowNotifyCheckUserIds: draft.poWorkflowNotifyCheckUserIds,
    poWorkflowNotifyCompleteUserIds: draft.poWorkflowNotifyCompleteUserIds,
  } satisfies Partial<WebSettingDraft>;
}

function createStaffAttendanceDraftFields(
  settings: KolamStaffAttendanceSettings,
) {
  return {
    staffAttendancePayrollCutoffDay: String(settings.payrollCutoffDay ?? 28),
    staffAttendanceWorkStartTime: settings.workStartTime ?? '08:00',
    staffAttendanceWorkEndTime: settings.workEndTime ?? '17:00',
    staffAttendanceServiceCommissionInsideHoursPct: String(
      settings.serviceCommissionInsideHoursPct ?? 0,
    ),
    staffAttendanceServiceCommissionOutsideHoursPct: String(
      settings.serviceCommissionOutsideHoursPct ?? 0,
    ),
    staffAttendanceTimezone: settings.timezone ?? 'Asia/Jakarta',
    staffAttendanceLateToleranceMinutes: String(
      settings.lateToleranceMinutes ?? 15,
    ),
    staffAttendanceLateTier2MaxMinutes: String(
      settings.lateTier2MaxMinutes ?? 120,
    ),
    staffAttendanceLateCheckInDeadlineMinutes: String(
      settings.lateCheckInDeadlineMinutes ?? 240,
    ),
    staffAttendanceLateFineTier2: String(settings.lateFineTier2 ?? 50000),
    staffAttendanceLateFineTier3: String(settings.lateFineTier3 ?? 100000),
    staffAttendanceAbsentDailyDivisor: String(
      settings.absentDailyDivisor ?? 30,
    ),
    staffAttendanceMapProvider:
      settings.attendanceMapProvider ?? 'openstreetmap',
    staffAttendanceOsmNominatimUrl: settings.osmNominatimUrl ?? '',
    staffAttendanceOsmTileUrl: settings.osmTileUrl ?? '',
    staffAttendanceGoogleMapsBrowserApiKey:
      settings.googleMapsBrowserApiKey ?? '',
    staffAttendanceRequireGps: settings.requireGps !== false,
    staffAttendanceRequireFace: settings.requireFace === true,
    staffAttendanceFaceMatchThreshold: String(
      settings.faceMatchThreshold ?? 0.72,
    ),
    staffAttendanceWorkSites: normalizeStaffAttendanceWorkSites(
      settings.workSites,
    ),
  } satisfies Partial<WebSettingDraft>;
}

function createStaffAttendanceDraftPatch(draft: WebSettingDraft) {
  return {
    staffAttendancePayrollCutoffDay: draft.staffAttendancePayrollCutoffDay,
    staffAttendanceWorkStartTime: draft.staffAttendanceWorkStartTime,
    staffAttendanceWorkEndTime: draft.staffAttendanceWorkEndTime,
    staffAttendanceServiceCommissionInsideHoursPct:
      draft.staffAttendanceServiceCommissionInsideHoursPct,
    staffAttendanceServiceCommissionOutsideHoursPct:
      draft.staffAttendanceServiceCommissionOutsideHoursPct,
    staffAttendanceTimezone: draft.staffAttendanceTimezone,
    staffAttendanceLateToleranceMinutes:
      draft.staffAttendanceLateToleranceMinutes,
    staffAttendanceLateTier2MaxMinutes:
      draft.staffAttendanceLateTier2MaxMinutes,
    staffAttendanceLateCheckInDeadlineMinutes:
      draft.staffAttendanceLateCheckInDeadlineMinutes,
    staffAttendanceLateFineTier2: draft.staffAttendanceLateFineTier2,
    staffAttendanceLateFineTier3: draft.staffAttendanceLateFineTier3,
    staffAttendanceAbsentDailyDivisor: draft.staffAttendanceAbsentDailyDivisor,
    staffAttendanceMapProvider: draft.staffAttendanceMapProvider,
    staffAttendanceOsmNominatimUrl: draft.staffAttendanceOsmNominatimUrl,
    staffAttendanceOsmTileUrl: draft.staffAttendanceOsmTileUrl,
    staffAttendanceGoogleMapsBrowserApiKey:
      draft.staffAttendanceGoogleMapsBrowserApiKey,
    staffAttendanceRequireGps: draft.staffAttendanceRequireGps,
    staffAttendanceRequireFace: draft.staffAttendanceRequireFace,
    staffAttendanceFaceMatchThreshold: draft.staffAttendanceFaceMatchThreshold,
    staffAttendanceWorkSites: draft.staffAttendanceWorkSites,
  } satisfies Partial<WebSettingDraft>;
}

function createStaffAttendanceUpdateBody(
  draft: WebSettingDraft,
): KolamStaffAttendanceSettings {
  return {
    payrollCutoffDay: clampIntegerOrFallback(
      draft.staffAttendancePayrollCutoffDay,
      28,
      1,
      31,
    ),
    workStartTime: draft.staffAttendanceWorkStartTime.trim() || '08:00',
    workEndTime: draft.staffAttendanceWorkEndTime.trim() || '17:00',
    serviceCommissionInsideHoursPct: clampNumberOrFallback(
      draft.staffAttendanceServiceCommissionInsideHoursPct,
      0,
      0,
      100,
    ),
    serviceCommissionOutsideHoursPct: clampNumberOrFallback(
      draft.staffAttendanceServiceCommissionOutsideHoursPct,
      0,
      0,
      100,
    ),
    timezone: draft.staffAttendanceTimezone.trim() || 'Asia/Jakarta',
    lateToleranceMinutes: Math.max(
      0,
      parseIntegerOrFallback(draft.staffAttendanceLateToleranceMinutes, 15),
    ),
    lateTier2MaxMinutes: Math.max(
      0,
      parseIntegerOrFallback(draft.staffAttendanceLateTier2MaxMinutes, 120),
    ),
    lateCheckInDeadlineMinutes: Math.max(
      0,
      parseIntegerOrFallback(
        draft.staffAttendanceLateCheckInDeadlineMinutes,
        240,
      ),
    ),
    lateFineTier2: Math.max(
      0,
      parseIntegerOrFallback(draft.staffAttendanceLateFineTier2, 50000),
    ),
    lateFineTier3: Math.max(
      0,
      parseIntegerOrFallback(draft.staffAttendanceLateFineTier3, 100000),
    ),
    absentDailyDivisor: Math.max(
      1,
      parseIntegerOrFallback(draft.staffAttendanceAbsentDailyDivisor, 30),
    ),
    attendanceMapProvider:
      draft.staffAttendanceMapProvider === 'google'
        ? 'google'
        : 'openstreetmap',
    osmNominatimUrl: draft.staffAttendanceOsmNominatimUrl.trim(),
    osmTileUrl: draft.staffAttendanceOsmTileUrl.trim(),
    googleMapsBrowserApiKey:
      draft.staffAttendanceGoogleMapsBrowserApiKey.trim(),
    requireGps: draft.staffAttendanceRequireGps,
    requireFace: draft.staffAttendanceRequireFace,
    faceMatchThreshold: clampNumberOrFallback(
      draft.staffAttendanceFaceMatchThreshold,
      0.72,
      0.5,
      0.99,
    ),
    workSites: normalizeStaffAttendanceWorkSites(
      draft.staffAttendanceWorkSites,
    ),
  };
}

function createFinancialSummaryRows(
  setting: KolamWebSetting | null,
  methods: KolamPaymentMethod[],
): SettingsFinancialSummaryRow[] {
  const overtime = setting?.overtimeSettings ?? {};
  const commission = setting?.enclosureSaleCommission ?? {};
  const activeMethods = methods.filter(method => method.isActive);
  const inactiveMethods = methods.filter(method => !method.isActive);

  return [
    {
      id: 'payment-methods',
      label: 'Metode pembayaran',
      value: methods.length
        ? `${activeMethods.length}/${methods.length} aktif`
        : 'Belum dimuat',
      detail: methods.length
        ? methods
            .slice(0, 5)
            .map(method => `${method.name} - ${method.wallet?.name ?? '-'}`)
            .join(' | ')
        : 'Read-only dari endpoint payment method native.',
    },
    {
      id: 'payment-methods-inactive',
      label: 'Metode nonaktif',
      value: String(inactiveMethods.length),
      detail: inactiveMethods.length
        ? inactiveMethods.map(method => method.name).join(' | ')
        : 'Tidak ada metode nonaktif dalam cache native.',
    },
    {
      id: 'tax-sale-prices',
      label: 'Harga jual include PPN',
      value: formatEnabled(setting?.salePricesIncludeTax !== false),
      detail:
        'Field WebSetting salePricesIncludeTax untuk estimasi faktur POS/web.',
    },
    {
      id: 'tax-commission-pph21',
      label: 'PPh 21 komisi',
      value: formatEnabled(setting?.commissionPph21Enabled !== false),
      detail:
        'Field WebSetting commissionPph21Enabled untuk accrue komisi staff.',
    },
    {
      id: 'overtime-mode',
      label: 'Overtime calculation',
      value: overtime.calculationMode ?? 'per_hour',
      detail: `Rate/hour ${formatNumber(
        overtime.ratePerHour,
      )} | rate/day ${formatNumber(overtime.ratePerDay)}`,
    },
    {
      id: 'overtime-policy',
      label: 'Overtime policy',
      value:
        overtime.useSalaryDerivedRate === false
          ? 'Manual rate'
          : 'Salary derived',
      detail: `Default hours ${formatNumber(
        overtime.defaultHoursPerRequest ?? 3,
      )} | cutoff ${overtime.midnightCutoff ?? '23:59'} | store close ${
        overtime.useStoreCloseForPerDay === false ? 'off' : 'on'
      }`,
    },
    {
      id: 'enclosure-sale-commission',
      label: 'Komisi penjualan kandang',
      value: formatEnabled(commission.enabled === true),
      detail: `${commission.type ?? 'percentage'} ${formatNumber(
        commission.value,
      )}`,
    },
  ];
}

function createFinancialSectionVisibility(
  context: SettingsTabVisibilityContext | null | undefined,
): SettingsFinancialSectionVisibility {
  if (context === undefined) {
    return {
      paymentMethods: true,
      taxProfile: true,
      overtime: true,
      enclosureCommission: true,
      taxEdit: false,
      any: true,
    };
  }

  const paymentMethods = hasSettingsFinancialSectionPermission(
    context,
    'payment-methods',
  );
  const taxProfile = hasSettingsFinancialSectionPermission(
    context,
    'tax-profile',
  );
  const overtime = hasSettingsFinancialSectionPermission(context, 'overtime');
  const enclosureCommission = hasSettingsFinancialSectionPermission(
    context,
    'enclosure-commission',
  );

  return {
    paymentMethods,
    taxProfile,
    overtime,
    enclosureCommission,
    taxEdit:
      hasSettingsPermission(context, 'tax', 'draft') ||
      hasSettingsPermission(context, 'tax', 'approve') ||
      hasSettingsPermission(context, 'tax', '*') ||
      hasSettingsPermission(context, '*', '*'),
    any: paymentMethods || taxProfile || overtime || enclosureCommission,
  };
}

function createPaymentMethodListParams(
  filters: SettingsPaymentMethodFilters,
): KolamPaymentMethodListParams {
  return {
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    isAvailableOnWebstore:
      filters.isAvailableOnWebstore === ''
        ? ''
        : filters.isAvailableOnWebstore === 'true',
  };
}

function createPaymentMethodDraft(
  method: KolamPaymentMethod,
): SettingsPaymentMethodDraft {
  return {
    id: method.id,
    name: method.name,
    type: method.type,
    provider: method.provider,
    wallet: method.wallet?.id ?? '',
    accountNumber: method.accountNumber,
    accountName: method.accountName,
    notes: method.notes,
    isActive: method.isActive,
    isAvailableOnWebstore: method.isAvailableOnWebstore,
    requireSaleProof: method.requireSaleProof,
    costsText: formatPaymentCostsText(method.costs),
  };
}

function createPaymentMethodSaveBody(
  draft: SettingsPaymentMethodDraft,
): KolamPaymentMethodSaveBody {
  if (!draft.wallet.trim()) {
    throw new Error('Wallet wajib dipilih.');
  }

  return {
    name: draft.name.trim(),
    type: draft.type,
    provider: draft.provider.trim(),
    wallet: draft.wallet.trim(),
    accountNumber: draft.accountNumber.trim(),
    accountName: draft.accountName.trim(),
    notes: cleanOptionalString(draft.notes),
    isActive: draft.isActive,
    isAvailableOnWebstore: draft.isAvailableOnWebstore,
    requireSaleProof: draft.requireSaleProof,
    costs: parsePaymentCostsText(draft.costsText),
  };
}

function formatPaymentCostsText(costs: KolamPaymentMethod['costs']) {
  return costs
    .map(cost => `${cost.name}|${cost.type}|${cost.amount}`)
    .join('\n');
}

function parsePaymentCostsText(
  value: string,
): KolamPaymentMethodSaveBody['costs'] {
  return value
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [name = '', type = 'percentage', amount = '0'] = line.split('|');
      const costType = type.trim() === 'fixed' ? 'fixed' : 'percentage';
      return {
        name: name.trim(),
        type: costType,
        amount: Math.max(0, Number(amount) || 0),
      };
    });
}

function createTaxCompanyProfileSaveBody(profile: KolamTaxCompanyProfile) {
  const { registeredAddress, completeness, ...body } = profile;
  void registeredAddress;
  void completeness;
  return body;
}

function createFinancialDraftFields(setting: KolamWebSetting) {
  const overtime = setting.overtimeSettings ?? {};
  const commission = setting.enclosureSaleCommission ?? {};

  return {
    salePricesIncludeTax: setting.salePricesIncludeTax !== false,
    commissionPph21Enabled: setting.commissionPph21Enabled !== false,
    overtimeCalculationMode:
      overtime.calculationMode === 'per_day' ? 'per_day' : 'per_hour',
    overtimeUseSalaryDerivedRate: overtime.useSalaryDerivedRate !== false,
    overtimeRatePerHour: String(overtime.ratePerHour ?? 0),
    overtimeRatePerDay: String(overtime.ratePerDay ?? 0),
    overtimeDefaultHoursPerRequest: String(
      clampNumber(overtime.defaultHoursPerRequest ?? 3, 1, 12),
    ),
    overtimeMidnightCutoff: overtime.midnightCutoff ?? '23:59',
    overtimeUseStoreCloseForPerDay: overtime.useStoreCloseForPerDay !== false,
    enclosureSaleCommissionEnabled: commission.enabled === true,
    enclosureSaleCommissionType:
      commission.type === 'fixed' ? 'fixed' : 'percentage',
    enclosureSaleCommissionValue: String(commission.value ?? 0),
  } satisfies Partial<WebSettingDraft>;
}

function createOvertimeSettingsUpdateBody(draft: WebSettingDraft) {
  return {
    calculationMode: draft.overtimeCalculationMode,
    useSalaryDerivedRate: draft.overtimeUseSalaryDerivedRate,
    ratePerHour: Math.max(0, Number(draft.overtimeRatePerHour) || 0),
    ratePerDay: Math.max(0, Number(draft.overtimeRatePerDay) || 0),
    defaultHoursPerRequest: clampNumber(
      Number(draft.overtimeDefaultHoursPerRequest) || 3,
      1,
      12,
    ),
    midnightCutoff: draft.overtimeMidnightCutoff.trim() || '23:59',
    useStoreCloseForPerDay: draft.overtimeUseStoreCloseForPerDay,
  } satisfies KolamWebSetting['overtimeSettings'];
}

function createEnclosureSaleCommissionUpdateBody(draft: WebSettingDraft) {
  return {
    enabled: draft.enclosureSaleCommissionEnabled,
    type: draft.enclosureSaleCommissionType,
    value: Math.max(0, Number(draft.enclosureSaleCommissionValue) || 0),
  } satisfies KolamWebSetting['enclosureSaleCommission'];
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, value));
}

function getFinancialErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message || 'Gagal memproses pengaturan Finansial.';
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Gagal memproses pengaturan Finansial.';
}

function normalizeSitemapConfig(
  config?: KolamSitemapConfig,
): KolamSitemapConfig {
  return {
    ...defaultSitemapConfig,
    ...(config ?? {}),
    sections: sitemapSectionKeys.reduce((sections, key) => {
      sections[key] = {
        ...(defaultSitemapConfig.sections?.[key] ?? {}),
        ...(config?.sections?.[key] ?? {}),
      };
      return sections;
    }, {} as Record<KolamSitemapSectionKey, NonNullable<KolamSitemapConfig['sections']>[KolamSitemapSectionKey]>),
    staticPages: config?.staticPages?.length
      ? config.staticPages
      : defaultSitemapConfig.staticPages,
    customUrls: config?.customUrls ?? defaultSitemapConfig.customUrls,
    excludedSlugs: sitemapSectionKeys.reduce((slugs, key) => {
      slugs[key] = config?.excludedSlugs?.[key] ?? [];
      return slugs;
    }, {} as Record<KolamSitemapSectionKey, string[]>),
  };
}

function createSitemapConfigUpdateBody(
  draft: KolamSitemapConfig,
  customUrlsText: string,
  excludedSlugsText: Partial<Record<KolamSitemapSectionKey, string>>,
): KolamSitemapConfig {
  const normalized = normalizeSitemapConfig(draft);

  return {
    ...normalized,
    staticPages: sanitizeSitemapStaticPages(normalized.staticPages ?? []),
    customUrls: sanitizeSitemapCustomUrls(
      normalized.customUrls?.length
        ? normalized.customUrls
        : parseSitemapCustomUrlsText(customUrlsText),
    ),
    excludedSlugs: sitemapSectionKeys.reduce((slugs, key) => {
      slugs[key] = parseLooseList(excludedSlugsText[key] ?? '');
      return slugs;
    }, {} as Record<KolamSitemapSectionKey, string[]>),
  };
}

function sanitizeSitemapStaticPages(
  rows: NonNullable<KolamSitemapConfig['staticPages']>,
) {
  return rows
    .filter(item => item.path.trim().length > 0)
    .map(({_id: _id, ...item}) => ({
      ...item,
      path: item.path.trim(),
      enabled: item.enabled !== false,
      priority: clampSitemapPriority(item.priority ?? 0.5),
      changeFrequency: normalizeSitemapChangeFrequency(
        item.changeFrequency ?? 'monthly',
      ),
    }));
}

function sanitizeSitemapCustomUrls(
  rows: NonNullable<KolamSitemapConfig['customUrls']>,
) {
  return rows
    .filter(item => item.path.trim().length > 0)
    .map(({_id: _id, ...item}) => ({
      ...item,
      path: item.path.trim(),
      priority: clampSitemapPriority(item.priority ?? 0.5),
      changeFrequency: normalizeSitemapChangeFrequency(
        item.changeFrequency ?? 'weekly',
      ),
    }));
}

function formatSitemapCustomUrlsText(config: KolamSitemapConfig) {
  return (config.customUrls ?? [])
    .map(
      item =>
        `${item.path}|${formatNumber(item.priority ?? 0.5)}|${
          item.changeFrequency ?? 'weekly'
        }`,
    )
    .join('\n');
}

function parseSitemapCustomUrlsText(text: string) {
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [path = '', priority = '0.5', frequency = 'weekly'] =
        line.split('|');
      return {
        path: path.trim(),
        priority: parseNumberOrFallback(priority, 0.5),
        changeFrequency: normalizeSitemapChangeFrequency(frequency),
      };
    })
    .filter(item => item.path);
}

function formatSitemapExcludedSlugsText(config: KolamSitemapConfig) {
  return sitemapSectionKeys.reduce((result, key) => {
    result[key] = (config.excludedSlugs?.[key] ?? []).join('\n');
    return result;
  }, {} as Record<KolamSitemapSectionKey, string>);
}

function normalizeSitemapChangeFrequency(value: string) {
  const clean = value.trim() as KolamSitemapChangeFrequency;
  return sitemapChangeFrequencies.includes(clean) ? clean : 'weekly';
}

function clampSitemapPriority(value: number) {
  if (!Number.isFinite(value)) {
    return 0.5;
  }

  return Math.max(0, Math.min(1, Number(value.toFixed(1))));
}

function parseLooseList(value: string) {
  return value
    .split(/[\n,]/)
    .map(item => item.trim())
    .filter(Boolean);
}

function createRegionSyncSummaryRows(
  stats: KolamRegionStats | null,
): RegionSyncSummaryRow[] {
  return regionLevels.map(level => ({
    id: level,
    label: getRegionLevelLabel(level),
    value: formatNumber(stats?.counts[level]?.count ?? 0),
    detail: `${formatRegionStatsUpdatedAt(
      stats?.counts[level]?.latestUpdatedAt,
    )} | Postal codes ${formatNumber(
      stats?.counts[level]?.withPostalCode ?? 0,
    )}`,
  }));
}

function formatRegionStatsUpdatedAt(value?: string | null) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function createRegionHierarchyQuery({
  selectedDistrict,
  selectedProvince,
  selectedRegency,
}: {
  selectedDistrict: string;
  selectedProvince: string;
  selectedRegency: string;
}): {
  level: KolamRegionLevel;
  parentCode: string;
} {
  if (selectedDistrict) {
    return {level: 'village', parentCode: selectedDistrict};
  }

  if (selectedRegency) {
    return {level: 'district', parentCode: selectedRegency};
  }

  if (selectedProvince) {
    return {level: 'regency', parentCode: selectedProvince};
  }

  return {level: 'province', parentCode: ''};
}

async function fetchKolamRegionHierarchy({
  selectedDistrict,
  selectedProvince,
  selectedRegency,
}: {
  selectedDistrict: string;
  selectedProvince: string;
  selectedRegency: string;
}) {
  const [provinceResult, regencyResult, districtResult, villageResult, statsResult] =
    await Promise.allSettled([
      getKolamRegions({level: 'province', limit: 2000}),
      selectedProvince
        ? getKolamRegions({
            level: 'regency',
            parentCode: selectedProvince,
            limit: 2000,
          })
        : Promise.resolve([]),
      selectedRegency
        ? getKolamRegions({
            level: 'district',
            parentCode: selectedRegency,
            limit: 2000,
          })
        : Promise.resolve([]),
      selectedDistrict
        ? getKolamRegions({
            level: 'village',
            parentCode: selectedDistrict,
            limit: 2000,
          })
        : Promise.resolve([]),
      getKolamRegionStats(),
    ]);

  if (provinceResult.status !== 'fulfilled') {
    throw provinceResult.reason;
  }

  if (selectedProvince && regencyResult.status !== 'fulfilled') {
    throw regencyResult.reason;
  }

  if (selectedRegency && districtResult.status !== 'fulfilled') {
    throw districtResult.reason;
  }

  if (selectedDistrict && villageResult.status !== 'fulfilled') {
    throw villageResult.reason;
  }

  return {
    provinces: provinceResult.value,
    regencies: regencyResult.status === 'fulfilled' ? regencyResult.value : [],
    districts:
      districtResult.status === 'fulfilled' ? districtResult.value : [],
    villages: villageResult.status === 'fulfilled' ? villageResult.value : [],
    stats: statsResult.status === 'fulfilled' ? statsResult.value : null,
  };
}

export function getRegionSyncParentSelectionCode(
  scope: KolamRegionSyncScope,
  {
    selectedDistrict,
    selectedProvince,
    selectedRegency,
  }: {
    selectedDistrict: string;
    selectedProvince: string;
    selectedRegency: string;
  },
) {
  if (scope === 'regencies') {
    return selectedProvince;
  }

  if (scope === 'districts') {
    return selectedRegency;
  }

  if (scope === 'villages') {
    return selectedDistrict;
  }

  return '';
}

function getRegionSyncMissingParentMessage(
  scope: KolamRegionSyncScope,
  parentCode: string,
) {
  if (parentCode) {
    return '';
  }

  if (scope === 'regencies') {
    return 'Pilih provinsi sebelum sync kota / kabupaten.';
  }

  if (scope === 'districts') {
    return 'Pilih kota / kabupaten sebelum sync kecamatan.';
  }

  if (scope === 'villages') {
    return 'Pilih kecamatan sebelum sync kelurahan.';
  }

  return '';
}

function createWebContentLauncherItems({
  blogRows,
  blogTopicRows,
  blogTotal,
  blogTopicTotal,
  marketplaceLandingOverview,
}: {
  blogRows: KolamBlog[];
  blogTopicRows: KolamBlogTopic[];
  blogTotal: number;
  blogTopicTotal: number;
  marketplaceLandingOverview: MarketplaceLandingOverview;
}): WebContentLauncherItem[] {
  return [
    {
      id: 'marketplace',
      label: 'Landing Marketplace',
      value:
        marketplaceLandingOverview.status === 'live'
          ? 'Live'
          : marketplaceLandingOverview.status,
      detail: `${marketplaceLandingOverview.heroSlides.length} hero, ${marketplaceLandingOverview.categoryBanners.length} category banners, ${marketplaceLandingOverview.customerNotices.length} notices`,
    },
    {
      id: 'blog',
      label: 'Blog',
      value: formatNumber(blogTotal || blogRows.length),
      detail: blogRows.length
        ? blogRows
            .slice(0, 3)
            .map(row => `${row.title} (${row.status})`)
            .join(' | ')
        : 'Belum ada blog dalam cache native.',
    },
    {
      id: 'blog-topics',
      label: 'Blog Topics',
      value: formatNumber(blogTopicTotal || blogTopicRows.length),
      detail: blogTopicRows.length
        ? blogTopicRows
            .slice(0, 5)
            .map(row => `${row.name} (${row.status ?? 'active'})`)
            .join(' | ')
        : 'Belum ada topic dalam cache native.',
    },
  ];
}

function createMarketplaceLandingTabItems(
  overview: MarketplaceLandingOverview,
): MarketplaceLandingTabItem[] {
  const featured = overview.marketplaceContent.featuredCollections ?? [];

  return [
    {
      id: 'hero',
      label: 'Hero Slides',
      value: formatNumber(overview.heroSlides.length),
    },
    {
      id: 'featured',
      label: 'Featured Collections',
      value: formatNumber(featured.length),
    },
    {
      id: 'category',
      label: 'Category Banners',
      value: formatNumber(overview.categoryBanners.length),
    },
    {
      id: 'cta',
      label: 'CTA Section',
      value: overview.ctaSection?.isActive === false ? 'Off' : 'On',
    },
    {
      id: 'youtube',
      label: 'YouTube Section',
      value: overview.youtubeSection?.isActive === false ? 'Off' : 'On',
    },
    {
      id: 'announcement',
      label: 'Announcement Banner',
      value: formatNumber(overview.announcementBanners.length),
    },
    {
      id: 'notices',
      label: 'Customer Notices',
      value: formatNumber(overview.customerNotices.length),
    },
  ];
}

function createKpiSettingsDraft(settings: KolamKpiSettings): KpiSettingsDraft {
  const base = settings.basePoints ?? {};
  const onTime = settings.onTime ?? {};
  const qc = settings.qc ?? {};
  const proof = settings.proof ?? {};
  const noProof = settings.noProof ?? {};
  const noShow = settings.noShow ?? {};
  const chat = settings.chat ?? {};
  const complaint = settings.complaint ?? {};
  const attendance = settings.attendance ?? {};

  return {
    ...emptyKpiSettingsDraft,
    taskBaseLow: String(base.low ?? emptyKpiSettingsDraft.taskBaseLow),
    taskBaseMedium: String(base.medium ?? emptyKpiSettingsDraft.taskBaseMedium),
    taskBaseHigh: String(base.high ?? emptyKpiSettingsDraft.taskBaseHigh),
    taskBaseUrgent: String(base.urgent ?? emptyKpiSettingsDraft.taskBaseUrgent),
    assistedByRatio: String(
      settings.assistedByRatio ?? emptyKpiSettingsDraft.assistedByRatio,
    ),
    onTimeBeforeDeadline: String(
      onTime.beforeDeadline ?? emptyKpiSettingsDraft.onTimeBeforeDeadline,
    ),
    onTimeFarEarlyPct: String(
      onTime.farEarlyPct ?? emptyKpiSettingsDraft.onTimeFarEarlyPct,
    ),
    onTimeFarEarlyBonus: String(
      onTime.farEarlyBonus ?? emptyKpiSettingsDraft.onTimeFarEarlyBonus,
    ),
    onTimeLate: String(onTime.late ?? emptyKpiSettingsDraft.onTimeLate),
    qcPassFirst: String(qc.passFirst ?? emptyKpiSettingsDraft.qcPassFirst),
    qcRevision1: String(qc.revision1 ?? emptyKpiSettingsDraft.qcRevision1),
    qcRevisionMany: String(
      qc.revisionMany ?? emptyKpiSettingsDraft.qcRevisionMany,
    ),
    proofComplete: String(
      proof.complete ?? emptyKpiSettingsDraft.proofComplete,
    ),
    noProofMissing: String(
      noProof.missing ?? emptyKpiSettingsDraft.noProofMissing,
    ),
    noShowReassignOrCancel: String(
      noShow.reassignOrCancel ?? emptyKpiSettingsDraft.noShowReassignOrCancel,
    ),
    chatFastReplyMinutes: String(
      chat.fastReplyMinutes ?? emptyKpiSettingsDraft.chatFastReplyMinutes,
    ),
    chatFastReplyPoints: String(
      chat.fastReplyPoints ?? emptyKpiSettingsDraft.chatFastReplyPoints,
    ),
    chatLateReplyMinutes: String(
      chat.lateReplyMinutes ?? emptyKpiSettingsDraft.chatLateReplyMinutes,
    ),
    chatLateReplyPoints: String(
      chat.lateReplyPoints ?? emptyKpiSettingsDraft.chatLateReplyPoints,
    ),
    chatNoReplyPoints: String(
      chat.noReplyPoints ?? emptyKpiSettingsDraft.chatNoReplyPoints,
    ),
    complaintLight: String(
      complaint.light ?? emptyKpiSettingsDraft.complaintLight,
    ),
    complaintValid: String(
      complaint.valid ?? emptyKpiSettingsDraft.complaintValid,
    ),
    complaintSevere: String(
      complaint.severe ?? emptyKpiSettingsDraft.complaintSevere,
    ),
    attendanceOutsideRadius: String(
      attendance.outsideRadius ?? emptyKpiSettingsDraft.attendanceOutsideRadius,
    ),
    levelsText: formatKpiLevelsText(settings.levels),
    rewardsText: formatKpiRewardsText(settings.rewards),
    enabledRules: {
      ...emptyKpiSettingsDraft.enabledRules,
      ...(settings.enabledRules ?? {}),
    },
  };
}

function createKpiSettingsUpdateBody(
  draft: KpiSettingsDraft,
  current: KolamKpiSettings | null,
): KolamKpiSettings {
  return {
    ...(current ?? {}),
    basePoints: {
      low: parseNumberOrFallback(draft.taskBaseLow, 5),
      medium: parseNumberOrFallback(draft.taskBaseMedium, 10),
      high: parseNumberOrFallback(draft.taskBaseHigh, 20),
      urgent: parseNumberOrFallback(draft.taskBaseUrgent, 30),
    },
    assistedByRatio: parseNumberOrFallback(draft.assistedByRatio, 0.5),
    onTime: {
      beforeDeadline: parseNumberOrFallback(draft.onTimeBeforeDeadline, 5),
      farEarlyPct: parseNumberOrFallback(draft.onTimeFarEarlyPct, 50),
      farEarlyBonus: parseNumberOrFallback(draft.onTimeFarEarlyBonus, 10),
      late: parseNumberOrFallback(draft.onTimeLate, -5),
    },
    qc: {
      passFirst: parseNumberOrFallback(draft.qcPassFirst, 10),
      revision1: parseNumberOrFallback(draft.qcRevision1, 0),
      revisionMany: parseNumberOrFallback(draft.qcRevisionMany, -5),
    },
    proof: { complete: parseNumberOrFallback(draft.proofComplete, 5) },
    noProof: { missing: parseNumberOrFallback(draft.noProofMissing, -10) },
    noShow: {
      reassignOrCancel: parseNumberOrFallback(
        draft.noShowReassignOrCancel,
        -25,
      ),
    },
    chat: {
      fastReplyMinutes: parseNumberOrFallback(draft.chatFastReplyMinutes, 5),
      fastReplyPoints: parseNumberOrFallback(draft.chatFastReplyPoints, 5),
      lateReplyMinutes: parseNumberOrFallback(draft.chatLateReplyMinutes, 14),
      lateReplyPoints: parseNumberOrFallback(draft.chatLateReplyPoints, -10),
      noReplyPoints: parseNumberOrFallback(draft.chatNoReplyPoints, -15),
    },
    complaint: {
      light: parseNumberOrFallback(draft.complaintLight, -10),
      valid: parseNumberOrFallback(draft.complaintValid, -25),
      severe: parseNumberOrFallback(draft.complaintSevere, -50),
    },
    attendance: {
      outsideRadius: parseNumberOrFallback(draft.attendanceOutsideRadius, -20),
    },
    levels: parseKpiLevelsText(draft.levelsText),
    rewards: parseKpiRewardsText(draft.rewardsText),
    enabledRules: draft.enabledRules,
  };
}

function createKpiSettingsSummaryRows(
  settings: KolamKpiSettings | null,
  preview: KolamKpiWeeklyAnnouncePreview | null,
): KpiSettingsSummaryRow[] {
  return [
    {
      id: 'task-points',
      label: 'Poin task',
      value: settings
        ? `${settings.basePoints?.low ?? 0}/${
            settings.basePoints?.medium ?? 0
          }/${settings.basePoints?.high ?? 0}/${
            settings.basePoints?.urgent ?? 0
          }`
        : 'Belum dimuat',
      detail: 'Rendah / sedang / tinggi / urgent.',
    },
    {
      id: 'chat-sla',
      label: 'Chat SLA',
      value: settings
        ? `${settings.chat?.fastReplyMinutes ?? 0}m / ${
            settings.chat?.lateReplyMinutes ?? 0
          }m`
        : 'Belum dimuat',
      detail: `Cepat ${settings?.chat?.fastReplyPoints ?? 0}, telat ${
        settings?.chat?.lateReplyPoints ?? 0
      }, tidak dibalas ${settings?.chat?.noReplyPoints ?? 0}.`,
    },
    {
      id: 'complaint',
      label: 'Poin komplain',
      value: settings
        ? `${settings.complaint?.light ?? 0}/${
            settings.complaint?.valid ?? 0
          }/${settings.complaint?.severe ?? 0}`
        : 'Belum dimuat',
      detail: 'Ringan / valid / berat.',
    },
    {
      id: 'attendance',
      label: 'Absensi',
      value: String(settings?.attendance?.outsideRadius ?? 0),
      detail: 'Penalti absen di luar radius.',
    },
    {
      id: 'monthly-level',
      label: 'Level bulanan',
      value: `${settings?.levels?.length ?? 0} level`,
      detail:
        settings?.levels
          ?.map(level => `${level.label} ${level.min}-${level.max ?? '∞'}`)
          .join(' | ') ?? 'Belum dimuat',
    },
    {
      id: 'weekly-preview',
      label: 'Preview pengumuman DARA',
      value: preview?.weekKey ?? 'Belum dimuat',
      detail: preview?.body?.replace(/\s+/g, ' ').slice(0, 180) ?? '-',
    },
  ];
}

function formatKpiLevelsText(levels: KolamKpiSettings['levels']) {
  return (levels ?? [])
    .map(level => `${level.id}|${level.label}|${level.min}|${level.max ?? ''}`)
    .join('\n');
}

function parseKpiLevelsText(text: string) {
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [id = '', label = '', min = '0', max = ''] = line.split('|');
      return {
        id: id.trim(),
        label: label.trim() || id.trim(),
        min: parseNumberOrFallback(min, 0),
        max: max.trim() ? parseNumberOrFallback(max, 0) : null,
      };
    })
    .filter(level => level.id);
}

function formatKpiRewardsText(rewards: KolamKpiSettings['rewards']) {
  return (rewards ?? [])
    .map(row => `${String(row.levelId ?? '')}|${String(row.amountRp ?? 0)}`)
    .join('\n');
}

function parseKpiRewardsText(text: string) {
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [levelId = '', amountRp = '0'] = line.split('|');
      return {
        levelId: levelId.trim(),
        amountRp: parseNumberOrFallback(amountRp, 0),
      };
    })
    .filter(row => row.levelId);
}

function cleanOptionalString(value: string) {
  const trimmed = value.trim();
  return trimmed || undefined;
}

function isConfiguredSecretDraft(value: string) {
  return Boolean(value.trim()) || value === maskedSecretPlaceholder;
}

function createSecretUpdateField(key: string, value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === maskedSecretPlaceholder) {
    return {};
  }

  return { [key]: trimmed };
}

function createShippingOriginAddressUpdateBody(draft: WebSettingDraft) {
  return {
    addressLine1: draft.originAddressLine1.trim(),
    city: draft.originCity.trim(),
    province: draft.originProvince.trim(),
    postalCode: draft.originPostalCode.trim(),
    latitude: parseOptionalNumber(draft.originLatitude),
    longitude: parseOptionalNumber(draft.originLongitude),
  };
}

function createStoreOperatingHoursUpdateBody(draft: WebSettingDraft) {
  return {
    enabled: draft.storeOperatingHoursEnabled,
    daraReplyWhenClosed: draft.storeOperatingHoursDaraReplyWhenClosed,
    timezone:
      draft.storeOperatingHoursTimezone.trim() ||
      emptyWebSettingDraft.storeOperatingHoursTimezone,
    weeklyHours: {
      monday: createStoreOperatingDayHours(
        draft.storeHoursMondayOpen,
        draft.storeHoursMondayOpenAt,
        draft.storeHoursMondayCloseAt,
      ),
      tuesday: createStoreOperatingDayHours(
        draft.storeHoursTuesdayOpen,
        draft.storeHoursTuesdayOpenAt,
        draft.storeHoursTuesdayCloseAt,
      ),
      wednesday: createStoreOperatingDayHours(
        draft.storeHoursWednesdayOpen,
        draft.storeHoursWednesdayOpenAt,
        draft.storeHoursWednesdayCloseAt,
      ),
      thursday: createStoreOperatingDayHours(
        draft.storeHoursThursdayOpen,
        draft.storeHoursThursdayOpenAt,
        draft.storeHoursThursdayCloseAt,
      ),
      friday: createStoreOperatingDayHours(
        draft.storeHoursFridayOpen,
        draft.storeHoursFridayOpenAt,
        draft.storeHoursFridayCloseAt,
      ),
      saturday: createStoreOperatingDayHours(
        draft.storeHoursSaturdayOpen,
        draft.storeHoursSaturdayOpenAt,
        draft.storeHoursSaturdayCloseAt,
      ),
      sunday: createStoreOperatingDayHours(
        draft.storeHoursSundayOpen,
        draft.storeHoursSundayOpenAt,
        draft.storeHoursSundayCloseAt,
      ),
    },
    specialClosures: parseStoreSpecialClosures(
      draft.storeOperatingHoursSpecialClosuresText,
    ),
    messages: {
      beforeOpen: cleanOptionalString(
        draft.storeOperatingHoursMessageBeforeOpen,
      ),
      afterClose: cleanOptionalString(
        draft.storeOperatingHoursMessageAfterClose,
      ),
      weeklyClosed: cleanOptionalString(
        draft.storeOperatingHoursMessageWeeklyClosed,
      ),
      specialClosed: cleanOptionalString(
        draft.storeOperatingHoursMessageSpecialClosed,
      ),
      shippingDisclaimer: cleanOptionalString(
        draft.storeOperatingHoursMessageShippingDisclaimer,
      ),
    },
  } satisfies KolamWebSetting['storeOperatingHours'];
}

function serializeStoreSpecialClosures(
  closures: KolamStoreOperatingHours['specialClosures'],
) {
  if (!Array.isArray(closures)) {
    return '';
  }

  return closures
    .map(closure =>
      [closure?.date ?? '', closure?.label ?? '']
        .map(value => String(value).trim())
        .filter(Boolean)
        .join('|'),
    )
    .filter(Boolean)
    .join('\n');
}

function parseStoreSpecialClosures(value: string) {
  return value
    .split(/\r?\n/)
    .map(line => {
      const [date = '', label = ''] = line.split('|');
      const trimmedDate = date.trim();

      if (!trimmedDate) {
        return null;
      }

      return {
        date: trimmedDate,
        label: label.trim() || undefined,
        allDay: true,
      };
    })
    .filter(
      (
        closure,
      ): closure is { date: string; label: string | undefined; allDay: true } =>
        closure !== null,
    );
}

function createStoreOperatingDayHours(
  open: boolean,
  openAt: string,
  closeAt: string,
) {
  return {
    open,
    openAt: openAt.trim() || '09:00',
    closeAt: closeAt.trim() || '21:00',
  };
}

function parseOptionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function isInvalidOptionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  return !Number.isFinite(Number(trimmed));
}

function parseMacAddressList(value: string) {
  return parseIdList(value);
}

function parseIdList(value: string) {
  return value
    .split(/[\n,]/)
    .map(item => item.trim())
    .filter(Boolean);
}

function normalizeStaffAttendanceWorkSites(
  sites: KolamStaffAttendanceWorkSite[] | undefined,
) {
  return (sites ?? [])
    .map<KolamStaffAttendanceWorkSite | null>(site => {
      const name = site.name?.trim() ?? '';
      const latitude =
        typeof site.latitude === 'number' && Number.isFinite(site.latitude)
          ? site.latitude
          : null;
      const longitude =
        typeof site.longitude === 'number' && Number.isFinite(site.longitude)
          ? site.longitude
          : null;

      if (!name || latitude === null || longitude === null) {
        return null;
      }

      const radius =
        typeof site.radiusMeters === 'number' &&
        Number.isFinite(site.radiusMeters)
          ? Math.max(20, site.radiusMeters)
          : 150;

      return {
        ...(site._id ? { _id: site._id } : {}),
        name,
        latitude,
        longitude,
        radiusMeters: radius,
        active: site.active !== false,
      };
    })
    .filter((site): site is KolamStaffAttendanceWorkSite => Boolean(site));
}

function parseIntegerOrFallback(value: string, fallback: number) {
  const parsed = Number.parseInt(value.trim(), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clampIntegerOrFallback(
  value: string,
  fallback: number,
  min: number,
  max: number,
) {
  const parsed = parseIntegerOrFallback(value, fallback);
  return Math.min(max, Math.max(min, parsed));
}

function parseNumberOrFallback(value: string, fallback: number) {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clampNumberOrFallback(
  value: string,
  fallback: number,
  min: number,
  max: number,
) {
  return clampNumber(parseNumberOrFallback(value, fallback), min, max);
}

function formatEnabled(value: boolean) {
  return value ? 'Aktif' : 'Nonaktif';
}

function formatNumber(value: number | undefined) {
  return Number.isFinite(value) ? String(value) : '0';
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

function createSmtpUpdateBody(draft: WebSettingDraft) {
  const user = draft.smtpUser.trim();
  const smtp: KolamWebSetting['smtp'] = {
    host: draft.smtpHost.trim(),
    port: parseIntegerOrFallback(draft.smtpPort, 465),
    user,
    fromEmail: draft.smtpFromEmail.trim() || user,
    fromName: draft.smtpFromName.trim() || 'Kolam',
    secure: draft.smtpSecure,
  };

  if (draft.smtpPass.trim() && draft.smtpPass !== maskedSecretPlaceholder) {
    smtp.pass = draft.smtpPass;
  }

  return smtp;
}

function createFirebaseUpdateBody(draft: WebSettingDraft) {
  const firebase: KolamWebSetting['firebase'] = {
    enabled: draft.firebaseEnabled,
    projectId: draft.firebaseProjectId.trim(),
    clientEmail: draft.firebaseClientEmail.trim(),
  };

  if (
    draft.firebasePrivateKey.trim() &&
    draft.firebasePrivateKey !== maskedSecretPlaceholder
  ) {
    firebase.privateKey = draft.firebasePrivateKey;
  }

  return firebase;
}

function isAllowedNotificationSoundFile(localUri: string, extension?: string) {
  const inferredExtension =
    extension?.toLowerCase().replace(/^\./, '') ??
    localUri
      .split(/[./\\]/)
      .pop()
      ?.toLowerCase();

  return inferredExtension === 'mp3' || inferredExtension === 'wav';
}

function isAllowedNotificationSoundSize(file: unknown) {
  const maybeFile = file as {
    fileSize?: unknown;
    size?: unknown;
  };
  const rawSize =
    typeof maybeFile.size === 'number'
      ? maybeFile.size
      : typeof maybeFile.fileSize === 'number'
      ? maybeFile.fileSize
      : null;

  return rawSize === null || rawSize <= 5 * 1024 * 1024;
}

function isAllowedMarketplaceImageFile(localUri: string, extension?: string) {
  const inferredExtension =
    extension?.toLowerCase().replace(/^\./, '') ??
    localUri
      .split(/[./\\]/)
      .pop()
      ?.toLowerCase();

  return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'heic', 'heif'].includes(
    inferredExtension ?? '',
  );
}

function replaceById<Item extends { _id: string }>(items: Item[], next: Item) {
  return items.map(item => (item._id === next._id ? next : item));
}

function moveOrderedItemById<Item extends { _id: string; order?: number }>(
  items: Item[],
  id: string,
  direction: -1 | 1,
) {
  const index = items.findIndex(item => item._id === id);
  return moveOrderedItemAt(items, index, direction);
}

function moveOrderedItemAt<Item extends { order?: number }>(
  items: Item[],
  index: number,
  direction: -1 | 1,
) {
  const targetIndex = index + direction;
  if (index < 0 || targetIndex < 0 || targetIndex >= items.length) {
    return null;
  }

  const nextItems = [...items];
  [nextItems[index], nextItems[targetIndex]] = [
    nextItems[targetIndex],
    nextItems[index],
  ];
  return normalizeMarketplaceOrder(nextItems);
}

function removeOrderedItemAt<Item extends { order?: number }>(
  items: Item[],
  index: number,
) {
  if (index < 0 || index >= items.length) {
    return null;
  }

  return normalizeMarketplaceOrder(
    items.filter((_, itemIndex) => itemIndex !== index),
  );
}

function normalizeMarketplaceOrder<Item extends { order?: number }>(
  items: Item[],
) {
  return items.map((item, index) => ({ ...item, order: index })) as Item[];
}

function getNotificationSoundPathFromResponse(
  response: Partial<Record<keyof WebSettingDraft, unknown>>,
  field: keyof WebSettingDraft,
) {
  const value = response[field];
  return typeof value === 'string' ? value : '';
}

function createMarketplaceLandingCtaDraft(
  section: KolamCtaSection | null,
): MarketplaceLandingCtaDraft {
  return {
    title: section?.title ?? '',
    description: section?.description ?? '',
    buttonText: section?.buttonText ?? '',
    buttonLink: section?.buttonLink ?? '',
    isActive: section?.isActive !== false,
  };
}

function createMarketplaceLandingHeroDraft(
  slide: KolamHeroSlide,
): MarketplaceLandingHeroDraft {
  return {
    id: slide._id,
    eyebrow: slide.eyebrow ?? '',
    title: slide.title ?? '',
    subtitle: slide.subtitle ?? '',
    description: slide.description ?? '',
    link: slide.link ?? '',
    linkText: slide.linkText ?? '',
    secondaryLink: slide.secondaryLink ?? '',
    secondaryLinkText: slide.secondaryLinkText ?? '',
    order: String(slide.order ?? ''),
    isActive: slide.isActive !== false,
    imageLocalUri: '',
  };
}

function createMarketplaceLandingCategoryDraft(
  banner: KolamCategoryBanner,
): MarketplaceLandingCategoryDraft {
  return {
    id: banner._id,
    categorySlug: banner.categorySlug ?? '',
    order: String(banner.order ?? ''),
    isActive: banner.isActive !== false,
    imageLocalUri: '',
  };
}

function createMarketplaceLandingAnnouncementDraft(
  banner: KolamAnnouncementBanner,
): MarketplaceLandingAnnouncementDraft {
  return {
    id: banner._id,
    link: banner.link ?? '',
    order: String(banner.order ?? ''),
    isActive: banner.isActive !== false,
    imageLocalUri: '',
  };
}

function createMarketplaceLandingYoutubeDraft(
  section: KolamYoutubeSection | null,
): MarketplaceLandingYoutubeDraft {
  return {
    link: section?.link ?? '',
    title: section?.title ?? '',
    subtitle: section?.subtitle ?? '',
    isActive: section?.isActive !== false,
  };
}

function createMarketplaceLandingNoticeDraft(
  notice: KolamCustomerTextNotice,
): MarketplaceLandingNoticeDraft {
  return {
    key: notice.key ?? '',
    title: notice.title ?? '',
    message: notice.message ?? '',
    ctaUrl: notice.ctaUrl ?? '',
    ctaLabel: notice.ctaLabel ?? '',
    showOnHome: notice.showOnHome !== false,
    showOnDashboard: notice.showOnDashboard !== false,
    isActive: notice.isActive !== false,
  };
}

function upsertMarketplaceNotice(
  notices: KolamCustomerTextNotice[],
  notice: KolamCustomerTextNotice,
) {
  const existing = notices.findIndex(item => item.key === notice.key);
  if (existing < 0) {
    return [...notices, notice];
  }

  return notices.map(item => (item.key === notice.key ? notice : item));
}

function parseMarketplaceLandingOrder(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : undefined;
}

function upsertMarketplaceLandingItem<
  Item extends { _id: string; order?: number },
>(items: Item[], next: Item) {
  const rows = items.some(item => item._id === next._id)
    ? replaceById(items, next)
    : [...items, next];

  return [...rows].sort((left, right) => {
    const leftOrder = left.order ?? 0;
    const rightOrder = right.order ?? 0;
    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left._id.localeCompare(right._id);
  });
}

function createActivityLogListParams(
  filters: SettingsActivityLogFilterState,
  page: number,
): KolamActivityLogListParams {
  return cleanActivityLogParams({
    page,
    limit: activityLogPageSize,
    search: filters.search.trim(),
    type: filters.type as KolamActivityLogListParams['type'],
    status: filters.status as KolamActivityLogListParams['status'],
    method: filters.method,
    source: filters.source as KolamActivityLogListParams['source'],
    suspicious: filters.suspicious,
  });
}

function cleanActivityLogParams(
  params: KolamActivityLogListParams,
): KolamActivityLogListParams {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== ''),
  ) as KolamActivityLogListParams;
}

function createUpdatedRolePermissions(
  currentPermissions: KolamRolePermission[],
  resource: string,
  action: string,
): KolamRolePermission[] {
  const managedResources = getSettingsRoleResourceGroups().flatMap(
    group => group.resources,
  );
  const managedSet = new Set(managedResources);
  const retiredResources = new Set([
    'taxonomy-request',
    'species-request',
    'product-request',
    'enclonura-species',
  ]);
  const validActions = getSettingsRoleActionsForResource(resource);
  const current = currentPermissions.find(
    permission => permission.resource === resource,
  );
  const currentActions = (current?.actions ?? []).filter(currentAction =>
    validActions.includes(currentAction),
  );
  const nextActions = currentActions.includes(action)
    ? currentActions.filter(currentAction => currentAction !== action)
    : [...currentActions, action];
  const nextPermission =
    nextActions.length > 0 ? { resource, actions: nextActions } : null;

  const nextByResource = new Map<string, KolamRolePermission>();
  currentPermissions.forEach(permission => {
    if (retiredResources.has(permission.resource)) {
      return;
    }

    const permissionValidActions = getSettingsRoleActionsForResource(
      permission.resource,
    );
    const actions = managedSet.has(permission.resource)
      ? (permission.actions ?? []).filter(currentAction =>
          permissionValidActions.includes(currentAction),
        )
      : permission.actions ?? [];

    if (actions.length > 0 && permission.resource !== resource) {
      nextByResource.set(permission.resource, {
        resource: permission.resource,
        actions,
      });
    }
  });

  if (nextPermission) {
    nextByResource.set(resource, nextPermission);
  }

  return [
    ...managedResources
      .map(managedResource => nextByResource.get(managedResource))
      .filter((permission): permission is KolamRolePermission =>
        Boolean(permission),
      ),
    ...Array.from(nextByResource.values()).filter(
      permission => !managedSet.has(permission.resource),
    ),
  ];
}

function getRoleMemberInitials(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('');

  return initials || 'U';
}

function getWebSettingSaveErrorMessage(error: unknown) {
  if (isPermissionApiError(error)) {
    return 'Akses ditolak: permission websetting:update diperlukan.';
  }

  if (error instanceof ApiError && error.message) {
    return error.message;
  }

  return 'Gagal menyimpan Web Settings.';
}

function getNotificationSoundErrorMessage(error: unknown) {
  if (isPermissionApiError(error)) {
    return 'Akses ditolak: permission websetting:update diperlukan.';
  }

  if (error instanceof ApiError && error.message) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Gagal memproses notification sound.';
}

function getMarketplaceLandingOverviewErrorMessage(error: unknown) {
  if (isPermissionApiError(error)) {
    return 'Akses ditolak: permission websetting:view diperlukan.';
  }

  if (error instanceof ApiError && error.message) {
    return error.message;
  }

  return 'Gagal membaca Marketplace Landing live.';
}

function getMarketplaceLandingSaveErrorMessage(error: unknown) {
  if (isPermissionApiError(error)) {
    return 'Akses ditolak: permission websetting:update diperlukan.';
  }

  if (error instanceof ApiError && error.message) {
    return error.message;
  }

  return 'Gagal menyimpan Marketplace Landing.';
}

function getRoleSaveErrorMessage(error: unknown) {
  if (isPermissionApiError(error)) {
    return 'Akses ditolak: permission role diperlukan.';
  }

  if (error instanceof ApiError && error.message) {
    return error.message;
  }

  return 'Gagal menyimpan Role Management live.';
}

function getActivityLogErrorMessage(error: unknown) {
  if (isPermissionApiError(error)) {
    return 'Akses ditolak: permission activity-log:view diperlukan.';
  }

  if (error instanceof ApiError && error.message) {
    return error.message;
  }

  return 'Gagal membaca Activity Log live.';
}

function getRegionSyncErrorMessage(error: unknown) {
  if (isPermissionApiError(error)) {
    return 'Akses ditolak: permission websetting:view diperlukan.';
  }

  if (error instanceof ApiError && error.message) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Gagal membaca master wilayah live.';
}

function getKpiSettingsErrorMessage(error: unknown) {
  if (isPermissionApiError(error)) {
    return 'Akses ditolak: permission websetting diperlukan untuk KPI.';
  }

  if (error instanceof ApiError && error.message) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Gagal membaca atau menyimpan pengaturan KPI.';
}

function isPermissionApiError(error: unknown) {
  return (
    (error instanceof ApiError && error.status === 403) ||
    (typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      error.status === 403)
  );
}
