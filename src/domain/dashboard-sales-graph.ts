import {formatRupiah} from '../lib/money';
import type {KolamSalesGraphPoint} from '../services/kolam-api';
import type {UnifiedDataset} from '../services/unified-data';
import type {SaleSummary} from './pos';

export interface DashboardSalesGraphPoint {
  id: string;
  label: string;
  value: number;
  valueLabel: string;
  barHeight: number;
  areaHeight: number;
  lineOffsetTop: number;
}

export type DashboardSalesGraphRange = 'week' | 'month' | 'year' | 'all';

export interface DashboardSalesGraphRangeOption {
  id: DashboardSalesGraphRange;
  label: string;
  description: string;
}

export interface DashboardSalesGraphVisualContract {
  sourcePartial: string;
  card: {
    colSpanFull: boolean;
    padding: number;
    radius: number;
  };
  header: {
    borderBottom: boolean;
    paddingX: number;
    paddingY: number;
    gapY: number;
    flexWrap: 'wrap';
    summaryColumnMinWidth: number;
    summaryColumnMaxWidth: number;
    summaryColumnBasis: number;
    compactGridGap: number;
    iconSize: number;
    titleFontSize: number;
    descriptionGapY: number;
    descriptionFontSize: number;
    totalFontSize: number;
    totalColor: 'fg';
    rangeHintGapY: number;
  };
  titleIcon: {
    visibleInHeader: boolean;
    axisBorderWidth: number;
    lineRadius: number;
    axisLeft: number;
    axisBottom: number;
    axisWidth: number;
    axisHeight: number;
    axisRotation: string;
    lineOneRight: number;
    lineOneTop: number;
    lineOneWidth: number;
    lineOneHeight: number;
    lineOneRotation: string;
    lineTwoRight: number;
    lineTwoTop: number;
    lineTwoWidth: number;
    lineTwoHeight: number;
  };
  content: {
    height: number;
    borderTop: boolean;
    paddingX: number;
    paddingTop: number;
    paddingBottom: number;
    plotGap: number;
  };
  chart: {
    sourceComponent: string;
    fillType: 'gradient';
    innerPlotHeight: number;
    maxPoints: number;
  };
  emptyState: {
    iconVisible: boolean;
    title: 'Belum ada penjualan pada rentang ini.';
    description: null;
    gapY: number;
    titleFontSize: number;
    descriptionFontSize: number;
  };
  emptyIcon: {
    size: number;
    marginBottom: number;
    radius: number;
    borderWidth: number;
    lineRadius: number;
    lineOneLeft: number;
    lineOneBottom: number;
    lineOneWidth: number;
    lineOneHeight: number;
    lineOneRotation: string;
    lineTwoRight: number;
    lineTwoTop: number;
    lineTwoWidth: number;
    lineTwoHeight: number;
  };
  point: {
    gapY: number;
    minWidth: number;
    labelFontSize: number;
    valueFontSize: number;
    trackBorderWidth: number;
    fillBorderTopWidth: number;
    dotSize: number;
    dotBorderWidth: number;
  };
  rangeTrigger: {
    sourceComponent: string;
    alignSelf: 'flex-start';
    minHeight: number;
    paddingX: number;
    paddingY: number;
    wrapperPaddingX: number;
    wrapperPaddingY: number;
    radius: number;
    gap: number;
    borderWidth: number;
    background: 'secondary';
    borderColor: 'border';
  };
}

export interface DashboardSalesGraph {
  title: 'Ringkasan Penjualan';
  rangeLabel: string;
  selectedRangeId: DashboardSalesGraphRange;
  rangeOptions: DashboardSalesGraphRangeOption[];
  rangeHint: string;
  plot: {
    sourceComponent: string;
    contentHeight: number;
    fillType: 'gradient';
  };
  rangeTrigger: {
    sourceComponent: string;
    alignSelf: 'flex-start';
    minHeight: number;
    paddingX: number;
    paddingY: number;
    radius: number;
    gap: number;
  };
  description: string;
  totalLabel: string;
  source: 'live' | 'fallback' | 'empty';
  points: DashboardSalesGraphPoint[];
}

export const dashboardSalesGraphRangeOptions: DashboardSalesGraphRangeOption[] =
  [
    {id: 'week', label: '7 Hari', description: 'Per hari — 7 hari terakhir'},
    {
      id: 'month',
      label: 'Bulan Ini',
      description: 'Per minggu — seluruh minggu dalam bulan berjalan',
    },
    {
      id: 'year',
      label: 'Tahun Ini',
      description: 'Per bulan — Jan–Des tahun ini',
    },
    {
      id: 'all',
      label: 'Sepanjang Waktu',
      description: 'Per tahun — sejak toko mulai berjualan',
    },
  ];

const dashboardSalesGraphRangeHints: Record<DashboardSalesGraphRange, string> = {
  week: 'Per hari — 7 hari terakhir',
  month: 'Per minggu — seluruh minggu dalam bulan berjalan',
  year: 'Per bulan — Jan–Des tahun ini',
  all: 'Per tahun — sejak toko mulai berjualan',
};

const dashboardSalesGraphVisualContract: DashboardSalesGraphVisualContract = {
  sourcePartial:
    'E:\\Projects\\_latest-da\\da-inventory-frontend\\src\\app\\(app)\\(dashboard)\\(partials)\\sales-graph.tsx',
  card: {
    colSpanFull: true,
    padding: 0,
    radius: 12,
  },
  header: {
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
  },
  titleIcon: {
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
  },
  content: {
    height: 270,
    borderTop: false,
    paddingX: 16,
    paddingTop: 12,
    paddingBottom: 16,
    plotGap: 10,
  },
  chart: {
    sourceComponent:
      'E:\\Projects\\_latest-da\\da-inventory-frontend\\src\\components\\ui\\area-chart.tsx',
    fillType: 'gradient',
    innerPlotHeight: 170,
    maxPoints: 12,
  },
  emptyState: {
    iconVisible: false,
    title: 'Belum ada penjualan pada rentang ini.',
    description: null,
    gapY: 4,
    titleFontSize: 13,
    descriptionFontSize: 11,
  },
  emptyIcon: {
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
  },
  point: {
    gapY: 6,
    minWidth: 34,
    labelFontSize: 10,
    valueFontSize: 10,
    trackBorderWidth: 1,
    fillBorderTopWidth: 2,
    dotSize: 8,
    dotBorderWidth: 2,
  },
  rangeTrigger: {
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
  },
};

export function getDashboardSalesGraph(
  dataset: UnifiedDataset,
  selectedRangeId: DashboardSalesGraphRange = dataset.kolam.dashboardRange,
): DashboardSalesGraph {
  const livePoints = dataset.kolam.salesGraph;
  const rawPoints = livePoints.length
    ? livePoints
    : buildFallbackGraphPoints(dataset.recentSales);
  const source = livePoints.length
    ? 'live'
    : rawPoints.length
      ? 'fallback'
      : 'empty';
  const total = rawPoints.reduce((sum, point) => sum + point.value, 0);

  return {
    title: 'Ringkasan Penjualan',
    rangeLabel: getRangeLabel(selectedRangeId),
    selectedRangeId,
    rangeOptions: dashboardSalesGraphRangeOptions,
    rangeHint: dashboardSalesGraphRangeHints[selectedRangeId],
    plot: {
      sourceComponent: dashboardSalesGraphVisualContract.chart.sourceComponent,
      contentHeight: dashboardSalesGraphVisualContract.content.height,
      fillType: dashboardSalesGraphVisualContract.chart.fillType,
    },
    rangeTrigger: {
      sourceComponent:
        dashboardSalesGraphVisualContract.rangeTrigger.sourceComponent,
      alignSelf: dashboardSalesGraphVisualContract.rangeTrigger.alignSelf,
      minHeight: dashboardSalesGraphVisualContract.rangeTrigger.minHeight,
      paddingX: dashboardSalesGraphVisualContract.rangeTrigger.paddingX,
      paddingY: dashboardSalesGraphVisualContract.rangeTrigger.paddingY,
      radius: dashboardSalesGraphVisualContract.rangeTrigger.radius,
      gap: dashboardSalesGraphVisualContract.rangeTrigger.gap,
    },
    description: 'Total omzet (rentang dipilih)',
    totalLabel: formatRupiah(total),
    source,
    points: normalizeGraphPoints(rawPoints, selectedRangeId),
  };
}

function getRangeLabel(range: DashboardSalesGraphRange): string {
  return (
    dashboardSalesGraphRangeOptions.find(option => option.id === range)?.label ??
    dashboardSalesGraphRangeOptions[1].label
  );
}

function buildFallbackGraphPoints(sales: SaleSummary[]): KolamSalesGraphPoint[] {
  const paidSales = sales.filter(sale => sale.status === 'paid');
  const grouped = new Map<string, number>();

  paidSales.forEach(sale => {
    const monthKey = sale.createdAt.slice(0, 7);
    grouped.set(monthKey, (grouped.get(monthKey) ?? 0) + sale.total);
  });

  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, value]) => ({
      timestamp: `${monthKey}-01T00:00:00+07:00`,
      value,
    }));
}

function normalizeGraphPoints(
  points: KolamSalesGraphPoint[],
  range: DashboardSalesGraphRange,
): DashboardSalesGraphPoint[] {
  const maxValue = Math.max(...points.map(point => point.value), 0);
  const plotHeight = dashboardSalesGraphVisualContract.chart.innerPlotHeight;

  return points
    .slice(-dashboardSalesGraphVisualContract.chart.maxPoints)
    .map(point => ({
      id: point.timestamp,
      label: formatGraphLabel(point.timestamp, range),
      value: point.value,
      valueLabel: formatRupiahShort(point.value),
      ...getGraphPointGeometry(point.value, maxValue, plotHeight),
    }));
}

function getGraphPointGeometry(
  value: number,
  maxValue: number,
  plotHeight: number,
) {
  const areaHeight =
    maxValue > 0 ? Math.max(18, Math.round((value / maxValue) * plotHeight)) : 18;

  return {
    barHeight: areaHeight,
    areaHeight,
    lineOffsetTop: plotHeight - areaHeight,
  };
}

function formatGraphLabel(value: string, range: DashboardSalesGraphRange) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  if (range === 'all') {
    return date.toLocaleDateString('id-ID', {year: 'numeric'});
  }

  if (range === 'year') {
    return date.toLocaleDateString('id-ID', {month: 'short'});
  }

  if (range === 'month') {
    const day = Number(
      new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        timeZone: 'Asia/Jakarta',
      }).format(date),
    );
    const week = Math.floor((day - 1) / 7) + 1;

    return `Mgu ${week}`;
  }

  return date.toLocaleDateString('id-ID', {day: 'numeric', month: 'short'});
}

function formatRupiahShort(value: number) {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}Jt`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}Rb`;
  }

  return `${value}`;
}

export function getDashboardSalesGraphVisualContract(): DashboardSalesGraphVisualContract {
  return {
    ...dashboardSalesGraphVisualContract,
    card: {...dashboardSalesGraphVisualContract.card},
    header: {...dashboardSalesGraphVisualContract.header},
    titleIcon: {...dashboardSalesGraphVisualContract.titleIcon},
    content: {...dashboardSalesGraphVisualContract.content},
    chart: {...dashboardSalesGraphVisualContract.chart},
    emptyState: {...dashboardSalesGraphVisualContract.emptyState},
    emptyIcon: {...dashboardSalesGraphVisualContract.emptyIcon},
    point: {...dashboardSalesGraphVisualContract.point},
    rangeTrigger: {...dashboardSalesGraphVisualContract.rangeTrigger},
  };
}
