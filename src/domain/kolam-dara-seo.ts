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

export function normalizeKolamDaraSeoPendingSuggestions(
  payload: unknown,
): KolamDaraSeoPendingSuggestion[] {
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
    .map(item => {
      const row = asRecord(item);
      const id = String(row._id || row.id || '').trim();
      if (!id) {
        return null;
      }
      return {
        id,
        targetType:
          typeof row.targetType === 'string' ? row.targetType : 'product',
        title: resolveSuggestionTitle(row),
        seoScore: toFiniteNumber(row.seoScore),
        status: typeof row.status === 'string' ? row.status : '',
        summary:
          typeof row.daraSummary === 'string'
            ? row.daraSummary.trim()
            : typeof row.approvalDialogText === 'string'
              ? row.approvalDialogText.trim()
              : '',
        pendingItemCount: toFiniteNumber(row.pendingItemCount),
      };
    })
    .filter((item): item is KolamDaraSeoPendingSuggestion => item != null);
}

function resolveSuggestionTitle(row: Record<string, unknown>) {
  const product = asRecord(row.productId);
  if (typeof product.name === 'string' && product.name.trim()) {
    return product.name.trim();
  }
  if (typeof row.productId === 'string' && row.productId.trim()) {
    return row.productId.trim();
  }
  const blog = asRecord(row.blogId);
  if (typeof blog.title === 'string' && blog.title.trim()) {
    return blog.title.trim();
  }
  const species = asRecord(row.speciesId);
  if (typeof species.scientificName === 'string' && species.scientificName.trim()) {
    return species.scientificName.trim();
  }
  if (typeof species.commonName === 'string' && species.commonName.trim()) {
    return species.commonName.trim();
  }
  if (row.targetType === 'website') {
    return 'Website';
  }
  return 'Usulan SEO';
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
