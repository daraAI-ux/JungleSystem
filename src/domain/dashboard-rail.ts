import type {CatalogItem, SaleSummary} from './pos';
import {formatRupiah} from '../lib/money';
import {getKolamFileUrl} from '../lib/file-url';
import type {
  KolamDashboardLatest,
  KolamDashboardStockProduct,
  KolamDashboardTopSellingProduct,
} from '../services/kolam-api';
import type {UnifiedDataset} from '../services/unified-data';

export interface DashboardRailItem {
  id: string;
  label: string;
  value: string;
  meta: string;
  route: string;
  thumbnailUrl: string | null;
  trailingIconKind: 'chevron';
  rank?: number;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

export type DashboardRailIconKind =
  | 'circle-x'
  | 'triangle-warning'
  | 'trending'
  | 'circle-check';

export interface DashboardRailSection {
  id: 'out-of-stock' | 'low-stock' | 'top-sales';
  title: string;
  description: string;
  actionLabel: string;
  actionRoute: string;
  actionIconKind: 'chevron';
  emptyTitle: string;
  iconKind: DashboardRailIconKind;
  emptyIconKind: DashboardRailIconKind;
  items: DashboardRailItem[];
  tone: 'success' | 'warning' | 'danger';
}

export interface DashboardRailVisualContract {
  sourcePage: string;
  sourcePartials: {
    outOfStock: string;
    lowStock: string;
    topSelling: string;
  };
  card: {
    radius: number;
    radiusSourceClass: 'rounded-3xl';
  };
  layout: {
    cardMinWidth: number;
    cardBasisPercent: number;
    cardGap: number;
    cardPadding: number;
    gridColumns: {
      base: number;
      tablet: number;
      desktop: number;
    };
    headerPaddingX: number;
    headerPaddingY: number;
    headerIconVisible: false;
    rowGapX: number;
    rowPaddingX: number;
    rowPaddingY: number;
    rowMinHeight: number;
    showDescription: boolean;
    thumbSize: number;
    thumbRadius: number;
    thumbBorderWidth: number;
    thumbBorderColor: string;
    thumbBackgroundColor: string;
    iconShellSize: number;
    iconShellRadius: number;
  };
  list: {
    maxItems: number;
    maxItemsSource: 'live-page-slice';
    showItemMeta: boolean;
    showRowChevron: boolean;
    rankSize: number;
  };
  valueDisplay: {
    dangerShape: 'circle';
    warningShape: 'badge';
    successShape: 'plain-text';
    dangerSize: number;
    dangerFontWeight: 'semibold';
    successFontWeight: 'medium';
    warningFontWeight: 'medium';
    tabularNumbers: boolean;
  };
  text: {
    actionToneFollowsSection: boolean;
    emptyIconVisible: false;
    headerDescriptionGapY: number;
    headerDescriptionFontSize: number;
    headerTitleFontSize: number;
    rowLabelFontSize: number;
    rowLabelFontWeight: 'regular';
    rowMetaGapY: number;
    rowMetaFontSize: number;
    emptyTitleFontSize: number;
    emptyTitleFontWeight: 'regular';
    emptyTitleTone: 'mutedFg';
    thumbPlaceholderFontSize: number;
    thumbPlaceholderText: '—';
  };
}

const dashboardRailVisualContract: DashboardRailVisualContract = {
  sourcePage:
    'E:\\Projects\\_latest-da\\da-inventory-frontend\\src\\app\\(app)\\(dashboard)\\page.tsx',
  sourcePartials: {
    outOfStock:
      'E:\\Projects\\_latest-da\\da-inventory-frontend\\src\\app\\(app)\\(dashboard)\\(partials)\\latest-outofstockproduct.tsx',
    lowStock:
      'E:\\Projects\\_latest-da\\da-inventory-frontend\\src\\app\\(app)\\(dashboard)\\(partials)\\latest-lowstockproduct.tsx',
    topSelling:
      'E:\\Projects\\_latest-da\\da-inventory-frontend\\src\\app\\(app)\\(dashboard)\\(partials)\\latest-topsellingproduct.tsx',
  },
  card: {
    radius: 24,
    radiusSourceClass: 'rounded-3xl',
  },
  layout: {
    cardMinWidth: 220,
    cardBasisPercent: 31,
    cardGap: 10,
    cardPadding: 0,
    gridColumns: {
      base: 1,
      tablet: 2,
      desktop: 3,
    },
    headerPaddingX: 16,
    headerPaddingY: 12,
    headerIconVisible: false,
    rowGapX: 12,
    rowPaddingX: 16,
    rowPaddingY: 12,
    rowMinHeight: 64,
    showDescription: false,
    thumbSize: 40,
    thumbRadius: 14,
    thumbBorderWidth: 1,
    thumbBorderColor: '#e2e8f0',
    thumbBackgroundColor: '#f8fafc',
    iconShellSize: 28,
    iconShellRadius: 14,
  },
  list: {
    maxItems: 3,
    maxItemsSource: 'live-page-slice',
    showItemMeta: false,
    showRowChevron: false,
    rankSize: 20,
  },
  valueDisplay: {
    dangerShape: 'circle',
    warningShape: 'badge',
    successShape: 'plain-text',
    dangerSize: 28,
    dangerFontWeight: 'semibold',
    successFontWeight: 'medium',
    warningFontWeight: 'medium',
    tabularNumbers: true,
  },
  text: {
    actionToneFollowsSection: true,
    emptyIconVisible: false,
    headerDescriptionGapY: 3,
    headerDescriptionFontSize: 11,
    headerTitleFontSize: 16,
    rowLabelFontSize: 14,
    rowLabelFontWeight: 'regular',
    rowMetaGapY: 3,
    rowMetaFontSize: 11,
    emptyTitleFontSize: 14,
    emptyTitleFontWeight: 'regular',
    emptyTitleTone: 'mutedFg',
    thumbPlaceholderFontSize: 10,
    thumbPlaceholderText: '—',
  },
};

export function getDashboardRailSections(
  dataset: UnifiedDataset,
): DashboardRailSection[] {
  const liveLatest = dataset.kolam.dashboardLatest;
  const outOfStockItems = liveLatest
    ? getLiveOutOfStockItems(liveLatest.outOfStockProducts)
    : getOutOfStockItems(dataset.catalog);
  const lowStockItems = liveLatest
    ? getLiveLowStockItems(liveLatest.lowStockProducts)
    : getLowStockItems(dataset.catalog);
  const topSellingItems = liveLatest
    ? getLiveTopSellingItems(liveLatest.topSellingProducts)
    : getTopSellingProductItems(dataset.catalog, dataset.recentSales);

  return [
    {
      id: 'out-of-stock',
      title: 'Stok Habis',
      description: describeCount(
        outOfStockItems.length,
        'produk perlu restock',
        'produk perlu restock',
        'Semua produk tersedia',
      ),
      actionLabel: 'Lihat semua',
      actionRoute: '/products?stockStatus=out_of_stock',
      actionIconKind: 'chevron',
      emptyTitle: 'Semua produk tersedia',
      iconKind: 'circle-x',
      emptyIconKind: 'circle-check',
      items: outOfStockItems,
      tone: 'danger',
    },
    {
      id: 'low-stock',
      title: 'Stok Menipis',
      description: describeCount(
        lowStockItems.length,
        'produk stok menipis',
        'produk stok menipis',
        'Semua stok dalam batas aman',
      ),
      actionLabel: 'Lihat semua',
      actionRoute: '/products?stockStatus=low_stock',
      actionIconKind: 'chevron',
      emptyTitle: 'Semua stok dalam batas aman',
      iconKind: 'triangle-warning',
      emptyIconKind: 'circle-check',
      items: lowStockItems,
      tone: 'warning',
    },
    {
      id: 'top-sales',
      title: 'Produk Terlaris',
      description: describeCount(
        topSellingItems.length,
        'produk terlaris periode ini',
        'produk terlaris periode ini',
        'Belum ada data penjualan',
      ),
      actionLabel: 'Lihat semua',
      actionRoute: '/products?sortBy=sales&sortOrder=desc',
      actionIconKind: 'chevron',
      emptyTitle: 'Belum ada data penjualan',
      iconKind: 'trending',
      emptyIconKind: 'trending',
      items: topSellingItems,
      tone: 'success',
    },
  ];
}

function getLiveOutOfStockItems(
  products: KolamDashboardLatest['outOfStockProducts'],
): DashboardRailItem[] {
  return products
    .slice(0, dashboardRailVisualContract.list.maxItems)
    .map(product => mapLiveStockProduct(product, 'danger', '0'));
}

function getLiveLowStockItems(
  products: KolamDashboardLatest['lowStockProducts'],
): DashboardRailItem[] {
  return products
    .slice(0, dashboardRailVisualContract.list.maxItems)
    .map(product => mapLiveStockProduct(product, 'warning', `${product.stock}`));
}

function getLiveTopSellingItems(
  products: KolamDashboardLatest['topSellingProducts'],
): DashboardRailItem[] {
  return products
    .slice(0, dashboardRailVisualContract.list.maxItems)
    .map((product, index) => mapLiveTopSellingProduct(product, index));
}

function mapLiveStockProduct(
  product: KolamDashboardStockProduct,
  tone: DashboardRailItem['tone'],
  value: string,
): DashboardRailItem {
  return {
    id: product._id,
    label: product.name,
    value,
    meta: 'Produk live dashboard.latest',
    route: `/products/${product._id}`,
    thumbnailUrl: getKolamFileUrl(product.photos?.[0]),
    trailingIconKind: 'chevron',
    tone,
  };
}

function mapLiveTopSellingProduct(
  product: KolamDashboardTopSellingProduct,
  index: number,
): DashboardRailItem {
  return {
    id: product.productId,
    label: product.name,
    value: `Terjual ${product.totalSold}`,
    meta: `Stok ${product.stock}`,
    route: `/products/${product.productId}`,
    thumbnailUrl: getKolamFileUrl(product.photo),
    trailingIconKind: 'chevron',
    rank: index + 1,
    tone: 'success',
  };
}

function getOutOfStockItems(catalog: CatalogItem[]): DashboardRailItem[] {
  return catalog
    .filter(item => item.stock <= 0)
    .slice(0, dashboardRailVisualContract.list.maxItems)
    .map(item => ({
      id: item.id,
      label: item.name,
      value: `${item.stock}`,
      meta: `${item.type} - ${item.code}`,
      route: `/products/${item.id}`,
      thumbnailUrl: null,
      trailingIconKind: 'chevron',
      tone: 'danger',
    }));
}

function getLowStockItems(catalog: CatalogItem[]): DashboardRailItem[] {
  return catalog
    .filter(item => item.stock > 0 && item.stock <= item.lowStockThreshold)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, dashboardRailVisualContract.list.maxItems)
    .map(item => ({
      id: item.id,
      label: item.name,
      value: `${item.stock}`,
      meta: `${item.category} - ${item.type}`,
      route: `/products/${item.id}`,
      thumbnailUrl: null,
      trailingIconKind: 'chevron',
      tone: 'warning',
    }));
}

function getTopSellingProductItems(
  catalog: CatalogItem[],
  sales: SaleSummary[],
): DashboardRailItem[] {
  const catalogById = new Map(catalog.map(item => [item.id, item]));
  const totals = new Map<
    string,
    {
      id: string;
      label: string;
      itemType: CatalogItem['type'];
      code: string;
      quantity: number;
      revenue: number;
    }
  >();

  sales
    .filter(sale => sale.status !== 'cancelled')
    .flatMap(sale => sale.items ?? [])
    .forEach(item => {
      const catalogItem = catalogById.get(item.itemId);
      const existing = totals.get(item.itemId);
      const quantity = item.quantity || 1;
      const revenue =
        item.subtotal ?? (catalogItem?.price ? catalogItem.price * quantity : 0);

      totals.set(item.itemId, {
        id: item.itemId,
        label: catalogItem?.name ?? item.name ?? item.itemId,
        itemType: catalogItem?.type ?? item.itemType,
        code: catalogItem?.code ?? '-',
        quantity: (existing?.quantity ?? 0) + quantity,
        revenue: (existing?.revenue ?? 0) + revenue,
      });
    });

  return [...totals.values()]
    .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
    .slice(0, dashboardRailVisualContract.list.maxItems)
    .map((item, index) => ({
      id: item.id,
      label: item.label,
      value: `Terjual ${item.quantity}`,
      meta: `${formatRupiah(item.revenue)} - ${item.itemType} - ${item.code}`,
      route:
        item.itemType === 'species'
          ? `/species/${item.id}`
          : `/products/${item.id}`,
      thumbnailUrl: null,
      trailingIconKind: 'chevron' as const,
      rank: index + 1,
      tone: 'success' as const,
    }));

}

function describeCount(
  count: number,
  singular: string,
  plural: string,
  empty: string,
) {
  if (count === 0) {
    return empty;
  }

  return `${count} ${count === 1 ? singular : plural}`;
}

export function getDashboardRailVisualContract(): DashboardRailVisualContract {
  return {
    ...dashboardRailVisualContract,
    sourcePartials: {...dashboardRailVisualContract.sourcePartials},
    card: {...dashboardRailVisualContract.card},
    layout: {
      ...dashboardRailVisualContract.layout,
      gridColumns: {...dashboardRailVisualContract.layout.gridColumns},
    },
    list: {...dashboardRailVisualContract.list},
    valueDisplay: {...dashboardRailVisualContract.valueDisplay},
    text: {...dashboardRailVisualContract.text},
  };
}




