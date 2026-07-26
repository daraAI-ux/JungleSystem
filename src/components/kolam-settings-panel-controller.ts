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
  isSettingsTabId,
  getSettingsWebConfigFields,
  getSettingsWebFormSections,
  isSettingsDefaultRoleKey,
  isSettingsSuperAdminRoleKey,
  DEFAULT_SETTINGS_TAB_ID,
  settingsSurfaceItems,
  type SettingsActivityLogFilterState,
  type SettingsSurfaceItem,
  type SettingsTabId,
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
  getKolamMarketplaceContentAdmin,
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
  updateKolamCtaSection,
  updateKolamFeaturedCollections,
  updateKolamHeroSlide,
  updateKolamYoutubeSection,
  updateKolamWebSetting,
  updateKolamWebSettingVersion,
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
  type KolamCategoryBanner,
  type KolamCtaSection,
  type KolamCustomerTextNotice,
  type KolamHeroSlide,
  type KolamMarketplaceContent,
  type KolamNotificationSoundType,
  type KolamRole,
  type KolamRolePermission,
  type KolamWebSetting,
  type KolamWebSettingVersion,
  type KolamWebSettingVersions,
  type KolamYoutubeSection,
} from '../services/kolam-api';
import { getCurrentUser } from '../services/auth-api';
import { ApiError } from '../lib/api-error';
import {
  pickNativeAudioFile,
  pickNativeImageFile,
} from '../services/native-file-picker';

type WebSettingSaveStatus = 'idle' | 'saving' | 'saved' | 'error';
type RoleSaveStatus = 'idle' | 'loading' | 'saving' | 'saved' | 'error';
type ActivityLogStatus = 'idle' | 'loading' | 'live' | 'error';
type NotificationSoundStatus = 'idle' | 'uploading' | 'deleting';
type MarketplaceLandingOverviewStatus = 'idle' | 'loading' | 'live' | 'error';
type MarketplaceLandingSaveStatus = 'idle' | 'saving' | 'saved' | 'error';
type MarketplaceLandingAssetStatus =
  | 'idle'
  | 'uploading'
  | 'deleting'
  | 'reordering';
const maskedSecretPlaceholder = '********';
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
  originAddressLine1: string;
  originCity: string;
  originProvince: string;
  originPostalCode: string;
  originLatitude: string;
  originLongitude: string;
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
  const [activeSettingsTabId, setActiveSettingsTabId] =
    useState<SettingsTabId>(DEFAULT_SETTINGS_TAB_ID);
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
  const [webSettingDraft, setWebSettingDraft] =
    useState<WebSettingDraft>(emptyWebSettingDraft);
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
        originAddress: {
          addressLine1: webSettingDraft.originAddressLine1.trim(),
          city: webSettingDraft.originCity.trim(),
          province: webSettingDraft.originProvince.trim(),
          postalCode: webSettingDraft.originPostalCode.trim(),
          latitude: parseOptionalNumber(webSettingDraft.originLatitude),
          longitude: parseOptionalNumber(webSettingDraft.originLongitude),
        },
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
    maintenanceMode,
    marketplaceLandingOverview,
    marketplaceLandingCtaDraft,
    marketplaceLandingYoutubeDraft,
    marketplaceLandingNoticeDraft,
    marketplaceLandingSaveStatus,
    marketplaceLandingMessage,
    marketplaceLandingAssetStatus,
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
    setRoleDraftField,
    setSelectedActivityLogId,
    setSelectedRoleId,
    setStorefrontEnabled,
    setWebTitle,
    settingsTabItems: getSettingsTabItems(),
    settingsSurfaceItems,
    stats,
    storefrontEnabled,
    webTitle,
    webConfigFields: getSettingsWebConfigFields(webSetting),
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

function cleanOptionalString(value: string) {
  const trimmed = value.trim();
  return trimmed || undefined;
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
  return value
    .split(/[\n,]/)
    .map(item => item.trim())
    .filter(Boolean);
}

function parseIntegerOrFallback(value: string, fallback: number) {
  const parsed = Number.parseInt(value.trim(), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
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
  if (error instanceof ApiError && error.status === 403) {
    return 'Akses ditolak: permission websetting:update diperlukan.';
  }

  if (error instanceof ApiError && error.message) {
    return error.message;
  }

  return 'Gagal menyimpan Web Settings.';
}

function getNotificationSoundErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 403) {
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
  if (error instanceof ApiError && error.status === 403) {
    return 'Akses ditolak: permission websetting:view diperlukan.';
  }

  if (error instanceof ApiError && error.message) {
    return error.message;
  }

  return 'Gagal membaca Marketplace Landing live.';
}

function getMarketplaceLandingSaveErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 403) {
    return 'Akses ditolak: permission websetting:update diperlukan.';
  }

  if (error instanceof ApiError && error.message) {
    return error.message;
  }

  return 'Gagal menyimpan Marketplace Landing.';
}

function getRoleSaveErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 403) {
    return 'Akses ditolak: permission role diperlukan.';
  }

  if (error instanceof ApiError && error.message) {
    return error.message;
  }

  return 'Gagal menyimpan Role Management live.';
}

function getActivityLogErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 403) {
    return 'Akses ditolak: permission activity-log:view diperlukan.';
  }

  if (error instanceof ApiError && error.message) {
    return error.message;
  }

  return 'Gagal membaca Activity Log live.';
}
