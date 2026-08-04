/**
 * Pusat AI hub (plugin DARA).
 * SoT: FE `MarketingHubDashboard` tabs + `MarketingHubPanel` ringkasan
 * + BE `GET /dara-seo/marketing-hub`.
 */

export const KOLAM_PUSAT_AI_ROOT = '/pusat-ai';
export const KOLAM_PUSAT_AI_MARKETING_LEGACY = '/campaign/dara-marketing';
export const KOLAM_PUSAT_AI_JOBS_LEGACY = '/campaign/dara-jobs';

export type KolamPusatAiHubTabId =
  | 'ringkasan'
  | 'owner-copilot'
  | 'log-dara'
  | 'transaksi-copilot'
  | 'po-copilot'
  | 'inventory-copilot';

/** Includes unresolved query tabs as `other`. */
export type KolamPusatAiHubTab = KolamPusatAiHubTabId | 'other';

export const KOLAM_PUSAT_AI_HUB_TABS: Array<{
  id: KolamPusatAiHubTabId;
  label: string;
  adminOnly: boolean;
}> = [
  {id: 'ringkasan', label: 'Ringkasan', adminOnly: false},
  {id: 'owner-copilot', label: 'Owner Copilot', adminOnly: true},
  {id: 'log-dara', label: 'Log DARA', adminOnly: true},
  {id: 'transaksi-copilot', label: 'Transaksi Copilot', adminOnly: true},
  {id: 'po-copilot', label: 'PO Copilot', adminOnly: true},
  {id: 'inventory-copilot', label: 'Inventory Copilot', adminOnly: true},
];

export type KolamDaraActiveBrand = {
  id: string;
  name: string;
  productCount: number;
  monitoringActive: boolean;
};

export type KolamDaraMarketingHubSummary = {
  generatedAt: string;
  seo: {
    seoScore: number;
    pendingApprovals: number;
    negativeMentions: number;
    keywordCount: number;
  } | null;
  market: {
    pendingApprovals: number;
    tooCheap: number;
    tooExpensive: number;
    lowMargin: number;
  };
  integrations: {
    serpConfigured: boolean;
    searxngReachable: boolean;
    searxngUrl?: string;
  };
  serpSnapshotsStored: number;
  quickLinks: Array<{href: string; label: string}>;
  brands: KolamDaraActiveBrand[];
  selectedBrandId: string;
};

export function normalizeKolamPusatAiPath(route: string) {
  const path = route.trim().split('?')[0] || '';
  if (!path) {
    return '';
  }
  return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
}

export function getKolamPusatAiHubTab(route: string): KolamPusatAiHubTab {
  const path = normalizeKolamPusatAiPath(route);
  if (path === KOLAM_PUSAT_AI_MARKETING_LEGACY) {
    return 'ringkasan';
  }
  if (path === KOLAM_PUSAT_AI_JOBS_LEGACY) {
    return 'ringkasan';
  }
  if (path !== KOLAM_PUSAT_AI_ROOT) {
    return 'other';
  }

  const queryIndex = route.indexOf('?');
  if (queryIndex < 0) {
    return 'ringkasan';
  }

  const params = new URLSearchParams(route.slice(queryIndex + 1));
  const raw = (params.get('tab') || '').trim().toLowerCase();
  if (!raw || raw === 'ringkasan' || raw === 'proses') {
    return 'ringkasan';
  }
  if (raw === 'owner-copilot') {
    return 'owner-copilot';
  }
  if (raw === 'log-dara') {
    return 'log-dara';
  }
  if (
    raw === 'transaksi-copilot' ||
    raw === 'shipping-copilot' ||
    raw === 'marketplace-copilot' ||
    raw === 'packing-copilot'
  ) {
    return 'transaksi-copilot';
  }
  if (
    raw === 'po-copilot' ||
    raw === 'receiving-copilot' ||
    raw === 'procurement-copilot' ||
    raw === 'supplier-copilot'
  ) {
    return 'po-copilot';
  }
  if (raw === 'inventory-copilot' || raw === 'warehouse-copilot') {
    return 'inventory-copilot';
  }
  return 'other';
}

export function buildKolamPusatAiHubRoute(tab: KolamPusatAiHubTabId) {
  if (tab === 'ringkasan') {
    return KOLAM_PUSAT_AI_ROOT;
  }
  return `${KOLAM_PUSAT_AI_ROOT}?tab=${tab}`;
}

export function filterKolamPusatAiHubTabs(isAdmin: boolean) {
  return KOLAM_PUSAT_AI_HUB_TABS.filter(tab => isAdmin || !tab.adminOnly);
}

/** Native Pusat AI hub (all known tabs + legacy marketing/jobs URLs). */
export function isKolamPusatAiHubRoute(route: string) {
  return getKolamPusatAiHubTab(route) !== 'other';
}

/** @deprecated Prefer isKolamPusatAiHubRoute */
export function isKolamPusatAiRingkasanRoute(route: string) {
  return getKolamPusatAiHubTab(route) === 'ringkasan';
}

export function normalizeKolamPusatAiQuickLinkHref(href: string) {
  if (href === '/campaign/dara-jobs') {
    return KOLAM_PUSAT_AI_ROOT;
  }
  return href;
}

/** Jobs history lives on Ringkasan — drop dedicated jobs quick link. */
export function filterKolamPusatAiRingkasanQuickLinks(
  links: Array<{href: string; label: string}>,
) {
  return links
    .filter(item => item.href !== '/campaign/dara-jobs')
    .map(item => ({
      ...item,
      href: normalizeKolamPusatAiQuickLinkHref(item.href),
    }));
}

export function normalizeKolamDaraMarketingHub(
  payload: unknown,
): KolamDaraMarketingHubSummary {
  const root = asRecord(payload);
  const data = asRecord(
    root.data && typeof root.data === 'object' ? root.data : root,
  );

  const seoRaw = data.seo;
  const seo =
    seoRaw && typeof seoRaw === 'object'
      ? {
          seoScore: toFiniteNumber(asRecord(seoRaw).seoScore),
          pendingApprovals: toFiniteNumber(asRecord(seoRaw).pendingApprovals),
          negativeMentions: toFiniteNumber(asRecord(seoRaw).negativeMentions),
          keywordCount: toFiniteNumber(asRecord(seoRaw).keywordCount),
        }
      : null;

  const marketRaw = asRecord(data.market);
  const integrationsRaw = asRecord(data.integrations);
  const brandsRaw = Array.isArray(data.brands) ? data.brands : [];

  const quickLinksRaw = Array.isArray(data.quickLinks) ? data.quickLinks : [];
  const quickLinks = quickLinksRaw
    .map(item => {
      const row = asRecord(item);
      const href = typeof row.href === 'string' ? row.href.trim() : '';
      const label = typeof row.label === 'string' ? row.label.trim() : '';
      if (!href || !label) {
        return null;
      }
      return {href, label};
    })
    .filter((item): item is {href: string; label: string} => item != null);

  return {
    generatedAt:
      typeof data.generatedAt === 'string' ? data.generatedAt : '',
    seo,
    market: {
      pendingApprovals: toFiniteNumber(marketRaw.pendingApprovals),
      tooCheap: toFiniteNumber(marketRaw.tooCheap),
      tooExpensive: toFiniteNumber(marketRaw.tooExpensive),
      lowMargin: toFiniteNumber(marketRaw.lowMargin),
    },
    integrations: {
      serpConfigured: Boolean(integrationsRaw.serpConfigured),
      searxngReachable: Boolean(integrationsRaw.searxngReachable),
      searxngUrl:
        typeof integrationsRaw.searxngUrl === 'string'
          ? integrationsRaw.searxngUrl
          : undefined,
    },
    serpSnapshotsStored: toFiniteNumber(data.serpSnapshotsStored),
    quickLinks,
    brands: brandsRaw
      .map(item => {
        const row = asRecord(item);
        const id =
          (typeof row._id === 'string' && row._id) ||
          (typeof row.id === 'string' && row.id) ||
          '';
        const name = typeof row.name === 'string' ? row.name.trim() : '';
        if (!id || !name) {
          return null;
        }
        return {
          id,
          name,
          productCount: toFiniteNumber(row.productCount),
          monitoringActive: Boolean(row.monitoringActive),
        };
      })
      .filter((item): item is KolamDaraActiveBrand => item != null),
    selectedBrandId:
      typeof data.selectedBrandId === 'string' && data.selectedBrandId
        ? data.selectedBrandId
        : 'all',
  };
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
