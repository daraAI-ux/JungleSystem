import {
  getDashboardSalesGraph,
  getDashboardSalesGraphVisualContract,
} from '../src/domain/dashboard-sales-graph';
import {formatRupiah} from '../src/lib/money';
import {seedUnifiedDataset} from '../src/services/unified-data';

describe('getDashboardSalesGraph', () => {
  it('builds a live-style sales graph card from fallback paid sales', () => {
    const graph = getDashboardSalesGraph(seedUnifiedDataset);

    expect(graph.title).toBe('Ringkasan Penjualan');
    expect(graph.rangeLabel).toBe('Bulan Ini');
    expect(graph.selectedRangeId).toBe('month');
    expect(graph.rangeOptions.map(option => option.label)).toEqual([
      '7 Hari',
      'Bulan Ini',
      'Tahun Ini',
      'Sepanjang Waktu',
    ]);
    expect(graph.rangeOptions[1].description).toBe(
      'Per minggu — seluruh minggu dalam bulan berjalan',
    );
    expect(graph.rangeOptions.map(option => option.description)).toEqual([
      'Per hari — 7 hari terakhir',
      'Per minggu — seluruh minggu dalam bulan berjalan',
      'Per bulan — Jan–Des tahun ini',
      'Per tahun — sejak toko mulai berjualan',
    ]);
    expect(graph.plot).toEqual({
      sourceComponent:
        'E:\\Projects\\_latest-da\\da-inventory-frontend\\src\\components\\ui\\area-chart.tsx',
      contentHeight: 270,
      fillType: 'gradient',
    });
    expect(graph.rangeTrigger).toEqual({
      sourceComponent:
        'E:\\Projects\\_latest-da\\da-inventory-frontend\\src\\app\\(app)\\(dashboard)\\(partials)\\sales-graph.tsx#rangeTabs',
      alignSelf: 'flex-start',
      minHeight: 36,
      paddingX: 13,
      paddingY: 8,
      radius: 10,
      gap: 3,
    });
    expect(graph.description).toBe('Total omzet (rentang dipilih)');
    expect(graph.rangeHint).toBe(
      'Per minggu — seluruh minggu dalam bulan berjalan',
    );
    expect(graph.source).toBe('fallback');
    expect(graph.totalLabel).toBe(formatRupiah(510_000));
    expect(graph.points).toHaveLength(1);
    expect(graph.points[0].label).toBe('Mgu 1');
    expect(graph.points[0].valueLabel).toBe('510Rb');
    expect(graph.points[0].barHeight).toBeGreaterThanOrEqual(18);
    expect(graph.points[0].areaHeight).toBe(graph.points[0].barHeight);
    expect(graph.points[0].lineOffsetTop).toBeGreaterThanOrEqual(0);
  });

  it('prefers Kolam live graph points when available', () => {
    const graph = getDashboardSalesGraph({
      ...seedUnifiedDataset,
      kolam: {
        ...seedUnifiedDataset.kolam,
        salesGraph: [
          {timestamp: '2026-01-01T00:00:00+07:00', value: 10_000},
          {timestamp: '2026-02-01T00:00:00+07:00', value: 40_000},
        ],
      },
    });

    expect(graph.source).toBe('live');
    expect(graph.totalLabel).toBe(formatRupiah(50_000));
    expect(graph.points.map(point => point.label)).toEqual(['Mgu 1', 'Mgu 1']);
    expect(graph.points[1].barHeight).toBeGreaterThan(graph.points[0].barHeight);
    expect(graph.points[1].areaHeight).toBeGreaterThan(graph.points[0].areaHeight);
    expect(graph.points[1].lineOffsetTop).toBeLessThan(
      graph.points[0].lineOffsetTop,
    );
  });

  it('formats graph labels using the selected live FE range rules', () => {
    const dataset = {
      ...seedUnifiedDataset,
      kolam: {
        ...seedUnifiedDataset.kolam,
        salesGraph: [
          {timestamp: '2026-01-01T00:00:00+07:00', value: 10_000},
          {timestamp: '2026-02-01T00:00:00+07:00', value: 1_200_000},
        ],
      },
    };

    expect(
      getDashboardSalesGraph(dataset, 'week').points.map(point => point.label),
    ).toEqual(['1 Jan', '1 Feb']);
    expect(
      getDashboardSalesGraph(dataset, 'year').points.map(point => point.label),
    ).toEqual(['Jan', 'Feb']);
    expect(
      getDashboardSalesGraph(dataset, 'all').points.map(point => point.label),
    ).toEqual(['2026', '2026']);
    expect(getDashboardSalesGraph(dataset, 'year').points[1].valueLabel).toBe(
      '1.2Jt',
    );
  });

  it('uses the selected live FE range label instead of a hard-coded month label', () => {
    expect(getDashboardSalesGraph(seedUnifiedDataset, 'week').rangeLabel).toBe(
      '7 Hari',
    );
    expect(getDashboardSalesGraph(seedUnifiedDataset, 'month').rangeLabel).toBe(
      'Bulan Ini',
    );
    expect(getDashboardSalesGraph(seedUnifiedDataset, 'year').rangeLabel).toBe(
      'Tahun Ini',
    );
    expect(getDashboardSalesGraph(seedUnifiedDataset, 'all').rangeLabel).toBe(
      'Sepanjang Waktu',
    );
  });

  it('tracks the live dashboard SalesGraph visual contract', () => {
    const contract = getDashboardSalesGraphVisualContract();

    expect(contract.sourcePartial).toBe(
      'E:\\Projects\\_latest-da\\da-inventory-frontend\\src\\app\\(app)\\(dashboard)\\(partials)\\sales-graph.tsx',
    );
    expect(contract.card).toEqual({
      colSpanFull: true,
      padding: 0,
      radius: 12,
    });
    expect(contract.header).toEqual({
      borderBottom: true,
      paddingX: 18,
      paddingY: 16,
      gapY: 18,
      flexWrap: 'wrap',
      summaryColumnMinWidth: 220,
      summaryColumnMaxWidth: 260,
      summaryColumnBasis: 260,
      compactGridGap: 6,
      iconSize: 16,
      titleFontSize: 15,
      descriptionGapY: 4,
      descriptionFontSize: 12,
      totalFontSize: 24,
      totalColor: 'fg',
      rangeHintGapY: 8,
    });
    expect(contract.titleIcon).toEqual({
      visibleInHeader: false,
      axisBorderWidth: 2,
      lineRadius: 999,
      axisLeft: 2,
      axisBottom: 2,
      axisWidth: 12,
      axisHeight: 2,
      axisRotation: '-28deg',
      lineOneRight: 4,
      lineOneTop: 4,
      lineOneWidth: 8,
      lineOneHeight: 2,
      lineOneRotation: '-28deg',
      lineTwoRight: 2,
      lineTwoTop: 2,
      lineTwoWidth: 2,
      lineTwoHeight: 7,
    });
    expect(contract.content).toEqual({
      height: 270,
      borderTop: false,
      paddingX: 16,
      paddingTop: 12,
      paddingBottom: 16,
      plotGap: 10,
    });
    expect(contract.chart).toEqual({
      sourceComponent:
        'E:\\Projects\\_latest-da\\da-inventory-frontend\\src\\components\\ui\\area-chart.tsx',
      fillType: 'gradient',
      innerPlotHeight: 170,
      maxPoints: 12,
    });
    expect(contract.emptyState).toEqual({
      iconVisible: false,
      title: 'Belum ada penjualan pada rentang ini.',
      description: null,
      gapY: 4,
      titleFontSize: 13,
      descriptionFontSize: 11,
    });
    expect(contract.emptyIcon).toEqual({
      size: 32,
      marginBottom: 4,
      radius: 16,
      borderWidth: 1,
      lineRadius: 999,
      lineOneLeft: 7,
      lineOneBottom: 10,
      lineOneWidth: 18,
      lineOneHeight: 2,
      lineOneRotation: '-24deg',
      lineTwoRight: 7,
      lineTwoTop: 9,
      lineTwoWidth: 2,
      lineTwoHeight: 11,
    });
    expect(contract.point).toEqual({
      gapY: 6,
      minWidth: 34,
      labelFontSize: 10,
      valueFontSize: 10,
      trackBorderWidth: 1,
      fillBorderTopWidth: 2,
      dotSize: 8,
      dotBorderWidth: 2,
    });
    expect(contract.rangeTrigger).toEqual({
      sourceComponent:
        'E:\\Projects\\_latest-da\\da-inventory-frontend\\src\\app\\(app)\\(dashboard)\\(partials)\\sales-graph.tsx#rangeTabs',
      alignSelf: 'flex-start',
      minHeight: 36,
      paddingX: 13,
      paddingY: 8,
      wrapperPaddingX: 4,
      wrapperPaddingY: 4,
      radius: 10,
      gap: 3,
      borderWidth: 1,
      background: 'secondary',
      borderColor: 'border',
    });
  });

  it('returns defensive copies of the sales graph visual contract', () => {
    const first = getDashboardSalesGraphVisualContract();

    first.header.titleFontSize = 99;
    first.header.totalFontSize = 99;
    first.header.summaryColumnMinWidth = 99;
    first.card.radius = 99;
    first.titleIcon.visibleInHeader = true;
    first.titleIcon.axisBorderWidth = 99;
    first.content.plotGap = 99;
    first.emptyState.iconVisible = true;
    first.emptyState.gapY = 99;
    first.emptyIcon.size = 99;
    first.point.dotSize = 99;
    (first.rangeTrigger as {alignSelf: string}).alignSelf = 'center';
    first.rangeTrigger.borderWidth = 99;

    const next = getDashboardSalesGraphVisualContract();

    expect(next.header.titleFontSize).toBe(15);
    expect(next.header.totalFontSize).toBe(24);
    expect(next.header.summaryColumnMinWidth).toBe(220);
    expect(next.card.radius).toBe(12);
    expect(next.titleIcon.visibleInHeader).toBe(false);
    expect(next.titleIcon.axisBorderWidth).toBe(2);
    expect(next.content.plotGap).toBe(10);
    expect(next.emptyState.iconVisible).toBe(false);
    expect(next.emptyState.gapY).toBe(4);
    expect(next.emptyIcon.size).toBe(32);
    expect(next.point.dotSize).toBe(8);
    expect(next.rangeTrigger.alignSelf).toBe('flex-start');
    expect(next.rangeTrigger.borderWidth).toBe(1);
  });
});


