/**
 * DARA Tax Inteligensi Pajak — dashboard payload types.
 * SoT: da-inventory-frontend `api/dara-tax` + plugin `tax-intelligence-dashboard`.
 */

import type {KolamDaraTaxPeriod} from './kolam-finance-tax';
import {formatRupiah} from '../lib/money';

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

export type KolamDaraTaxDraftReport = {
  id: string;
  title: string;
  status: string;
  reportType: string;
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
  draftReports: KolamDaraTaxDraftReport[];
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

export type KolamDaraTaxAllocationBySource = {
  period: string;
  disclaimer: string;
  bySource: Array<{
    sourceId: string;
    sourceName: string;
    sourceType: string;
    orderCount: number;
    dppIdr: number;
    ppnOutputIdr: number;
  }>;
  totals: {
    orderCount: number;
    dppIdr: number;
    ppnOutputIdr: number;
  };
};

export type KolamDaraTaxJournalPreview = {
  period: string;
  disclaimer: string;
  balanced: boolean;
  totals: {
    debitIdr: number;
    creditIdr: number;
  };
  lines: Array<{
    accountCode: string;
    accountLabel: string;
    debitIdr: number;
    creditIdr: number;
    memo: string;
    informational: boolean;
  }>;
};

export type KolamDaraTaxSptPpnMasaPreview = {
  period: string;
  formType: string;
  formReference: string;
  disclaimer: string;
  generatedAt: string;
  taxpayer: {
    companyName: string;
    legalName: string;
    npwp: string;
    isPkp: boolean;
    address: string;
  };
  summary: {
    ppnKeluaranIdr: number;
    ppnMasukanIdr: number;
    ppnTerutangIdr: number;
    ppnLebihBayarIdr: number;
    netPpnIdr: number;
  };
  lines: Array<{label: string; dppIdr: number; ppnIdr: number}>;
  /** Raw payload for JSON copy (FE unduh file). */
  raw: Record<string, unknown>;
};

export type KolamDaraTaxMissingFakturSale = {
  id: string;
  invoiceCode: string;
  finalTotal: number;
  fakturStatus: string;
};

export type KolamDaraTaxMissingFakturPo = {
  id: string;
  poCode: string;
  vendorName: string;
  finalTotal: number;
  fakturStatus: string;
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
  return formatRupiah(value);
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
  const normalizedDraftReports = draftReports
    .map(item => {
      const row = asRecord(item);
      const id = String(row._id || row.id || '').trim();
      if (!id) {
        return null;
      }
      return {
        id,
        title: String(row.title || '').trim() || id,
        status: String(row.status || '').trim(),
        reportType: String(row.reportType || '').trim(),
      };
    })
    .filter((row): row is KolamDaraTaxDraftReport => row != null);

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
    draftReports: normalizedDraftReports,
    draftReportCount: normalizedDraftReports.length,
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

export function normalizeKolamDaraTaxAllocationBySource(
  payload: unknown,
): KolamDaraTaxAllocationBySource {
  const data = unwrapDataRecord(payload);
  const bySourceRaw = Array.isArray(data.bySource) ? data.bySource : [];
  const totals = asRecord(data.totals);
  return {
    period: String(data.period || '').trim(),
    disclaimer: String(data.disclaimer || '').trim(),
    bySource: bySourceRaw
      .map(item => {
        const row = asRecord(item);
        return {
          sourceId: String(row.sourceId || '').trim(),
          sourceName: String(row.sourceName || '').trim() || '—',
          sourceType: String(row.sourceType || '').trim(),
          orderCount: asNumber(row.orderCount),
          dppIdr: asNumber(row.dppIdr),
          ppnOutputIdr: asNumber(row.ppnOutputIdr),
        };
      })
      .filter(row => row.sourceName !== '—' || row.orderCount > 0),
    totals: {
      orderCount: asNumber(totals.orderCount),
      dppIdr: asNumber(totals.dppIdr),
      ppnOutputIdr: asNumber(totals.ppnOutputIdr),
    },
  };
}

export function normalizeKolamDaraTaxJournalPreview(
  payload: unknown,
): KolamDaraTaxJournalPreview {
  const data = unwrapDataRecord(payload);
  const totals = asRecord(data.totals);
  const linesRaw = Array.isArray(data.lines) ? data.lines : [];
  return {
    period: String(data.period || '').trim(),
    disclaimer: String(data.disclaimer || '').trim(),
    balanced: data.balanced === true,
    totals: {
      debitIdr: asNumber(totals.debitIdr),
      creditIdr: asNumber(totals.creditIdr),
    },
    lines: linesRaw.map(item => {
      const row = asRecord(item);
      return {
        accountCode: String(row.accountCode || '').trim(),
        accountLabel: String(row.accountLabel || '').trim(),
        debitIdr: asNumber(row.debitIdr),
        creditIdr: asNumber(row.creditIdr),
        memo: String(row.memo || '').trim(),
        informational: row.informational === true,
      };
    }),
  };
}

export function normalizeKolamDaraTaxSptPpnMasaPreview(
  payload: unknown,
): KolamDaraTaxSptPpnMasaPreview {
  const data = unwrapDataRecord(payload);
  const taxpayer = asRecord(data.taxpayer);
  const summary = asRecord(data.summary);
  const linesRaw = Array.isArray(data.lines) ? data.lines : [];
  return {
    period: String(data.period || '').trim(),
    formType: String(data.formType || '').trim(),
    formReference: String(data.formReference || '').trim(),
    disclaimer: String(data.disclaimer || '').trim(),
    generatedAt: String(data.generatedAt || '').trim(),
    taxpayer: {
      companyName: String(taxpayer.companyName || '').trim(),
      legalName: String(taxpayer.legalName || '').trim(),
      npwp: String(taxpayer.npwp || '').trim(),
      isPkp: taxpayer.isPkp === true,
      address: String(taxpayer.address || '').trim(),
    },
    summary: {
      ppnKeluaranIdr: asNumber(summary.ppnKeluaranIdr),
      ppnMasukanIdr: asNumber(summary.ppnMasukanIdr),
      ppnTerutangIdr: asNumber(summary.ppnTerutangIdr),
      ppnLebihBayarIdr: asNumber(summary.ppnLebihBayarIdr),
      netPpnIdr: asNumber(summary.netPpnIdr),
    },
    lines: linesRaw.map(item => {
      const row = asRecord(item);
      return {
        label: String(row.label || '').trim(),
        dppIdr: asNumber(row.dppIdr),
        ppnIdr: asNumber(row.ppnIdr),
      };
    }),
    raw: data,
  };
}

export function normalizeKolamDaraTaxMissingFakturSales(
  payload: unknown,
): KolamDaraTaxMissingFakturSale[] {
  const items = unwrapItems(payload);
  return items
    .map(item => {
      const row = asRecord(item);
      const id = String(row._id || row.id || '').trim();
      if (!id) {
        return null;
      }
      const faktur = asRecord(row.fakturPajak);
      return {
        id,
        invoiceCode: String(row.invoiceCode || '').trim() || id,
        finalTotal: asNumber(row.finalTotal),
        fakturStatus: String(faktur.status || '').trim() || 'none',
      };
    })
    .filter((row): row is KolamDaraTaxMissingFakturSale => row != null);
}

export function normalizeKolamDaraTaxMissingFakturPos(
  payload: unknown,
): KolamDaraTaxMissingFakturPo[] {
  const items = unwrapItems(payload);
  return items
    .map(item => {
      const row = asRecord(item);
      const id = String(row._id || row.id || '').trim();
      if (!id) {
        return null;
      }
      const faktur = asRecord(row.fakturPajak);
      return {
        id,
        poCode: String(row.poCode || '').trim() || id,
        vendorName: String(row.vendorName || '').trim(),
        finalTotal: asNumber(row.finalTotal),
        fakturStatus: String(faktur.status || '').trim() || 'none',
      };
    })
    .filter((row): row is KolamDaraTaxMissingFakturPo => row != null);
}

export type {KolamDaraTaxPeriod};

function unwrapItems(payload: unknown): unknown[] {
  const data = unwrapDataRecord(payload);
  if (Array.isArray(data.items)) {
    return data.items;
  }
  if (Array.isArray(payload)) {
    return payload;
  }
  return [];
}

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
