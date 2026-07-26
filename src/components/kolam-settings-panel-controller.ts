import {useEffect, useState} from 'react';
import {
  getSettingsActivityLogDetailFields,
  getSettingsActivityLogFilterControls,
  getSettingsActivityLogPagination,
  getSettingsActivityLogRows,
  getSettingsActivityLogStatsCards,
  getSettingsActivityLogTableColumns,
  getSettingsDetailRows,
  getSettingsLiveEndpoints,
  getSettingsRoleAccessRows,
  getSettingsRoleEditorActions,
  getSettingsRoleInfoPanel,
  getSettingsRoleMemberPreview,
  getSettingsRolePermissionMatrixGroups,
  getSettingsRolePermissionPreviewRows,
  getSettingsRoleResourceGroups,
  getSettingsRoleTabItems,
  getSettingsSurfaceStats,
  getSettingsWebConfigFields,
  getSettingsWebFormSections,
  settingsSurfaceItems,
  type SettingsSurfaceItem,
} from '../domain/settings-surface';
import type {SyncActivityEntry} from '../domain/sync-activity';
import {
  getKolamWebSetting,
  getKolamWebSettingVersion,
  getKolamWebSettingVersions,
  updateKolamWebSetting,
  updateKolamWebSettingVersion,
  type KolamPluginConfigKey,
  type KolamWebSetting,
  type KolamWebSettingVersion,
  type KolamWebSettingVersions,
} from '../services/kolam-api';
import {ApiError} from '../lib/api-error';

type WebSettingSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

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
  pluginControls: Record<KolamPluginConfigKey, boolean>;
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

export function useKolamSettingsPanelController(
  activityEntries: SyncActivityEntry[],
  initialActiveSurfaceId: SettingsSurfaceItem['id'] = 'web-settings',
) {
  const stats = getSettingsSurfaceStats();
  const [activeSurfaceId, setActiveSurfaceId] =
    useState<SettingsSurfaceItem['id']>(initialActiveSurfaceId);
  const [selectedActivityLogId, setSelectedActivityLogId] = useState('');
  const [activityPage, setActivityPage] = useState(1);
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
  const [webSettingDraft, setWebSettingDraft] = useState<WebSettingDraft>(
    emptyWebSettingDraft,
  );
  const roleRows = getSettingsRoleAccessRows();
  const [selectedRoleId, setSelectedRoleId] = useState(roleRows[0]?.id ?? '');

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

  const activeSurface =
    settingsSurfaceItems.find(item => item.id === activeSurfaceId) ??
    settingsSurfaceItems[0];
  const detailRows = getSettingsDetailRows(activeSurface.id);
  const activityPagination = getSettingsActivityLogPagination(
    activityEntries.length,
    activityPage,
  );
  const activityRows = getSettingsActivityLogRows(
    activityEntries,
    activityPagination.pageSize,
    activityPagination.page,
  );
  const selectedActivityLog =
    activityRows.find(row => row.id === selectedActivityLogId) ?? null;
  const selectedActivityLogFields = selectedActivityLog
    ? getSettingsActivityLogDetailFields(selectedActivityLog)
    : [];
  const selectedRole =
    roleRows.find(row => row.id === selectedRoleId) ?? roleRows[0];
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
    setActivityPage(1);
    setSelectedActivityLogId('');
  };
  const changeActivityPage = (page: number) => {
    setActivityPage(page);
    setSelectedActivityLogId('');
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
        kolamPlugins: createKolamPluginsUpdateBody(
          webSettingDraft.pluginControls,
          webSetting?.kolamPlugins,
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
        kolamPlugins: createKolamPluginsUpdateBody(
          webSettingDraft.pluginControls,
          updated.kolamPlugins,
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

  return {
    activeSurface,
    activeSurfaceId,
    activityEntries,
    activityPagination,
    activityRows,
    changeActivityPage,
    detailRows,
    liveEndpoints,
    maintenanceMode,
    roleRows,
    selectSurface,
    selectedActivityLog,
    selectedActivityLogFields,
    selectedActivityLogId,
    selectedRole,
    selectedRoleId,
    setMaintenanceMode,
    setSelectedActivityLogId,
    setSelectedRoleId,
    setStorefrontEnabled,
    setWebTitle,
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
    setWebSettingDraftField,
    setWebSettingPluginControl,
    webSettingDraft,
    webSettingMessage,
    webSettingSaveStatus,
    webSettingStatus,
    roleEditorActions: getSettingsRoleEditorActions(
      selectedRole?.id,
      selectedRole?.defaultRole,
    ),
    roleInfoPanel: getSettingsRoleInfoPanel(selectedRole?.id),
    roleMemberPreview: getSettingsRoleMemberPreview(
      selectedRole?.id ?? roleRows[0]?.id ?? 'super-admin',
    ),
    rolePermissionMatrixGroups: getSettingsRolePermissionMatrixGroups(
      selectedRole?.id,
      selectedRole?.defaultRole,
    ),
    rolePermissionPreviewRows: getSettingsRolePermissionPreviewRows(),
    roleResourceGroups: getSettingsRoleResourceGroups(),
    roleTabItems: getSettingsRoleTabItems(roleRows),
    activityColumns: getSettingsActivityLogTableColumns(),
    activityFilterControls: getSettingsActivityLogFilterControls(),
    activityStatsCards: getSettingsActivityLogStatsCards(activityEntries),
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

function getWebSettingSaveErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 403) {
    return 'Akses ditolak: permission websetting:update diperlukan.';
  }

  if (error instanceof ApiError && error.message) {
    return error.message;
  }

  return 'Gagal menyimpan Web Settings.';
}
