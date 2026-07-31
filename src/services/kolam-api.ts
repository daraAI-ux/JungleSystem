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

export interface KolamPoWorkflowSettings {
  receivingRoomId?: string;
  notifyOnReceive?: boolean;
  notifyOnCheck?: boolean;
  notifyOnPartial?: boolean;
  postProofToTeamChat?: boolean;
  partialCompleteRequiresAdmin?: boolean;
  notifyReceiveUserIds?: string[];
  notifyCheckUserIds?: string[];
  notifyCompleteUserIds?: string[];
}

export interface KolamOvertimeSettings {
  calculationMode?: 'per_hour' | 'per_day';
  ratePerHour?: number;
  ratePerDay?: number;
  useSalaryDerivedRate?: boolean;
  defaultHoursPerRequest?: number;
  midnightCutoff?: string;
  useStoreCloseForPerDay?: boolean;
}

export interface KolamEnclosureSaleCommissionSettings {
  enabled?: boolean;
  type?: 'percentage' | 'fixed';
  value?: number;
}

export interface KolamStaffAttendanceWorkSite {
  _id?: string;
  name?: string;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  active?: boolean;
}

export interface KolamStaffAttendanceSettings {
  payrollCutoffDay?: number;
  workStartTime?: string;
  workEndTime?: string;
  serviceCommissionInsideHoursPct?: number;
  serviceCommissionOutsideHoursPct?: number;
  timezone?: string;
  lateToleranceMinutes?: number;
  lateTier2MaxMinutes?: number;
  lateCheckInDeadlineMinutes?: number;
  lateFineTier2?: number;
  lateFineTier3?: number;
  absentDailyDivisor?: number;
  attendanceMapProvider?: 'openstreetmap' | 'google';
  osmNominatimUrl?: string;
  osmTileUrl?: string;
  googleMapsBrowserApiKey?: string;
  requireGps?: boolean;
  requireFace?: boolean;
  faceMatchThreshold?: number;
  workSites?: KolamStaffAttendanceWorkSite[];
}

export interface KolamStaffAttendanceGeocodeResult {
  latitude: number;
  longitude: number;
  displayName?: string;
}

export type KolamTeamChatRoomCategory =
  | 'general'
  | 'meeting'
  | 'project'
  | 'ai'
  | 'direct';

export type KolamTeamChatAttachmentKind =
  | 'image'
  | 'video'
  | 'audio'
  | 'file';

export interface KolamTeamChatAttachment {
  url: string;
  mimeType?: string;
  fileName?: string;
  kind: KolamTeamChatAttachmentKind;
}

export interface KolamTeamChatUserRef {
  _id?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  profile_picture?: string;
  online?: boolean;
  lastReadAt?: string | null;
  role?: 'admin' | 'member';
  aiRoomAccess?: 'implicit' | 'granted';
  canRemoveAiRoomAccess?: boolean;
}

export interface KolamTeamChatDaraPresence {
  id: string;
  displayName: string;
  username: string;
  online: boolean;
  isAi: boolean;
  profile_picture: string | null;
}

export interface KolamTeamChatBotPresence {
  botKey: string;
  displayName: string;
  username?: string;
  online: boolean;
  isAi: boolean;
  isBot: true;
  botRole?: string;
  profile_picture: string | null;
  activeRoomId?: string | null;
  activeRoomName?: string | null;
  webHref?: string | null;
}

export interface KolamTeamChatMembersPayload {
  members: KolamTeamChatUserRef[];
  dara: KolamTeamChatDaraPresence;
  bots: KolamTeamChatBotPresence[];
  daraReplyEnabled: boolean;
  canManageAiRoomAccess: boolean;
}

export interface KolamTeamChatReaction {
  emoji: string;
  user: string | KolamTeamChatUserRef;
  createdAt?: string;
}

export interface KolamTeamChatReadReceipt {
  user: string | KolamTeamChatUserRef;
  readAt?: string;
}

export interface KolamTeamChatReplyPreview {
  _id?: string;
  body?: string;
  senderName?: string;
  createdAt?: string;
}

export interface KolamTeamChatLinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

export interface KolamTeamChatEmbedInput {
  type: 'invoice' | 'task' | 'purchase_order';
  refId: string;
}

export interface KolamTeamChatEmbed extends KolamTeamChatEmbedInput {
  title?: string;
  subtitle?: string;
  url?: string;
  meta?: Record<string, unknown>;
}

export interface KolamTeamChatSendMessageBody {
  body?: string;
  replyToMessageId?: string;
  attachments?: KolamTeamChatAttachment[];
  embeds?: KolamTeamChatEmbedInput[];
}

export type KolamTeamChatCreateRoomCategory = Extract<
  KolamTeamChatRoomCategory,
  'meeting' | 'project'
>;

export interface KolamTeamChatCreateRoomBody {
  name: string;
  category: KolamTeamChatCreateRoomCategory;
  description?: string;
  memberIds?: string[];
}

export interface KolamTeamChatDirectBody {
  dara?: boolean;
  userId?: string;
}

export interface KolamTeamChatPresence {
  onlineCount: number;
  viewingCount: number;
  typingUserIds: string[];
}

export interface KolamTeamChatPresenceBody {
  viewingRoomId?: string | null;
  typing?: boolean;
  typingRoomId?: string | null;
}

export type KolamTeamChatCallStatus = 'ringing' | 'active' | 'ended';

export type KolamTeamChatCallParticipantStatus =
  | 'invited'
  | 'ringing'
  | 'joined'
  | 'declined'
  | 'no_answer'
  | 'left';

export interface KolamTeamChatCallParticipant {
  user: string | KolamTeamChatUserRef;
  status: KolamTeamChatCallParticipantStatus;
  joinedAt?: string | null;
  leftAt?: string | null;
  muted?: boolean;
  handRaised?: boolean;
}

export interface KolamTeamChatCall {
  _id: string;
  roomId?: string;
  status: KolamTeamChatCallStatus;
  startedBy?: string | KolamTeamChatUserRef;
  ringExpiresAt?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  participantCount?: number;
  onlineInCall?: number;
  participants?: KolamTeamChatCallParticipant[];
  isHost?: boolean;
  handover?: {
    platform?: string;
    startedAt?: string;
    endedAt?: string;
  };
}

export interface KolamTeamChatCallConfig {
  enabled: boolean;
  groupCallRingtone?: string;
}

export interface KolamChatAnalyticsParams {
  from?: string;
  to?: string;
}

export interface KolamChatAnalytics {
  conversations?: unknown;
  messages?: unknown;
  responseTimes?: unknown;
  byPlatform?: unknown;
  [key: string]: unknown;
}

export interface KolamTeamChatRoom {
  _id: string;
  name?: string;
  category?: KolamTeamChatRoomCategory | string;
  directPeerName?: string;
  isGeneral?: boolean;
  isAiRoom?: boolean;
  isDaraDirect?: boolean;
  lastMessageAt?: string | null;
  lastMessagePreview?: string;
  unreadCount?: number;
}

export interface KolamTeamChatMessage {
  _id: string;
  room?: string;
  sender?: string | KolamTeamChatUserRef | null;
  senderType?: 'user' | 'ai';
  botKey?: string;
  botName?: string;
  body?: string;
  attachments?: KolamTeamChatAttachment[];
  reactions?: KolamTeamChatReaction[];
  readReceipts?: KolamTeamChatReadReceipt[];
  replyPreview?: KolamTeamChatReplyPreview | null;
  linkPreviews?: KolamTeamChatLinkPreview[];
  embeds?: KolamTeamChatEmbed[];
  editedAt?: string | null;
  editedByName?: string | null;
  createdAt?: string;
}

export type KolamChatPlatform =
  | 'tokopedia'
  | 'shopee'
  | 'store'
  | 'tiktok'
  | 'whatsapp'
  | 'instagram';

export type KolamChatConversationStatus = 'open' | 'closed';

export type KolamChatPlatformHealthState =
  | 'healthy'
  | 'starting'
  | 'stale'
  | 'down'
  | 'inactive'
  | 'unconfigured'
  | 'unknown';

export interface KolamChatPlatformHealthSignals {
  dbLog?: boolean;
  inbound?: boolean;
  pigeonAuthCaptured?: boolean;
  pigeonWsConnected?: boolean;
  ready?: boolean;
  recentFatal?: boolean;
  scan?: boolean;
}

export interface KolamChatPlatformHealthRow {
  platform: Exclude<KolamChatPlatform, 'store'> | 'store' | string;
  label?: string | null;
  serviceAccountId?: string | null;
  accountStatus?: string | null;
  deviceId?: string | null;
  chatCaptureMode?: string | null;
  processRunning?: boolean;
  state: KolamChatPlatformHealthState;
  healthy: boolean;
  reason?: string | null;
  lastActivityAt?: string | null;
  lastChatReadyAt?: string | null;
  lastChatScanAt?: string | null;
  lastInboundAt?: string | null;
  lastErrorAt?: string | null;
  lastError?: string | null;
  signals?: KolamChatPlatformHealthSignals;
}

export interface KolamChatPlatformHealth {
  checkedAt?: string;
  platforms: KolamChatPlatformHealthRow[];
  amConfigured?: boolean;
  amReachable?: boolean;
  dbReachable?: boolean;
  message?: string;
}

export interface KolamChatStaffRef {
  _id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  profile_picture?: string | null;
}

export interface KolamChatLabel {
  _id: string;
  color: string;
  createdAt?: string;
  createdBy?: string | null;
  name: string;
  updatedAt?: string;
}

export interface KolamChatTemplate {
  _id: string;
  body: string;
  category: string;
  createdAt?: string;
  createdBy?: string | null;
  isSystem?: boolean;
  systemKey?: string | null;
  title: string;
  updatedAt?: string;
}

export interface KolamChatContactCustomer {
  _id: string;
  address?: string;
  createdAt?: string;
  email?: string;
  name: string;
  phone?: string;
}

export type KolamChatContactOrderStatus =
  | 'draft'
  | 'pending'
  | 'sent'
  | 'paid'
  | 'partial_paid'
  | 'cancelled';

export interface KolamChatContactOrder {
  _id: string;
  deliveryStatus?: string;
  finalTotal?: number;
  invoiceCode: string;
  itemsCount?: number;
  status: KolamChatContactOrderStatus;
  transactionDate?: string;
}

export interface KolamChatContactDetails {
  contact: Extract<KolamChatConversation['contactId'], object> | null;
  customer: KolamChatContactCustomer | null;
  metrics: {
    ordersCount: number;
    totalOrders: number;
    totalSpend: number;
  };
  recentOrders: KolamChatContactOrder[];
}

export interface KolamChatHandoverNote {
  createdAt?: string | null;
  createdByStaffId?: KolamChatStaffRef | string | null;
  fromStaffId?: KolamChatStaffRef | string | null;
  text?: string | null;
  toStaffId?: KolamChatStaffRef | string | null;
}

export interface KolamChatConversation {
  _id: string;
  aiHandoffAt?: string | null;
  aiHandoffReason?: string | null;
  assignedStaffId?: KolamChatStaffRef | string | null;
  createdAt?: string;
  externalId?: string;
  hadHumanStaff?: boolean;
  handoverNote?: KolamChatHandoverNote | null;
  isAiHandled?: boolean;
  labelIds?: Array<KolamChatLabel | string>;
  labels?: KolamChatLabel[];
  platform?: KolamChatPlatform;
  lastMessageAt?: string | null;
  lastMessageDirection?: 'in' | 'out';
  lastMessagePreview?: string;
  lastMessageType?: string;
  pendingRating?: {active?: boolean; requestedAt?: string | null};
  reviewPending?: boolean;
  reviewTarget?: string | null;
  shopId?: string | null;
  unreadCount?: number;
  status?: KolamChatConversationStatus;
  contactId?:
    | string
    | {
        _id?: string;
        avatarUrl?: string;
        displayName?: string;
        externalId?: string;
        linkedCustomerId?: string | {_id?: string; name?: string} | null;
        platform?: KolamChatPlatform;
      };
  updatedAt?: string;
}

export interface KolamChatMessageContent {
  type: string;
  text?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  card?: {
    entityId?: string;
    entityType?: 'product' | 'species';
    name?: string;
    price?: number;
    priceLabel?: string;
    stock?: number;
    imageUrl?: string;
    detailHref?: string;
    marketplace?: {
      platform?: 'shopee' | 'tokopedia';
      productId?: string;
      goodsId?: string;
      shopId?: string;
      listingName?: string;
      sku?: string;
    };
  };
  youtube?: {
    videoId?: string;
    url?: string;
    title?: string;
  };
}

export interface KolamChatReplyContent {
  senderName?: string;
  text?: string;
  type?: 'text' | 'image' | 'audio' | 'video' | 'document' | 'sticker' | 'story' | 'unknown';
  imageUrl?: string;
}

export interface KolamChatDaraMessageMeta {
  buyerImageUrl?: string;
  buyerMessageId?: string;
  candidates?: Array<{
    displayName?: string;
    entityId?: string;
    entityType?: 'species' | 'product';
    scientificName?: string;
    score?: number | null;
  }>;
  fulfillmentPhase?: 'consent_prompt' | 'consent_grant_ack' | 'consent_decline_ack' | 'status';
  invoiceCode?: string;
  kind?: 'vision' | 'search' | 'fulfillment' | 'image_clarify' | 'payment_proof';
  matchStatus?: 'match' | 'ambiguous' | 'weak' | 'error' | 'unknown';
  saleId?: string;
  suggestedDisplayName?: string;
  suggestedEntityId?: string;
  suggestedEntityType?: 'species' | 'product';
  suggestedScientificName?: string;
}

export interface KolamChatMessage {
  _id: string;
  conversationId?: string;
  direction?: 'in' | 'out';
  senderStaffId?: string | KolamChatStaffRef | null;
  senderName?: string;
  senderType?: 'buyer' | 'staff' | 'system' | 'ai_agent';
  content?: KolamChatMessageContent;
  daraMeta?: KolamChatDaraMessageMeta | null;
  deliveryStatus?: string;
  editedAt?: string | null;
  editedByName?: string | null;
  editedByType?: 'staff' | 'buyer' | '' | null;
  replyContent?: KolamChatReplyContent | null;
  sentAt?: string;
  createdAt?: string;
}

export interface KolamChatConversationListParams
  extends Record<string, string | number | boolean | undefined | null> {
  handoffOnly?: boolean;
  labelId?: string;
  status?: KolamChatConversationStatus | 'all';
  platform?: KolamChatPlatform | 'all';
  reviewPendingOnly?: boolean;
  search?: string;
  unreadOnly?: boolean;
  limit?: number;
  page?: number;
}

export interface KolamChatAssignableStaffParams
  extends Record<string, string | number | boolean | undefined | null> {
  limit?: number;
}

export interface KolamChatTemplateListParams
  extends Record<string, string | number | boolean | undefined | null> {
  category?: string;
  search?: string;
}

export interface KolamChatContactDetailsParams
  extends Record<string, string | number | boolean | undefined | null> {
  ordersLimit?: number;
}

export interface KolamChatMessageListParams
  extends Record<string, string | number | boolean | undefined | null> {
  before?: string;
  limit?: number;
}

export interface KolamUserPickerRow {
  _id: string;
  displayName?: string;
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  isEmployee?: boolean;
  isOwner?: boolean;
}

interface KolamUserPickerListResponse {
  data?: KolamUserPickerRow[];
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

export type KolamSitemapChangeFrequency =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

export type KolamSitemapSectionKey =
  | 'products'
  | 'species'
  | 'blog'
  | 'brands'
  | 'categories'
  | 'tags';

export interface KolamSitemapSection {
  enabled?: boolean;
  priority?: number;
  changeFrequency?: KolamSitemapChangeFrequency;
}

export interface KolamSitemapStaticPage {
  _id?: string;
  path: string;
  enabled?: boolean;
  priority?: number;
  changeFrequency?: KolamSitemapChangeFrequency;
}

export interface KolamSitemapCustomUrl {
  _id?: string;
  path: string;
  priority?: number;
  changeFrequency?: KolamSitemapChangeFrequency;
}

export interface KolamSitemapConfig {
  enabled?: boolean;
  includeImages?: boolean;
  sections?: Partial<Record<KolamSitemapSectionKey, KolamSitemapSection>>;
  staticPages?: KolamSitemapStaticPage[];
  customUrls?: KolamSitemapCustomUrl[];
  excludedSlugs?: Partial<Record<KolamSitemapSectionKey, string[]>>;
}

export type KolamRegionLevel = 'province' | 'regency' | 'district' | 'village';
export type KolamRegionSyncScope =
  | 'provinces'
  | 'regencies'
  | 'districts'
  | 'villages'
  | 'all';

export interface KolamRegion {
  _id: string;
  code: string;
  name: string;
  level: KolamRegionLevel;
  parentCode?: string | null;
  postalCode?: string;
  source?: string;
  sourceUpdatedAt?: string;
  updatedAt?: string;
}

export interface KolamRegionLevelStats {
  count: number;
  withPostalCode: number;
  latestUpdatedAt: string | null;
}

export interface KolamRegionStats {
  counts: Record<KolamRegionLevel, KolamRegionLevelStats>;
  samples: KolamRegion[];
  sources: {
    wilayah: string;
    kodepos: string;
  };
}

export interface KolamRegionSyncResult {
  provinces: number;
  regencies: number;
  districts: number;
  villages: number;
  upserted: number;
  withPostalCode: number;
  sources: {
    wilayah: string;
    kodepos: string;
  };
  sourceUpdatedAt?: string;
  kodeposSourceUpdatedAt?: string;
}

export interface KolamRegionListParams
  extends Record<string, string | number | boolean | undefined | null> {
  level?: KolamRegionLevel | '';
  parentCode?: string;
  search?: string;
  limit?: number;
}

export type KolamBlogStatus = 'draft' | 'published' | 'scheduled' | 'archived';

export interface KolamBlogTopic {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  status?: 'active' | 'inactive';
  blogCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface KolamBlog {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string | null;
  topics?: KolamBlogTopic[];
  tags?: string[];
  status: KolamBlogStatus;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  viewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface KolamBlogListParams
  extends Record<string, string | number | boolean | undefined | null> {
  page?: number;
  limit?: number;
  search?: string;
  status?: KolamBlogStatus | 'all' | '';
  topic?: string;
  tag?: string;
  author?: string;
  sort?: string;
}

export interface KolamBlogTopicListParams
  extends Record<string, string | number | boolean | undefined | null> {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'all' | '';
  sort?: string;
}

export interface KolamPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}

export interface KolamBlogListResponse {
  data: KolamBlog[];
  pagination: KolamPaginationMeta;
}

export interface KolamBlogTopicListResponse {
  data: KolamBlogTopic[];
  pagination: KolamPaginationMeta;
}

export interface KolamKpiSettings {
  rulesVersion?: number;
  effectiveFrom?: string;
  basePoints?: {
    low?: number;
    medium?: number;
    high?: number;
    urgent?: number;
  };
  assistedByRatio?: number;
  onTime?: {
    beforeDeadline?: number;
    farEarlyPct?: number;
    farEarlyBonus?: number;
    late?: number;
  };
  qc?: {
    passFirst?: number;
    revision1?: number;
    revisionMany?: number;
  };
  proof?: {
    complete?: number;
  };
  complaint?: {
    light?: number;
    valid?: number;
    severe?: number;
  };
  noShow?: {
    reassignOrCancel?: number;
  };
  attendance?: {
    outsideRadius?: number;
  };
  chat?: {
    fastReplyMinutes?: number;
    fastReplyPoints?: number;
    lateReplyMinutes?: number;
    lateReplyPoints?: number;
    noReplyPoints?: number;
  };
  noProof?: {
    missing?: number;
  };
  customerRating?: Record<string, number>;
  levels?: Array<{
    id: string;
    label: string;
    min: number;
    max: number | null;
  }>;
  rewards?: Array<Record<string, unknown>>;
  enabledRules?: Record<string, boolean>;
  updatedAt?: string;
  createdAt?: string;
}

export interface KolamKpiWeeklyAnnouncePreview {
  dryRun: boolean;
  weekKey: string;
  topCount: number;
  rows: Array<{
    userId?: string;
    name?: string;
    points?: number;
  }>;
  body: string;
  alreadySent: boolean;
  broadcastAt: string | null;
}

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
  googleOAuthClientId?: string;
  webstoreGoogleAuthEnabled?: boolean;
  storeOperatingHours?: KolamStoreOperatingHours;
  poWorkflow?: KolamPoWorkflowSettings;
  salePricesIncludeTax?: boolean;
  commissionPph21Enabled?: boolean;
  overtimeSettings?: KolamOvertimeSettings;
  enclosureSaleCommission?: KolamEnclosureSaleCommissionSettings;
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
  sitemapConfig?: KolamSitemapConfig;
  kolamPlugins?: KolamPluginSettings;
  notificationSound?: string;
  unassignedNotificationSound?: string;
  handoffNotificationSound?: string;
  groupCallRingtone?: string;
  salesNotificationSound?: string;
  teamChatDaraReplyEnabled?: boolean;
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
      | 'googleOAuthClientId'
      | 'webstoreGoogleAuthEnabled'
      | 'poWorkflow'
      | 'salePricesIncludeTax'
      | 'commissionPph21Enabled'
      | 'overtimeSettings'
      | 'enclosureSaleCommission'
      | 'teamChatDaraReplyEnabled'
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

export async function getKolamGoogleMapsBrowserKey(): Promise<string> {
  const response = await kolamGet<{googleMapsBrowserApiKey?: string}>(
    '/websetting/google-maps-browser-key',
  );

  return String(response.googleMapsBrowserApiKey ?? '').trim();
}

export async function updateKolamWebSetting(
  body: UpdateKolamWebSettingBody,
): Promise<KolamWebSetting> {
  const response = await kolamPut<
    KolamWebSetting | DataResponse<KolamWebSetting>
  >('/websetting', body);

  return unwrapData(response);
}

export async function updateKolamSitemapConfig(
  sitemapConfig: KolamSitemapConfig,
): Promise<KolamSitemapConfig> {
  const response = await kolamPut<DataResponse<KolamSitemapConfig>>(
    '/websetting/sitemap',
    sitemapConfig,
  );

  return response.data;
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

export async function getKolamStaffAttendanceSettings(): Promise<KolamStaffAttendanceSettings> {
  const response = await kolamGet<
    KolamStaffAttendanceSettings | DataResponse<KolamStaffAttendanceSettings>
  >('/staff-attendance/settings');
  return unwrapData(response);
}

export async function geocodeKolamStaffAttendanceWorkSite(
  query: string,
): Promise<KolamStaffAttendanceGeocodeResult> {
  const response = await kolamGet<
    DataResponse<KolamStaffAttendanceGeocodeResult>
  >('/staff-attendance/geocode', {q: query});
  return response.data;
}

export async function getKolamRegions(
  params: KolamRegionListParams = {},
): Promise<KolamRegion[]> {
  const response = await kolamGet<DataResponse<KolamRegion[]>>(
    '/regions',
    cleanKolamRegionListParams(params),
  );

  return response.data ?? [];
}

export async function getKolamRegionStats(): Promise<KolamRegionStats> {
  const response =
    await kolamGet<DataResponse<KolamRegionStats>>('/regions/stats');

  return response.data;
}

export function getKolamBlogs(
  params: KolamBlogListParams = {page: 1, limit: 10, sort: 'createdAt:desc'},
): Promise<KolamBlogListResponse> {
  return kolamGet<KolamBlogListResponse>(
    '/blogs',
    cleanKolamListParams(params),
  );
}

export function getKolamBlogTopics(
  params: KolamBlogTopicListParams = {
    page: 1,
    limit: 50,
    sort: 'name:asc',
  },
): Promise<KolamBlogTopicListResponse> {
  return kolamGet<KolamBlogTopicListResponse>(
    '/blog-topics',
    cleanKolamListParams(params),
  );
}

export async function getKolamKpiSettings(): Promise<KolamKpiSettings> {
  const response = await kolamGet<DataResponse<KolamKpiSettings>>(
    '/kpi/settings',
  );

  return response.data;
}

export async function updateKolamKpiSettings(
  body: KolamKpiSettings,
): Promise<KolamKpiSettings> {
  const response = await kolamPut<MessageDataResponse<KolamKpiSettings>>(
    '/kpi/settings',
    body,
  );

  return response.data;
}

export async function getKolamKpiWeeklyAnnouncePreview(
  params: { week?: string; limit?: number } = {},
): Promise<KolamKpiWeeklyAnnouncePreview> {
  const response = await kolamGet<DataResponse<KolamKpiWeeklyAnnouncePreview>>(
    '/kpi/admin/weekly-announce/preview',
    cleanKolamListParams(params),
  );

  return response.data;
}

export function syncKolamRegions(body: {
  scope: KolamRegionSyncScope;
  parentCode?: string;
}): Promise<{message: string; data: KolamRegionSyncResult}> {
  return kolamPost<{message: string; data: KolamRegionSyncResult}>(
    '/regions/sync',
    cleanKolamRegionSyncBody(body),
  );
}

export function updateKolamStaffAttendanceSettings(
  body: KolamStaffAttendanceSettings,
): Promise<KolamStaffAttendanceSettings> {
  return kolamPut<KolamStaffAttendanceSettings>(
    '/staff-attendance/settings',
    body,
  );
}

export async function getKolamTeamChatRooms(): Promise<KolamTeamChatRoom[]> {
  const response = await kolamGet<
    DataResponse<KolamTeamChatRoom[]> | { success?: boolean; data?: KolamTeamChatRoom[] }
  >('/team-chat/rooms');
  return response.data ?? [];
}

export async function createKolamTeamChatRoom(
  body: KolamTeamChatCreateRoomBody,
): Promise<KolamTeamChatRoom> {
  const response = await kolamPost<DataResponse<KolamTeamChatRoom>>(
    '/team-chat/rooms',
    {
      name: body.name.trim(),
      category: body.category,
      ...(body.description?.trim() ? {description: body.description.trim()} : {}),
      ...(body.memberIds?.length ? {memberIds: body.memberIds} : {}),
    },
  );

  return response.data;
}

export async function openKolamTeamChatDirect(
  body: KolamTeamChatDirectBody,
): Promise<KolamTeamChatRoom> {
  const response = await kolamPost<DataResponse<KolamTeamChatRoom>>(
    '/team-chat/direct',
    body.dara ? {dara: true} : {userId: body.userId},
  );

  return response.data;
}

export async function deleteKolamTeamChatRoom(roomId: string): Promise<void> {
  await kolamDelete<DataResponse<{deletedRoomId?: string}>>(
    `/team-chat/rooms/${encodeURIComponent(roomId)}`,
  );
}

export async function getKolamTeamChatMembers(
  roomId: string,
): Promise<KolamTeamChatMembersPayload> {
  const response = await kolamGet<
    | DataResponse<Partial<KolamTeamChatMembersPayload>>
    | Partial<KolamTeamChatMembersPayload>
  >(`/team-chat/rooms/${encodeURIComponent(roomId)}/members`);

  return normalizeKolamTeamChatMembersPayload(unwrapData(response));
}

export async function getKolamChatConversations(
  params: KolamChatConversationListParams = {},
): Promise<KolamChatConversation[]> {
  const response = await kolamGet<
    | DataResponse<KolamChatConversation[]>
    | {
        success?: boolean;
        data?: KolamChatConversation[];
      }
  >('/chat/conversations', cleanKolamListParams(params));

  return response.data ?? [];
}

export async function getKolamChatPlatformHealth(): Promise<KolamChatPlatformHealth> {
  const response = await kolamGet<
    DataResponse<KolamChatPlatformHealth> | KolamChatPlatformHealth
  >('/marketplace/platform-chat-health');

  const data = unwrapData(response);
  return {
    ...data,
    platforms: data.platforms ?? [],
  };
}

export async function getKolamChatConversation(
  conversationId: string,
): Promise<KolamChatConversation> {
  const response = await kolamGet<
    DataResponse<KolamChatConversation> | KolamChatConversation
  >(`/chat/conversations/${encodeURIComponent(conversationId)}`);

  return unwrapData(response);
}

export async function getKolamChatUnreadTotal(): Promise<number> {
  const conversations = await getKolamChatConversations({
    status: 'open',
    unreadOnly: true,
    limit: 100,
  });

  return conversations.reduce(
    (total, conversation) => total + Math.max(0, conversation.unreadCount ?? 0),
    0,
  );
}

export async function getKolamChatMessages(
  conversationId: string,
  params: KolamChatMessageListParams = {limit: 50},
): Promise<KolamChatMessage[]> {
  const response = await kolamGet<
    | DataResponse<KolamChatMessage[]>
    | {
        success?: boolean;
        data?: KolamChatMessage[];
      }
  >(
    `/chat/conversations/${encodeURIComponent(conversationId)}/messages`,
    cleanKolamListParams(params),
  );

  return response.data ?? [];
}

export async function updateKolamChatConversationStatus(
  conversationId: string,
  status: KolamChatConversationStatus,
): Promise<KolamChatConversation> {
  const response = await kolamPatch<
    DataResponse<KolamChatConversation> | KolamChatConversation
  >(`/chat/conversations/${encodeURIComponent(conversationId)}/status`, {
    status,
  });

  return unwrapData(response);
}

export async function assignKolamChatConversation(
  conversationId: string,
  staffId: string,
  handoverNote?: string,
): Promise<KolamChatConversation> {
  const response = await kolamPatch<
    DataResponse<KolamChatConversation> | KolamChatConversation
  >(`/chat/conversations/${encodeURIComponent(conversationId)}/assign`, {
    staffId,
    ...(handoverNote ? {handoverNote} : {}),
  });

  return unwrapData(response);
}

export async function updateKolamChatConversationAiHandled(
  conversationId: string,
  isAiHandled: boolean,
): Promise<KolamChatConversation> {
  const response = await kolamPatch<
    DataResponse<KolamChatConversation> | KolamChatConversation
  >(`/chat/conversations/${encodeURIComponent(conversationId)}/ai-handled`, {
    isAiHandled,
  });

  return unwrapData(response);
}

export async function updateKolamChatConversationLabels(
  conversationId: string,
  labelIds: string[],
): Promise<KolamChatConversation> {
  const response = await kolamPatch<
    DataResponse<KolamChatConversation> | KolamChatConversation
  >(`/chat/conversations/${encodeURIComponent(conversationId)}/labels`, {
    labelIds,
  });

  return unwrapData(response);
}

export async function getKolamChatLabels(): Promise<KolamChatLabel[]> {
  const response = await kolamGet<
    DataResponse<KolamChatLabel[]> | {data?: KolamChatLabel[]}
  >('/chat/labels');

  return response.data ?? [];
}

export async function getKolamChatTemplates(
  params: KolamChatTemplateListParams = {},
): Promise<KolamChatTemplate[]> {
  const response = await kolamGet<
    DataResponse<KolamChatTemplate[]> | {data?: KolamChatTemplate[]}
  >('/chat/templates', cleanKolamListParams(params));

  return response.data ?? [];
}

export async function getKolamChatContactDetails(
  conversationId: string,
  params: KolamChatContactDetailsParams = {},
): Promise<KolamChatContactDetails> {
  const response = await kolamGet<
    DataResponse<KolamChatContactDetails> | KolamChatContactDetails
  >(
    `/chat/conversations/${encodeURIComponent(conversationId)}/contact-details`,
    cleanKolamListParams(params),
  );

  return unwrapData(response);
}

export async function getKolamChatAssignableStaff(
  params: KolamChatAssignableStaffParams = {},
): Promise<KolamChatStaffRef[]> {
  const response = await kolamGet<
    DataResponse<KolamChatStaffRef[]> | {data?: KolamChatStaffRef[]}
  >('/chat/assignable-staff', cleanKolamListParams(params));

  return response.data ?? [];
}

export interface KolamChatSendMessageOptions {
  replyToMessageId?: string | null;
}

export interface KolamChatUploadImageResult {
  imageUrl: string;
  thumbnailUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

export interface KolamChatMarketplaceListingHit {
  entityType: 'product' | 'species';
  entityId: string;
  name: string;
  sku?: string | null;
  platform: 'shopee' | 'tokopedia';
  productId: string;
  goodsId?: string | null;
  shopId?: string | null;
  listingName?: string | null;
  listingUrl?: string | null;
}

export interface KolamChatMarketplaceListingSearchParams {
  platform: 'shopee' | 'tokopedia';
  q?: string;
  limit?: number;
}

export interface KolamChatMarketplaceListingSearchResult {
  platform: 'shopee' | 'tokopedia';
  items: KolamChatMarketplaceListingHit[];
}

export interface KolamChatMarketplaceProductAttachBody {
  productId?: string;
  speciesId?: string;
  sku?: string;
  entityType?: 'product' | 'species';
}

export async function sendKolamChatTextMessage(
  conversationId: string,
  text: string,
  options: KolamChatSendMessageOptions = {},
): Promise<KolamChatMessage> {
  const response = await kolamPost<DataResponse<KolamChatMessage>>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      content: {
        type: 'text',
        text,
      },
      ...(options.replyToMessageId
        ? {replyToMessageId: options.replyToMessageId}
        : {}),
    },
  );

  return response.data;
}

export async function sendKolamChatImageMessage(
  conversationId: string,
  content: KolamChatUploadImageResult,
  options: KolamChatSendMessageOptions = {},
): Promise<KolamChatMessage> {
  const response = await kolamPost<DataResponse<KolamChatMessage>>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      content: {
        type: 'image',
        imageUrl: content.imageUrl,
        thumbnailUrl: content.thumbnailUrl,
        fileName: content.fileName,
        fileSize: content.fileSize,
        mimeType: content.mimeType,
      },
      ...(options.replyToMessageId
        ? {replyToMessageId: options.replyToMessageId}
        : {}),
    },
  );

  return response.data;
}

export async function searchKolamChatMarketplaceListings(
  params: KolamChatMarketplaceListingSearchParams,
): Promise<KolamChatMarketplaceListingSearchResult> {
  const response = await kolamGet<
    | DataResponse<KolamChatMarketplaceListingSearchResult>
    | KolamChatMarketplaceListingSearchResult
  >(
    '/chat/marketplace-listings/search',
    cleanKolamListParams({
      platform: params.platform,
      q: params.q,
      limit: params.limit,
    }),
  );

  return unwrapData(response);
}

export async function attachKolamChatMarketplaceProduct(
  conversationId: string,
  body: KolamChatMarketplaceProductAttachBody,
): Promise<KolamChatMessage> {
  const response = await kolamPost<DataResponse<KolamChatMessage>>(
    `/chat/conversations/${encodeURIComponent(
      conversationId,
    )}/marketplace-product`,
    body,
  );

  return response.data;
}

export async function editKolamChatMessage(
  conversationId: string,
  messageId: string,
  text: string,
): Promise<KolamChatMessage> {
  const response = await kolamPatch<DataResponse<KolamChatMessage>>(
    `/chat/conversations/${encodeURIComponent(
      conversationId,
    )}/messages/${encodeURIComponent(messageId)}`,
    {text},
  );

  return response.data;
}

export async function markKolamChatConversationRead(
  conversationId: string,
): Promise<void> {
  await kolamPost<DataResponse<{unreadCount: number}>>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/mark-read`,
    {},
  );
}

export async function getKolamTeamChatUnreadTotal(): Promise<number> {
  const rooms = await getKolamTeamChatRooms();

  return rooms.reduce(
    (total, room) => total + Math.max(0, room.unreadCount ?? 0),
    0,
  );
}

export async function getKolamTeamChatMessages(
  roomId: string,
  params: KolamChatMessageListParams = {limit: 80},
): Promise<KolamTeamChatMessage[]> {
  const response = await kolamGet<
    | DataResponse<KolamTeamChatMessage[]>
    | {
        success?: boolean;
        data?: KolamTeamChatMessage[];
      }
  >(
    `/team-chat/rooms/${encodeURIComponent(roomId)}/messages`,
    cleanKolamListParams(params),
  );

  return response.data ?? [];
}

export async function sendKolamTeamChatTextMessage(
  roomId: string,
  body: string,
): Promise<KolamTeamChatMessage> {
  return sendKolamTeamChatMessage(roomId, {body});
}

export async function sendKolamTeamChatMessage(
  roomId: string,
  body: KolamTeamChatSendMessageBody,
): Promise<KolamTeamChatMessage> {
  const response = await kolamPost<DataResponse<KolamTeamChatMessage>>(
    `/team-chat/rooms/${encodeURIComponent(roomId)}/messages`,
    cleanKolamTeamChatMessageBody(body),
  );

  return response.data;
}

export async function markKolamTeamChatRoomRead(roomId: string): Promise<void> {
  await kolamPost<{success?: boolean}>(
    `/team-chat/rooms/${encodeURIComponent(roomId)}/read`,
    {},
  );
}

export async function editKolamTeamChatMessage(
  roomId: string,
  messageId: string,
  body: string,
): Promise<KolamTeamChatMessage> {
  const response = await kolamPatch<DataResponse<KolamTeamChatMessage>>(
    `/team-chat/rooms/${encodeURIComponent(roomId)}/messages/${encodeURIComponent(
      messageId,
    )}`,
    {body},
  );

  return response.data;
}

export async function toggleKolamTeamChatReaction(
  roomId: string,
  messageId: string,
  emoji: string,
): Promise<KolamTeamChatMessage> {
  const response = await kolamPost<DataResponse<KolamTeamChatMessage>>(
    `/team-chat/rooms/${encodeURIComponent(roomId)}/messages/${encodeURIComponent(
      messageId,
    )}/reactions`,
    {emoji},
  );

  return response.data;
}

export async function postKolamTeamChatPresence(
  body: KolamTeamChatPresenceBody,
): Promise<KolamTeamChatPresence | null> {
  const response = await kolamPost<
    DataResponse<KolamTeamChatPresence | null> | KolamTeamChatPresence | null
  >(
    '/team-chat/presence',
    cleanKolamListParams(
      body as Record<string, string | number | boolean | undefined | null>,
    ),
  );

  return unwrapData(response);
}

export async function uploadKolamTeamChatMedia(
  localUri: string,
): Promise<KolamTeamChatAttachment> {
  const body = new FormData();
  body.append('file', createTeamChatMediaFilePart(localUri) as unknown as Blob);

  const response = await kolamPost<
    DataResponse<KolamTeamChatAttachment> | KolamTeamChatAttachment
  >('/team-chat/upload', body);

  return unwrapData(response);
}

export async function uploadKolamChatImage(
  localUri: string,
): Promise<KolamChatUploadImageResult> {
  const body = new FormData();
  body.append('image', createImageFilePart(localUri) as unknown as Blob);

  const response = await kolamPost<
    DataResponse<KolamChatUploadImageResult> | KolamChatUploadImageResult
  >('/chat/upload-image', body);

  return unwrapData(response);
}

export async function searchKolamTeamChatMessages(
  roomId: string,
  query: string,
  limit = 40,
): Promise<KolamTeamChatMessage[]> {
  const response = await kolamGet<
    DataResponse<KolamTeamChatMessage[]> | {data?: KolamTeamChatMessage[]}
  >(`/team-chat/rooms/${encodeURIComponent(roomId)}/messages/search`, {
    q: query,
    limit,
  });

  return response.data ?? [];
}

export async function getKolamTeamChatCallConfig(): Promise<KolamTeamChatCallConfig> {
  const response = await kolamGet<
    DataResponse<KolamTeamChatCallConfig> | KolamTeamChatCallConfig
  >('/team-chat/calls/config');

  return unwrapData(response);
}

export async function getKolamMyActiveTeamChatCalls(): Promise<
  KolamTeamChatCall[]
> {
  const response = await kolamGet<
    DataResponse<KolamTeamChatCall[]> | KolamTeamChatCall[]
  >('/team-chat/calls/me/active');

  return unwrapData(response);
}

export async function getKolamRoomActiveTeamChatCall(
  roomId: string,
): Promise<KolamTeamChatCall | null> {
  const response = await kolamGet<
    DataResponse<KolamTeamChatCall | null> | KolamTeamChatCall | null
  >(`/team-chat/rooms/${encodeURIComponent(roomId)}/calls/active`);

  return unwrapData(response);
}

export async function startKolamTeamChatCall(
  roomId: string,
): Promise<KolamTeamChatCall> {
  const response = await kolamPost<
    DataResponse<KolamTeamChatCall> | KolamTeamChatCall
  >(`/team-chat/rooms/${encodeURIComponent(roomId)}/calls`, {});

  return unwrapData(response);
}

export async function joinKolamTeamChatCall(
  callId: string,
): Promise<KolamTeamChatCall> {
  return postKolamTeamChatCallAction(callId, 'join');
}

export async function declineKolamTeamChatCall(
  callId: string,
): Promise<KolamTeamChatCall> {
  return postKolamTeamChatCallAction(callId, 'decline');
}

export async function endKolamTeamChatCall(
  callId: string,
): Promise<KolamTeamChatCall> {
  return postKolamTeamChatCallAction(callId, 'end');
}

export async function redialKolamTeamChatCall(
  callId: string,
): Promise<KolamTeamChatCall> {
  return postKolamTeamChatCallAction(callId, 'redial');
}

export async function raiseKolamTeamChatCallHand(
  callId: string,
): Promise<KolamTeamChatCall> {
  return postKolamTeamChatCallAction(callId, 'hand/raise');
}

export async function lowerKolamTeamChatCallHand(
  callId: string,
): Promise<KolamTeamChatCall> {
  return postKolamTeamChatCallAction(callId, 'hand/lower');
}

export async function muteKolamTeamChatCallParticipant(
  callId: string,
  userId: string,
): Promise<KolamTeamChatCall> {
  return postKolamTeamChatCallAction(
    callId,
    `participants/${encodeURIComponent(userId)}/mute`,
  );
}

export async function unmuteKolamTeamChatCallParticipant(
  callId: string,
  userId: string,
): Promise<KolamTeamChatCall> {
  return postKolamTeamChatCallAction(
    callId,
    `participants/${encodeURIComponent(userId)}/unmute`,
  );
}

export async function handoverKolamTeamChatCall(
  callId: string,
  platform: string,
): Promise<KolamTeamChatCall> {
  const response = await kolamPost<
    DataResponse<KolamTeamChatCall> | KolamTeamChatCall
  >(`/team-chat/calls/${encodeURIComponent(callId)}/handover`, {platform});

  return unwrapData(response);
}

export async function getKolamChatAnalytics(
  params: KolamChatAnalyticsParams = {},
): Promise<KolamChatAnalytics> {
  const response = await kolamGet<
    DataResponse<KolamChatAnalytics> | KolamChatAnalytics
  >(
    '/chat/analytics',
    cleanKolamListParams(
      params as Record<string, string | number | boolean | undefined | null>,
    ),
  );

  return unwrapData(response);
}

export function getKolamUserPickerRows(
  search = '',
): Promise<KolamUserPickerRow[]> {
  return kolamGet<KolamUserPickerRow[] | KolamUserPickerListResponse>(
    '/auth/get-all-user',
    {
      limit: 200,
      search,
    },
  ).then(response =>
    Array.isArray(response)
      ? response
      : Array.isArray(response.data)
        ? response.data
        : [],
  );
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

function kolamPatch<T>(path: string, body: unknown) {
  return apiRequest<T>({
    method: 'PATCH',
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

function cleanKolamRegionListParams(params: KolamRegionListParams) {
  return cleanKolamListParams(params) as KolamRegionListParams;
}

function cleanKolamListParams(
  params: Record<string, string | number | boolean | undefined | null>,
) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (value === undefined || value === null) {
        return false;
      }

      if (typeof value === 'string') {
        return value.trim().length > 0;
      }

      return true;
    }),
  );
}

function cleanKolamRegionSyncBody(body: {
  scope: KolamRegionSyncScope;
  parentCode?: string;
}) {
  const parentCode = body.parentCode?.trim();
  return parentCode ? {...body, parentCode} : {scope: body.scope};
}

function cleanKolamTeamChatMessageBody(body: KolamTeamChatSendMessageBody) {
  return Object.fromEntries(
    Object.entries(body).filter(([, value]) => {
      if (value === undefined || value === null) {
        return false;
      }

      if (typeof value === 'string') {
        return value.trim().length > 0;
      }

      if (Array.isArray(value)) {
        return value.length > 0;
      }

      return true;
    }),
  );
}

function unwrapData<T>(response: T | DataResponse<T>): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as DataResponse<T>).data;
  }

  return response as T;
}

function normalizeKolamTeamChatMembersPayload(
  payload?: Partial<KolamTeamChatMembersPayload> | null,
): KolamTeamChatMembersPayload {
  return {
    members: Array.isArray(payload?.members) ? payload.members : [],
    dara: payload?.dara ?? {
      id: 'dara',
      displayName: 'DARA',
      username: 'dara',
      online: true,
      isAi: true,
      profile_picture: '/images/dara-avatar.png?v=20260602pp',
    },
    bots: Array.isArray(payload?.bots) ? payload.bots : [],
    daraReplyEnabled: payload?.daraReplyEnabled !== false,
    canManageAiRoomAccess: payload?.canManageAiRoomAccess === true,
  };
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

async function postKolamTeamChatCallAction(
  callId: string,
  action: string,
): Promise<KolamTeamChatCall> {
  const response = await kolamPost<
    DataResponse<KolamTeamChatCall> | KolamTeamChatCall
  >(`/team-chat/calls/${encodeURIComponent(callId)}/${action}`, {});

  return unwrapData(response);
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

function createTeamChatMediaFilePart(localUri: string) {
  const normalizedUri = localUri.startsWith('file://')
    ? localUri
    : `file:///${localUri.replace(/\\/g, '/')}`;
  const name = normalizedUri.split('/').pop() || 'team-chat-file';

  return {
    uri: normalizedUri,
    name,
    type: inferTeamChatMediaMimeType(name),
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

function inferTeamChatMediaMimeType(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'webp':
    case 'gif':
    case 'svg':
    case 'heic':
    case 'heif':
      return inferImageMimeType(fileName);
    case 'mp4':
      return 'video/mp4';
    case 'mov':
      return 'video/quicktime';
    case 'webm':
      return 'video/webm';
    case 'wav':
    case 'mp3':
      return inferAudioMimeType(fileName);
    case 'm4a':
      return 'audio/mp4';
    case 'aac':
      return 'audio/aac';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
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


