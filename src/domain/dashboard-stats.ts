import {formatRupiahCompact} from '../lib/money';
import type {
  KolamDashboardSourceBreakdown,
  KolamDashboardSummary,
  KolamDashboardSummaryMetric,
} from '../services/kolam-api';
import type {SaleSummary} from './pos';
import type {UnifiedDataset} from '../services/unified-data';

export type DashboardStatRange = 'today' | 'month' | 'year' | 'all';
export type DashboardStatTone = 'success' | 'danger';

export interface DashboardStatChannel {
  id: string;
  label: string;
  value: string;
}

export interface DashboardStatCard {
  id: DashboardStatRange;
  label: string;
  value: string;
  changeLabel: string;
  changeTone: DashboardStatTone;
  metric: KolamDashboardSummaryMetric;
  breakdownTitle: string;
  sparklineValues: number[];
  channels: DashboardStatChannel[];
}

export interface DashboardStatsVisualContract {
  sourcePartial: string;
  grid: {
    columns: {
      base: number;
      tablet: number;
      desktop: number;
    };
    gap: number;
    breakpoints: {
      tabletMaxWidth: number;
      mobileMaxWidth: number;
    };
  };
  card: {
    baseMinHeight: number;
    dashboardMinHeight: number;
    minWidth: number;
    spacing: number;
    gapY: number;
    radius: number;
  };
  header: {
    minHeight: number;
    gapY: number;
    gapX: number;
    labelFontSize: number;
    baseValueGapY: number;
    dashboardValueGapY: number;
    valueFontSize: number;
    valueFormat: 'compact-rupiah';
  };
  trend: {
    marginTop: number;
    fontSize: number;
    fontWeight: '600';
    tone: 'muted';
  };
  sparkline: {
    height: number;
    maxPoints: number;
    gapX: number;
    barMinWidth: number;
    barRadius: number;
    barBorderWidth: number;
    barMinHeight: number;
    barHeightRange: number;
  };
  channelRows: {
    borderTopWidth: number;
    gapY: number;
    gridGap: number;
    itemMinHeight: number;
    itemMinWidth: number;
    itemPaddingX: number;
    itemPaddingY: number;
    itemRadius: number;
    labelFontSize: number;
    paddingX: number;
    paddingBottom: number;
    paddingTop: number;
    titleFontSize: number;
    titleMarginBottom: number;
    valueFontSize: number;
    valueGapY: number;
  };
  sourceBreakdown: {
    sourceOrder: string[];
    maxItems: number;
    labelReplacements: Record<string, string>;
  };
}

const RANGE_LABELS: Record<DashboardStatRange, string> = {
  today: 'Omzet Hari ini',
  month: 'Laba kotor',
  year: 'Total Order Tahun ini (YTD)',
  all: 'Akumulasi semua transaksi',
};

const SOURCE_ORDER = ['POS', 'Website', 'Tokopedia', 'Shopee'];
const SOURCE_LABEL_REPLACEMENTS: Record<string, string> = {
  Tokopedia: 'Toko',
};

const dashboardStatsVisualContract: DashboardStatsVisualContract = {
  sourcePartial:
    'E:\\Projects\\_latest-da\\da-inventory-frontend\\src\\app\\(app)\\(dashboard)\\(partials)\\stats.tsx',
  grid: {
    columns: {
      base: 1,
      tablet: 2,
      desktop: 4,
    },
    gap: 10,
    breakpoints: {
      tabletMaxWidth: 1180,
      mobileMaxWidth: 760,
    },
  },
  card: {
    baseMinHeight: 146,
    dashboardMinHeight: 146,
    minWidth: 260,
    spacing: 14,
    gapY: 10,
    radius: 12,
  },
  header: {
    minHeight: 24,
    gapY: 4,
    gapX: 8,
    labelFontSize: 12,
    baseValueGapY: 4,
    dashboardValueGapY: 0,
    valueFontSize: 23,
    valueFormat: 'compact-rupiah',
  },
  trend: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    tone: 'muted',
  },
  sparkline: {
    height: 42,
    maxPoints: 12,
    gapX: 3,
    barMinWidth: 3,
    barRadius: 8,
    barBorderWidth: 1,
    barMinHeight: 8,
    barHeightRange: 30,
  },
  channelRows: {
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
  },
  sourceBreakdown: {
    sourceOrder: SOURCE_ORDER,
    maxItems: 4,
    labelReplacements: SOURCE_LABEL_REPLACEMENTS,
  },
};

export function getDashboardStatCards(
  dataset: UnifiedDataset,
): DashboardStatCard[] {
  const liveCards = buildLiveStatCards(dataset.kolam.dashboardSummary);
  if (liveCards.length > 0) {
    return liveCards;
  }

  const paidSales = dataset.recentSales.filter(sale => sale.status === 'paid');
  const latestSaleDate = getLatestSaleDate(dataset.recentSales);
  const todaySales = latestSaleDate
    ? paidSales.filter(sale => sale.createdAt.slice(0, 10) === latestSaleDate)
    : [];
  const paidTotal = sumSales(paidSales);
  const todayTotal = sumSales(todaySales);
  const monthTotal = dataset.kolam.saleCostSummary?.grossMargin
    ?? dataset.kolam.saleCostSummary?.revenue
    ?? paidTotal;
  const yearTotal = paidSales.length;
  const salesGraphValues = dataset.kolam.salesGraph.map(point => point.value);
  const graphChange = getGraphChangePercent(salesGraphValues);

  return [
    buildStatCard(
      'today',
      todayTotal,
      getSalesChangePercent(todaySales, paidSales),
      getSparklineValues(salesGraphValues, todayTotal),
    ),
    buildStatCard(
      'month',
      monthTotal,
      graphChange,
      getSparklineValues(salesGraphValues, monthTotal),
    ),
    buildStatCard(
      'year',
      yearTotal,
      graphChange,
      getSparklineValues(salesGraphValues, yearTotal),
    ),
    buildStatCard(
      'all',
      paidTotal,
      getPaidSharePercent(paidSales, dataset.recentSales),
      getSparklineValues(salesGraphValues, paidTotal),
    ),
  ];
}

function buildStatCard(
  id: DashboardStatRange,
  value: number,
  changePercent: number,
  sparklineValues: number[],
): DashboardStatCard {
  const metric = getFallbackMetric(id);

  return {
    id,
    label: RANGE_LABELS[id],
    value: formatSummaryValue(value, metric),
    changeLabel: buildTrendLabel(changePercent),
    changeTone: changePercent >= 0 ? 'success' : 'danger',
    metric,
    breakdownTitle: getBreakdownTitle(metric),
    sparklineValues,
    channels: SOURCE_ORDER.map(channel => ({
      id: channel,
      label: SOURCE_LABEL_REPLACEMENTS[channel] ?? channel,
      value: formatFallbackChannelValue(channel, value, metric),
    })),
  };
}

function buildLiveStatCards(
  summaries: KolamDashboardSummary[],
): DashboardStatCard[] {
  const byRange = new Map(
    summaries
      .filter(summary => RANGE_LABELS[summary.range])
      .map(summary => [summary.range, summary]),
  );

  return (Object.keys(RANGE_LABELS) as DashboardStatRange[])
    .map(range => byRange.get(range))
    .filter((summary): summary is KolamDashboardSummary => Boolean(summary))
    .map(summary => {
      const metric = summary.metric ?? 'revenue';
      const changePercent = Number.isFinite(summary.change)
        ? summary.change
        : 0;

      return {
        id: summary.range,
        label: RANGE_LABELS[summary.range],
        value: formatSummaryValue(summary.value, metric),
        changeLabel: buildTrendLabel(changePercent),
        changeTone: changePercent >= 0 ? 'success' : 'danger',
        metric,
        breakdownTitle: getBreakdownTitle(metric),
        sparklineValues: getSparklineValues(
          summary.data.map(point => point.value),
          summary.value,
        ),
        channels: buildSourceBreakdownChannels(summary.bySource),
      };
    });
}

function buildSourceBreakdownChannels(
  breakdown?: KolamDashboardSourceBreakdown,
): DashboardStatChannel[] {
  if (!breakdown) {
    return [];
  }

  const {sourceOrder, maxItems, labelReplacements} =
    dashboardStatsVisualContract.sourceBreakdown;
  const sources = sourceOrder.filter(source => source in breakdown);
  const total = sources.reduce(
    (sum, source) => sum + (breakdown[source]?.value ?? 0),
    0,
  );

  return sources.slice(0, maxItems).map(source => {
    const value = breakdown[source]?.value ?? 0;
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;

    return {
      id: source,
      label: labelReplacements[source] ?? source,
      value: `${pct}%`,
    };
  });
}

function getFallbackMetric(
  id: DashboardStatRange,
): KolamDashboardSummaryMetric {
  if (id === 'month') {
    return 'margin';
  }

  if (id === 'year') {
    return 'order_count';
  }

  return 'revenue';
}

function formatSummaryValue(
  value: number,
  metric: KolamDashboardSummaryMetric,
): string {
  if (metric === 'order_count') {
    return `${value.toLocaleString('id-ID')} order`;
  }

  return `Rp ${formatRupiahCompact(value)}`;
}

function formatFallbackChannelValue(
  channel: DashboardStatChannel['id'],
  value: number,
  metric: KolamDashboardSummaryMetric,
) {
  const channelValue = channel === 'POS' ? value : 0;

  if (metric === 'order_count') {
    return `${channelValue.toLocaleString('id-ID')} order`;
  }

  return formatRupiahCompact(channelValue);
}

function getBreakdownTitle(metric: KolamDashboardSummaryMetric) {
  if (metric === 'order_count') {
    return 'Order per kanal';
  }

  if (metric === 'margin') {
    return 'Laba per kanal';
  }

  return 'Omzet per kanal';
}

function buildTrendLabel(changePercent: number) {
  return `${
    changePercent >= 0 ? '+' : ''
  }${changePercent}% vs periode sebelumnya`;
}

function sumSales(sales: SaleSummary[]): number {
  return sales.reduce((total, sale) => total + sale.total, 0);
}

function getSparklineValues(graphValues: number[], fallbackValue: number): number[] {
  const values = graphValues
    .filter(value => Number.isFinite(value))
    .slice(-dashboardStatsVisualContract.sparkline.maxPoints);

  if (values.length > 0) {
    return values;
  }

  return fallbackValue > 0 ? [0, fallbackValue] : [];
}

function getLatestSaleDate(sales: SaleSummary[]): string | null {
  return sales
    .map(sale => sale.createdAt.slice(0, 10))
    .sort()
    .at(-1) ?? null;
}

function getGraphChangePercent(values: number[]): number {
  const nonZero = values.filter(value => value > 0);
  if (nonZero.length < 2) {
    return 0;
  }

  const previous = nonZero.at(-2) ?? 0;
  const current = nonZero.at(-1) ?? 0;

  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Math.round(((current - previous) / previous) * 100);
}

function getSalesChangePercent(
  currentRange: SaleSummary[],
  allPaidSales: SaleSummary[],
): number {
  if (!allPaidSales.length) {
    return 0;
  }

  return Math.round((currentRange.length / allPaidSales.length) * 100);
}

function getPaidSharePercent(
  paidSales: SaleSummary[],
  allSales: SaleSummary[],
): number {
  if (!allSales.length) {
    return 0;
  }

  return Math.round((paidSales.length / allSales.length) * 100);
}

export function getDashboardStatsVisualContract(): DashboardStatsVisualContract {
  return {
    ...dashboardStatsVisualContract,
    grid: {
      ...dashboardStatsVisualContract.grid,
      columns: {...dashboardStatsVisualContract.grid.columns},
      breakpoints: {...dashboardStatsVisualContract.grid.breakpoints},
    },
    card: {...dashboardStatsVisualContract.card},
    header: {...dashboardStatsVisualContract.header},
    trend: {...dashboardStatsVisualContract.trend},
    sparkline: {...dashboardStatsVisualContract.sparkline},
    channelRows: {...dashboardStatsVisualContract.channelRows},
    sourceBreakdown: {
      ...dashboardStatsVisualContract.sourceBreakdown,
      sourceOrder: [...dashboardStatsVisualContract.sourceBreakdown.sourceOrder],
      labelReplacements: {
        ...dashboardStatsVisualContract.sourceBreakdown.labelReplacements,
      },
    },
  };
}

