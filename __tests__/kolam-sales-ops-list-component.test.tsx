import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {KolamSalesOpsSurface} from '../src/components/kolam-sales-ops-surface';
import {
  createInitialKolamSaleListFilters,
  normalizeKolamSale,
} from '../src/domain/kolam-sales';
import type {KolamSalesController} from '../src/hooks/use-kolam-sales-controller';
import {KolamStatusBadge} from '../src/components/kolam-status-badge';

jest.mock('../src/hooks/use-kolam-sales-controller', () => ({
  useKolamSalesController: () => mockController,
}));

jest.mock('../src/components/kolam-remote-image', () => ({
  KolamRemoteImage: () => null,
}));

jest.mock('../src/components/kolam-sales-ops-detail', () => ({
  KolamSalesOpsDetail: () => null,
}));

let mockController: KolamSalesController;

function renderText(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root
    .findAllByType(Text)
    .flatMap(node => flattenText(node.props.children));
}

function flattenText(value: React.ReactNode): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(flattenText);
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return [String(value)];
  }
  return [];
}

function createListController(salesPayload: Record<string, unknown>[]) {
  const sales = salesPayload.map(row => normalizeKolamSale(row));
  return {
    mode: 'list',
    sales,
    loading: false,
    mutating: false,
    exporting: false,
    error: null,
    statusMessage: null,
    filters: createInitialKolamSaleListFilters('/sales'),
    pagination: {page: 1, limit: 10, total: sales.length, totalPages: 1},
    analytics: {
      range: 'month',
      totalSales: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      byStatus: [],
      bySource: [],
    },
    analyticsLoading: false,
    analyticsRange: 'month',
    notificationSummary: {
      pendingApproval: 0,
      needsAction: 0,
      needDelivery: 0,
    },
    sources: [],
    onChangeFilters: jest.fn(),
    onClearFilters: jest.fn(),
    onLimitChange: jest.fn(),
    onPageChange: jest.fn(),
    onRefresh: jest.fn(async () => undefined),
    onSearchChange: jest.fn(),
    onSelectSale: jest.fn(),
    onExportList: jest.fn(async () => false),
    onAnalyticsRangeChange: jest.fn(),
  } as unknown as KolamSalesController;
}

describe('KolamSalesOpsSurface list delivery badges', () => {
  it('shows POS (tanpa kirim) for offline source sales instead of Butuh kirim', async () => {
    mockController = createListController([
      {
        _id: 'sale-pos-1',
        invoiceCode: 'INV-POS-1',
        status: 'paid',
        deliveryStatus: 'none',
        finalTotal: 50_000,
        transactionDate: '2026-07-31T00:00:00.000Z',
        items: [{_id: 'i1', itemType: 'product', quantity: 1}],
        sourceRef: {_id: 'src-pos', name: 'POS', type: 'offline'},
      },
    ]);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSalesOpsSurface route="/sales" />,
      );
    });

    const text = renderText(renderer!);
    expect(text).toContain('INV-POS-1');
    expect(text).toContain('POS (tanpa kirim)');
    expect(text).not.toContain('Butuh kirim');

    const deliveryBadge = renderer!.root
      .findAllByType(KolamStatusBadge)
      .find(node => node.props.label === 'POS (tanpa kirim)');
    expect(deliveryBadge?.props.intent).toBe('info');
  });

  it('shows Sumber as logo only when logo exists (name is accessibility, not cell text)', async () => {
    mockController = createListController([
      {
        _id: 'sale-src-1',
        invoiceCode: 'INV-SRC-1',
        status: 'paid',
        deliveryStatus: 'on_delivery',
        finalTotal: 88_000,
        transactionDate: '2026-07-31T00:00:00.000Z',
        items: [{_id: 'i1', itemType: 'product', quantity: 1}],
        sourceRef: {
          _id: 'src-tp',
          name: 'Tokopedia Store',
          type: 'online',
          logo: 'sources/tokopedia.png',
        },
      },
    ]);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSalesOpsSurface route="/sales" />,
      );
    });

    const text = renderText(renderer!);
    expect(text).toContain('INV-SRC-1');
    expect(text).not.toContain('Tokopedia Store');
  });

  it('falls back to Sumber name text when logo is missing', async () => {
    mockController = createListController([
      {
        _id: 'sale-src-2',
        invoiceCode: 'INV-SRC-2',
        status: 'paid',
        deliveryStatus: 'none',
        finalTotal: 10_000,
        transactionDate: '2026-07-31T00:00:00.000Z',
        items: [{_id: 'i1', itemType: 'product', quantity: 1}],
        sourceRef: {
          _id: 'src-offline',
          name: 'POS Cabang',
          type: 'offline',
        },
      },
    ]);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSalesOpsSurface route="/sales" />,
      );
    });

    const text = renderText(renderer!);
    expect(text).toContain('POS Cabang');
  });

  it('shows Layanan (tanpa kirim) for service-only online sales', async () => {
    mockController = createListController([
      {
        _id: 'sale-svc-1',
        invoiceCode: 'INV-SVC-1',
        status: 'paid',
        deliveryStatus: 'none',
        finalTotal: 75_000,
        transactionDate: '2026-07-31T00:00:00.000Z',
        items: [{_id: 'i1', itemType: 'service', quantity: 1}],
        sourceRef: {_id: 'src-web', name: 'Website', type: 'online'},
      },
    ]);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSalesOpsSurface route="/sales" />,
      );
    });

    const text = renderText(renderer!);
    expect(text).toContain('Layanan (tanpa kirim)');
    expect(text).not.toContain('Butuh kirim');
  });

  it('keeps normal shipping label for marketplace sales that need delivery', async () => {
    mockController = createListController([
      {
        _id: 'sale-tp-1',
        invoiceCode: 'INV-TP-1',
        status: 'paid',
        deliveryStatus: 'none',
        finalTotal: 100_000,
        transactionDate: '2026-07-31T00:00:00.000Z',
        items: [{_id: 'i1', itemType: 'product', quantity: 1}],
        sourceRef: {_id: 'src-tp', name: 'Tokopedia', type: 'online'},
        externalRef: {source: 'tokopedia', tokopedia: {mainOrderId: 'TP-1'}},
      },
    ]);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSalesOpsSurface route="/sales" />,
      );
    });

    const text = renderText(renderer!);
    expect(text).toContain('Butuh kirim');
    expect(text).not.toContain('POS (tanpa kirim)');
  });

  it('shows Menunggu dibawa ke gerai for Tokopedia drop-off waiting_pickup', async () => {
    mockController = createListController([
      {
        _id: 'sale-tp-drop-1',
        invoiceCode: 'INV-TP-DROP-1',
        status: 'paid',
        deliveryStatus: 'waiting_pickup',
        finalTotal: 120_000,
        transactionDate: '2026-07-31T00:00:00.000Z',
        items: [{_id: 'i1', itemType: 'product', quantity: 1}],
        sourceRef: {_id: 'src-tp', name: 'Tokopedia', type: 'online'},
        externalRef: {
          source: 'tokopedia',
          tokopedia: {
            mainOrderId: 'TP-DROP-1',
            fulfillmentMode: 'dropoff',
            lastStatus: 101,
          },
        },
      },
    ]);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSalesOpsSurface route="/sales" />,
      );
    });

    const text = renderText(renderer!);
    expect(text).toContain('Menunggu dibawa ke gerai');
    expect(text).not.toContain('Menunggu di jemput kurir');
  });
});
