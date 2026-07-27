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
  isSettingsTabId,
  getSettingsWebConfigFields,
  getSettingsWebFormSections,
  isSettingsDefaultRoleKey,
  isSettingsSuperAdminRoleKey,
  settingsSurfaceItems,
  type SettingsActivityLogFilterState,
  type SettingsSurfaceItem,
  type SettingsTabId,
  type SettingsTabVisibilityContext,
} from '../domain/settings-surface';
import type { SyncActivityEntry } from '../domain/sync-activity';
import {
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
import { getCurrentUser } from '../services/auth-api';
import { ApiError } from '../lib/api-error';
import { getPaymentMethods } from '../services/pos-api';
import type { PaymentMethod } from '../domain/pos';
import {
  pickNativeAudioFile,
  pickNativeImageFile,
} from '../services/native-file-picker';

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
  staffAttendanceRequireGps: boolean;
  staffAttendanceRequireFace: boolean;
  staffAttendanceFaceMatchThreshold: string;
  staffAttendanceWorkSitesText: string;
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
  staffAttendanceRequireGps: true,
  staffAttendanceRequireFace: false,
  staffAttendanceFaceMatchThreshold: '0.72',
  staffAttendanceWorkSitesText: '',
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

const emptyRoleDraft: RoleDraft = {
  name: '',
  key: '',
  description: '',
};

const emptyMarketplaceLandingCtaDraft: MarketplaceLandingCtaDraft = {
  title: '',
  description: '',
  buttonText: '',
  buttonLink: '',
  isActive: true,
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
  staticPages: [],
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

const activityLogPageSize = 50;

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
) {
  const stats = getSettingsSurfaceStats();
  const [activeSurfaceId, setActiveSurfaceId] = useState<
    SettingsSurfaceItem['id']
  >(initialActiveSurfaceId);
  const [activeSettingsTabId, setActiveSettingsTabId] = useState<SettingsTabId>(
    getDefaultSettingsTabIdForSurface(initialActiveSurfaceId),
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
  const visibleSettingsTabItems =
    settingsVisibilityContext === undefined
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
  const [sitemapDraft, setSitemapDraft] =
    useState<KolamSitemapConfig>(defaultSitemapConfig);
  const [sitemapCustomUrlsText, setSitemapCustomUrlsText] = useState('');
  const [sitemapExcludedSlugsText, setSitemapExcludedSlugsText] = useState<
    Partial<Record<KolamSitemapSectionKey, string>>
  >({});
  const [regionRows, setRegionRows] = useState<KolamRegion[]>([]);
  const [regionStats, setRegionStats] = useState<KolamRegionStats | null>(null);
  const [regionSyncStatus, setRegionSyncStatus] =
    useState<RegionSyncStatus>('idle');
  const [regionSyncMessage, setRegionSyncMessage] = useState('');
  const [regionLevel, setRegionLevel] = useState<KolamRegionLevel | ''>(
    'province',
  );
  const [regionParentCode, setRegionParentCode] = useState('');
  const [regionSearch, setRegionSearch] = useState('');
  const [regionReloadKey, setRegionReloadKey] = useState(0);
  const [operationalRooms, setOperationalRooms] = useState<KolamTeamChatRoom[]>(
    [],
  );
  const [operationalStaffRows, setOperationalStaffRows] = useState<
    KolamUserPickerRow[]
  >([]);
  const [staffAttendanceSettings, setStaffAttendanceSettings] =
    useState<KolamStaffAttendanceSettings | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const fallbackRoleRows = getSettingsRoleAccessRows();
  const [roles, setRoles] = useState<KolamRole[]>([]);
  const [roleStatus, setRoleStatus] = useState<RoleSaveStatus>('idle');
  const [roleSaveStatus, setRoleSaveStatus] = useState<RoleSaveStatus>('idle');
  const [roleMessage, setRoleMessage] = useState('');
  const [roleDraft, setRoleDraft] = useState<RoleDraft>(emptyRoleDraft);
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
    if (activeSettingsTabId !== 'operasional') {
      return;
    }

    let mounted = true;

    Promise.allSettled([
      getKolamStaffAttendanceSettings(),
      getKolamTeamChatRooms(),
      getKolamUserPickerRows(),
    ]).then(([attendanceResult, roomsResult, staffResult]) => {
      if (!mounted) {
        return;
      }

      if (attendanceResult.status === 'fulfilled') {
        setStaffAttendanceSettings(attendanceResult.value);
        setWebSettingDraft(current => ({
          ...current,
          ...createStaffAttendanceDraftFields(attendanceResult.value),
        }));
      }

      if (roomsResult.status === 'fulfilled') {
        setOperationalRooms(roomsResult.value);
      }

      if (staffResult.status === 'fulfilled') {
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

    getPaymentMethods()
      .then(methods => {
        if (mounted) {
          setPaymentMethods(methods);
        }
      })
      .catch(() => {
        if (mounted) {
          setPaymentMethods([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, [activeSettingsTabId]);

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

    Promise.allSettled([
      getKolamRegions({
        level: regionLevel,
        parentCode: regionParentCode,
        search: regionSearch,
        limit: 500,
      }),
      getKolamRegionStats(),
    ])
      .then(([rowsResult, statsResult]) => {
        if (!mounted) {
          return;
        }

        if (rowsResult.status !== 'fulfilled') {
          setRegionSyncStatus('error');
          setRegionSyncMessage(getRegionSyncErrorMessage(rowsResult.reason));
          return;
        }

        setRegionRows(rowsResult.value);
        setRegionStats(
          statsResult.status === 'fulfilled' ? statsResult.value : null,
        );
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
    regionLevel,
    regionParentCode,
    regionSearch,
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
        setActivityLogTotal(logsResult.value.meta.total);
        setActivityPage(logsResult.value.meta.page);
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
  }, [activeSurfaceId, activityLogFilters, activityPage]);

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
  const regionSyncSummaryRows = createRegionSyncSummaryRows(
    regionStats,
    regionRows,
  );
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
      return;
    }

    setRoleDraft({
      name: selectedLiveRole.name ?? '',
      key: selectedLiveRole.key ?? '',
      description: selectedLiveRole.description ?? '',
    });
    setRoleSaveStatus('idle');
  }, [selectedLiveRole]);

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
    setActivityPage(current => current);
    setActivityLogFilters(current => ({ ...current }));
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
  const setSitemapCustomUrlsDraftText = (value: string) => {
    setSitemapCustomUrlsText(value);
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
  const setRegionFilter = (
    key: 'level' | 'parentCode' | 'search',
    value: string,
  ) => {
    if (key === 'level') {
      setRegionLevel(
        regionLevels.includes(value as KolamRegionLevel)
          ? (value as KolamRegionLevel)
          : '',
      );
    } else if (key === 'parentCode') {
      setRegionParentCode(value);
    } else {
      setRegionSearch(value);
    }
  };
  const refreshRegionSync = () => {
    setRegionSyncStatus('loading');
    setRegionReloadKey(current => current + 1);
  };
  const runRegionSync = async (scope: KolamRegionSyncScope) => {
    setRegionSyncStatus('syncing');
    setRegionSyncMessage('');

    try {
      const result = await syncKolamRegions({
        scope,
        parentCode:
          scope === 'regencies' || scope === 'districts' || scope === 'villages'
            ? regionParentCode
            : '',
      });
      const stats = result.data;
      setRegionSyncMessage(
        `Synced ${formatNumber(stats.upserted)} rows, ${formatNumber(
          stats.withPostalCode,
        )} postal codes.`,
      );
      const [rows, nextStats] = await Promise.all([
        getKolamRegions({
          level: regionLevel,
          parentCode: regionParentCode,
          search: regionSearch,
          limit: 500,
        }),
        getKolamRegionStats(),
      ]);
      setRegionRows(rows);
      setRegionStats(nextStats);
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
          redirectUrl: webSettingDraft.staffDesktopOnlyRedirectUrl.trim(),
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
        daraBusinessEnabled: webSettingDraft.daraBusinessEnabled,
        daraToolsEnabled: webSettingDraft.daraToolsEnabled,
        daraKnowledgeEnabled: webSettingDraft.daraKnowledgeEnabled,
        daraHandoffNotifyEnabled: webSettingDraft.daraHandoffNotifyEnabled,
        daraInsightsEnabled: webSettingDraft.daraInsightsEnabled,
        daraAutoReportEnabled: webSettingDraft.daraAutoReportEnabled,
        daraImageAnalysisEnabled: webSettingDraft.daraImageAnalysisEnabled,
        daraTaxEnabled: webSettingDraft.daraTaxEnabled,
        daraSeoEnabled: webSettingDraft.daraSeoEnabled,
        daraTaxRegulationWatcherEnabled:
          webSettingDraft.daraTaxRegulationWatcherEnabled,
        daraTaxComplianceJobEnabled:
          webSettingDraft.daraTaxComplianceJobEnabled,
        daraTaxLlmNarrativeEnabled: webSettingDraft.daraTaxLlmNarrativeEnabled,
        daraWebstoreFulfillmentEnabled:
          webSettingDraft.daraWebstoreFulfillmentEnabled,
        daraStaffOpsNotifyEnabled: webSettingDraft.daraStaffOpsNotifyEnabled,
        daraStaffWaNotifyEnabled: webSettingDraft.daraStaffWaNotifyEnabled,
        daraOlshopCustomerNotifyEnabled:
          webSettingDraft.daraOlshopCustomerNotifyEnabled,
        daraOwnerDigestEnabled: webSettingDraft.daraOwnerDigestEnabled,
        daraOwnerDigestWaEnabled: webSettingDraft.daraOwnerDigestWaEnabled,
        daraOwnerDigestFcmEnabled: webSettingDraft.daraOwnerDigestFcmEnabled,
        daraOwnerFcmUrgentEnabled: webSettingDraft.daraOwnerFcmUrgentEnabled,
        kolamPlugins: createKolamPluginsUpdateBody(
          webSettingDraft.pluginControls,
          webSetting?.kolamPlugins,
          webSettingDraft.chatStoreEnabled,
        ),
      });

      if (activeSettingsTabId === 'operasional') {
        const attendance = await updateKolamStaffAttendanceSettings(
          createStaffAttendanceUpdateBody(
            webSettingDraft,
            staffAttendanceSettings,
          ),
        );
        setStaffAttendanceSettings(attendance);
      }

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
        daraBusinessEnabled: webSettingDraft.daraBusinessEnabled,
        daraToolsEnabled: webSettingDraft.daraToolsEnabled,
        daraKnowledgeEnabled: webSettingDraft.daraKnowledgeEnabled,
        daraHandoffNotifyEnabled: webSettingDraft.daraHandoffNotifyEnabled,
        daraInsightsEnabled: webSettingDraft.daraInsightsEnabled,
        daraAutoReportEnabled: webSettingDraft.daraAutoReportEnabled,
        daraImageAnalysisEnabled: webSettingDraft.daraImageAnalysisEnabled,
        daraTaxEnabled: webSettingDraft.daraTaxEnabled,
        daraSeoEnabled: webSettingDraft.daraSeoEnabled,
        daraTaxRegulationWatcherEnabled:
          webSettingDraft.daraTaxRegulationWatcherEnabled,
        daraTaxComplianceJobEnabled:
          webSettingDraft.daraTaxComplianceJobEnabled,
        daraTaxLlmNarrativeEnabled: webSettingDraft.daraTaxLlmNarrativeEnabled,
        daraWebstoreFulfillmentEnabled:
          webSettingDraft.daraWebstoreFulfillmentEnabled,
        daraStaffOpsNotifyEnabled: webSettingDraft.daraStaffOpsNotifyEnabled,
        daraStaffWaNotifyEnabled: webSettingDraft.daraStaffWaNotifyEnabled,
        daraOlshopCustomerNotifyEnabled:
          webSettingDraft.daraOlshopCustomerNotifyEnabled,
        daraOwnerDigestEnabled: webSettingDraft.daraOwnerDigestEnabled,
        daraOwnerDigestWaEnabled: webSettingDraft.daraOwnerDigestWaEnabled,
        daraOwnerDigestFcmEnabled: webSettingDraft.daraOwnerDigestFcmEnabled,
        daraOwnerFcmUrgentEnabled: webSettingDraft.daraOwnerFcmUrgentEnabled,
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

  const setRoleDraftField = <Key extends keyof RoleDraft>(
    key: Key,
    value: RoleDraft[Key],
  ) => {
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

  const createRole = async () => {
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

    setRoleSaveStatus('saving');
    setRoleMessage('');

    try {
      const updated = await updateKolamRole(selectedLiveRole._id, {
        name: roleDraft.name.trim(),
        key: roleDraft.key.trim(),
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

  const deleteRole = async () => {
    if (!selectedLiveRole) {
      return;
    }

    if (isSettingsDefaultRoleKey(selectedLiveRole.key)) {
      setRoleSaveStatus('error');
      setRoleMessage('Default role tidak boleh dihapus.');
      return;
    }

    setRoleSaveStatus('saving');
    setRoleMessage('');

    try {
      await deleteKolamRole(selectedLiveRole._id);
      const nextRoles = await reloadRoles();
      await refreshRolePermissionCache();
      setRoleSaveStatus('saved');
      setRoleMessage('Role berhasil dihapus dari data live.');
      setSelectedRoleId(nextRoles[0]?._id ?? '');
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
      roleSaveStatus === 'saving'
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
    'delete-role': deleteRole,
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
    kpiMessage,
    kpiPreview,
    kpiSettingsDraft,
    kpiStatus,
    kpiSummaryRows,
    maintenanceMode,
    marketplaceLandingOverview,
    marketplaceLandingCtaDraft,
    marketplaceLandingYoutubeDraft,
    marketplaceLandingNoticeDraft,
    marketplaceLandingSaveStatus,
    marketplaceLandingMessage,
    marketplaceLandingAssetStatus,
    marketplaceLandingTabId,
    marketplaceLandingTabItems,
    operationalRooms,
    operationalStaffRows,
    regionLevel,
    regionParentCode,
    regionRows,
    regionSearch,
    regionSyncMessage,
    regionSyncStatus,
    regionSyncSummaryRows,
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
    selectedRole,
    selectedRoleId,
    setMaintenanceMode,
    setActivityLogFilter,
    setKpiEnabledRule,
    setKpiSettingsDraftField,
    setMarketplaceLandingTabId,
    setRegionFilter,
    setRoleDraftField,
    setSelectedActivityLogId,
    setSelectedRoleId,
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
    clearMarketplaceLandingNoticeDraft,
    deleteMarketplaceAnnouncementBanner,
    deleteMarketplaceBioactiveStep,
    deleteMarketplaceCategoryBanner,
    deleteMarketplaceFeaturedCollection,
    deleteMarketplaceHeroSlide,
    deleteMarketplaceLandingNotice,
    editMarketplaceLandingNotice,
    moveMarketplaceAnnouncementBanner,
    moveMarketplaceBioactiveStep,
    moveMarketplaceCategoryBanner,
    moveMarketplaceFeaturedCollection,
    moveMarketplaceHeroSlide,
    saveMarketplaceLandingCta,
    saveMarketplaceLandingYoutube,
    saveMarketplaceLandingNotice,
    saveKpiSettings,
    uploadMarketplaceAnnouncementImage,
    uploadMarketplaceBioactiveStepImage,
    uploadMarketplaceCategoryBannerImage,
    uploadMarketplaceCtaBackground,
    uploadMarketplaceDaraAvatar,
    uploadMarketplaceFeaturedCollectionImage,
    uploadMarketplaceHeroImage,
    uploadMarketplaceLogo,
    uploadMarketplaceYoutubeBackground,
    webSettingDraft,
    webSettingMessage,
    webSettingSaveStatus,
    webSettingStatus,
    roleEditorActions: getSettingsRoleEditorActions(
      selectedRole?.id,
      selectedRole?.defaultRole,
    ),
    roleInfoPanel: getSettingsRoleInfoPanel(selectedRole?.id, roleRows),
    roleMemberPreview: getSettingsRoleMemberPreview(
      selectedRole?.id ?? roleRows[0]?.id ?? 'super-admin',
    ),
    rolePermissionMatrixGroups: getSettingsRolePermissionMatrixGroups(
      selectedLiveRole ?? selectedRole?.id,
      selectedRole?.defaultRole,
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
    storeOperatingHoursMessageBeforeOpen: storeMessages.beforeOpen ?? '',
    storeOperatingHoursMessageAfterClose: storeMessages.afterClose ?? '',
    storeOperatingHoursMessageWeeklyClosed: storeMessages.weeklyClosed ?? '',
    storeOperatingHoursMessageSpecialClosed: storeMessages.specialClosed ?? '',
    storeOperatingHoursMessageShippingDisclaimer:
      storeMessages.shippingDisclaimer ?? '',
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
    daraBusinessEnabled: setting.daraBusinessEnabled !== false,
    daraToolsEnabled: setting.daraToolsEnabled !== false,
    daraKnowledgeEnabled: setting.daraKnowledgeEnabled !== false,
    daraHandoffNotifyEnabled: setting.daraHandoffNotifyEnabled !== false,
    daraInsightsEnabled: setting.daraInsightsEnabled !== false,
    daraAutoReportEnabled: setting.daraAutoReportEnabled !== false,
    daraImageAnalysisEnabled: setting.daraImageAnalysisEnabled !== false,
    daraTaxEnabled: setting.daraTaxEnabled !== false,
    daraSeoEnabled: setting.daraSeoEnabled !== false,
    daraTaxRegulationWatcherEnabled:
      setting.daraTaxRegulationWatcherEnabled === true,
    daraTaxComplianceJobEnabled: setting.daraTaxComplianceJobEnabled !== false,
    daraTaxLlmNarrativeEnabled: setting.daraTaxLlmNarrativeEnabled === true,
    daraWebstoreFulfillmentEnabled:
      setting.daraWebstoreFulfillmentEnabled !== false,
    daraStaffOpsNotifyEnabled: setting.daraStaffOpsNotifyEnabled !== false,
    daraStaffWaNotifyEnabled: setting.daraStaffWaNotifyEnabled !== false,
    daraOlshopCustomerNotifyEnabled:
      setting.daraOlshopCustomerNotifyEnabled !== false,
    daraOwnerDigestEnabled: setting.daraOwnerDigestEnabled !== false,
    daraOwnerDigestWaEnabled: setting.daraOwnerDigestWaEnabled !== false,
    daraOwnerDigestFcmEnabled: setting.daraOwnerDigestFcmEnabled !== false,
    daraOwnerFcmUrgentEnabled: setting.daraOwnerFcmUrgentEnabled !== false,
    notificationSound: setting.notificationSound ?? '',
    unassignedNotificationSound: setting.unassignedNotificationSound ?? '',
    handoffNotificationSound: setting.handoffNotificationSound ?? '',
    groupCallRingtone: setting.groupCallRingtone ?? '',
    salesNotificationSound: setting.salesNotificationSound ?? '',
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
    staffAttendanceRequireGps: settings.requireGps !== false,
    staffAttendanceRequireFace: settings.requireFace === true,
    staffAttendanceFaceMatchThreshold: String(
      settings.faceMatchThreshold ?? 0.72,
    ),
    staffAttendanceWorkSitesText: formatStaffAttendanceWorkSites(
      settings.workSites,
    ),
  } satisfies Partial<WebSettingDraft>;
}

function createStaffAttendanceUpdateBody(
  draft: WebSettingDraft,
  current: KolamStaffAttendanceSettings | null,
): KolamStaffAttendanceSettings {
  return {
    ...(current ?? {}),
    payrollCutoffDay: parseIntegerOrFallback(
      draft.staffAttendancePayrollCutoffDay,
      28,
    ),
    workStartTime: draft.staffAttendanceWorkStartTime.trim() || '08:00',
    workEndTime: draft.staffAttendanceWorkEndTime.trim() || '17:00',
    serviceCommissionInsideHoursPct: parseNumberOrFallback(
      draft.staffAttendanceServiceCommissionInsideHoursPct,
      0,
    ),
    serviceCommissionOutsideHoursPct: parseNumberOrFallback(
      draft.staffAttendanceServiceCommissionOutsideHoursPct,
      0,
    ),
    timezone: draft.staffAttendanceTimezone.trim() || 'Asia/Jakarta',
    lateToleranceMinutes: parseIntegerOrFallback(
      draft.staffAttendanceLateToleranceMinutes,
      15,
    ),
    lateTier2MaxMinutes: parseIntegerOrFallback(
      draft.staffAttendanceLateTier2MaxMinutes,
      120,
    ),
    lateCheckInDeadlineMinutes: parseIntegerOrFallback(
      draft.staffAttendanceLateCheckInDeadlineMinutes,
      240,
    ),
    lateFineTier2: parseIntegerOrFallback(
      draft.staffAttendanceLateFineTier2,
      50000,
    ),
    lateFineTier3: parseIntegerOrFallback(
      draft.staffAttendanceLateFineTier3,
      100000,
    ),
    absentDailyDivisor: parseIntegerOrFallback(
      draft.staffAttendanceAbsentDailyDivisor,
      30,
    ),
    attendanceMapProvider:
      draft.staffAttendanceMapProvider === 'google'
        ? 'google'
        : 'openstreetmap',
    osmNominatimUrl: draft.staffAttendanceOsmNominatimUrl.trim(),
    osmTileUrl: draft.staffAttendanceOsmTileUrl.trim(),
    requireGps: draft.staffAttendanceRequireGps,
    requireFace: draft.staffAttendanceRequireFace,
    faceMatchThreshold: parseNumberOrFallback(
      draft.staffAttendanceFaceMatchThreshold,
      0.72,
    ),
    workSites: parseStaffAttendanceWorkSitesText(
      draft.staffAttendanceWorkSitesText,
      current?.workSites,
    ),
  };
}

function createFinancialSummaryRows(
  setting: KolamWebSetting | null,
  methods: PaymentMethod[],
): SettingsFinancialSummaryRow[] {
  const overtime = setting?.overtimeSettings ?? {};
  const commission = setting?.enclosureSaleCommission ?? {};
  const activeMethods = methods.filter(method => method.active);
  const inactiveMethods = methods.filter(method => !method.active);

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
            .map(method => `${method.name} - ${method.wallet}`)
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
      label: 'Enclosure sale commission',
      value: formatEnabled(commission.enabled === true),
      detail: `${commission.type ?? 'percentage'} ${formatNumber(
        commission.value,
      )}`,
    },
  ];
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
    staticPages: config?.staticPages ?? defaultSitemapConfig.staticPages,
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
    customUrls: parseSitemapCustomUrlsText(customUrlsText),
    excludedSlugs: sitemapSectionKeys.reduce((slugs, key) => {
      slugs[key] = parseLooseList(excludedSlugsText[key] ?? '');
      return slugs;
    }, {} as Record<KolamSitemapSectionKey, string[]>),
  };
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

function parseLooseList(value: string) {
  return value
    .split(/[\n,]/)
    .map(item => item.trim())
    .filter(Boolean);
}

function createRegionSyncSummaryRows(
  stats: KolamRegionStats | null,
  rows: KolamRegion[],
): RegionSyncSummaryRow[] {
  return regionLevels.map(level => ({
    id: level,
    label: getRegionLevelLabel(level),
    value: formatNumber(stats?.counts[level]?.count ?? 0),
    detail: `${formatNumber(
      stats?.counts[level]?.withPostalCode ?? 0,
    )} postal codes | table cache ${formatNumber(rows.length)} rows`,
  }));
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
      label: 'Task points',
      value: settings
        ? `${settings.basePoints?.low ?? 0}/${
            settings.basePoints?.medium ?? 0
          }/${settings.basePoints?.high ?? 0}/${
            settings.basePoints?.urgent ?? 0
          }`
        : 'Belum dimuat',
      detail: 'low / medium / high / urgent base points.',
    },
    {
      id: 'chat-sla',
      label: 'Chat SLA',
      value: settings
        ? `${settings.chat?.fastReplyMinutes ?? 0}m / ${
            settings.chat?.lateReplyMinutes ?? 0
          }m`
        : 'Belum dimuat',
      detail: `Fast ${settings?.chat?.fastReplyPoints ?? 0}, late ${
        settings?.chat?.lateReplyPoints ?? 0
      }, no reply ${settings?.chat?.noReplyPoints ?? 0}.`,
    },
    {
      id: 'complaint',
      label: 'Complaint points',
      value: settings
        ? `${settings.complaint?.light ?? 0}/${
            settings.complaint?.valid ?? 0
          }/${settings.complaint?.severe ?? 0}`
        : 'Belum dimuat',
      detail: 'light / valid / severe penalty.',
    },
    {
      id: 'attendance',
      label: 'Attendance',
      value: String(settings?.attendance?.outsideRadius ?? 0),
      detail: 'Penalty outside radius.',
    },
    {
      id: 'monthly-level',
      label: 'Monthly level',
      value: `${settings?.levels?.length ?? 0} levels`,
      detail:
        settings?.levels
          ?.map(level => `${level.label} ${level.min}-${level.max ?? '∞'}`)
          .join(' | ') ?? 'Belum dimuat',
    },
    {
      id: 'weekly-preview',
      label: 'DARA weekly announcement preview',
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

function parseMacAddressList(value: string) {
  return parseIdList(value);
}

function parseIdList(value: string) {
  return value
    .split(/[\n,]/)
    .map(item => item.trim())
    .filter(Boolean);
}

function formatStaffAttendanceWorkSites(
  sites: KolamStaffAttendanceWorkSite[] | undefined,
) {
  return (sites ?? [])
    .map(site =>
      [
        site.name ?? '',
        formatNumber(site.latitude),
        formatNumber(site.longitude),
        formatNumber(site.radiusMeters),
        site.active === false ? 'false' : 'true',
      ].join('|'),
    )
    .join('\n');
}

function parseStaffAttendanceWorkSitesText(
  value: string,
  fallback: KolamStaffAttendanceWorkSite[] | undefined,
) {
  const lines = value
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return [];
  }

  const parsed = lines
    .map<KolamStaffAttendanceWorkSite | null>(line => {
      const [
        name = '',
        latitude = '',
        longitude = '',
        radius = '',
        active = 'true',
      ] = line.split('|');
      const parsedLatitude = parseOptionalNumber(latitude);
      const parsedLongitude = parseOptionalNumber(longitude);

      if (!name.trim() || parsedLatitude === null || parsedLongitude === null) {
        return null;
      }

      const parsedRadius = parseOptionalNumber(radius);

      return {
        name: name.trim(),
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        radiusMeters: parsedRadius ?? 150,
        active: active.trim().toLowerCase() !== 'false',
      };
    })
    .filter((site): site is KolamStaffAttendanceWorkSite => Boolean(site));

  return parsed.length ? parsed : fallback ?? [];
}

function parseIntegerOrFallback(value: string, fallback: number) {
  const parsed = Number.parseInt(value.trim(), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseNumberOrFallback(value: string, fallback: number) {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? parsed : fallback;
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
  const smtp: KolamWebSetting['smtp'] = {
    host: draft.smtpHost.trim(),
    port: parseIntegerOrFallback(draft.smtpPort, 465),
    user: draft.smtpUser.trim(),
    fromEmail: draft.smtpFromEmail.trim(),
    fromName: draft.smtpFromName.trim(),
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

  return [
    ...currentPermissions
      .filter(permission => permission.resource !== resource)
      .map(permission => ({
        resource: permission.resource,
        actions: permission.actions,
      })),
    ...(nextPermission ? [nextPermission] : []),
  ];
}

async function refreshRolePermissionCache() {
  await getCurrentUser().catch(() => undefined);
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
