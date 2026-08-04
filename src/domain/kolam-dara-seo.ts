/**
 * DARA SEO campaign module (`/campaign/dara-seo/*`).
 * SoT: DA-Dara-Plugin pages + FE `layout.tsx` segment tabs + BE `/dara-seo/*`.
 */

export const KOLAM_DARA_SEO_ROOT = '/campaign/dara-seo';
export const KOLAM_DARA_SEO_JOBS_HREF = '/pusat-ai?tab=proses';

export type KolamDaraSeoTabId =
  | 'dashboard'
  | 'approvals'
  | 'rankings'
  | 'website'
  | 'keywords'
  | 'mentions'
  | 'social-insights'
  | 'sentiment'
  | 'audit-logs'
  | 'integrations'
  | 'jobs';

export const KOLAM_DARA_SEO_TABS: Array<{
  id: KolamDaraSeoTabId;
  label: string;
  href: string;
}> = [
  {id: 'dashboard', label: 'Dashboard', href: KOLAM_DARA_SEO_ROOT},
  {
    id: 'approvals',
    label: 'Persetujuan',
    href: `${KOLAM_DARA_SEO_ROOT}/approvals`,
  },
  {
    id: 'rankings',
    label: 'Ranking SERP',
    href: `${KOLAM_DARA_SEO_ROOT}/rankings`,
  },
  {id: 'website', label: 'Website', href: `${KOLAM_DARA_SEO_ROOT}/website`},
  {id: 'keywords', label: 'Keywords', href: `${KOLAM_DARA_SEO_ROOT}/keywords`},
  {id: 'mentions', label: 'Mentions', href: `${KOLAM_DARA_SEO_ROOT}/mentions`},
  {
    id: 'social-insights',
    label: 'Social Insights',
    href: `${KOLAM_DARA_SEO_ROOT}/social-insights`,
  },
  {id: 'sentiment', label: 'Sentimen', href: `${KOLAM_DARA_SEO_ROOT}/sentiment`},
  {
    id: 'audit-logs',
    label: 'Log audit',
    href: `${KOLAM_DARA_SEO_ROOT}/audit-logs`,
  },
  {
    id: 'integrations',
    label: 'Integrasi',
    href: `${KOLAM_DARA_SEO_ROOT}/integrations`,
  },
  {id: 'jobs', label: 'Riwayat proses', href: KOLAM_DARA_SEO_JOBS_HREF},
];

export const KOLAM_DARA_SEO_TITLE = 'DARA SEO & Market Intelligence';
export const KOLAM_DARA_SEO_DESCRIPTION =
  'Analisa, rekomendasi, dan draft perubahan. Mutasi produk hanya setelah approval.';

export type KolamDaraSeoStatus = {
  seoEnabled: boolean;
};

export type KolamDaraSeoBrand = {
  id: string;
  name: string;
  productCount: number;
  monitoringActive: boolean;
};

export type KolamDaraSeoDashboard = {
  seoScore: number;
  searchVisibility: number;
  brandReputationScore: number;
  sentimentScore: number;
  pendingApprovals: number;
  appliedChanges: number;
  negativeMentions: number;
  growthBullets: string[];
  needsOptimization: number;
  keywordOpportunities: number;
};

export type KolamDaraSeoPendingSuggestion = {
  id: string;
  targetType: string;
  title: string;
  seoScore: number;
  status: string;
  summary: string;
  pendingItemCount: number;
};

/** SoT `SeoSuggestionStatus` */
export type KolamDaraSeoSuggestionStatus =
  | 'analyzed'
  | 'draft_ready'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'deferred'
  | 'applied'
  | 'rolled_back'
  | string;

export type KolamDaraSeoTargetType =
  | 'product'
  | 'blog'
  | 'species'
  | 'website';

export type KolamDaraSeoTargetTab = 'all' | KolamDaraSeoTargetType;

export type KolamDaraSeoStatusFilterId =
  | 'all'
  | 'ready'
  | 'draft_ready'
  | 'pending_approval'
  | 'analyzed'
  | 'deferred'
  | 'applied'
  | 'rejected';

export type KolamDaraSeoSuggestion = {
  id: string;
  targetType: KolamDaraSeoTargetType;
  entityId: string;
  title: string;
  seoScore: number;
  status: KolamDaraSeoSuggestionStatus;
  summary: string;
  pendingItemCount: number;
  productId: string | null;
  blogId: string | null;
  speciesId: string | null;
};

export type KolamDaraSeoSuggestionItem = {
  id: string;
  fieldPath: string;
  label: string;
  beforeValue: unknown;
  proposedValue: unknown;
  itemStatus: string;
  rationale: string;
};

export type KolamDaraSeoSuggestionDetail = {
  suggestion: KolamDaraSeoSuggestion;
  items: KolamDaraSeoSuggestionItem[];
};

export type KolamDaraSeoBulkActionResult = {
  id: string;
  ok: boolean;
  error?: string;
};

export type KolamDaraSeoPermissionEntry = {
  resource?: string;
  actions?: string[];
};

/** SoT `SEO_APPROVABLE_STATUSES` */
export const KOLAM_DARA_SEO_APPROVABLE_STATUSES = [
  'pending_approval',
  'draft_ready',
  'deferred',
] as const;

/** SoT `SEO_REJECTABLE_STATUSES` */
export const KOLAM_DARA_SEO_REJECTABLE_STATUSES = [
  'pending_approval',
  'draft_ready',
  'deferred',
  'approved',
] as const;

export const KOLAM_DARA_SEO_TARGET_TABS: Array<{
  id: KolamDaraSeoTargetTab;
  label: string;
}> = [
  {id: 'all', label: 'Semua'},
  {id: 'product', label: 'Produk'},
  {id: 'blog', label: 'Blog'},
  {id: 'species', label: 'Livestock'},
  {id: 'website', label: 'Website'},
];

export const KOLAM_DARA_SEO_STATUS_FILTERS: Array<{
  id: KolamDaraSeoStatusFilterId;
  label: string;
}> = [
  {id: 'all', label: 'Semua'},
  {id: 'ready', label: 'Siap terapkan'},
  {id: 'draft_ready', label: 'Draft'},
  {id: 'pending_approval', label: 'Menunggu approve'},
  {id: 'analyzed', label: 'Dianalisa saja'},
  {id: 'deferred', label: 'Ditunda'},
  {id: 'applied', label: 'Diterapkan'},
  {id: 'rejected', label: 'Ditolak'},
];

export const KOLAM_DARA_SEO_APPROVALS_PAGE_SIZE = 10;

const SEO_STATUS_LABEL: Record<string, string> = {
  analyzed: 'Dianalisa',
  draft_ready: 'Draft',
  pending_approval: 'Menunggu approve',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  deferred: 'Ditunda',
  applied: 'Diterapkan',
  rolled_back: 'Di-rollback',
};

export function normalizeKolamDaraSeoPath(route: string) {
  const path = route.trim().split('?')[0] || '';
  if (!path) {
    return '';
  }
  return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
}

export function isKolamDaraSeoRoute(route: string) {
  const path = normalizeKolamDaraSeoPath(route);
  return (
    path === KOLAM_DARA_SEO_ROOT || path.startsWith(`${KOLAM_DARA_SEO_ROOT}/`)
  );
}

export function getKolamDaraSeoTab(route: string): KolamDaraSeoTabId {
  const path = normalizeKolamDaraSeoPath(route);
  if (path === KOLAM_DARA_SEO_ROOT) {
    return 'dashboard';
  }
  if (path === `${KOLAM_DARA_SEO_ROOT}/approvals`) {
    return 'approvals';
  }
  if (path === `${KOLAM_DARA_SEO_ROOT}/rankings`) {
    return 'rankings';
  }
  if (path === `${KOLAM_DARA_SEO_ROOT}/website`) {
    return 'website';
  }
  if (path === `${KOLAM_DARA_SEO_ROOT}/keywords`) {
    return 'keywords';
  }
  if (path === `${KOLAM_DARA_SEO_ROOT}/mentions`) {
    return 'mentions';
  }
  if (path === `${KOLAM_DARA_SEO_ROOT}/social-insights`) {
    return 'social-insights';
  }
  if (path === `${KOLAM_DARA_SEO_ROOT}/sentiment`) {
    return 'sentiment';
  }
  if (path === `${KOLAM_DARA_SEO_ROOT}/audit-logs`) {
    return 'audit-logs';
  }
  if (path === `${KOLAM_DARA_SEO_ROOT}/integrations`) {
    return 'integrations';
  }
  return 'dashboard';
}

export function buildKolamDaraSeoRoute(tab: KolamDaraSeoTabId) {
  const found = KOLAM_DARA_SEO_TABS.find(item => item.id === tab);
  return found?.href ?? KOLAM_DARA_SEO_ROOT;
}

export function formatKolamDaraSeoScoreStatus(score: number) {
  if (score >= 75) {
    return 'Excellent';
  }
  if (score >= 50) {
    return 'Cukup';
  }
  return 'Perlu Perbaikan';
}

export function formatKolamDaraSeoSentimentStatus(score: number) {
  if (score < 0) {
    return 'Negatif';
  }
  if (score >= 15) {
    return 'Positif';
  }
  return 'Netral';
}

export function normalizeKolamDaraSeoStatus(
  payload: unknown,
): KolamDaraSeoStatus {
  const root = asRecord(payload);
  const data = asRecord(
    root.data && typeof root.data === 'object' ? root.data : root,
  );
  return {
    seoEnabled: data.seoEnabled !== false,
  };
}

export function normalizeKolamDaraSeoBrands(payload: unknown): {
  brands: KolamDaraSeoBrand[];
  defaultBrandId: string;
} {
  const root = asRecord(payload);
  const data = asRecord(
    root.data && typeof root.data === 'object' ? root.data : root,
  );
  const brands = Array.isArray(data.brands)
    ? data.brands
        .map(item => {
          const row = asRecord(item);
          const id = String(row._id || row.id || '').trim();
          if (!id) {
            return null;
          }
          return {
            id,
            name:
              typeof row.name === 'string' && row.name.trim()
                ? row.name.trim()
                : id,
            productCount: toFiniteNumber(row.productCount),
            monitoringActive: row.monitoringActive === true,
          };
        })
        .filter((item): item is KolamDaraSeoBrand => item != null)
    : [];
  return {
    brands,
    defaultBrandId:
      typeof data.defaultBrandId === 'string' ? data.defaultBrandId : 'all',
  };
}

export function normalizeKolamDaraSeoDashboard(
  payload: unknown,
): KolamDaraSeoDashboard | null {
  const root = asRecord(payload);
  const data = asRecord(
    root.data && typeof root.data === 'object' ? root.data : root,
  );
  if (!Object.keys(data).length) {
    return null;
  }
  const growth = asRecord(data.growthInsights);
  return {
    seoScore: toFiniteNumber(data.seoScore),
    searchVisibility: toFiniteNumber(data.searchVisibility),
    brandReputationScore: toFiniteNumber(data.brandReputationScore),
    sentimentScore: toFiniteNumber(data.sentimentScore),
    pendingApprovals: toFiniteNumber(data.pendingApprovals),
    appliedChanges: toFiniteNumber(data.appliedChanges),
    negativeMentions: toFiniteNumber(data.negativeMentions),
    growthBullets: Array.isArray(growth.bullets)
      ? growth.bullets
          .filter((item): item is string => typeof item === 'string')
          .map(item => item.trim())
          .filter(Boolean)
      : [],
    needsOptimization: toFiniteNumber(growth.needsOptimization),
    keywordOpportunities: toFiniteNumber(growth.keywordOpportunities),
  };
}

export function formatKolamDaraSeoSuggestionStatus(
  status: KolamDaraSeoSuggestionStatus,
) {
  return SEO_STATUS_LABEL[String(status)] ?? String(status || '—');
}

/** SoT `seoWorkflowHint` — copy from plugin labels. */
export function formatKolamDaraSeoWorkflowHint(
  status: KolamDaraSeoSuggestionStatus,
  opts: {hasPendingItems: boolean; canDraft: boolean; canApprove: boolean},
) {
  const {hasPendingItems, canDraft, canApprove} = opts;
  switch (status) {
    case 'draft_ready':
      if (canDraft && hasPendingItems) {
        return 'Langkah 1: Kirim approval. Langkah 2: Owner/Admin approve & terapkan ke produk.';
      }
      if (!hasPendingItems) {
        return 'Tidak ada perubahan draft. Jalankan audit SEO ulang di halaman produk.';
      }
      return 'Menunggu staff marketing mengirim ke antrian approval.';
    case 'pending_approval':
      if (canApprove && hasPendingItems) {
        return 'Review perubahan di bawah, lalu Approve (terapkan) atau Tolak / Tunda.';
      }
      return 'Menunggu persetujuan admin.';
    case 'deferred':
      if (canApprove && hasPendingItems) {
        return 'Ditunda sebelumnya — masih bisa Approve jika siap diterapkan.';
      }
      if (!hasPendingItems) {
        return 'Ditunda tanpa draft. Klik «Buat draft SEO» lalu Approve & terapkan.';
      }
      return 'Ditunda. Tidak ada aksi wajib.';
    case 'applied':
    case 'approved':
      return canApprove
        ? 'Sudah diterapkan. Rollback mengembalikan nilai lama produk.'
        : 'Sudah diterapkan ke produk.';
    case 'rejected':
      return 'Ditolak. Buat audit SEO baru jika perlu saran lain.';
    case 'analyzed':
      return 'Hanya analisa skor — belum ada draft. Klik «Buat draft SEO» di bawah.';
    case 'rolled_back':
      return 'Perubahan sudah dikembalikan. Audit ulang untuk saran baru.';
    default:
      return '';
  }
}

export function resolveKolamDaraSeoTargetType(
  suggestion: Pick<
    KolamDaraSeoSuggestion,
    'targetType' | 'blogId' | 'speciesId' | 'productId'
  > & {targetType?: string},
): KolamDaraSeoTargetType {
  if (suggestion.targetType === 'website') {
    return 'website';
  }
  if (suggestion.targetType === 'blog' || suggestion.blogId) {
    return 'blog';
  }
  if (suggestion.targetType === 'species' || suggestion.speciesId) {
    return 'species';
  }
  return 'product';
}

export function formatKolamDaraSeoTargetBadge(
  targetType: KolamDaraSeoTargetType,
) {
  if (targetType === 'website') {
    return 'Website';
  }
  if (targetType === 'blog') {
    return 'Blog';
  }
  if (targetType === 'species') {
    return 'Livestock';
  }
  return 'Produk';
}

export function formatKolamDaraSeoApplySuccessLabel(
  targetType: KolamDaraSeoTargetType,
) {
  if (targetType === 'website') {
    return 'website';
  }
  if (targetType === 'blog') {
    return 'blog';
  }
  if (targetType === 'species') {
    return 'livestock';
  }
  return 'produk';
}

export function buildKolamDaraSeoEntityHref(
  suggestion: KolamDaraSeoSuggestion,
): string | null {
  const type = resolveKolamDaraSeoTargetType(suggestion);
  if (type === 'website') {
    return `${KOLAM_DARA_SEO_ROOT}/website`;
  }
  if (type === 'blog') {
    return suggestion.blogId
      ? `/blogs/${encodeURIComponent(suggestion.blogId)}`
      : null;
  }
  if (type === 'species') {
    return suggestion.speciesId
      ? `/species/${encodeURIComponent(suggestion.speciesId)}`
      : null;
  }
  return suggestion.productId
    ? `/products/${encodeURIComponent(suggestion.productId)}`
    : null;
}

export function isKolamDaraSeoApprovableStatus(
  status: KolamDaraSeoSuggestionStatus,
) {
  return (KOLAM_DARA_SEO_APPROVABLE_STATUSES as readonly string[]).includes(
    String(status),
  );
}

export function isKolamDaraSeoRejectableStatus(
  status: KolamDaraSeoSuggestionStatus,
) {
  return (KOLAM_DARA_SEO_REJECTABLE_STATUSES as readonly string[]).includes(
    String(status),
  );
}

export function isKolamDaraSeoReadyToApply(suggestion: KolamDaraSeoSuggestion) {
  return (
    isKolamDaraSeoApprovableStatus(suggestion.status) &&
    suggestion.pendingItemCount > 0
  );
}

/** Mirror FE `useDaraSeoAccess` with admin role + `ai-seo` permissions. */
export function resolveKolamDaraSeoAccess(input: {
  roleKey?: string | null;
  permissions?: KolamDaraSeoPermissionEntry[] | null;
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
  const can = (action: string) => {
    if (isAdmin) {
      return true;
    }
    const permissions = input.permissions;
    if (permissions == null) {
      return false;
    }
    const wanted = action.toLowerCase();
    return permissions.some(permission => {
      const resource = String(permission.resource ?? '')
        .trim()
        .toLowerCase();
      const actions = (permission.actions ?? []).map(item =>
        String(item).trim().toLowerCase(),
      );
      return (
        (resource === 'ai-seo' || resource === '*') &&
        (actions.includes(wanted) ||
          actions.includes('*') ||
          (wanted === 'view' && actions.length > 0))
      );
    });
  };
  return {
    canSee: isAdmin || can('view'),
    canDraft: isAdmin || can('draft'),
    canApprove: isAdmin || can('approve'),
  };
}

export function getKolamDaraSeoApprovalsFocusId(route: string) {
  const query = route.includes('?') ? route.split('?')[1] || '' : '';
  const params = new URLSearchParams(query);
  return String(params.get('id') || '').trim();
}

export function getKolamDaraSeoApprovalsFocusEntity(route: string): {
  productId: string;
  blogId: string;
  speciesId: string;
  target: KolamDaraSeoTargetTab | '';
} {
  const query = route.includes('?') ? route.split('?')[1] || '' : '';
  const params = new URLSearchParams(query);
  const target = String(params.get('target') || '').trim();
  return {
    productId: String(params.get('productId') || '').trim(),
    blogId: String(params.get('blogId') || '').trim(),
    speciesId: String(params.get('speciesId') || '').trim(),
    target: KOLAM_DARA_SEO_TARGET_TABS.some(tab => tab.id === target)
      ? (target as KolamDaraSeoTargetTab)
      : '',
  };
}

export function filterKolamDaraSeoSuggestions(
  list: KolamDaraSeoSuggestion[],
  opts: {
    targetTab: KolamDaraSeoTargetTab;
    statusFilter: KolamDaraSeoStatusFilterId;
    search: string;
  },
) {
  const q = opts.search.trim().toLowerCase();
  return list.filter(item => {
    if (
      opts.targetTab !== 'all' &&
      resolveKolamDaraSeoTargetType(item) !== opts.targetTab
    ) {
      return false;
    }
    if (opts.statusFilter === 'ready' && !isKolamDaraSeoReadyToApply(item)) {
      return false;
    }
    if (
      opts.statusFilter !== 'all' &&
      opts.statusFilter !== 'ready' &&
      item.status !== opts.statusFilter
    ) {
      return false;
    }
    if (q && !item.title.toLowerCase().includes(q)) {
      return false;
    }
    return true;
  });
}

export function paginateKolamDaraSeoSuggestions(
  list: KolamDaraSeoSuggestion[],
  page: number,
  pageSize = KOLAM_DARA_SEO_APPROVALS_PAGE_SIZE,
) {
  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    page: safePage,
    totalPages,
    total: list.length,
    items: list.slice(start, start + pageSize),
  };
}

export function formatKolamDaraSeoSuggestionValue(value: unknown) {
  if (value == null) {
    return '—';
  }
  if (typeof value === 'string') {
    return value;
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function normalizeKolamDaraSeoPendingSuggestions(
  payload: unknown,
): KolamDaraSeoPendingSuggestion[] {
  return normalizeKolamDaraSeoSuggestions(payload).map(item => ({
    id: item.id,
    targetType: item.targetType,
    title: item.title,
    seoScore: item.seoScore,
    status: item.status,
    summary: item.summary,
    pendingItemCount: item.pendingItemCount,
  }));
}

export function normalizeKolamDaraSeoSuggestions(
  payload: unknown,
): KolamDaraSeoSuggestion[] {
  const root = asRecord(payload);
  const data = asRecord(
    root.data && typeof root.data === 'object' ? root.data : root,
  );
  const items = Array.isArray(data.items)
    ? data.items
    : Array.isArray(data)
      ? data
      : [];
  return items
    .map(item => normalizeKolamDaraSeoSuggestionRow(item))
    .filter((item): item is KolamDaraSeoSuggestion => item != null);
}

export function normalizeKolamDaraSeoSuggestionDetail(
  payload: unknown,
): KolamDaraSeoSuggestionDetail | null {
  const root = asRecord(payload);
  const data = asRecord(
    root.data && typeof root.data === 'object' ? root.data : root,
  );
  const suggestion = normalizeKolamDaraSeoSuggestionRow(
    data.suggestion ?? data,
  );
  if (!suggestion) {
    return null;
  }
  const rawItems = Array.isArray(data.items) ? data.items : [];
  const items = rawItems
    .map(item => {
      const row = asRecord(item);
      const id = String(row._id || row.id || '').trim();
      if (!id) {
        return null;
      }
      return {
        id,
        fieldPath:
          typeof row.fieldPath === 'string' ? row.fieldPath.trim() : '',
        label:
          typeof row.label === 'string' && row.label.trim()
            ? row.label.trim()
            : 'Field',
        beforeValue: row.beforeValue,
        proposedValue: row.proposedValue,
        itemStatus:
          typeof row.itemStatus === 'string' ? row.itemStatus : '',
        rationale:
          typeof row.rationale === 'string' ? row.rationale.trim() : '',
      };
    })
    .filter((item): item is KolamDaraSeoSuggestionItem => item != null);
  return {suggestion, items};
}

export function normalizeKolamDaraSeoBulkActionResults(
  payload: unknown,
): KolamDaraSeoBulkActionResult[] {
  const root = asRecord(payload);
  const data = root.data ?? root;
  const rows = Array.isArray(data) ? data : [];
  return rows
    .map(item => {
      const row = asRecord(item);
      const id = String(row.id || row._id || '').trim();
      if (!id) {
        return null;
      }
      return {
        id,
        ok: row.ok === true,
        error:
          typeof row.error === 'string' && row.error.trim()
            ? row.error.trim()
            : undefined,
      };
    })
    .filter((item): item is KolamDaraSeoBulkActionResult => item != null);
}

function normalizeKolamDaraSeoSuggestionRow(
  value: unknown,
): KolamDaraSeoSuggestion | null {
  const row = asRecord(value);
  const id = String(row._id || row.id || '').trim();
  if (!id) {
    return null;
  }
  const productId = resolveRelatedId(row.productId);
  const blogId = resolveRelatedId(row.blogId);
  const speciesId = resolveRelatedId(row.speciesId);
  const targetType = resolveKolamDaraSeoTargetType({
    targetType:
      typeof row.targetType === 'string' ? row.targetType : undefined,
    productId,
    blogId,
    speciesId,
  });
  return {
    id,
    targetType,
    entityId:
      targetType === 'blog'
        ? blogId || ''
        : targetType === 'species'
          ? speciesId || ''
          : targetType === 'website'
            ? 'website'
            : productId || '',
    title: resolveSuggestionTitle(row, targetType),
    seoScore: toFiniteNumber(row.seoScore),
    status:
      typeof row.status === 'string' && row.status.trim()
        ? row.status.trim()
        : '',
    summary:
      typeof row.daraSummary === 'string'
        ? row.daraSummary.trim()
        : typeof row.approvalDialogText === 'string'
          ? row.approvalDialogText.trim()
          : '',
    pendingItemCount: toFiniteNumber(row.pendingItemCount),
    productId,
    blogId,
    speciesId,
  };
}

function resolveRelatedId(value: unknown) {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  const row = asRecord(value);
  const id = String(row._id || row.id || '').trim();
  return id || null;
}

function resolveSuggestionTitle(
  row: Record<string, unknown>,
  targetType: KolamDaraSeoTargetType,
) {
  if (targetType === 'website') {
    return 'Homepage website';
  }
  if (targetType === 'blog') {
    const blog = asRecord(row.blogId);
    if (typeof blog.title === 'string' && blog.title.trim()) {
      return blog.title.trim();
    }
    return 'Blog';
  }
  if (targetType === 'species') {
    const species = asRecord(row.speciesId);
    const name =
      (typeof species.displayName === 'string' && species.displayName.trim()) ||
      (typeof species.commonName === 'string' && species.commonName.trim()) ||
      (typeof species.localName === 'string' && species.localName.trim()) ||
      (typeof species.scientificName === 'string' &&
        species.scientificName.trim()) ||
      '';
    return name || 'Livestock';
  }
  const product = asRecord(row.productId);
  if (typeof product.name === 'string' && product.name.trim()) {
    return product.name.trim();
  }
  return 'Produk';
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function toFiniteNumber(value: unknown) {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}
