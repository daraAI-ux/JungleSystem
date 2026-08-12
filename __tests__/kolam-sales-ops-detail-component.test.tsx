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
    onRequestMarketplaceDropoff: jest.fn(async () => true),
    onLoadMarketplacePickupOptions: jest.fn(async () => null),
    onDownloadInvoice: jest.fn(async () => false),
    onDownloadResi: jest.fn(async () => false),
    onOpenCustomerChat: jest.fn(async () => false),
    openingCustomerChat: false,
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

    await act(async () => {
      pickupButton!.props.onPress();
    });
    expect(controller.onRequestMarketplacePickup).toHaveBeenCalledTimes(1);
  });

  it('shows Tokopedia pickup for fulfillmentMode both', async () => {
    const controller = createController({
      _id: 'sale-tp-both',
      invoiceCode: 'INV-TP-B',
      status: 'paid',
      deliveryStatus: 'none',
      shippingCost: 0,
      items: [],
      saleHistories: [],
      externalRef: {
        source: 'tokopedia',
        tokopedia: {
          mainOrderId: 'TP-BOTH',
          fulfillmentMode: 'both',
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
    expect(text).not.toContain('Antar ke counter (Tokopedia)');
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

  it('shows drop-off badge without counter link when URL is missing', async () => {
    const controller = createController({
      _id: 'sale-tp-drop-nourl',
      invoiceCode: 'INV-TP-DN',
      status: 'paid',
      deliveryStatus: 'none',
      shippingCost: 0,
      items: [],
      saleHistories: [],
      externalRef: {
        source: 'tokopedia',
        tokopedia: {
          mainOrderId: 'TP-3',
          fulfillmentMode: 'dropoff',
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
    expect(text).not.toContain('Lokasi counter');
    expect(text).not.toContain('Request jemput kurir (Tokopedia)');
  });

  it('keeps auto-managed copy when Tokopedia shipment sync already started', async () => {
    const controller = createController({
      _id: 'sale-tp-synced',
      invoiceCode: 'INV-TP-S',
      status: 'paid',
      deliveryStatus: 'waiting_pickup',
      shippingCost: 0,
      items: [],
      saleHistories: [],
      externalRef: {
        source: 'tokopedia',
        tokopedia: {
          mainOrderId: 'TP-4',
          fulfillmentMode: 'pickup',
          lastStatus: 102,
          trackingNumber: 'RESI-SYNC',
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
    expect(text).not.toContain('Antar ke counter (Tokopedia)');
    expect(text).toContain(
      'Pengiriman marketplace dikelola otomatis dari platform.',
    );
  });

  it('shows Shopee request jemput CTA for eligible pickup sales', async () => {
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
    (
      controller.onLoadMarketplacePickupOptions as jest.Mock
    ).mockResolvedValue({
      platform: 'shopee',
      carrier: 'SPX',
      addressWarning: '',
      fulfillmentMode: 'pickup',
      pickupSupported: true,
      dropoffSupported: false,
      uiHint: '',
      dropoffBranches: [],
      options: [
        {
          id: 'slot-1',
          pickupTime: 200,
          pickupTimeRangeId: 2,
          dateLabel: 'Besok',
          timeLabel: '09:00',
          label: 'Besok 09:00',
          isNow: false,
        },
      ],
      defaultOption: null,
      pickupArranged: null,
      pickupEditable: true,
      mode: 'arrange',
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSalesOpsDetail controller={controller} />,
      );
    });
    await act(async () => {
      await Promise.resolve();
    });

    const text = renderText(renderer!);
    expect(text).not.toContain('Request jemput kurir (Tokopedia)');
    expect(text).toContain('Request jemput kurir (Shopee)');
    expect(text).not.toContain(
      'Pengiriman marketplace dikelola otomatis dari platform.',
    );

    const button = renderer!.root
      .findAllByType(KolamButton)
      .find(node => node.props.label === 'Request jemput kurir (Shopee)');
    expect(button).toBeTruthy();
    await act(async () => {
      button!.props.onPress();
    });
    expect(text).not.toContain('Waktu pickup'); // modal content uses dropdown; open after press
  });

  it('shows Shopee drop-off arrange CTA for dropoff sales', async () => {
    const controller = createController({
      _id: 'sale-sh-drop',
      invoiceCode: 'INV-SH-D',
      status: 'paid',
      deliveryStatus: 'packing',
      shippingCost: 0,
      items: [],
      saleHistories: [],
      externalRef: {
        source: 'shopee',
        shopee: {
          mainOrderId: 'SH-D',
          fulfillmentMode: 'dropoff',
          lastStatus: 1,
        },
      },
    });
    (
      controller.onLoadMarketplacePickupOptions as jest.Mock
    ).mockResolvedValue({
      platform: 'shopee',
      carrier: 'SPX',
      addressWarning: '',
      fulfillmentMode: 'dropoff',
      pickupSupported: false,
      dropoffSupported: true,
      uiHint: '',
      dropoffBranches: [],
      options: [],
      defaultOption: null,
      pickupArranged: null,
      pickupEditable: null,
      mode: 'dropoff',
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSalesOpsDetail controller={controller} />,
      );
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    const dropBadge = renderer!.root
      .findAllByType(KolamStatusBadge)
      .find(node =>
        String(node.props.label || '').includes('Drop-off (Shopee)'),
      );
    const arrangeBtn = renderer!.root
      .findAllByType(KolamButton)
      .find(node => node.props.label === 'Antar ke counter (Shopee)');
    expect(dropBadge).toBeTruthy();
    expect(arrangeBtn).toBeTruthy();
    expect(
      renderer!.root
        .findAllByType(KolamButton)
        .some(node => node.props.label === 'Request jemput kurir (Shopee)'),
    ).toBe(false);
  });

  it('shows Kirim pesan ke customer for Shopee and Tokopedia sales', async () => {
    const shopeeController = createController({
      _id: 'sale-sh-chat',
      invoiceCode: 'INV-SH-C',
      status: 'paid',
      deliveryStatus: 'none',
      shippingCost: 0,
      items: [],
      saleHistories: [],
      externalRef: {
        source: 'shopee',
        shopee: {mainOrderId: 'SH-CHAT'},
      },
    });
    const tokopediaController = createController({
      _id: 'sale-tp-chat',
      invoiceCode: 'INV-TP-C',
      status: 'paid',
      deliveryStatus: 'none',
      shippingCost: 0,
      items: [],
      saleHistories: [],
      externalRef: {
        source: 'tokopedia',
        tokopedia: {mainOrderId: 'TP-CHAT', fulfillmentMode: 'pickup'},
      },
    });
    const nestedSourceController = createController({
      _id: 'sale-nested-chat',
      invoiceCode: 'INV-NEST-C',
      status: 'paid',
      deliveryStatus: 'none',
      shippingCost: 0,
      items: [],
      saleHistories: [],
      externalRef: {
        shopee: {mainOrderId: 'SH-NEST-CHAT'},
      },
    });
    const offlineController = createController({
      _id: 'sale-off',
      invoiceCode: 'INV-OFF',
      status: 'paid',
      deliveryStatus: 'none',
      shippingCost: 0,
      type: 'offline',
      items: [],
      saleHistories: [],
    });

    let shopeeRenderer: ReactTestRenderer.ReactTestRenderer;
    let tokopediaRenderer: ReactTestRenderer.ReactTestRenderer;
    let nestedRenderer: ReactTestRenderer.ReactTestRenderer;
    let offlineRenderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      shopeeRenderer = ReactTestRenderer.create(
        <KolamSalesOpsDetail controller={shopeeController} />,
      );
      tokopediaRenderer = ReactTestRenderer.create(
        <KolamSalesOpsDetail controller={tokopediaController} />,
      );
      nestedRenderer = ReactTestRenderer.create(
        <KolamSalesOpsDetail controller={nestedSourceController} />,
      );
      offlineRenderer = ReactTestRenderer.create(
        <KolamSalesOpsDetail controller={offlineController} />,
      );
    });

    const shopeeButton = shopeeRenderer!.root
      .findAllByType(KolamButton)
      .find(node => node.props.label === 'Kirim pesan ke customer');
    const tokopediaButton = tokopediaRenderer!.root
      .findAllByType(KolamButton)
      .find(node => node.props.label === 'Kirim pesan ke customer');
    const nestedButton = nestedRenderer!.root
      .findAllByType(KolamButton)
      .find(node => node.props.label === 'Kirim pesan ke customer');
    expect(shopeeButton).toBeTruthy();
    expect(tokopediaButton).toBeTruthy();
    expect(nestedButton).toBeTruthy();
    expect(renderText(offlineRenderer!)).not.toContain(
      'Kirim pesan ke customer',
    );

    await act(async () => {
      shopeeButton!.props.onPress();
    });
    expect(shopeeController.onOpenCustomerChat).toHaveBeenCalledTimes(1);
  });
});
