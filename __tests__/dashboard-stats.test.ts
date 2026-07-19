import {
  getDashboardStatCards,
  getDashboardStatsVisualContract,
} from '../src/domain/dashboard-stats';
import {seedUnifiedDataset} from '../src/services/unified-data';

describe('getDashboardStatCards', () => {
  it('builds live Kolam style summary ranges for the dashboard first screen', () => {
    const cards = getDashboardStatCards(seedUnifiedDataset);

    expect(cards.map(card => card.id)).toEqual(['today', 'month', 'year', 'all']);
    expect(cards.map(card => card.label)).toEqual([
      'Omzet Hari ini',
      'Laba kotor',
      'Total Order Tahun ini (YTD)',
      'Akumulasi semua transaksi',
    ]);
    expect(cards[0].value).toMatch(/^Rp \d+(\.\d)?(Rb|Jt|M)?$/);
    expect(cards[1].value).toMatch(/^Rp \d+(\.\d)?(Rb|Jt|M)?$/);
    expect(cards[2].value.endsWith('order')).toBe(true);
    expect(cards[3].value).toMatch(/^Rp \d+(\.\d)?(Rb|Jt|M)?$/);
    expect(
      cards.every(card =>
        /^[+-]?\d+% vs periode sebelumnya$/.test(card.changeLabel),
      ),
    ).toBe(true);
    expect(cards.every(card => card.sparklineValues.length > 0)).toBe(true);
    expect(cards.every(card => card.sparklineValues.length <= 12)).toBe(true);
    expect(cards.every(card => card.channels.length === 4)).toBe(true);
    expect(cards.map(card => card.breakdownTitle)).toEqual([
      'Omzet per kanal',
      'Laba per kanal',
      'Order per kanal',
      'Omzet per kanal',
    ]);
    expect(cards[0].channels.map(channel => channel.label)).toEqual([
      'POS',
      'Website',
      'Toko',
      'Shopee',
    ]);
    expect(cards[0].channels.map(channel => channel.value)).toEqual([
      cards[0].value.replace(/^Rp /, ''),
      '0',
      '0',
      '0',
    ]);
  });

  it('prefers live Kolam dashboard summary when available', () => {
    const cards = getDashboardStatCards({
      ...seedUnifiedDataset,
      kolam: {
        ...seedUnifiedDataset.kolam,
        dashboardSummary: [
          {
            range: 'today',
            metric: 'revenue',
            value: 12_500_000,
            change: 8,
            data: [{timestamp: '2026-07-18T00:00:00.000Z', value: 12_500_000}],
            bySource: {
              POS: {value: 7_500_000, count: 3},
              Website: {value: 2_500_000, count: 1},
              Tokopedia: {value: 2_500_000, count: 1},
            },
          },
          {
            range: 'month',
            metric: 'margin',
            value: 9_000_000,
            change: -4,
            data: [{timestamp: '2026-07-01T00:00:00.000Z', value: 9_000_000}],
            bySource: {
              POS: {value: 6_000_000, count: 4},
              Shopee: {value: 3_000_000, count: 2},
            },
          },
          {
            range: 'year',
            metric: 'order_count',
            value: 42,
            change: 2,
            data: [{timestamp: '2026-01-01T00:00:00.000Z', value: 42}],
            bySource: {
              POS: {value: 30, count: 30},
              Website: {value: 12, count: 12},
            },
          },
        ],
      },
    });

    expect(cards.map(card => card.id)).toEqual(['today', 'month', 'year']);
    expect(cards.find(card => card.id === 'today')?.value).toBe('Rp 12.5Jt');
    expect(cards.find(card => card.id === 'today')?.channels).toEqual([
      {id: 'POS', label: 'POS', value: '60%'},
      {id: 'Website', label: 'Website', value: '20%'},
      {id: 'Tokopedia', label: 'Toko', value: '20%'},
    ]);
    expect(cards.find(card => card.id === 'month')?.changeLabel).toBe(
      '-4% vs periode sebelumnya',
    );
    expect(cards.find(card => card.id === 'month')?.channels).toEqual([
      {id: 'POS', label: 'POS', value: '67%'},
      {id: 'Shopee', label: 'Shopee', value: '33%'},
    ]);
    expect(cards.find(card => card.id === 'year')?.value).toBe('42 order');
  });

  it('uses live Kolam sale-cost margin for fallback month KPI', () => {
    const cards = getDashboardStatCards({
      ...seedUnifiedDataset,
      kolam: {
        ...seedUnifiedDataset.kolam,
        saleCostSummary: {
          revenue: 12_500_000,
          totalHpp: 3_000_000,
          totalCommissionAccrued: 500_000,
          grossMargin: 9_000_000,
          saleCount: 5,
          filter: {startDate: null, endDate: null, range: 'month'},
        },
      },
    });

    expect(cards.find(card => card.id === 'month')?.value).toBe('Rp 9.0Jt');
    expect(cards.find(card => card.id === 'month')?.channels[0].value).toBe(
      '9.0Jt',
    );
  });

  it('falls back to the current metric value for stats sparkline when graph data is empty', () => {
    const cards = getDashboardStatCards({
      ...seedUnifiedDataset,
      kolam: {
        ...seedUnifiedDataset.kolam,
        salesGraph: [],
      },
    });

    expect(cards.find(card => card.id === 'all')?.sparklineValues.length).toBe(
      2,
    );
    expect(cards.find(card => card.id === 'all')?.sparklineValues[0]).toBe(0);
  });

  it('tracks the live dashboard Stats visual contract', () => {
    const contract = getDashboardStatsVisualContract();

    expect(contract.sourcePartial).toBe(
      'E:\\Projects\\_latest-da\\da-inventory-frontend\\src\\app\\(app)\\(dashboard)\\(partials)\\stats.tsx',
    );
    expect(contract.grid).toEqual({
      columns: {base: 1, tablet: 2, desktop: 4},
      gap: 10,
      breakpoints: {
        tabletMaxWidth: 1180,
        mobileMaxWidth: 760,
      },
    });
    expect(contract.card).toEqual({
      baseMinHeight: 146,
      dashboardMinHeight: 146,
      minWidth: 260,
      spacing: 14,
      gapY: 10,
      radius: 12,
    });
    expect(contract.header).toEqual({
      minHeight: 24,
      gapY: 4,
      gapX: 8,
      labelFontSize: 12,
      baseValueGapY: 4,
      dashboardValueGapY: 0,
      valueFontSize: 23,
      valueFormat: 'compact-rupiah',
    });
    expect(contract.trend).toEqual({
      marginTop: 8,
      fontSize: 12,
      fontWeight: '600',
      tone: 'muted',
    });
    expect(contract.sparkline).toEqual({
      height: 42,
      maxPoints: 12,
      gapX: 3,
      barMinWidth: 3,
      barRadius: 8,
      barBorderWidth: 1,
      barMinHeight: 8,
      barHeightRange: 30,
    });
    expect(contract.channelRows).toEqual({
      borderTopWidth: 1,
      gapY: 10,
      gridGap: 8,
      itemMinHeight: 44,
      itemMinWidth: 64,
      itemPaddingX: 4,
      itemPaddingY: 6,
      itemRadius: 8,
      labelFontSize: 11,
      paddingX: 12,
      paddingBottom: 12,
      paddingTop: 10,
      titleFontSize: 12,
      titleMarginBottom: 10,
      valueFontSize: 14,
      valueGapY: 2,
    });
    expect(contract.sourceBreakdown).toEqual({
      sourceOrder: ['POS', 'Website', 'Tokopedia', 'Shopee'],
      maxItems: 4,
      labelReplacements: {
        Tokopedia: 'Toko',
      },
    });
  });

  it('returns defensive copies of the dashboard stats visual contract', () => {
    const first = getDashboardStatsVisualContract();

    first.card.dashboardMinHeight = 99;
    first.card.minWidth = 99;
    first.card.radius = 99;
    first.header.gapX = 99;
    first.header.valueFormat = 'compact-rupiah';
    first.trend.marginTop = 99;
    first.sparkline.gapX = 99;
    first.channelRows.gridGap = 99;
    first.grid.breakpoints.tabletMaxWidth = 99;
    first.grid.columns.desktop = 99;
    first.grid.columns.tablet = 99;
    first.sourceBreakdown.sourceOrder.push('Backoffice');
    first.sourceBreakdown.labelReplacements.Tokopedia = 'Tokopedia';

    const next = getDashboardStatsVisualContract();

    expect(next.card.dashboardMinHeight).toBe(146);
    expect(next.card.minWidth).toBe(260);
    expect(next.card.radius).toBe(12);
    expect(next.header.gapX).toBe(8);
    expect(next.header.valueFormat).toBe('compact-rupiah');
    expect(next.trend.marginTop).toBe(8);
    expect(next.sparkline.gapX).toBe(3);
    expect(next.channelRows.gridGap).toBe(8);
    expect(next.grid.breakpoints.tabletMaxWidth).toBe(1180);
    expect(next.grid.columns.tablet).toBe(2);
    expect(next.grid.columns.desktop).toBe(4);
    expect(next.sourceBreakdown.sourceOrder).toEqual([
      'POS',
      'Website',
      'Tokopedia',
      'Shopee',
    ]);
    expect(next.sourceBreakdown.labelReplacements.Tokopedia).toBe('Toko');
  });
});



