import {formatRupiah} from '../lib/money';
import type {
  KolamDashboardActionRequired,
  KolamDashboardActionRequiredReason,
  KolamDashboardActionRequiredSale,
} from '../services/kolam-api';
import type {UnifiedDataset} from '../services/unified-data';
import type {SaleSummary} from './pos';

export type DashboardPendingRange = 'today' | 'month' | 'year' | 'all';
export type DashboardPendingChannel = 'marketplace' | 'pos' | 'backoffice';
export type DashboardPendingOrderKind = 'standard' | 'custom';
export type DashboardPendingOrderSectionId = DashboardPendingOrderKind;

export interface DashboardPendingChannelCount {
  id: DashboardPendingChannel;
  label: string;
  count: number;
}

export interface DashboardPendingOrderRange {
  id: DashboardPendingRange;
  label: string;
  value: string;
  count: number;
  channels: DashboardPendingChannelCount[];
}

export interface DashboardPendingOrderItem {
  id: string;
  kind: DashboardPendingOrderKind;
  invoiceCode: string;
  sourceName: string;
  totalLabel: string;
  createdAtLabel: string;
  reasonLabels: string[];
  statusLabel: string;
  deliveryLabel: string;
  lifecycleLabel?: string;
  route: string;
}

export interface DashboardPendingOrderSection {
  id: DashboardPendingOrderSectionId;
  title: string;
  count: number;
  items: DashboardPendingOrderItem[];
}

export interface DashboardPendingOrdersPanel {
  total: number;
  customTotal: number;
  capped: boolean;
  cappedLabel?: string;
  description: string;
  emptyLabel: 'Tidak ada pesanan yang perlu ditindak lanjuti.';
  ranges: DashboardPendingOrderRange[];
  sections: DashboardPendingOrderSection[];
  source: 'live' | 'fallback' | 'empty';
}

export interface DashboardPendingOrdersDescriptor {
  title: 'Pesanan perlu ditindak lanjuti';
  description: 'Penjualan umum (belum lunas / belum kirim) dan proyek kustom aktif';
  actionLabel: 'Lihat semua';
  actionRoute: '/sales?needsAction=1';
  actionIconKind: 'chevron';
  iconKind: 'clock';
}

export interface DashboardPendingOrdersVisualContract {
  sourcePartial: string;
  card: {
    padding: number;
    radius: number;
  };
  header: {
    borderBottom: boolean;
    minHeight: number;
    paddingX: number;
    paddingY: number;
    gapY: number;
    titleRowMinHeight: number;
    titleRowGapX: number;
    actionGapX: number;
    iconSize: number;
    titleFontSize: number;
    descriptionFontSize: number;
    actionColor: 'primary';
    actionFontSize: number;
  };
  clockIcon: {
    borderWidth: number;
    handRadius: number;
    hourHandWidth: number;
    hourHandHeight: number;
    hourHandTranslateY: number;
    minuteHandWidth: number;
    minuteHandHeight: number;
    minuteHandTranslateX: number;
  };
  content: {
    gridGap: number;
    paddingX: number;
    paddingBottom: number;
    sectionHeaderBackground: 'mutedSoft';
    sectionHeaderPaddingX: number;
    sectionHeaderPaddingY: number;
    sectionTitleFontSize: number;
    rowPaddingX: number;
    rowPaddingY: number;
    rowGapX: number;
    rowGapY: number;
    cappedPaddingY: number;
    cappedFontSize: number;
    emptyPaddingY: number;
    emptyFontSize: number;
  };
  row: {
    invoiceMinWidth: number;
    invoiceFontSize: number;
    metaGapY: number;
    metaFontSize: number;
    totalFontSize: number;
    badgeFontSize: number;
    metaRowGapX: number;
    countFontSize: number;
    badgesGapX: number;
    badgesGapY: number;
    statusGroupMarginLeft: 'auto';
  };
  range: {
    minWidth: number;
    labelFontSize: number;
    valueFontSize: number;
    badgeFontSize: number;
    gapY: number;
  };
}

export const dashboardPendingOrdersDescriptor: DashboardPendingOrdersDescriptor =
  {
    title: 'Pesanan perlu ditindak lanjuti',
    description:
      'Penjualan umum (belum lunas / belum kirim) dan proyek kustom aktif',
    actionLabel: 'Lihat semua',
    actionRoute: '/sales?needsAction=1',
    actionIconKind: 'chevron',
    iconKind: 'clock',
  };

const dashboardPendingOrdersVisualContract: DashboardPendingOrdersVisualContract = {
  sourcePartial:
    'E:\\Projects\\_latest-da\\da-inventory-frontend\\src\\app\\(app)\\(dashboard)\\(partials)\\pending-orders.tsx',
  card: {
    padding: 0,
    radius: 22,
  },
  header: {
    borderBottom: true,
    minHeight: 42,
    paddingX: 16,
    paddingY: 16,
    gapY: 4,
    titleRowMinHeight: 20,
    titleRowGapX: 8,
    actionGapX: 4,
    iconSize: 16,
    titleFontSize: 14,
    descriptionFontSize: 12,
    actionColor: 'primary',
    actionFontSize: 14,
  },
  clockIcon: {
    borderWidth: 2,
    handRadius: 999,
    hourHandWidth: 2,
    hourHandHeight: 5,
    hourHandTranslateY: -2,
    minuteHandWidth: 6,
    minuteHandHeight: 2,
    minuteHandTranslateX: 2,
  },
  content: {
    gridGap: 0,
    paddingX: 0,
    paddingBottom: 0,
    sectionHeaderBackground: 'mutedSoft',
    sectionHeaderPaddingX: 20,
    sectionHeaderPaddingY: 8,
    sectionTitleFontSize: 11,
    rowPaddingX: 20,
    rowPaddingY: 14,
    rowGapX: 12,
    rowGapY: 8,
    cappedPaddingY: 12,
    cappedFontSize: 11,
    emptyPaddingY: 28,
    emptyFontSize: 12,
  },
  row: {
    invoiceMinWidth: 112,
    invoiceFontSize: 13,
    metaGapY: 3,
    metaFontSize: 12,
    totalFontSize: 12,
    badgeFontSize: 10,
    metaRowGapX: 5,
    countFontSize: 11,
    badgesGapX: 4,
    badgesGapY: 4,
    statusGroupMarginLeft: 'auto',
  },
  range: {
    minWidth: 150,
    labelFontSize: 12,
    valueFontSize: 20,
    badgeFontSize: 10,
    gapY: 4,
  },
};

const RANGE_LABELS: Record<DashboardPendingRange, string> = {
  today: 'Hari Ini',
  month: 'Bulan Ini',
  year: 'Tahun Ini',
  all: 'Semua',
};

const CHANNELS: DashboardPendingChannel[] = ['marketplace', 'pos', 'backoffice'];

const CHANNEL_LABELS: Record<DashboardPendingChannel, string> = {
  marketplace: 'Website',
  pos: 'POS',
  backoffice: 'Backoffice',
};

const REASON_LABELS: Record<KolamDashboardActionRequiredReason, string> = {
  belum_bayar: 'Belum bayar',
  belum_kirim: 'Belum kirim',
  proyek_kustom: 'Kustom',
  cp_penawaran: 'Penawaran',
  cp_dp: 'DP',
  cp_desain: 'Desain',
};

export function getDashboardPendingOrders(
  dataset: UnifiedDataset,
): DashboardPendingOrdersPanel {
  const liveActionRequired = dataset.kolam.dashboardActionRequired;
  const fallbackActionRequired = buildFallbackActionRequired(dataset.recentSales);
  const actionRequired: KolamDashboardActionRequired = liveActionRequired
    ? liveActionRequired
    : fallbackActionRequired;
  const source = liveActionRequired
    ? 'live'
    : actionRequired.items.length
      ? 'fallback'
      : 'empty';

  return buildPendingOrdersPanel({
    actionRequired,
    ranges: buildPendingRanges(dataset.recentSales),
    source,
  });
}

export function getDashboardPendingOrdersDescriptor(): DashboardPendingOrdersDescriptor {
  return dashboardPendingOrdersDescriptor;
}

export function getDashboardPendingOrdersVisualContract(): DashboardPendingOrdersVisualContract {
  return {
    ...dashboardPendingOrdersVisualContract,
    card: {...dashboardPendingOrdersVisualContract.card},
    header: {...dashboardPendingOrdersVisualContract.header},
    clockIcon: {...dashboardPendingOrdersVisualContract.clockIcon},
    content: {...dashboardPendingOrdersVisualContract.content},
    row: {...dashboardPendingOrdersVisualContract.row},
    range: {...dashboardPendingOrdersVisualContract.range},
  };
}

function buildPendingOrdersPanel({
  actionRequired,
  ranges,
  source,
}: {
  actionRequired: KolamDashboardActionRequired;
  ranges: DashboardPendingOrderRange[];
  source: DashboardPendingOrdersPanel['source'];
}): DashboardPendingOrdersPanel {
  const items = actionRequired.items.map(mapActionRequiredSale);
  const standardItems = items.filter(item => item.kind !== 'custom');
  const customItems = items.filter(item => item.kind === 'custom');
  const total = actionRequired.total ?? items.length;
  const customTotal = actionRequired.counts?.custom ?? customItems.length;
  const sections = [
    buildSection('standard', 'Penjualan umum', standardItems),
    buildSection('custom', 'Proyek kustom', customItems),
  ].filter(section => section.items.length > 0);

  return {
    total,
    customTotal,
    capped: Boolean(actionRequired.capped),
    cappedLabel: actionRequired.capped
      ? `Menampilkan ${items.length} dari ${total} pesanan. Gunakan "Lihat semua" untuk daftar lengkap.`
      : undefined,
    description: buildDescription(total, customTotal),
    emptyLabel: 'Tidak ada pesanan yang perlu ditindak lanjuti.',
    ranges,
    sections,
    source,
  };
}

function buildSection(
  id: DashboardPendingOrderSectionId,
  title: string,
  items: DashboardPendingOrderItem[],
): DashboardPendingOrderSection {
  return {
    id,
    title,
    count: items.length,
    items,
  };
}

function mapActionRequiredSale(
  sale: KolamDashboardActionRequiredSale,
): DashboardPendingOrderItem {
  return {
    id: sale.id,
    kind: sale.kind,
    invoiceCode: sale.invoiceCode,
    sourceName: sale.sourceName || 'Kolam',
    totalLabel: formatRupiahShort(sale.finalTotal),
    createdAtLabel: formatDateId(sale.createdAt),
    reasonLabels: sale.reasons.map(reason => REASON_LABELS[reason] ?? reason),
    statusLabel: formatPaymentStatus(sale.status),
    deliveryLabel: formatDeliveryStatus(sale.deliveryStatus, sale.status),
    lifecycleLabel: sale.customProject?.lifecycleLabel,
    route: `/sales/${sale.id}`,
  };
}

function buildFallbackActionRequired(
  sales: SaleSummary[],
): KolamDashboardActionRequired {
  const items = sales.filter(isPendingSale).map<KolamDashboardActionRequiredSale>(
    sale => ({
      id: sale.id,
      kind: 'standard',
      invoiceCode: sale.invoiceCode,
      status: sale.status,
      deliveryStatus: sale.status === 'sent' ? 'sent' : 'none',
      finalTotal: sale.total,
      createdAt: sale.createdAt,
      sourceName: 'POS',
      reasons: sale.status === 'sent' ? ['belum_kirim'] : ['belum_bayar'],
      customProject: null,
    }),
  );

  return {
    total: items.length,
    items,
    capped: false,
    counts: {
      standard: items.length,
      custom: 0,
    },
  };
}

function buildPendingRanges(sales: SaleSummary[]): DashboardPendingOrderRange[] {
  const pendingSales = sales.filter(isPendingSale);
  if (!pendingSales.length) {
    return [];
  }

  const referenceDate = getLatestSaleDate(sales);
  const ranges: DashboardPendingRange[] = ['today', 'month', 'year', 'all'];

  return ranges.map(range => buildPendingRange(range, pendingSales, referenceDate));
}

function buildPendingRange(
  range: DashboardPendingRange,
  sales: SaleSummary[],
  referenceDate: string | null,
): DashboardPendingOrderRange {
  const rangeSales = filterSalesForRange(range, sales, referenceDate);

  return {
    id: range,
    label: RANGE_LABELS[range],
    value: formatRupiah(sumSales(rangeSales)),
    count: rangeSales.length,
    channels: CHANNELS.map(channel => ({
      id: channel,
      label: CHANNEL_LABELS[channel],
      count: channel === 'pos' ? rangeSales.length : 0,
    })),
  };
}

function filterSalesForRange(
  range: DashboardPendingRange,
  sales: SaleSummary[],
  referenceDate: string | null,
) {
  if (range === 'all' || !referenceDate) {
    return sales;
  }

  const referenceMonth = referenceDate.slice(0, 7);
  const referenceYear = referenceDate.slice(0, 4);

  return sales.filter(sale => {
    const saleDate = sale.createdAt.slice(0, 10);

    if (range === 'today') {
      return saleDate === referenceDate;
    }

    if (range === 'month') {
      return saleDate.slice(0, 7) === referenceMonth;
    }

    return saleDate.slice(0, 4) === referenceYear;
  });
}

function isPendingSale(sale: SaleSummary) {
  return sale.status === 'pending' || sale.status === 'sent';
}

function sumSales(sales: SaleSummary[]) {
  return sales.reduce((total, sale) => total + sale.total, 0);
}

function getLatestSaleDate(sales: SaleSummary[]) {
  return (
    sales
      .map(sale => sale.createdAt.slice(0, 10))
      .sort()
      .at(-1) ?? null
  );
}

function buildDescription(total: number, customTotal: number) {
  return `Penjualan umum (belum lunas / belum kirim) dan proyek kustom aktif (${total} pesanan${
    customTotal > 0 ? `, ${customTotal} kustom` : ''
  })`;
}

function formatDateId(iso: string) {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  });
}

function formatRupiahShort(value: number): string {
  if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1)}Jt`;
  }

  if (value >= 1_000) {
    return `Rp ${(value / 1_000).toFixed(1)}Rb`;
  }

  return `Rp ${value.toLocaleString('id-ID')}`;
}

function formatPaymentStatus(status: string) {
  const normalized = status.toLowerCase();

  const labels: Record<string, string> = {
    draft: 'Draft',
    pending: 'Menunggu persetujuan finance',
    sent: 'Menunggu bayar',
    unpaid: 'Belum bayar',
    paid: 'Lunas',
    partial_paid: 'Bayar sebagian',
    cancelled: 'Dibatalkan',
  };

  if (labels[normalized]) {
    return labels[normalized];
  }

  return status || '—';
}

function formatDeliveryStatus(deliveryStatus: string, paymentStatus: string) {
  const payment = paymentStatus.toLowerCase();
  const normalized = (deliveryStatus || 'none').toLowerCase();

  if (payment === 'cancelled') {
    return 'Dibatalkan';
  }

  if (payment === 'paid' && normalized === 'none') {
    return 'Butuh kirim';
  }

  if (payment === 'paid' && normalized === 'packing') {
    return 'Sedang dipacking';
  }

  if (normalized === 'waiting_complaints' || normalized === 'complaint') {
    return 'Terkirim';
  }

  if (normalized === 'none') {
    return 'Belum dikirim';
  }

  if (normalized === 'packing') {
    return 'Sedang dipacking';
  }

  if (normalized === 'waiting_pickup') {
    return 'Menunggu di jemput kurir';
  }

  if (normalized === 'on_delivery') {
    return 'Dalam pengiriman';
  }

  if (normalized === 'delivered') {
    return 'Terkirim';
  }

  if (normalized === 'success') {
    return 'Pengiriman selesai';
  }

  return deliveryStatus || '—';
}
