import React from 'react';
import {
  Platform,
  Pressable,
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
import { KolamChoiceSegment } from './kolam-choice-segment';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDropdownSelect } from './kolam-dropdown-select';
import { KolamRowFrame } from './kolam-row-frame';
import { KolamSettingsWebFormFields } from './kolam-settings-web-form-fields';
import { KolamSettingsWebFormSectionHeader } from './kolam-settings-web-form-section-header';
import { KolamSettingsWebFormSections } from './kolam-settings-web-widgets';
import { KolamTextFieldRow } from './kolam-text-field-row';
import { KolamTextFieldRowCopy } from './kolam-text-field-row-copy';
import { KolamToggleRow } from './kolam-toggle-row';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  geocodeKolamStaffAttendanceWorkSite,
  getKolamGoogleMapsBrowserKey,
} from '../services/kolam-api';
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
  SettingsFinancialSectionVisibility,
  SettingsPaymentMethodDraft,
  SettingsPaymentMethodFilters,
  DaraKnowledgeDraft,
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
import { getKolamFileUrl } from '../lib/file-url';
import { KolamMediaPlayer } from './kolam-media-player';

const DEFAULT_NOTIFICATION_BEEP_URI =
  'data:audio/wav;base64,UklGRqQMAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YYAMAAAAAOEdCy4UKUERhPFs2H/R6d8P/Y0bZy1qKvUTWPQU2jjR1N0g+h4ZlSyVK5UWN/fi2yDR4ts395UWlSuVLB4ZIPrU3TjRFNpY9PUTaipnLY0bD/3p33/RbNiE8UERFCkLLuEdAAAf4vXR7Na/7nwOlCeBLhcg8QJz5JnSltUL7KgL7CXILiwi4AXi5mvTa9Rr6ckIHiTgLh4kyQhr6WvUa9Pi5uAFLCLILuwlqAsL7JbVmdJz5PECFyCBLpQnfA6/7uzW9dEf4gAA4R0LLhQpQRGE8WzYf9Hp3w/9jRtnLWoq9RNY9BTaONHU3SD6HhmVLJUrlRY39+LbINHi2zf3lRaVK5UsHhkg+tTdONEU2lj09RNqKmctjRsP/enff9Fs2ITxQREUKQsu4R0AAB/i9dHs1r/ufA6UJ4EuFyDxAnPkmdKW1QvsqAvsJcguLCLgBeLma9Nr1GvpyQgeJOAuHiTJCGvpa9Rr0+Lm4AUsIsgu7CWoCwvsltWZ0nPk8QIXIIEulCd8Dr/u7Nb10R/iAADhHQsuFClBEYTxbNh/0enfD/2NG2ctair1E1j0FNo40dTdIPoeGZUslSuVFjf34tsg0eLbN/eVFpUrlSweGSD61N040RTaWPT1E2oqZy2NGw/96d9/0WzYhPFBERQpCy7hHQAAH+L10ezWv+58DpQngS4XIPECc+SZ0pbVC+yoC+wlyC4sIuAF4uZr02vUa+nJCB4k4C4eJMkIa+lr1GvT4ubgBSwiyC7sJagLC+yW1ZnSc+TxAhcggS6UJ3wOv+7s1vXRH+IAAOEdCy4UKUERhPFs2H/R6d8P/Y0bZy1qKvUTWPQU2jjR1N0g+h4ZlSyVK5UWN/fi2yDR4ts395UWlSuVLB4ZIPrU3TjRFNpY9PUTaipnLY0bD/3p33/RbNiE8UERFCkLLuEdAAAf4vXR7Na/7nwOlCeBLhcg8QJz5JnSltUL7KgL7CXILiwi4AXi5mvTa9Rr6ckIHiTgLh4kyQhr6WvUa9Pi5uAFLCLILuwlqAsL7JbVmdJz5PECFyCBLpQnfA6/7uzW9dEf4g==';

const KolamWebView = WebView as unknown as React.ComponentType<any>;
const MASKED_SECRET_PLACEHOLDER = '********';

const financialShellSections: Array<{
  id: string;
  title: string;
  description: string;
  rowIds: string[];
}> = [
  {
    id: 'payment-methods',
    title: 'Metode pembayaran',
    description: 'Ringkasan channel pembayaran live dari backend Kolam.',
    rowIds: ['payment-methods', 'payment-methods-inactive'],
  },
  {
    id: 'tax-profile',
    title: 'Profil pajak perusahaan',
    description: 'Status harga include PPN dan PPh 21 komisi.',
    rowIds: ['tax-sale-prices', 'tax-commission-pph21'],
  },
  {
    id: 'overtime',
    title: 'Lembur karyawan',
    description: 'Mode hitung lembur dan kebijakan minimum pembayaran.',
    rowIds: ['overtime-mode', 'overtime-policy'],
  },
  {
    id: 'enclosure-commission',
    title: 'Komisi penjualan kandang',
    description: 'Status komisi global untuk penjualan enclosure.',
    rowIds: ['enclosure-sale-commission'],
  },
] as const;

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

type TaxPayerTypeOptionValue = 'pt' | 'cv' | 'umkm' | 'perorangan' | 'other';

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
    id: 'handoff',
    label: 'Notifikasi handoff inbox',
    description: 'Badge butuh handover dan SSE saat AI menyerahkan ke CS.',
    field: 'daraHandoffNotifyEnabled',
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
  onUploadMarketplaceDaraAvatar,
  onUploadMarketplaceFeaturedCollectionImage,
  onUploadMarketplaceHeroImage,
  onUploadMarketplaceLogo,
  onUploadMarketplaceYoutubeBackground,
  onUploadDaraWorkerPhoto = noop,
  onUploadPaymentMethodPhoto = noop,
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
  setPaymentMethodDraftField = noopSetPaymentMethodDraftField,
  setPaymentMethodFilter = noopSetPaymentMethodFilter,
  setDaraKnowledgeDraftField = noopSetDaraKnowledgeDraftField,
  setWebContentPanelId,
  setRegionFilter,
  setSitemapCustomUrlsDraftText,
  setSitemapExcludedSlugsDraftText,
  setSitemapMasterField,
  setSitemapSectionField,
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
  onDeleteMarketplaceBioactiveStep: (index: number) => void;
  onDeleteMarketplaceCategoryBanner: (banner: KolamCategoryBanner) => void;
  onDeleteMarketplaceFeaturedCollection: (index: number) => void;
  onDeleteMarketplaceHeroSlide: (slide: KolamHeroSlide) => void;
  onDeleteMarketplaceLandingNotice: (key: string) => void;
  onDeletePaymentMethod?: (id: string) => void;
  onDeletePaymentMethodPhoto?: (id: string) => void;
  onEditMarketplaceLandingNotice: (notice: KolamCustomerTextNotice) => void;
  onEditPaymentMethod?: (method: KolamPaymentMethod) => void;
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
  onUploadMarketplaceDaraAvatar: () => void;
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
  const [storedMapsBrowserKey, setStoredMapsBrowserKey] = React.useState('');
  const [mapsBrowserKeyStatus, setMapsBrowserKeyStatus] = React.useState<
    'idle' | 'loading' | 'ready' | 'error'
  >('idle');
  const [mapsBrowserKeyMessage, setMapsBrowserKeyMessage] = React.useState('');
  const [timezoneOptions, setTimezoneOptions] = React.useState<
    KolamTimezoneOption[]
  >([]);
  const umumFieldWidth = 240;
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
                description="Policy akses staff desktop dan validasi MAC address."
                title="Kebijakan akses staff"
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
                fieldWidth={umumFieldWidth}
                label="URL redirect staff"
                description="URL redirect jika staff desktop-only aktif."
                value={draft.staffDesktopOnlyRedirectUrl}
                onChangeText={value =>
                  setDraftField('staffDesktopOnlyRedirectUrl', value)
                }
                placeholder="https://..."
              />
              <KolamTextFieldRow
                variant="settingsForm"
                fieldWidth={umumFieldWidth}
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
            <View style={styles.poRoomPicker}>
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
                style={styles.poRoomDropdown}
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
              <KolamCopyStack
                items={[
                  {
                    id: 'po-room-picker-meta',
                    text: roomOptions.length
                      ? 'Upload bukti PO otomatis diposting ke room ini. Room AI tidak ditampilkan.'
                      : 'Room Team Chat belum tersedia.',
                    style: styles.marketplaceOverviewMeta,
                  },
                ]}
              />
            </View>
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
        </>
      ) : null}
      {showFinancialTaxSummary ? (
        <FinancialSettingsPanel
          disabled={disabled || financialStatus === 'saving'}
          draft={draft}
          financialMessage={financialMessage}
          financialSectionVisibility={financialSectionVisibility}
          financialStatus={financialStatus}
          financialSummaryRows={financialSummaryRows}
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
          <View style={styles.financialNestedCard}>
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
                style: styles.marketplaceOverviewMeta,
              },
            ]}
          />
          <View style={styles.marketplaceControlSection}>
            <KolamCopyStack
              items={[
                {
                  id: 'ai-profile-title',
                  text: 'Profil DARA',
                  style: styles.marketplaceOverviewLabel,
                },
                {
                  id: 'ai-profile-meta',
                  text: 'Avatar DARA dipakai di Kolam dan webstore. Foto worker Katak Terbang dipakai untuk autopilot packing.',
                  style: styles.marketplaceOverviewMeta,
                },
              ]}
            />
            <View style={styles.notificationSoundActions}>
              <KolamActionControlButton
                label="Unggah avatar DARA"
                disabled={daraControlsDisabled}
                onPress={onUploadMarketplaceDaraAvatar}
              />
              <KolamActionControlButton
                label="Unggah foto Katak Terbang"
                disabled={daraControlsDisabled}
                onPress={onUploadDaraWorkerPhoto}
              />
            </View>
            <KolamTextFieldRow
              variant="settingsForm"
              fieldWidth={settingsFieldWidth}
              label="Nama worker Katak Terbang"
              description="Nama PIC yang tampil pada flow autopilot packing."
              value={draft.katakTerbangWorkerName}
              onChangeText={value =>
                setDraftField('katakTerbangWorkerName', value)
              }
              placeholder="Katak Terbang"
            />
          </View>

          <View style={styles.marketplaceControlSection}>
            <KolamCopyStack
              items={[
                {
                  id: 'chat-ai-title',
                  text: 'Pengaturan Chat AI',
                  style: styles.marketplaceOverviewLabel,
                },
                {
                  id: 'chat-ai-meta',
                  text: 'Kontrol Chat storefront, group call, dan balasan otomatis inbox lintas platform.',
                  style: styles.marketplaceOverviewMeta,
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
            {aiInboxPlatformRows.map(row => (
              <KolamToggleRow
                key={row.id}
                variant="settingsForm"
                label={row.label}
                description={row.description}
                active={draft[row.field] === true}
                onPress={() =>
                  !daraChatControlsDisabled &&
                  setDraftField(row.field, !(draft[row.field] === true))
                }
              />
            ))}
          </View>

          <View style={styles.marketplaceControlSection}>
            <KolamCopyStack
              items={[
                {
                  id: 'dara-business-title',
                  text: 'DARA Business',
                  style: styles.marketplaceOverviewLabel,
                },
                {
                  id: 'dara-business-meta',
                  text: 'Master switch untuk modul bisnis DARA. Jika off, kontrol turunan tetap tampil tetapi tidak bisa diubah.',
                  style: styles.marketplaceOverviewMeta,
                },
              ]}
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
            {aiModuleToggleRows.map(row => (
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

          <View style={styles.marketplaceControlSection}>
            <KolamCopyStack
              items={[
                {
                  id: 'dara-fulfillment-room-title',
                  text: 'Autopilot packing',
                  style: styles.marketplaceOverviewLabel,
                },
                {
                  id: 'dara-fulfillment-room-meta',
                  text: 'Pilih room Team Chat untuk konteks packing. Kosong berarti memakai Chat dengan DARA default.',
                  style: styles.marketplaceOverviewMeta,
                },
              ]}
            />
            <View style={styles.poRoomChoices}>
              <KolamChoiceSegment
                id=""
                label="Chat dengan DARA (default)"
                selectedId={draft.daraFulfillmentTeamRoomId}
                onSelect={() =>
                  !daraControlsDisabled &&
                  setDraftField('daraFulfillmentTeamRoomId', '')
                }
              />
              {daraRoomOptions.map(room => (
                <KolamChoiceSegment
                  key={room._id}
                  id={room._id}
                  label={getTeamChatRoomLabel(room)}
                  selectedId={draft.daraFulfillmentTeamRoomId}
                  onSelect={() =>
                    !daraControlsDisabled &&
                    setDraftField('daraFulfillmentTeamRoomId', room._id)
                  }
                />
              ))}
            </View>
          </View>

          <View style={styles.marketplaceControlSection}>
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

          <View style={styles.marketplaceControlSection}>
            <KolamCopyStack
              items={[
                {
                  id: 'dara-tax-title',
                  text: 'DARA Tax Intelligence',
                  style: styles.marketplaceOverviewLabel,
                },
              ]}
            />
            {daraTaxToggleRows.map(row => (
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

          <View style={styles.marketplaceControlSection}>
            <KolamCopyStack
              items={[
                {
                  id: 'dara-shipping-title',
                  text: 'Pengiriman dan marketplace',
                  style: styles.marketplaceOverviewLabel,
                },
              ]}
            />
            {daraFulfillmentToggleRows.map(row => (
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
            <KolamTextFieldRow
              variant="settingsForm"
              fieldWidth={settingsFieldWidth}
              label="Menit packing"
              description="Validasi BE: 5 sampai 240 menit."
              value={draft.daraFulfillmentPackingMinutes}
              onChangeText={value =>
                setDraftField('daraFulfillmentPackingMinutes', value)
              }
              placeholder="30"
            />
            <KolamTextFieldRow
              variant="settingsForm"
              fieldWidth={settingsFieldWidth}
              label="Maksimal perpanjangan packing"
              description="Validasi BE: 0 sampai 5 kali."
              value={draft.daraFulfillmentPackingMaxExtensions}
              onChangeText={value =>
                setDraftField('daraFulfillmentPackingMaxExtensions', value)
              }
              placeholder="1"
            />
          </View>

          <View style={styles.marketplaceControlSection}>
            <KolamCopyStack
              items={[
                {
                  id: 'dara-night-ops-title',
                  text: 'Night Ops',
                  style: styles.marketplaceOverviewLabel,
                },
              ]}
            />
            {daraNightOpsToggleRows.map(row => (
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
            <View style={styles.poRoomChoices}>
              <KolamChoiceSegment
                id=""
                label="Room penjualan default"
                selectedId={draft.daraPenjualanTeamRoomId}
                onSelect={() =>
                  !daraControlsDisabled &&
                  setDraftField('daraPenjualanTeamRoomId', '')
                }
              />
              {daraPenjualanRoomOptions.map(room => (
                <KolamChoiceSegment
                  key={room._id}
                  id={room._id}
                  label={getTeamChatRoomLabel(room)}
                  selectedId={draft.daraPenjualanTeamRoomId}
                  onSelect={() =>
                    !daraControlsDisabled &&
                    setDraftField('daraPenjualanTeamRoomId', room._id)
                  }
                />
              ))}
            </View>
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

          <View style={styles.marketplaceControlSection}>
            <KolamCopyStack
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
            <KolamTextFieldRow
              variant="settingsForm"
              fieldWidth={settingsFieldWidth}
              label="Judul SOP"
              description="Judul dokumen SOP."
              value={daraKnowledgeDraft.title}
              onChangeText={value => setDaraKnowledgeDraftField('title', value)}
              placeholder="SOP Kasir Harian"
            />
            <View style={styles.financialToolbar}>
              {daraKnowledgeCategories.map(([id, label]) => (
                <FinancialChoiceSegment
                  key={id}
                  active={daraKnowledgeDraft.category === id}
                  label={label}
                  onPress={() => setDaraKnowledgeDraftField('category', id)}
                />
              ))}
            </View>
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
            <KolamActionControlButton
              label="Simpan SOP"
              loading={daraKnowledgeSaveStatus === 'saving'}
              loadingLabel="Menyimpan..."
              disabled={daraControlsDisabled}
              onPress={onSaveDaraKnowledge}
            />
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
                <KolamTextFieldRow
                  variant="settingsForm"
                  fieldWidth={220}
                  label="Tanggal libur khusus"
                  description="Format YYYY-MM-DD."
                  value={draft.storeOperatingHoursSpecialClosureDate}
                  onChangeText={value =>
                    setDraftField(
                      'storeOperatingHoursSpecialClosureDate',
                      value,
                    )
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
                    label: 'Notifikasi alih tangan DARA',
                    onPress: () =>
                      setDraftField(
                        'daraHandoffNotifyEnabled',
                        !draft.daraHandoffNotifyEnabled,
                      ),
                  })}
                  {renderNotificationSoundRow(notificationSoundItems[3], {
                    active: draft.teamChatGroupCallEnabled,
                    label: 'Panggilan grup chat tim',
                    onPress: () =>
                      setDraftField(
                        'teamChatGroupCallEnabled',
                        !draft.teamChatGroupCallEnabled,
                      ),
                  })}
                  {renderNotificationSoundRow(notificationSoundItems[4])}
                </View>
              </View>
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
            <View
              style={[
                styles.marketplaceControlSection,
                styles.notificationSettingsCard,
              ]}
            >
              <KolamCopyStack
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
              <KolamCopyStack
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
    <>
      <View style={styles.marketplaceOverview}>
        <KolamCopyStack
          items={[
            {
              id: 'kpi-title',
              text: 'KPI Staff',
              style: styles.marketplaceOverviewTitle,
            },
            {
              id: 'kpi-gate',
              text: pluginEnabled
                ? 'Plugin aktif. Pengaturan dibaca langsung dari /kpi/settings.'
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
      <KolamCopyStack
        items={[
          {
            id: 'task-points-title',
            text: 'Poin dasar prioritas task',
            style: styles.kpiSectionTitle,
          },
        ]}
      />
      <View style={styles.storeHoursTimeGrid}>
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={150}
          label="Rendah"
          description="Poin dasar prioritas rendah."
          value={draft.taskBaseLow}
          onChangeText={value => setDraftField('taskBaseLow', value)}
          placeholder="5"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={150}
          label="Sedang"
          description="Poin dasar prioritas sedang."
          value={draft.taskBaseMedium}
          onChangeText={value => setDraftField('taskBaseMedium', value)}
          placeholder="10"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={150}
          label="Tinggi"
          description="Poin dasar prioritas tinggi."
          value={draft.taskBaseHigh}
          onChangeText={value => setDraftField('taskBaseHigh', value)}
          placeholder="20"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={150}
          label="Task urgent"
          description="Poin dasar prioritas urgent."
          value={draft.taskBaseUrgent}
          onChangeText={value => setDraftField('taskBaseUrgent', value)}
          placeholder="30"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={150}
          label="Rasio bantuan"
          description="Rasio poin untuk assistedBy."
          value={draft.assistedByRatio}
          onChangeText={value => setDraftField('assistedByRatio', value)}
          placeholder="0.5"
        />
      </View>
      <KolamCopyStack
        items={[
          {
            id: 'time-qc-proof-title',
            text: 'Waktu, QC, dan bukti task',
            style: styles.kpiSectionTitle,
          },
        ]}
      />
      <View style={styles.storeHoursTimeGrid}>
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={150}
          label="Sebelum deadline"
          description="Poin selesai sebelum deadline."
          value={draft.onTimeBeforeDeadline}
          onChangeText={value => setDraftField('onTimeBeforeDeadline', value)}
          placeholder="5"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={150}
          label="Persen sangat awal"
          description="Ambang persen sisa waktu."
          value={draft.onTimeFarEarlyPct}
          onChangeText={value => setDraftField('onTimeFarEarlyPct', value)}
          placeholder="50"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={150}
          label="Bonus sangat awal"
          description="Bonus bila melewati ambang."
          value={draft.onTimeFarEarlyBonus}
          onChangeText={value => setDraftField('onTimeFarEarlyBonus', value)}
          placeholder="10"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={150}
          label="Task terlambat"
          description="Penalti task terlambat."
          value={draft.onTimeLate}
          onChangeText={value => setDraftField('onTimeLate', value)}
          placeholder="-5"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={150}
          label="QC lulus pertama"
          description="Poin QC pass pertama."
          value={draft.qcPassFirst}
          onChangeText={value => setDraftField('qcPassFirst', value)}
          placeholder="10"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={150}
          label="QC revisi pertama"
          description="Poin revisi pertama."
          value={draft.qcRevision1}
          onChangeText={value => setDraftField('qcRevision1', value)}
          placeholder="0"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={150}
          label="QC revisi banyak"
          description="Penalti banyak revisi."
          value={draft.qcRevisionMany}
          onChangeText={value => setDraftField('qcRevisionMany', value)}
          placeholder="-5"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={150}
          label="Bukti lengkap"
          description="Poin bukti task lengkap."
          value={draft.proofComplete}
          onChangeText={value => setDraftField('proofComplete', value)}
          placeholder="5"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={150}
          label="Tanpa bukti"
          description="Penalti bukti hilang."
          value={draft.noProofMissing}
          onChangeText={value => setDraftField('noProofMissing', value)}
          placeholder="-10"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={170}
          label="Task no-show"
          description="Penalti reassign/cancel."
          value={draft.noShowReassignOrCancel}
          onChangeText={value => setDraftField('noShowReassignOrCancel', value)}
          placeholder="-25"
        />
      </View>
      <KolamCopyStack
        items={[
          {
            id: 'chat-sla-title',
            text: 'Chat Inbox (SLA CS)',
            style: styles.kpiSectionTitle,
          },
          {
            id: 'chat-sla-desc',
            text: 'DARA eskalasi operasional tetap terpisah; KPI memakai ambang poin di bawah ini.',
            style: styles.marketplaceOverviewDetail,
          },
        ]}
      />
      <View style={styles.storeHoursTimeGrid}>
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={150}
          label="Cepat (menit)"
          description="Batas balasan cepat chat."
          value={draft.chatFastReplyMinutes}
          onChangeText={value => setDraftField('chatFastReplyMinutes', value)}
          placeholder="5"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={150}
          label="Poin balas cepat"
          description="Poin balasan cepat."
          value={draft.chatFastReplyPoints}
          onChangeText={value => setDraftField('chatFastReplyPoints', value)}
          placeholder="5"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={150}
          label="Telat (menit)"
          description="Batas balasan terlambat."
          value={draft.chatLateReplyMinutes}
          onChangeText={value => setDraftField('chatLateReplyMinutes', value)}
          placeholder="14"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={150}
          label="Poin balas telat"
          description="Poin balasan terlambat."
          value={draft.chatLateReplyPoints}
          onChangeText={value => setDraftField('chatLateReplyPoints', value)}
          placeholder="-10"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={150}
          label="Tidak dibalas"
          description="Penalti chat tidak dibalas."
          value={draft.chatNoReplyPoints}
          onChangeText={value => setDraftField('chatNoReplyPoints', value)}
          placeholder="-15"
        />
      </View>
      <KolamCopyStack
        items={[
          {
            id: 'penalty-title',
            text: 'Penalti komplain dan absensi',
            style: styles.kpiSectionTitle,
          },
        ]}
      />
      <View style={styles.storeHoursTimeGrid}>
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={150}
          label="Komplain ringan"
          description="Penalti komplain ringan."
          value={draft.complaintLight}
          onChangeText={value => setDraftField('complaintLight', value)}
          placeholder="-10"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={150}
          label="Komplain valid"
          description="Penalti komplain valid."
          value={draft.complaintValid}
          onChangeText={value => setDraftField('complaintValid', value)}
          placeholder="-25"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={150}
          label="Komplain berat"
          description="Penalti komplain berat."
          value={draft.complaintSevere}
          onChangeText={value => setDraftField('complaintSevere', value)}
          placeholder="-50"
        />
        <KolamTextFieldRow
          variant="settingsForm"
          fieldWidth={170}
          label="Absen luar radius"
          description="Penalti absensi di luar radius."
          value={draft.attendanceOutsideRadius}
          onChangeText={value =>
            setDraftField('attendanceOutsideRadius', value)
          }
          placeholder="-20"
        />
      </View>
      <KolamCopyStack
        items={[
          {
            id: 'levels-title',
            text: 'Level bulanan dan bonus Rp',
            style: styles.kpiSectionTitle,
          },
        ]}
      />
      <View style={styles.kpiEditorList}>
        {levelRows.map((row, index) => (
          <View
            key={`${row.id || 'level'}-${index}`}
            style={styles.kpiEditorRow}
          >
            <View style={styles.kpiEditorFields}>
              <KolamTextFieldRow
                variant="settingsForm"
                fieldWidth={150}
                label="ID level"
                description="Key level untuk reward."
                value={row.id}
                onChangeText={value => setLevelRow(index, { id: value })}
                placeholder="gold"
              />
              <KolamTextFieldRow
                variant="settingsForm"
                fieldWidth={180}
                label="Label"
                description="Nama level yang tampil."
                value={row.label}
                onChangeText={value => setLevelRow(index, { label: value })}
                placeholder="Gold"
              />
              <KolamTextFieldRow
                variant="settingsForm"
                fieldWidth={120}
                label="Min poin"
                description="Batas bawah."
                value={row.min}
                onChangeText={value => setLevelRow(index, { min: value })}
                placeholder="501"
              />
              <KolamTextFieldRow
                variant="settingsForm"
                fieldWidth={120}
                label="Max poin"
                description="Kosong untuk tanpa batas."
                value={row.max}
                onChangeText={value => setLevelRow(index, { max: value })}
                placeholder="1000"
              />
            </View>
            <KolamActionControlButton
              disabled={disabled || busy}
              intent="danger"
              label="Hapus"
              onPress={() => removeLevelRow(index)}
            />
          </View>
        ))}
        <View style={styles.notificationSoundActions}>
          <KolamActionControlButton
            disabled={disabled || busy}
            label="Tambah level"
            onPress={addLevelRow}
          />
        </View>
      </View>
      <View style={styles.kpiEditorList}>
        {rewardRows.map((row, index) => (
          <View
            key={`${row.levelId || 'reward'}-${index}`}
            style={styles.kpiEditorRow}
          >
            <View style={styles.kpiEditorFields}>
              <KolamTextFieldRow
                variant="settingsForm"
                fieldWidth={180}
                label="Level reward"
                description="ID level yang mendapat bonus."
                value={row.levelId}
                onChangeText={value => setRewardRow(index, { levelId: value })}
                placeholder="gold"
              />
              <KolamTextFieldRow
                variant="settingsForm"
                fieldWidth={180}
                label="Nominal bonus"
                description="Nominal bonus rupiah."
                value={row.amountRp}
                onChangeText={value => setRewardRow(index, { amountRp: value })}
                placeholder="250000"
              />
            </View>
            <KolamActionControlButton
              disabled={disabled || busy}
              intent="danger"
              label="Hapus"
              onPress={() => removeRewardRow(index)}
            />
          </View>
        ))}
        <View style={styles.notificationSoundActions}>
          <KolamActionControlButton
            disabled={disabled || busy}
            label="Tambah reward"
            onPress={addRewardRow}
          />
        </View>
      </View>
      <View style={styles.marketplaceOverview}>
        <KolamCopyStack
          items={[
            {
              id: 'rules-title',
              text: 'Rule aktif',
              style: styles.marketplaceOverviewLabel,
            },
          ]}
        />
        {ruleRows.map(([key, label]) => (
          <KolamToggleRow
            variant="settingsForm"
            key={key}
            label={label}
            description={`Key rule: ${key}`}
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
              text: 'Preview pengumuman mingguan DARA',
              style: styles.marketplaceOverviewLabel,
            },
            {
              id: 'preview-meta',
              text: preview
                ? `Minggu ${preview.weekKey} | ${
                    preview.alreadySent ? 'sudah terkirim' : 'belum terkirim'
                  }`
                : 'Klik muat ulang preview untuk melihat isi broadcast.',
              style: styles.marketplaceOverviewDetail,
            },
            {
              id: 'preview-body',
              text: preview?.body ?? 'Preview belum dimuat.',
              style: styles.kpiPreviewBody,
            },
          ]}
        />
        <View style={styles.notificationSoundActions}>
          <KolamActionControlButton
            disabled={disabled || busy}
            label="Muat ulang preview"
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

function FinancialSettingsPanel({
  disabled,
  draft,
  financialMessage,
  financialSectionVisibility,
  financialStatus,
  financialSummaryRows,
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
  financialSummaryRows: SettingsFinancialSummaryRow[];
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
          <FinancialSectionHeader
            detail="Channel pembayaran yang diterima toko dan wallet terkait."
            title="Metode pembayaran"
          />
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
                    <KolamActionControlButton
                      disabled={disabled || busy}
                      label="Edit"
                      onPress={() => onEditPaymentMethod(method)}
                    />
                    <KolamActionControlButton
                      disabled={disabled || busy}
                      label={method.paymentIcon ? 'Ganti foto' : 'Upload foto'}
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
          <View style={styles.financialNestedCard}>
            <KolamCopyStack
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
                    onChange={value =>
                      setPaymentMethodDraftField('type', value)
                    }
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
                        option => option.value === paymentMethodDraft.provider,
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
                      ...financialWallets.map(wallet => ({
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
                <KolamActionControlButton
                  disabled={disabled || busy}
                  label="Reset"
                  onPress={onClearPaymentMethodDraft}
                />
              </View>
            </View>
          </View>
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
                  text: 'Tarif global untuk baris invoice itemType enclosure.',
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
        </View>
      ) : null}

      <View style={styles.marketplaceOverviewRows}>
        {financialShellSections.map(section => {
          const rows = financialSummaryRows.filter(row =>
            section.rowIds.includes(row.id),
          );

          return rows.map(row => (
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
          ));
        })}
      </View>
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
  poRoomDropdown: {
    maxWidth: 520,
    width: '100%',
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
  kpiSectionTitle: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '800',
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
});
