/**
 * Pelatihan DARA — FE `/list-of-users/dara-training` (`DaraTrainingPage`).
 * SoT: DA-Dara-Plugin `pages/dara-training.tsx` + FE `api/dara-training`.
 */

export const KOLAM_DARA_TRAINING_ROOT = '/list-of-users/dara-training';

/** FE HeaderDescription — also shell nav description. */
export const KOLAM_DARA_TRAINING_DESCRIPTION =
  'Kamus respons cepat, consent pengiriman, koreksi ranking produk, dan vision inbox (species + produk + bukti bayar).';

export type KolamDaraTrainingTabId =
  | 'phrases'
  | 'fulfillment'
  | 'products'
  | 'vision'
  | 'videoStudio'
  | 'reviews'
  | 'fineTune';

export const KOLAM_DARA_TRAINING_TABS: Array<{
  id: KolamDaraTrainingTabId;
  label: string;
}> = [
  {id: 'phrases', label: 'Frasa respons cepat'},
  {id: 'fulfillment', label: 'Consent kirim'},
  {id: 'products', label: 'Koreksi produk'},
  {id: 'vision', label: 'Vision inbox'},
  {id: 'videoStudio', label: 'Video Studio'},
  {id: 'reviews', label: 'Review percakapan'},
  {id: 'fineTune', label: 'Fine-tuning'},
];

export const KOLAM_DARA_TRAINING_DEFAULT_TAB: KolamDaraTrainingTabId =
  'phrases';

export type KolamDaraTrainingPermissionEntry = {
  resource?: string | null;
  actions?: Array<string | null> | null;
};

export type KolamDaraTrainingStats = {
  phraseCount: number;
  enabledPhrases: number;
  fulfillmentGrantCount: number;
  fulfillmentDeclineCount: number;
  feedbackCount: number;
  minSamplesDefault: number;
  minSamplesPoc: number;
  hasSearchRankLog: boolean;
  trainScriptReady: boolean;
  rerankModelPath: string;
  rerankModelExists: boolean;
};

export type KolamDaraTrainingPhraseCategory =
  | 'chitchat'
  | 'identity'
  | 'greeting'
  | 'custom'
  | 'payment_hint'
  | 'fulfillment_grant'
  | 'fulfillment_decline';

export type KolamDaraTrainingPhraseScope = 'reply' | 'fulfillment' | 'all';

export type KolamDaraTrainingPhrase = {
  id: string;
  phrase: string;
  category: KolamDaraTrainingPhraseCategory;
  customReply: string;
  enabled: boolean;
  priority: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type KolamDaraTrainingFeedback = {
  id: string;
  query: string;
  suggestedProductName: string;
  correctProductName: string;
  correctSku: string;
  notes: string;
  source: string;
  createdAt: string;
};

export type KolamDaraTrainingRerankResult = {
  success: boolean;
  message: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  rerankModelExists: boolean;
};

export type KolamDaraTrainingConversationReviewStatus = 'pending' | 'done';

/** FE `DaraConversationReviewRow`. */
export type KolamDaraTrainingConversationReview = {
  id: string;
  conversationId: string;
  createdAt: string;
  reviewedAt: string;
  contactLabel: string;
  platform: string;
  conversationStartedAt: string;
  rating: number;
  customerComment: string;
  reviewNotes: string;
};

export type KolamDaraTrainingConversationReviewList = {
  rows: KolamDaraTrainingConversationReview[];
  total: number;
  page: number;
  limit: number;
};

/** FE `PHRASE_CATEGORY_LABELS`. */
export const KOLAM_DARA_TRAINING_PHRASE_CATEGORY_LABELS: Record<
  KolamDaraTrainingPhraseCategory,
  string
> = {
  chitchat: 'Sapaan / basa-basi',
  identity: 'Identitas DARA',
  greeting: 'Salam',
  custom: 'Kustom (jawaban manual)',
  payment_hint: 'Pemicu bukti bayar (OCR)',
  fulfillment_grant: 'Setuju kirim',
  fulfillment_decline: 'Tahan / tolak kirim',
};

/** Reply-tab categories (FE modal Select list). */
export const KOLAM_DARA_TRAINING_REPLY_CATEGORIES: KolamDaraTrainingPhraseCategory[] =
  ['chitchat', 'identity', 'greeting', 'custom', 'payment_hint'];

/** FE `FULFILLMENT_CONSENT_CATEGORIES`. */
export const KOLAM_DARA_TRAINING_FULFILLMENT_CATEGORIES: KolamDaraTrainingPhraseCategory[] =
  ['fulfillment_grant', 'fulfillment_decline'];

export function isKolamDaraTrainingRoute(route: string): boolean {
  const path = normalizeTrainingPath(route);
  return (
    path === KOLAM_DARA_TRAINING_ROOT ||
    path.startsWith(`${KOLAM_DARA_TRAINING_ROOT}/`)
  );
}

/** FE `?tab=` — empty / unknown → phrases. */
export function getKolamDaraTrainingTab(route: string): KolamDaraTrainingTabId {
  const query = route.includes('?') ? route.split('?')[1] || '' : '';
  const raw = String(new URLSearchParams(query).get('tab') || '').trim();
  const match = KOLAM_DARA_TRAINING_TABS.find(tab => tab.id === raw);
  return match?.id ?? KOLAM_DARA_TRAINING_DEFAULT_TAB;
}

export function buildKolamDaraTrainingRoute(
  tab: KolamDaraTrainingTabId = KOLAM_DARA_TRAINING_DEFAULT_TAB,
): string {
  if (tab === KOLAM_DARA_TRAINING_DEFAULT_TAB) {
    return KOLAM_DARA_TRAINING_ROOT;
  }
  return `${KOLAM_DARA_TRAINING_ROOT}?tab=${tab}`;
}

/**
 * FE `usePermission`:
 * canView = superadmin || dara-training:view || chat:view
 * canManage = superadmin || dara-training:update || websetting:update || chat:update
 */
export function resolveKolamDaraTrainingAccess(input: {
  roleKey?: string | null;
  permissions?: KolamDaraTrainingPermissionEntry[] | null;
  isOwner?: boolean | null;
}) {
  const role = String(input.roleKey ?? '')
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-');
  const isAdmin =
    role === 'admin' ||
    role === 'super-admin' ||
    role === 'super-administrator' ||
    role === 'superadmin';
  const isOwner = input.isOwner === true || role === 'owner';

  const canOn = (resource: string, action: string) => {
    if (isAdmin || isOwner) {
      return true;
    }
    const permissions = input.permissions;
    if (permissions == null) {
      return false;
    }
    const wantedResource = resource.toLowerCase();
    const wantedAction = action.toLowerCase();
    return permissions.some(permission => {
      const res = String(permission.resource ?? '')
        .trim()
        .toLowerCase();
      const actions = (permission.actions ?? []).map(item =>
        String(item).trim().toLowerCase(),
      );
      return (
        (res === wantedResource || res === '*') &&
        (actions.includes(wantedAction) ||
          actions.includes('*') ||
          (wantedAction === 'view' && actions.length > 0))
      );
    });
  };

  return {
    canSee:
      isAdmin ||
      isOwner ||
      canOn('dara-training', 'view') ||
      canOn('chat', 'view'),
    canManage:
      isAdmin ||
      isOwner ||
      canOn('dara-training', 'update') ||
      canOn('websetting', 'update') ||
      canOn('chat', 'update'),
    isAdmin: isAdmin || isOwner,
  };
}

export function normalizeKolamDaraTrainingStats(
  payload: unknown,
): KolamDaraTrainingStats {
  const data = unwrapDataRecord(payload);
  return {
    phraseCount: asNumber(data.phraseCount),
    enabledPhrases: asNumber(data.enabledPhrases),
    fulfillmentGrantCount: asNumber(data.fulfillmentGrantCount),
    fulfillmentDeclineCount: asNumber(data.fulfillmentDeclineCount),
    feedbackCount: asNumber(data.feedbackCount),
    minSamplesDefault: asNumber(data.minSamplesDefault) || 50,
    minSamplesPoc: asNumber(data.minSamplesPoc) || 5,
    hasSearchRankLog: data.hasSearchRankLog === true,
    trainScriptReady: data.trainScriptReady === true,
    rerankModelPath: String(data.rerankModelPath || '').trim(),
    rerankModelExists: data.rerankModelExists === true,
  };
}

/** FE StatTile grid for shell KPI strip. */
export function buildKolamDaraTrainingStatsCards(
  stats: KolamDaraTrainingStats,
): Array<{
  id: string;
  label: string;
  value: string;
  detail: string;
  tone: 'default' | 'success' | 'warning' | 'muted';
}> {
  const feedbackReady = stats.feedbackCount >= stats.minSamplesPoc;
  const feedbackFull = stats.feedbackCount >= stats.minSamplesDefault;
  return [
    {
      id: 'phrases',
      label: 'Frasa aktif',
      value: String(stats.enabledPhrases),
      detail: `${stats.phraseCount} total`,
      tone: 'default',
    },
    {
      id: 'grant',
      label: 'Consent setuju',
      value: String(stats.fulfillmentGrantCount),
      detail: 'Autopilot pengiriman',
      tone: 'default',
    },
    {
      id: 'decline',
      label: 'Consent tahan',
      value: String(stats.fulfillmentDeclineCount),
      detail: 'Autopilot pengiriman',
      tone: 'default',
    },
    {
      id: 'feedback',
      label: 'Koreksi produk',
      value: String(stats.feedbackCount),
      detail: `Min. ${stats.minSamplesDefault} untuk training penuh`,
      tone: feedbackFull ? 'success' : feedbackReady ? 'warning' : 'default',
    },
    {
      id: 'rank-log',
      label: 'Log ranking',
      value: stats.hasSearchRankLog ? 'Ada' : 'Belum',
      detail: 'search_rank_*.jsonl di da-ai-service',
      tone: stats.hasSearchRankLog ? 'success' : 'warning',
    },
    {
      id: 'rerank',
      label: 'Model rerank',
      value: stats.rerankModelExists ? 'Terlatih' : 'Belum',
      detail: 'Model ranking XGBoost',
      tone: stats.rerankModelExists ? 'success' : 'default',
    },
  ];
}

export function normalizeKolamDaraTrainingPhraseList(
  payload: unknown,
): KolamDaraTrainingPhrase[] {
  const root = asRecord(payload);
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(root.data)
      ? root.data
      : [];
  return list
    .map(normalizeKolamDaraTrainingPhrase)
    .filter((row): row is KolamDaraTrainingPhrase => row != null);
}

export function normalizeKolamDaraTrainingPhrase(
  payload: unknown,
): KolamDaraTrainingPhrase | null {
  const row = asRecord(payload);
  const id = String(row._id || row.id || '').trim();
  if (!id) {
    return null;
  }
  const categoryRaw = String(row.category || '').trim();
  const category = isPhraseCategory(categoryRaw) ? categoryRaw : 'custom';
  return {
    id,
    phrase: String(row.phrase || '').trim(),
    category,
    customReply: String(row.customReply || '').trim(),
    enabled: row.enabled !== false,
    priority: asNumber(row.priority),
    notes: String(row.notes || '').trim(),
    createdAt: String(row.createdAt || '').trim(),
    updatedAt: String(row.updatedAt || '').trim(),
  };
}

export function normalizeKolamDaraTrainingFeedbackList(
  payload: unknown,
): KolamDaraTrainingFeedback[] {
  const root = asRecord(payload);
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(root.data)
      ? root.data
      : [];
  return list
    .map(normalizeKolamDaraTrainingFeedback)
    .filter((row): row is KolamDaraTrainingFeedback => row != null);
}

export function normalizeKolamDaraTrainingFeedback(
  payload: unknown,
): KolamDaraTrainingFeedback | null {
  const row = asRecord(payload);
  const id = String(row._id || row.id || '').trim();
  if (!id) {
    return null;
  }
  return {
    id,
    query: String(row.query || '').trim(),
    suggestedProductName: String(row.suggestedProductName || '').trim(),
    correctProductName: String(row.correctProductName || '').trim(),
    correctSku: String(row.correctSku || '').trim(),
    notes: String(row.notes || '').trim(),
    source: String(row.source || '').trim(),
    createdAt: String(row.createdAt || '').trim(),
  };
}

export function normalizeKolamDaraTrainingRerankResult(
  payload: unknown,
): KolamDaraTrainingRerankResult {
  const root = asRecord(payload);
  const data = asRecord(root.data);
  return {
    success: root.success === true,
    message: String(root.message || '').trim(),
    exitCode: asNumber(data.exitCode),
    stdout: String(data.stdout || '').trim(),
    stderr: String(data.stderr || '').trim(),
    rerankModelExists: data.rerankModelExists === true,
  };
}

export function normalizeKolamDaraTrainingConversationReviewList(
  payload: unknown,
): KolamDaraTrainingConversationReviewList {
  const root = asRecord(payload);
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(root.data)
      ? root.data
      : [];
  const rows = list
    .map(normalizeKolamDaraTrainingConversationReview)
    .filter((row): row is KolamDaraTrainingConversationReview => row != null);
  return {
    rows,
    total: asNumber(root.total) || rows.length,
    page: asNumber(root.page) || 1,
    limit: asNumber(root.limit) || 20,
  };
}

export function normalizeKolamDaraTrainingConversationReview(
  payload: unknown,
): KolamDaraTrainingConversationReview | null {
  const row = asRecord(payload);
  const id = String(row._id || row.id || '').trim();
  const conversationId = String(row.conversationId || '').trim();
  if (!id || !conversationId) {
    return null;
  }
  return {
    id,
    conversationId,
    createdAt: String(row.createdAt || '').trim(),
    reviewedAt: String(row.reviewedAt || '').trim(),
    contactLabel: String(row.contactLabel || '').trim() || '—',
    platform: String(row.platform || '').trim() || '—',
    conversationStartedAt: String(row.conversationStartedAt || '').trim(),
    rating: asNumber(row.rating),
    customerComment: String(row.customerComment || '').trim(),
    reviewNotes: String(row.reviewNotes || '').trim(),
  };
}

/** FE `formatDate` on products feedback table. */
export function formatKolamDaraTrainingDateTime(iso?: string | null) {
  if (!iso) {
    return '—';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  try {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return iso;
  }
}

function isPhraseCategory(
  value: string,
): value is KolamDaraTrainingPhraseCategory {
  return value in KOLAM_DARA_TRAINING_PHRASE_CATEGORY_LABELS;
}

function normalizeTrainingPath(route: string): string {
  const path = String(route || '').split('?')[0].replace(/\/+$/, '') || '/';
  return path.startsWith('/') ? path : `/${path}`;
}

function unwrapDataRecord(payload: unknown): Record<string, unknown> {
  const root = asRecord(payload);
  if (root.data && typeof root.data === 'object' && !Array.isArray(root.data)) {
    return asRecord(root.data);
  }
  return root;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asNumber(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}
