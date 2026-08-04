/**
 * DARA Market Intel — Platform fee (Peralatan).
 * SoT: DA-Dara-Plugin platform-fee-api + PlatformFeeMonitorPanel / KalkulasiTab.
 */

export type KolamDaraMarketPlatformId = 'shopee' | 'tokopedia';

export type KolamDaraMarketPlatformFeePrograms = {
  promoXtra?: boolean;
  gratisOngkirXtra?: boolean;
  shopeeLiveXtra?: boolean;
  growthXtra?: boolean;
  gmvMax?: boolean;
  gmvMaxSpendGte3Pct?: boolean;
  [key: string]: boolean | undefined;
};

export type KolamDaraMarketPlatformFeeProfile = {
  id: string;
  platform: KolamDaraMarketPlatformId;
  sellerTier: string;
  programs: KolamDaraMarketPlatformFeePrograms;
  primaryCategoryId: string;
  primaryCategoryLabel: string;
  notes: string;
};

export type KolamDaraMarketPlatformFeeSource = {
  id: string;
  name: string;
  url: string;
  platform: KolamDaraMarketPlatformId;
  sourceKind: string;
  isActive: boolean;
  lastCheckedAt: string;
  lastChangedAt: string;
  lastError: string;
};

export type KolamDaraMarketPlatformFeeItem = {
  code: string;
  name: string;
  type: 'percentage' | 'fixed' | string;
  value: number;
  capIdr: number | null;
  perUnit: string;
  conditions: string;
  confidence: number | null;
  evidence: string;
};

export type KolamDaraMarketPlatformFeeSnapshot = {
  id: string;
  platform: KolamDaraMarketPlatformId;
  status: string;
  diffSummary: string;
  mappedFees: KolamDaraMarketPlatformFeeItem[];
  aiSummary: string;
  createdAt: string;
  sourceName: string;
  sourceUrl: string;
};

export type KolamDaraMarketPlatformFeeMeta = {
  sellerTiers: Array<{id: string; label: string}>;
  programs: Record<
    string,
    Array<{id: string; label: string}>
  >;
  categories: Record<
    string,
    Array<{id: string; label: string}>
  >;
};

export type KolamDaraMarketPlatformFeeSummary = {
  generatedAt: string;
  pendingSnapshotCount: number;
};

export type KolamDaraMarketPlatformFeeCheckResult = {
  changed: boolean;
  error: string;
  aiPending: boolean;
  reason: string;
};

export type KolamDaraMarketPlatformFeeCalcLine = {
  code: string;
  name: string;
  type: string;
  value: number;
  rateDisplay: string;
  basisFormula: string;
  conditions: string;
  sourceName: string;
  sourceUrl: string;
  snapshotStatus: string;
  appliesToProfile: boolean;
};

export type KolamDaraMarketPlatformFeeCalcSampleRow = {
  name: string;
  rateDisplay: string;
  calcFormula: string;
  amountIdr: number | null;
  sourceName: string;
  snapshotStatus: string;
  skipped: boolean;
  skipReason: string;
};

export type KolamDaraMarketPlatformFeeCalcPlatform = {
  platform: KolamDaraMarketPlatformId;
  tier: string;
  category: string;
  hasApprovedBaseline: boolean;
  emptyHint: string;
  activeLines: KolamDaraMarketPlatformFeeCalcLine[];
  sampleInput: {
    price: number;
    discount: number;
    qty: number;
    subtotalAfterDiscount: number;
  };
  sampleRows: KolamDaraMarketPlatformFeeCalcSampleRow[];
  totalFeeIdr: number;
  netAfterFeesIdr: number;
  disclaimer: string;
  settlement: {
    windowDays: number;
    orderCount: number;
    totalFeesIdr: number;
    totalGrossIdr: number;
    effectivePercent: number;
    note: string;
  } | null;
  sourceGroups: Array<{
    sourceName: string;
    sourceUrl: string;
    snapshotStatus: string;
    lineCount: number;
    lines: KolamDaraMarketPlatformFeeCalcLine[];
  }>;
};

export type KolamDaraMarketPlatformFeeCalculation = {
  generatedAt: string;
  platforms: KolamDaraMarketPlatformFeeCalcPlatform[];
};

export type KolamDaraMarketPlatformFeePanelTab = 'monitor' | 'kalkulasi';

export function formatKolamDaraMarketPlatformFeeIdr(value?: number | null) {
  if (value == null || !Number.isFinite(value)) {
    return '—';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatKolamDaraMarketPlatformFeeCheckedAt(iso?: string | null) {
  if (!iso) {
    return '—';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleString('id-ID');
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function unwrapData(payload: unknown): unknown {
  const root = asRecord(payload);
  if ('data' in root) {
    return root.data;
  }
  return payload;
}

function toFiniteNumber(value: unknown) {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function nullableNumber(value: unknown): number | null {
  if (value == null || value === '') {
    return null;
  }
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function asPlatformId(value: unknown): KolamDaraMarketPlatformId {
  return String(value || '').toLowerCase() === 'tokopedia'
    ? 'tokopedia'
    : 'shopee';
}

function normalizeIdLabelList(value: unknown): Array<{id: string; label: string}> {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => {
      const row = asRecord(item);
      const id = String(row.id || '').trim();
      if (!id) {
        return null;
      }
      return {
        id,
        label: String(row.label || '').trim() || id,
      };
    })
    .filter((item): item is {id: string; label: string} => item != null);
}

function normalizeProgramsMap(
  value: unknown,
): Record<string, Array<{id: string; label: string}>> {
  const row = asRecord(value);
  const out: Record<string, Array<{id: string; label: string}>> = {};
  for (const [key, list] of Object.entries(row)) {
    out[key] = normalizeIdLabelList(list);
  }
  return out;
}

export function normalizeKolamDaraMarketPlatformFeeMeta(
  payload: unknown,
): KolamDaraMarketPlatformFeeMeta {
  const data = asRecord(unwrapData(payload));
  return {
    sellerTiers: normalizeIdLabelList(data.sellerTiers),
    programs: normalizeProgramsMap(data.programs),
    categories: normalizeProgramsMap(data.categories),
  };
}

export function normalizeKolamDaraMarketPlatformFeeProfiles(
  payload: unknown,
): KolamDaraMarketPlatformFeeProfile[] {
  const data = unwrapData(payload);
  const list = Array.isArray(data) ? data : [];
  return list
    .map(item => {
      const row = asRecord(item);
      const platform = asPlatformId(row.platform);
      const programsRaw = asRecord(row.programs);
      const programs: KolamDaraMarketPlatformFeePrograms = {};
      for (const [key, value] of Object.entries(programsRaw)) {
        programs[key] = value === true;
      }
      return {
        id: String(row._id || row.id || platform).trim(),
        platform,
        sellerTier: String(row.sellerTier || 'non_star').trim() || 'non_star',
        programs,
        primaryCategoryId: String(row.primaryCategoryId || '').trim(),
        primaryCategoryLabel: String(row.primaryCategoryLabel || '').trim(),
        notes: String(row.notes || '').trim(),
      } satisfies KolamDaraMarketPlatformFeeProfile;
    })
    .filter(item => Boolean(item.platform));
}

export function normalizeKolamDaraMarketPlatformFeeSources(
  payload: unknown,
): KolamDaraMarketPlatformFeeSource[] {
  const data = unwrapData(payload);
  const list = Array.isArray(data) ? data : [];
  return list
    .map(item => {
      const row = asRecord(item);
      const id = String(row._id || row.id || '').trim();
      if (!id) {
        return null;
      }
      return {
        id,
        name: String(row.name || '').trim() || id,
        url: String(row.url || '').trim(),
        platform: asPlatformId(row.platform),
        sourceKind: String(row.sourceKind || '').trim(),
        isActive: row.isActive !== false,
        lastCheckedAt: String(row.lastCheckedAt || '').trim(),
        lastChangedAt: String(row.lastChangedAt || '').trim(),
        lastError: String(row.lastError || '').trim(),
      } satisfies KolamDaraMarketPlatformFeeSource;
    })
    .filter((item): item is KolamDaraMarketPlatformFeeSource => item != null);
}

function normalizeFeeItems(value: unknown): KolamDaraMarketPlatformFeeItem[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map(item => {
    const row = asRecord(item);
    return {
      code: String(row.code || '').trim(),
      name: String(row.name || '').trim() || 'Fee',
      type: String(row.type || 'percentage').trim() || 'percentage',
      value: toFiniteNumber(row.value),
      capIdr: nullableNumber(row.capIdr),
      perUnit: String(row.perUnit || '').trim(),
      conditions: String(row.conditions || '').trim(),
      confidence: nullableNumber(row.confidence),
      evidence: String(row.evidence || '').trim(),
    };
  });
}

export function normalizeKolamDaraMarketPlatformFeeSnapshots(
  payload: unknown,
): KolamDaraMarketPlatformFeeSnapshot[] {
  const data = unwrapData(payload);
  const list = Array.isArray(data) ? data : [];
  return list
    .map(item => {
      const row = asRecord(item);
      const id = String(row._id || row.id || '').trim();
      if (!id) {
        return null;
      }
      const source = asRecord(row.sourceId);
      return {
        id,
        platform: asPlatformId(row.platform),
        status: String(row.status || '').trim(),
        diffSummary: String(row.diffSummary || '').trim(),
        mappedFees: normalizeFeeItems(row.mappedFees),
        aiSummary: String(row.aiSummary || '').trim(),
        createdAt: String(row.createdAt || '').trim(),
        sourceName: String(source.name || row.platform || '').trim(),
        sourceUrl: String(source.url || '').trim(),
      } satisfies KolamDaraMarketPlatformFeeSnapshot;
    })
    .filter(
      (item): item is KolamDaraMarketPlatformFeeSnapshot => item != null,
    );
}

export function normalizeKolamDaraMarketPlatformFeeSummary(
  payload: unknown,
): KolamDaraMarketPlatformFeeSummary {
  const data = asRecord(unwrapData(payload));
  return {
    generatedAt: String(data.generatedAt || '').trim(),
    pendingSnapshotCount: toFiniteNumber(data.pendingSnapshotCount),
  };
}

export function normalizeKolamDaraMarketPlatformFeeCheckResult(
  payload: unknown,
): KolamDaraMarketPlatformFeeCheckResult {
  const data = asRecord(unwrapData(payload));
  return {
    changed: data.changed === true,
    error: String(data.error || '').trim(),
    aiPending: data.aiPending === true,
    reason: String(data.reason || '').trim(),
  };
}

function normalizeCalcLines(
  value: unknown,
): KolamDaraMarketPlatformFeeCalcLine[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map(item => {
    const row = asRecord(item);
    return {
      code: String(row.code || '').trim(),
      name: String(row.name || '').trim() || 'Fee',
      type: String(row.type || '').trim(),
      value: toFiniteNumber(row.value),
      rateDisplay: String(row.rateDisplay || '').trim(),
      basisFormula: String(row.basisFormula || '').trim(),
      conditions: String(row.conditions || '').trim(),
      sourceName: String(row.sourceName || '').trim(),
      sourceUrl: String(row.sourceUrl || '').trim(),
      snapshotStatus: String(row.snapshotStatus || '').trim(),
      appliesToProfile: row.appliesToProfile !== false,
    };
  });
}

export function normalizeKolamDaraMarketPlatformFeeCalculation(
  payload: unknown,
): KolamDaraMarketPlatformFeeCalculation {
  const data = asRecord(unwrapData(payload));
  const platformsRaw = Array.isArray(data.platforms) ? data.platforms : [];
  return {
    generatedAt: String(data.generatedAt || '').trim(),
    platforms: platformsRaw.map(item => {
      const row = asRecord(item);
      const profile = asRecord(row.profileSummary);
      const sample = asRecord(row.sampleCalculation);
      const input = asRecord(sample.input);
      const settlementRaw = row.settlementReal;
      const settlement =
        settlementRaw &&
        typeof settlementRaw === 'object' &&
        !Array.isArray(settlementRaw)
          ? asRecord(settlementRaw)
          : null;
      const groups = Array.isArray(row.sourceGroups) ? row.sourceGroups : [];
      return {
        platform: asPlatformId(row.platform),
        tier: String(profile.tier || '').trim(),
        category: String(profile.category || '').trim(),
        hasApprovedBaseline: row.hasApprovedBaseline === true,
        emptyHint: String(row.emptyHint || '').trim(),
        activeLines: normalizeCalcLines(row.activeLines),
        sampleInput: {
          price: toFiniteNumber(input.price),
          discount: toFiniteNumber(input.discount),
          qty: toFiniteNumber(input.qty) || 1,
          subtotalAfterDiscount: toFiniteNumber(input.subtotalAfterDiscount),
        },
        sampleRows: Array.isArray(sample.rows)
          ? sample.rows.map(sampleRow => {
              const r = asRecord(sampleRow);
              return {
                name: String(r.name || '').trim(),
                rateDisplay: String(r.rateDisplay || '').trim(),
                calcFormula: String(r.calcFormula || '').trim(),
                amountIdr: nullableNumber(r.amountIdr),
                sourceName: String(r.sourceName || '').trim(),
                snapshotStatus: String(r.snapshotStatus || '').trim(),
                skipped: r.skipped === true,
                skipReason: String(r.skipReason || '').trim(),
              };
            })
          : [],
        totalFeeIdr: toFiniteNumber(sample.totalFeeIdr),
        netAfterFeesIdr: toFiniteNumber(sample.netAfterFeesIdr),
        disclaimer: String(sample.disclaimer || '').trim(),
        settlement: settlement
          ? {
              windowDays: toFiniteNumber(settlement.windowDays),
              orderCount: toFiniteNumber(settlement.orderCount),
              totalFeesIdr: toFiniteNumber(settlement.totalFeesIdr),
              totalGrossIdr: toFiniteNumber(settlement.totalGrossIdr),
              effectivePercent: toFiniteNumber(settlement.effectivePercent),
              note: String(settlement.note || '').trim(),
            }
          : null,
        sourceGroups: groups.map(groupItem => {
          const g = asRecord(groupItem);
          return {
            sourceName: String(g.sourceName || '').trim(),
            sourceUrl: String(g.sourceUrl || '').trim(),
            snapshotStatus: String(g.snapshotStatus || '').trim(),
            lineCount: toFiniteNumber(g.lineCount),
            lines: normalizeCalcLines(g.lines),
          };
        }),
      } satisfies KolamDaraMarketPlatformFeeCalcPlatform;
    }),
  };
}

/** FE toast copy after single-source check. */
export function formatKolamDaraMarketPlatformFeeCheckNotice(
  result: KolamDaraMarketPlatformFeeCheckResult,
  sourceName: string,
) {
  if (result.error) {
    return result.error;
  }
  if (result.changed && result.reason === 'remap_no_approved_baseline') {
    return `${sourceName}: draft baru (konten sama — mapping diperbarui)`;
  }
  if (result.aiPending) {
    return `${sourceName}: scan OK — tarif rules tampil, AI mapping ~1 menit (refresh draft)`;
  }
  if (result.changed) {
    return `${sourceName}: perubahan terdeteksi — draft AI dibuat`;
  }
  return `${sourceName}: tidak ada perubahan`;
}
