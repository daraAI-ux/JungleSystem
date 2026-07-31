import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {KolamSalesOpsDetail} from '../src/components/kolam-sales-ops-detail';
import {normalizeKolamSale} from '../src/domain/kolam-sales';
import type {KolamSalesController} from '../src/hooks/use-kolam-sales-controller';
import {KolamButton} from '../src/components/kolam-button';
import {KolamStatusBadge} from '../src/components/kolam-status-badge';

jest.mock('../src/components/kolam-remote-image', () => ({
  KolamRemoteImage: () => null,
}));

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

function createController(
  salePayload: Record<string, unknown>,
): KolamSalesController {
  const selectedSale = normalizeKolamSale(salePayload);
  return {
    selectedSale,
    loading: false,
    mutating: false,
    downloadingInvoice: false,
    error: null,
    statusMessage: null,
    sources: [],
    livestockAllocations: [],
    onRefresh: jest.fn(async () => undefined),
    onRequestBiteshipPickup: jest.fn(async () => false),
    onRequestMarketplacePickup: jest.fn(async () => true),
    onDownloadInvoice: jest.fn(async () => false),
    onDownloadResi: jest.fn(async () => false),
    onUpdateStatus: jest.fn(async () => false),
    onUpdateDelivery: jest.fn(async () => false),
    onUploadPaymentProof: jest.fn(async () => false),
    onDeletePaymentProof: jest.fn(async () => false),
    onReplacePaymentProof: jest.fn(async () => false),
    onPickImage: jest.fn(async () => null),
  } as unknown as KolamSalesController;
}

describe('KolamSalesOpsDetail marketplace fulfillment', () => {
  it('shows Tokopedia pickup request and hides auto-managed copy', async () => {
    const controller = createController({
      _id: 'sale-tp-pickup',
      invoiceCode: 'INV-TP-P',
      status: 'paid',
      deliveryStatus: 'none',
      shippingCost: 0,
      items: [],
      saleHistories: [],
      externalRef: {
        source: 'tokopedia',
        tokopedia: {
          mainOrderId: 'TP-1',
          fulfillmentMode: 'pickup',
          lastStatus: 101,
        },
      },
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSalesOpsDetail controller={controller} />,
      );
    });

    const text = renderText(renderer!);
    expect(text).toContain('Request jemput kurir (Tokopedia)');
    expect(text).not.toContain(
      'Pengiriman marketplace dikelola otomatis dari platform.',
    );
    const pickupButton = renderer!.root
      .findAllByType(KolamButton)
      .find(node => node.props.label === 'Request jemput kurir (Tokopedia)');
    expect(pickupButton).toBeTruthy();
  });

  it('shows Tokopedia drop-off badge with counter link', async () => {
    const controller = createController({
      _id: 'sale-tp-drop',
      invoiceCode: 'INV-TP-D',
      status: 'paid',
      deliveryStatus: 'packing',
      shippingCost: 0,
      items: [],
      saleHistories: [],
      externalRef: {
        source: 'tokopedia',
        tokopedia: {
          mainOrderId: 'TP-2',
          fulfillmentMode: 'dropoff',
          dropOffPointUrl: 'https://tokopedia.test/dropoff/1',
          lastStatus: 101,
        },
      },
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSalesOpsDetail controller={controller} />,
      );
    });

    const text = renderText(renderer!);
    expect(text).toContain('Antar ke counter (Tokopedia)');
    expect(text).toContain('Lokasi counter');
    expect(text).not.toContain('Request jemput kurir (Tokopedia)');
    expect(text).not.toContain(
      'Pengiriman marketplace dikelola otomatis dari platform.',
    );
    const badge = renderer!.root
      .findAllByType(KolamStatusBadge)
      .find(node => node.props.label === 'Antar ke counter (Tokopedia)');
    expect(badge?.props.intent).toBe('warning');
  });

  it('does not show Tokopedia pickup or Shopee slot UI for eligible Shopee sales', async () => {
    const controller = createController({
      _id: 'sale-sh-pickup',
      invoiceCode: 'INV-SH-P',
      status: 'paid',
      deliveryStatus: 'none',
      shippingCost: 0,
      items: [],
      saleHistories: [],
      externalRef: {
        source: 'shopee',
        shopee: {
          mainOrderId: 'SH-9',
          fulfillmentMode: 'pickup',
          lastStatus: 1,
        },
      },
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSalesOpsDetail controller={controller} />,
      );
    });

    const text = renderText(renderer!);
    expect(text).not.toContain('Request jemput kurir (Tokopedia)');
    expect(text).not.toContain('Request jemput kurir (Shopee)');
    expect(text).not.toContain('Reschedule pickup');
    expect(text).not.toContain('Waktu pickup');
    expect(text).toContain(
      'Pengiriman marketplace dikelola otomatis dari platform.',
    );
  });
});
