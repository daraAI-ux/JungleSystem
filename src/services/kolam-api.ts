import {appConfig} from '../config/app';
import {apiRequest} from '../lib/api-client';

export type KolamSummaryRange =
  | 'today'
  | 'week'
  | 'month'
  | 'year'
  | 'custom'
  | 'all';

export interface KolamWalletSummary {
  name: string;
  balance: number;
}

export interface KolamFinanceSummary {
  totalIncome: number;
  totalExpense: number;
  profitLoss: number;
  details: {
    sales: number;
    unexpectedIncome: number;
    shippingCollected: number;
    purchaseOrder: number;
    production: number;
    routineExpense: number;
    unexpectedExpense: number;
    assetPurchase: number;
    costOfSale: number;
    commissionReleased: number;
  };
  wallets: KolamWalletSummary[];
  transactions: unknown[];
  filter: {
    startDate: string | null;
    endDate: string | null;
    range: string;
  };
}

export interface KolamSaleCostSummary {
  revenue: number;
  totalHpp: number;
  totalCommissionAccrued: number;
  grossMargin: number;
  saleCount: number;
  filter: {
    startDate: string | null;
    endDate: string | null;
    range: string;
  };
}

export interface KolamSalesGraphPoint {
  timestamp: string;
  value: number;
}

export interface KolamDashboardCounts {
  products: number;
  rawProducts: number;
  species: number;
  services: number;
}

export type KolamDashboardSummaryRange = 'today' | 'month' | 'year' | 'all';
export type KolamDashboardSummaryMetric =
  | 'revenue'
  | 'margin'
  | 'order_count';

export interface KolamDashboardSummaryPoint {
  timestamp: string;
  value: number;
}

export interface KolamDashboardSourceBreakdownEntry {
  value: number;
  count: number;
}

export type KolamDashboardSourceBreakdown = Record<
  string,
  KolamDashboardSourceBreakdownEntry
>;

export interface KolamDashboardSummary {
  range: KolamDashboardSummaryRange;
  metric?: KolamDashboardSummaryMetric;
  value: number;
  change: number;
  data: KolamDashboardSummaryPoint[];
  bySource?: KolamDashboardSourceBreakdown;
  bySourcePending?: KolamDashboardSourceBreakdown;
}

export interface KolamDashboardStockProduct {
  _id: string;
  name: string;
  stock: number;
  photos?: string[];
}

export interface KolamDashboardTopSellingProduct {
  productId: string;
  totalSold: number;
  name: string;
  stock: number;
  photo?: string | null;
}

export interface KolamDashboardLatest {
  lowStockProducts: KolamDashboardStockProduct[];
  topSellingProducts: KolamDashboardTopSellingProduct[];
  outOfStockProducts: KolamDashboardStockProduct[];
}

export interface KolamPendingCustomerVerificationRow {
  pendingServiceId: string;
  serviceSerial?: string | null;
  subscriptionId?: string | null;
  subscriptionNumber?: string | null;
  taskKind: 'dosing' | 'maintenance';
  taskId: string;
  executionId: string;
  visitTitle?: string | null;
  packageTaskCode?: string | null;
  scheduledTime?: string | null;
  supervisorVerifiedAt?: string | null;
  status?: string;
}


export type KolamDashboardActionRequiredReason =
  | 'belum_bayar'
  | 'belum_kirim'
  | 'proyek_kustom'
  | 'cp_penawaran'
  | 'cp_dp'
  | 'cp_desain';

export interface KolamDashboardActionRequiredCustomProject {
  quotationNumber?: string;
  lifecycleStatus: string;
  lifecycleLabel: string;
  progressPercent?: number;
  quotationDecision?: string;
}

export interface KolamDashboardActionRequiredSale {
  id: string;
  kind: 'standard' | 'custom';
  invoiceCode: string;
  status: string;
  deliveryStatus: string;
  finalTotal: number;
  createdAt: string;
  sourceName: string;
  reasons: KolamDashboardActionRequiredReason[];
  customProject?: KolamDashboardActionRequiredCustomProject | null;
}

export interface KolamDashboardActionRequired {
  total: number;
  items: KolamDashboardActionRequiredSale[];
  capped?: boolean;
  counts?: {
    standard: number;
    custom: number;
  };
}

export interface KolamDashboardData {
  summary: KolamDashboardSummary[];
  salesGraph: {
    range: string;
    data: KolamSalesGraphPoint[];
  };
  latest: KolamDashboardLatest;
  counts: KolamDashboardCounts;
  actionRequired?: KolamDashboardActionRequired;
}

export type KolamAppKey =
  | 'kolam'
  | 'kolam-da'
  | 'enclonura'
  | 'pos'
  | 'pos-da'
  | 'marketplace';

export type KolamPluginConfigKey =
  | 'enclosure'
  | 'taskManager'
  | 'layanan'
  | 'freyer'
  | 'kpi'
  | 'chat'
  | 'dara'
  | 'proyek';

export type KolamNotificationSoundType =
  | 'assigned'
  | 'unassigned'
  | 'handoff'
  | 'group-call'
  | 'sales';

export type KolamMarketplaceLandingCollectionKey =
  | 'hero-slides'
  | 'category-banners'
  | 'announcement-banners';

export type KolamMarketplaceContentImageType =
  | 'featured-collections'
  | 'bioactive-ecosystem';

export type KolamStoreOperatingWeekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface KolamStoreOperatingDayHours {
  open?: boolean;
  openAt?: string;
  closeAt?: string;
}

export interface KolamStoreOperatingHours {
  enabled?: boolean;
  daraReplyWhenClosed?: boolean;
  timezone?: string;
  weeklyHours?: Partial<
    Record<KolamStoreOperatingWeekday, KolamStoreOperatingDayHours>
  >;
  specialClosures?: Array<{
    date?: string;
    label?: string;
    allDay?: boolean;
    openAt?: string;
    closeAt?: string;
  }>;
  messages?: {
    beforeOpen?: string;
    afterClose?: string;
    weeklyClosed?: string;
    specialClosed?: string;
    shippingDisclaimer?: string;
  };
}

export type KolamPluginSettings = Partial<
  Record<
    KolamPluginConfigKey,
    {
      enabled?: boolean;
      storeEnabled?: boolean;
      installedVersion?: string;
    }
  >
>;

export interface KolamWebSetting {
  _id?: string;
  version?: string;
  versions?: Partial<Record<KolamAppKey, string>>;
  companyName?: string;
  companyTagline?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  livechatOnline?: boolean;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
    [key: string]: string | undefined;
  };
  originAddress?: {
    addressLine1?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    latitude?: number | string | null;
    longitude?: number | string | null;
  };
  biteshipApiKey?: string;
  biteshipApiKeyConfigured?: boolean;
  googleMapsBrowserApiKey?: string;
  googleMapsBrowserApiKeyConfigured?: boolean;
  storeOperatingHours?: KolamStoreOperatingHours;
  maintenance?: {
    pos?: boolean;
    marketplace?: boolean;
    [key: string]: boolean | undefined;
  };
  staffDesktopOnly?: {
    enabled?: boolean;
    redirectUrl?: string;
  };
  kolamMacAccess?: {
    enabled?: boolean;
    allowWebBrowser?: boolean;
    bypassSuperAdmin?: boolean;
    allowedMacAddresses?: string[];
  };
  staffOtpLogin?: {
    enabled?: boolean;
    otpExpireMinutes?: number;
    resendCooldownSeconds?: number;
    maxAttempts?: number;
    lockMinutes?: number;
  };
  smtp?: {
    host?: string;
    port?: number;
    user?: string;
    pass?: string;
    passConfigured?: boolean;
    fromEmail?: string;
    fromName?: string;
    secure?: boolean;
  };
  firebase?: {
    enabled?: boolean;
    projectId?: string;
    clientEmail?: string;
    privateKey?: string;
    privateKeyConfigured?: boolean;
  };
  kolamPlugins?: KolamPluginSettings;
  notificationSound?: string;
  unassignedNotificationSound?: string;
  handoffNotificationSound?: string;
  groupCallRingtone?: string;
  salesNotificationSound?: string;
  teamChatGroupCallEnabled?: boolean;
  daraBusinessEnabled?: boolean;
  daraToolsEnabled?: boolean;
  daraKnowledgeEnabled?: boolean;
  daraHandoffNotifyEnabled?: boolean;
  daraInsightsEnabled?: boolean;
  daraAutoReportEnabled?: boolean;
  daraImageAnalysisEnabled?: boolean;
  daraTaxEnabled?: boolean;
  daraSeoEnabled?: boolean;
  daraTaxRegulationWatcherEnabled?: boolean;
  daraTaxComplianceJobEnabled?: boolean;
  daraTaxLlmNarrativeEnabled?: boolean;
  daraWebstoreFulfillmentEnabled?: boolean;
  daraStaffOpsNotifyEnabled?: boolean;
  daraStaffWaNotifyEnabled?: boolean;
  daraOlshopCustomerNotifyEnabled?: boolean;
  daraOwnerDigestEnabled?: boolean;
  daraOwnerDigestWaEnabled?: boolean;
  daraOwnerDigestFcmEnabled?: boolean;
  daraOwnerFcmUrgentEnabled?: boolean;
  updatedAt?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface KolamWebSettingVersion {
  version: string;
  app: KolamAppKey;
  updatedAt?: string;
  createdAt?: string;
}

export interface KolamWebSettingVersions {
  versions: Partial<Record<KolamAppKey, string>>;
  updatedAt?: string;
  createdAt?: string;
}

export interface KolamHeroSlide {
  _id: string;
  eyebrow?: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  link: string;
  linkText: string;
  secondaryLink?: string;
  secondaryLinkText?: string;
  order: number;
  isActive: boolean;
}

export interface KolamCategoryBanner {
  _id: string;
  image: string;
  categorySlug: string;
  order: number;
  isActive: boolean;
}

export interface KolamCtaSection {
  title: string;
  description: string;
  backgroundImage?: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
}

export interface KolamYoutubeSection {
  backgroundImage?: string;
  link: string;
  title: string;
  subtitle: string;
  isActive: boolean;
}

export interface KolamAnnouncementBanner {
  _id: string;
  image: string;
  link: string;
  order: number;
  isActive: boolean;
}

export interface KolamCustomerTextNotice {
  key: string;
  title: string;
  message: string;
  ctaUrl?: string;
  ctaLabel?: string;
  showOnHome?: boolean;
  showOnDashboard?: boolean;
  isActive?: boolean;
}

export interface KolamFeaturedCollection {
  _id?: string;
  title: string;
  subtitle?: string;
  categoryId?: string | null;
  image: string;
  order: number;
  isActive: boolean;
}

export interface KolamBioactiveEcosystemStep {
  key: string;
  image: string;
  order: number;
  isActive: boolean;
}

export interface KolamBioactiveEcosystem {
  steps?: KolamBioactiveEcosystemStep[];
}

export interface KolamMarketplaceContent {
  featuredCollections?: KolamFeaturedCollection[];
  bioactiveEcosystem?: KolamBioactiveEcosystem;
}

export interface KolamHeroSlideBody {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  description?: string;
  link?: string;
  linkText?: string;
  secondaryLink?: string;
  secondaryLinkText?: string;
  order?: number;
  isActive?: boolean;
  imageLocalUri?: string;
}

export interface KolamCategoryBannerBody {
  categorySlug: string;
  order?: number;
  isActive?: boolean;
  imageLocalUri?: string;
}

export interface KolamAnnouncementBannerBody {
  link?: string;
  order?: number;
  isActive?: boolean;
  imageLocalUri?: string;
}

export interface KolamCtaSectionBody {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  isActive?: boolean;
  removeBackgroundImage?: boolean;
  backgroundImageLocalUri?: string;
}

export interface KolamYoutubeSectionBody {
  link?: string;
  title?: string;
  subtitle?: string;
  isActive?: boolean;
  removeBackgroundImage?: boolean;
  backgroundImageLocalUri?: string;
}

export interface UpdateKolamWebSettingBody
  extends Partial<
    Pick<
      KolamWebSetting,
      | 'companyName'
      | 'companyTagline'
      | 'address'
      | 'phone'
      | 'email'
      | 'logo'
      | 'livechatOnline'
      | 'maintenance'
      | 'staffDesktopOnly'
      | 'kolamMacAccess'
      | 'staffOtpLogin'
      | 'smtp'
      | 'firebase'
      | 'kolamPlugins'
      | 'biteshipApiKey'
      | 'googleMapsBrowserApiKey'
      | 'storeOperatingHours'
      | 'teamChatGroupCallEnabled'
      | 'daraBusinessEnabled'
      | 'daraToolsEnabled'
      | 'daraKnowledgeEnabled'
      | 'daraHandoffNotifyEnabled'
      | 'daraInsightsEnabled'
      | 'daraAutoReportEnabled'
      | 'daraImageAnalysisEnabled'
      | 'daraTaxEnabled'
      | 'daraSeoEnabled'
      | 'daraTaxRegulationWatcherEnabled'
      | 'daraTaxComplianceJobEnabled'
      | 'daraTaxLlmNarrativeEnabled'
      | 'daraWebstoreFulfillmentEnabled'
      | 'daraStaffOpsNotifyEnabled'
      | 'daraStaffWaNotifyEnabled'
      | 'daraOlshopCustomerNotifyEnabled'
      | 'daraOwnerDigestEnabled'
      | 'daraOwnerDigestWaEnabled'
      | 'daraOwnerDigestFcmEnabled'
      | 'daraOwnerFcmUrgentEnabled'
    >
  > {
  [key: string]: unknown;
}

export interface UpdateKolamWebSettingVersionBody {
  version: string;
  app?: KolamAppKey;
}

export interface KolamRole {
  _id: string;
  name: string;
  key: string;
  description?: string;
  permissions?: KolamRolePermission[];
}

export interface KolamRolePermission {
  _id?: string;
  resource: string;
  actions: string[];
}

export interface KolamRoleBody {
  name: string;
  key: string;
  description?: string;
  permissions: KolamRolePermission[];
}

export type KolamActivityLogType = 'api' | 'page';
export type KolamActivityLogStatus = 'success' | 'failed';
export type KolamActivityLogSource = 'Kolam' | 'pos' | 'store' | '';

export interface KolamActivityLog {
  _id: string;
  timestamp: string;
  userId: {
    _id: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    email?: string;
  } | null;
  source: KolamActivityLogSource;
  type: KolamActivityLogType;
  action: string;
  method: string;
  path: string;
  ip: string;
  userAgent: string;
  status: KolamActivityLogStatus;
  statusCode: number;
  duration: number;
  metadata: Record<string, unknown>;
  error: string;
  suspicious: string[];
}

export interface KolamActivityLogListParams
  extends Record<string, string | number | boolean | undefined | null> {
  page?: number;
  limit?: number;
  userId?: string;
  type?: KolamActivityLogType | '';
  action?: string;
  method?: string;
  status?: KolamActivityLogStatus | '';
  source?: KolamActivityLogSource;
  suspicious?: 'true' | string;
  from?: string;
  to?: string;
  search?: string;
}

export interface KolamActivityLogListResponse {
  success: boolean;
  data: KolamActivityLog[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface KolamActivityLogStatsResponse {
  success: boolean;
  data: {
    since: string;
    days: number;
    byType: Array<{_id: KolamActivityLogType; count: number}>;
    byStatus: Array<{_id: KolamActivityLogStatus; count: number}>;
    topUsers: unknown[];
    topPaths: Array<{_id: string; count: number}>;
  };
}

export interface KolamActivityLogDeleteResponse {
  success: boolean;
  data: {
    deletedCount: number;
  };
}

export interface KolamNotificationSoundResponse {
  message: string;
  notificationSound?: string;
  unassignedNotificationSound?: string;
  handoffNotificationSound?: string;
  groupCallRingtone?: string;
  salesNotificationSound?: string;
}

interface DataResponse<T> {
  data: T;
}

interface MessageDataResponse<T> extends DataResponse<T> {
  message?: string;
}

interface KolamSummaryQuery
  extends Record<string, string | number | boolean | undefined | null> {
  range?: KolamSummaryRange;
  startDate?: string;
  endDate?: string;
}

export function getKolamFinanceSummary(
  query: KolamSummaryQuery = {range: 'month'},
): Promise<KolamFinanceSummary> {
  return kolamGet<KolamFinanceSummary>('/finance-summary', query);
}

export function getKolamSaleCostSummary(
  query: KolamSummaryQuery = {range: 'month'},
): Promise<KolamSaleCostSummary> {
  return kolamGet<KolamSaleCostSummary>('/finance-summary/sale-cost', query);
}

export async function getKolamSalesGraph(
  range: Extract<KolamSummaryRange, 'today' | 'month' | 'year'> = 'month',
): Promise<KolamSalesGraphPoint[]> {
  const response = await kolamGet<DataResponse<KolamSalesGraphPoint[]>>(
    '/dashboard/sales-graph',
    {range},
  );

  return response.data;
}

export async function getKolamDashboard(
  range: Extract<KolamSummaryRange, 'week' | 'month' | 'year' | 'all'> = 'month',
): Promise<KolamDashboardData> {
  const response = await kolamGet<DataResponse<KolamDashboardData> | KolamDashboardData>(
    '/dashboard',
    {range},
  );

  return 'data' in response ? response.data : response;
}

export async function getKolamPendingCustomerVerifications(): Promise<
  KolamPendingCustomerVerificationRow[]
> {
  const response = await kolamGet<
    DataResponse<KolamPendingCustomerVerificationRow[]>
  >('/subscriptions/my/pending-customer-verifications');

  return response.data ?? [];
}

export async function getKolamWebSetting(): Promise<KolamWebSetting> {
  const response = await kolamGet<
    KolamWebSetting | DataResponse<KolamWebSetting>
  >('/websetting');

  return unwrapData(response);
}

export function getKolamWebSettingVersion(
  app: KolamAppKey = 'kolam',
): Promise<KolamWebSettingVersion> {
  return kolamGet<KolamWebSettingVersion>('/websetting/version', {app});
}

export function getKolamWebSettingVersions(): Promise<KolamWebSettingVersions> {
  return kolamGet<KolamWebSettingVersions>('/websetting/version/all');
}

export async function updateKolamWebSetting(
  body: UpdateKolamWebSettingBody,
): Promise<KolamWebSetting> {
  const response = await kolamPut<
    KolamWebSetting | DataResponse<KolamWebSetting>
  >('/websetting', body);

  return unwrapData(response);
}

export function updateKolamWebSettingVersion(
  body: UpdateKolamWebSettingVersionBody,
): Promise<KolamWebSettingVersion & {message: string}> {
  return kolamPut<KolamWebSettingVersion & {message: string}>(
    '/websetting/version',
    body,
  );
}

export async function getKolamHeroSlidesAdmin(): Promise<KolamHeroSlide[]> {
  const response = await kolamGet<DataResponse<KolamHeroSlide[]>>(
    '/websetting/hero-slides/admin',
  );
  return response.data ?? [];
}

export function createKolamHeroSlide(
  body: KolamHeroSlideBody,
): Promise<KolamHeroSlide> {
  return createMarketplaceLandingItem<KolamHeroSlide>(
    '/websetting/hero-slides',
    createMarketplaceFormData(body, 'image', body.imageLocalUri),
  );
}

export function updateKolamHeroSlide(
  slideId: string,
  body: KolamHeroSlideBody,
): Promise<KolamHeroSlide> {
  return updateMarketplaceLandingItem<KolamHeroSlide>(
    `/websetting/hero-slides/${encodeURIComponent(slideId)}`,
    createMarketplaceFormData(body, 'image', body.imageLocalUri),
  );
}

export async function deleteKolamHeroSlide(slideId: string): Promise<void> {
  await kolamDelete<MessageDataResponse<unknown>>(
    `/websetting/hero-slides/${encodeURIComponent(slideId)}`,
  );
}

export function reorderKolamHeroSlides(
  slideIds: string[],
): Promise<KolamHeroSlide[]> {
  return reorderMarketplaceLandingItems<KolamHeroSlide>(
    '/websetting/hero-slides/reorder',
    {slideIds},
  );
}

export async function getKolamCategoryBannersAdmin(): Promise<
  KolamCategoryBanner[]
> {
  const response = await kolamGet<DataResponse<KolamCategoryBanner[]>>(
    '/websetting/category-banners/admin',
  );
  return response.data ?? [];
}

export function createKolamCategoryBanner(
  body: KolamCategoryBannerBody,
): Promise<KolamCategoryBanner> {
  return createMarketplaceLandingItem<KolamCategoryBanner>(
    '/websetting/category-banners',
    createMarketplaceFormData(body, 'image', body.imageLocalUri),
  );
}

export function updateKolamCategoryBanner(
  bannerId: string,
  body: KolamCategoryBannerBody,
): Promise<KolamCategoryBanner> {
  return updateMarketplaceLandingItem<KolamCategoryBanner>(
    `/websetting/category-banners/${encodeURIComponent(bannerId)}`,
    createMarketplaceFormData(body, 'image', body.imageLocalUri),
  );
}

export async function deleteKolamCategoryBanner(
  bannerId: string,
): Promise<void> {
  await kolamDelete<MessageDataResponse<unknown>>(
    `/websetting/category-banners/${encodeURIComponent(bannerId)}`,
  );
}

export function reorderKolamCategoryBanners(
  bannerIds: string[],
): Promise<KolamCategoryBanner[]> {
  return reorderMarketplaceLandingItems<KolamCategoryBanner>(
    '/websetting/category-banners/reorder',
    {bannerIds},
  );
}

export async function getKolamCtaSectionAdmin(): Promise<KolamCtaSection> {
  const response = await kolamGet<DataResponse<KolamCtaSection>>(
    '/websetting/cta-section/admin',
  );
  return response.data;
}

export function updateKolamCtaSection(
  body: KolamCtaSectionBody,
): Promise<KolamCtaSection> {
  return updateMarketplaceLandingItem<KolamCtaSection>(
    '/websetting/cta-section',
    createMarketplaceFormData(
      body,
      'backgroundImage',
      body.backgroundImageLocalUri,
    ),
  );
}

export async function getKolamYoutubeSectionAdmin(): Promise<KolamYoutubeSection> {
  const response = await kolamGet<DataResponse<KolamYoutubeSection>>(
    '/websetting/youtube-section/admin',
  );
  return response.data;
}

export function updateKolamYoutubeSection(
  body: KolamYoutubeSectionBody,
): Promise<KolamYoutubeSection> {
  return updateMarketplaceLandingItem<KolamYoutubeSection>(
    '/websetting/youtube-section',
    createMarketplaceFormData(
      body,
      'backgroundImage',
      body.backgroundImageLocalUri,
    ),
  );
}

export async function getKolamAnnouncementBannersAdmin(): Promise<
  KolamAnnouncementBanner[]
> {
  const response = await kolamGet<DataResponse<KolamAnnouncementBanner[]>>(
    '/websetting/announcement-banners/admin',
  );
  return response.data ?? [];
}

export function createKolamAnnouncementBanner(
  body: KolamAnnouncementBannerBody,
): Promise<KolamAnnouncementBanner> {
  return createMarketplaceLandingItem<KolamAnnouncementBanner>(
    '/websetting/announcement-banners',
    createMarketplaceFormData(body, 'image', body.imageLocalUri),
  );
}

export function updateKolamAnnouncementBanner(
  bannerId: string,
  body: KolamAnnouncementBannerBody,
): Promise<KolamAnnouncementBanner> {
  return updateMarketplaceLandingItem<KolamAnnouncementBanner>(
    `/websetting/announcement-banners/${encodeURIComponent(bannerId)}`,
    createMarketplaceFormData(body, 'image', body.imageLocalUri),
  );
}

export async function deleteKolamAnnouncementBanner(
  bannerId: string,
): Promise<void> {
  await kolamDelete<MessageDataResponse<unknown>>(
    `/websetting/announcement-banners/${encodeURIComponent(bannerId)}`,
  );
}

export function reorderKolamAnnouncementBanners(
  bannerIds: string[],
): Promise<KolamAnnouncementBanner[]> {
  return reorderMarketplaceLandingItems<KolamAnnouncementBanner>(
    '/websetting/announcement-banners/reorder',
    {bannerIds},
  );
}

export async function getKolamCustomerNoticesAdmin(): Promise<
  KolamCustomerTextNotice[]
> {
  const response = await kolamGet<DataResponse<KolamCustomerTextNotice[]>>(
    '/websetting/customer-notices/admin',
  );
  return response.data ?? [];
}

export async function upsertKolamCustomerNotice(
  body: KolamCustomerTextNotice,
): Promise<KolamCustomerTextNotice> {
  const response = await kolamPut<DataResponse<KolamCustomerTextNotice>>(
    '/websetting/customer-notices',
    body,
  );
  return response.data;
}

export async function deleteKolamCustomerNotice(key: string): Promise<void> {
  await kolamDelete<MessageDataResponse<unknown>>(
    `/websetting/customer-notices/${encodeURIComponent(key)}`,
  );
}

export async function getKolamMarketplaceContentAdmin(): Promise<
  KolamMarketplaceContent
> {
  const webSetting = await getKolamWebSetting();
  return getMarketplaceContentFromWebSetting(webSetting);
}

export async function updateKolamFeaturedCollections(
  featuredCollections: KolamFeaturedCollection[],
): Promise<KolamMarketplaceContent> {
  const response = await updateKolamWebSetting({
    marketplaceContent: {featuredCollections},
  });
  return getMarketplaceContentFromWebSetting(response, {featuredCollections});
}

export async function updateKolamBioactiveEcosystem(
  bioactiveEcosystem: KolamBioactiveEcosystem,
): Promise<KolamMarketplaceContent> {
  const response = await updateKolamWebSetting({
    marketplaceContent: {bioactiveEcosystem},
  });
  return getMarketplaceContentFromWebSetting(response, {bioactiveEcosystem});
}

export async function uploadKolamMarketplaceContentImage(
  type: KolamMarketplaceContentImageType,
  localUri: string,
): Promise<string> {
  const response = await uploadMarketplaceImage(
    `/websetting/marketplace-content/${type}/image`,
    localUri,
    'image',
  );
  return getUploadedImagePath(response);
}

export async function uploadKolamWebSettingLogo(
  localUri: string,
): Promise<KolamWebSetting> {
  const response = await uploadMarketplaceImage(
    '/websetting/upload-photos',
    localUri,
    'photo',
  );
  return unwrapData(response as KolamWebSetting | DataResponse<KolamWebSetting>);
}

export async function uploadKolamDaraAvatar(
  localUri: string,
): Promise<{success?: boolean; message?: string; daraAvatarUrl?: string}> {
  return uploadMarketplaceImage('/websetting/dara-avatar', localUri, 'photo');
}

export function uploadKolamNotificationSound(
  type: KolamNotificationSoundType,
  localUri: string,
): Promise<KolamNotificationSoundResponse> {
  const body = new FormData();
  body.append('sound', createAudioFilePart(localUri) as unknown as Blob);

  return kolamPost<KolamNotificationSoundResponse>(
    `/websetting/notification-sound/${encodeURIComponent(type)}`,
    body,
  );
}

export function deleteKolamNotificationSound(
  type: KolamNotificationSoundType,
): Promise<KolamNotificationSoundResponse> {
  return kolamDelete<KolamNotificationSoundResponse>(
    `/websetting/notification-sound/${encodeURIComponent(type)}`,
  );
}

export async function getKolamRoles(): Promise<KolamRole[]> {
  const response = await kolamGet<MessageDataResponse<KolamRole[]>>('/roles');

  return response.data;
}

export async function createKolamRole(
  body: KolamRoleBody,
): Promise<KolamRole> {
  const response = await kolamPost<MessageDataResponse<KolamRole>>(
    '/roles',
    body,
  );

  return response.data;
}

export async function updateKolamRole(
  roleId: string,
  body: KolamRoleBody,
): Promise<KolamRole> {
  const response = await kolamPut<MessageDataResponse<KolamRole>>(
    `/roles/${roleId}`,
    body,
  );

  return response.data;
}

export async function deleteKolamRole(roleId: string): Promise<void> {
  await kolamDelete<MessageDataResponse<unknown>>(`/roles/${roleId}`);
}

export function getKolamActivityLogs(
  params: KolamActivityLogListParams = {page: 1, limit: 50},
): Promise<KolamActivityLogListResponse> {
  return kolamGet<KolamActivityLogListResponse>('/activity-log', params);
}

export function getKolamActivityLogStats(
  days = 7,
): Promise<KolamActivityLogStatsResponse> {
  return kolamGet<KolamActivityLogStatsResponse>('/activity-log/stats', {days});
}

export function deleteKolamActivityLogs(): Promise<KolamActivityLogDeleteResponse> {
  return kolamDelete<KolamActivityLogDeleteResponse>('/activity-log');
}

function kolamGet<T>(
  path: string,
  query?: Record<string, string | number | boolean | undefined | null>,
) {
  return apiRequest<T>({
    method: 'GET',
    path,
    query,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });
}

function kolamPut<T>(path: string, body: unknown) {
  return apiRequest<T>({
    method: 'PUT',
    path,
    body,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });
}

function kolamPost<T>(path: string, body: unknown) {
  return apiRequest<T>({
    method: 'POST',
    path,
    body,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });
}

function kolamDelete<T>(path: string) {
  return apiRequest<T>({
    method: 'DELETE',
    path,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });
}

function unwrapData<T>(response: T | DataResponse<T>): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as DataResponse<T>).data;
  }

  return response as T;
}

async function createMarketplaceLandingItem<T>(
  path: string,
  body: FormData,
): Promise<T> {
  const response = await kolamPost<DataResponse<T> | T>(path, body);
  return unwrapData(response);
}

async function updateMarketplaceLandingItem<T>(
  path: string,
  body: FormData,
): Promise<T> {
  const response = await kolamPut<DataResponse<T> | T>(path, body);
  return unwrapData(response);
}

async function reorderMarketplaceLandingItems<T>(
  path: string,
  body: Record<string, string[]>,
): Promise<T[]> {
  const response = await kolamPut<DataResponse<T[]> | T[]>(path, body);
  return unwrapData(response);
}

function createMarketplaceFormData(
  body: object,
  fileField: string,
  localUri?: string,
) {
  const formData = new FormData();

  Object.entries(body as Record<string, unknown>).forEach(([key, value]) => {
    if (key.endsWith('LocalUri') || value === undefined || value === null) {
      return;
    }

    formData.append(key, String(value));
  });

  if (localUri) {
    formData.append(fileField, createImageFilePart(localUri) as unknown as Blob);
  }

  return formData;
}

async function uploadMarketplaceImage<T = unknown>(
  path: string,
  localUri: string,
  fieldName: string,
): Promise<T> {
  const body = new FormData();
  body.append(fieldName, createImageFilePart(localUri) as unknown as Blob);
  return kolamPost<T>(path, body);
}

function getMarketplaceContentFromWebSetting(
  webSetting: KolamWebSetting,
  fallback: KolamMarketplaceContent = {},
): KolamMarketplaceContent {
  const content = webSetting.marketplaceContent;

  if (content && typeof content === 'object') {
    return content as KolamMarketplaceContent;
  }

  return fallback;
}

function getUploadedImagePath(response: unknown) {
  if (!response || typeof response !== 'object') {
    return '';
  }

  const directImage = (response as {image?: unknown}).image;
  if (typeof directImage === 'string') {
    return directImage;
  }

  const dataImage = (response as {data?: {image?: unknown}}).data?.image;
  return typeof dataImage === 'string' ? dataImage : '';
}

function createImageFilePart(localUri: string) {
  const normalizedUri = localUri.startsWith('file://')
    ? localUri
    : `file:///${localUri.replace(/\\/g, '/')}`;
  const name = normalizedUri.split('/').pop() || 'marketplace-image.jpg';

  return {
    uri: normalizedUri,
    name,
    type: inferImageMimeType(name),
  };
}

function inferImageMimeType(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    case 'heic':
      return 'image/heic';
    case 'heif':
      return 'image/heif';
    case 'jpg':
    case 'jpeg':
    default:
      return 'image/jpeg';
  }
}

function createAudioFilePart(localUri: string) {
  const normalizedUri = localUri.startsWith('file://')
    ? localUri
    : `file:///${localUri.replace(/\\/g, '/')}`;
  const name = normalizedUri.split('/').pop() || 'notification-sound.mp3';

  return {
    uri: normalizedUri,
    name,
    type: inferAudioMimeType(name),
  };
}

function inferAudioMimeType(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'wav':
      return 'audio/wav';
    case 'mp3':
    default:
      return 'audio/mpeg';
  }
}


