import React from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import WebView from 'react-native-webview';
import type {
  SettingsTabId,
  SettingsWebConfigField,
  SettingsWebFormSection,
} from '../domain/settings-surface';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamActionControlButton } from './kolam-action-control-button';
import {KolamActionGlyph} from './kolam-action-glyph';
import {KolamEditButton} from './kolam-edit-button';
import { KolamRefreshButton } from './kolam-refresh-button';
import { KolamResetButton } from './kolam-reset-button';
import { KolamChoiceSegment } from './kolam-choice-segment';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDateField } from './kolam-date-field';
import { KolamDropdownSelect } from './kolam-dropdown-select';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamListTableComposition } from './kolam-list-table-composition';
import {KolamModalBackdrop} from './kolam-modal-backdrop';
import {KolamModalDialog} from './kolam-modal-dialog';
import { KolamRowFrame } from './kolam-row-frame';
import { KolamSettingsWebFormFields } from './kolam-settings-web-form-fields';
import { KolamSettingsWebFormSectionHeader } from './kolam-settings-web-form-section-header';
import { KolamSettingsWebFormSections } from './kolam-settings-web-widgets';
import { KolamTextFieldRow } from './kolam-text-field-row';
import { KolamTextFieldRowCopy } from './kolam-text-field-row-copy';
import { KolamRupiahField } from './kolam-rupiah-field';
import { KolamToggleRow } from './kolam-toggle-row';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';
import { appConfig } from '../config/app';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  geocodeKolamStaffAttendanceWorkSite,
  getKolamGoogleMapsBrowserKey,
} from '../services/kolam-api';
import type {
  KolamAnnouncementBanner,
  KolamBioactiveEcosystemStep,
  KolamBlog,
  KolamBlogTopic,
  KolamCategoryBanner,
  KolamCtaSection,
  KolamCustomerTextNotice,
  KolamFeaturedCollection,
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
import type {KolamCategory} from '../domain/kolam-category';
import type {
  SettingsFinancialSummaryRow,
  SettingsFinancialSectionVisibility,
  SettingsPaymentMethodDraft,
  SettingsPaymentMethodFilters,
  DaraKnowledgeDraft,
  MarketplaceLandingAnnouncementDraft,
  MarketplaceLandingCategoryDraft,
  MarketplaceLandingCtaDraft,
  MarketplaceLandingHeroDraft,
  MarketplaceLandingNoticeDraft,
  MarketplaceLandingOverview,
  MarketplaceLandingYoutubeDraft,
  KpiSettingsDraft,
  KpiSettingsSummaryRow,
  MarketplaceLandingTabItem,
  RegionSyncSummaryRow,
  WebContentLauncherItem,
} from './kolam-settings-panel-controller';
import type {
  KolamFinancialWallet,
  KolamPaymentMethod,
  KolamTaxCompanyProfile,
  KolamTaxPartyGapsSummary,
} from '../services/kolam-financial-settings-api';
import {
  ensureKolamTimezoneDatabase,
  type KolamTimezoneOption,
} from '../services/kolam-timezone-local-cache';
import type { KolamKpiWeeklyAnnouncePreview } from '../services/kolam-api';
import { getNativeDeviceIdentity } from '../lib/api-client';
import { createKolamNotificationSoundService } from '../services/kolam-notification-sound-service';
import { createKolamRuntimeNotificationSoundAdapter } from '../services/kolam-notification-sound-runtime';

const KolamWebView = WebView as unknown as React.ComponentType<any>;
const MASKED_SECRET_PLACEHOLDER = '********';
const STAFF_DESKTOP_REDIRECT_URL = 'https://dunia-anura.com';

const paymentMethodTypeOptions: Array<{
  description: string;
  label: string;
  value: SettingsPaymentMethodDraft['type'];
}> = [
  {value: 'cash', label: 'Tunai', description: 'Pembayaran tunai fisik.'},
  {
    value: 'transfer',
    label: 'Transfer Bank',
    description: 'Transfer langsung antar bank.',
  },
  {
    value: 'ewallet',
    label: 'Dompet Digital',
    description: 'GoPay, OVO, DANA, dan layanan sejenis.',
  },
  {value: 'credit', label: 'Kartu Kredit', description: 'Pembayaran kartu kredit.'},
  {value: 'debit', label: 'Kartu Debit', description: 'Pembayaran kartu debit.'},
  {value: 'qris', label: 'QRIS', description: 'Pembayaran kode QR.'},
];

const paymentMethodProviderOptions = [
  {value: 'BCA', label: 'Bank Central Asia (BCA) - Bank'},
  {value: 'Mandiri', label: 'Bank Mandiri - Bank'},
  {value: 'BRI', label: 'Bank Rakyat Indonesia (BRI) - Bank'},
  {value: 'BNI', label: 'Bank Negara Indonesia (BNI) - Bank'},
  {value: 'CIMB', label: 'CIMB Niaga - Bank'},
  {value: 'Permata', label: 'Bank Permata - Bank'},
  {value: 'Danamon', label: 'Bank Danamon - Bank'},
  {value: 'BTN', label: 'Bank Tabungan Negara (BTN) - Bank'},
  {value: 'GoPay', label: 'GoPay - Dompet digital'},
  {value: 'OVO', label: 'OVO - Dompet digital'},
  {value: 'DANA', label: 'DANA - Dompet digital'},
  {value: 'LinkAja', label: 'LinkAja - Dompet digital'},
  {value: 'ShopeePay', label: 'ShopeePay - Dompet digital'},
  {value: 'Cash', label: 'Tunai - Cash'},
  {value: 'Other', label: 'Lainnya - Other'},
];

const sitemapPriorityOptions = [
  '0.1',
  '0.2',
  '0.3',
  '0.4',
  '0.5',
  '0.6',
  '0.7',
  '0.8',
  '0.9',
  '1.0',
].map(value => ({value, label: value}));

const sitemapFrequencyOptions: Array<{
  label: string;
  value: KolamSitemapChangeFrequency;
}> = [
  {value: 'always', label: 'Selalu'},
  {value: 'hourly', label: 'Per jam'},
  {value: 'daily', label: 'Harian'},
  {value: 'weekly', label: 'Mingguan'},
  {value: 'monthly', label: 'Bulanan'},
  {value: 'yearly', label: 'Tahunan'},
  {value: 'never', label: 'Tidak pernah'},
];

type TaxPayerTypeOptionValue = 'pt' | 'cv' | 'umkm' | 'perorangan' | 'other';
type TaxUmkmSchemeOptionValue = 'none' | 'pp_55_2022' | 'other';

const taxPayerTypeOptions: Array<{
  label: string;
  value: TaxPayerTypeOptionValue;
}> = [
  {value: 'pt', label: 'PT - Perseroan Terbatas'},
  {value: 'cv', label: 'CV - Commanditaire Vennootschap'},
  {value: 'umkm', label: 'UMKM'},
  {value: 'perorangan', label: 'Perorangan'},
  {value: 'other', label: 'Lainnya'},
];

const taxUmkmSchemeOptions: Array<{
  label: string;
  value: TaxUmkmSchemeOptionValue;
}> = [
  {value: 'none', label: 'Tidak ada'},
  {value: 'pp_55_2022', label: 'PP 55/2022'},
  {value: 'other', label: 'Lainnya'},
];

const overtimeCalculationModeOptions: Array<{
  label: string;
  value: WebSettingDraft['overtimeCalculationMode'];
}> = [
  {value: 'per_hour', label: 'Per jam'},
  {value: 'per_day', label: 'Per hari'},
];

const enclosureSaleCommissionTypeOptions: Array<{
  label: string;
  value: WebSettingDraft['enclosureSaleCommissionType'];
}> = [
  {value: 'percentage', label: 'Persentase'},
  {value: 'fixed', label: 'Nominal tetap'},
];

const defaultPaymentMethodFilters: SettingsPaymentMethodFilters = {
  search: '',
  isAvailableOnWebstore: '',
  page: 1,
  limit: 10,
};

const defaultPaymentMethodDraft: SettingsPaymentMethodDraft = {
  id: '',
  name: '',
  type: 'transfer',
  provider: 'BCA',
  wallet: '',
  accountNumber: '',
  accountName: '',
  notes: '',
  isActive: true,
  isAvailableOnWebstore: true,
  requireSaleProof: false,
  costsText: '',
};

function noop() {}

function noopSaveNotificationToggle(
  _key: 'daraHandoffNotifyEnabled' | 'teamChatGroupCallEnabled',
  _value: boolean,
) {}

function noopSetPaymentMethodDraftField<
  Key extends keyof SettingsPaymentMethodDraft,
>(_key: Key, _value: SettingsPaymentMethodDraft[Key]) {}

function noopSetPaymentMethodFilter(
  _key: keyof SettingsPaymentMethodFilters,
  _value: string | number,
) {}

function noopSetTaxCompanyProfileDraftField<
  Key extends keyof KolamTaxCompanyProfile,
>(_key: Key, _value: KolamTaxCompanyProfile[Key]) {}

function noopSetDaraKnowledgeDraftField<Key extends keyof DaraKnowledgeDraft>(
  _key: Key,
  _value: DaraKnowledgeDraft[Key],
) {}

const defaultDaraKnowledgeDraft: DaraKnowledgeDraft = {
  title: '',
  category: 'sop_kasir',
  body: '',
};

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

const aiInboxPlatformRows: Array<{
  id: string;
  label: string;
  description: string;
  field: keyof WebSettingDraft;
}> = [
  {
    id: 'store',
    label: 'Chat web',
    description: 'PM marketplace tamu dan My Chat di dunia-anura.com.',
    field: 'inboxAiReplyStore',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    description: 'Pesan masuk melalui integrasi AM.',
    field: 'inboxAiReplyWhatsapp',
  },
  {
    id: 'tiktok',
    label: 'TikTok Shop',
    description: 'Inbox TikTok Shop.',
    field: 'inboxAiReplyTiktok',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    description: 'Direct Message Instagram.',
    field: 'inboxAiReplyInstagram',
  },
  {
    id: 'tokopedia',
    label: 'Tokopedia',
    description: 'Chat Tokopedia.',
    field: 'inboxAiReplyTokopedia',
  },
  {
    id: 'shopee',
    label: 'Shopee',
    description: 'Chat Shopee.',
    field: 'inboxAiReplyShopee',
  },
];

const aiModuleToggleRows: Array<{
  id: string;
  label: string;
  description: string;
  field: keyof WebSettingDraft;
}> = [
  {
    id: 'tools',
    label: 'Tool analitik',
    description: 'Penjualan, source, stok, margin, wallet, dan cashflow.',
    field: 'daraToolsEnabled',
  },
  {
    id: 'knowledge',
    label: 'Knowledge SOP',
    description: 'Jawaban prosedur dari dokumen internal.',
    field: 'daraKnowledgeEnabled',
  },
  {
    id: 'insights',
    label: 'Insight otomatis',
    description: 'Stok kritis, penjualan turun, dan tugas jatuh tempo.',
    field: 'daraInsightsEnabled',
  },
  {
    id: 'report',
    label: 'Laporan harian otomatis',
    description: 'Ringkasan bisnis ke room Chat dengan DARA.',
    field: 'daraAutoReportEnabled',
  },
  {
    id: 'vision',
    label: 'Analisis gambar',
    description: 'Analisis katalog dan gambar dari inbox.',
    field: 'daraImageAnalysisEnabled',
  },
];

const daraSeoToggleRows: Array<{
  id: string;
  label: string;
  description: string;
  field: keyof WebSettingDraft;
}> = [
  {
    id: 'seo',
    label: 'DARA SEO',
    description: 'Aktifkan SEO dan market intelligence.',
    field: 'daraSeoEnabled',
  },
  {
    id: 'monitor',
    label: 'Monitor SEO',
    description: 'Pantau performa halaman dan peluang konten.',
    field: 'daraSeoMonitorEnabled',
  },
  {
    id: 'sentiment',
    label: 'Sentiment LLM',
    description: 'Analisis sentimen marketplace memakai LLM.',
    field: 'daraSeoSentimentLlmEnabled',
  },
  {
    id: 'market-scan',
    label: 'Market scan cron',
    description: 'Job scan pasar otomatis.',
    field: 'daraMarketScanCronEnabled',
  },
];

const daraTaxToggleRows: Array<{
  id: string;
  label: string;
  description: string;
  field: keyof WebSettingDraft;
}> = [
  {
    id: 'tax',
    label: 'DARA Tax',
    description: 'Aktifkan tax intelligence.',
    field: 'daraTaxEnabled',
  },
  {
    id: 'watcher',
    label: 'Watcher regulasi pajak',
    description: 'Pantau perubahan regulasi pajak otomatis.',
    field: 'daraTaxRegulationWatcherEnabled',
  },
  {
    id: 'compliance',
    label: 'Compliance job',
    description: 'Job pemeriksaan kepatuhan pajak.',
    field: 'daraTaxComplianceJobEnabled',
  },
  {
    id: 'narrative',
    label: 'Narasi pajak LLM',
    description: 'Aktifkan narasi LLM untuk pajak.',
    field: 'daraTaxLlmNarrativeEnabled',
  },
  {
    id: 'include-tax',
    label: 'Harga jual termasuk PPN',
    description: 'Default true jika backend belum mengirim nilai.',
    field: 'salePricesIncludeTax',
  },
  {
    id: 'commission-pph21',
    label: 'PPh 21 komisi',
    description: 'Potong PPh 21 pada komisi penjualan.',
    field: 'commissionPph21Enabled',
  },
];

const daraFulfillmentToggleRows: Array<{
  id: string;
  label: string;
  description: string;
  field: keyof WebSettingDraft;
}> = [
  {
    id: 'auto',
    label: 'Auto fulfillment olshop',
    description: 'Aktifkan autopilot packing marketplace.',
    field: 'autoOlshopFulfillmentEnabled',
  },
  {
    id: 'shopee',
    label: 'Shopee',
    description: 'Autopilot fulfillment untuk Shopee.',
    field: 'autoOlshopShopeeEnabled',
  },
  {
    id: 'tokopedia',
    label: 'Tokopedia',
    description: 'Autopilot fulfillment untuk Tokopedia.',
    field: 'autoOlshopTokopediaEnabled',
  },
  {
    id: 'webstore',
    label: 'Webstore DARA',
    description: 'Aktifkan fulfillment webstore DARA.',
    field: 'daraWebstoreFulfillmentEnabled',
  },
];

const daraNightOpsToggleRows: Array<{
  id: string;
  label: string;
  description: string;
  field: keyof WebSettingDraft;
}> = [
  {
    id: 'staff-ops',
    label: 'Notifikasi operasional staff',
    description: 'Aktifkan notifikasi operasional internal.',
    field: 'daraStaffOpsNotifyEnabled',
  },
  {
    id: 'staff-wa',
    label: 'WhatsApp staff',
    description: 'Kirim notifikasi staff melalui WhatsApp.',
    field: 'daraStaffWaNotifyEnabled',
  },
  {
    id: 'customer',
    label: 'Notifikasi customer olshop',
    description: 'Kirim konteks tertunda ke customer olshop.',
    field: 'daraOlshopCustomerNotifyEnabled',
  },
  {
    id: 'stock-gate',
    label: 'Stock gate olshop',
    description: 'Cek umur sinkronisasi stok sebelum proses tertunda.',
    field: 'daraOlshopStockGateEnabled',
  },
  {
    id: 'ops-audit',
    label: 'Audit operasional',
    description: 'Catat audit untuk proses operasional DARA.',
    field: 'daraOpsAuditEnabled',
  },
  {
    id: 'owner-digest',
    label: 'Digest owner',
    description: 'Ringkasan owner harian.',
    field: 'daraOwnerDigestEnabled',
  },
  {
    id: 'owner-wa',
    label: 'Digest owner WhatsApp',
    description: 'Kirim digest owner melalui WhatsApp.',
    field: 'daraOwnerDigestWaEnabled',
  },
  {
    id: 'owner-fcm',
    label: 'Digest owner FCM',
    description: 'Kirim digest owner melalui FCM.',
    field: 'daraOwnerDigestFcmEnabled',
  },
  {
    id: 'urgent-fcm',
    label: 'FCM urgent owner',
    description: 'Kirim notifikasi urgent owner melalui FCM.',
    field: 'daraOwnerFcmUrgentEnabled',
  },
];

const daraKnowledgeCategories = [
  ['sop_kasir', 'SOP Kasir'],
  ['sop_retur', 'SOP Retur'],
  ['sop_opname', 'SOP Opname'],
  ['sop_stok', 'SOP Stok'],
  ['kebijakan', 'Kebijakan'],
  ['panduan_operasional', 'Panduan operasional'],
] as const;

const REGION_TABLE_PAGE_SIZE = 10;
const WEB_CONTENT_ROWS_PAGE_SIZE = 10;

export function KolamSettingsWebConfigSurface({
  fields,
  maintenanceMode,
  marketplaceLandingOverview,
  financialSummaryRows,
  financialMessage = '',
  financialSectionVisibility = {
    paymentMethods: false,
    taxProfile: false,
    overtime: false,
    enclosureCommission: false,
    taxEdit: false,
    any: false,
  },
  financialStatus = 'idle',
  financialWallets = [],
  daraKnowledgeDraft = defaultDaraKnowledgeDraft,
  daraKnowledgeMessage = '',
  daraKnowledgeSaveStatus = 'idle',
  operationalRooms,
  operationalStaffRows,
  regionLevel,
  regionProvinceRows,
  regionRegencyRows,
  regionDistrictRows,
  regionVillageRows,
  regionRows,
  selectedProvince,
  selectedRegency,
  selectedDistrict,
  selectedVillage,
  regionSyncMessage,
  regionSyncStatus,
  regionSyncSummaryRows,
  marketplaceLandingHeroDraft,
  marketplaceLandingCategoryDraft,
  marketplaceLandingAnnouncementDraft,
  marketplaceLandingCtaDraft,
  marketplaceLandingYoutubeDraft,
  marketplaceLandingNoticeDraft,
  marketplaceLandingSaveStatus,
  marketplaceLandingMessage,
  marketplaceLandingAssetStatus,
  marketplaceCategories = [],
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
  onDeleteMarketplaceCategoryBanner,
  onDeleteMarketplaceFeaturedCollection,
  onDeleteMarketplaceHeroSlide,
  onDeleteMarketplaceLandingNotice,
  onEditMarketplaceAnnouncementBanner,
  onEditMarketplaceCategoryBanner,
  onEditMarketplaceHeroSlide,
  onEditMarketplaceLandingNotice,
  onMoveMarketplaceAnnouncementBanner,
  onMoveMarketplaceCategoryBanner,
  onMoveMarketplaceFeaturedCollection,
  onMoveMarketplaceHeroSlide,
  onAddMarketplaceFeaturedCollection = noop,
  onUpdateMarketplaceFeaturedCollection = noop,
  onUpdateMarketplaceBioactiveStep = noop,
  onSaveMarketplaceFeaturedCollections = noop,
  onSaveMarketplaceBioactiveEcosystem = noop,
  onPickMarketplaceLandingAnnouncementImage,
  onPickMarketplaceLandingCategoryImage,
  onPickMarketplaceLandingHeroImage,
  onClearMarketplaceAnnouncementDraft,
  onClearMarketplaceCategoryDraft,
  onClearMarketplaceHeroDraft,
  onSaveMarketplaceLandingCta,
  onSaveMarketplaceAnnouncementBanner,
  onSaveMarketplaceCategoryBanner,
  onSaveMarketplaceHeroSlide,
  onSaveMarketplaceLandingYoutube,
  onSaveMarketplaceLandingNotice,
  onSaveDaraKnowledge = noop,
  onClearPaymentMethodDraft = noop,
  onDeletePaymentMethod = noop,
  onDeletePaymentMethodPhoto = noop,
  onEditPaymentMethod = noop,
  onSaveEnclosureSaleCommission = noop,
  onSaveFinancialTaxToggle = noop,
  onSaveOvertimeSettings = noop,
  onSavePaymentMethod = noop,
  onSaveTaxCompanyProfile = noop,
  onUploadMarketplaceAnnouncementImage,
  onUploadMarketplaceBioactiveStepImage,
  onUploadMarketplaceCategoryBannerImage,
  onUploadMarketplaceCtaBackground,
  onUploadMarketplaceFeaturedCollectionImage,
  onUploadMarketplaceHeroImage,
  onUploadMarketplaceLogo,
  onUploadMarketplaceYoutubeBackground,
  onUploadPaymentMethodPhoto = noop,
  onRefreshRegionSync,
  onRefreshKpiWeeklyPreview,
  onRunRegionSync,
  onSaveKpiSettings,
  onSaveNotificationFirebase = noop,
  onSaveNotificationOtpSmtp = noop,
  onSaveNotificationToggle = noopSaveNotificationToggle,
  onSaveShippingOrigin = noop,
  onSaveStoreOperatingHours = noop,
  onSaveOperationalComplaintPeriod = noop,
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
  setMarketplaceLandingAnnouncementDraftField,
  setMarketplaceLandingCategoryDraftField,
  setMarketplaceLandingHeroDraftField,
  setMarketplaceLandingTabId,
  setKpiEnabledRule,
  setKpiSettingsDraftField,
  setMarketplaceLandingYoutubeDraftField,
  setMarketplaceLandingNoticeDraftField,
  setPaymentMethodDraftField = noopSetPaymentMethodDraftField,
  setPaymentMethodFilter = noopSetPaymentMethodFilter,
  setDaraKnowledgeDraftField = noopSetDaraKnowledgeDraftField,
  setWebContentPanelId,
  setRegionSelection,
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
  setTaxCompanyProfileDraftField = noopSetTaxCompanyProfileDraftField,
  setDraftField,
  storefrontEnabled,
  paymentMethodDraft = defaultPaymentMethodDraft,
  paymentMethodFilters = defaultPaymentMethodFilters,
  paymentMethodTotal = 0,
  paymentMethodTotalPages = 1,
  paymentMethods = [],
  taxCompanyProfile = null,
  taxCompanyProfileDraft = {},
  taxPartyGaps = null,
  draft,
  notificationSoundStatus,
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
  financialMessage?: string;
  financialSectionVisibility?: SettingsFinancialSectionVisibility;
  financialStatus?: 'idle' | 'loading' | 'live' | 'saving' | 'error';
  financialWallets?: KolamFinancialWallet[];
  daraKnowledgeDraft?: DaraKnowledgeDraft;
  daraKnowledgeMessage?: string;
  daraKnowledgeSaveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  operationalRooms: KolamTeamChatRoom[];
  operationalStaffRows: KolamUserPickerRow[];
  regionLevel: KolamRegionLevel | '';
  regionProvinceRows: KolamRegion[];
  regionRegencyRows: KolamRegion[];
  regionDistrictRows: KolamRegion[];
  regionVillageRows: KolamRegion[];
  regionRows: KolamRegion[];
  selectedProvince: string;
  selectedRegency: string;
  selectedDistrict: string;
  selectedVillage: string;
  regionSyncMessage: string;
  regionSyncStatus: 'idle' | 'loading' | 'live' | 'syncing' | 'error';
  regionSyncSummaryRows: RegionSyncSummaryRow[];
  marketplaceLandingHeroDraft: MarketplaceLandingHeroDraft;
  marketplaceLandingCategoryDraft: MarketplaceLandingCategoryDraft;
  marketplaceLandingAnnouncementDraft: MarketplaceLandingAnnouncementDraft;
  marketplaceLandingCtaDraft: MarketplaceLandingCtaDraft;
  marketplaceLandingYoutubeDraft: MarketplaceLandingYoutubeDraft;
  marketplaceLandingNoticeDraft: MarketplaceLandingNoticeDraft;
  marketplaceLandingSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  marketplaceLandingMessage: string;
  marketplaceLandingAssetStatus: Partial<
    Record<string, 'idle' | 'uploading' | 'deleting' | 'reordering'>
  >;
  marketplaceCategories?: KolamCategory[];
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
  paymentMethodDraft?: SettingsPaymentMethodDraft;
  paymentMethodFilters?: SettingsPaymentMethodFilters;
  paymentMethodTotal?: number;
  paymentMethodTotalPages?: number;
  paymentMethods?: KolamPaymentMethod[];
  taxCompanyProfile?: KolamTaxCompanyProfile | null;
  taxCompanyProfileDraft?: KolamTaxCompanyProfile;
  taxPartyGaps?: KolamTaxPartyGapsSummary | null;
  onClearMarketplaceLandingNoticeDraft: () => void;
  onClearPaymentMethodDraft?: () => void;
  onDeleteMarketplaceAnnouncementBanner: (
    banner: KolamAnnouncementBanner,
  ) => void;
  onDeleteMarketplaceBioactiveStep?: (index: number) => void;
  onDeleteMarketplaceCategoryBanner: (banner: KolamCategoryBanner) => void;
  onDeleteMarketplaceFeaturedCollection: (index: number) => void;
  onDeleteMarketplaceHeroSlide: (slide: KolamHeroSlide) => void;
  onDeleteMarketplaceLandingNotice: (key: string) => void;
  onDeletePaymentMethod?: (id: string) => void;
  onDeletePaymentMethodPhoto?: (id: string) => void;
  onEditMarketplaceAnnouncementBanner: (
    banner: KolamAnnouncementBanner,
  ) => void;
  onEditMarketplaceCategoryBanner: (banner: KolamCategoryBanner) => void;
  onEditMarketplaceHeroSlide: (slide: KolamHeroSlide) => void;
  onEditMarketplaceLandingNotice: (notice: KolamCustomerTextNotice) => void;
  onEditPaymentMethod?: (method: KolamPaymentMethod) => void;
  onMoveMarketplaceAnnouncementBanner: (
    banner: KolamAnnouncementBanner,
    direction: -1 | 1,
  ) => void;
  onMoveMarketplaceBioactiveStep?: (index: number, direction: -1 | 1) => void;
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
  onAddMarketplaceFeaturedCollection?: () => void;
  onUpdateMarketplaceFeaturedCollection?: (
    index: number,
    patch: Partial<KolamFeaturedCollection>,
  ) => void;
  onUpdateMarketplaceBioactiveStep?: (
    key: string,
    patch: Partial<KolamBioactiveEcosystemStep>,
  ) => void;
  onSaveMarketplaceFeaturedCollections?: () => void;
  onSaveMarketplaceBioactiveEcosystem?: () => void;
  onPickMarketplaceLandingAnnouncementImage: () => void;
  onPickMarketplaceLandingCategoryImage: () => void;
  onPickMarketplaceLandingHeroImage: () => void;
  onClearMarketplaceAnnouncementDraft: () => void;
  onClearMarketplaceCategoryDraft: () => void;
  onClearMarketplaceHeroDraft: () => void;
  onSaveMarketplaceLandingCta: () => void;
  onSaveMarketplaceAnnouncementBanner: () => void;
  onSaveMarketplaceCategoryBanner: () => void;
  onSaveMarketplaceHeroSlide: () => void;
  onSaveMarketplaceLandingYoutube: () => void;
  onSaveMarketplaceLandingNotice: () => void;
  onSaveDaraKnowledge?: () => void;
  onSaveEnclosureSaleCommission?: () => void;
  onSaveFinancialTaxToggle?: (
    key: 'salePricesIncludeTax' | 'commissionPph21Enabled',
    value: boolean,
  ) => void;
  onSaveOvertimeSettings?: () => void;
  onSavePaymentMethod?: () => void;
  onSaveTaxCompanyProfile?: () => void;
  onUploadMarketplaceAnnouncementImage: (
    banner: KolamAnnouncementBanner,
  ) => void;
  onUploadMarketplaceBioactiveStepImage: (index: number) => void;
  onUploadMarketplaceCategoryBannerImage: (banner: KolamCategoryBanner) => void;
  onUploadMarketplaceCtaBackground: () => void;
  onUploadMarketplaceDaraAvatar?: () => void;
  onUploadMarketplaceFeaturedCollectionImage: (index: number) => void;
  onUploadMarketplaceHeroImage: (slide: KolamHeroSlide) => void;
  onUploadMarketplaceLogo: () => void;
  onUploadMarketplaceYoutubeBackground: () => void;
  onUploadDaraWorkerPhoto?: () => void;
  onUploadPaymentMethodPhoto?: (id: string) => void;
  onRefreshRegionSync: () => void;
  onRefreshKpiWeeklyPreview: () => void;
  onRunRegionSync: (scope: KolamRegionSyncScope) => void;
  onSaveKpiSettings: () => void;
  onSaveNotificationFirebase?: () => void;
  onSaveNotificationOtpSmtp?: () => void;
  onSaveNotificationToggle?: (
    key: 'daraHandoffNotifyEnabled' | 'teamChatGroupCallEnabled',
    value: boolean,
  ) => void;
  onSaveShippingOrigin?: () => void;
  onSaveStoreOperatingHours?: () => void;
  onSaveOperationalComplaintPeriod?: () => void;
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
  setMarketplaceLandingAnnouncementDraftField: <
    Key extends keyof MarketplaceLandingAnnouncementDraft,
  >(
    key: Key,
    value: MarketplaceLandingAnnouncementDraft[Key],
  ) => void;
  setMarketplaceLandingCategoryDraftField: <
    Key extends keyof MarketplaceLandingCategoryDraft,
  >(
    key: Key,
    value: MarketplaceLandingCategoryDraft[Key],
  ) => void;
  setMarketplaceLandingCtaDraftField: <
    Key extends keyof MarketplaceLandingCtaDraft,
  >(
    key: Key,
    value: MarketplaceLandingCtaDraft[Key],
  ) => void;
  setMarketplaceLandingHeroDraftField: <
    Key extends keyof MarketplaceLandingHeroDraft,
  >(
    key: Key,
    value: MarketplaceLandingHeroDraft[Key],
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
  setPaymentMethodDraftField?: <Key extends keyof SettingsPaymentMethodDraft>(
    key: Key,
    value: SettingsPaymentMethodDraft[Key],
  ) => void;
  setPaymentMethodFilter?: (
    key: keyof SettingsPaymentMethodFilters,
    value: string | number,
  ) => void;
  setDaraKnowledgeDraftField?: <Key extends keyof DaraKnowledgeDraft>(
    key: Key,
    value: DaraKnowledgeDraft[Key],
  ) => void;
  setTaxCompanyProfileDraftField?: <Key extends keyof KolamTaxCompanyProfile>(
    key: Key,
    value: KolamTaxCompanyProfile[Key],
  ) => void;
  setWebContentPanelId: (id: 'marketplace' | 'blog' | 'blog-topics') => void;
  setRegionSelection: (
    key: 'province' | 'regency' | 'district' | 'village',
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
  setSitemapStaticPageField: (
    index: number,
    key: 'path' | 'enabled' | 'priority' | 'changeFrequency',
    value: string | boolean,
  ) => void;
  addSitemapStaticPage: () => void;
  removeSitemapStaticPage: (index: number) => void;
  setSitemapCustomUrlField: (
    index: number,
    key: 'path' | 'priority' | 'changeFrequency',
    value: string,
  ) => void;
  addSitemapCustomUrl: () => void;
  removeSitemapCustomUrl: (index: number) => void;
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
  const [marketplaceHeroEditorOpen, setMarketplaceHeroEditorOpen] =
    React.useState(false);
  const [marketplaceCategoryEditorOpen, setMarketplaceCategoryEditorOpen] =
    React.useState(false);
  const [marketplaceCategoryEditorImageUri, setMarketplaceCategoryEditorImageUri] =
    React.useState('');
  const openMarketplaceHeroCreate = React.useCallback(() => {
    onClearMarketplaceHeroDraft();
    setMarketplaceHeroEditorOpen(true);
  }, [onClearMarketplaceHeroDraft]);
  const openMarketplaceHeroEdit = React.useCallback(
    (slide: KolamHeroSlide) => {
      onEditMarketplaceHeroSlide(slide);
      setMarketplaceHeroEditorOpen(true);
    },
    [onEditMarketplaceHeroSlide],
  );
  const closeMarketplaceHeroEditor = React.useCallback(() => {
    onClearMarketplaceHeroDraft();
    setMarketplaceHeroEditorOpen(false);
  }, [onClearMarketplaceHeroDraft]);
  const openMarketplaceCategoryCreate = React.useCallback(() => {
    onClearMarketplaceCategoryDraft();
    setMarketplaceCategoryEditorImageUri('');
    setMarketplaceCategoryEditorOpen(true);
  }, [onClearMarketplaceCategoryDraft]);
  const openMarketplaceCategoryEdit = React.useCallback(
    (banner: KolamCategoryBanner) => {
      onEditMarketplaceCategoryBanner(banner);
      setMarketplaceCategoryEditorImageUri(
        resolveMarketplaceLandingImageUri(banner.image),
      );
      setMarketplaceCategoryEditorOpen(true);
    },
    [onEditMarketplaceCategoryBanner],
  );
  const closeMarketplaceCategoryEditor = React.useCallback(() => {
    onClearMarketplaceCategoryDraft();
    setMarketplaceCategoryEditorImageUri('');
    setMarketplaceCategoryEditorOpen(false);
  }, [onClearMarketplaceCategoryDraft]);
  React.useEffect(() => {
    if (marketplaceLandingTabId !== 'hero') {
      setMarketplaceHeroEditorOpen(false);
    }
    if (marketplaceLandingTabId !== 'category') {
      setMarketplaceCategoryEditorOpen(false);
    }
  }, [marketplaceLandingTabId]);
  const provinceDropdownOptions = React.useMemo(
    () => createRegionDropdownOptions('Provinsi', regionProvinceRows),
    [regionProvinceRows],
  );
  const regencyDropdownOptions = React.useMemo(
    () =>
      selectedProvince
        ? createRegionDropdownOptions(
            'Kota/kabupaten',
            regionRegencyRows,
          )
        : [{label: 'Kota/kabupaten', value: ''}],
    [regionRegencyRows, selectedProvince],
  );
  const districtDropdownOptions = React.useMemo(
    () =>
      selectedRegency
        ? createRegionDropdownOptions('Kecamatan', regionDistrictRows)
        : [{label: 'Kecamatan', value: ''}],
    [regionDistrictRows, selectedRegency],
  );
  const villageDropdownOptions = React.useMemo(
    () =>
      selectedDistrict
        ? createRegionDropdownOptions('Kelurahan', regionVillageRows)
        : [{label: 'Kelurahan', value: ''}],
    [regionVillageRows, selectedDistrict],
  );
  const regionLevelCards = React.useMemo(
    () =>
      regionSyncSummaryRows.map(row => ({
        ...row,
        label: getRegionCardLabel(row.id),
        syncScope: getRegionSyncScopeForLevel(row.id),
      })),
    [regionSyncSummaryRows],
  );
  const [regionPage, setRegionPage] = React.useState(1);
  const regionPageCount = Math.max(
    1,
    Math.ceil(regionRows.length / REGION_TABLE_PAGE_SIZE),
  );
  const safeRegionPage = Math.min(regionPage, regionPageCount);
  const pagedRegionRows = React.useMemo(
    () =>
      regionRows.slice(
        (safeRegionPage - 1) * REGION_TABLE_PAGE_SIZE,
        safeRegionPage * REGION_TABLE_PAGE_SIZE,
      ),
    [regionRows, safeRegionPage],
  );
  React.useEffect(() => {
    setRegionPage(1);
  }, [
    regionLevel,
    selectedDistrict,
    selectedProvince,
    selectedRegency,
    selectedVillage,
  ]);
  const generalFormSections = sections.filter(section => section.id === 'logo');
  const settingsFieldWidth = 460;
  const [storedMapsBrowserKey, setStoredMapsBrowserKey] = React.useState('');
  const [mapsBrowserKeyStatus, setMapsBrowserKeyStatus] = React.useState<
    'idle' | 'loading' | 'ready' | 'error'
  >('idle');
  const [mapsBrowserKeyMessage, setMapsBrowserKeyMessage] = React.useState('');
  const [timezoneOptions, setTimezoneOptions] = React.useState<
    KolamTimezoneOption[]
  >([]);
  const umumFieldWidth = 240;
  const [newMacAddress, setNewMacAddress] = React.useState('');
  const detectedMacAddresses = React.useMemo(
    () => getNativeDeviceIdentity().macAddresses ?? [],
    [],
  );
  const allowedMacAddresses = React.useMemo(
    () => parseMacAddressText(draft.kolamMacAccessAllowedMacAddresses),
    [draft.kolamMacAccessAllowedMacAddresses],
  );
  const setAllowedMacAddresses = React.useCallback(
    (addresses: string[]) => {
      setDraftField('kolamMacAccessAllowedMacAddresses', addresses.join('\n'));
    },
    [setDraftField],
  );
  const addAllowedMacAddress = React.useCallback(
    (value: string) => {
      if (disabled) {
        return;
      }

      const macAddress = normalizeMacAddressInput(value);

      if (!macAddress) {
        return;
      }

      const exists = allowedMacAddresses.some(
        item => item.toUpperCase() === macAddress.toUpperCase(),
      );

      if (!exists) {
        setAllowedMacAddresses([...allowedMacAddresses, macAddress]);
      }

      setNewMacAddress('');
    },
    [allowedMacAddresses, disabled, setAllowedMacAddresses],
  );
  const removeAllowedMacAddress = React.useCallback(
    (value: string) => {
      if (disabled) {
        return;
      }

      setAllowedMacAddresses(
        allowedMacAddresses.filter(
          item => item.toUpperCase() !== value.toUpperCase(),
        ),
      );
    },
    [allowedMacAddresses, disabled, setAllowedMacAddresses],
  );
  const chatPluginEnabled = draft.pluginControls.chat;
  const daraPluginEnabled = draft.pluginControls.dara;
  const kpiPluginEnabled = draft.pluginControls.kpi;
  const daraControlsDisabled = disabled || !daraPluginEnabled;
  const daraChatControlsDisabled =
    disabled || !chatPluginEnabled || !daraPluginEnabled;
  const notificationSoundItems = [
    {
      id: 'notification-sound',
      label: 'Chat terassign',
      type: 'assigned' as const,
      value: draft.notificationSound,
    },
    {
      id: 'unassigned-notification-sound',
      label: 'Chat belum assign',
      type: 'unassigned' as const,
      value: draft.unassignedNotificationSound,
    },
    {
      id: 'handoff-notification-sound',
      label: 'Suara butuh handover',
      type: 'handoff' as const,
      value: draft.handoffNotificationSound,
    },
    {
      id: 'group-call-ringtone',
      label: 'Nada dering call grup',
      type: 'group-call' as const,
      value: draft.groupCallRingtone,
    },
    {
      id: 'sales-notification-sound',
      label: 'Penjualan & bell',
      type: 'sales' as const,
      value: draft.salesNotificationSound,
    },
  ];
  const notificationSoundPreviewService = React.useMemo(
    () =>
      createKolamNotificationSoundService({
        adapter: createKolamRuntimeNotificationSoundAdapter(),
        cooldownMs: 0,
      }),
    [],
  );
  const [workSiteGeocodeQueries, setWorkSiteGeocodeQueries] = React.useState<
    Record<string, string>
  >({});
  const [workSiteGeocodeStatus, setWorkSiteGeocodeStatus] = React.useState<
    Record<
      string,
      { message: string; status: 'idle' | 'loading' | 'saved' | 'error' }
    >
  >({});
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
    Promise.resolve(
      notificationSoundPreviewService.play({
        intent: item.type,
        webSetting: {
          groupCallRingtone: draft.groupCallRingtone,
          handoffNotificationSound: draft.handoffNotificationSound,
          notificationSound: draft.notificationSound,
          salesNotificationSound: draft.salesNotificationSound,
          unassignedNotificationSound: draft.unassignedNotificationSound,
        },
      }),
    ).catch(() => undefined);
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
  const daraRoomOptions =
    draft.daraFulfillmentTeamRoomId &&
    !operationalRooms.some(room => room._id === draft.daraFulfillmentTeamRoomId)
      ? [
          {
            _id: draft.daraFulfillmentTeamRoomId,
            name: 'Room fulfillment tersimpan',
          } satisfies KolamTeamChatRoom,
          ...operationalRooms,
        ]
      : operationalRooms;
  const daraPenjualanRoomOptions =
    draft.daraPenjualanTeamRoomId &&
    !daraRoomOptions.some(room => room._id === draft.daraPenjualanTeamRoomId)
      ? [
          {
            _id: draft.daraPenjualanTeamRoomId,
            name: 'Room penjualan tersimpan',
          } satisfies KolamTeamChatRoom,
          ...daraRoomOptions,
        ]
      : daraRoomOptions;
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
                  accessibilityRole="checkbox"
                  accessibilityState={{checked, disabled}}
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
                  <Text numberOfLines={1} style={styles.poStaffCheckboxLabel}>
                    {getUserPickerLabel(staff)}
                  </Text>
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
    toggle?: {
      active: boolean;
      label: string;
      onPress: () => void;
    },
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
        <View style={styles.notificationSoundActionCell}>
          <KolamActionControlButton
            label="Tes suara"
            disabled={busy}
            onPress={() => playNotificationSound(item)}
          />
        </View>
        <View style={styles.notificationSoundActionCell}>
          <KolamActionControlButton
            label="Unggah"
            loading={status === 'uploading'}
            loadingLabel="Mengunggah..."
            disabled={disabled || busy}
            onPress={() => onUploadNotificationSound(item.type)}
          />
        </View>
        <View style={styles.notificationSoundActionCell}>
          <KolamActionControlButton
            label="Atur ulang"
            intent="danger"
            loading={status === 'deleting'}
            loadingLabel="Mengatur ulang..."
            disabled={disabled || busy || !item.value}
            onPress={() => onDeleteNotificationSound(item.type)}
          />
        </View>
        <View style={styles.notificationSoundToggleCell}>
          {toggle ? (
            <Pressable
              accessibilityLabel={toggle.label}
              disabled={disabled}
              onPress={() => {
                if (!disabled) {
                  toggle.onPress();
                }
              }}
              style={[
                styles.notificationSoundSwitch,
                toggle.active && styles.notificationSoundSwitchActive,
                disabled && styles.notificationSoundSwitchDisabled,
              ]}
            >
              <View
                style={[
                  styles.notificationSoundSwitchKnob,
                  toggle.active && styles.notificationSoundSwitchKnobActive,
                ]}
              />
            </Pressable>
          ) : (
            <Text style={styles.notificationSoundToggleEmpty}>-</Text>
          )}
        </View>
      </View>
    );
  };

  const originPinpointCoordinates = React.useMemo(() => {
    const latitude = parseOriginCoordinate(draft.originLatitude);
    const longitude = parseOriginCoordinate(draft.originLongitude);

    if (latitude === null || longitude === null) {
      return null;
    }

    return { latitude, longitude };
  }, [draft.originLatitude, draft.originLongitude]);
  const originAddressLabel = React.useMemo(
    () =>
      [
        draft.originAddressLine1,
        draft.originCity,
        draft.originProvince,
        draft.originPostalCode,
      ]
        .map(value => value.trim())
        .filter(Boolean)
        .join(', ') || 'Asal pengiriman',
    [
      draft.originAddressLine1,
      draft.originCity,
      draft.originPostalCode,
      draft.originProvince,
    ],
  );
  const mapsBrowserKeyFromDraft = stripMaskedSecret(
    draft.googleMapsBrowserApiKey,
  );
  const activeMapsBrowserKey =
    mapsBrowserKeyFromDraft || storedMapsBrowserKey.trim();
  const originPinpointMapHtml = React.useMemo(() => {
    if (!originPinpointCoordinates || !activeMapsBrowserKey) {
      return '';
    }

    return createOriginPinpointMapHtml({
      address: originAddressLabel,
      apiKey: activeMapsBrowserKey,
      coordinates: originPinpointCoordinates,
    });
  }, [activeMapsBrowserKey, originAddressLabel, originPinpointCoordinates]);
  const shouldFetchStoredMapsBrowserKey =
    showStoreShippingSettings &&
    draft.googleMapsBrowserApiKey === MASKED_SECRET_PLACEHOLDER &&
    !storedMapsBrowserKey;

  React.useEffect(() => {
    let cancelled = false;

    if (!shouldFetchStoredMapsBrowserKey) {
      return () => {
        cancelled = true;
      };
    }

    setMapsBrowserKeyStatus('loading');
    setMapsBrowserKeyMessage('Memuat Google Maps API key tersimpan...');
    getKolamGoogleMapsBrowserKey()
      .then(key => {
        if (cancelled) {
          return;
        }

        setStoredMapsBrowserKey(key);
        setMapsBrowserKeyStatus(key ? 'ready' : 'idle');
        setMapsBrowserKeyMessage(
          key
            ? ''
            : 'Google Maps API key browser belum aktif. Isi key di field Pengiriman untuk menampilkan peta.',
        );
      })
      .catch(error => {
        if (cancelled) {
          return;
        }

        setMapsBrowserKeyStatus('error');
        setMapsBrowserKeyMessage(
          error instanceof Error
            ? error.message
            : 'Gagal memuat Google Maps API key browser.',
        );
      });

    return () => {
      cancelled = true;
    };
  }, [shouldFetchStoredMapsBrowserKey]);

  React.useEffect(() => {
    let cancelled = false;

    if (!showStoreShippingSettings && !showOperationalSettings) {
      return () => {
        cancelled = true;
      };
    }

    ensureKolamTimezoneDatabase()
      .then(options => {
        if (!cancelled) {
          setTimezoneOptions(options);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTimezoneOptions([
            {
              id: draft.storeOperatingHoursTimezone || 'Asia/Jakarta',
              label: draft.storeOperatingHoursTimezone || 'Asia/Jakarta',
              region: 'Local',
            },
          ]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    draft.storeOperatingHoursTimezone,
    showOperationalSettings,
    showStoreShippingSettings,
  ]);

  const timezoneDropdownOptions = React.useMemo(() => {
    const currentTimezone =
      draft.storeOperatingHoursTimezone.trim() || 'Asia/Jakarta';
    const options = timezoneOptions.map(option => ({
      label: option.label,
      value: option.id,
    }));

    if (!options.some(option => option.value === currentTimezone)) {
      options.unshift({
        label: currentTimezone,
        value: currentTimezone,
      });
    }

    return options;
  }, [draft.storeOperatingHoursTimezone, timezoneOptions]);
  const attendanceTimezoneDropdownOptions = React.useMemo(() => {
    const currentTimezone = draft.staffAttendanceTimezone.trim() || 'Asia/Jakarta';
    const options = timezoneOptions.map(option => ({
      label: option.label,
      value: option.id,
    }));

    if (!options.some(option => option.value === currentTimezone)) {
      options.unshift({
        label: currentTimezone,
        value: currentTimezone,
      });
    }

    return options;
  }, [draft.staffAttendanceTimezone, timezoneOptions]);

  const handleOriginPinpointMessage = React.useCallback(
    (event: { nativeEvent?: { data?: string } }) => {
      if (disabled) {
        return;
      }

      try {
        const payload = JSON.parse(event.nativeEvent?.data ?? '{}') as {
          latitude?: unknown;
          longitude?: unknown;
          type?: string;
        };
        const latitude = Number(payload.latitude);
        const longitude = Number(payload.longitude);

        if (
          payload.type !== 'origin-pinpoint-change' ||
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude)
        ) {
          return;
        }

        setDraftField('originLatitude', latitude.toFixed(7));
        setDraftField('originLongitude', longitude.toFixed(7));
      } catch {
        // Ignore malformed messages from the WebView boundary.
      }
    },
    [disabled, setDraftField],
  );

  return (
    <KolamContentFrame variant="settingsWebConfig">
      {showGeneralSettings ? (
        <>
          <View style={styles.umumTopRow}>
            <View style={styles.umumCard}>
              <KolamSettingsWebFormSectionHeader
                description="Nomor versi per aplikasi. Disimpan lewat endpoint version WebSetting."
                title="Versi aplikasi"
              />
              <KolamTextFieldRow
                variant="settingsForm"
                fieldWidth={umumFieldWidth}
                label="Versi Kolam"
                description="App Kolam"
                value={draft.versionKolam}
                onChangeText={value => setDraftField('versionKolam', value)}
                placeholder="1.0.0"
              />
              <KolamTextFieldRow
                variant="settingsForm"
                fieldWidth={umumFieldWidth}
                label="Versi Enclonura"
                description="App Enclonura"
                value={draft.versionEnclonura}
                onChangeText={value => setDraftField('versionEnclonura', value)}
                placeholder="1.0.0"
              />
              <KolamTextFieldRow
                variant="settingsForm"
                fieldWidth={umumFieldWidth}
                label="Versi POS"
                description="App POS"
                value={draft.versionPos}
                onChangeText={value => setDraftField('versionPos', value)}
                placeholder="1.0.0"
              />
              <KolamTextFieldRow
                variant="settingsForm"
                fieldWidth={umumFieldWidth}
                label="Versi Marketplace"
                description="App marketplace"
                value={draft.versionMarketplace}
                onChangeText={value =>
                  setDraftField('versionMarketplace', value)
                }
                placeholder="1.0.0"
              />
            </View>

            <View style={styles.umumCard}>
              <KolamSettingsWebFormSectionHeader
                description="Logo, nama, tagline, kontak, dan alamat perusahaan untuk branding storefront."
                title="Identitas perusahaan"
              />
              {generalFormSections.map(section => (
                <KolamSettingsWebFormFields
                  key={section.id}
                  fields={section.fields}
                  layout={section.layout}
                  onUploadFile={onUploadMarketplaceLogo}
                />
              ))}
              <KolamTextFieldRow
                variant="settingsForm"
                fieldWidth={umumFieldWidth}
                label="Nama perusahaan"
                description="Nama branding storefront."
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
                fieldWidth={umumFieldWidth}
                label="Tagline"
                description="Tagline branding."
                value={draft.companyTagline}
                onChangeText={value => setDraftField('companyTagline', value)}
                placeholder="Toko hewan terpercaya"
              />
              <KolamTextFieldRow
                variant="settingsForm"
                fieldWidth={umumFieldWidth}
                label="Telepon"
                description="Nomor kontak customer."
                value={draft.phone}
                onChangeText={value => setDraftField('phone', value)}
                placeholder="+62 812-3456-7890"
              />
              <KolamTextFieldRow
                variant="settingsForm"
                fieldWidth={umumFieldWidth}
                label="Email"
                description="Email kontak customer."
                value={draft.email}
                onChangeText={value => setDraftField('email', value)}
                placeholder="info@duniaanura.com"
              />
              <KolamTextFieldRow
                variant="settingsForm"
                fieldWidth={umumFieldWidth}
                label="Alamat"
                description="Alamat bisnis utama."
                multiline
                numberOfLines={4}
                value={draft.address}
                onChangeText={value => setDraftField('address', value)}
                placeholder="Jl. Contoh No. 1"
              />
            </View>
          </View>
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
          <View style={styles.umumTopRow}>
            <View style={styles.umumCard}>
              <KolamSettingsWebFormSectionHeader
                description="Tautan sosial media yang tampil di storefront."
                title="Sosial media"
              />
              <SocialMediaFieldRow
                accentColor="#1877f2"
                fieldWidth={umumFieldWidth}
                label="Facebook"
                logoXml={getSocialMediaLogoXml('facebook')}
                onChangeText={value => setDraftField('facebook', value)}
                placeholder="https://facebook.com/..."
                value={draft.facebook}
              />
              <SocialMediaFieldRow
                accentColor="#e4405f"
                fieldWidth={umumFieldWidth}
                label="Instagram"
                logoXml={getSocialMediaLogoXml('instagram')}
                onChangeText={value => setDraftField('instagram', value)}
                placeholder="https://instagram.com/..."
                value={draft.instagram}
              />
              <SocialMediaFieldRow
                accentColor="#000000"
                fieldWidth={umumFieldWidth}
                label="Twitter / X"
                logoXml={getSocialMediaLogoXml('x')}
                onChangeText={value => setDraftField('twitter', value)}
                placeholder="https://twitter.com/..."
                value={draft.twitter}
              />
              <SocialMediaFieldRow
                accentColor="#ff0000"
                fieldWidth={umumFieldWidth}
                label="YouTube"
                logoXml={getSocialMediaLogoXml('youtube')}
                onChangeText={value => setDraftField('youtube', value)}
                placeholder="https://youtube.com/..."
                value={draft.youtube}
              />
              <SocialMediaFieldRow
                accentColor="#111827"
                fieldWidth={umumFieldWidth}
                label="TikTok"
                logoXml={getSocialMediaLogoXml('tiktok')}
                onChangeText={value => setDraftField('tiktok', value)}
                placeholder="https://tiktok.com/..."
                value={draft.tiktok}
              />
            </View>

            <View style={styles.umumCard}>
              <KolamSettingsWebFormSectionHeader
                description="Kelola akses Kolam Desktop dari pengaturan web dan MAC yang dikirim aplikasi desktop."
                title="Pembatasan MAC Kolam"
              />
              <KolamToggleRow
                variant="settingsForm"
                label={`Redirect browser ke ${STAFF_DESKTOP_REDIRECT_URL}`}
                description="Kolam Desktop, POS Desktop, dan Android Team Chat tidak terpengaruh."
                active={draft.staffDesktopOnlyEnabled}
                onPress={() =>
                  !disabled &&
                  setDraftField(
                    'staffDesktopOnlyEnabled',
                    !draft.staffDesktopOnlyEnabled,
                  )
                }
              />
              <KolamToggleRow
                variant="settingsForm"
                label="Aktifkan pembatasan MAC"
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
                label="Izinkan login browser"
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
                label="Lewati super administrator"
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

              <View style={styles.umumMacDetectedCard}>
                <Text style={styles.umumMacCardTitle}>MAC terdeteksi</Text>
                <Text style={styles.umumMacCardDescription}>
                  Buka Settings ini dari Kolam Desktop untuk mengambil MAC
                  perangkat aktif.
                </Text>
                <View style={styles.umumMacList}>
                  {detectedMacAddresses.length > 0 ? (
                    detectedMacAddresses.map(macAddress => (
                      <View key={macAddress} style={styles.umumMacListRow}>
                        <Text style={styles.umumMacCode}>{macAddress}</Text>
                        <KolamActionControlButton
                          label="Tambah ke daftar"
                          disabled={disabled}
                          onPress={() => addAllowedMacAddress(macAddress)}
                        />
                      </View>
                    ))
                  ) : (
                    <Text style={styles.umumMacEmpty}>
                      Belum ada MAC terdeteksi.
                    </Text>
                  )}
                </View>
              </View>

              <KolamTextFieldRow
                variant="settingsForm"
                fieldWidth={umumFieldWidth}
                label="MAC address"
                description="Tambahkan MAC perangkat yang diizinkan."
                value={newMacAddress}
                onChangeText={setNewMacAddress}
                placeholder="AA:BB:CC:DD:EE:FF"
              />
              <View style={styles.umumMacActions}>
                <KolamActionControlButton
                  label="Tambah"
                  disabled={disabled || !newMacAddress.trim()}
                  onPress={() => addAllowedMacAddress(newMacAddress)}
                />
              </View>
              <View style={styles.umumMacList}>
                {allowedMacAddresses.length > 0 ? (
                  allowedMacAddresses.map(macAddress => (
                    <View key={macAddress} style={styles.umumMacListRow}>
                      <Text style={styles.umumMacCode}>{macAddress}</Text>
                      <KolamActionControlButton
                        label="Hapus"
                        intent="danger"
                        disabled={disabled}
                        onPress={() => removeAllowedMacAddress(macAddress)}
                      />
                    </View>
                  ))
                ) : (
                  <Text style={styles.umumMacEmpty}>
                    Belum ada MAC terdaftar.
                  </Text>
                )}
              </View>
            </View>
          </View>
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
        </>
      ) : null}
      {showOperationalSettings ? (
        <>
          <View
            style={[
              styles.marketplaceControlSection,
              styles.notificationSettingsCard,
              styles.settingsTabCardSpacing,
            ]}
          >
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
            <View style={styles.notificationToggleGrid}>
              <View style={styles.notificationToggleBox}>
                <KolamToggleRow
                  variant="settingsForm"
                  label="POS"
                  description="Maintenance POS."
                  active={draft.maintenancePos}
                  onPress={() => {
                    if (disabled) {
                      return;
                    }
                    onSaveOperationalMaintenance('pos', !draft.maintenancePos);
                  }}
                />
              </View>
              <View style={styles.notificationToggleBox}>
                <KolamToggleRow
                  variant="settingsForm"
                  label="Marketplace"
                  description="Maintenance web toko."
                  active={draft.maintenanceMarketplace}
                  onPress={() =>
                    !disabled &&
                    onSaveOperationalMaintenance(
                      'marketplace',
                      !draft.maintenanceMarketplace,
                    )
                  }
                />
              </View>
            </View>
          </View>
          <View
            style={[
              styles.marketplaceControlSection,
              styles.notificationSettingsCard,
              styles.settingsTabCardSpacing,
            ]}
          >
            <View style={styles.operationalCardHeaderRow}>
              <KolamCopyStack
                containerStyle={styles.operationalCardHeaderCopy}
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
            </View>
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
          </View>
          <View
            style={[
              styles.marketplaceControlSection,
              styles.notificationSettingsCard,
              styles.settingsTabCardSpacing,
            ]}
          >
            <View style={styles.operationalCardHeaderRow}>
              <KolamCopyStack
                containerStyle={styles.operationalCardHeaderCopy}
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
              <KolamActionControlButton
                label="Simpan absensi"
                loading={saveStatus === 'saving'}
                loadingLabel="Menyimpan..."
                disabled={disabled}
                onPress={onSaveOperationalStaffAttendance}
              />
            </View>
            <View style={styles.operationalAttendanceGrid}>
              <View style={styles.operationalAttendanceBox}>
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
                    setDraftField(
                      'staffAttendanceLateCheckInDeadlineMinutes',
                      value,
                    )
                  }
                  placeholder="240"
                />
                <KolamTextFieldRow
                  variant="settingsForm"
                  label="Denda telat tier 2"
                  description="Nominal denda tier 2."
                  value={draft.staffAttendanceLateFineTier2}
                  onChangeText={value =>
                    setDraftField('staffAttendanceLateFineTier2', value)
                  }
                  placeholder="50000"
                  renderInput={() => (
                    <KolamRupiahField
                      onChangeValue={value =>
                        setDraftField('staffAttendanceLateFineTier2', String(value))
                      }
                      style={{ width: 230 }}
                      value={Number(draft.staffAttendanceLateFineTier2) || 0}
                    />
                  )}
                />
                <KolamTextFieldRow
                  variant="settingsForm"
                  label="Denda telat tier 3"
                  description="Nominal denda tier 3."
                  value={draft.staffAttendanceLateFineTier3}
                  onChangeText={value =>
                    setDraftField('staffAttendanceLateFineTier3', value)
                  }
                  placeholder="100000"
                  renderInput={() => (
                    <KolamRupiahField
                      onChangeValue={value =>
                        setDraftField('staffAttendanceLateFineTier3', String(value))
                      }
                      style={{ width: 230 }}
                      value={Number(draft.staffAttendanceLateFineTier3) || 0}
                    />
                  )}
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
              </View>
              <View style={styles.operationalAttendanceBox}>
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
                      label="OpenStreetMap"
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
                      label="Google Maps"
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
                    description="Opsional jika key yang sama sudah di tab Pengiriman. Kosongkan untuk pakai key Toko."
                    value={draft.staffAttendanceGoogleMapsBrowserApiKey}
                    onChangeText={value =>
                      setDraftField(
                        'staffAttendanceGoogleMapsBrowserApiKey',
                        value,
                      )
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
                          text: 'Cari alamat, lalu isi koordinat dan radius validasi check-in.',
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
                        const geocodeLoading =
                          geocodeStatus?.status === 'loading';
                        const geocodeDisabled =
                          disabled ||
                          geocodeLoading ||
                          !geocodeQuery.trim() ||
                          draft.staffAttendanceMapProvider === 'google';

                        return (
                          <View key={siteKey} style={styles.workSiteCard}>
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
                                onPress={() =>
                                  removeStaffAttendanceWorkSite(index)
                                }
                              />
                            </View>
                            <View style={styles.workSiteCompactFields}>
                              <TextInput
                                editable={!disabled}
                                onChangeText={value =>
                                  updateStaffAttendanceWorkSite(index, {
                                    name: value,
                                  })
                                }
                                placeholder="Nama lokasi"
                                style={[
                                  styles.financialSearchInput,
                                  styles.workSiteFullInput,
                                ]}
                                value={site.name ?? ''}
                              />
                              <View style={styles.workSiteSearchRow}>
                                <TextInput
                                  editable={
                                    !disabled &&
                                    draft.staffAttendanceMapProvider !==
                                      'google'
                                  }
                                  onChangeText={value =>
                                    setWorkSiteGeocodeQueries(current => ({
                                      ...current,
                                      [siteKey]: value,
                                    }))
                                  }
                                  placeholder="Cari alamat kantor / toko"
                                  style={[
                                    styles.financialSearchInput,
                                    styles.workSiteSearchInput,
                                    (disabled ||
                                      draft.staffAttendanceMapProvider ===
                                        'google') &&
                                      styles.storeHoursTimeInputDisabled,
                                  ]}
                                  value={geocodeQuery}
                                />
                              <KolamActionControlButton
                                label="Cari koordinat"
                                loading={geocodeLoading}
                                loadingLabel="Mencari..."
                                disabled={geocodeDisabled}
                                onPress={() =>
                                  void geocodeStaffAttendanceWorkSite(
                                    index,
                                    site,
                                  )
                                }
                              />
                              </View>
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
                              <TextInput
                                editable={!disabled}
                                accessibilityLabel="Latitude lokasi kerja"
                                style={[
                                  styles.financialSearchInput,
                                  styles.workSiteCoordinateInput,
                                ]}
                                value={formatWorkSiteInputValue(site.latitude)}
                                onChangeText={value =>
                                  updateStaffAttendanceWorkSite(index, {
                                    latitude: parseWorkSiteNumber(value),
                                  })
                                }
                                placeholder="-6.2088"
                              />
                              <TextInput
                                editable={!disabled}
                                accessibilityLabel="Longitude lokasi kerja"
                                style={[
                                  styles.financialSearchInput,
                                  styles.workSiteCoordinateInput,
                                ]}
                                value={formatWorkSiteInputValue(site.longitude)}
                                onChangeText={value =>
                                  updateStaffAttendanceWorkSite(index, {
                                    longitude: parseWorkSiteNumber(value),
                                  })
                                }
                                placeholder="106.8456"
                              />
                              <TextInput
                                editable={!disabled}
                                accessibilityLabel="Radius absen meter"
                                style={[
                                  styles.financialSearchInput,
                                  styles.workSiteCoordinateInput,
                                ]}
                                value={formatWorkSiteInputValue(
                                  site.radiusMeters,
                                )}
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
                <KolamDropdownSelect
                  accessibilityLabel="Zona waktu absensi"
                  label="Zona waktu absensi"
                  menuPlacement="inline"
                  options={attendanceTimezoneDropdownOptions}
                  searchable
                  searchPlaceholder="Cari timezone IANA..."
                  showLabelInTrigger={false}
                  style={styles.shippingTimezonePicker}
                  triggerStyle={styles.shippingTimezoneTrigger}
                  value={draft.staffAttendanceTimezone}
                  onChange={value => {
                    if (!disabled) {
                      setDraftField('staffAttendanceTimezone', value);
                    }
                  }}
                />
              </View>
            </View>
          </View>
          <View
            style={[
              styles.marketplaceControlSection,
              styles.notificationSettingsCard,
              styles.settingsTabCardSpacing,
            ]}
          >
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
              ]}
            />
            <View style={styles.operationalAttendanceGrid}>
              <View style={styles.poNotificationToggleBox}>
                <KolamToggleRow
                  variant="settingsForm"
                  label="Live chat selalu online"
                  description="Jika off, jam operasional mengatur banner tutup/libur di dunia-anura.com."
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
                  label="Notif saat PO siap diterima / sudah diterima"
                  description="Kirim notifikasi saat barang PO diterima."
                  active={draft.poWorkflowNotifyOnReceive}
                  onPress={() =>
                    !disabled &&
                    onSaveOperationalPoWorkflow({
                      poWorkflowNotifyOnReceive:
                        !draft.poWorkflowNotifyOnReceive,
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
                      poWorkflowNotifyOnPartial:
                        !draft.poWorkflowNotifyOnPartial,
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
              </View>
            </View>
            <KolamRowFrame variant="settingsForm">
              <KolamTextFieldRowCopy
                description={
                  roomOptions.length
                    ? 'Unggah bukti PO otomatis diposting ke room ini. Room AI tidak ditampilkan.'
                    : 'Room Team Chat belum tersedia.'
                }
                label="Room pembelian"
              />
              <KolamDropdownSelect
                accessibilityLabel="Room penerimaan barang"
                label="Room Team Chat"
                menuPlacement="inline"
                options={[
                  { label: 'Pilih room', value: '' },
                  ...roomOptions.map(room => ({
                    label: `${getTeamChatRoomLabel(room)}${
                      room.category ? ` (${room.category})` : ''
                    }`,
                    value: room._id,
                  })),
                ]}
                searchable
                searchPlaceholder="Cari room..."
                showLabelInTrigger={false}
                style={[
                  styles.financialSelectorControl,
                  {width: settingsFieldWidth},
                ]}
                triggerStyle={styles.shippingTimezoneTrigger}
                value={draft.poWorkflowReceivingRoomId}
                onChange={value => {
                  if (!disabled) {
                    onSaveOperationalPoWorkflow({
                      poWorkflowReceivingRoomId: value,
                    });
                  }
                }}
              />
            </KolamRowFrame>
            <View style={styles.poStaffOverrideGrid}>
              <View style={styles.poStaffOverrideBox}>
                {renderPoWorkflowStaffPicker(
                  'poWorkflowNotifyReceiveUserIds',
                  'Notif terima - staff override',
                )}
              </View>
              <View style={styles.poStaffOverrideBox}>
                {renderPoWorkflowStaffPicker(
                  'poWorkflowNotifyCheckUserIds',
                  'Notif QC - staff override',
                )}
              </View>
              <View style={styles.poStaffOverrideBox}>
                {renderPoWorkflowStaffPicker(
                  'poWorkflowNotifyCompleteUserIds',
                  'Notif masuk stok - staff override',
                )}
              </View>
            </View>
          </View>
          <View
            style={[
              styles.marketplaceControlSection,
              styles.notificationSettingsCard,
              styles.settingsTabCardSpacing,
            ]}
          >
            <View style={styles.operationalCardHeaderRow}>
              <KolamCopyStack
                containerStyle={styles.operationalCardHeaderCopy}
                items={[
                  {
                    id: 'operational-complaint-period-title',
                    text: 'Periode keluhan',
                    style: styles.marketplaceOverviewTitle,
                  },
                  {
                    id: 'operational-complaint-period-meta',
                    text: 'Default global jika produk/spesies tidak punya template T&C dengan masa komplain. Per item, atur di Syarat & Ketentuan. 0 = tanpa jendela komplain.',
                    style: styles.marketplaceOverviewMeta,
                  },
                ]}
              />
              <KolamActionControlButton
                label="Simpan periode keluhan"
                loading={saveStatus === 'saving'}
                loadingLabel="Menyimpan..."
                disabled={disabled}
                onPress={onSaveOperationalComplaintPeriod}
              />
            </View>
            <KolamTextFieldRow
              variant="settingsForm"
              fieldWidth={settingsFieldWidth}
              label="Default komplain (hari)"
              description="Jumlah hari jendela komplain default (0 = tanpa jendela)."
              value={draft.complaintPeriodDays}
              onChangeText={value => {
                if (!disabled) {
                  setDraftField('complaintPeriodDays', value);
                }
              }}
              placeholder="3"
            />
          </View>
        </>
      ) : null}
      {showFinancialTaxSummary ? (
        <FinancialSettingsPanel
          disabled={disabled || financialStatus === 'saving'}
          draft={draft}
          financialMessage={financialMessage}
          financialSectionVisibility={financialSectionVisibility}
          financialStatus={financialStatus}
          financialWallets={financialWallets}
          onClearPaymentMethodDraft={onClearPaymentMethodDraft}
          onDeletePaymentMethod={onDeletePaymentMethod}
          onDeletePaymentMethodPhoto={onDeletePaymentMethodPhoto}
          onEditPaymentMethod={onEditPaymentMethod}
          onSaveEnclosureSaleCommission={onSaveEnclosureSaleCommission}
          onSaveFinancialTaxToggle={onSaveFinancialTaxToggle}
          onSaveOvertimeSettings={onSaveOvertimeSettings}
          onSavePaymentMethod={onSavePaymentMethod}
          onSaveTaxCompanyProfile={onSaveTaxCompanyProfile}
          onUploadPaymentMethodPhoto={onUploadPaymentMethodPhoto}
          paymentMethodDraft={paymentMethodDraft}
          paymentMethodFilters={paymentMethodFilters}
          paymentMethodTotal={paymentMethodTotal}
          paymentMethodTotalPages={paymentMethodTotalPages}
          paymentMethods={paymentMethods}
          setDraftField={setDraftField}
          setPaymentMethodDraftField={setPaymentMethodDraftField}
          setPaymentMethodFilter={setPaymentMethodFilter}
          setTaxCompanyProfileDraftField={setTaxCompanyProfileDraftField}
          settingsFieldWidth={settingsFieldWidth}
          taxCompanyProfile={taxCompanyProfile}
          taxCompanyProfileDraft={taxCompanyProfileDraft}
          taxPartyGaps={taxPartyGaps}
        />
      ) : null}
      {showKpiSettings ? (
        <KpiSettingsPanel
          disabled={disabled || kpiStatus === 'saving' || !kpiPluginEnabled}
          draft={kpiSettingsDraft}
          message={kpiMessage}
          onSave={onSaveKpiSettings}
          onSetField={setKpiSettingsDraftField}
          onToggleRule={setKpiEnabledRule}
          pluginEnabled={kpiPluginEnabled}
          preview={kpiPreview}
          status={kpiStatus}
        />
      ) : null}
      {showSitemapSettings ? (
        <View style={styles.sitemapCardStack}>
          <View style={styles.financialNestedCard}>
            <View style={styles.operationalCardHeaderRow}>
              <KolamCopyStack
                containerStyle={styles.operationalCardHeaderCopy}
                items={[
                  {
                    id: 'sitemap-master-title',
                    text: 'Kontrol utama',
                    style: styles.marketplaceOverviewTitle,
                  },
                  {
                    id: 'sitemap-master-meta',
                    text: 'Mengatur sitemap marketplace yang dibaca /sitemap.xml.',
                    style: styles.marketplaceOverviewMeta,
                  },
                ]}
              />
              <KolamActionControlButton
                disabled={disabled}
                intent="primary"
                label="Simpan sitemap"
                loading={saveStatus === 'saving'}
                loadingLabel="Menyimpan..."
                onPress={onSave}
              />
            </View>
            <View style={styles.notificationToggleGrid}>
              <View style={styles.notificationToggleBox}>
                <KolamToggleRow
                  variant="settingsForm"
                  label="Sitemap aktif"
                  description="Jika mati, sitemap.xml hanya berisi URL beranda."
                  active={sitemapDraft.enabled !== false}
                  onPress={() =>
                    !disabled &&
                    setSitemapMasterField(
                      'enabled',
                      sitemapDraft.enabled === false,
                    )
                  }
                />
              </View>
              <View style={styles.notificationToggleBox}>
                <KolamToggleRow
                  variant="settingsForm"
                  label="Sertakan gambar"
                  description="Kirim metadata gambar produk dan species ke sitemap."
                  active={sitemapDraft.includeImages !== false}
                  onPress={() =>
                    !disabled &&
                    setSitemapMasterField(
                      'includeImages',
                      sitemapDraft.includeImages === false,
                    )
                  }
                />
              </View>
            </View>
          </View>

          <View style={styles.financialNestedCard}>
            <KolamCopyStack
              items={[
                {
                  id: 'sitemap-sections-title',
                  text: 'Section dinamis',
                  style: styles.marketplaceOverviewTitle,
                },
                {
                  id: 'sitemap-sections-meta',
                  text: 'Setiap section punya status, priority, dan frekuensi perubahan.',
                  style: styles.marketplaceOverviewMeta,
                },
              ]}
            />
            <View style={styles.sitemapSectionGrid}>
              {sitemapSectionKeys.map(section => {
                const item = sitemapDraft.sections?.[section] ?? {};
                const priorityValue = formatSitemapPriority(
                  item.priority ?? 0.5,
                );
                return (
                  <View key={section} style={styles.sitemapRowCard}>
                    <KolamToggleRow
                      variant="settingsForm"
                      label={getSitemapSectionLabel(section)}
                      description="Aktifkan section ini di sitemap."
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
                    <View style={styles.sitemapRowFields}>
                      <KolamDropdownSelect
                        accessibilityLabel={`Priority ${getSitemapSectionLabel(
                          section,
                        )}`}
                        label="Priority"
                        menuPlacement="inline"
                        options={sitemapPriorityOptions}
                        showLabelInTrigger={false}
                        style={styles.sitemapDropdownControl}
                        triggerStyle={styles.shippingTimezoneTrigger}
                        value={priorityValue}
                        onChange={value =>
                          setSitemapSectionField(section, 'priority', value)
                        }
                      />
                      <KolamDropdownSelect
                        accessibilityLabel={`Frekuensi ${getSitemapSectionLabel(
                          section,
                        )}`}
                        label="Frekuensi"
                        menuPlacement="inline"
                        options={sitemapFrequencyOptions}
                        showLabelInTrigger={false}
                        style={styles.sitemapDropdownControl}
                        triggerStyle={styles.shippingTimezoneTrigger}
                        value={item.changeFrequency ?? 'weekly'}
                        onChange={value =>
                          setSitemapSectionField(
                            section,
                            'changeFrequency',
                            value,
                          )
                        }
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.financialNestedCard}>
            <View style={styles.operationalCardHeaderRow}>
              <KolamCopyStack
                containerStyle={styles.operationalCardHeaderCopy}
                items={[
                  {
                    id: 'sitemap-static-title',
                    text: 'Halaman statis',
                    style: styles.marketplaceOverviewTitle,
                  },
                  {
                    id: 'sitemap-static-meta',
                    text: 'Path halaman info marketplace seperti /about, /contact, dan /faq.',
                    style: styles.marketplaceOverviewMeta,
                  },
                ]}
              />
              <KolamActionControlButton
                disabled={disabled}
                label="Tambah halaman"
                onPress={addSitemapStaticPage}
              />
            </View>
            <View style={styles.sitemapStaticGrid}>
              {(sitemapDraft.staticPages ?? []).map((page, index) => (
                <View
                  key={page._id ?? `${page.path || 'static'}-${index}`}
                  style={styles.sitemapStaticCard}
                >
                  <KolamTextFieldRow
                    variant="settingsForm"
                    fieldWidth={settingsFieldWidth}
                    label="Path"
                    description="Path relatif dari root marketplace."
                    value={page.path}
                    onChangeText={value =>
                      setSitemapStaticPageField(index, 'path', value)
                    }
                    placeholder="/about"
                  />
                  <View style={styles.sitemapRowFields}>
                    <KolamToggleRow
                      variant="settingsForm"
                      label="Aktif"
                      description="Jika mati, path ini disimpan tapi tidak masuk sitemap."
                      active={page.enabled !== false}
                      onPress={() =>
                        !disabled &&
                        setSitemapStaticPageField(
                          index,
                          'enabled',
                          page.enabled === false,
                        )
                      }
                    />
                    <KolamDropdownSelect
                      accessibilityLabel="Priority halaman statis"
                      label="Priority"
                      menuPlacement="inline"
                      options={sitemapPriorityOptions}
                      showLabelInTrigger={false}
                      style={styles.sitemapDropdownControl}
                      triggerStyle={styles.shippingTimezoneTrigger}
                      value={formatSitemapPriority(page.priority ?? 0.5)}
                      onChange={value =>
                        setSitemapStaticPageField(index, 'priority', value)
                      }
                    />
                    <KolamDropdownSelect
                      accessibilityLabel="Frekuensi halaman statis"
                      label="Frekuensi"
                      menuPlacement="inline"
                      options={sitemapFrequencyOptions}
                      showLabelInTrigger={false}
                      style={styles.sitemapDropdownControl}
                      triggerStyle={styles.shippingTimezoneTrigger}
                      value={page.changeFrequency ?? 'monthly'}
                      onChange={value =>
                        setSitemapStaticPageField(
                          index,
                          'changeFrequency',
                          value,
                        )
                      }
                    />
                    <KolamActionControlButton
                      disabled={disabled}
                      intent="danger"
                      label="Hapus"
                      onPress={() => removeSitemapStaticPage(index)}
                    />
                  </View>
                </View>
              ))}
            </View>
            {sitemapDraft.staticPages?.length ? null : (
              <Text style={styles.sitemapEmptyText}>
                Belum ada halaman statis.
              </Text>
            )}
          </View>

          <View style={styles.financialNestedCard}>
            <View style={styles.operationalCardHeaderRow}>
              <KolamCopyStack
                containerStyle={styles.operationalCardHeaderCopy}
                items={[
                  {
                    id: 'sitemap-custom-title',
                    text: 'URL khusus',
                    style: styles.marketplaceOverviewTitle,
                  },
                  {
                    id: 'sitemap-custom-meta',
                    text: 'Tambahan URL promosi atau landing page yang tidak termasuk section lain.',
                    style: styles.marketplaceOverviewMeta,
                  },
                ]}
              />
              <KolamActionControlButton
                disabled={disabled}
                label="Tambah URL"
                onPress={addSitemapCustomUrl}
              />
            </View>
            {(sitemapDraft.customUrls ?? []).map((url, index) => (
              <View
                key={url._id ?? `${url.path || 'custom'}-${index}`}
                style={styles.sitemapRowCard}
              >
                <KolamTextFieldRow
                  variant="settingsForm"
                  fieldWidth={settingsFieldWidth}
                  label="Path"
                  description="Path URL khusus marketplace."
                  value={url.path}
                  onChangeText={value =>
                    setSitemapCustomUrlField(index, 'path', value)
                  }
                  placeholder="/promo-imlek-2027"
                />
                <View style={styles.sitemapRowFields}>
                  <KolamDropdownSelect
                    accessibilityLabel="Priority URL khusus"
                    label="Priority"
                    menuPlacement="inline"
                    options={sitemapPriorityOptions}
                    showLabelInTrigger={false}
                    style={styles.sitemapDropdownControl}
                    triggerStyle={styles.shippingTimezoneTrigger}
                    value={formatSitemapPriority(url.priority ?? 0.5)}
                    onChange={value =>
                      setSitemapCustomUrlField(index, 'priority', value)
                    }
                  />
                  <KolamDropdownSelect
                    accessibilityLabel="Frekuensi URL khusus"
                    label="Frekuensi"
                    menuPlacement="inline"
                    options={sitemapFrequencyOptions}
                    showLabelInTrigger={false}
                    style={styles.sitemapDropdownControl}
                    triggerStyle={styles.shippingTimezoneTrigger}
                    value={url.changeFrequency ?? 'weekly'}
                    onChange={value =>
                      setSitemapCustomUrlField(index, 'changeFrequency', value)
                    }
                  />
                  <KolamActionControlButton
                    disabled={disabled}
                    intent="danger"
                    label="Hapus"
                    onPress={() => removeSitemapCustomUrl(index)}
                  />
                </View>
              </View>
            ))}
            {sitemapDraft.customUrls?.length ? null : (
              <Text style={styles.sitemapEmptyText}>Belum ada URL khusus.</Text>
            )}
          </View>

          <View style={styles.financialNestedCard}>
            <KolamCopyStack
              items={[
                {
                  id: 'sitemap-excluded-title',
                  text: 'Slug dikecualikan',
                  style: styles.marketplaceOverviewTitle,
                },
                {
                  id: 'sitemap-excluded-meta',
                  text: 'Satu slug per baris. Item ini dilewati tanpa mengubah data produk, species, atau blog.',
                  style: styles.marketplaceOverviewMeta,
                },
              ]}
            />
            <View style={styles.sitemapExcludedGrid}>
              {sitemapSectionKeys.map(section => {
                const excludedValue = sitemapExcludedSlugsText[section] ?? '';
                const excludedCount = excludedValue
                  .split(/\r?\n/)
                  .filter(value => value.trim()).length;

                return (
                  <View
                    key={`excluded-${section}`}
                    style={styles.sitemapExcludedCard}
                  >
                    <View style={styles.sitemapExcludedHeader}>
                      <Text style={styles.marketplaceOverviewLabel}>
                        {getSitemapSectionLabel(section)}
                      </Text>
                      <Text style={styles.sitemapExcludedCount}>
                        {excludedCount} slug
                      </Text>
                    </View>
                    <TextInput
                      multiline
                      numberOfLines={3}
                      onChangeText={value =>
                        setSitemapExcludedSlugsDraftText(section, value)
                      }
                      placeholder={'slug-lama\ndraft-internal'}
                      placeholderTextColor={V.colors.mutedFg}
                      style={styles.sitemapExcludedInput}
                      textAlignVertical="top"
                      value={excludedValue}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      ) : null}
      {showSyncSettings ? (
        <>
          <View
            style={[
              styles.marketplaceOverview,
              styles.settingsTabCardSpacing,
            ]}
          >
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
            <View style={styles.regionStatsGrid}>
              {regionLevelCards.map(row => (
                <View key={row.id} style={styles.regionStatsCard}>
                  <KolamCopyStack
                    items={[
                      {
                        id: `${row.id}-label`,
                        text: row.label,
                        style: styles.regionStatsLabel,
                      },
                    ]}
                  />
                  <KolamCopyStack
                    items={[
                      {
                        id: `${row.id}-value`,
                        text: row.value,
                        style: styles.regionStatsValue,
                      },
                      {
                        id: `${row.id}-detail`,
                        text: row.detail,
                        style: styles.regionStatsDetail,
                      },
                    ]}
                  />
                  <KolamActionControlButton
                    disabled={disabled || regionSyncStatus === 'syncing'}
                    label={`Sync ${row.label}`}
                    loading={regionSyncStatus === 'syncing'}
                    loadingLabel="Syncing..."
                    onPress={() => onRunRegionSync(row.syncScope)}
                  />
                </View>
              ))}
            </View>
          </View>
          <View
            style={[
              styles.regionExplorerCard,
              styles.settingsTabCardSpacing,
            ]}
          >
            <KolamCopyStack
              items={[
                {
                  id: 'region-explorer-title',
                  text: 'Region Explorer',
                  style: styles.marketplaceOverviewTitle,
                },
                {
                  id: 'region-explorer-meta',
                  text: 'Filter hierarchy wilayah dan inspeksi postal code sebelum dipakai checkout.',
                  style: styles.marketplaceOverviewMeta,
                },
              ]}
            />
            <View style={styles.regionHierarchyGrid}>
              <KolamDropdownSelect
                label="Provinsi"
                menuStyle={styles.regionHierarchyMenu}
                menuPlacement="inline"
                options={provinceDropdownOptions}
                searchable
                searchPlaceholder="Cari provinsi"
                showLabelInTrigger={false}
                style={styles.regionHierarchyControl}
                triggerStyle={styles.regionHierarchyTrigger}
                value={selectedProvince}
                onChange={value => setRegionSelection('province', value)}
              />
              <KolamDropdownSelect
                label="Kota/kabupaten"
                menuStyle={styles.regionHierarchyMenu}
                menuPlacement="inline"
                options={regencyDropdownOptions}
                searchable={Boolean(selectedProvince)}
                searchPlaceholder="Cari kota / kabupaten"
                showLabelInTrigger={false}
                style={styles.regionHierarchyControl}
                triggerStyle={styles.regionHierarchyTrigger}
                value={selectedRegency}
                onChange={value => {
                  if (selectedProvince) {
                    setRegionSelection('regency', value);
                  }
                }}
              />
              <KolamDropdownSelect
                label="Kecamatan"
                menuStyle={styles.regionHierarchyMenu}
                menuPlacement="inline"
                options={districtDropdownOptions}
                searchable={Boolean(selectedRegency)}
                searchPlaceholder="Cari kecamatan"
                showLabelInTrigger={false}
                style={styles.regionHierarchyControl}
                triggerStyle={styles.regionHierarchyTrigger}
                value={selectedDistrict}
                onChange={value => {
                  if (selectedRegency) {
                    setRegionSelection('district', value);
                  }
                }}
              />
              <KolamDropdownSelect
                label="Kelurahan"
                menuStyle={styles.regionHierarchyMenu}
                menuPlacement="inline"
                options={villageDropdownOptions}
                searchable={Boolean(selectedDistrict)}
                searchPlaceholder="Cari kelurahan"
                showLabelInTrigger={false}
                style={styles.regionHierarchyControl}
                triggerStyle={styles.regionHierarchyTrigger}
                value={selectedVillage}
                onChange={value => {
                  if (selectedDistrict) {
                    setRegionSelection('village', value);
                  }
                }}
              />
            </View>
            <View style={styles.notificationSoundActions}>
              <KolamRefreshButton
  accessibilityLabel="Refresh"

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
                  disabled={
                    disabled ||
                    regionSyncStatus === 'syncing' ||
                    (scope === 'regencies' && !selectedProvince) ||
                    (scope === 'districts' && !selectedRegency) ||
                    (scope === 'villages' && !selectedDistrict)
                  }
                  onPress={() => onRunRegionSync(scope)}
                />
              ))}
            </View>
          </View>
          {regionSyncMessage ? (
            <View style={styles.settingsTabCardSpacing}>
              <KolamCopyStack
                items={[
                  {
                    id: 'region-sync-message',
                    text: regionSyncMessage,
                  },
                ]}
              />
            </View>
          ) : null}
          <View
            style={[
              styles.marketplaceOverview,
              styles.settingsTabCardSpacing,
            ]}
          >
            <KolamCopyStack
              items={[
                {
                  id: 'region-table-title',
                  text: 'Table Region',
                  style: styles.marketplaceOverviewTitle,
                },
              ]}
            />
            <KolamListTableComposition
              columns={[
                {
                  flex: 1,
                  id: 'code',
                  label: 'Code',
                  render: region => (
                    <Text
                      numberOfLines={1}
                      style={[styles.regionTableText, styles.regionTableMono]}
                    >
                      {region.code}
                    </Text>
                  ),
                },
                {
                  flex: 1.8,
                  id: 'name',
                  label: 'Name',
                  render: region => (
                    <Text
                      numberOfLines={1}
                      style={[styles.regionTableText, styles.regionTableNameText]}
                    >
                      {region.name}
                    </Text>
                  ),
                },
                {
                  flex: 0.9,
                  id: 'level',
                  label: 'Level',
                  render: region => (
                    <Text numberOfLines={1} style={styles.regionTableText}>
                      {region.level}
                    </Text>
                  ),
                },
                {
                  flex: 1,
                  id: 'parent',
                  label: 'Parent',
                  render: region => (
                    <Text
                      numberOfLines={1}
                      style={[styles.regionTableText, styles.regionTableMono]}
                    >
                      {region.parentCode || '-'}
                    </Text>
                  ),
                },
                {
                  flex: 1,
                  id: 'postal-code',
                  label: 'Postal Code',
                  render: region => (
                    <Text
                      numberOfLines={1}
                      style={[styles.regionTableText, styles.regionTableMono]}
                    >
                      {region.postalCode || '-'}
                    </Text>
                  ),
                },
                {
                  flex: 1.2,
                  id: 'updated',
                  label: 'Updated',
                  render: region => (
                    <Text numberOfLines={1} style={styles.regionTableText}>
                      {formatRegionUpdatedAt(region.updatedAt)}
                    </Text>
                  ),
                },
              ]}
              emptyTitle={
                regionSyncStatus === 'loading'
                  ? 'Memuat wilayah...'
                  : 'Belum ada region untuk filter ini.'
              }
              getRowKey={region => region._id || region.code}
              loading={regionSyncStatus === 'loading'}
              pagination={{
                onPageChange: setRegionPage,
                page: safeRegionPage,
                pageSize: REGION_TABLE_PAGE_SIZE,
                total: regionRows.length,
              }}
              rows={pagedRegionRows}
            />
          </View>
        </>
      ) : null}
      {showAiSettings ? (
        <>
          <View
            style={[
              styles.marketplaceControlSection,
              styles.notificationSettingsCard,
              styles.settingsTabCardSpacing,
            ]}
          >
            <KolamCopyStack
              items={[
                {
                  id: 'chat-ai-title',
                  text: 'Balasan otomatis Inbox & chat web',
                  style: styles.marketplaceOverviewLabel,
                },
                {
                  id: 'chat-ai-meta',
                  text: 'DARA menjawab pesan pembeli per saluran. Matikan saluran yang ingin ditangani CS manusia saja.',
                  style: styles.marketplaceOverviewMeta,
                },
              ]}
            />
            <View style={styles.notificationToggleGrid}>
              {aiInboxPlatformRows.map(row => (
                <View key={row.id} style={styles.notificationToggleBox}>
                  <KolamToggleRow
                    variant="settingsForm"
                    label={row.label}
                    description={row.description}
                    active={draft[row.field] === true}
                    onPress={() =>
                      !daraChatControlsDisabled &&
                      setDraftField(row.field, !(draft[row.field] === true))
                    }
                  />
                </View>
              ))}
            </View>
            <KolamCopyStack
              items={[
                {
                  id: 'chat-ai-cache-note',
                  text: 'Jika belum pernah disimpan, backend memakai env ALLOWLIST_AI_REPLY. Perubahan berlaku sekitar 5 detik karena cache backend.',
                  style: styles.marketplaceOverviewMeta,
                },
              ]}
            />
          </View>

          <View
            style={[
              styles.marketplaceControlSection,
              styles.notificationSettingsCard,
              styles.settingsTabCardSpacing,
            ]}
          >
            <KolamCopyStack
              items={[
                {
                  id: 'dara-business-title',
                  text: 'DARA Bisnis',
                  style: styles.marketplaceOverviewLabel,
                },
                {
                  id: 'dara-business-meta',
                  text: 'Kontrol utama untuk tool bisnis, knowledge, insight, laporan, dan analisis gambar.',
                  style: styles.marketplaceOverviewMeta,
                },
              ]}
            />
            <View style={styles.notificationToggleGrid}>
              <View style={styles.notificationToggleBox}>
                <KolamToggleRow
                  variant="settingsForm"
                  label="Bisnis DARA"
                  description="Aktifkan fitur bisnis DARA."
                  active={draft.daraBusinessEnabled}
                  onPress={() =>
                    !daraControlsDisabled &&
                    setDraftField(
                      'daraBusinessEnabled',
                      !draft.daraBusinessEnabled,
                    )
                  }
                />
              </View>
              {aiModuleToggleRows.map(row => (
                <View key={row.id} style={styles.notificationToggleBox}>
                  <KolamToggleRow
                    variant="settingsForm"
                    label={row.label}
                    description={row.description}
                    active={draft[row.field] === true}
                    onPress={() =>
                      !daraControlsDisabled &&
                      draft.daraBusinessEnabled &&
                      setDraftField(row.field, !(draft[row.field] === true))
                    }
                  />
                </View>
              ))}
            </View>
            <KolamTextFieldRow
              variant="settingsForm"
              fieldWidth={settingsFieldWidth}
              label="Jadwal cron insight"
              description="Jadwal insight otomatis dalam WIB."
              value={draft.daraInsightsCronSchedule}
              onChangeText={value =>
                setDraftField('daraInsightsCronSchedule', value)
              }
              placeholder="0 8,14 * * *"
            />
          </View>

          <View
            style={[
              styles.marketplaceControlSection,
              styles.notificationSettingsCard,
              styles.settingsTabCardSpacing,
            ]}
          >
            <KolamCopyStack
              items={[
                {
                  id: 'dara-seo-title',
                  text: 'DARA SEO & Market Intelligence',
                  style: styles.marketplaceOverviewLabel,
                },
              ]}
            />
            {daraSeoToggleRows.map(row => (
              <KolamToggleRow
                key={row.id}
                variant="settingsForm"
                label={row.label}
                description={row.description}
                active={draft[row.field] === true}
                onPress={() =>
                  !daraControlsDisabled &&
                  draft.daraBusinessEnabled &&
                  setDraftField(row.field, !(draft[row.field] === true))
                }
              />
            ))}
          </View>

          <View
            style={[
              styles.marketplaceControlSection,
              styles.notificationSettingsCard,
              styles.settingsTabCardSpacing,
            ]}
          >
            <KolamCopyStack
              items={[
                {
                  id: 'dara-tax-title',
                  text: 'DARA Tax Intelligence',
                  style: styles.marketplaceOverviewLabel,
                },
              ]}
            />
            <View style={styles.notificationToggleGrid}>
              {daraTaxToggleRows.map(row => (
                <View key={row.id} style={styles.notificationToggleBox}>
                  <KolamToggleRow
                    variant="settingsForm"
                    label={row.label}
                    description={row.description}
                    active={draft[row.field] === true}
                    onPress={() =>
                      !daraControlsDisabled &&
                      draft.daraBusinessEnabled &&
                      setDraftField(row.field, !(draft[row.field] === true))
                    }
                  />
                </View>
              ))}
            </View>
          </View>

          <View
            style={[
              styles.marketplaceControlSection,
              styles.notificationSettingsCard,
              styles.settingsTabCardSpacing,
            ]}
          >
            <KolamCopyStack
              items={[
                {
                  id: 'dara-shipping-title',
                  text: 'Pengiriman dan marketplace',
                  style: styles.marketplaceOverviewLabel,
                },
              ]}
            />
            <View style={styles.notificationToggleGrid}>
              {daraFulfillmentToggleRows
                .filter(row => row.id === 'auto' || row.id === 'webstore')
                .map(row => (
                  <View key={row.id} style={styles.notificationToggleBox}>
                    <KolamToggleRow
                      variant="settingsForm"
                      label={row.label}
                      description={row.description}
                      active={draft[row.field] === true}
                      onPress={() =>
                        !daraControlsDisabled &&
                        draft.daraBusinessEnabled &&
                        setDraftField(row.field, !(draft[row.field] === true))
                      }
                    />
                  </View>
                ))}
            </View>
            <View style={styles.notificationToggleGrid}>
              {daraFulfillmentToggleRows
                .filter(row => row.id === 'shopee' || row.id === 'tokopedia')
                .map(row => (
                  <View key={row.id} style={styles.notificationToggleBox}>
                    <KolamToggleRow
                      variant="settingsForm"
                      label={row.label}
                      description={row.description}
                      active={draft[row.field] === true}
                      onPress={() =>
                        !daraControlsDisabled &&
                        draft.daraBusinessEnabled &&
                        setDraftField(row.field, !(draft[row.field] === true))
                      }
                    />
                  </View>
                ))}
            </View>
            <View style={styles.notificationToggleGrid}>
              <View
                style={[
                  styles.notificationToggleBox,
                  styles.daraPackingFieldBox,
                ]}
              >
                <KolamCopyStack
                  containerStyle={styles.daraPackingCopy}
                  items={[
                    {
                      id: 'packing-minutes-label',
                      text: 'Menit packing',
                      style: styles.marketplaceOverviewLabel,
                    },
                    {
                      id: 'packing-minutes-meta',
                      text: 'Validasi BE: 5 sampai 240 menit.',
                      style: styles.marketplaceOverviewMeta,
                    },
                  ]}
                />
                <KolamFormTextField
                  onChangeText={value =>
                    setDraftField('daraFulfillmentPackingMinutes', value)
                  }
                  placeholder="30"
                  style={styles.daraPackingInput}
                  value={draft.daraFulfillmentPackingMinutes}
                />
              </View>
              <View
                style={[
                  styles.notificationToggleBox,
                  styles.daraPackingFieldBox,
                ]}
              >
                <KolamCopyStack
                  containerStyle={styles.daraPackingCopy}
                  items={[
                    {
                      id: 'packing-extensions-label',
                      text: 'Maksimal perpanjangan packing',
                      style: styles.marketplaceOverviewLabel,
                    },
                    {
                      id: 'packing-extensions-meta',
                      text: 'Validasi BE: 0 sampai 5 kali.',
                      style: styles.marketplaceOverviewMeta,
                    },
                  ]}
                />
                <KolamFormTextField
                  onChangeText={value =>
                    setDraftField('daraFulfillmentPackingMaxExtensions', value)
                  }
                  placeholder="1"
                  style={styles.daraPackingInput}
                  value={draft.daraFulfillmentPackingMaxExtensions}
                />
              </View>
            </View>
          </View>

          <View
            style={[
              styles.marketplaceControlSection,
              styles.notificationSettingsCard,
              styles.settingsTabCardSpacing,
            ]}
          >
            <KolamCopyStack
              items={[
                {
                  id: 'dara-night-ops-title',
                  text: 'Night Ops',
                  style: styles.marketplaceOverviewLabel,
                },
              ]}
            />
            <View style={styles.notificationToggleGrid}>
              {daraNightOpsToggleRows.map(row => (
                <View key={row.id} style={styles.notificationToggleBox}>
                  <KolamToggleRow
                    variant="settingsForm"
                    label={row.label}
                    description={row.description}
                    active={draft[row.field] === true}
                    onPress={() =>
                      !daraControlsDisabled &&
                      draft.daraBusinessEnabled &&
                      setDraftField(row.field, !(draft[row.field] === true))
                    }
                  />
                </View>
              ))}
            </View>
            <KolamRowFrame variant="settingsForm">
              <KolamTextFieldRowCopy
                description="Room tujuan digest dan notifikasi penjualan Night Ops."
                label="Room penjualan"
              />
              <KolamDropdownSelect
                accessibilityLabel="Room Team Chat Penjualan"
                label="Room Team Chat Penjualan"
                menuPlacement="inline"
                options={[
                  { label: 'Room penjualan default', value: '' },
                  ...daraPenjualanRoomOptions.map(room => ({
                    label: `${getTeamChatRoomLabel(room)}${
                      room.category ? ` (${room.category})` : ''
                    }`,
                    value: room._id,
                  })),
                ]}
                searchable
                searchPlaceholder="Cari room..."
                showLabelInTrigger={false}
                style={[
                  styles.financialSelectorControl,
                  {width: settingsFieldWidth},
                ]}
                triggerStyle={styles.shippingTimezoneTrigger}
                value={draft.daraPenjualanTeamRoomId}
                onChange={value => {
                  if (!daraControlsDisabled) {
                    setDraftField('daraPenjualanTeamRoomId', value);
                  }
                }}
              />
            </KolamRowFrame>
            <KolamTextFieldRow
              variant="settingsForm"
              fieldWidth={settingsFieldWidth}
              label="Cron deferred olshop"
              description="Jadwal proses pesan customer tertunda."
              value={draft.daraOlshopDeferredCron}
              onChangeText={value =>
                setDraftField('daraOlshopDeferredCron', value)
              }
              placeholder="*/10 * * * *"
            />
            <KolamTextFieldRow
              variant="settingsForm"
              fieldWidth={settingsFieldWidth}
              label="Batch deferred olshop"
              description="Validasi BE: 1 sampai 200."
              value={draft.daraOlshopDeferredBatch}
              onChangeText={value =>
                setDraftField('daraOlshopDeferredBatch', value)
              }
              placeholder="20"
            />
            <KolamTextFieldRow
              variant="settingsForm"
              fieldWidth={settingsFieldWidth}
              label="Maksimal umur sync stok"
              description="Dalam milidetik, minimal 60000."
              value={draft.daraOlshopStockSyncMaxAgeMs}
              onChangeText={value =>
                setDraftField('daraOlshopStockSyncMaxAgeMs', value)
              }
              placeholder="21600000"
            />
            <KolamTextFieldRow
              variant="settingsForm"
              fieldWidth={settingsFieldWidth}
              label="Cron stock gate"
              description="Jadwal pemeriksaan stock gate."
              value={draft.daraOlshopStockGateCron}
              onChangeText={value =>
                setDraftField('daraOlshopStockGateCron', value)
              }
              placeholder="*/5 * * * *"
            />
            <KolamTextFieldRow
              variant="settingsForm"
              fieldWidth={settingsFieldWidth}
              label="Batch stock gate"
              description="Validasi BE: 1 sampai 200."
              value={draft.daraOlshopStockGateBatch}
              onChangeText={value =>
                setDraftField('daraOlshopStockGateBatch', value)
              }
              placeholder="20"
            />
            <KolamTextFieldRow
              variant="settingsForm"
              fieldWidth={settingsFieldWidth}
              label="Cron digest owner"
              description="Jadwal digest owner."
              value={draft.daraOwnerDigestCron}
              onChangeText={value =>
                setDraftField('daraOwnerDigestCron', value)
              }
              placeholder="0 7 * * *"
            />
            <KolamTextFieldRow
              variant="settingsForm"
              fieldWidth={settingsFieldWidth}
              label="Lookback digest"
              description="Dalam jam, validasi BE: 1 sampai 72."
              value={draft.daraOpsDigestLookbackHours}
              onChangeText={value =>
                setDraftField('daraOpsDigestLookbackHours', value)
              }
              placeholder="12"
            />
          </View>

          <View
            style={[
              styles.marketplaceControlSection,
              styles.notificationSettingsCard,
              styles.settingsTabCardSpacing,
            ]}
          >
            <View style={styles.operationalCardHeaderRow}>
              <KolamCopyStack
                containerStyle={styles.operationalCardHeaderCopy}
                items={[
                  {
                    id: 'dara-knowledge-title',
                    text: 'Unggah SOP',
                    style: styles.marketplaceOverviewLabel,
                  },
                  {
                    id: 'dara-knowledge-meta',
                    text: 'Simpan SOP ke knowledge DARA melalui endpoint /dara/knowledge.',
                    style: styles.marketplaceOverviewMeta,
                  },
                ]}
              />
              <KolamActionControlButton
                label="Simpan SOP"
                loading={daraKnowledgeSaveStatus === 'saving'}
                loadingLabel="Menyimpan..."
                disabled={daraControlsDisabled}
                onPress={onSaveDaraKnowledge}
              />
            </View>
            <KolamTextFieldRow
              variant="settingsForm"
              fieldWidth={settingsFieldWidth}
              label="Judul SOP"
              description="Judul dokumen SOP."
              value={daraKnowledgeDraft.title}
              onChangeText={value => setDaraKnowledgeDraftField('title', value)}
              placeholder="SOP Kasir Harian"
            />
            <KolamRowFrame variant="settingsForm">
              <KolamTextFieldRowCopy
                description="Pilih kategori knowledge DARA."
                label="Tipe SOP"
              />
              <KolamDropdownSelect
                accessibilityLabel="Tipe SOP"
                label="Tipe SOP"
                menuPlacement="inline"
                options={daraKnowledgeCategories.map(([id, label]) => ({
                  label,
                  value: id,
                }))}
                showLabelInTrigger={false}
                style={[
                  styles.financialSelectorControl,
                  {width: settingsFieldWidth},
                ]}
                triggerStyle={styles.shippingTimezoneTrigger}
                value={daraKnowledgeDraft.category}
                onChange={value =>
                  setDaraKnowledgeDraftField(
                    'category',
                    value as DaraKnowledgeDraft['category'],
                  )
                }
              />
            </KolamRowFrame>
            <KolamTextFieldRow
              variant="settingsForm"
              fieldWidth={settingsFieldWidth}
              label="Isi SOP"
              description="Markdown SOP yang akan dipakai knowledge DARA."
              multiline
              numberOfLines={6}
              value={daraKnowledgeDraft.body}
              onChangeText={value => setDaraKnowledgeDraftField('body', value)}
              placeholder="Tuliskan SOP produksi di sini."
            />
            {daraKnowledgeMessage ? (
              <Text style={styles.marketplaceOverviewMeta}>
                {daraKnowledgeMessage}
              </Text>
            ) : null}
          </View>
        </>
      ) : null}
      {showStoreShippingSettings ? (
        <>
          <View
            style={[
              styles.marketplaceControlSection,
              styles.notificationSettingsCard,
              styles.settingsTabCardSpacing,
            ]}
          >
            <View style={styles.operationalCardHeaderRow}>
              <KolamCopyStack
                containerStyle={styles.operationalCardHeaderCopy}
                items={[
                  {
                    id: 'shipping-origin-title',
                    text: 'Asal pengiriman (Biteship)',
                    style: styles.marketplaceOverviewLabel,
                  },
                ]}
              />
              <KolamActionControlButton
                label="Simpan asal kirim"
                loading={saveStatus === 'saving'}
                loadingLabel="Menyimpan..."
                intent="primary"
                disabled={disabled}
                onPress={onSaveShippingOrigin}
              />
            </View>
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
                  id: 'pinpoint-map-meta',
                  text: 'Klik peta atau geser pin untuk mengubah koordinat asal pengiriman.',
                  style: styles.marketplaceOverviewMeta,
                },
              ]}
            />
            {originPinpointMapHtml ? (
              <View style={styles.originPinpointMapFrame}>
                <KolamWebView
                  javaScriptEnabled
                  originWhitelist={['*']}
                  source={{ html: originPinpointMapHtml }}
                  style={styles.originPinpointMap}
                  useWebView2={Platform.OS === 'windows'}
                  onMessage={handleOriginPinpointMessage}
                />
              </View>
            ) : (
              <View style={styles.originPinpointMapEmpty}>
                <Text style={styles.originPinpointMapEmptyTitle}>
                  Peta belum bisa ditampilkan
                </Text>
                <Text style={styles.originPinpointMapEmptyText}>
                  {originPinpointCoordinates
                    ? mapsBrowserKeyStatus === 'loading'
                      ? mapsBrowserKeyMessage
                      : mapsBrowserKeyMessage ||
                        'Aktifkan Google Maps API key browser di tab Pengiriman.'
                    : 'Isi latitude dan longitude asal pengiriman untuk menampilkan peta.'}
                </Text>
              </View>
            )}
          </View>

          <View
            style={[
              styles.marketplaceControlSection,
              styles.notificationSettingsCard,
              styles.settingsTabCardSpacing,
            ]}
          >
            <View style={styles.operationalCardHeaderRow}>
              <KolamCopyStack
                containerStyle={styles.operationalCardHeaderCopy}
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
              <KolamActionControlButton
                label="Simpan jam operasional"
                loading={saveStatus === 'saving'}
                loadingLabel="Menyimpan..."
                intent="primary"
                disabled={disabled}
                onPress={onSaveStoreOperatingHours}
              />
            </View>
            <View style={styles.shippingStoreHoursGrid}>
              <View style={styles.shippingStoreHoursBox}>
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
                <KolamCopyStack
                  items={[
                    {
                      id: 'special-closure-label',
                      text: 'Keterangan libur',
                      style: styles.shippingStoreHoursSectionLabel,
                    },
                    {
                      id: 'special-closure-meta',
                      text: 'Tambahkan tanggal libur khusus yang akan ditampilkan ke pembeli.',
                      style: styles.marketplaceOverviewMeta,
                    },
                  ]}
                />
                <KolamDateField
                  label="Tanggal libur khusus"
                  onChange={value =>
                    setDraftField(
                      'storeOperatingHoursSpecialClosureDate',
                      value,
                    )
                  }
                  style={styles.shippingSpecialClosureDateField}
                  value={draft.storeOperatingHoursSpecialClosureDate}
                />
                <KolamTextFieldRow
                  variant="settingsForm"
                  fieldWidth={settingsFieldWidth}
                  label="Keterangan libur"
                  description="Label libur yang ditampilkan ke pembeli."
                  value={draft.storeOperatingHoursSpecialClosureLabel}
                  onChangeText={value =>
                    setDraftField(
                      'storeOperatingHoursSpecialClosureLabel',
                      value,
                    )
                  }
                  placeholder="Libur Idul Fitri"
                />
                <View style={styles.shippingSpecialClosureActions}>
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
              <View style={styles.shippingStoreHoursBox}>
                <KolamDropdownSelect
                  accessibilityLabel="Zona waktu jadwal toko"
                  label="Zona waktu jadwal toko"
                  menuPlacement="inline"
                  options={timezoneDropdownOptions}
                  searchable
                  searchPlaceholder="Cari timezone IANA..."
                  showLabelInTrigger={false}
                  style={styles.shippingTimezonePicker}
                  triggerStyle={styles.shippingTimezoneTrigger}
                  value={draft.storeOperatingHoursTimezone}
                  onChange={value => {
                    if (!disabled) {
                      setDraftField('storeOperatingHoursTimezone', value);
                    }
                  }}
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
                        <Text style={styles.storeHoursDayText}>
                          {row.label}
                        </Text>
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
            </View>
          </View>

          <View
            style={[
              styles.marketplaceControlSection,
              styles.notificationSettingsCard,
              styles.settingsTabCardSpacing,
            ]}
          >
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
          <View style={styles.notificationSettingsStack}>
            <View
              style={[
                styles.marketplaceControlSection,
                styles.notificationSettingsCard,
              ]}
            >
              <KolamCopyStack
                items={[
                  {
                    id: 'notification-sound-table-title',
                    text: 'Suara notifikasi',
                    style: styles.marketplaceOverviewLabel,
                  },
                  {
                    id: 'notification-sound-table-meta',
                    text: 'Tes suara, unggah file, atur ulang, dan aktif/nonaktifkan fitur terkait dari satu baris.',
                    style: styles.marketplaceOverviewMeta,
                  },
                ]}
              />
              <View style={styles.notificationSoundTable}>
                <View style={styles.notificationSoundHeaderRow}>
                  <Text
                    style={[
                      styles.notificationSoundHeaderText,
                      styles.notificationSoundHeaderName,
                    ]}
                  >
                    Suara notifikasi
                  </Text>
                  <Text style={styles.notificationSoundHeaderText}>
                    Tes suara
                  </Text>
                  <Text style={styles.notificationSoundHeaderText}>Unggah</Text>
                  <Text style={styles.notificationSoundHeaderText}>
                    Atur ulang
                  </Text>
                  <Text style={styles.notificationSoundHeaderText}>On/off</Text>
                </View>
                <View style={styles.notificationSoundList}>
                  {renderNotificationSoundRow(notificationSoundItems[0])}
                  {renderNotificationSoundRow(notificationSoundItems[1])}
                  {renderNotificationSoundRow(notificationSoundItems[2], {
                    active: draft.daraHandoffNotifyEnabled,
                    label: 'Notifikasi handover DARA',
                    onPress: () =>
                      onSaveNotificationToggle(
                        'daraHandoffNotifyEnabled',
                        !draft.daraHandoffNotifyEnabled,
                      ),
                  })}
                  {renderNotificationSoundRow(notificationSoundItems[3], {
                    active: draft.teamChatGroupCallEnabled,
                    label: 'Call grup Team Chat',
                    onPress: () =>
                      onSaveNotificationToggle(
                        'teamChatGroupCallEnabled',
                        !draft.teamChatGroupCallEnabled,
                      ),
                  })}
                  {renderNotificationSoundRow(notificationSoundItems[4])}
                </View>
              </View>
            </View>
            <View
              style={[
                styles.marketplaceControlSection,
                styles.notificationSettingsCard,
              ]}
            >
              <View style={styles.operationalCardHeaderRow}>
                <KolamCopyStack
                  containerStyle={styles.operationalCardHeaderCopy}
                  items={[
                    {
                      id: 'firebase-settings-title',
                      text: 'Firebase push',
                      style: styles.marketplaceOverviewLabel,
                    },
                    {
                      id: 'firebase-settings-meta',
                      text: 'Konfigurasi Firebase Admin untuk push notification produksi.',
                      style: styles.marketplaceOverviewMeta,
                    },
                  ]}
                />
                <KolamActionControlButton
                  label="Simpan Firebase"
                  loading={saveStatus === 'saving'}
                  loadingLabel="Menyimpan..."
                  disabled={disabled}
                  onPress={onSaveNotificationFirebase}
                />
              </View>
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
                onChangeText={value =>
                  setDraftField('firebaseProjectId', value)
                }
                placeholder="dunia-anura"
              />
              <KolamTextFieldRow
                variant="settingsForm"
                fieldWidth={settingsFieldWidth}
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
                fieldWidth={settingsFieldWidth}
                label="Kunci privat Firebase"
                description="Biarkan ******** agar kunci privat BE tidak dikirim ulang."
                value={draft.firebasePrivateKey}
                onChangeText={value =>
                  setDraftField('firebasePrivateKey', value)
                }
                placeholder="********"
              />
            </View>
            <View
              style={[
                styles.marketplaceControlSection,
                styles.notificationSettingsCard,
              ]}
            >
              <View style={styles.operationalCardHeaderRow}>
                <KolamCopyStack
                  containerStyle={styles.operationalCardHeaderCopy}
                  items={[
                    {
                      id: 'smtp-settings-title',
                      text: 'SMTP / OTP staf',
                      style: styles.marketplaceOverviewLabel,
                    },
                    {
                      id: 'smtp-settings-meta',
                      text: 'Email sistem dan OTP staf untuk akses produksi.',
                      style: styles.marketplaceOverviewMeta,
                    },
                  ]}
                />
                <KolamActionControlButton
                  label="Simpan OTP & SMTP"
                  loading={saveStatus === 'saving'}
                  loadingLabel="Menyimpan..."
                  disabled={disabled}
                  onPress={onSaveNotificationOtpSmtp}
                />
              </View>
              <View style={styles.notificationToggleGrid}>
                <View style={styles.notificationToggleBox}>
                  <KolamToggleRow
                    variant="settingsForm"
                    label="SMTP aman"
                    description="Gunakan koneksi SMTP aman."
                    active={draft.smtpSecure}
                    onPress={() =>
                      !disabled &&
                      setDraftField('smtpSecure', !draft.smtpSecure)
                    }
                  />
                </View>
                <View style={styles.notificationToggleBox}>
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
                </View>
              </View>
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
                onChangeText={value =>
                  setDraftField('staffOtpMaxAttempts', value)
                }
                placeholder="5"
              />
              <KolamTextFieldRow
                variant="settingsForm"
                fieldWidth={settingsFieldWidth}
                label="Menit kunci OTP"
                description="Durasi penguncian setelah percobaan OTP melewati batas."
                value={draft.staffOtpLockMinutes}
                onChangeText={value =>
                  setDraftField('staffOtpLockMinutes', value)
                }
                placeholder="15"
              />
            </View>
          </View>
        </>
      ) : null}
      {(showOperationalSettings || showNotificationSettings) && saveMessage ? (
        <KolamCopyStack
          items={[
            {
              id: showNotificationSettings
                ? 'notification-save-message'
                : 'operational-save-message',
              text: saveMessage,
            },
          ]}
        />
      ) : null}
      {showPluginControls ? (
        <>
          <KolamToggleRow
            variant="settingsForm"
            label="Plugin Kandang"
            description="Aktifkan route dan registry plugin kandang."
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
                ctaDraft={marketplaceLandingCtaDraft}
                disabled={disabled || marketplaceLandingSaveStatus === 'saving'}
                onDeleteAnnouncementBanner={
                  onDeleteMarketplaceAnnouncementBanner
                }
                onDeleteCategoryBanner={onDeleteMarketplaceCategoryBanner}
                onDeleteFeaturedCollection={
                  onDeleteMarketplaceFeaturedCollection
                }
                onDeleteHeroSlide={onDeleteMarketplaceHeroSlide}
                onEditAnnouncementBanner={onEditMarketplaceAnnouncementBanner}
                onEditCategoryBanner={openMarketplaceCategoryEdit}
                onEditHeroSlide={openMarketplaceHeroEdit}
                onMoveAnnouncementBanner={onMoveMarketplaceAnnouncementBanner}
                onMoveCategoryBanner={onMoveMarketplaceCategoryBanner}
                onMoveFeaturedCollection={onMoveMarketplaceFeaturedCollection}
                onMoveHeroSlide={onMoveMarketplaceHeroSlide}
                onAddCategoryBanner={openMarketplaceCategoryCreate}
                onAddHeroSlide={openMarketplaceHeroCreate}
                onAddFeaturedCollection={onAddMarketplaceFeaturedCollection}
                onUpdateFeaturedCollection={
                  onUpdateMarketplaceFeaturedCollection
                }
                onUpdateBioactiveStep={onUpdateMarketplaceBioactiveStep}
                onSaveFeaturedCollections={
                  onSaveMarketplaceFeaturedCollections
                }
                onSaveBioactiveEcosystem={onSaveMarketplaceBioactiveEcosystem}
                onSaveCta={onSaveMarketplaceLandingCta}
                onUploadAnnouncementImage={onUploadMarketplaceAnnouncementImage}
                onUploadBioactiveStepImage={
                  onUploadMarketplaceBioactiveStepImage
                }
                onUploadCategoryBannerImage={
                  onUploadMarketplaceCategoryBannerImage
                }
                onUploadCtaBackground={onUploadMarketplaceCtaBackground}
                onUploadFeaturedCollectionImage={
                  onUploadMarketplaceFeaturedCollectionImage
                }
                onUploadHeroImage={onUploadMarketplaceHeroImage}
                onUploadYoutubeBackground={onUploadMarketplaceYoutubeBackground}
                overview={marketplaceLandingOverview}
                saveStatus={marketplaceLandingSaveStatus}
                setCtaDraftField={setMarketplaceLandingCtaDraftField}
                categories={marketplaceCategories}
              />
              {(marketplaceLandingTabId !== 'hero' &&
                marketplaceLandingTabId !== 'featured' &&
                marketplaceLandingTabId !== 'category' &&
                marketplaceLandingTabId !== 'cta') ||
              marketplaceHeroEditorOpen ? (
                <MarketplaceLandingControlsPanel
                activeTabId={marketplaceLandingTabId}
                announcementDraft={marketplaceLandingAnnouncementDraft}
                categoryDraft={marketplaceLandingCategoryDraft}
                ctaDraft={marketplaceLandingCtaDraft}
                disabled={disabled || marketplaceLandingSaveStatus === 'saving'}
                heroDraft={marketplaceLandingHeroDraft}
                message={marketplaceLandingMessage}
                noticeDraft={marketplaceLandingNoticeDraft}
                notices={marketplaceLandingOverview.customerNotices}
                onClearAnnouncementDraft={onClearMarketplaceAnnouncementDraft}
                onClearCategoryDraft={onClearMarketplaceCategoryDraft}
                onClearHeroDraft={closeMarketplaceHeroEditor}
                onClearNoticeDraft={onClearMarketplaceLandingNoticeDraft}
                onDeleteNotice={onDeleteMarketplaceLandingNotice}
                onEditNotice={onEditMarketplaceLandingNotice}
                onPickAnnouncementImage={
                  onPickMarketplaceLandingAnnouncementImage
                }
                onPickCategoryImage={onPickMarketplaceLandingCategoryImage}
                onPickHeroImage={onPickMarketplaceLandingHeroImage}
                onSaveAnnouncement={onSaveMarketplaceAnnouncementBanner}
                onSaveCategory={onSaveMarketplaceCategoryBanner}
                onSaveCta={onSaveMarketplaceLandingCta}
                onSaveHero={onSaveMarketplaceHeroSlide}
                onSaveNotice={onSaveMarketplaceLandingNotice}
                onSaveYoutube={onSaveMarketplaceLandingYoutube}
                saveStatus={marketplaceLandingSaveStatus}
                setAnnouncementDraftField={
                  setMarketplaceLandingAnnouncementDraftField
                }
                setCategoryDraftField={setMarketplaceLandingCategoryDraftField}
                setCtaDraftField={setMarketplaceLandingCtaDraftField}
                setHeroDraftField={setMarketplaceLandingHeroDraftField}
                setNoticeDraftField={setMarketplaceLandingNoticeDraftField}
                setYoutubeDraftField={setMarketplaceLandingYoutubeDraftField}
                youtubeDraft={marketplaceLandingYoutubeDraft}
              />
              ) : null}
              {marketplaceCategoryEditorOpen ? (
                <MarketplaceCategoryBannerEditorModal
                  categoryDraft={marketplaceLandingCategoryDraft}
                  disabled={disabled || marketplaceLandingSaveStatus === 'saving'}
                  existingImageUri={marketplaceCategoryEditorImageUri}
                  message={marketplaceLandingMessage}
                  onClose={closeMarketplaceCategoryEditor}
                  onPickCategoryImage={onPickMarketplaceLandingCategoryImage}
                  onSaveCategory={onSaveMarketplaceCategoryBanner}
                  saveStatus={marketplaceLandingSaveStatus}
                  setCategoryDraftField={
                    setMarketplaceLandingCategoryDraftField
                  }
                />
              ) : null}
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
    <View style={styles.webContentLauncher}>
      {status === 'loading' || status === 'error' ? (
        <KolamCopyStack
          items={[
            {
              id: 'meta',
              text: status === 'loading' ? 'Memuat...' : message,
              style:
                status === 'loading'
                  ? styles.marketplaceOverviewMeta
                  : styles.marketplaceOverviewError,
            },
          ]}
        />
      ) : null}
      <View style={styles.webContentLauncherGrid}>
        {items.map(item => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            onPress={() => onSelect(item.id)}
            style={[
              styles.webContentLauncherCard,
              activePanelId === item.id
                ? styles.webContentLauncherCardActive
                : null,
            ]}
          >
            <View
              style={[
                styles.webContentLauncherIcon,
                activePanelId === item.id
                  ? styles.webContentLauncherIconActive
                  : null,
              ]}
            >
              <SvgXml
                height={20}
                width={20}
                xml={getWebContentLauncherIconXml(item.id)}
              />
            </View>
            <View style={styles.webContentLauncherCopy}>
              <KolamCopyStack
                items={[
                  {
                    id: `${item.id}-label`,
                    text: getWebContentLauncherTitle(item.id),
                    style: styles.webContentLauncherTitle,
                  },
                  {
                    id: `${item.id}-detail`,
                    text: getWebContentLauncherDescription(item.id),
                    style: styles.webContentLauncherDetail,
                  },
                ]}
              />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function getWebContentLauncherTitle(
  id: 'marketplace' | 'blog' | 'blog-topics',
) {
  if (id === 'marketplace') {
    return 'Halaman marketplace';
  }
  if (id === 'blog') {
    return 'Artikel blog';
  }
  return 'Topik blog';
}

function getWebContentLauncherDescription(
  id: 'marketplace' | 'blog' | 'blog-topics',
) {
  if (id === 'marketplace') {
    return 'Slide & promosi toko';
  }
  if (id === 'blog') {
    return 'Publikasi artikel';
  }
  return 'Kategori artikel';
}

function getWebContentLauncherIconXml(
  id: 'marketplace' | 'blog' | 'blog-topics',
) {
  if (id === 'marketplace') {
    return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 12h17M12 3.5c2.6 2.3 4 5.2 4 8.5s-1.4 6.2-4 8.5M12 3.5C9.4 5.8 8 8.7 8 12s1.4 6.2 4 8.5M4.8 7.5h14.4M4.8 16.5h14.4M20.5 12a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0Z" stroke="#0f766e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  if (id === 'blog') {
    return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 4.5h8l3 3v12H7a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2Z" stroke="#0f766e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 4.5v3h3M8.5 11h7M8.5 14h7M8.5 17h4.5" stroke="#0f766e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.5 5.5A2.5 2.5 0 0 1 9 3h9.5v15.5H9A2.5 2.5 0 0 0 6.5 21V5.5Z" stroke="#0f766e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 7h5.5M10 10h4M6.5 5.5A2.5 2.5 0 0 0 4 8v11a2 2 0 0 0 2 2h.5" stroke="#0f766e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
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
    <View style={styles.marketplaceLandingTabBar}>
      {items.map(item => (
        <Pressable
          key={item.id}
          onPress={() => onSelect(item.id)}
          style={[
            styles.marketplaceLandingTab,
            activeTabId === item.id ? styles.marketplaceLandingTabActive : null,
          ]}
        >
          <SvgXml
            height={16}
            width={16}
            xml={getMarketplaceLandingTabIconXml(item.id, activeTabId === item.id)}
          />
          <Text
            style={[
              styles.marketplaceLandingTabLabel,
              activeTabId === item.id
                ? styles.marketplaceLandingTabLabelActive
                : null,
            ]}
          >
            {getMarketplaceLandingTabLabel(item.id)}
          </Text>
          {shouldShowMarketplaceLandingTabBadge(item.id) ? (
            <Text style={styles.marketplaceLandingTabBadge}>{item.value}</Text>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}

function getMarketplaceLandingTabLabel(
  id:
    | 'hero'
    | 'featured'
    | 'category'
    | 'cta'
    | 'youtube'
    | 'announcement'
    | 'notices',
) {
  if (id === 'featured') {
    return 'Unggulan';
  }
  if (id === 'category') {
    return 'Banner Kategori';
  }
  if (id === 'cta') {
    return 'Bagian CTA';
  }
  if (id === 'youtube') {
    return 'Bagian YouTube';
  }
  if (id === 'announcement') {
    return 'Banner Pengumuman';
  }
  if (id === 'notices') {
    return 'Pengumuman Teks';
  }
  return 'Slide Hero';
}

function shouldShowMarketplaceLandingTabBadge(
  id:
    | 'hero'
    | 'featured'
    | 'category'
    | 'cta'
    | 'youtube'
    | 'announcement'
    | 'notices',
) {
  return id === 'hero' || id === 'category' || id === 'announcement';
}

function getMarketplaceLandingTabIconXml(
  id:
    | 'hero'
    | 'featured'
    | 'category'
    | 'cta'
    | 'youtube'
    | 'announcement'
    | 'notices',
  active: boolean,
) {
  const color = active ? '#0f766e' : '#6b7280';
  if (id === 'hero') {
    return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 5h7v7H4V5ZM13 5h7v7h-7V5ZM4 14h7v5H4v-5ZM13 14h7v5h-7v-5Z" stroke="${color}" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
  }
  if (id === 'featured') {
    return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3.5l1.8 4.4 4.7.4-3.6 3.1 1.1 4.6-4-2.4-4 2.4 1.1-4.6-3.6-3.1 4.7-.4L12 3.5Z" stroke="${color}" stroke-width="1.8" stroke-linejoin="round"/><path d="M19 16.5l1 2.1 2 .2-1.5 1.3.5 2-2-1.1-2 1.1.5-2-1.5-1.3 2-.2 1-2.1Z" stroke="${color}" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
  }
  if (id === 'category') {
    return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h3A2.5 2.5 0 0 1 12 6.5v3A2.5 2.5 0 0 1 9.5 12h-3A2.5 2.5 0 0 1 4 9.5v-3ZM14 6.5A2.5 2.5 0 0 1 16.5 4h1A2.5 2.5 0 0 1 20 6.5v3a2.5 2.5 0 0 1-2.5 2.5h-1A2.5 2.5 0 0 1 14 9.5v-3ZM4 16.5A2.5 2.5 0 0 1 6.5 14h11a2.5 2.5 0 0 1 2.5 2.5v1A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-1Z" stroke="${color}" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
  }
  if (id === 'cta') {
    return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 14.5h3l7.5 3.5v-12L8 9.5H5a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2Z" stroke="${color}" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 14.5l1 5h2.5l-1.3-4.1M18.5 9.5l2-1.5M19 12h2.5M18.5 14.5l2 1.5" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  if (id === 'youtube') {
    return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 8.5A3.5 3.5 0 0 1 7.5 5h9A3.5 3.5 0 0 1 20 8.5v7a3.5 3.5 0 0 1-3.5 3.5h-9A3.5 3.5 0 0 1 4 15.5v-7Z" stroke="${color}" stroke-width="1.8"/><path d="M10.5 9.2v5.6l4.7-2.8-4.7-2.8Z" stroke="${color}" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
  }
  if (id === 'announcement') {
    return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.5 7.5h15v9h-15v-9Z" stroke="${color}" stroke-width="1.8" stroke-linejoin="round"/><path d="M7 15l3-3 2 2 2.5-3 2.5 4M8.5 10h.01" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 10.5v3A2.5 2.5 0 0 0 7.5 16H9l1.5 3 1.5-3h4.5A2.5 2.5 0 0 0 19 13.5v-7A2.5 2.5 0 0 0 16.5 4h-9A2.5 2.5 0 0 0 5 6.5v1" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 8h8M8 11h5" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/></svg>`;
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
  const [page, setPage] = React.useState(1);
  const rows: Array<{
    detail: string;
    id: string;
    label: string;
    value: string;
  }> =
    type === 'blog'
      ? blogs.map(blog => ({
          id: blog._id,
          label: blog.title,
          value: String(blog.status),
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
  const safePage = Math.min(
    Math.max(page, 1),
    Math.max(1, Math.ceil(rows.length / WEB_CONTENT_ROWS_PAGE_SIZE)),
  );
  const pagedRows = rows.slice(
    (safePage - 1) * WEB_CONTENT_ROWS_PAGE_SIZE,
    safePage * WEB_CONTENT_ROWS_PAGE_SIZE,
  );

  React.useEffect(() => {
    setPage(1);
  }, [type]);

  return (
    <View style={styles.marketplaceOverview}>
      <KolamCopyStack
        items={[
          {
            id: 'title',
            text: type === 'blog' ? 'Blog' : 'Blog Topics',
            style: styles.marketplaceOverviewTitle,
          },
        ]}
      />
      <KolamListTableComposition
        columns={[
          {
            flex: 2,
            id: 'title',
            label: type === 'blog' ? 'Artikel' : 'Topik',
            render: row => (
              <View style={styles.webContentTableTitleCell}>
                <Text numberOfLines={1} style={styles.webContentTableTitle}>
                  {row.label}
                </Text>
                <Text numberOfLines={1} style={styles.webContentTableMeta}>
                  {row.detail}
                </Text>
              </View>
            ),
          },
          {
            flex: 0.8,
            id: 'status',
            label: 'Status',
            render: row => (
              <Text numberOfLines={1} style={styles.webContentTableText}>
                {row.value}
              </Text>
            ),
          },
        ]}
        emptyTitle="Belum ada data."
        getRowKey={row => row.id}
        pagination={{
          onPageChange: setPage,
          page: safePage,
          pageSize: WEB_CONTENT_ROWS_PAGE_SIZE,
          total: rows.length,
        }}
        rows={pagedRows}
      />
    </View>
  );
}

function KpiSettingsPanel({
  disabled,
  draft,
  message,
  onSave,
  onSetField,
  onToggleRule,
  pluginEnabled,
  preview,
  status,
}: {
  disabled: boolean;
  draft: KpiSettingsDraft;
  message: string;
  onSave: () => void;
  onSetField: <Key extends keyof KpiSettingsDraft>(
    key: Key,
    value: KpiSettingsDraft[Key],
  ) => void;
  onToggleRule: (rule: string, enabled: boolean) => void;
  pluginEnabled: boolean;
  preview: KolamKpiWeeklyAnnouncePreview | null;
  status: 'idle' | 'loading' | 'live' | 'saving' | 'error' | 'disabled';
}) {
  const busy = status === 'loading' || status === 'saving';
  const levelRows = parseKpiLevelEditorRows(draft.levelsText);
  const rewardRows = parseKpiRewardEditorRows(draft.rewardsText);
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
  const setDraftField = <Key extends keyof KpiSettingsDraft>(
    key: Key,
    value: KpiSettingsDraft[Key],
  ) => {
    if (!disabled) {
      onSetField(key, value);
    }
  };
  const setLevelRow = (index: number, patch: Partial<KpiLevelEditorRow>) => {
    const next = levelRows.map((row, rowIndex) =>
      rowIndex === index ? { ...row, ...patch } : row,
    );
    setDraftField('levelsText', serializeKpiLevelEditorRows(next));
  };
  const setRewardRow = (index: number, patch: Partial<KpiRewardEditorRow>) => {
    const next = rewardRows.map((row, rowIndex) =>
      rowIndex === index ? { ...row, ...patch } : row,
    );
    setDraftField('rewardsText', serializeKpiRewardEditorRows(next));
  };
  const removeLevelRow = (index: number) => {
    setDraftField(
      'levelsText',
      serializeKpiLevelEditorRows(
        levelRows.filter((_, rowIndex) => rowIndex !== index),
      ),
    );
  };
  const removeRewardRow = (index: number) => {
    setDraftField(
      'rewardsText',
      serializeKpiRewardEditorRows(
        rewardRows.filter((_, rowIndex) => rowIndex !== index),
      ),
    );
  };
  const addLevelRow = () => {
    const number = levelRows.length + 1;
    setDraftField(
      'levelsText',
      serializeKpiLevelEditorRows([
        ...levelRows,
        {
          id: `level_${number}`,
          label: `Level ${number}`,
          min: '0',
          max: '',
        },
      ]),
    );
  };
  const addRewardRow = () => {
    setDraftField(
      'rewardsText',
      serializeKpiRewardEditorRows([
        ...rewardRows,
        { levelId: levelRows[0]?.id ?? 'bronze', amountRp: '0' },
      ]),
    );
  };

  return (
    <View style={styles.kpiSettingsStack}>
      <KpiSettingsSection title="Poin dasar (prioritas task)">
        <View style={styles.kpiSettingsGridFour}>
          <KpiCompactNumberField
            disabled={disabled || busy}
            label="Rendah"
            onChangeText={value => setDraftField('taskBaseLow', value)}
            placeholder="5"
            value={draft.taskBaseLow}
          />
          <KpiCompactNumberField
            disabled={disabled || busy}
            label="Menengah"
            onChangeText={value => setDraftField('taskBaseMedium', value)}
            placeholder="10"
            value={draft.taskBaseMedium}
          />
          <KpiCompactNumberField
            disabled={disabled || busy}
            label="Tinggi"
            onChangeText={value => setDraftField('taskBaseHigh', value)}
            placeholder="20"
            value={draft.taskBaseHigh}
          />
          <KpiCompactNumberField
            disabled={disabled || busy}
            label="Urgent"
            onChangeText={value => setDraftField('taskBaseUrgent', value)}
            placeholder="30"
            value={draft.taskBaseUrgent}
          />
        </View>
      </KpiSettingsSection>

      <KpiSettingsSection title="Bonus & penalti waktu">
        <View style={styles.kpiSettingsGridFour}>
          <KpiCompactNumberField
            disabled={disabled || busy}
            label="Sebelum deadline"
            onChangeText={value => setDraftField('onTimeBeforeDeadline', value)}
            placeholder="5"
            value={draft.onTimeBeforeDeadline}
          />
          <KpiCompactNumberField
            disabled={disabled || busy}
            label={`Cepat (>${draft.onTimeFarEarlyPct || '0'}% sisa)`}
            onChangeText={value => setDraftField('onTimeFarEarlyBonus', value)}
            placeholder="10"
            value={draft.onTimeFarEarlyBonus}
          />
          <KpiCompactNumberField
            disabled={disabled || busy}
            label="Terlambat"
            onChangeText={value => setDraftField('onTimeLate', value)}
            placeholder="-5"
            value={draft.onTimeLate}
          />
          <KpiCompactNumberField
            disabled={disabled || busy}
            label="QC lulus"
            onChangeText={value => setDraftField('qcPassFirst', value)}
            placeholder="10"
            value={draft.qcPassFirst}
          />
          <KpiCompactNumberField
            disabled={disabled || busy}
            label="QC revisi >1"
            onChangeText={value => setDraftField('qcRevisionMany', value)}
            placeholder="-5"
            value={draft.qcRevisionMany}
          />
          <KpiCompactNumberField
            disabled={disabled || busy}
            label="Bukti lengkap"
            onChangeText={value => setDraftField('proofComplete', value)}
            placeholder="5"
            value={draft.proofComplete}
          />
        </View>
      </KpiSettingsSection>

      <KpiSettingsSection
        subtitle="DARA eskalasi operasional 15 menit; KPI memakai ambang terpisah untuk poin."
        title="Chat Inbox (SLA CS)"
      >
        <View style={styles.kpiSettingsGridFive}>
          <KpiCompactNumberField
            disabled={disabled || busy}
            label="Cepat (menit)"
            onChangeText={value => setDraftField('chatFastReplyMinutes', value)}
            placeholder="5"
            value={draft.chatFastReplyMinutes}
          />
          <KpiCompactNumberField
            disabled={disabled || busy}
            label="Poin balas cepat"
            onChangeText={value => setDraftField('chatFastReplyPoints', value)}
            placeholder="5"
            value={draft.chatFastReplyPoints}
          />
          <KpiCompactNumberField
            disabled={disabled || busy}
            label="Telat (menit)"
            onChangeText={value => setDraftField('chatLateReplyMinutes', value)}
            placeholder="14"
            value={draft.chatLateReplyMinutes}
          />
          <KpiCompactNumberField
            disabled={disabled || busy}
            label="Poin balas telat"
            onChangeText={value => setDraftField('chatLateReplyPoints', value)}
            placeholder="-10"
            value={draft.chatLateReplyPoints}
          />
          <KpiCompactNumberField
            disabled={disabled || busy}
            label="Poin tidak balas"
            onChangeText={value => setDraftField('chatNoReplyPoints', value)}
            placeholder="-15"
            value={draft.chatNoReplyPoints}
          />
        </View>
      </KpiSettingsSection>

      <KpiSettingsSection title="Penalti">
        <View style={styles.kpiSettingsGridThree}>
          <KpiCompactNumberField
            disabled={disabled || busy}
            label="Komplain ringan"
            onChangeText={value => setDraftField('complaintLight', value)}
            placeholder="-10"
            value={draft.complaintLight}
          />
          <KpiCompactNumberField
            disabled={disabled || busy}
            label="Komplain valid"
            onChangeText={value => setDraftField('complaintValid', value)}
            placeholder="-25"
            value={draft.complaintValid}
          />
          <KpiCompactNumberField
            disabled={disabled || busy}
            label="Komplain berat"
            onChangeText={value => setDraftField('complaintSevere', value)}
            placeholder="-50"
            value={draft.complaintSevere}
          />
          <KpiCompactNumberField
            disabled={disabled || busy}
            label="Mangkir / reassign"
            onChangeText={value =>
              setDraftField('noShowReassignOrCancel', value)
            }
            placeholder="-25"
            value={draft.noShowReassignOrCancel}
          />
          <KpiCompactNumberField
            disabled={disabled || busy}
            label="Absen luar radius"
            onChangeText={value =>
              setDraftField('attendanceOutsideRadius', value)
            }
            placeholder="-20"
            value={draft.attendanceOutsideRadius}
          />
          <KpiCompactNumberField
            disabled={disabled || busy}
            label="Tanpa bukti"
            onChangeText={value => setDraftField('noProofMissing', value)}
            placeholder="-10"
            value={draft.noProofMissing}
          />
        </View>
      </KpiSettingsSection>

      <KpiSettingsSection title="Level bulanan & bonus Rp">
        <View style={styles.kpiLevelList}>
          {levelRows.map((row, index) => {
            const rewardIndex = rewardRows.findIndex(
              reward => reward.levelId === row.id,
            );
            const reward = rewardRows[rewardIndex];
            return (
              <View
                key={`${row.id || 'level'}-${index}`}
                style={styles.kpiLevelRow}
              >
                <Text style={styles.kpiLevelCopy}>
                  {row.label || row.id}{' '}
                  <Text style={styles.kpiLevelRange}>
                    ({row.min || '0'} - {row.max || '∞'} poin)
                  </Text>
                </Text>
                <Text style={styles.marketplaceOverviewMeta}>Bonus</Text>
                <KolamRupiahField
                  onChangeValue={value => {
                    if (rewardIndex >= 0) {
                      setRewardRow(rewardIndex, { amountRp: String(value) });
                    } else {
                      setDraftField(
                        'rewardsText',
                        serializeKpiRewardEditorRows([
                          ...rewardRows,
                          { levelId: row.id || 'level', amountRp: String(value) },
                        ]),
                      );
                    }
                  }}
                  style={styles.kpiRewardAmountInput}
                  value={Number(reward?.amountRp) || 0}
                />
                <KolamActionControlButton
                  disabled={disabled || busy}
                  intent="danger"
                  label="Hapus"
                  onPress={() => removeLevelRow(index)}
                />
              </View>
            );
          })}
          <View style={styles.kpiFooterActions}>
            <KolamActionControlButton
              disabled={disabled || busy}
              label="Tambah level"
              onPress={addLevelRow}
            />
            <KolamActionControlButton
              disabled={disabled || busy}
              label="Tambah reward"
              onPress={addRewardRow}
            />
          </View>
        </View>
      </KpiSettingsSection>

      <KpiSettingsSection title="Preview pengumuman mingguan (DARA)">
        {preview ? (
          <View style={styles.kpiPreviewStack}>
            <Text style={styles.marketplaceOverviewDetail}>
              Minggu {preview.weekKey} |{' '}
              {preview.alreadySent ? 'sudah terkirim' : 'belum terkirim'}
            </Text>
            <Text style={styles.kpiPreviewBox}>{preview.body}</Text>
          </View>
        ) : (
          <Text style={styles.marketplaceOverviewDetail}>
            Klik Dry-run untuk melihat isi broadcast.
          </Text>
        )}
      </KpiSettingsSection>

      <KpiSettingsSection title="Rule aktif (rollout)">
        <View style={styles.kpiRuleGrid}>
          {ruleRows.map(([key]) => {
            const checked = draft.enabledRules[key] !== false;
            return (
              <Pressable
                key={key}
                disabled={disabled || busy}
                onPress={() => onToggleRule(key, !checked)}
                style={[
                  styles.kpiRuleCheckbox,
                  checked && styles.kpiRuleCheckboxActive,
                  (disabled || busy) && styles.kpiRuleCheckboxDisabled,
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
                <Text style={styles.kpiRuleKey}>{key}</Text>
              </Pressable>
            );
          })}
        </View>
      </KpiSettingsSection>

      {message ? (
        <Text
          style={[
            styles.kpiSettingsMessage,
            (status === 'error' || status === 'disabled') &&
              styles.marketplaceOverviewError,
          ]}
        >
          {message}
        </Text>
      ) : null}

      <View style={styles.kpiSaveRow}>
        <KolamActionControlButton
          disabled={disabled || busy}
          intent="primary"
          label={status === 'saving' ? 'Menyimpan...' : 'Simpan'}
          loading={status === 'saving'}
          loadingLabel="Menyimpan..."
          onPress={onSave}
        />
      </View>
    </View>
  );
}

function KpiSettingsSection({
  action,
  children,
  subtitle,
  title,
}: {
  action?: React.ReactNode;
  children: React.ReactNode;
  subtitle?: string;
  title: string;
}) {
  return (
    <View style={styles.kpiSettingsSection}>
      <View style={styles.kpiSettingsSectionHeader}>
        <View style={styles.kpiSettingsSectionCopy}>
          <Text style={styles.kpiSectionTitle}>{title}</Text>
          {subtitle ? (
            <Text style={styles.marketplaceOverviewDetail}>{subtitle}</Text>
          ) : null}
        </View>
        {action ? <View>{action}</View> : null}
      </View>
      {children}
    </View>
  );
}

function KpiCompactNumberField({
  disabled,
  label,
  onChangeText,
  placeholder,
  value,
}: {
  disabled: boolean;
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View style={styles.kpiNumberField}>
      <Text style={styles.kpiNumberLabel}>{label}</Text>
      <TextInput
        editable={!disabled}
        keyboardType="numeric"
        onChangeText={disabled ? () => undefined : onChangeText}
        placeholder={placeholder}
        placeholderTextColor={V.colors.mutedFg}
        style={[styles.kpiNumberInput, disabled && styles.kpiNumberInputDisabled]}
        value={value}
      />
    </View>
  );
}

function parseOriginCoordinate(value: string) {
  const coordinate = Number(value.trim().replace(',', '.'));

  return Number.isFinite(coordinate) ? coordinate : null;
}

function stripMaskedSecret(value: string) {
  const trimmed = value.trim();

  return trimmed && trimmed !== MASKED_SECRET_PLACEHOLDER ? trimmed : '';
}

function createOriginPinpointMapHtml({
  address,
  apiKey,
  coordinates,
}: {
  address: string;
  apiKey: string;
  coordinates: { latitude: number; longitude: number };
}) {
  const safeAddress = JSON.stringify(address);
  const safeApiKey = encodeURIComponent(apiKey);
  const latitude = Number(coordinates.latitude.toFixed(7));
  const longitude = Number(coordinates.longitude.toFixed(7));

  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
    body { background: #f9fafb; color: #111827; font-family: Arial, sans-serif; overflow: hidden; }
    #map { width: 100%; }
    .label {
      position: absolute;
      top: 12px;
      left: 12px;
      right: 12px;
      z-index: 2;
      background: rgba(255,255,255,0.94);
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 8px 20px rgba(15,23,42,0.10);
      color: #111827;
      font-size: 12px;
      font-weight: 700;
      line-height: 16px;
      max-width: 420px;
      padding: 8px 10px;
    }
    .footer {
      position: absolute;
      left: 12px;
      right: 12px;
      bottom: 12px;
      z-index: 2;
      align-items: center;
      background: rgba(255,255,255,0.94);
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 8px 20px rgba(15,23,42,0.10);
      color: #4b5563;
      display: flex;
      justify-content: space-between;
      gap: 10px;
      font-size: 12px;
      line-height: 16px;
      padding: 8px 10px;
    }
    .coords { color: #111827; font-variant-numeric: tabular-nums; font-weight: 700; white-space: nowrap; }
    .error {
      align-items: center;
      display: flex;
      height: 100%;
      justify-content: center;
      padding: 18px;
      text-align: center;
    }
    .error div { max-width: 420px; }
    .error strong { color: #991b1b; display: block; font-size: 14px; margin-bottom: 6px; }
    .error span { color: #6b7280; font-size: 12px; line-height: 18px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="label" id="address"></div>
  <div class="footer">
    <span>Klik peta atau geser pin untuk mengubah koordinat.</span>
    <span class="coords" id="coords"></span>
  </div>
  <script>
    const address = ${safeAddress};
    const initialPosition = { lat: ${latitude}, lng: ${longitude} };
    let map;
    let marker;

    document.getElementById('address').textContent = address || 'Asal pengiriman';

    function setCoords(position, notifyNative) {
      const lat = Number(position.lat);
      const lng = Number(position.lng);
      document.getElementById('coords').textContent = lat.toFixed(7) + ', ' + lng.toFixed(7);
      if (notifyNative && window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'origin-pinpoint-change',
          latitude: lat,
          longitude: lng
        }));
      }
    }

    function initOriginPinpointMap() {
      map = new google.maps.Map(document.getElementById('map'), {
        center: initialPosition,
        zoom: 17,
        disableDefaultUI: true,
        zoomControl: true,
        clickableIcons: false,
        gestureHandling: 'greedy'
      });
      marker = new google.maps.Marker({
        position: initialPosition,
        map,
        draggable: true,
        title: address || 'Asal pengiriman'
      });
      marker.addListener('dragend', function() {
        const next = marker.getPosition();
        if (!next) return;
        setCoords({ lat: next.lat(), lng: next.lng() }, true);
      });
      map.addListener('click', function(event) {
        if (!event.latLng) return;
        marker.setPosition(event.latLng);
        map.panTo(event.latLng);
        setCoords({ lat: event.latLng.lat(), lng: event.latLng.lng() }, true);
      });
      setCoords(initialPosition, false);
    }

    function showMapError() {
      document.body.innerHTML = '<div class="error"><div><strong>Gagal memuat Google Maps</strong><span>Periksa Google Maps API key browser, billing, dan koneksi jaringan.</span></div></div>';
    }
  </script>
  <script async defer src="https://maps.googleapis.com/maps/api/js?key=${safeApiKey}&v=weekly&callback=initOriginPinpointMap" onerror="showMapError()"></script>
</body>
</html>`;
}

type KpiLevelEditorRow = {
  id: string;
  label: string;
  min: string;
  max: string;
};

type KpiRewardEditorRow = {
  levelId: string;
  amountRp: string;
};

function parseKpiLevelEditorRows(text: string): KpiLevelEditorRow[] {
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [id = '', label = '', min = '0', max = ''] = line.split('|');
      const cleanId = id.trim();
      return {
        id: cleanId,
        label: label.trim() || cleanId,
        min: min.trim() || '0',
        max: max.trim(),
      };
    })
    .filter(row => row.id);
}

function serializeKpiLevelEditorRows(rows: KpiLevelEditorRow[]) {
  return rows
    .map(row =>
      [row.id, row.label, row.min || '0', row.max]
        .map(value => value.trim())
        .join('|'),
    )
    .join('\n');
}

function parseKpiRewardEditorRows(text: string): KpiRewardEditorRow[] {
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [levelId = '', amountRp = '0'] = line.split('|');
      return {
        levelId: levelId.trim(),
        amountRp: amountRp.trim() || '0',
      };
    })
    .filter(row => row.levelId);
}

function serializeKpiRewardEditorRows(rows: KpiRewardEditorRow[]) {
  return rows
    .map(row =>
      [row.levelId, row.amountRp || '0'].map(value => value.trim()).join('|'),
    )
    .join('\n');
}

function MarketplaceLandingOverviewPanel({
  activeTabId,
  assetStatus,
  categories,
  ctaDraft,
  disabled,
  onDeleteAnnouncementBanner,
  onDeleteCategoryBanner,
  onDeleteFeaturedCollection,
  onDeleteHeroSlide,
  onEditAnnouncementBanner,
  onEditCategoryBanner,
  onEditHeroSlide,
  onMoveAnnouncementBanner,
  onMoveCategoryBanner,
  onMoveFeaturedCollection,
  onMoveHeroSlide,
  onAddCategoryBanner,
  onAddHeroSlide,
  onAddFeaturedCollection,
  onUpdateFeaturedCollection,
  onUpdateBioactiveStep,
  onSaveFeaturedCollections,
  onSaveBioactiveEcosystem,
  onSaveCta,
  onUploadAnnouncementImage,
  onUploadBioactiveStepImage,
  onUploadCategoryBannerImage,
  onUploadCtaBackground,
  onUploadFeaturedCollectionImage,
  onUploadHeroImage,
  onUploadYoutubeBackground,
  overview,
  saveStatus,
  setCtaDraftField,
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
  categories: KolamCategory[];
  ctaDraft: MarketplaceLandingCtaDraft;
  disabled: boolean;
  onDeleteAnnouncementBanner: (banner: KolamAnnouncementBanner) => void;
  onDeleteCategoryBanner: (banner: KolamCategoryBanner) => void;
  onDeleteFeaturedCollection: (index: number) => void;
  onDeleteHeroSlide: (slide: KolamHeroSlide) => void;
  onEditAnnouncementBanner: (banner: KolamAnnouncementBanner) => void;
  onEditCategoryBanner: (banner: KolamCategoryBanner) => void;
  onEditHeroSlide: (slide: KolamHeroSlide) => void;
  onMoveAnnouncementBanner: (
    banner: KolamAnnouncementBanner,
    direction: -1 | 1,
  ) => void;
  onMoveCategoryBanner: (
    banner: KolamCategoryBanner,
    direction: -1 | 1,
  ) => void;
  onMoveFeaturedCollection: (index: number, direction: -1 | 1) => void;
  onMoveHeroSlide: (slide: KolamHeroSlide, direction: -1 | 1) => void;
  onAddCategoryBanner: () => void;
  onAddHeroSlide: () => void;
  onAddFeaturedCollection: () => void;
  onUpdateFeaturedCollection: (
    index: number,
    patch: Partial<KolamFeaturedCollection>,
  ) => void;
  onUpdateBioactiveStep: (
    key: string,
    patch: Partial<KolamBioactiveEcosystemStep>,
  ) => void;
  onSaveFeaturedCollections: () => void;
  onSaveBioactiveEcosystem: () => void;
  onSaveCta: () => void;
  onUploadAnnouncementImage: (banner: KolamAnnouncementBanner) => void;
  onUploadBioactiveStepImage: (index: number) => void;
  onUploadCategoryBannerImage: (banner: KolamCategoryBanner) => void;
  onUploadCtaBackground: () => void;
  onUploadFeaturedCollectionImage: (index: number) => void;
  onUploadHeroImage: (slide: KolamHeroSlide) => void;
  onUploadYoutubeBackground: () => void;
  overview: MarketplaceLandingOverview;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  setCtaDraftField: <Key extends keyof MarketplaceLandingCtaDraft>(
    key: Key,
    value: MarketplaceLandingCtaDraft[Key],
  ) => void;
}) {
  const featuredCollections =
    overview.marketplaceContent.featuredCollections ?? [];
  const bioactiveSteps =
    overview.marketplaceContent.bioactiveEcosystem?.steps ?? [];
  const rows = [
    {
      id: 'hero-slides',
      label: 'Slide hero',
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
      label: 'Pengumuman pelanggan',
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
  const activeOverviewRows = rows.filter(row => {
    if (activeTabId === 'hero') {
      return row.id === 'hero-slides';
    }
    if (activeTabId === 'category') {
      return row.id === 'category-banners';
    }
    if (activeTabId === 'cta') {
      return row.id === 'cta';
    }
    if (activeTabId === 'youtube') {
      return row.id === 'youtube';
    }
    if (activeTabId === 'announcement') {
      return row.id === 'announcement-banners';
    }
    if (activeTabId === 'notices') {
      return row.id === 'customer-notices';
    }
    return (
      row.id === 'featured-collections' || row.id === 'bioactive-ecosystem'
    );
  });
  const showAssetSection =
    activeTabId !== 'notices' &&
    activeTabId !== 'hero' &&
    activeTabId !== 'category' &&
    activeTabId !== 'cta' &&
    activeTabId !== 'featured';

  return (
    <View style={styles.marketplaceOverview}>
      {activeTabId === 'hero' ? (
        <MarketplaceHeroSlidesPanel
          disabled={disabled}
          items={overview.heroSlides}
          onAdd={onAddHeroSlide}
          onDelete={onDeleteHeroSlide}
          onEdit={onEditHeroSlide}
          onMove={onMoveHeroSlide}
          onUpload={onUploadHeroImage}
          status={assetStatus}
        />
      ) : activeTabId === 'featured' ? (
        <MarketplaceFeaturedPanel
          assetStatus={assetStatus}
          bioactiveSteps={bioactiveSteps}
          categories={categories}
          disabled={disabled}
          featuredCollections={featuredCollections}
          onAddFeaturedCollection={onAddFeaturedCollection}
          onDeleteFeaturedCollection={onDeleteFeaturedCollection}
          onMoveFeaturedCollection={onMoveFeaturedCollection}
          onSaveBioactiveEcosystem={onSaveBioactiveEcosystem}
          onSaveFeaturedCollections={onSaveFeaturedCollections}
          onUpdateBioactiveStep={onUpdateBioactiveStep}
          onUpdateFeaturedCollection={onUpdateFeaturedCollection}
          onUploadBioactiveStepImage={onUploadBioactiveStepImage}
          onUploadFeaturedCollectionImage={onUploadFeaturedCollectionImage}
          saveStatus={saveStatus}
        />
      ) : activeTabId === 'category' ? (
        <MarketplaceCategoryBannersPanel
          disabled={disabled}
          items={overview.categoryBanners}
          onAdd={onAddCategoryBanner}
          onDelete={onDeleteCategoryBanner}
          onEdit={onEditCategoryBanner}
          onMove={onMoveCategoryBanner}
          status={assetStatus}
        />
      ) : activeTabId === 'cta' ? (
        <MarketplaceCtaSectionPanel
          assetStatus={assetStatus}
          ctaDraft={ctaDraft}
          ctaSection={overview.ctaSection}
          disabled={disabled}
          message={overview.message}
          onSave={onSaveCta}
          onUploadBackground={onUploadCtaBackground}
          saveStatus={saveStatus}
          setCtaDraftField={setCtaDraftField}
        />
      ) : (
        <>
      <KolamCopyStack
        items={[
          {
            id: 'title',
            text: getMarketplaceLandingTabLabel(activeTabId),
            style: styles.marketplaceOverviewTitle,
          },
          ...(overview.status === 'loading'
            ? [
                {
                  id: 'status',
                  text: 'Memuat...',
                  style: styles.marketplaceOverviewMeta,
                },
              ]
            : overview.status === 'error'
            ? [
                {
                  id: 'status',
                  text: overview.message,
                  style: styles.marketplaceOverviewError,
                },
              ]
            : []),
        ]}
      />
      <View style={styles.marketplaceOverviewRows}>
        {activeOverviewRows.map(row => (
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
        </>
      )}
      {showAssetSection ? (
      <View style={styles.marketplaceAssetSection}>
        <KolamCopyStack
          items={[
            {
              id: 'asset-title',
              text: 'Aset',
              style: styles.marketplaceOverviewLabel,
            },
          ]}
        />
        {activeTabId === 'youtube' ? (
          <View style={styles.marketplaceAssetActions}>
            <MarketplaceAssetButton
              disabled={disabled}
              id="youtube-background"
              label="Unggah latar YouTube"
              onPress={onUploadYoutubeBackground}
              status={assetStatus}
            />
          </View>
        ) : null}
        {activeTabId === 'announcement' ? (
          <MarketplaceAssetRows
            disabled={disabled}
            emptyText="Belum ada banner pengumuman untuk penggantian gambar."
            getId={item => `announcement:${item._id}`}
            getLabel={item => item.link || item._id}
            items={overview.announcementBanners}
            onDelete={onDeleteAnnouncementBanner}
            onEdit={onEditAnnouncementBanner}
            onMove={onMoveAnnouncementBanner}
            onUpload={onUploadAnnouncementImage}
            status={assetStatus}
            title="Gambar banner pengumuman"
          />
        ) : null}
      </View>
      ) : null}
    </View>
  );
}

function MarketplaceHeroSlidesPanel({
  disabled,
  items,
  onAdd,
  onDelete,
  onEdit,
  onMove,
  status,
}: {
  disabled: boolean;
  items: KolamHeroSlide[];
  onAdd: () => void;
  onDelete: (slide: KolamHeroSlide) => void;
  onEdit: (slide: KolamHeroSlide) => void;
  onMove: (slide: KolamHeroSlide, direction: -1 | 1) => void;
  onUpload: (slide: KolamHeroSlide) => void;
  status: Partial<
    Record<string, 'idle' | 'uploading' | 'deleting' | 'reordering'>
  >;
}) {
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewIndex, setPreviewIndex] = React.useState(0);
  const activeSlides = items.filter(item => item.isActive !== false);
  const previewSlides = activeSlides.length > 0 ? activeSlides : items;
  const activeCount = activeSlides.length;
  const previewDisabled = disabled || items.length === 0;

  const openPreview = React.useCallback(
    (index = 0) => {
      if (!previewSlides.length) {
        return;
      }
      setPreviewIndex(
        Math.min(Math.max(index, 0), previewSlides.length - 1),
      );
      setPreviewOpen(true);
    },
    [previewSlides.length],
  );

  return (
    <View style={styles.marketplaceHeroSlides}>
      <View style={styles.marketplaceHeroSlidesToolbar}>
        <View style={styles.marketplaceHeroActiveCopy}>
          <Text style={styles.marketplaceOverviewMeta}>Aktif:</Text>
          <Text style={styles.marketplaceHeroActiveBadge}>
            {String(activeCount)}
          </Text>
        </View>
        <View style={styles.marketplaceAssetActions}>
          <KolamActionControlButton
            disabled={previewDisabled}
            label="Pratinjau"
            onPress={() => openPreview(0)}
          />
          <KolamActionControlButton
            disabled={disabled}
            intent="primary"
            label="Tambah slide"
            onPress={onAdd}
          />
        </View>
      </View>
      {items.length ? (
        <View style={styles.marketplaceHeroSlideList}>
          {items.map((slide, index) => {
            const id = `hero:${slide._id}`;
            const imageUri = resolveMarketplaceLandingImageUri(slide.image);
            return (
              <View key={slide._id} style={styles.marketplaceHeroSlideCard}>
                <View style={styles.marketplaceHeroSlideImageWrap}>
                  {imageUri ? (
                    <Image
                      resizeMode="cover"
                      source={{uri: imageUri}}
                      style={styles.marketplaceHeroSlideImage}
                    />
                  ) : (
                    <View style={styles.marketplaceHeroSlideImageFallback}>
                      <SvgXml
                        height={24}
                        width={24}
                        xml={getMarketplaceLandingTabIconXml('hero', true)}
                      />
                    </View>
                  )}
                  <Text style={styles.marketplaceHeroSlideIndex}>
                    {String(index + 1)}
                  </Text>
                </View>
                <View style={styles.marketplaceHeroSlideCopy}>
                  <View style={styles.marketplaceHeroSlideTitleRow}>
                    <Text
                      numberOfLines={1}
                      style={styles.marketplaceHeroSlideTitle}
                    >
                      {slide.title || '-'}
                    </Text>
                    <Text
                      style={[
                        styles.marketplaceHeroSlideStatus,
                        slide.isActive === false
                          ? styles.marketplaceHeroSlideStatusDraft
                          : null,
                      ]}
                    >
                      {slide.isActive === false ? 'Draf' : 'Aktif'}
                    </Text>
                  </View>
                  {slide.subtitle ? (
                    <Text
                      numberOfLines={1}
                      style={styles.marketplaceHeroSlideSubtitle}
                    >
                      {slide.subtitle}
                    </Text>
                  ) : null}
                  <View style={styles.marketplaceHeroSlideLinks}>
                    <Text
                      numberOfLines={1}
                      style={styles.marketplaceHeroSlideLink}
                    >
                      {`${slide.linkText || 'Tautan'} -> ${slide.link || '/'}`}
                    </Text>
                    {slide.secondaryLink || slide.secondaryLinkText ? (
                      <Text
                        numberOfLines={1}
                        style={styles.marketplaceHeroSlideLink}
                      >
                        {`${slide.secondaryLinkText || 'Tautan kedua'} -> ${
                          slide.secondaryLink || '/'
                        }`}
                      </Text>
                    ) : null}
                  </View>
                </View>
                <View style={styles.marketplaceHeroSlideActions}>
                  <MarketplaceAssetButton
                    accessibilityLabel="Naik"
                    disabled={disabled || index === 0}
                    icon={
                      <Text style={styles.marketplaceHeroSlideActionGlyph}>
                        ↑
                      </Text>
                    }
                    id={id}
                    label=""
                    onPress={() => onMove(slide, -1)}
                    style={styles.marketplaceHeroSlideActionButton}
                    status={status}
                  />
                  <MarketplaceAssetButton
                    accessibilityLabel="Turun"
                    disabled={disabled || index === items.length - 1}
                    icon={
                      <Text style={styles.marketplaceHeroSlideActionGlyph}>
                        ↓
                      </Text>
                    }
                    id={id}
                    label=""
                    onPress={() => onMove(slide, 1)}
                    style={styles.marketplaceHeroSlideActionButton}
                    status={status}
                  />
                  <View style={styles.marketplaceHeroSlideActionSeparator} />
                  <MarketplaceAssetButton
                    accessibilityLabel="Rubah slide"
                    disabled={disabled}
                    icon={<KolamActionGlyph variant="edit" />}
                    id={`edit:${slide._id}`}
                    label=""
                    onPress={() => onEdit(slide)}
                    style={styles.marketplaceHeroSlideActionButton}
                    status={status}
                  />
                  <MarketplaceAssetButton
                    accessibilityLabel="Hapus slide"
                    disabled={disabled}
                    icon={<KolamActionGlyph tone="danger" variant="delete" />}
                    id={id}
                    intent="danger"
                    label=""
                    onPress={() => onDelete(slide)}
                    style={[
                      styles.marketplaceHeroSlideActionButton,
                      styles.marketplaceHeroSlideActionButtonDanger,
                    ]}
                    status={status}
                  />
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.marketplaceHeroEmpty}>
          <SvgXml
            height={32}
            width={32}
            xml={getMarketplaceLandingTabIconXml('hero', true)}
          />
          <Text style={styles.marketplaceHeroEmptyTitle}>
            Buat slide pertama
          </Text>
          <Text style={styles.marketplaceOverviewMeta}>
            Slide hero tampil di karusel halaman marketplace.
          </Text>
          <KolamActionControlButton
            disabled={disabled}
            intent="primary"
            label="Tambah slide"
            onPress={onAdd}
          />
          <Text style={styles.marketplaceOverviewMeta}>
            Rekomendasi: 1280 x 180 px
          </Text>
        </View>
      )}
      {previewOpen && previewSlides.length > 0 ? (
        <MarketplaceHeroPreview
          initialIndex={previewIndex}
          onClose={() => setPreviewOpen(false)}
          slides={previewSlides}
        />
      ) : null}
    </View>
  );
}

function MarketplaceCtaSectionPanel({
  assetStatus,
  ctaDraft,
  ctaSection,
  disabled,
  message,
  onSave,
  onUploadBackground,
  saveStatus,
  setCtaDraftField,
}: {
  assetStatus: Partial<
    Record<string, 'idle' | 'uploading' | 'deleting' | 'reordering'>
  >;
  ctaDraft: MarketplaceLandingCtaDraft;
  ctaSection: KolamCtaSection | null;
  disabled: boolean;
  message: string;
  onSave: () => void;
  onUploadBackground: () => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  setCtaDraftField: <Key extends keyof MarketplaceLandingCtaDraft>(
    key: Key,
    value: MarketplaceLandingCtaDraft[Key],
  ) => void;
}) {
  const backgroundUri = resolveMarketplaceLandingImageUri(
    ctaSection?.backgroundImage,
  );

  return (
    <View style={styles.marketplaceCtaPanel}>
      <View style={styles.marketplaceCtaCard}>
        <View style={styles.marketplaceCtaHeader}>
          <KolamCopyStack
            items={[
              {
                id: 'title',
                text: 'Pengaturan CTA',
                style: styles.marketplaceOverviewTitle,
              },
              {
                id: 'detail',
                text: 'Atur ajakan utama di halaman landing.',
                style: styles.marketplaceOverviewMeta,
              },
            ]}
          />
          <Text
            style={[
              styles.marketplaceHeroSlideStatus,
              ctaDraft.isActive ? null : styles.marketplaceHeroSlideStatusDraft,
            ]}
          >
            {ctaDraft.isActive ? 'Aktif' : 'Tersembunyi'}
          </Text>
        </View>

        <View style={styles.marketplaceCtaStack}>
          <View style={styles.marketplaceCtaFieldGroup}>
            <View style={styles.marketplaceCtaFieldHeader}>
              <Text style={styles.marketplaceOverviewLabel}>
                Gambar latar
              </Text>
              <MarketplaceAssetButton
                disabled={disabled}
                id="cta-background"
                label={backgroundUri ? 'Ganti gambar' : 'Pilih gambar'}
                onPress={onUploadBackground}
                status={assetStatus}
              />
            </View>
            <Pressable
              accessibilityRole="button"
              disabled={disabled}
              onPress={onUploadBackground}
              style={styles.marketplaceCtaImageBox}
            >
              {backgroundUri ? (
                <Image
                  resizeMode="cover"
                  source={{uri: backgroundUri}}
                  style={styles.marketplaceCtaImage}
                />
              ) : (
                <View style={styles.marketplaceCtaImageEmpty}>
                  <SvgXml
                    height={38}
                    width={38}
                    xml={getMarketplaceLandingTabIconXml('cta', true)}
                  />
                  <Text style={styles.marketplaceOverviewMeta}>
                    Pilih gambar latar CTA.
                  </Text>
                  <Text style={styles.marketplaceOverviewMeta}>
                    Rekomendasi: 1024 x 494px
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          <KolamTextFieldRow
            variant="settingsForm"
            label="Judul"
            description=""
            value={ctaDraft.title}
            onChangeText={value => setCtaDraftField('title', value)}
            placeholder="Jelajahi Dunia Species"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Deskripsi"
            description=""
            value={ctaDraft.description}
            onChangeText={value => setCtaDraftField('description', value)}
            placeholder="Tulis deskripsi CTA"
          />
          <View style={styles.marketplaceCtaGrid}>
            <KolamTextFieldRow
              variant="settingsForm"
              label="Teks tombol"
              description=""
              value={ctaDraft.buttonText}
              onChangeText={value => setCtaDraftField('buttonText', value)}
              placeholder="Lihat semua spesies"
            />
            <KolamTextFieldRow
              variant="settingsForm"
              label="Tautan tombol"
              description=""
              value={ctaDraft.buttonLink}
              onChangeText={value => setCtaDraftField('buttonLink', value)}
              placeholder="/species"
            />
          </View>
          <Pressable
            accessibilityRole="checkbox"
            disabled={disabled}
            onPress={() => setCtaDraftField('isActive', !ctaDraft.isActive)}
            style={styles.marketplaceCtaToggleCard}
          >
            <KolamCopyStack
              containerStyle={styles.marketplaceOverviewCopy}
              items={[
                {
                  id: 'toggle-title',
                  text: 'Tampilkan di landing page',
                  style: styles.marketplaceOverviewLabel,
                },
                {
                  id: 'toggle-detail',
                  text: 'Tampilkan bagian CTA untuk pengunjung.',
                  style: styles.marketplaceOverviewMeta,
                },
              ]}
            />
            <View
              style={[
                styles.poStaffCheckbox,
                ctaDraft.isActive ? styles.poStaffCheckboxActive : null,
              ]}
            >
              <Text
                style={[
                  styles.poStaffCheckboxMarkText,
                  ctaDraft.isActive ? styles.poStaffCheckboxMarkActive : null,
                ]}
              >
                {ctaDraft.isActive ? '✓' : ''}
              </Text>
            </View>
          </Pressable>
          {message ? (
            <Text
              style={
                saveStatus === 'error'
                  ? styles.marketplaceOverviewError
                  : styles.marketplaceOverviewMeta
              }
            >
              {message}
            </Text>
          ) : null}
          <View style={styles.marketplaceCtaFooter}>
            <KolamActionControlButton
              disabled={disabled}
              intent="primary"
              label="Simpan perubahan"
              loading={saveStatus === 'saving'}
              loadingLabel="Menyimpan..."
              onPress={onSave}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

function MarketplaceCategoryBannersPanel({
  disabled,
  items,
  onAdd,
  onDelete,
  onEdit,
  onMove,
  status,
}: {
  disabled: boolean;
  items: KolamCategoryBanner[];
  onAdd: () => void;
  onDelete: (banner: KolamCategoryBanner) => void;
  onEdit: (banner: KolamCategoryBanner) => void;
  onMove: (banner: KolamCategoryBanner, direction: -1 | 1) => void;
  status: Partial<
    Record<string, 'idle' | 'uploading' | 'deleting' | 'reordering'>
  >;
}) {
  const activeCount = items.filter(item => item.isActive !== false).length;

  return (
    <View style={styles.marketplaceCategoryPanel}>
      <View style={styles.marketplaceCategoryToolbar}>
        <View style={styles.marketplaceHeroActiveCopy}>
          <Text style={styles.marketplaceOverviewMeta}>Aktif:</Text>
          <Text style={styles.marketplaceHeroActiveBadge}>
            {String(activeCount)}
          </Text>
        </View>
        <KolamActionControlButton
          disabled={disabled}
          icon={<KolamActionGlyph variant="plus" />}
          intent="primary"
          label="Tambah banner"
          onPress={onAdd}
        />
      </View>

      {items.length === 0 ? (
        <View style={styles.marketplaceCategoryEmpty}>
          <SvgXml
            height={34}
            width={34}
            xml={getMarketplaceLandingTabIconXml('category', true)}
          />
          <Text style={styles.marketplaceOverviewTitle}>
            Buat banner pertama
          </Text>
          <Text style={styles.marketplaceOverviewMeta}>
            Banner kategori tampil di bagian Meet our Pets.
          </Text>
          <Text style={styles.marketplaceFeaturedBadge}>
            Rekomendasi: 325 x 220px
          </Text>
          <KolamActionControlButton
            disabled={disabled}
            icon={<KolamActionGlyph variant="plus" />}
            intent="primary"
            label="Tambah banner"
            onPress={onAdd}
          />
        </View>
      ) : (
        <View style={styles.marketplaceCategoryGrid}>
          {items.map((banner, index) => {
            const id = `category:${banner._id}`;
            const imageUri = resolveMarketplaceLandingImageUri(banner.image);
            return (
              <View key={banner._id} style={styles.marketplaceCategoryCard}>
                <View style={styles.marketplaceCategoryImageWrap}>
                  {imageUri ? (
                    <Image
                      resizeMode="cover"
                      source={{uri: imageUri}}
                      style={styles.marketplaceCategoryImage}
                    />
                  ) : (
                    <View style={styles.marketplaceCategoryImageFallback}>
                      <Text style={styles.marketplaceOverviewMeta}>
                        Belum ada gambar
                      </Text>
                    </View>
                  )}
                  <Text style={styles.marketplaceHeroSlideIndex}>
                    {String(index + 1)}
                  </Text>
                  <Text
                    style={[
                      styles.marketplaceHeroSlideStatus,
                      styles.marketplaceCategoryStatus,
                      banner.isActive === false
                        ? styles.marketplaceHeroSlideStatusDraft
                        : null,
                    ]}
                  >
                    {banner.isActive === false ? 'Draf' : 'Aktif'}
                  </Text>
                </View>
                <View style={styles.marketplaceCategoryFooter}>
                  <Text
                    numberOfLines={1}
                    style={styles.marketplaceCategorySlug}
                  >
                    {banner.categorySlug || '-'}
                  </Text>
                  <View style={styles.marketplaceFeaturedCardActions}>
                    <MarketplaceAssetButton
                      accessibilityLabel="Naik"
                      disabled={disabled || index === 0}
                      icon={
                        <Text style={styles.marketplaceHeroSlideActionGlyph}>
                          ↑
                        </Text>
                      }
                      id={id}
                      label=""
                      onPress={() => onMove(banner, -1)}
                      style={styles.marketplaceFeaturedIconButton}
                      status={status}
                    />
                    <MarketplaceAssetButton
                      accessibilityLabel="Turun"
                      disabled={disabled || index === items.length - 1}
                      icon={
                        <Text style={styles.marketplaceHeroSlideActionGlyph}>
                          ↓
                        </Text>
                      }
                      id={id}
                      label=""
                      onPress={() => onMove(banner, 1)}
                      style={styles.marketplaceFeaturedIconButton}
                      status={status}
                    />
                    <MarketplaceAssetButton
                      accessibilityLabel="Rubah banner"
                      disabled={disabled}
                      icon={<KolamActionGlyph variant="edit" />}
                      id={id}
                      label=""
                      onPress={() => onEdit(banner)}
                      style={styles.marketplaceFeaturedIconButton}
                      status={status}
                    />
                    <MarketplaceAssetButton
                      accessibilityLabel="Hapus banner"
                      disabled={disabled}
                      icon={<KolamActionGlyph tone="danger" variant="delete" />}
                      id={id}
                      intent="danger"
                      label=""
                      onPress={() => onDelete(banner)}
                      style={[
                        styles.marketplaceFeaturedIconButton,
                        styles.marketplaceHeroSlideActionButtonDanger,
                      ]}
                      status={status}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const marketplaceBioactiveStepLabels: Record<string, string> = {
  soil: 'Soil',
  springtail: 'Springtail',
  isopod: 'Isopod',
  plants: 'Plants',
  animal: 'Your Animal',
};

const marketplaceBioactiveStepKeys = [
  'soil',
  'springtail',
  'isopod',
  'plants',
  'animal',
] as const;

function normalizeMarketplaceBioactiveStepsForView(
  steps: KolamBioactiveEcosystemStep[],
) {
  const byKey = new Map(steps.map(step => [step.key, step]));
  return marketplaceBioactiveStepKeys.map((key, index) => {
    const saved = byKey.get(key);
    return {
      key,
      image: saved?.image || '',
      order: index,
      isActive: saved?.isActive !== false,
    };
  });
}

function MarketplaceFeaturedPanel({
  assetStatus,
  bioactiveSteps,
  categories,
  disabled,
  featuredCollections,
  onAddFeaturedCollection,
  onDeleteFeaturedCollection,
  onMoveFeaturedCollection,
  onSaveBioactiveEcosystem,
  onSaveFeaturedCollections,
  onUpdateBioactiveStep,
  onUpdateFeaturedCollection,
  onUploadBioactiveStepImage,
  onUploadFeaturedCollectionImage,
  saveStatus,
}: {
  assetStatus: Partial<
    Record<string, 'idle' | 'uploading' | 'deleting' | 'reordering'>
  >;
  bioactiveSteps: KolamBioactiveEcosystemStep[];
  categories: KolamCategory[];
  disabled: boolean;
  featuredCollections: KolamFeaturedCollection[];
  onAddFeaturedCollection: () => void;
  onDeleteFeaturedCollection: (index: number) => void;
  onMoveFeaturedCollection: (index: number, direction: -1 | 1) => void;
  onSaveBioactiveEcosystem: () => void;
  onSaveFeaturedCollections: () => void;
  onUpdateBioactiveStep: (
    key: string,
    patch: Partial<KolamBioactiveEcosystemStep>,
  ) => void;
  onUpdateFeaturedCollection: (
    index: number,
    patch: Partial<KolamFeaturedCollection>,
  ) => void;
  onUploadBioactiveStepImage: (index: number) => void;
  onUploadFeaturedCollectionImage: (index: number) => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
}) {
  const categoryOptions = React.useMemo(
    () => [
      {value: '', label: 'Pilih kategori'},
      ...categories.map(category => ({
        value: category.id,
        label: category.name,
      })),
    ],
    [categories],
  );
  const normalizedBioactiveSteps =
    normalizeMarketplaceBioactiveStepsForView(bioactiveSteps);

  return (
    <View style={styles.marketplaceFeaturedStack}>
      <View style={styles.marketplaceFeaturedPanel}>
        <View style={styles.marketplaceFeaturedHeader}>
          <KolamCopyStack
            items={[
              {
                id: 'title',
                text: 'Unggulan Homepage',
                style: styles.marketplaceOverviewTitle,
              },
              {
                id: 'detail',
                text: 'Pilih kategori, unggah gambar, dan jumlah species dihitung otomatis.',
                style: styles.marketplaceOverviewMeta,
              },
            ]}
          />
          <View style={styles.marketplaceAssetActions}>
            <Text style={styles.marketplaceFeaturedBadge}>
              {featuredCollections.length} kartu
            </Text>
            <KolamActionControlButton
              disabled={disabled}
              icon={<KolamActionGlyph variant="plus" />}
              label="Tambah"
              onPress={onAddFeaturedCollection}
            />
            <KolamActionControlButton
              disabled={disabled}
              intent="primary"
              label="Simpan"
              loading={saveStatus === 'saving'}
              loadingLabel="Menyimpan..."
              onPress={onSaveFeaturedCollections}
            />
          </View>
        </View>

        {featuredCollections.length === 0 ? (
          <View style={styles.marketplaceFeaturedEmpty}>
            <Text style={styles.marketplaceOverviewMeta}>
              Belum ada kartu unggulan. Tambahkan kartu unggulan dari kategori.
            </Text>
          </View>
        ) : (
          <View style={styles.marketplaceFeaturedRows}>
            {featuredCollections.map((row, index) => (
              <View
                key={row._id || `featured-${index}`}
                style={styles.marketplaceFeaturedCard}
              >
                <View style={styles.marketplaceFeaturedCardHeader}>
                  <View style={styles.marketplaceFeaturedCardMeta}>
                    <Text
                      style={[
                        styles.marketplaceHeroSlideStatus,
                        row.isActive === false
                          ? styles.marketplaceHeroSlideStatusDraft
                          : null,
                      ]}
                    >
                      {row.isActive === false ? 'Nonaktif' : 'Aktif'}
                    </Text>
                    <Text style={styles.marketplaceOverviewMeta}>
                      Urutan {index + 1}
                    </Text>
                  </View>
                  <View style={styles.marketplaceFeaturedCardActions}>
                    <MarketplaceAssetButton
                      accessibilityLabel="Naik"
                      disabled={disabled || index === 0}
                      icon={
                        <Text style={styles.marketplaceHeroSlideActionGlyph}>
                          ↑
                        </Text>
                      }
                      id={`featured:${index}`}
                      label=""
                      onPress={() => onMoveFeaturedCollection(index, -1)}
                      style={styles.marketplaceFeaturedIconButton}
                      status={assetStatus}
                    />
                    <MarketplaceAssetButton
                      accessibilityLabel="Turun"
                      disabled={disabled || index === featuredCollections.length - 1}
                      icon={
                        <Text style={styles.marketplaceHeroSlideActionGlyph}>
                          ↓
                        </Text>
                      }
                      id={`featured:${index}`}
                      label=""
                      onPress={() => onMoveFeaturedCollection(index, 1)}
                      style={styles.marketplaceFeaturedIconButton}
                      status={assetStatus}
                    />
                    <MarketplaceAssetButton
                      accessibilityLabel="Hapus unggulan"
                      disabled={disabled}
                      icon={<KolamActionGlyph tone="danger" variant="delete" />}
                      id={`featured:${index}`}
                      intent="danger"
                      label=""
                      onPress={() => onDeleteFeaturedCollection(index)}
                      style={[
                        styles.marketplaceFeaturedIconButton,
                        styles.marketplaceHeroSlideActionButtonDanger,
                      ]}
                      status={assetStatus}
                    />
                  </View>
                </View>
                <View style={styles.marketplaceFeaturedGrid}>
                  <View style={styles.marketplaceFeaturedField}>
                    <Text style={styles.marketplaceOverviewLabel}>Judul</Text>
                    <TextInput
                      editable={!disabled}
                      onChangeText={value =>
                        onUpdateFeaturedCollection(index, {title: value})
                      }
                      placeholder="Amphibians"
                      style={styles.marketplaceFeaturedInput}
                      value={row.title}
                    />
                  </View>
                  <View style={styles.marketplaceFeaturedField}>
                    <Text style={styles.marketplaceOverviewLabel}>Kategori</Text>
                    <KolamDropdownSelect
                      label="Kategori"
                      onChange={value => {
                        const category = categories.find(
                          item => item.id === value,
                        );
                        onUpdateFeaturedCollection(index, {
                          categoryId: value || null,
                          title: category?.name || row.title,
                        });
                      }}
                      options={categoryOptions}
                      searchable
                      showLabelInTrigger={false}
                      value={row.categoryId || ''}
                    />
                  </View>
                </View>
                <View style={styles.marketplaceFeaturedUploadRow}>
                  <MarketplaceAssetButton
                    disabled={disabled}
                    id={`featured:${index}`}
                    label="Unggah gambar"
                    onPress={() => onUploadFeaturedCollectionImage(index)}
                    status={assetStatus}
                  />
                  {row.image ? (
                    <Image
                      resizeMode="cover"
                      source={{uri: resolveMarketplaceLandingImageUri(row.image)}}
                      style={styles.marketplaceFeaturedThumb}
                    />
                  ) : null}
                  <Pressable
                    accessibilityRole="button"
                    disabled={disabled}
                    onPress={() =>
                      onUpdateFeaturedCollection(index, {
                        isActive: row.isActive === false,
                      })
                    }
                    style={styles.marketplaceFeaturedToggle}
                  >
                    <Text style={styles.marketplaceOverviewMeta}>
                      Tampilkan di homepage
                    </Text>
                    <Text style={styles.marketplaceFeaturedBadge}>
                      {row.isActive === false ? 'Tidak' : 'Ya'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.marketplaceFeaturedPanel}>
        <View style={styles.marketplaceFeaturedHeader}>
          <KolamCopyStack
            items={[
              {
                id: 'title',
                text: 'Ekosistem Bioaktif',
                style: styles.marketplaceOverviewTitle,
              },
              {
                id: 'detail',
                text: 'Unggah gambar untuk alur Soil, Springtail, Isopod, Plants, dan Your Animal.',
                style: styles.marketplaceOverviewMeta,
              },
            ]}
          />
          <View style={styles.marketplaceAssetActions}>
            <Text style={styles.marketplaceFeaturedBadge}>
              {normalizedBioactiveSteps.filter(step => step.image).length}/5 gambar
            </Text>
            <KolamActionControlButton
              disabled={disabled}
              intent="primary"
              label="Simpan Ekosistem"
              loading={saveStatus === 'saving'}
              loadingLabel="Menyimpan..."
              onPress={onSaveBioactiveEcosystem}
            />
          </View>
        </View>
        <View style={styles.marketplaceBioactiveGrid}>
          {normalizedBioactiveSteps.map((step, index) => (
            <View key={step.key} style={styles.marketplaceBioactiveCard}>
              <View style={styles.marketplaceBioactiveHeader}>
                <Text style={styles.marketplaceOverviewLabel}>
                  {marketplaceBioactiveStepLabels[step.key] || step.key}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  disabled={disabled}
                  onPress={() =>
                    onUpdateBioactiveStep(step.key, {
                      isActive: step.isActive === false,
                    })
                  }
                  style={[
                    styles.marketplaceBioactiveCheckbox,
                    step.isActive !== false && styles.poStaffCheckboxActive,
                    disabled && styles.poStaffCheckboxDisabled,
                  ]}
                >
                  <View
                    style={[
                      styles.poStaffCheckboxMark,
                      step.isActive !== false && styles.poStaffCheckboxMarkActive,
                    ]}
                  >
                    {step.isActive !== false ? (
                      <Text style={styles.poStaffCheckboxMarkText}>x</Text>
                    ) : null}
                  </View>
                </Pressable>
              </View>
              <View style={styles.marketplaceBioactiveImageBox}>
                {step.image ? (
                  <Image
                    resizeMode="cover"
                    source={{uri: resolveMarketplaceLandingImageUri(step.image)}}
                    style={styles.marketplaceBioactiveImage}
                  />
                ) : (
                  <SvgXml
                    height={32}
                    width={32}
                    xml={getMarketplaceLandingTabIconXml('featured', true)}
                  />
                )}
              </View>
              <View style={styles.marketplaceBioactiveActions}>
                <MarketplaceAssetButton
                  disabled={disabled}
                  id={`bioactive:${index}`}
                  label="Unggah"
                  onPress={() => onUploadBioactiveStepImage(index)}
                  status={assetStatus}
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

/** FE `HeroPreview` — modal carousel aspect 1280/180; eyebrow not shown. */
function MarketplaceHeroPreview({
  initialIndex,
  onClose,
  slides,
}: {
  initialIndex: number;
  onClose: () => void;
  slides: KolamHeroSlide[];
}) {
  const [selectedIndex, setSelectedIndex] = React.useState(() =>
    Math.min(Math.max(initialIndex, 0), Math.max(slides.length - 1, 0)),
  );

  React.useEffect(() => {
    setSelectedIndex(
      Math.min(Math.max(initialIndex, 0), Math.max(slides.length - 1, 0)),
    );
  }, [initialIndex, slides.length]);

  const slide = slides[selectedIndex];
  if (!slide) {
    return null;
  }

  const imageUri = resolveMarketplaceLandingImageUri(slide.image);
  const canNavigate = slides.length > 1;
  const scrollPrev = () => {
    setSelectedIndex(current =>
      current <= 0 ? slides.length - 1 : current - 1,
    );
  };
  const scrollNext = () => {
    setSelectedIndex(current =>
      current >= slides.length - 1 ? 0 : current + 1,
    );
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible>
      <View style={styles.marketplaceHeroPreviewNativeOverlay}>
        <KolamModalBackdrop onPress={onClose} />
        <View style={styles.marketplaceHeroPreviewNativeDialog}>
          <KolamCopyStack
            items={[
              {
                id: 'title',
                text: 'Pratinjau hero',
                style: styles.marketplaceHeroEditorModalTitle,
              },
              {
                id: 'count',
                text: `${selectedIndex + 1} / ${slides.length}`,
                style: styles.marketplaceHeroEditorModalDescription,
              },
            ]}
          />
          <View style={styles.marketplaceHeroPreviewStage}>
        {imageUri ? (
          <Image
            resizeMode="cover"
            source={{uri: imageUri}}
            style={styles.marketplaceHeroPreviewImage}
          />
        ) : (
          <View style={styles.marketplaceHeroPreviewImageFallback} />
        )}
        <View style={styles.marketplaceHeroPreviewContent}>
          <View style={styles.marketplaceHeroPreviewCopy}>
            <Text numberOfLines={2} style={styles.marketplaceHeroPreviewTitle}>
              {slide.title || '-'}
            </Text>
            {slide.subtitle ? (
              <Text
                numberOfLines={2}
                style={styles.marketplaceHeroPreviewSubtitle}>
                {slide.subtitle}
              </Text>
            ) : null}
            {slide.description ? (
              <Text
                numberOfLines={2}
                style={styles.marketplaceHeroPreviewDescription}>
                {slide.description}
              </Text>
            ) : null}
            <View style={styles.marketplaceHeroPreviewCtas}>
              <View style={styles.marketplaceHeroPreviewPrimaryCta}>
                <Text style={styles.marketplaceHeroPreviewPrimaryCtaLabel}>
                  {slide.linkText || 'Belanja sekarang'}
                </Text>
              </View>
              {slide.secondaryLinkText || slide.secondaryLink ? (
                <Text
                  numberOfLines={1}
                  style={styles.marketplaceHeroPreviewSecondaryCta}>
                  {`${slide.secondaryLinkText || 'Pelajari cara adopsi'} →`}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {canNavigate ? (
          <>
            <Pressable
              accessibilityLabel="Slide sebelumnya"
              accessibilityRole="button"
              onPress={scrollPrev}
              style={[
                styles.marketplaceHeroPreviewArrow,
                styles.marketplaceHeroPreviewArrowPrev,
              ]}>
              <Text style={styles.marketplaceHeroPreviewArrowLabel}>‹</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Slide berikutnya"
              accessibilityRole="button"
              onPress={scrollNext}
              style={[
                styles.marketplaceHeroPreviewArrow,
                styles.marketplaceHeroPreviewArrowNext,
              ]}>
              <Text style={styles.marketplaceHeroPreviewArrowLabel}>›</Text>
            </Pressable>
            <View style={styles.marketplaceHeroPreviewDots}>
              {slides.map((item, index) => (
                <Pressable
                  accessibilityLabel={`Ke slide ${index + 1}`}
                  accessibilityRole="button"
                  key={item._id}
                  onPress={() => setSelectedIndex(index)}
                  style={[
                    styles.marketplaceHeroPreviewDot,
                    index === selectedIndex
                      ? styles.marketplaceHeroPreviewDotActive
                      : null,
                  ]}
                />
              ))}
            </View>
          </>
        ) : null}
          </View>
          <View style={styles.marketplaceHeroPreviewFooter}>
            <Text style={styles.marketplaceHeroPreviewFooterLabel}>
              1280 x 180px
            </Text>
            <Pressable
              accessibilityLabel="Tutup pratinjau"
              accessibilityRole="button"
              onPress={onClose}
              style={styles.marketplaceHeroPreviewFooterButton}>
              <Text style={styles.marketplaceHeroPreviewFooterButtonLabel}>
                Tutup
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function resolveMarketplaceLandingImageUri(image: string | undefined) {
  const value = String(image || '').trim();
  if (!value) {
    return '';
  }
  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('file://') ||
    value.startsWith('data:')
  ) {
    return value;
  }
  const base = appConfig.fileBaseUrl.replace(/\/+$/, '');
  return `${base}/${value.replace(/^\/+/, '')}`;
}

function MarketplaceAssetRows<Item>({
  disabled,
  emptyText,
  getId,
  getLabel,
  items,
  onDelete,
  onEdit,
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
  onEdit?: (item: Item) => void;
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
                {onEdit ? (
                  <KolamEditButton
                    disabled={disabled}
                    onPress={() => onEdit(item)}
                  />
                ) : null}
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
  accessibilityLabel,
  disabled,
  id,
  icon,
  intent,
  label,
  onPress,
  status,
  style,
}: {
  accessibilityLabel?: string;
  disabled: boolean;
  id: string;
  icon?: React.ReactNode;
  intent?: 'danger' | 'primary';
  label: string;
  onPress: () => void;
  status: Partial<
    Record<string, 'idle' | 'uploading' | 'deleting' | 'reordering'>
  >;
  style?: React.ComponentProps<typeof KolamActionControlButton>['style'];
}) {
  const actionStatus = status[id];
  const busy =
    actionStatus === 'uploading' ||
    actionStatus === 'deleting' ||
    actionStatus === 'reordering';
  return (
    <KolamActionControlButton
      accessibilityLabel={accessibilityLabel}
      disabled={disabled || busy}
      icon={icon}
      intent={intent}
      label={label}
      loading={busy}
      loadingLabel={getMarketplaceAssetLoadingLabel(actionStatus)}
      onPress={onPress}
      style={style}
    />
  );
}

function MarketplaceCategoryBannerEditorModal({
  categoryDraft,
  disabled,
  existingImageUri,
  message,
  onClose,
  onPickCategoryImage,
  onSaveCategory,
  saveStatus,
  setCategoryDraftField,
}: {
  categoryDraft: MarketplaceLandingCategoryDraft;
  disabled: boolean;
  existingImageUri: string;
  message: string;
  onClose: () => void;
  onPickCategoryImage: () => void;
  onSaveCategory: () => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  setCategoryDraftField: <Key extends keyof MarketplaceLandingCategoryDraft>(
    key: Key,
    value: MarketplaceLandingCategoryDraft[Key],
  ) => void;
}) {
  const canSave =
    !!categoryDraft.categorySlug.trim() &&
    (!!categoryDraft.id || !!categoryDraft.imageLocalUri);
  const previewUri = categoryDraft.imageLocalUri || existingImageUri;

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
      <View style={styles.marketplaceHeroEditorModalOverlay}>
        <KolamModalBackdrop onPress={onClose} />
        <View style={styles.marketplaceHeroEditorModalDialog}>
          <KolamCopyStack
            items={[
              {
                id: 'title',
                text: categoryDraft.id ? 'Rubah banner' : 'Banner baru',
                style: styles.marketplaceHeroEditorModalTitle,
              },
              {
                id: 'description',
                text: 'Rekomendasi: 325 x 220px',
                style: styles.marketplaceHeroEditorModalDescription,
              },
            ]}
          />
          <ScrollView
            contentContainerStyle={styles.marketplaceHeroEditorModalContent}
            keyboardShouldPersistTaps="handled"
            style={styles.marketplaceHeroEditorModalScroll}
          >
            <Pressable
              accessibilityRole="button"
              disabled={disabled}
              onPress={onPickCategoryImage}
              style={styles.marketplaceCategoryUploadBox}
            >
              {previewUri ? (
                <Image
                  resizeMode="cover"
                  source={{uri: previewUri}}
                  style={styles.marketplaceCategoryUploadImage}
                />
              ) : (
                <View style={styles.marketplaceCategoryUploadEmpty}>
                  <SvgXml
                    height={32}
                    width={32}
                    xml={getMarketplaceLandingTabIconXml('category', true)}
                  />
                  <Text style={styles.marketplaceOverviewMeta}>
                    Pilih gambar untuk banner kategori.
                  </Text>
                </View>
              )}
            </Pressable>
            <KolamTextFieldRow
              variant="settingsForm"
              label="Slug kategori"
              description="Tautan ke /collections?category=nilai-ini"
              value={categoryDraft.categorySlug}
              onChangeText={value =>
                setCategoryDraftField('categorySlug', value)
              }
              placeholder="poison-dart-frogs"
            />
            <Pressable
              accessibilityRole="checkbox"
              disabled={disabled}
              onPress={() =>
                setCategoryDraftField('isActive', !categoryDraft.isActive)
              }
              style={styles.marketplaceCategoryToggleCard}
            >
              <View
                style={[
                  styles.poStaffCheckbox,
                  categoryDraft.isActive ? styles.poStaffCheckboxActive : null,
                ]}
              >
                <Text
                  style={[
                    styles.poStaffCheckboxMarkText,
                    categoryDraft.isActive
                      ? styles.poStaffCheckboxMarkActive
                      : null,
                  ]}
                >
                  {categoryDraft.isActive ? '✓' : ''}
                </Text>
              </View>
              <KolamCopyStack
                items={[
                  {
                    id: 'active-title',
                    text: 'Aktif',
                    style: styles.marketplaceOverviewLabel,
                  },
                  {
                    id: 'active-detail',
                    text: 'Tampilkan banner di bagian Meet our Pets.',
                    style: styles.marketplaceOverviewMeta,
                  },
                ]}
              />
            </Pressable>
            {message ? (
              <Text
                style={
                  saveStatus === 'error'
                    ? styles.marketplaceOverviewError
                    : styles.marketplaceOverviewMeta
                }
              >
                {message}
              </Text>
            ) : null}
          </ScrollView>
          <View style={styles.marketplaceHeroEditorModalFooter}>
            <KolamActionControlButton
              disabled={disabled}
              label="Pilih gambar"
              onPress={onPickCategoryImage}
            />
            <KolamActionControlButton
              disabled={disabled || !canSave}
              intent="primary"
              label={categoryDraft.id ? 'Simpan perubahan' : 'Buat banner'}
              loading={saveStatus === 'saving'}
              loadingLabel="Menyimpan..."
              onPress={onSaveCategory}
            />
            <KolamActionControlButton
              disabled={disabled}
              label="Batal"
              tone="positive"
              onPress={onClose}
            />
          </View>
        </View>
      </View>
    </Modal>
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
  announcementDraft,
  categoryDraft,
  ctaDraft,
  disabled,
  heroDraft,
  message,
  noticeDraft,
  notices,
  onClearAnnouncementDraft,
  onClearCategoryDraft,
  onClearHeroDraft,
  onClearNoticeDraft,
  onDeleteNotice,
  onEditNotice,
  onPickAnnouncementImage,
  onPickCategoryImage,
  onPickHeroImage,
  onSaveAnnouncement,
  onSaveCategory,
  onSaveCta,
  onSaveHero,
  onSaveNotice,
  onSaveYoutube,
  saveStatus,
  setAnnouncementDraftField,
  setCategoryDraftField,
  setCtaDraftField,
  setHeroDraftField,
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
  heroDraft: MarketplaceLandingHeroDraft;
  categoryDraft: MarketplaceLandingCategoryDraft;
  announcementDraft: MarketplaceLandingAnnouncementDraft;
  disabled: boolean;
  message: string;
  noticeDraft: MarketplaceLandingNoticeDraft;
  notices: KolamCustomerTextNotice[];
  onClearAnnouncementDraft: () => void;
  onClearCategoryDraft: () => void;
  onClearHeroDraft: () => void;
  onClearNoticeDraft: () => void;
  onDeleteNotice: (key: string) => void;
  onEditNotice: (notice: KolamCustomerTextNotice) => void;
  onPickAnnouncementImage: () => void;
  onPickCategoryImage: () => void;
  onPickHeroImage: () => void;
  onSaveAnnouncement: () => void;
  onSaveCategory: () => void;
  onSaveCta: () => void;
  onSaveHero: () => void;
  onSaveNotice: () => void;
  onSaveYoutube: () => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  setAnnouncementDraftField: <
    Key extends keyof MarketplaceLandingAnnouncementDraft,
  >(
    key: Key,
    value: MarketplaceLandingAnnouncementDraft[Key],
  ) => void;
  setCategoryDraftField: <Key extends keyof MarketplaceLandingCategoryDraft>(
    key: Key,
    value: MarketplaceLandingCategoryDraft[Key],
  ) => void;
  setCtaDraftField: <Key extends keyof MarketplaceLandingCtaDraft>(
    key: Key,
    value: MarketplaceLandingCtaDraft[Key],
  ) => void;
  setHeroDraftField: <Key extends keyof MarketplaceLandingHeroDraft>(
    key: Key,
    value: MarketplaceLandingHeroDraft[Key],
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
  const heroFieldWidth = 610;
  const heroCanSave =
    !!heroDraft.title.trim() && (!!heroDraft.id || !!heroDraft.imageLocalUri);
  const categoryCanSave =
    !!categoryDraft.categorySlug.trim() &&
    (!!categoryDraft.id || !!categoryDraft.imageLocalUri);
  const announcementCanSave =
    !!announcementDraft.id || !!announcementDraft.imageLocalUri;
  const noticeCanSave =
    !!noticeDraft.key.trim() &&
    !!noticeDraft.title.trim() &&
    !!noticeDraft.message.trim();

  return (
    <View style={styles.marketplaceControls}>
      {activeTabId === 'hero' ? (
        <Modal
          animationType="fade"
          onRequestClose={onClearHeroDraft}
          transparent
          visible>
          <View style={styles.marketplaceHeroEditorModalOverlay}>
            <KolamModalBackdrop onPress={onClearHeroDraft} />
            <View style={styles.marketplaceHeroEditorModalDialog}>
              <KolamCopyStack
                items={[
                  {
                    id: 'title',
                    text: heroDraft.id ? 'Rubah slide hero' : 'Slide hero baru',
                    style: styles.marketplaceHeroEditorModalTitle,
                  },
                  {
                    id: 'description',
                    text: 'Slide hero marketplace',
                    style: styles.marketplaceHeroEditorModalDescription,
                  },
                ]}
              />
              <ScrollView
                contentContainerStyle={styles.marketplaceHeroEditorModalContent}
                keyboardShouldPersistTaps="handled"
                style={styles.marketplaceHeroEditorModalScroll}
              >
                <KolamTextFieldRow
                  variant="settingsForm"
                  fieldWidth={heroFieldWidth}
                  label="Teks atas"
                  description=""
                  value={heroDraft.eyebrow}
                  onChangeText={value => setHeroDraftField('eyebrow', value)}
                  placeholder="Marketplace"
                />
                <KolamTextFieldRow
                  variant="settingsForm"
                  fieldWidth={heroFieldWidth}
                  label="Judul"
                  description=""
                  value={heroDraft.title}
                  onChangeText={value => setHeroDraftField('title', value)}
                  placeholder="Judul"
                />
                <KolamTextFieldRow
                  variant="settingsForm"
                  fieldWidth={heroFieldWidth}
                  label="Subjudul"
                  description=""
                  value={heroDraft.subtitle}
                  onChangeText={value => setHeroDraftField('subtitle', value)}
                  placeholder="Subjudul"
                />
                <KolamTextFieldRow
                  variant="settingsForm"
                  fieldWidth={heroFieldWidth}
                  label="Deskripsi"
                  description=""
                  value={heroDraft.description}
                  onChangeText={value => setHeroDraftField('description', value)}
                  placeholder="Deskripsi"
                  multiline
                  numberOfLines={3}
                />
                <KolamTextFieldRow
                  variant="settingsForm"
                  fieldWidth={heroFieldWidth}
                  label="Tautan"
                  description=""
                  value={heroDraft.link}
                  onChangeText={value => setHeroDraftField('link', value)}
                  placeholder="/products"
                />
                <KolamTextFieldRow
                  variant="settingsForm"
                  fieldWidth={heroFieldWidth}
                  label="Teks link"
                  description=""
                  value={heroDraft.linkText}
                  onChangeText={value => setHeroDraftField('linkText', value)}
                  placeholder="Belanja"
                />
                <KolamTextFieldRow
                  variant="settingsForm"
                  fieldWidth={heroFieldWidth}
                  label="Tautan kedua"
                  description=""
                  value={heroDraft.secondaryLink}
                  onChangeText={value =>
                    setHeroDraftField('secondaryLink', value)
                  }
                  placeholder="/about"
                />
                <KolamTextFieldRow
                  variant="settingsForm"
                  fieldWidth={heroFieldWidth}
                  label="Teks link kedua"
                  description=""
                  value={heroDraft.secondaryLinkText}
                  onChangeText={value =>
                    setHeroDraftField('secondaryLinkText', value)
                  }
                  placeholder="Tentang"
                />
                <KolamTextFieldRow
                  variant="settingsForm"
                  fieldWidth={heroFieldWidth}
                  label="Urutan"
                  description=""
                  value={heroDraft.order}
                  onChangeText={value => setHeroDraftField('order', value)}
                  placeholder="0"
                />
                <KolamToggleRow
                  variant="settingsForm"
                  label="Aktif"
                  description=""
                  active={heroDraft.isActive}
                  onPress={() =>
                    !disabled &&
                    setHeroDraftField('isActive', !heroDraft.isActive)
                  }
                />
              </ScrollView>
              <View style={styles.marketplaceHeroEditorModalFooter}>
              <KolamActionControlButton
                disabled={disabled}
                label={
                  heroDraft.imageLocalUri ? 'Gambar dipilih' : 'Pilih gambar'
                }
                onPress={onPickHeroImage}
              />
              <KolamActionControlButton
                disabled={disabled || !heroCanSave}
                label="Simpan slide"
                loading={saveStatus === 'saving'}
                loadingLabel="Menyimpan..."
                intent="primary"
                onPress={onSaveHero}
              />
              <KolamActionControlButton
                disabled={disabled}
                label="Tutup"
                tone="positive"
                onPress={onClearHeroDraft}
              />
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
      {activeTabId === 'category' ? (
        <View style={styles.marketplaceControlCard}>
          <KolamCopyStack
            items={[
              {
                id: 'category-title',
                text: categoryDraft.id ? 'Rubah kategori' : 'Kategori baru',
                style: styles.marketplaceOverviewLabel,
              },
            ]}
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Slug kategori"
            description=""
            value={categoryDraft.categorySlug}
            onChangeText={value => setCategoryDraftField('categorySlug', value)}
            placeholder="frogs"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Urutan"
            description=""
            value={categoryDraft.order}
            onChangeText={value => setCategoryDraftField('order', value)}
            placeholder="0"
          />
          <KolamToggleRow
            variant="settingsForm"
            label="Aktif"
            description=""
            active={categoryDraft.isActive}
            onPress={() =>
              !disabled &&
              setCategoryDraftField('isActive', !categoryDraft.isActive)
            }
          />
          <View style={styles.notificationSoundActions}>
            <KolamActionControlButton
              disabled={disabled}
              label={
                categoryDraft.imageLocalUri ? 'Gambar dipilih' : 'Pilih gambar'
              }
              onPress={onPickCategoryImage}
            />
            <KolamActionControlButton
              disabled={disabled || !categoryCanSave}
              label="Simpan kategori"
              loading={saveStatus === 'saving'}
              loadingLabel="Menyimpan..."
              intent="primary"
              onPress={onSaveCategory}
            />
            <KolamActionControlButton
              disabled={disabled}
              label="Baru"
              tone="positive"
              onPress={onClearCategoryDraft}
            />
          </View>
        </View>
      ) : null}
      {activeTabId === 'announcement' ? (
        <View style={styles.marketplaceControlCard}>
          <KolamCopyStack
            items={[
              {
                id: 'announcement-title',
                text: announcementDraft.id
                  ? 'Rubah pengumuman'
                  : 'Pengumuman baru',
                style: styles.marketplaceOverviewLabel,
              },
            ]}
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Tautan"
            description=""
            value={announcementDraft.link}
            onChangeText={value => setAnnouncementDraftField('link', value)}
            placeholder="/products"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Urutan"
            description=""
            value={announcementDraft.order}
            onChangeText={value => setAnnouncementDraftField('order', value)}
            placeholder="0"
          />
          <KolamToggleRow
            variant="settingsForm"
            label="Aktif"
            description=""
            active={announcementDraft.isActive}
            onPress={() =>
              !disabled &&
              setAnnouncementDraftField('isActive', !announcementDraft.isActive)
            }
          />
          <View style={styles.notificationSoundActions}>
            <KolamActionControlButton
              disabled={disabled}
              label={
                announcementDraft.imageLocalUri
                  ? 'Gambar dipilih'
                  : 'Pilih gambar'
              }
              onPress={onPickAnnouncementImage}
            />
            <KolamActionControlButton
              disabled={disabled || !announcementCanSave}
              label="Simpan pengumuman"
              loading={saveStatus === 'saving'}
              loadingLabel="Menyimpan..."
              intent="primary"
              onPress={onSaveAnnouncement}
            />
            <KolamActionControlButton
              disabled={disabled}
              label="Baru"
              tone="positive"
              onPress={onClearAnnouncementDraft}
            />
          </View>
        </View>
      ) : null}
      {activeTabId === 'cta' ? (
        <View style={styles.marketplaceControlCard}>
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
            description=""
            value={ctaDraft.title}
            onChangeText={value => setCtaDraftField('title', value)}
            placeholder="Jelajahi Dunia Species"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Deskripsi CTA"
            description=""
            value={ctaDraft.description}
            onChangeText={value => setCtaDraftField('description', value)}
            placeholder="Temukan koleksi lengkap..."
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Teks tombol CTA"
            description=""
            value={ctaDraft.buttonText}
            onChangeText={value => setCtaDraftField('buttonText', value)}
            placeholder="Lihat semua spesies"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Tautan tombol CTA"
            description=""
            value={ctaDraft.buttonLink}
            onChangeText={value => setCtaDraftField('buttonLink', value)}
            placeholder="/species"
          />
          <KolamToggleRow
            variant="settingsForm"
            label="CTA aktif"
            description=""
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
        <View style={styles.marketplaceControlCard}>
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
            label="Tautan YouTube"
            description=""
            value={youtubeDraft.link}
            onChangeText={value => setYoutubeDraftField('link', value)}
            placeholder="https://www.youtube.com/@DuniaAnura"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Judul YouTube"
            description=""
            value={youtubeDraft.title}
            onChangeText={value => setYoutubeDraftField('title', value)}
            placeholder="Dunia Anura"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Subjudul YouTube"
            description=""
            value={youtubeDraft.subtitle}
            onChangeText={value => setYoutubeDraftField('subtitle', value)}
            placeholder="YouTube"
          />
          <KolamToggleRow
            variant="settingsForm"
            label="YouTube aktif"
            description=""
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
        <View style={styles.marketplaceControlCard}>
          <KolamCopyStack
            items={[
              {
                id: 'notice-title',
                text: 'Pengumuman pelanggan',
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
                    <KolamEditButton
                      disabled={disabled}
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
                    text: 'Belum ada pengumuman.',
                    style: styles.marketplaceOverviewMeta,
                  },
                ]}
              />
            )}
          </View>
          <KolamTextFieldRow
            variant="settingsForm"
            label="Kode pengumuman"
            description=""
            value={noticeDraft.key}
            onChangeText={value => setNoticeDraftField('key', value)}
            placeholder="enclonura-migration-2026"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Judul pengumuman"
            description=""
            value={noticeDraft.title}
            onChangeText={value => setNoticeDraftField('title', value)}
            placeholder="Enclonura pindah ke Dunia Anura"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Pesan pengumuman"
            description=""
            value={noticeDraft.message}
            onChangeText={value => setNoticeDraftField('message', value)}
            placeholder="Kelola kandang, Freyr, dan layanan..."
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="URL CTA pengumuman"
            description=""
            value={noticeDraft.ctaUrl}
            onChangeText={value => setNoticeDraftField('ctaUrl', value)}
            placeholder="/dashboard"
          />
          <KolamTextFieldRow
            variant="settingsForm"
            label="Label CTA pengumuman"
            description=""
            value={noticeDraft.ctaLabel}
            onChangeText={value => setNoticeDraftField('ctaLabel', value)}
            placeholder="Buka dashboard"
          />
          <KolamToggleRow
            variant="settingsForm"
            label="Pengumuman aktif"
            description=""
            active={noticeDraft.isActive}
            onPress={() =>
              !disabled &&
              setNoticeDraftField('isActive', !noticeDraft.isActive)
            }
          />
          <KolamToggleRow
            variant="settingsForm"
            label="Tampilkan di beranda"
            description=""
            active={noticeDraft.showOnHome}
            onPress={() =>
              !disabled &&
              setNoticeDraftField('showOnHome', !noticeDraft.showOnHome)
            }
          />
          <KolamToggleRow
            variant="settingsForm"
            label="Tampilkan di dasbor"
            description=""
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
              label="Simpan pengumuman"
              loading={saveStatus === 'saving'}
              loadingLabel="Menyimpan..."
              intent="primary"
              onPress={onSaveNotice}
            />
            <KolamActionControlButton
              disabled={disabled}
              label="Pengumuman baru"
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

function FinancialSettingsPanel({
  disabled,
  draft,
  financialMessage,
  financialSectionVisibility,
  financialStatus,
  financialWallets,
  onClearPaymentMethodDraft,
  onDeletePaymentMethod,
  onDeletePaymentMethodPhoto,
  onEditPaymentMethod,
  onSaveEnclosureSaleCommission,
  onSaveFinancialTaxToggle,
  onSaveOvertimeSettings,
  onSavePaymentMethod,
  onSaveTaxCompanyProfile,
  onUploadPaymentMethodPhoto,
  paymentMethodDraft,
  paymentMethodFilters,
  paymentMethodTotal,
  paymentMethodTotalPages,
  paymentMethods,
  setDraftField,
  setPaymentMethodDraftField,
  setPaymentMethodFilter,
  setTaxCompanyProfileDraftField,
  settingsFieldWidth,
  taxCompanyProfile,
  taxCompanyProfileDraft,
  taxPartyGaps,
}: {
  disabled: boolean;
  draft: WebSettingDraft;
  financialMessage: string;
  financialSectionVisibility: SettingsFinancialSectionVisibility;
  financialStatus: 'idle' | 'loading' | 'live' | 'saving' | 'error';
  financialWallets: KolamFinancialWallet[];
  paymentMethodDraft: SettingsPaymentMethodDraft;
  paymentMethodFilters: SettingsPaymentMethodFilters;
  paymentMethodTotal: number;
  paymentMethodTotalPages: number;
  paymentMethods: KolamPaymentMethod[];
  settingsFieldWidth: number;
  taxCompanyProfile: KolamTaxCompanyProfile | null;
  taxCompanyProfileDraft: KolamTaxCompanyProfile;
  taxPartyGaps: KolamTaxPartyGapsSummary | null;
  onClearPaymentMethodDraft: () => void;
  onDeletePaymentMethod: (id: string) => void;
  onDeletePaymentMethodPhoto: (id: string) => void;
  onEditPaymentMethod: (method: KolamPaymentMethod) => void;
  onSaveEnclosureSaleCommission: () => void;
  onSaveFinancialTaxToggle: (
    key: 'salePricesIncludeTax' | 'commissionPph21Enabled',
    value: boolean,
  ) => void;
  onSaveOvertimeSettings: () => void;
  onSavePaymentMethod: () => void;
  onSaveTaxCompanyProfile: () => void;
  onUploadPaymentMethodPhoto: (id: string) => void;
  setDraftField: (
    key: keyof WebSettingDraft,
    value: WebSettingDraft[keyof WebSettingDraft],
  ) => void;
  setPaymentMethodDraftField: <Key extends keyof SettingsPaymentMethodDraft>(
    key: Key,
    value: SettingsPaymentMethodDraft[Key],
  ) => void;
  setPaymentMethodFilter: (
    key: keyof SettingsPaymentMethodFilters,
    value: string | number,
  ) => void;
  setTaxCompanyProfileDraftField: <Key extends keyof KolamTaxCompanyProfile>(
    key: Key,
    value: KolamTaxCompanyProfile[Key],
  ) => void;
}) {
  const busy = financialStatus === 'loading' || financialStatus === 'saving';
  const [paymentMethodFormOpen, setPaymentMethodFormOpen] =
    React.useState(false);
  const paymentMethodCanSave =
    paymentMethodDraft.name.trim() &&
    paymentMethodDraft.type &&
    paymentMethodDraft.wallet.trim();
  const profileComplete =
    taxCompanyProfileDraft.completeness?.complete ??
    taxCompanyProfile?.completeness?.complete ??
    false;
  const missingFields =
    taxCompanyProfileDraft.completeness?.missing ??
    taxCompanyProfile?.completeness?.missing ??
    [];
  const compatibleFinancialWallets = financialWallets.filter(wallet =>
    isPaymentWalletCompatible(paymentMethodDraft.type, wallet.type),
  );

  if (!financialSectionVisibility.any) {
    return (
      <KolamCopyStack
        items={[
          {
            id: 'financial-denied',
            text: 'Anda tidak memiliki izin Finansial untuk melihat pengaturan metode pembayaran, pajak, lembur, atau komisi.',
            style: styles.marketplaceOverviewError,
          },
        ]}
      />
    );
  }

  return (
    <View style={styles.marketplaceOverview}>
      {financialMessage ? (
        <KolamCopyStack
          items={[
            {
              id: 'financial-message',
              text: financialMessage,
              style:
                financialStatus === 'error'
                  ? styles.marketplaceOverviewError
                  : styles.marketplaceOverviewMeta,
            },
          ]}
        />
      ) : null}

      {financialSectionVisibility.paymentMethods ? (
        <View
          style={[
            styles.marketplaceControlSection,
            styles.notificationSettingsCard,
            styles.settingsTabCardSpacing,
          ]}
        >
          <View style={styles.operationalCardHeaderRow}>
            <KolamCopyStack
              containerStyle={styles.operationalCardHeaderCopy}
              items={[
                {
                  id: 'payment-method-section-title',
                  text: 'Metode pembayaran',
                  style: styles.marketplaceOverviewTitle,
                },
                {
                  id: 'payment-method-section-detail',
                  text: 'Channel pembayaran yang diterima toko dan wallet terkait.',
                  style: styles.marketplaceOverviewMeta,
                },
              ]}
            />
            <KolamActionControlButton
              disabled={disabled || busy}
              intent="primary"
              label="Tambah metode"
              onPress={() => {
                onClearPaymentMethodDraft();
                setPaymentMethodFormOpen(true);
              }}
            />
          </View>
          <View style={kolamTableToolbarStyles.row}>
            <TextInput
              accessibilityLabel="Cari metode pembayaran"
              editable={!busy}
              onChangeText={value => setPaymentMethodFilter('search', value)}
              placeholder="Cari metode pembayaran"
              style={[
                kolamTableToolbarStyles.searchInput,
                styles.financialSearchInput,
              ]}
              value={paymentMethodFilters.search}
            />
            <View style={kolamTableToolbarStyles.controls}>
              {[
                ['', 'Semua'],
                ['true', 'Webstore'],
                ['false', 'Non-webstore'],
              ].map(([value, label]) => (
                <FinancialChoiceSegment
                  key={value || 'all'}
                  active={paymentMethodFilters.isAvailableOnWebstore === value}
                  label={label}
                  onPress={() =>
                    setPaymentMethodFilter('isAvailableOnWebstore', value)
                  }
                />
              ))}
            </View>
          </View>
          <View style={styles.marketplaceOverviewRows}>
            {paymentMethods.length ? (
              paymentMethods.map(method => (
                <View key={method.id} style={styles.financialListRow}>
                  <KolamCopyStack
                    containerStyle={styles.marketplaceOverviewCopy}
                    items={[
                      {
                        id: `${method.id}-name`,
                        text: method.name || '-',
                        style: styles.marketplaceOverviewLabel,
                      },
                      {
                        id: `${method.id}-detail`,
                        text: [
                          method.type,
                          method.provider || '-',
                          method.wallet?.name || 'Tanpa wallet',
                          method.requireSaleProof ? 'wajib proof' : '',
                          `${method.costs.length} biaya`,
                        ]
                          .filter(Boolean)
                          .join(' | '),
                        style: styles.marketplaceOverviewDetail,
                      },
                    ]}
                  />
                  <KolamCopyStack
                    containerStyle={styles.financialStatusCopy}
                    items={[
                      {
                        id: `${method.id}-status`,
                        text: `${method.isActive ? 'Aktif' : 'Nonaktif'} / ${
                          method.isAvailableOnWebstore
                            ? 'Webstore'
                            : 'Non-webstore'
                        }`,
                        style: styles.marketplaceOverviewValue,
                      },
                    ]}
                  />
                  <View style={styles.financialActions}>
                    <KolamEditButton
                      disabled={disabled || busy}
                      onPress={() => {
                        onEditPaymentMethod(method);
                        setPaymentMethodFormOpen(true);
                      }}
                    />
                    <KolamActionControlButton
                      disabled={disabled || busy}
                      label={method.paymentIcon ? 'Ganti foto' : 'Unggah foto'}
                      onPress={() => onUploadPaymentMethodPhoto(method.id)}
                    />
                    {method.paymentIcon ? (
                      <KolamActionControlButton
                        disabled={disabled || busy}
                        intent="danger"
                        label="Hapus foto"
                        onPress={() => onDeletePaymentMethodPhoto(method.id)}
                      />
                    ) : null}
                    <KolamActionControlButton
                      disabled={disabled || busy}
                      intent="danger"
                      label="Hapus"
                      onPress={() => onDeletePaymentMethod(method.id)}
                    />
                  </View>
                </View>
              ))
            ) : (
              <KolamCopyStack
                items={[
                  {
                    id: 'payment-method-empty',
                    text: busy
                      ? 'Memuat metode pembayaran...'
                      : 'Belum ada metode pembayaran pada filter ini.',
                    style: styles.marketplaceOverviewMeta,
                  },
                ]}
              />
            )}
          </View>
          <KolamCopyStack
            items={[
              {
                id: 'payment-method-pagination',
                text: `Total ${paymentMethodTotal} data | halaman ${paymentMethodFilters.page}/${paymentMethodTotalPages}`,
                style: styles.marketplaceOverviewMeta,
              },
            ]}
          />
          <View style={styles.financialActions}>
            <KolamActionControlButton
              disabled={busy || paymentMethodFilters.page <= 1}
              label="Sebelumnya"
              onPress={() =>
                setPaymentMethodFilter('page', paymentMethodFilters.page - 1)
              }
            />
            <KolamActionControlButton
              disabled={
                busy || paymentMethodFilters.page >= paymentMethodTotalPages
              }
              label="Berikutnya"
              onPress={() =>
                setPaymentMethodFilter('page', paymentMethodFilters.page + 1)
              }
            />
          </View>
          {paymentMethodFormOpen ? (
            <Modal
              animationType="fade"
              onRequestClose={() => setPaymentMethodFormOpen(false)}
              visible={paymentMethodFormOpen}
            >
              <View style={styles.financialPaymentModalOverlay}>
                <View
                  accessibilityLabel="Form metode pembayaran"
                  style={styles.financialPaymentModalPanel}
                >
                  <View style={styles.operationalCardHeaderRow}>
                    <KolamCopyStack
                      containerStyle={styles.operationalCardHeaderCopy}
                      items={[
                        {
                          id: 'payment-method-form-title',
                          text: paymentMethodDraft.id
                            ? 'Edit metode pembayaran'
                            : 'Metode pembayaran baru',
                          style: styles.marketplaceOverviewLabel,
                        },
                      ]}
                    />
                    <KolamActionControlButton
                      disabled={busy}
                      label="Tutup"
                      onPress={() => setPaymentMethodFormOpen(false)}
                    />
                  </View>
                  <ScrollView
                    contentContainerStyle={styles.financialPaymentModalScroll}
                    keyboardShouldPersistTaps="handled"
                    style={styles.financialPaymentModalBody}
                  >
                    <View style={styles.financialFormStack}>
                      <View style={styles.financialFormBox}>
                        <KolamCopyStack
                          items={[
                            {
                              id: 'payment-method-details-title',
                              text: 'Detail metode',
                              style: styles.marketplaceOverviewLabel,
                            },
                          ]}
                        />
                        <KolamTextFieldRow
                          description="Nama channel pembayaran."
                          fieldWidth={settingsFieldWidth}
                          label="Nama"
                          onChangeText={value =>
                            setPaymentMethodDraftField('name', value)
                          }
                          placeholder="BCA, QRIS, Tunai"
                          value={paymentMethodDraft.name}
                          variant="settingsForm"
                        />
                        <KolamRowFrame variant="settingsForm">
                          <KolamTextFieldRowCopy
                            description="Pilih tunai, transfer bank, dompet digital, kartu, atau QRIS."
                            label="Tipe Pembayaran"
                          />
                          <KolamDropdownSelect
                            accessibilityLabel="Tipe metode pembayaran"
                            label="Tipe Pembayaran"
                            menuPlacement="inline"
                            options={paymentMethodTypeOptions.map(option => ({
                              label: `${option.label} - ${option.description}`,
                              value: option.value,
                            }))}
                            showLabelInTrigger={false}
                            style={[
                              styles.financialSelectorControl,
                              {width: settingsFieldWidth},
                            ]}
                            triggerStyle={styles.shippingTimezoneTrigger}
                            value={paymentMethodDraft.type}
                            onChange={value => {
                              setPaymentMethodDraftField('type', value);
                              const selectedWallet = financialWallets.find(
                                wallet => wallet.id === paymentMethodDraft.wallet,
                              );
                              if (
                                selectedWallet &&
                                !isPaymentWalletCompatible(
                                  value,
                                  selectedWallet.type,
                                )
                              ) {
                                setPaymentMethodDraftField('wallet', '');
                              }
                            }}
                          />
                        </KolamRowFrame>
                        <KolamRowFrame variant="settingsForm">
                          <KolamTextFieldRowCopy
                            description="Pilih bank, dompet digital, tunai, atau provider lainnya."
                            label="Provider Pembayaran"
                          />
                          <KolamDropdownSelect
                            accessibilityLabel="Provider metode pembayaran"
                            label="Provider Pembayaran"
                            menuPlacement="inline"
                            options={paymentMethodProviderOptions}
                            searchable
                            searchPlaceholder="Cari provider..."
                            showLabelInTrigger={false}
                            style={[
                              styles.financialSelectorControl,
                              {width: settingsFieldWidth},
                            ]}
                            triggerStyle={styles.shippingTimezoneTrigger}
                            value={
                              paymentMethodProviderOptions.some(
                                option =>
                                  option.value === paymentMethodDraft.provider,
                              )
                                ? paymentMethodDraft.provider
                                : 'Other'
                            }
                            onChange={value =>
                              setPaymentMethodDraftField('provider', value)
                            }
                          />
                        </KolamRowFrame>
                      </View>
                      <View style={styles.financialFormBox}>
                        <KolamCopyStack
                          items={[
                            {
                              id: 'payment-method-account-title',
                              text: 'Informasi akun',
                              style: styles.marketplaceOverviewLabel,
                            },
                          ]}
                        />
                        <KolamTextFieldRow
                          description="Nomor rekening, nomor akun, atau ID provider."
                          fieldWidth={settingsFieldWidth}
                          label="Nomor akun"
                          onChangeText={value =>
                            setPaymentMethodDraftField('accountNumber', value)
                          }
                          placeholder="Nomor rekening / ID"
                          value={paymentMethodDraft.accountNumber}
                          variant="settingsForm"
                        />
                        <KolamTextFieldRow
                          description="Nama pemilik rekening atau akun."
                          fieldWidth={settingsFieldWidth}
                          label="Nama akun"
                          onChangeText={value =>
                            setPaymentMethodDraftField('accountName', value)
                          }
                          placeholder="Nama pemilik akun"
                          value={paymentMethodDraft.accountName}
                          variant="settingsForm"
                        />
                        <KolamTextFieldRow
                          description="Catatan internal untuk admin."
                          fieldWidth={settingsFieldWidth}
                          label="Catatan"
                          onChangeText={value =>
                            setPaymentMethodDraftField('notes', value)
                          }
                          placeholder="Catatan internal"
                          value={paymentMethodDraft.notes}
                          variant="settingsForm"
                        />
                      </View>
                      <View style={styles.financialFormBox}>
                        <KolamRowFrame variant="settingsForm">
                          <KolamTextFieldRowCopy
                            description="Pilih wallet penerima transaksi metode pembayaran ini."
                            label="Wallet"
                          />
                          <KolamDropdownSelect
                            accessibilityLabel="Wallet metode pembayaran"
                            label="Wallet"
                            menuPlacement="inline"
                            options={[
                              {value: '', label: 'Pilih wallet'},
                              ...compatibleFinancialWallets.map(wallet => ({
                                value: wallet.id,
                                label: `${wallet.name} (${wallet.type})`,
                              })),
                            ]}
                            searchable
                            searchPlaceholder="Cari wallet..."
                            showLabelInTrigger={false}
                            style={[
                              styles.financialSelectorControl,
                              {width: settingsFieldWidth},
                            ]}
                            triggerStyle={styles.shippingTimezoneTrigger}
                            value={paymentMethodDraft.wallet}
                            onChange={value =>
                              setPaymentMethodDraftField('wallet', value)
                            }
                          />
                        </KolamRowFrame>
                      </View>
                      <View style={styles.financialFormBox}>
                        <KolamCopyStack
                          items={[
                            {
                              id: 'payment-method-cost-title',
                              text: 'Biaya Payment Method',
                              style: styles.marketplaceOverviewLabel,
                            },
                          ]}
                        />
                        <KolamTextFieldRow
                          description="Satu baris per biaya: nama|percentage/fixed|nilai."
                          fieldWidth={settingsFieldWidth}
                          label="Biaya"
                          multiline
                          numberOfLines={3}
                          onChangeText={value =>
                            setPaymentMethodDraftField('costsText', value)
                          }
                          placeholder="Admin QRIS|percentage|0.7"
                          value={paymentMethodDraft.costsText}
                          variant="settingsForm"
                        />
                      </View>
                      <View style={styles.financialFormBox}>
                        <KolamCopyStack
                          items={[
                            {
                              id: 'payment-method-rules-title',
                              text: 'Pengaturan',
                              style: styles.marketplaceOverviewLabel,
                            },
                          ]}
                        />
                        <View style={styles.notificationToggleGrid}>
                          <View style={styles.notificationToggleBox}>
                            <KolamToggleRow
                              active={paymentMethodDraft.isActive}
                              description="Metode aktif bisa dipakai transaksi."
                              label="Metode aktif"
                              onPress={() =>
                                setPaymentMethodDraftField(
                                  'isActive',
                                  !paymentMethodDraft.isActive,
                                )
                              }
                              variant="settingsForm"
                            />
                          </View>
                          <View style={styles.notificationToggleBox}>
                            <KolamToggleRow
                              active={paymentMethodDraft.isAvailableOnWebstore}
                              description="Tampilkan sebagai opsi pembayaran webstore."
                              label="Tersedia di webstore"
                              onPress={() =>
                                setPaymentMethodDraftField(
                                  'isAvailableOnWebstore',
                                  !paymentMethodDraft.isAvailableOnWebstore,
                                )
                              }
                              variant="settingsForm"
                            />
                          </View>
                          <View style={styles.notificationToggleBox}>
                            <KolamToggleRow
                              active={paymentMethodDraft.requireSaleProof}
                              description="Pembeli wajib melampirkan bukti transfer."
                              label="Wajib bukti pembayaran"
                              onPress={() =>
                                setPaymentMethodDraftField(
                                  'requireSaleProof',
                                  !paymentMethodDraft.requireSaleProof,
                                )
                              }
                              variant="settingsForm"
                            />
                          </View>
                        </View>
                      </View>
                      <View style={styles.financialActions}>
                        <KolamActionControlButton
                          disabled={disabled || busy || !paymentMethodCanSave}
                          intent="primary"
                          label="Simpan metode"
                          loading={financialStatus === 'saving'}
                          loadingLabel="Menyimpan..."
                          onPress={onSavePaymentMethod}
                        />
                        <KolamResetButton
                          disabled={disabled || busy}
                          onPress={onClearPaymentMethodDraft}
                        />
                      </View>
                    </View>
                  </ScrollView>
                </View>
              </View>
            </Modal>
          ) : null}
        </View>
      ) : null}

      {financialSectionVisibility.taxProfile ? (
        <View style={styles.financialNestedCard}>
          <View style={styles.operationalCardHeaderRow}>
            <KolamCopyStack
              containerStyle={styles.operationalCardHeaderCopy}
              items={[
                {
                  id: 'tax-profile-title',
                  text: 'Profil pajak perusahaan',
                  style: styles.marketplaceOverviewTitle,
                },
                {
                  id: 'tax-profile-detail',
                  text: 'NPWP, status PKP, alamat, dan data wajib pajak untuk Tax Intelligence.',
                  style: styles.marketplaceOverviewMeta,
                },
              ]}
            />
            <KolamActionControlButton
              disabled={disabled || busy || !financialSectionVisibility.taxEdit}
              intent="primary"
              label="Simpan profil pajak"
              loading={financialStatus === 'saving'}
              loadingLabel="Menyimpan..."
              onPress={onSaveTaxCompanyProfile}
            />
          </View>
          <KolamCopyStack
            items={[
              {
                id: 'tax-completeness',
                text: profileComplete ? 'Profil lengkap' : 'Belum lengkap',
                style: profileComplete
                  ? styles.marketplaceOverviewValue
                  : styles.marketplaceOverviewError,
              },
              {
                id: 'tax-missing',
                text: missingFields.length
                  ? `Perlu dilengkapi: ${missingFields.join(' | ')}`
                  : 'Tidak ada field wajib yang hilang.',
                style: styles.marketplaceOverviewMeta,
              },
            ]}
          />
          <KolamTextFieldRow
            description="Nama profil pajak yang dipakai faktur."
            fieldWidth={settingsFieldWidth}
            label="Nama perusahaan / toko"
            onChangeText={value =>
              setTaxCompanyProfileDraftField('companyName', value)
            }
            placeholder="Dunia Anura"
            value={taxCompanyProfileDraft.companyName ?? ''}
            variant="settingsForm"
          />
          <KolamTextFieldRow
            description="Nama legal sesuai akta atau SPT."
            fieldWidth={settingsFieldWidth}
            label="Nama legal"
            onChangeText={value =>
              setTaxCompanyProfileDraftField('legalName', value)
            }
            placeholder="PT Dunia Anura"
            value={taxCompanyProfileDraft.legalName ?? ''}
            variant="settingsForm"
          />
          <KolamTextFieldRow
            description="NPWP lama 15 digit."
            fieldWidth={settingsFieldWidth}
            label="NPWP 15 digit"
            onChangeText={value =>
              setTaxCompanyProfileDraftField('npwp', value)
            }
            placeholder="00.000.000.0-000.000"
            value={taxCompanyProfileDraft.npwp ?? ''}
            variant="settingsForm"
          />
          <KolamTextFieldRow
            description="NPWP baru 16 digit."
            fieldWidth={settingsFieldWidth}
            label="NPWP 16 digit"
            onChangeText={value =>
              setTaxCompanyProfileDraftField('npwp16', value)
            }
            value={taxCompanyProfileDraft.npwp16 ?? ''}
            variant="settingsForm"
          />
          <KolamTextFieldRow
            description="NIK untuk wajib pajak perorangan."
            fieldWidth={settingsFieldWidth}
            label="NIK"
            onChangeText={value => setTaxCompanyProfileDraftField('nik', value)}
            value={taxCompanyProfileDraft.nik ?? ''}
            variant="settingsForm"
          />
          <KolamRowFrame variant="settingsForm">
            <KolamTextFieldRowCopy
              description="Pilih bentuk wajib pajak perusahaan."
              label="Jenis wajib pajak"
            />
            <KolamDropdownSelect
              accessibilityLabel="Jenis wajib pajak"
              label="Jenis wajib pajak"
              menuPlacement="inline"
              options={taxPayerTypeOptions}
              showLabelInTrigger={false}
              style={[
                styles.financialSelectorControl,
                {width: settingsFieldWidth},
              ]}
              triggerStyle={styles.shippingTimezoneTrigger}
              value={taxCompanyProfileDraft.taxpayerType ?? 'pt'}
              onChange={value =>
                setTaxCompanyProfileDraftField('taxpayerType', value)
              }
            />
          </KolamRowFrame>
          <KolamRowFrame variant="settingsForm">
            <KolamTextFieldRowCopy
              description="Pilih skema UMKM untuk estimasi dan dokumen pajak."
              label="Skema UMKM"
            />
            <KolamDropdownSelect
              accessibilityLabel="Skema UMKM"
              label="Skema UMKM"
              menuPlacement="inline"
              options={taxUmkmSchemeOptions}
              showLabelInTrigger={false}
              style={[
                styles.financialSelectorControl,
                {width: settingsFieldWidth},
              ]}
              triggerStyle={styles.shippingTimezoneTrigger}
              value={taxCompanyProfileDraft.umkmScheme ?? 'none'}
              onChange={value =>
                setTaxCompanyProfileDraftField('umkmScheme', value)
              }
            />
          </KolamRowFrame>
          <KolamToggleRow
            active={taxCompanyProfileDraft.isPkp === true}
            description="Aktif jika perusahaan terdaftar sebagai PKP."
            label="Pengusaha Kena Pajak (PKP)"
            onPress={() =>
              setTaxCompanyProfileDraftField(
                'isPkp',
                taxCompanyProfileDraft.isPkp !== true,
              )
            }
            variant="settingsForm"
          />
          <KolamTextFieldRow
            description="Nomor pengukuhan PKP."
            fieldWidth={settingsFieldWidth}
            label="Nomor Sertifikat PKP (NPPKP)"
            onChangeText={value =>
              setTaxCompanyProfileDraftField('pkpCertificateNumber', value)
            }
            value={taxCompanyProfileDraft.pkpCertificateNumber ?? ''}
            variant="settingsForm"
          />
          <KolamTextFieldRow
            description="Kantor Pelayanan Pajak terdaftar."
            fieldWidth={settingsFieldWidth}
            label="KPP"
            onChangeText={value =>
              setTaxCompanyProfileDraftField('taxOffice', value)
            }
            value={taxCompanyProfileDraft.taxOffice ?? ''}
            variant="settingsForm"
          />
          <KolamTextFieldRow
            description="Tarif PPN default untuk estimasi DARA Tax."
            fieldWidth={settingsFieldWidth}
            label="PPN default (%)"
            onChangeText={value =>
              setTaxCompanyProfileDraftField(
                'defaultPpnRate',
                Number(value) || 0,
              )
            }
            value={String(taxCompanyProfileDraft.defaultPpnRate ?? 11)}
            variant="settingsForm"
          />
          <KolamToggleRow
            active={taxCompanyProfileDraft.pricesIncludeTax !== false}
            description="Harga pada profil pajak dianggap sudah termasuk PPN."
            label="Harga include PPN (profil pajak)"
            onPress={() =>
              setTaxCompanyProfileDraftField(
                'pricesIncludeTax',
                taxCompanyProfileDraft.pricesIncludeTax === false,
              )
            }
            variant="settingsForm"
          />
          <KolamTextFieldRow
            description="Catatan internal pajak."
            fieldWidth={settingsFieldWidth}
            label="Catatan internal"
            multiline
            numberOfLines={3}
            onChangeText={value =>
              setTaxCompanyProfileDraftField('notes', value)
            }
            value={taxCompanyProfileDraft.notes ?? ''}
            variant="settingsForm"
          />
          <KolamCopyStack
            items={[
              {
                id: 'registered-address',
                text: `Alamat terdaftar: ${
                  taxCompanyProfileDraft.registeredAddress?.addressText || '-'
                }`,
                style: styles.marketplaceOverviewMeta,
              },
              {
                id: 'party-gaps',
                text: taxPartyGaps
                  ? `Vendor NPWP ${taxPartyGaps.vendorWithNpwp}/${taxPartyGaps.vendorTotal} | Customer NPWP ${taxPartyGaps.customerWithNpwp}/${taxPartyGaps.customerTotal}`
                  : 'Gap rekanan belum dimuat.',
                style: styles.marketplaceOverviewMeta,
              },
            ]}
          />
          {!financialSectionVisibility.taxEdit ? (
            <KolamCopyStack
              items={[
                {
                  id: 'tax-read-only',
                  text: 'Mode baca saja - butuh permission tax:draft.',
                  style: styles.marketplaceOverviewMeta,
                },
              ]}
            />
          ) : null}
        </View>
      ) : null}

      {financialSectionVisibility.overtime ? (
        <View style={styles.financialNestedCard}>
          <View style={styles.operationalCardHeaderRow}>
            <KolamCopyStack
              containerStyle={styles.operationalCardHeaderCopy}
              items={[
                {
                  id: 'overtime-title',
                  text: 'Lembur karyawan',
                  style: styles.marketplaceOverviewTitle,
                },
                {
                  id: 'overtime-detail',
                  text: 'Per jam atau per hari untuk pengajuan lembur karyawan.',
                  style: styles.marketplaceOverviewMeta,
                },
              ]}
            />
            <KolamActionControlButton
              disabled={disabled || busy}
              intent="primary"
              label="Simpan lembur"
              onPress={onSaveOvertimeSettings}
            />
          </View>
          <KolamRowFrame variant="settingsForm">
            <KolamTextFieldRowCopy
              description="Pilih dasar hitung lembur untuk pengajuan karyawan."
              label="Mode perhitungan lembur"
            />
            <KolamDropdownSelect
              accessibilityLabel="Mode perhitungan lembur"
              label="Mode perhitungan lembur"
              menuPlacement="inline"
              options={overtimeCalculationModeOptions}
              showLabelInTrigger={false}
              style={[
                styles.financialSelectorControl,
                {width: settingsFieldWidth},
              ]}
              triggerStyle={styles.shippingTimezoneTrigger}
              value={draft.overtimeCalculationMode}
              onChange={value =>
                setDraftField('overtimeCalculationMode', value)
              }
            />
          </KolamRowFrame>
          {draft.overtimeCalculationMode === 'per_hour' ? (
            <>
              <KolamTextFieldRow
                description="Tarif tetap per jam; 0 memakai turunan gaji."
                fieldWidth={settingsFieldWidth}
                label="Tarif per jam"
                onChangeText={value =>
                  setDraftField('overtimeRatePerHour', value)
                }
                value={draft.overtimeRatePerHour}
                variant="settingsForm"
              />
              <KolamTextFieldRow
                description="Dibatasi 1 sampai 12 jam saat disimpan."
                fieldWidth={settingsFieldWidth}
                label="Jam default per pengajuan"
                onChangeText={value =>
                  setDraftField('overtimeDefaultHoursPerRequest', value)
                }
                value={draft.overtimeDefaultHoursPerRequest}
                variant="settingsForm"
              />
            </>
          ) : (
            <KolamTextFieldRow
              description="Tarif tetap per hari; 0 memakai turunan gaji."
              fieldWidth={settingsFieldWidth}
              label="Tarif per hari"
              onChangeText={value => setDraftField('overtimeRatePerDay', value)}
              value={draft.overtimeRatePerDay}
              variant="settingsForm"
            />
          )}
          <KolamTextFieldRow
            description="Format HH:MM, mengikuti FE."
            fieldWidth={settingsFieldWidth}
            label="Batas akhir lembur"
            onChangeText={value =>
              setDraftField('overtimeMidnightCutoff', value)
            }
            placeholder="23:59"
            value={draft.overtimeMidnightCutoff}
            variant="settingsForm"
          />
          <View style={styles.notificationToggleGrid}>
            <View style={styles.notificationToggleBox}>
              <KolamToggleRow
                active={draft.overtimeUseSalaryDerivedRate}
                description="Jika tarif tetap 0, pakai gaji dibagi 173 atau 25."
                label="Tarif dari gaji"
                onPress={() =>
                  setDraftField(
                    'overtimeUseSalaryDerivedRate',
                    !draft.overtimeUseSalaryDerivedRate,
                  )
                }
                variant="settingsForm"
              />
            </View>
            <View style={styles.notificationToggleBox}>
              <KolamToggleRow
                active={draft.overtimeUseStoreCloseForPerDay}
                description="Gunakan jam tutup toko sebagai awal lembur per hari."
                label="Pakai jam tutup toko"
                onPress={() =>
                  setDraftField(
                    'overtimeUseStoreCloseForPerDay',
                    !draft.overtimeUseStoreCloseForPerDay,
                  )
                }
                variant="settingsForm"
              />
            </View>
          </View>
        </View>
      ) : null}

      {financialSectionVisibility.enclosureCommission ? (
        <View style={styles.financialNestedCard}>
          <View style={styles.operationalCardHeaderRow}>
            <KolamCopyStack
              containerStyle={styles.operationalCardHeaderCopy}
              items={[
                {
                  id: 'enclosure-commission-title',
                  text: 'Komisi penjualan kandang',
                  style: styles.marketplaceOverviewTitle,
                },
                {
                  id: 'enclosure-commission-detail',
                  text: 'Tarif global untuk baris invoice itemType kandang.',
                  style: styles.marketplaceOverviewMeta,
                },
              ]}
            />
            <KolamActionControlButton
              disabled={disabled || busy}
              intent="primary"
              label="Simpan komisi kandang"
              onPress={onSaveEnclosureSaleCommission}
            />
          </View>
          {draft.enclosureSaleCommissionEnabled ? (
            <>
              <KolamRowFrame variant="settingsForm">
                <KolamTextFieldRowCopy
                  description="Pilih apakah komisi dihitung persen atau nominal tetap."
                  label="Tipe komisi kandang"
                />
                <KolamDropdownSelect
                  accessibilityLabel="Tipe komisi kandang"
                  label="Tipe komisi kandang"
                  menuPlacement="inline"
                  options={enclosureSaleCommissionTypeOptions}
                  showLabelInTrigger={false}
                  style={[
                    styles.financialSelectorControl,
                    {width: settingsFieldWidth},
                  ]}
                  triggerStyle={styles.shippingTimezoneTrigger}
                  value={draft.enclosureSaleCommissionType}
                  onChange={value =>
                    setDraftField('enclosureSaleCommissionType', value)
                  }
                />
              </KolamRowFrame>
              <KolamTextFieldRow
                description="Nilai persen atau nominal sesuai tipe komisi."
                fieldWidth={settingsFieldWidth}
                label={
                  draft.enclosureSaleCommissionType === 'fixed'
                    ? 'Nominal per kandang'
                    : 'Persentase'
                }
                onChangeText={value =>
                  setDraftField('enclosureSaleCommissionValue', value)
                }
                value={draft.enclosureSaleCommissionValue}
                variant="settingsForm"
              />
            </>
          ) : null}
          <View style={styles.notificationToggleGrid}>
            <View style={styles.notificationToggleBox}>
              <KolamToggleRow
                active={draft.enclosureSaleCommissionEnabled}
                description="Nonaktif berarti baris kandang tidak di-accrue."
                label="Aktifkan komisi kandang"
                onPress={() =>
                  setDraftField(
                    'enclosureSaleCommissionEnabled',
                    !draft.enclosureSaleCommissionEnabled,
                  )
                }
                variant="settingsForm"
              />
            </View>
            <View style={styles.notificationToggleBox}>
              <KolamToggleRow
                active={draft.salePricesIncludeTax}
                description="Default true jika field BE kosong."
                label="Harga jual include PPN"
                onPress={() =>
                  onSaveFinancialTaxToggle(
                    'salePricesIncludeTax',
                    !draft.salePricesIncludeTax,
                  )
                }
                variant="settingsForm"
              />
            </View>
            <View style={styles.notificationToggleBox}>
              <KolamToggleRow
                active={draft.commissionPph21Enabled}
                description="Aktifkan perhitungan PPh 21 untuk komisi."
                label="PPh 21 komisi"
                onPress={() =>
                  onSaveFinancialTaxToggle(
                    'commissionPph21Enabled',
                    !draft.commissionPph21Enabled,
                  )
                }
                variant="settingsForm"
              />
            </View>
          </View>
        </View>
      ) : null}

    </View>
  );
}

function FinancialSectionHeader({
  detail,
  title,
}: {
  detail: string;
  title: string;
}) {
  return (
    <KolamCopyStack
      items={[
        {
          id: `${title}-title`,
          text: title,
          style: styles.marketplaceOverviewLabel,
        },
        {
          id: `${title}-detail`,
          text: detail,
          style: styles.marketplaceOverviewDetail,
        },
      ]}
    />
  );
}

function FinancialChoiceSegment({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <KolamChoiceSegment
      id={label}
      label={label}
      onSelect={onPress}
      selectedId={active ? label : ''}
    />
  );
}

function isPaymentWalletCompatible(
  paymentType: SettingsPaymentMethodDraft['type'],
  walletType: string,
) {
  const normalizedWalletType = walletType.toLowerCase();
  if (paymentType === 'cash') {
    return normalizedWalletType === 'cash';
  }

  return normalizedWalletType !== 'cash';
}

function SocialMediaFieldRow({
  accentColor,
  fieldWidth,
  label,
  logoXml,
  onChangeText,
  placeholder,
  value,
}: {
  accentColor: string;
  fieldWidth: number;
  label: string;
  logoXml: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View style={styles.socialMediaFieldRow}>
      <View style={[styles.socialMediaLogo, { backgroundColor: accentColor }]}>
        <SvgXml height={20} width={20} xml={logoXml} />
      </View>
      <View style={styles.socialMediaField}>
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={fieldWidth}
          label={label}
          description={`Tautan ${label} storefront.`}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
        />
      </View>
    </View>
  );
}

function getSocialMediaLogoXml(
  platform: 'facebook' | 'instagram' | 'x' | 'youtube' | 'tiktok',
) {
  const fill = '#ffffff';

  switch (platform) {
    case 'facebook':
      return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="${fill}" d="M15.1 8.2h-2V6.8c0-.5.3-.6.6-.6h1.4V3.8h-2c-2.3 0-3.5 1.3-3.5 3.7v.7H7.8v2.7h1.8v7.3h3.5v-7.3h1.7l.3-2.7Z"/></svg>`;
    case 'instagram':
      return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="4.2" y="4.2" width="15.6" height="15.6" rx="4.4" fill="none" stroke="${fill}" stroke-width="2"/><circle cx="12" cy="12" r="3.6" fill="none" stroke="${fill}" stroke-width="2"/><circle cx="16.7" cy="7.3" r="1.1" fill="${fill}"/></svg>`;
    case 'x':
      return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="${fill}" d="M14.2 10.6 20.2 4h-2.1l-4.9 5.4L9.2 4H4l6.4 8.6L4 20h2.1l5.3-6 4.4 6H21l-6.8-9.4Zm-1.9 2.1-.8-1.1-4.8-6h1.5l4 5.1.8 1.1 5 6.4h-1.5l-4.2-5.5Z"/></svg>`;
    case 'youtube':
      return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="${fill}" d="M21 8.1a3 3 0 0 0-2.1-2.1C17 5.5 12 5.5 12 5.5s-5 0-6.9.5A3 3 0 0 0 3 8.1 31 31 0 0 0 2.5 12c0 1.3.2 2.6.5 3.9A3 3 0 0 0 5.1 18c1.9.5 6.9.5 6.9.5s5 0 6.9-.5a3 3 0 0 0 2.1-2.1c.3-1.3.5-2.6.5-3.9s-.2-2.6-.5-3.9ZM10.1 15.1V8.9l5.4 3.1-5.4 3.1Z"/></svg>`;
    case 'tiktok':
    default:
      return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="${fill}" d="M15.6 4c.3 2.2 1.6 3.5 3.8 3.7v3.1a6.7 6.7 0 0 1-3.7-1.1v5.4c0 3-2 5-5 5-2.9 0-5-1.9-5-4.7 0-3.3 3-5.5 6.1-4.8v3.3c-1.4-.5-2.8.4-2.8 1.7 0 1 .8 1.7 1.8 1.7 1.1 0 1.8-.7 1.8-2V4h3Z"/></svg>`;
  }
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

function parseMacAddressText(value: string) {
  return value
    .split(/[\n,]/)
    .map(normalizeMacAddressInput)
    .filter(Boolean);
}

function normalizeMacAddressInput(value: string) {
  return value.trim().toUpperCase();
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
  const extended = user as KolamUserPickerRow & {
    displayName?: string;
    email?: string;
    name?: string;
  };
  const fullName = [user.first_name, user.last_name]
    .map(value => String(value ?? '').trim())
    .filter(Boolean)
    .join(' ');

  return (
    fullName ||
    String(extended.name ?? '').trim() ||
    String(extended.displayName ?? '').trim() ||
    String(user.username ?? '').trim() ||
    String(extended.email ?? '').trim() ||
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

function formatSitemapPriority(value: number) {
  if (!Number.isFinite(value)) {
    return '0.5';
  }

  const clamped = Math.max(0.1, Math.min(1, Number(value.toFixed(1))));
  return clamped === 1 ? '1.0' : clamped.toFixed(1);
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

function getRegionCardLabel(level: string) {
  const labels: Record<string, string> = {
    province: 'Provinsi',
    regency: 'Kota/kabupaten',
    district: 'Kecamatan',
    village: 'Kelurahan',
  };

  return labels[level] ?? level;
}

function getRegionSyncScopeForLevel(level: string): KolamRegionSyncScope {
  const scopes: Record<string, KolamRegionSyncScope> = {
    district: 'districts',
    province: 'provinces',
    regency: 'regencies',
    village: 'villages',
  };

  return scopes[level] ?? 'all';
}

function createRegionDropdownOptions(
  placeholder: string,
  regions: KolamRegion[],
) {
  return [
    {label: placeholder, value: ''},
    ...regions.map(region => ({
      label: region.name,
      value: region.code,
    })),
  ];
}

function formatRegionUpdatedAt(value?: string) {
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

const styles = StyleSheet.create({
  settingsTabCardSpacing: {
    marginBottom: 14,
  },
  umumTopRow: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 10,
  },
  umumCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flexBasis: 340,
    flexGrow: 1,
    gap: 12,
    minWidth: 280,
    padding: 12,
  },
  umumMacActions: {
    alignItems: 'flex-start',
  },
  umumMacCardDescription: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 18,
  },
  umumMacCardTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '800',
  },
  umumMacCode: {
    color: V.colors.fg,
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '700',
    minWidth: 120,
  },
  umumMacDetectedCard: {
    backgroundColor: '#f9fafb',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 10,
  },
  umumMacEmpty: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  umumMacList: {
    gap: 8,
  },
  umumMacListRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  attendanceProviderChoices: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
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
  financialActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    flexShrink: 1,
    gap: 8,
    justifyContent: 'flex-end',
    minWidth: 0,
  },
  financialDropdown: {
    maxWidth: 520,
    width: '100%',
  },
  financialFormBox: {
    backgroundColor: '#ffffff',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 12,
    width: '100%',
  },
  financialFormStack: {
    gap: 12,
    width: '100%',
  },
  financialListRow: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    minWidth: 0,
    paddingVertical: 12,
    width: '100%',
  },
  financialSearchInput: {
    borderColor: '#d1d5db',
    borderRadius: 6,
    borderWidth: 1,
    color: '#111827',
    flexShrink: 1,
    fontSize: 13,
    height: 36,
    minWidth: 220,
    paddingHorizontal: 10,
  },
  financialSelectorControl: {
    flexShrink: 0,
  },
  financialStatusCopy: {
    flexShrink: 1,
    minWidth: 140,
  },
  financialNestedCard: {
    backgroundColor: '#f9fafb',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  sitemapCardStack: {
    gap: 14,
  },
  sitemapSectionGrid: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sitemapExcludedGrid: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sitemapExcludedCard: {
    backgroundColor: '#ffffff',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: 300,
    flexGrow: 1,
    gap: 8,
    minWidth: 260,
    padding: 10,
  },
  sitemapExcludedHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  sitemapExcludedCount: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
  },
  sitemapExcludedInput: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderRadius: 6,
    borderWidth: 1,
    color: '#111827',
    flexGrow: 1,
    fontSize: 13,
    lineHeight: 18,
    minHeight: 82,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  sitemapStaticGrid: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sitemapStaticCard: {
    backgroundColor: '#ffffff',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: 480,
    flexGrow: 1,
    gap: 10,
    minWidth: 380,
    padding: 10,
  },
  sitemapRowCard: {
    backgroundColor: '#ffffff',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: 340,
    flexGrow: 1,
    gap: 10,
    minWidth: 300,
    padding: 10,
  },
  sitemapRowFields: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sitemapDropdownControl: {
    width: 160,
  },
  sitemapEmptyText: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 18,
  },
  financialPaymentModalOverlay: {
    backgroundColor: '#f9fafb',
    flex: 1,
  },
  financialPaymentModalBody: {
    flex: 1,
    minHeight: 0,
  },
  financialPaymentModalPanel: {
    backgroundColor: '#f9fafb',
    flex: 1,
    gap: 10,
    padding: 12,
  },
  financialPaymentModalScroll: {
    gap: 12,
    paddingBottom: 6,
  },
  financialToolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
    backgroundColor: '#ffffff',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  marketplaceAssetSection: {
    gap: 10,
  },
  marketplaceControls: {
    gap: 14,
  },
  marketplaceControlCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  marketplaceControlSection: {
    gap: 10,
  },
  marketplaceHeroActiveBadge: {
    backgroundColor: '#ecfdf5',
    borderColor: '#86efac',
    borderRadius: 5,
    borderWidth: 1,
    color: '#166534',
    fontSize: 12,
    fontWeight: '800',
    minWidth: 22,
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 3,
    textAlign: 'center',
  },
  marketplaceHeroActiveCopy: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  marketplaceHeroEditorModalContent: {
    gap: 6,
    paddingBottom: 4,
  },
  marketplaceHeroEditorModalDescription: {
    color: V.colors.mutedFg,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
    marginTop: 4,
  },
  marketplaceHeroEditorModalDialog: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 1401,
    gap: 12,
    maxHeight: '88%',
    maxWidth: '92%',
    padding: 16,
    shadowColor: V.colors.fg,
    shadowOffset: {height: 16, width: 0},
    shadowOpacity: 0.18,
    shadowRadius: 24,
    width: 860,
    zIndex: 140001,
  },
  marketplaceHeroEditorModalFooter: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    flexShrink: 0,
    gap: 8,
    justifyContent: 'flex-end',
    paddingTop: 12,
  },
  marketplaceHeroEditorModalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  marketplaceHeroEditorModalScroll: {
    flexShrink: 1,
  },
  marketplaceHeroEditorModalTitle: {
    color: V.colors.fg,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
  },
  marketplaceHeroEmpty: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    justifyContent: 'center',
    minHeight: 180,
    padding: 18,
  },
  marketplaceHeroEmptyTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  marketplaceHeroSlideActions: {
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderLeftColor: V.colors.border,
    borderLeftWidth: 1,
    flexShrink: 0,
    gap: 1,
    height: 98,
    justifyContent: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    width: 44,
  },
  marketplaceHeroSlideActionButton: {
    borderRadius: 5,
    height: 20,
    minHeight: 20,
    paddingHorizontal: 0,
    width: 20,
  },
  marketplaceHeroSlideActionButtonDanger: {
    backgroundColor: '#fee2e2',
    borderColor: '#fecaca',
  },
  marketplaceHeroSlideActionGlyph: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 14,
    textAlign: 'center',
  },
  marketplaceHeroSlideActionSeparator: {
    backgroundColor: V.colors.border,
    height: 1,
    width: 14,
  },
  marketplaceBioactiveCard: {
    backgroundColor: '#ffffff',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: 160,
    flexGrow: 1,
    gap: 10,
    minWidth: 150,
    padding: 10,
  },
  marketplaceBioactiveCheckbox: {
    alignItems: 'center',
    borderColor: '#e5e7eb',
    borderRadius: 6,
    borderWidth: 1,
    height: 22,
    justifyContent: 'center',
    padding: 2,
    width: 22,
  },
  marketplaceBioactiveActions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  marketplaceBioactiveGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  marketplaceBioactiveHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  marketplaceBioactiveImage: {
    height: '100%',
    width: '100%',
  },
  marketplaceBioactiveImageBox: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: '#f3f4f6',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  marketplaceCtaCard: {
    gap: 18,
  },
  marketplaceCtaFieldGroup: {
    gap: 8,
  },
  marketplaceCtaFieldHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  marketplaceCtaFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  marketplaceCtaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  marketplaceCtaHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  marketplaceCtaImage: {
    height: '100%',
    width: '100%',
  },
  marketplaceCtaImageBox: {
    alignItems: 'center',
    aspectRatio: 21 / 9,
    backgroundColor: '#f3f4f6',
    borderColor: V.colors.border,
    borderRadius: 10,
    borderStyle: 'dashed',
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  marketplaceCtaImageEmpty: {
    alignItems: 'center',
    gap: 7,
    justifyContent: 'center',
    padding: 16,
  },
  marketplaceCtaPanel: {
    gap: 12,
    width: '100%',
  },
  marketplaceCtaStack: {
    gap: 14,
  },
  marketplaceCtaToggleCard: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    padding: 12,
  },
  marketplaceCategoryCard: {
    backgroundColor: '#ffffff',
    borderColor: V.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flexBasis: 300,
    flexGrow: 1,
    maxWidth: 360,
    overflow: 'hidden',
  },
  marketplaceCategoryEmpty: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: 8,
    justifyContent: 'center',
    minHeight: 180,
    padding: 18,
  },
  marketplaceCategoryFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    padding: 10,
  },
  marketplaceCategoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  marketplaceCategoryImage: {
    height: '100%',
    width: '100%',
  },
  marketplaceCategoryImageFallback: {
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  marketplaceCategoryImageWrap: {
    aspectRatio: 325 / 220,
    backgroundColor: '#f3f4f6',
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  marketplaceCategoryPanel: {
    gap: 12,
  },
  marketplaceCategorySlug: {
    color: V.colors.fg,
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    minWidth: 0,
  },
  marketplaceCategoryStatus: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
  marketplaceCategoryToggleCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  marketplaceCategoryToolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    marginTop: 8,
  },
  marketplaceCategoryUploadBox: {
    alignItems: 'center',
    aspectRatio: 325 / 220,
    backgroundColor: '#f3f4f6',
    borderColor: V.colors.border,
    borderRadius: 10,
    borderStyle: 'dashed',
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  marketplaceCategoryUploadEmpty: {
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    padding: 16,
  },
  marketplaceCategoryUploadImage: {
    height: '100%',
    width: '100%',
  },
  marketplaceFeaturedBadge: {
    backgroundColor: '#eef2f7',
    borderRadius: 6,
    color: '#475569',
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  marketplaceFeaturedCard: {
    backgroundColor: '#ffffff',
    borderColor: V.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },
  marketplaceFeaturedCardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  marketplaceFeaturedCardActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  marketplaceFeaturedCardMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  marketplaceFeaturedEmpty: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 96,
    padding: 16,
  },
  marketplaceFeaturedField: {
    flexBasis: 280,
    flexGrow: 1,
    gap: 6,
    minWidth: 220,
  },
  marketplaceFeaturedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  marketplaceFeaturedHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  marketplaceFeaturedInput: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.input,
    borderRadius: 8,
    borderWidth: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    height: 38,
    paddingHorizontal: 10,
    paddingVertical: 0,
  },
  marketplaceFeaturedIconButton: {
    borderRadius: 5,
    height: 24,
    minHeight: 24,
    paddingHorizontal: 0,
    width: 24,
  },
  marketplaceFeaturedPanel: {
    backgroundColor: '#ffffff',
    borderColor: V.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    gap: 14,
    padding: 14,
  },
  marketplaceFeaturedRows: {
    gap: 12,
  },
  marketplaceFeaturedStack: {
    gap: 14,
  },
  marketplaceFeaturedThumb: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 48,
    width: 80,
  },
  marketplaceFeaturedToggle: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginLeft: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  marketplaceFeaturedUploadRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  marketplaceHeroSlideCard: {
    backgroundColor: '#ffffff',
    borderColor: V.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    height: 98,
    maxHeight: 98,
    minHeight: 98,
    overflow: 'hidden',
  },
  marketplaceHeroSlideCopy: {
    flex: 1,
    gap: 5,
    justifyContent: 'center',
    minWidth: 220,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  marketplaceHeroSlideImage: {
    height: '100%',
    width: '100%',
  },
  marketplaceHeroSlideImageFallback: {
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    height: 98,
    justifyContent: 'center',
    width: '100%',
  },
  marketplaceHeroSlideImageWrap: {
    backgroundColor: '#f3f4f6',
    flexShrink: 0,
    height: 98,
    maxHeight: 98,
    minHeight: 98,
    overflow: 'hidden',
    position: 'relative',
    width: 224,
  },
  marketplaceHeroSlideIndex: {
    backgroundColor: 'rgba(17, 24, 39, 0.72)',
    borderRadius: 5,
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    left: 8,
    minWidth: 24,
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 3,
    position: 'absolute',
    textAlign: 'center',
    top: 8,
  },
  marketplaceHeroSlideLink: {
    color: '#6b7280',
    fontSize: 11,
    lineHeight: 15,
  },
  marketplaceHeroSlideLinks: {
    gap: 2,
    marginTop: 'auto',
  },
  marketplaceHeroSlideList: {
    gap: 10,
  },
  marketplaceHeroSlideStatus: {
    backgroundColor: '#ecfdf5',
    borderColor: '#86efac',
    borderRadius: 5,
    borderWidth: 1,
    color: '#166534',
    flexShrink: 0,
    fontSize: 10,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  marketplaceHeroSlideStatusDraft: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
    color: '#4b5563',
  },
  marketplaceHeroSlideSubtitle: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
  },
  marketplaceHeroSlideTitle: {
    color: '#111827',
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '800',
    minWidth: 0,
  },
  marketplaceHeroSlideTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  marketplaceHeroSlides: {
    gap: 14,
  },
  marketplaceHeroSlidesToolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    marginTop: 8,
  },
  marketplaceHeroPreviewArrow: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 999,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    top: '50%',
    transform: [{translateY: -18}],
    width: 36,
    zIndex: 2,
  },
  marketplaceHeroPreviewArrowLabel: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 30,
    marginTop: -2,
  },
  marketplaceHeroPreviewArrowNext: {
    right: 12,
  },
  marketplaceHeroPreviewArrowPrev: {
    left: 12,
  },
  marketplaceHeroPreviewBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 999,
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  marketplaceHeroPreviewClose: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 999,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  marketplaceHeroPreviewCloseLabel: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '500',
    lineHeight: 26,
    marginTop: -2,
  },
  marketplaceHeroPreviewContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  marketplaceHeroPreviewCopy: {
    gap: 8,
    maxWidth: 280,
  },
  marketplaceHeroPreviewCount: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
  },
  marketplaceHeroPreviewCtas: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  marketplaceHeroPreviewDescription: {
    color: 'rgba(0, 0, 0, 0.7)',
    fontSize: 12,
    lineHeight: 16,
  },
  marketplaceHeroPreviewDialog: {
    gap: 14,
    width: 960,
  },
  marketplaceHeroPreviewDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 999,
    height: 6,
    width: 6,
  },
  marketplaceHeroPreviewDotActive: {
    backgroundColor: '#ffffff',
    width: 16,
  },
  marketplaceHeroPreviewDots: {
    bottom: 12,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 2,
  },
  marketplaceHeroPreviewFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  marketplaceHeroPreviewFooterLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
  },
  marketplaceHeroPreviewFooterButton: {
    borderRadius: 6,
    borderColor: V.colors.border,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  marketplaceHeroPreviewFooterButtonLabel: {
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '900',
  },
  marketplaceHeroPreviewHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  marketplaceHeroPreviewHeaderMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  marketplaceHeroPreviewImage: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    width: '100%',
  },
  marketplaceHeroPreviewImageFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#e5e7eb',
  },
  marketplaceHeroPreviewNativeDialog: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 1401,
    gap: 14,
    maxHeight: '86%',
    maxWidth: '92%',
    padding: 16,
    shadowColor: V.colors.fg,
    shadowOffset: {height: 16, width: 0},
    shadowOpacity: 0.18,
    shadowRadius: 24,
    width: 960,
    zIndex: 140001,
  },
  marketplaceHeroPreviewNativeOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  marketplaceHeroPreviewOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  marketplaceHeroPreviewPrimaryCta: {
    backgroundColor: V.colors.primary,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  marketplaceHeroPreviewPrimaryCtaLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  marketplaceHeroPreviewSecondaryCta: {
    color: 'rgba(0, 0, 0, 0.8)',
    fontSize: 11,
    fontWeight: '700',
  },
  marketplaceHeroPreviewShell: {
    maxWidth: 720,
    width: '100%',
    zIndex: 1,
  },
  marketplaceHeroPreviewStage: {
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    height: 180,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  marketplaceHeroPreviewSubtitle: {
    color: 'rgba(0, 0, 0, 0.8)',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  marketplaceHeroPreviewTitle: {
    color: '#000000',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  marketplaceLandingTab: {
    alignItems: 'center',
    borderBottomColor: 'transparent',
    borderBottomWidth: 2,
    flexDirection: 'row',
    gap: 7,
    minHeight: 42,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  marketplaceLandingTabActive: {
    borderBottomColor: '#0f766e',
  },
  marketplaceLandingTabBadge: {
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
    color: '#4b5563',
    fontSize: 11,
    fontWeight: '800',
    minWidth: 22,
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 2,
    textAlign: 'center',
  },
  marketplaceLandingTabBar: {
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  marketplaceLandingTabLabel: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '700',
  },
  marketplaceLandingTabLabelActive: {
    color: '#0f766e',
  },
  poNotificationToggleBox: {
    backgroundColor: '#f9fafb',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    gap: 10,
    padding: 12,
    width: '100%',
  },
  poStaffOverrideBox: {
    backgroundColor: '#f9fafb',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: 260,
    flexGrow: 1,
    gap: 8,
    minWidth: 220,
    padding: 10,
  },
  poStaffOverrideGrid: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  poStaffCheckbox: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderWidth: 1,
    flexBasis: '31%',
    flexGrow: 1,
    flexDirection: 'row',
    gap: 6,
    minWidth: 112,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  poStaffCheckboxActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  poStaffCheckboxLabel: {
    color: V.colors.fg,
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    minWidth: 0,
  },
  poStaffCheckboxDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },
  poStaffCheckboxMark: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#6b7280',
    borderWidth: 1,
    height: 16,
    justifyContent: 'center',
    width: 16,
  },
  poStaffCheckboxMarkActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  poStaffCheckboxMarkText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  poStaffGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  poStaffPicker: {
    gap: 8,
  },
  socialMediaField: {
    flex: 1,
    minWidth: 0,
  },
  socialMediaFieldRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  socialMediaLogo: {
    alignItems: 'center',
    borderRadius: 10,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  shippingStoreHoursBox: {
    backgroundColor: '#f9fafb',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: 320,
    flexGrow: 1,
    gap: 10,
    minWidth: 280,
    padding: 12,
  },
  shippingStoreHoursGrid: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  shippingStoreHoursSectionLabel: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '800',
  },
  shippingSpecialClosureActions: {
    alignItems: 'flex-start',
  },
  shippingSpecialClosureDateField: {
    width: 220,
  },
  shippingTimezonePicker: {
    width: '100%',
  },
  shippingTimezoneTrigger: {
    minWidth: 0,
    width: '100%',
  },
  originPinpointMap: {
    backgroundColor: '#f9fafb',
    flex: 1,
  },
  originPinpointMapEmpty: {
    backgroundColor: '#f9fafb',
    gap: 4,
    minHeight: 160,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  originPinpointMapEmptyText: {
    color: '#6b7280',
    fontSize: 12,
    lineHeight: 18,
  },
  originPinpointMapEmptyTitle: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '800',
  },
  originPinpointMapFrame: {
    backgroundColor: '#f9fafb',
    height: 300,
    overflow: 'hidden',
  },
  operationalCardHeaderCopy: {
    flex: 1,
    gap: 4,
    minWidth: 260,
  },
  operationalCardHeaderRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  operationalAttendanceBox: {
    backgroundColor: '#f9fafb',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: 420,
    flexGrow: 1,
    gap: 10,
    minWidth: 320,
    padding: 12,
  },
  operationalAttendanceGrid: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  workSiteCoordinateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  workSiteCoordinateInput: {
    flexBasis: 120,
    flexGrow: 1,
    minWidth: 104,
  },
  workSiteCompactFields: {
    gap: 8,
  },
  workSiteFullInput: {
    width: '100%',
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
  workSiteCard: {
    backgroundColor: V.colors.bg,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 10,
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
  workSiteSearchInput: {
    flex: 1,
    minWidth: 180,
  },
  workSiteSearchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  workSiteSection: {
    gap: 10,
  },
  kpiEditorFields: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    minWidth: 260,
  },
  kpiEditorList: {
    gap: 10,
  },
  kpiEditorRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kpiPreviewBody: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  kpiFooterActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  kpiLevelCopy: {
    color: '#111827',
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    minWidth: 180,
  },
  kpiLevelList: {
    gap: 10,
  },
  kpiLevelRange: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '600',
  },
  kpiLevelRow: {
    alignItems: 'center',
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 10,
  },
  kpiNumberField: {
    flexBasis: 140,
    flexGrow: 1,
    gap: 6,
    minWidth: 120,
  },
  kpiNumberInput: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.input,
    borderRadius: 8,
    borderWidth: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
    height: 34,
    paddingHorizontal: 10,
    paddingVertical: 0,
  },
  kpiNumberInputDisabled: {
    opacity: 0.55,
  },
  kpiNumberLabel: {
    color: '#374151',
    fontSize: 11,
    fontWeight: '800',
  },
  kpiPreviewBox: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    color: '#111827',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    padding: 12,
  },
  kpiPreviewStack: {
    gap: 8,
  },
  kpiRewardAmountInput: {
    width: 170,
  },
  kpiRuleCheckbox: {
    alignItems: 'center',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 34,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  kpiRuleCheckboxActive: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  kpiRuleCheckboxDisabled: {
    opacity: 0.55,
  },
  kpiRuleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  kpiRuleKey: {
    color: '#111827',
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
  kpiSaveRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  kpiSectionTitle: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '800',
  },
  kpiSettingsGridFive: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  kpiSettingsGridFour: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  kpiSettingsGridThree: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  kpiSettingsMessage: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '700',
  },
  kpiSettingsSection: {
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  kpiSettingsSectionCopy: {
    flex: 1,
    gap: 4,
    minWidth: 220,
  },
  kpiSettingsSectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  kpiSettingsStack: {
    gap: 14,
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
  webContentLauncher: {
    gap: 10,
  },
  webContentLauncherCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 260,
    gap: 12,
    minHeight: 82,
    minWidth: 220,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  webContentLauncherCardActive: {
    backgroundColor: '#f0fdf4',
    borderColor: '#16a34a',
  },
  webContentLauncherCopy: {
    flex: 1,
    minWidth: 0,
  },
  webContentLauncherDetail: {
    color: '#6b7280',
    fontSize: 12,
    lineHeight: 17,
  },
  webContentLauncherGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  webContentLauncherIcon: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  webContentLauncherIconActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
  },
  webContentLauncherTitle: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  webContentTableMeta: {
    color: '#6b7280',
    fontSize: 12,
    lineHeight: 16,
  },
  webContentTableText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '700',
  },
  webContentTableTitle: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  webContentTableTitleCell: {
    gap: 2,
    minWidth: 0,
  },
  notificationSoundActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  notificationSoundActionCell: {
    alignItems: 'flex-end',
    width: 104,
  },
  notificationSoundCopy: {
    flex: 1,
    gap: 4,
    minWidth: 240,
  },
  notificationSoundHeaderName: {
    flex: 1,
    minWidth: 240,
    textAlign: 'left',
  },
  notificationSoundHeaderRow: {
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  notificationSoundHeaderText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
    width: 104,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    minWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  notificationSoundSwitch: {
    backgroundColor: '#d1d5db',
    borderRadius: 999,
    height: 22,
    justifyContent: 'center',
    padding: 2,
    width: 40,
  },
  notificationSoundSwitchActive: {
    backgroundColor: '#10b981',
  },
  notificationSoundSwitchDisabled: {
    opacity: 0.45,
  },
  notificationSoundSwitchKnob: {
    backgroundColor: '#ffffff',
    borderRadius: 999,
    height: 18,
    width: 18,
  },
  notificationSoundSwitchKnobActive: {
    alignSelf: 'flex-end',
  },
  notificationSoundTable: {
    overflow: 'hidden',
  },
  notificationSettingsCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  daraPackingFieldBox: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  daraPackingCopy: {
    flex: 1,
    minWidth: 0,
  },
  daraPackingInput: {
    width: 88,
  },
  notificationSettingsStack: {
    gap: 14,
  },
  notificationSoundToggleCell: {
    alignItems: 'center',
    width: 104,
  },
  notificationSoundToggleEmpty: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '700',
  },
  notificationToggleBox: {
    backgroundColor: '#f9fafb',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: 300,
    flexGrow: 1,
    minWidth: 260,
    padding: 10,
  },
  notificationToggleGrid: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
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
  regionDropdownControl: {
    minWidth: 220,
    width: 260,
  },
  regionExplorerCard: {
    backgroundColor: '#ffffff',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },
  regionHierarchyGrid: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  regionHierarchyControl: {
    flexBasis: 0,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  regionHierarchyMenu: {
    marginTop: 6,
    maxHeight: 220,
  },
  regionHierarchyTrigger: {
    minWidth: 0,
    width: '100%',
  },
  regionStatsGrid: {
    alignItems: 'stretch',
    flexDirection: 'row',
    gap: 12,
  },
  regionStatsCard: {
    backgroundColor: '#ffffff',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 10,
    minWidth: 0,
    padding: 12,
  },
  regionStatsDetail: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 18,
  },
  regionStatsLabel: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '800',
  },
  regionStatsValue: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
  },
  regionTableText: {
    color: V.colors.fg,
    fontSize: 12,
  },
  regionTableNameText: {
    fontWeight: '600',
  },
  regionTableMono: {
    fontFamily: Platform.select({
      default: 'monospace',
      windows: 'Consolas',
    }),
  },
});
