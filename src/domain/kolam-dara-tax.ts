/**
 * DARA Tax Inteligensi Pajak — dashboard payload types.
 * SoT: da-inventory-frontend `api/dara-tax` + plugin `tax-intelligence-dashboard`.
 */

import type {KolamDaraTaxPeriod} from './kolam-finance-tax';

export type KolamDaraTaxPpnSplit = {
  dpp: number;
  ppn: number;
  total: number;
};

export type KolamDaraTaxOverview = {
  period: string;
  sales: {
    orderCount: number;
    revenueIdr: number;
    ppnOutput: KolamDaraTaxPpnSplit;
  };
  purchases: {
    ppnInput: KolamDaraTaxPpnSplit;
  };
  commissionPph21: {
    grossIdr: number;
    withheldIdr: number;
  } | null;
  netPpnEstimate: number;
};

export type KolamDaraTaxRiskAlert = {
  code: string;
  title: string;
  message: string;
  severity: string;
};

export type KolamDaraTaxDeadline = {
  title: string;
  dueDate: string;
  taxType: string;
};

export type KolamDaraTaxDashboard = {
  period: string;
  overview: KolamDaraTaxOverview | null;
  complianceScores: Record<string, number>;
  complianceHighlights: string[];
  risks: {
    alerts: KolamDaraTaxRiskAlert[];
    count: number;
  };
  deadlines: KolamDaraTaxDeadline[];
  pendingRegulationDraftCount: number;
  draftReportCount: number;
};

export type KolamDaraTaxOverviewSeries = {
  months: number;
  ppnOutputByMonth: Array<{
    period: string;
    orderCount: number;
    ppnIdr: number;
  }>;
};

/** FE `COMPLIANCE_LABELS`. */
export const KOLAM_DARA_TAX_COMPLIANCE_LABELS: Array<{
  key: string;
  label: string;
}> = [
  {key: 'invoiceCompleteness', label: 'Kelengkapan invoice'},
  {key: 'taxInvoiceCompleteness', label: 'Faktur pajak'},
  {key: 'documentCompleteness', label: 'Dokumen'},
  {key: 'vatCompliance', label: 'PPN / PKP'},
  {key: 'pphCompliance', label: 'PPh'},
  {key: 'umkmCompliance', label: 'UMKM'},
  {key: 'supplierCompleteness', label: 'NPWP supplier'},
  {key: 'customerCompleteness', label: 'NPWP customer'},
];

export function formatKolamDaraTaxIdr(value?: number | null) {
  if (value == null || !Number.isFinite(value)) {
    return '—';
  }
  return `Rp ${Math.round(value).toLocaleString('id-ID')}`;
}

export function formatKolamDaraTaxDateId(iso?: string | null) {
  if (!iso) {
    return '—';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function normalizeKolamDaraTaxDashboard(
  payload: unknown,
): KolamDaraTaxDashboard {
  const data = unwrapDataRecord(payload);
  const overviewRaw = asRecord(data.overview);
  const sales = asRecord(overviewRaw.sales);
  const purchases = asRecord(overviewRaw.purchases);
  const commission = asRecord(overviewRaw.commissionPph21);
  const compliance = asRecord(data.compliance);
  const scoresRaw = asRecord(compliance.scores);
  const risksRaw = asRecord(data.risks);
  const alertsRaw = Array.isArray(risksRaw.alerts) ? risksRaw.alerts : [];
  const deadlinesRaw = Array.isArray(data.deadlines) ? data.deadlines : [];
  const draftReports = Array.isArray(data.draftReports) ? data.draftReports : [];
  const regulationDrafts = Array.isArray(data.regulationDrafts)
    ? data.regulationDrafts
    : [];

  const hasOverview = Object.keys(overviewRaw).length > 0;

  return {
    period: String(data.period || overviewRaw.period || '').trim(),
    overview: hasOverview
      ? {
          period: String(overviewRaw.period || '').trim(),
          sales: {
            orderCount: asNumber(sales.orderCount),
            revenueIdr: asNumber(sales.revenueIdr),
            ppnOutput: asPpnSplit(sales.ppnOutput),
          },
          purchases: {
            ppnInput: asPpnSplit(purchases.ppnInput),
          },
          commissionPph21:
            Object.keys(commission).length > 0
              ? {
                  grossIdr: asNumber(commission.grossIdr),
                  withheldIdr: asNumber(commission.withheldIdr),
                }
              : null,
          netPpnEstimate: asNumber(overviewRaw.netPpnEstimate),
        }
      : null,
    complianceScores: Object.fromEntries(
      Object.entries(scoresRaw).map(([key, value]) => [key, asNumber(value)]),
    ),
    complianceHighlights: Array.isArray(compliance.highlights)
      ? compliance.highlights
          .map(item => String(item || '').trim())
          .filter(Boolean)
      : [],
    risks: {
      alerts: alertsRaw
        .map(item => {
          const row = asRecord(item);
          const title = String(row.title || '').trim();
          if (!title) {
            return null;
          }
          return {
            code: String(row.code || '').trim(),
            title,
            message: String(row.message || '').trim(),
            severity: String(row.severity || '').trim() || 'low',
          };
        })
        .filter((row): row is KolamDaraTaxRiskAlert => row != null),
      count: asNumber(risksRaw.count),
    },
    deadlines: deadlinesRaw
      .map(item => {
        const row = asRecord(item);
        const title = String(row.title || '').trim();
        if (!title) {
          return null;
        }
        return {
          title,
          dueDate: String(row.dueDate || '').trim(),
          taxType: String(row.taxType || '').trim(),
        };
      })
      .filter((row): row is KolamDaraTaxDeadline => row != null),
    pendingRegulationDraftCount: regulationDrafts.filter(item => {
      const row = asRecord(item);
      return String(row.status || '').trim() === 'pending_review';
    }).length,
    draftReportCount: draftReports.length,
  };
}

export function normalizeKolamDaraTaxOverviewSeries(
  payload: unknown,
): KolamDaraTaxOverviewSeries {
  const data = unwrapDataRecord(payload);
  const rows = Array.isArray(data.ppnOutputByMonth)
    ? data.ppnOutputByMonth
    : [];
  return {
    months: asNumber(data.months) || 6,
    ppnOutputByMonth: rows
      .map(item => {
        const row = asRecord(item);
        const period = String(row.period || '').trim();
        if (!period) {
          return null;
        }
        return {
          period,
          orderCount: asNumber(row.orderCount),
          ppnIdr: asNumber(row.ppnIdr),
        };
      })
      .filter(
        (
          row,
        ): row is {
          period: string;
          orderCount: number;
          ppnIdr: number;
        } => row != null,
      ),
  };
}

export type {KolamDaraTaxPeriod};

function asPpnSplit(value: unknown): KolamDaraTaxPpnSplit {
  const row = asRecord(value);
  return {
    dpp: asNumber(row.dpp),
    ppn: asNumber(row.ppn),
    total: asNumber(row.total),
  };
}

function asNumber(value: unknown) {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function unwrapDataRecord(payload: unknown): Record<string, unknown> {
  const root = asRecord(payload);
  if (root.data && typeof root.data === 'object' && !Array.isArray(root.data)) {
    return root.data as Record<string, unknown>;
  }
  return root;
}
