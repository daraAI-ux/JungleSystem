import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {KolamFinanceTaxSurface} from '../src/components/kolam-finance-tax-surface';
import {useKolamAuthContext} from '../src/context/kolam-app-contexts';
import {getKolamWebSetting} from '../src/services/kolam-api';
import {
  fetchKolamDaraTaxAllocationBySource,
  fetchKolamDaraTaxDashboard,
  fetchKolamDaraTaxJournalPreview,
  fetchKolamDaraTaxOverviewSeries,
  fetchKolamDaraTaxPoMissingFaktur,
  fetchKolamDaraTaxSalesMissingFaktur,
  fetchKolamDaraTaxSptPpnMasaPreview,
} from '../src/services/kolam-dara-tax-api';

jest.mock('../src/context/kolam-app-contexts', () => ({
  useKolamAuthContext: jest.fn(),
}));

jest.mock('../src/services/kolam-api', () => ({
  getKolamWebSetting: jest.fn(),
}));

jest.mock('../src/services/kolam-dara-tax-api', () => ({
  fetchKolamDaraTaxDashboard: jest.fn(),
  fetchKolamDaraTaxOverviewSeries: jest.fn(),
  fetchKolamDaraTaxAllocationBySource: jest.fn(),
  fetchKolamDaraTaxJournalPreview: jest.fn(),
  fetchKolamDaraTaxSptPpnMasaPreview: jest.fn(),
  fetchKolamDaraTaxSalesMissingFaktur: jest.fn(),
  fetchKolamDaraTaxPoMissingFaktur: jest.fn(),
}));

jest.mock('../src/services/kolam-financial-settings-api', () => ({
  getKolamTaxCompanyProfile: jest.fn(),
}));

jest.mock('../src/lib/native-clipboard', () => ({
  copyTextToClipboard: jest.fn(async () => undefined),
}));

const authMock = useKolamAuthContext as jest.MockedFunction<
  typeof useKolamAuthContext
>;
const webSettingMock = getKolamWebSetting as jest.MockedFunction<
  typeof getKolamWebSetting
>;
const dashboardMock = fetchKolamDaraTaxDashboard as jest.MockedFunction<
  typeof fetchKolamDaraTaxDashboard
>;
const seriesMock = fetchKolamDaraTaxOverviewSeries as jest.MockedFunction<
  typeof fetchKolamDaraTaxOverviewSeries
>;
const allocationMock =
  fetchKolamDaraTaxAllocationBySource as jest.MockedFunction<
    typeof fetchKolamDaraTaxAllocationBySource
  >;
const journalMock = fetchKolamDaraTaxJournalPreview as jest.MockedFunction<
  typeof fetchKolamDaraTaxJournalPreview
>;
const sptMock = fetchKolamDaraTaxSptPpnMasaPreview as jest.MockedFunction<
  typeof fetchKolamDaraTaxSptPpnMasaPreview
>;
const salesMissingMock =
  fetchKolamDaraTaxSalesMissingFaktur as jest.MockedFunction<
    typeof fetchKolamDaraTaxSalesMissingFaktur
  >;
const poMissingMock = fetchKolamDaraTaxPoMissingFaktur as jest.MockedFunction<
  typeof fetchKolamDaraTaxPoMissingFaktur
>;

describe('KolamFinanceTaxSurface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authMock.mockReturnValue({
      authUser: {roleKey: 'admin'},
    } as ReturnType<typeof useKolamAuthContext>);
    webSettingMock.mockResolvedValue({
      daraTaxEnabled: true,
    } as Awaited<ReturnType<typeof getKolamWebSetting>>);
    dashboardMock.mockResolvedValue({
      period: 'month',
      overview: {
        period: 'month',
        sales: {
          orderCount: 2,
          revenueIdr: 2_200_000,
          ppnOutput: {dpp: 2_000_000, ppn: 220_000, total: 2_220_000},
        },
        purchases: {
          ppnInput: {dpp: 500_000, ppn: 55_000, total: 555_000},
        },
        commissionPph21: {grossIdr: 100_000, withheldIdr: 5_000},
        netPpnEstimate: 165_000,
      },
      complianceScores: {overall: 70, vatCompliance: 80},
      complianceHighlights: [],
      risks: {alerts: [], count: 0},
      deadlines: [],
      pendingRegulationDraftCount: 0,
      draftReportCount: 0,
    });
    seriesMock.mockResolvedValue({
      months: 6,
      ppnOutputByMonth: [
        {period: '2026-01', orderCount: 1, ppnIdr: 100},
        {period: '2026-02', orderCount: 2, ppnIdr: 200},
      ],
    });
    allocationMock.mockResolvedValue({
      period: 'month',
      disclaimer: 'Estimasi',
      bySource: [
        {
          sourceId: 's1',
          sourceName: 'POS',
          sourceType: 'pos',
          orderCount: 2,
          dppIdr: 1000,
          ppnOutputIdr: 110,
        },
      ],
      totals: {orderCount: 2, dppIdr: 1000, ppnOutputIdr: 110},
    });
    journalMock.mockResolvedValue({
      period: 'month',
      disclaimer: 'Jurnal',
      balanced: true,
      totals: {debitIdr: 110, creditIdr: 110},
      lines: [
        {
          accountCode: '2110',
          accountLabel: 'PPN',
          debitIdr: 0,
          creditIdr: 110,
          memo: 'Output',
          informational: false,
        },
      ],
    });
    sptMock.mockResolvedValue({
      period: '2026-08',
      formType: '1111',
      formReference: 'SPT',
      disclaimer: '',
      generatedAt: '',
      taxpayer: {
        companyName: 'PT X',
        legalName: 'PT X',
        npwp: '01',
        isPkp: true,
        address: '',
      },
      summary: {
        ppnKeluaranIdr: 110,
        ppnMasukanIdr: 0,
        ppnTerutangIdr: 110,
        ppnLebihBayarIdr: 0,
        netPpnIdr: 110,
      },
      lines: [],
      raw: {period: '2026-08'},
    });
    salesMissingMock.mockResolvedValue([]);
    poMissingMock.mockResolvedValue([]);
  });

  it('renders Inteligensi Pajak shell with tabs, period, and reload', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <KolamFinanceTaxSurface route="/finance/tax" />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('Ringkasan');
    expect(text).toContain('Operasional');
    expect(text).toContain('Regulasi');
    expect(text).toContain('Laporan');
    expect(text).toContain('Setoran');
    expect(text).toContain('Muat ulang');
    expect(text).toContain('Bulan ini');
    expect(text).toContain('PPN keluaran');
    expect(text).toContain('Compliance Score');
    expect(webSettingMock).toHaveBeenCalled();
    expect(dashboardMock).toHaveBeenCalledWith('month');
    expect(seriesMock).toHaveBeenCalled();

    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });

  it('renders operasional panels when tab=operasional', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <KolamFinanceTaxSurface route="/finance/tax?tab=operasional" />,
      );
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('Alokasi PPN per source penjualan');
    expect(text).toContain('Preview jurnal pajak (estimasi)');
    expect(text).toContain('Pre-fill SPT Masa PPN');
    expect(text).toContain('Faktur pajak belum tercatat');
    expect(text).toContain('POS');
    expect(allocationMock).toHaveBeenCalledWith('month');
    expect(journalMock).toHaveBeenCalled();
    expect(sptMock).toHaveBeenCalled();
    expect(salesMissingMock).toHaveBeenCalled();
    expect(poMissingMock).toHaveBeenCalled();

    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });

  it('denies access without tax permission', async () => {
    authMock.mockReturnValue({
      authUser: {roleKey: 'cashier', permissions: []},
    } as ReturnType<typeof useKolamAuthContext>);

    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <KolamFinanceTaxSurface route="/finance/tax" />,
      );
      await Promise.resolve();
    });

    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('Akses ditolak');
    expect(text).toContain('tax');
    expect(text).not.toContain('Operasional');

    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });

  it('shows disabled banner when daraTaxEnabled is false', async () => {
    webSettingMock.mockResolvedValue({
      daraTaxEnabled: false,
    } as Awaited<ReturnType<typeof getKolamWebSetting>>);

    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <KolamFinanceTaxSurface route="/finance/tax" />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('DARA Tax nonaktif');
    expect(text).toContain('Settings → AI-Tools');

    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });
});
