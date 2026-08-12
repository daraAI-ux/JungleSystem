import {
  allocateKolamSaleCommissionShares,
  buildKolamSaleCreateBody,
  canAddItemsToKolamSale,
  canApproveKolamSaleDiscount,
  canEditKolamSaleDraft,
  canMarkKolamSalePaid,
  canShowKolamSaleEditAction,
  canUploadKolamSalePaymentProof,
  createInitialKolamSaleCreateForm,
  createInitialKolamSaleListFilters,
  estimateKolamSaleCreateItemLineTotal,
  estimateKolamSaleCreateOrderSummary,
  filterKolamSaleCreateItemShippingMethods,
  filterOptionsBySalesSource,
  filterOptionsBySalesSourceWithFallback,
  formatKolamSaleDeliveryFilterLabel,
  formatKolamSaleDeliveryStatusLabel,
  formatKolamSaleMutationError,
  formatKolamSalePaymentStatusLabel,
  getKolamNoShippingDeliveryLabel,
  getKolamSaleAllowedDeliveryTransitions,
  getKolamSaleAllowedStatusTransitions,
  getKolamSaleDeliveryStatusIntent,
  getKolamSaleDiscountApprovalReasons,
  getKolamSaleEditRouteId,
  formatKolamSaleWalletSourceLabel,
  getKolamSaleCouriers,
  getKolamSaleEstimatedMargin,
  getKolamSaleInternalNetProfit,
  getKolamSaleItemDiscountAmount,
  getKolamSaleItemVoucherDiscountApplied,
  formatKolamSaleItemVoucherLabel,
  getKolamSaleItemHppTotal,
  getKolamSaleItemNetProfit,
  getKolamSaleMarketplaceLogistics,
  getKolamSaleOutstandingAmount,
  getKolamSalePaymentStatusIntent,
  getKolamSaleListComplaintDisplay,
  getKolamSaleRouteId,
  getKolamSaleServiceLabel,
  getKolamSaleSurfaceMode,
  getKolamSaleTrackingNumber,
  formatKolamSaleLogisticsTime,
  hydrateKolamSaleCreateFormFromSale,
  isKolamSaleMarketplaceManaged,
  canOpenKolamSaleCustomerChat,
  isKolamSaleHandledByDara,
  isKolamSaleShippingAutomationActive,
  isKolamTokopediaDropOffOnly,
  isKolamShopeeDropOffOnly,
  isKolamShopeeDropOffArrangedOnSale,
  isKolamMarketplaceShipmentSyncStarted,
  needsKolamPlatformPickupRequest,
  needsKolamTokopediaPickupRequest,
  needsKolamShopeePickupRequest,
  needsKolamPlatformPickupReschedule,
  resolveKolamWaitingPickupDisplayLabel,
  resolveKolamSaleComplaintDisplayLabel,
  formatKolamSaleListComplaintLabel,
  shouldShowKolamTokopediaDropOffBadge,
  shouldShowKolamShopeeDropOffBadge,
  isKolamShopeePickupArrangedOnSale,
  formatKolamShopeePickupTimeLabel,
  normalizeKolamMarketplacePickupOptions,
  pickKolamMarketplaceDefaultSlotId,
  getKolamSaleMarketplaceFulfillment,
  canOpenKolamSaleComplaintCreate,
  canShowKolamSaleComplaintSuccessPrompt,
  getKolamSaleMainComplaint,
  resolveKolamCourierLogoKey,
  resolveKolamSaleCreateItemShippingMethodIds,
  resolveKolamSaleSourceLogoUri,
  isKolamSalesAddItemsRoute,
  isKolamSalesCreateRoute,
  isKolamSalesDetailRoute,
  isKolamSalesDiscountApprovalRoute,
  isKolamSalesEditRoute,
  isKolamSalesListRoute,
  isKolamSalesRoute,
  isMarketplaceSalesSource,
  kolamSaleSkipsShippingFlow,
  normalizeKolamSale,
  normalizeKolamSaleAnalyticsOverview,
  normalizeKolamSaleList,
  sanitizeKolamPlatformMaskedText,
  pickDefaultOfflinePosSourceId,
  validateKolamSaleCreatePayload,
  validateKolamSaleUpdatePayload,
} from '../src/domain/kolam-sales';
import { computeKolamSaleProfitSummary } from '../src/domain/kolam-sales-profit';
import { getKolamNavigationRouteTarget } from '../src/domain/kolam-navigation';
import { ApiError } from '../src/lib/api-error';

describe('kolam sales domain', () => {
  it('detects list, detail, create, edit, add-items, and approval routes', () => {
    expect(isKolamSalesRoute('/sales')).toBe(true);
    expect(isKolamSalesListRoute('/sales')).toBe(true);
    expect(isKolamSalesDetailRoute('/sales/abc123')).toBe(true);
    expect(getKolamSaleRouteId('/sales/abc123')).toBe('abc123');

    expect(isKolamSalesRoute('/sales/create')).toBe(true);
    expect(isKolamSalesCreateRoute('/sales/create')).toBe(true);
    expect(isKolamSalesEditRoute('/sales/abc123/edit')).toBe(true);
    expect(isKolamSalesAddItemsRoute('/sales/abc123/edit?mode=add-items')).toBe(
      true,
    );
    expect(isKolamSalesEditRoute('/sales/abc123/edit?mode=add-items')).toBe(
      false,
    );
    expect(getKolamSaleEditRouteId('/sales/abc123/edit')).toBe('abc123');
    expect(isKolamSalesRoute('/sales/discount-approval')).toBe(true);
    expect(isKolamSalesDiscountApprovalRoute('/sales/discount-approval')).toBe(
      true,
    );
    expect(getKolamSaleRouteId('/sales/create')).toBe(null);
    expect(getKolamSaleRouteId('/sales/discount-approval')).toBe(null);
  });

  it('maps surface modes from route', () => {
    expect(getKolamSaleSurfaceMode('/sales')).toBe('list');
    expect(getKolamSaleSurfaceMode('/sales?needsAction=1')).toBe('list');
    expect(getKolamSaleSurfaceMode('/sales/sale-1')).toBe('detail');
    expect(getKolamSaleSurfaceMode('/sales/create')).toBe('create');
    expect(getKolamSaleSurfaceMode('/sales/sale-1/edit')).toBe('edit');
    expect(
      getKolamSaleSurfaceMode('/sales/sale-1/edit?mode=add-items'),
    ).toBe('add-items');
    expect(getKolamSaleSurfaceMode('/sales/discount-approval')).toBe(
      'approval',
    );
  });

  it('routes Kolam /sales to kolam module (not POS sales shell)', () => {
    expect(
      getKolamNavigationRouteTarget({
        label: 'Penjualan',
        route: '/sales',
        description: 'Sales',
        requiredAccess: ['kolam'],
      }).moduleId,
    ).toBe('kolam');
    expect(
      getKolamNavigationRouteTarget({
        label: 'Detail',
        route: '/sales/abc',
        description: 'Sale detail',
        requiredAccess: ['kolam'],
      }).moduleId,
    ).toBe('kolam');
    expect(
      getKolamNavigationRouteTarget({
        label: 'Persetujuan Diskon',
        route: '/sales/discount-approval',
        description: 'Discount',
        requiredAccess: ['kolam'],
      }).moduleId,
    ).toBe('kolam');
  });

  it('parses list filters from route query', () => {
    const filters = createInitialKolamSaleListFilters(
      '/sales?lifecycle=completed&status=paid&needsAction=1&search=INV&startDate=2026-01-01',
    );
    expect(filters.lifecycle).toBe('completed');
    expect(filters.status).toBe('paid');
    expect(filters.needsAction).toBe(true);
    expect(filters.search).toBe('INV');
    expect(filters.startDate).toBe('2026-01-01');
    expect(filters.page).toBe(1);
    expect(filters.limit).toBe(10);
  });

  it('normalizes sale list and detail payloads with catalog refs', () => {
    const list = normalizeKolamSaleList({
      data: [
        {
          _id: 'sale-1',
          invoiceCode: 'INV-01-01-2026-000001',
          status: 'sent',
          deliveryStatus: 'none',
          finalTotal: 150000,
          total: 140000,
          shippingCost: 10000,
          customer: { _id: 'c1', name: 'Ada' },
          sourceRef: {
            _id: 's1',
            name: 'POS',
            type: 'offline',
            logo: '/logo.png',
          },
          items: [
            {
              _id: 'i1',
              itemType: 'product',
              product: { _id: 'p1', name: 'Filter', sku: 'F-1' },
              quantity: 2,
              unitPrice: 70000,
              subtotal: 140000,
            },
          ],
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    expect(list.data).toHaveLength(1);
    expect(list.data[0].id).toBe('sale-1');
    expect(list.data[0].items[0].productId).toBe('p1');

    const detail = normalizeKolamSale({
      _id: 'sale-2',
      invoiceCode: 'INV-2',
      status: 'paid',
      deliveryStatus: 'packing',
      buyerInfo: { name: 'Buyer MP', phone: '081' },
      externalRef: { source: 'shopee' },
      paymentMethod: { _id: 'pm1', name: 'Transfer', type: 'transfer' },
      paymentProofs: [{ _id: 'pr1', path: '/proofs/a.jpg' }],
      items: [],
    });
    expect(isKolamSaleMarketplaceManaged(detail)).toBe(true);
    expect(canOpenKolamSaleCustomerChat(detail)).toBe(true);
    expect(detail.paymentMethod?.name).toBe('Transfer');
    expect(detail.paymentProofs).toHaveLength(1);
    expect(detail.paymentProofs[0].uri).toContain('/proofs/a.jpg');
    expect(detail.marketplaceOrderId).toBe('');
  });

  it('infers marketplace source from nested payloads and import aliases', () => {
    const nestedOnly = normalizeKolamSale({
      _id: 'sale-nested',
      invoiceCode: 'INV-N',
      status: 'paid',
      items: [],
      externalRef: {
        shopee: {mainOrderId: 'SH-NEST'},
      },
    });
    expect(nestedOnly.marketplaceSource).toBe('shopee');
    expect(isKolamSaleMarketplaceManaged(nestedOnly)).toBe(true);
    expect(canOpenKolamSaleCustomerChat(nestedOnly)).toBe(true);

    const importAlias = normalizeKolamSale({
      _id: 'sale-import',
      invoiceCode: 'INV-I',
      status: 'paid',
      items: [],
      externalRef: {
        source: 'shopee_import',
        shopee: {mainOrderId: 'SH-IMP'},
      },
    });
    expect(importAlias.marketplaceSource).toBe('shopee');
    expect(canOpenKolamSaleCustomerChat(importAlias)).toBe(true);

    const offline = normalizeKolamSale({
      _id: 'sale-off-chat',
      invoiceCode: 'INV-O',
      status: 'paid',
      items: [],
      type: 'offline',
    });
    expect(canOpenKolamSaleCustomerChat(offline)).toBe(false);

    const bySourceName = normalizeKolamSale({
      _id: 'sale-by-name',
      invoiceCode: 'INV-NAME',
      status: 'paid',
      items: [],
      sourceRef: {_id: 'src-sh', name: 'Pengiriman Shopee', type: 'online'},
    });
    expect(bySourceName.marketplaceSource).toBe('');
    expect(canOpenKolamSaleCustomerChat(bySourceName)).toBe(true);
  });

  it('normalizes detail Batch A fields and shipping skip helpers', () => {
    const detail = normalizeKolamSale({
      _id: 'sale-3',
      invoiceCode: 'INV-3',
      status: 'paid',
      deliveryStatus: 'none',
      buyerInfo: {
        name: 'Buyer',
        phone: '081',
        address: 'Jl. Mawar 1',
      },
      externalRef: {
        source: 'shopee',
        shopee: { mainOrderId: 'SPX-99' },
      },
      pointsConfig: { pointsEarned: 12 },
      customCosts: [{ name: 'Asuransi', amount: 5000 }],
      discountType: 'percentage',
      shippingAddress: {
        address: 'Jl. Melati',
        city: 'Jakarta',
      },
      createdBy: { name: 'Admin' },
      openLivestockPendingCount: 2,
      items: [{ _id: 'i1', itemType: 'service', customName: 'Jasa', quantity: 1 }],
      sourceRef: { _id: 's1', name: 'Website', type: 'online' },
    });
    expect(detail.marketplaceOrderId).toBe('SPX-99');
    expect(detail.pointsEarned).toBe(12);
    expect(detail.customCosts[0].amount).toBe(5000);
    expect(detail.shippingAddressText).toContain('Jl. Melati');
    expect(detail.createdByName).toBe('Admin');
    expect(detail.openLivestockPendingCount).toBe(2);
    expect(getKolamSaleOutstandingAmount({ finalTotal: 100, paidAmount: 40 })).toBe(
      60,
    );
    expect(
      kolamSaleSkipsShippingFlow({
        items: [{ itemType: 'service' }],
        sourceRef: { type: 'online', name: 'Web' },
      }),
    ).toBe(true);
    expect(
      kolamSaleSkipsShippingFlow({
        items: [{ itemType: 'product' }],
        sourceRef: { type: 'offline', name: 'POS' },
      }),
    ).toBe(true);
  });

  it('strips marketplace ***** masks from shipping address text', () => {
    expect(
      sanitizeKolamPlatformMaskedText(
        'Jl. Melati ***** No. 12 RT ** / RW **, Jakarta Selatan',
      ),
    ).toBe('Jl. Melati No. 12 RT / RW, Jakarta Selatan');

    const detail = normalizeKolamSale({
      _id: 'sale-mask',
      invoiceCode: 'INV-M',
      status: 'paid',
      shippingAddress: {
        address: 'Jl. ****** Mawar No. **',
        city: 'Bandung',
        province: 'Jawa Barat',
      },
      items: [],
    });
    expect(detail.shippingAddressText).toBe(
      'Jl. Mawar No, Bandung, Jawa Barat',
    );
  });

  it('normalizes Tokopedia courier, service, and tracking number', () => {
    expect(resolveKolamCourierLogoKey('Anteraja')).toBe('anteraja');
    expect(resolveKolamCourierLogoKey('J&T Express')).toBe('jnt');
    expect(resolveKolamCourierLogoKey('jne')).toBe('jne');

    const detail = normalizeKolamSale({
      _id: 'sale-ship',
      invoiceCode: 'INV-SHIP',
      status: 'paid',
      deliveryStatus: 'on_delivery',
      shippingCost: 12000,
      shippingService: {
        courierName: 'Anteraja',
        serviceName: 'Same day',
        trackingNumber: 'TSA-80056970801',
      },
      externalRef: {
        source: 'tokopedia',
        tokopedia: {
          mainOrderId: 'TP-88',
          trackingNumber: 'TSA-FROM-EXT',
          courierName: 'Anteraja',
        },
      },
      items: [
        {
          _id: 'i1',
          itemType: 'product',
          quantity: 1,
          unitPrice: 10000,
          subtotal: 10000,
          product: { _id: 'p1', name: 'Item' },
        },
      ],
    });

    expect(detail.shippingService?.courierName).toBe('Anteraja');
    expect(detail.shippingService?.serviceName).toBe('Same day');
    // Marketplace externalRef tracking wins over shippingService
    expect(detail.shippingService?.trackingNumber).toBe('TSA-FROM-EXT');
    expect(getKolamSaleTrackingNumber(detail)).toBe('TSA-FROM-EXT');
    expect(getKolamSaleServiceLabel(detail)).toBe('Same day');
    expect(getKolamSaleCouriers(detail)).toEqual([
      { name: 'Anteraja', logoKey: 'anteraja' },
    ]);
  });

  it('normalizes marketplace perjalanan paket timeline', () => {
    const detail = normalizeKolamSale({
      _id: 'sale-logistics',
      invoiceCode: 'INV-LOG',
      status: 'paid',
      externalRef: {
        source: 'tokopedia',
        tokopedia: {
          mainOrderId: 'TP-9',
          logisticsLastUpdate: 'Paket diterima di hub Bandung',
          logisticsTimeline: [
            {
              at: '2026-07-30T10:00:00.000Z',
              message: 'Paket diterima di hub Bandung',
            },
            {
              at: '2026-07-30T08:00:00.000Z',
              message: 'Kurir menjemput paket',
            },
          ],
        },
      },
      items: [],
    });

    expect(detail.marketplaceLogistics?.platform).toBe('tokopedia');
    expect(detail.marketplaceLogistics?.timeline).toHaveLength(2);
    expect(detail.marketplaceLogistics?.timeline[0].message).toBe(
      'Paket diterima di hub Bandung',
    );
    const view = getKolamSaleMarketplaceLogistics(detail);
    expect(view?.lastUpdate).toContain('Bandung');
    expect(formatKolamSaleLogisticsTime('2026-07-30T10:00:00.000Z')).toBeTruthy();
  });

  it('parses Tokopedia fulfillmentMode and dropOffPointUrl from AM fields', () => {
    const pickupSale = normalizeKolamSale({
      _id: 'sale-fm-pickup',
      invoiceCode: 'INV-FM-P',
      status: 'paid',
      deliveryStatus: 'none',
      externalRef: {
        source: 'tokopedia',
        tokopedia: {
          mainOrderId: 'TP-P',
          fulfillmentMode: 'Pickup',
          lastStatus: 101,
        },
      },
      items: [],
    });
    expect(pickupSale.marketplaceFulfillment).toEqual(
      expect.objectContaining({
        platform: 'tokopedia',
        fulfillmentMode: 'pickup',
        dropOffPointUrl: '',
        lastStatus: 101,
      }),
    );
    expect(getKolamSaleMarketplaceFulfillment(pickupSale)?.fulfillmentMode).toBe(
      'pickup',
    );
    expect(isKolamTokopediaDropOffOnly(pickupSale)).toBe(false);
    expect(needsKolamPlatformPickupRequest(pickupSale)).toBe(true);
    expect(needsKolamTokopediaPickupRequest(pickupSale)).toBe(true);
    expect(shouldShowKolamTokopediaDropOffBadge(pickupSale)).toBe(false);

    const dropoffSale = normalizeKolamSale({
      _id: 'sale-fm-drop',
      invoiceCode: 'INV-FM-D',
      status: 'paid',
      deliveryStatus: 'packing',
      externalRef: {
        source: 'tokopedia',
        tokopedia: {
          mainOrderId: 'TP-D',
          fulfillmentMode: 'dropoff',
          dropOffPointUrl: 'https://tokopedia.test/dropoff/1',
          lastStatus: 101,
        },
      },
      items: [],
    });
    expect(dropoffSale.marketplaceFulfillment?.fulfillmentMode).toBe('dropoff');
    expect(dropoffSale.marketplaceFulfillment?.dropOffPointUrl).toBe(
      'https://tokopedia.test/dropoff/1',
    );
    expect(isKolamTokopediaDropOffOnly(dropoffSale)).toBe(true);
    expect(needsKolamPlatformPickupRequest(dropoffSale)).toBe(false);
    expect(needsKolamTokopediaPickupRequest(dropoffSale)).toBe(false);
    expect(shouldShowKolamTokopediaDropOffBadge(dropoffSale)).toBe(true);

    const bothSale = normalizeKolamSale({
      _id: 'sale-fm-both',
      invoiceCode: 'INV-FM-B',
      status: 'paid',
      deliveryStatus: 'none',
      externalRef: {
        source: 'tokopedia',
        tokopedia: {
          fulfillmentMode: 'both',
          lastStatus: 101,
        },
      },
      items: [],
    });
    expect(isKolamTokopediaDropOffOnly(bothSale)).toBe(false);
    expect(needsKolamPlatformPickupRequest(bothSale)).toBe(true);
    expect(needsKolamTokopediaPickupRequest(bothSale)).toBe(true);
    expect(shouldShowKolamTokopediaDropOffBadge(bothSale)).toBe(false);

    const syncedDropoff = normalizeKolamSale({
      _id: 'sale-fm-synced',
      invoiceCode: 'INV-FM-S',
      status: 'paid',
      deliveryStatus: 'none',
      externalRef: {
        source: 'tokopedia',
        tokopedia: {
          fulfillmentMode: 'dropoff',
          lastStatus: 102,
          trackingNumber: 'RESI-1',
        },
      },
      items: [],
    });
    expect(isKolamMarketplaceShipmentSyncStarted(syncedDropoff)).toBe(true);
    expect(shouldShowKolamTokopediaDropOffBadge(syncedDropoff)).toBe(false);
    expect(needsKolamPlatformPickupRequest(syncedDropoff)).toBe(false);
  });

  it('hides platform pickup for Shopee drop-off only (FE parity)', () => {
    const sale = normalizeKolamSale({
      _id: 'sale-shopee-drop',
      invoiceCode: 'INV-SH-D',
      status: 'paid',
      deliveryStatus: 'none',
      externalRef: {
        source: 'shopee',
        shopee: {
          mainOrderId: 'SH-1',
          fulfillmentMode: 'dropoff',
          lastStatus: 1,
        },
      },
      items: [],
    });
    expect(isKolamShopeeDropOffOnly(sale)).toBe(true);
    expect(needsKolamPlatformPickupRequest(sale)).toBe(false);
    expect(needsKolamTokopediaPickupRequest(sale)).toBe(false);
  });

  it('gates Shopee pickup request, reschedule, and drop-off badge like FE', () => {
    const shopeePickup = normalizeKolamSale({
      _id: 'sale-shopee-pickup',
      invoiceCode: 'INV-SH-P',
      status: 'paid',
      deliveryStatus: 'none',
      externalRef: {
        source: 'shopee',
        shopee: {
          mainOrderId: 'SH-2',
          fulfillmentMode: 'pickup',
          lastStatus: 1,
        },
      },
      items: [],
    });
    expect(needsKolamPlatformPickupRequest(shopeePickup)).toBe(true);
    expect(needsKolamShopeePickupRequest(shopeePickup)).toBe(true);
    expect(needsKolamTokopediaPickupRequest(shopeePickup)).toBe(false);
    expect(needsKolamPlatformPickupReschedule(shopeePickup)).toBe(false);
    expect(shouldShowKolamShopeeDropOffBadge(shopeePickup)).toBe(false);

    const tokopediaPickup = normalizeKolamSale({
      _id: 'sale-tp-only',
      invoiceCode: 'INV-TP-ONLY',
      status: 'paid',
      deliveryStatus: 'none',
      externalRef: {
        source: 'tokopedia',
        tokopedia: {
          fulfillmentMode: 'pickup',
          lastStatus: 101,
        },
      },
      items: [],
    });
    expect(needsKolamTokopediaPickupRequest(tokopediaPickup)).toBe(true);
    expect(needsKolamShopeePickupRequest(tokopediaPickup)).toBe(false);

    const shopeeArranged = normalizeKolamSale({
      _id: 'sale-shopee-arranged',
      invoiceCode: 'INV-SH-A',
      status: 'paid',
      deliveryStatus: 'waiting_pickup',
      externalRef: {
        source: 'shopee',
        shopee: {
          mainOrderId: 'SH-A',
          fulfillmentMode: 'pickup',
          pickupArranged: true,
          pickupEditable: true,
          pickupTime: 1_700_000_000,
          lastStatus: 1,
        },
      },
      items: [],
    });
    expect(isKolamShopeePickupArrangedOnSale(shopeeArranged)).toBe(true);
    expect(needsKolamPlatformPickupRequest(shopeeArranged)).toBe(false);
    expect(needsKolamPlatformPickupReschedule(shopeeArranged)).toBe(true);
    expect(formatKolamShopeePickupTimeLabel(1_700_000_000)).toMatch(/\d/);

    const shopeeDropoff = normalizeKolamSale({
      _id: 'sale-shopee-drop',
      invoiceCode: 'INV-SH-D',
      status: 'paid',
      deliveryStatus: 'packing',
      externalRef: {
        source: 'shopee',
        shopee: {
          mainOrderId: 'SH-D',
          fulfillmentMode: 'dropoff',
          lastStatus: 1,
        },
      },
      items: [],
    });
    expect(needsKolamShopeePickupRequest(shopeeDropoff)).toBe(false);
    expect(shouldShowKolamShopeeDropOffBadge(shopeeDropoff)).toBe(true);
    expect(needsKolamPlatformPickupReschedule(shopeeDropoff)).toBe(false);
  });

  it('shows robot automation only after real progress, not queued import', () => {
    const queuedOnly = normalizeKolamSale({
      _id: 'sale-auto-queued',
      invoiceCode: 'INV-AQ',
      status: 'paid',
      deliveryStatus: 'packing',
      autoOlshopFulfillment: {active: true, phase: 'queued'},
      items: [],
    });
    expect(isKolamSaleShippingAutomationActive(queuedOnly)).toBe(false);
    expect(queuedOnly.handledByDara).toBe(false);

    const dispatched = normalizeKolamSale({
      _id: 'sale-auto-dispatched',
      invoiceCode: 'INV-AD',
      status: 'paid',
      deliveryStatus: 'packing',
      autoOlshopFulfillment: {active: true, phase: 'dispatched'},
      items: [],
    });
    expect(isKolamSaleShippingAutomationActive(dispatched)).toBe(true);

    const timestampOnly = normalizeKolamSale({
      _id: 'sale-auto-started',
      invoiceCode: 'INV-AS',
      status: 'paid',
      deliveryStatus: 'packing',
      autoOlshopFulfillment: {
        active: true,
        phase: 'queued',
        startedAt: '2026-08-01T00:00:00.000Z',
      },
      items: [],
    });
    expect(isKolamSaleShippingAutomationActive(timestampOnly)).toBe(true);

    const daraHandled = normalizeKolamSale({
      _id: 'sale-dara',
      invoiceCode: 'INV-DARA',
      status: 'paid',
      deliveryStatus: 'packing',
      handledByDara: true,
      autoOlshopFulfillment: {active: true, phase: 'queued'},
      items: [],
    });
    expect(isKolamSaleHandledByDara(daraHandled)).toBe(true);
    expect(isKolamSaleShippingAutomationActive(daraHandled)).toBe(false);
  });

  it('normalizes marketplace pickup options and prefers non-isNow default slot', () => {
    const options = normalizeKolamMarketplacePickupOptions({
      data: {
        platform: 'shopee',
        carrier: 'SPX',
        fulfillmentMode: 'pickup',
        mode: 'arrange',
        pickupSupported: true,
        options: [
          {
            id: 'now',
            pickupTime: 100,
            pickupTimeRangeId: 1,
            label: 'Sekarang',
            isNow: true,
          },
          {
            id: 'later',
            pickupTime: 200,
            pickupTimeRangeId: 2,
            label: 'Besok 09:00',
            isNow: false,
          },
        ],
        defaultOption: {
          pickup_time: 100,
          pickup_time_range_id: 1,
        },
      },
    });
    expect(options.carrier).toBe('SPX');
    expect(options.options).toHaveLength(2);
    expect(pickKolamMarketplaceDefaultSlotId(options.options, options.defaultOption)).toBe(
      'now',
    );
    expect(
      pickKolamMarketplaceDefaultSlotId(options.options, null),
    ).toBe('later');
  });

  it('covers Tokopedia fulfillment edge cases for pickup and drop-off helpers', () => {
    const unknownMode = normalizeKolamSale({
      _id: 'sale-fm-unknown',
      invoiceCode: 'INV-FM-U',
      status: 'paid',
      deliveryStatus: 'packing',
      externalRef: {
        source: 'tokopedia',
        tokopedia: {
          fulfillmentMode: 'unknown',
          lastStatus: 101,
        },
      },
      items: [],
    });
    expect(isKolamTokopediaDropOffOnly(unknownMode)).toBe(false);
    expect(needsKolamTokopediaPickupRequest(unknownMode)).toBe(true);
    expect(shouldShowKolamTokopediaDropOffBadge(unknownMode)).toBe(false);

    const unpaid = normalizeKolamSale({
      _id: 'sale-fm-unpaid',
      invoiceCode: 'INV-FM-UNPAID',
      status: 'sent',
      deliveryStatus: 'none',
      externalRef: {
        source: 'tokopedia',
        tokopedia: {
          fulfillmentMode: 'pickup',
          lastStatus: 101,
        },
      },
      items: [],
    });
    expect(needsKolamTokopediaPickupRequest(unpaid)).toBe(false);
    expect(shouldShowKolamTokopediaDropOffBadge(unpaid)).toBe(false);

    const waitingPickup = normalizeKolamSale({
      _id: 'sale-fm-waiting',
      invoiceCode: 'INV-FM-WP',
      status: 'paid',
      deliveryStatus: 'waiting_pickup',
      externalRef: {
        source: 'tokopedia',
        tokopedia: {
          fulfillmentMode: 'pickup',
          lastStatus: 101,
        },
      },
      items: [],
    });
    expect(isKolamMarketplaceShipmentSyncStarted(waitingPickup)).toBe(true);
    expect(needsKolamTokopediaPickupRequest(waitingPickup)).toBe(false);

    const dropoffNoUrl = normalizeKolamSale({
      _id: 'sale-fm-drop-nourl',
      invoiceCode: 'INV-FM-DN',
      status: 'paid',
      deliveryStatus: 'none',
      externalRef: {
        source: 'tokopedia',
        tokopedia: {
          fulfillmentMode: 'dropoff',
          lastStatus: 101,
        },
      },
      items: [],
    });
    expect(dropoffNoUrl.marketplaceFulfillment?.dropOffPointUrl).toBe('');
    expect(shouldShowKolamTokopediaDropOffBadge(dropoffNoUrl)).toBe(true);
    expect(needsKolamTokopediaPickupRequest(dropoffNoUrl)).toBe(false);
  });

  it('resolves sales source logo from catalog when detail omits logo', () => {
    expect(
      resolveKolamSaleSourceLogoUri(
        { sourceRef: { id: 'src1', logoUri: null } },
        [{ id: 'src1', logoUri: 'https://cdn.example/tokopedia-source.png' }],
      ),
    ).toBe('https://cdn.example/tokopedia-source.png');
    expect(
      resolveKolamSaleSourceLogoUri(
        {
          sourceRef: {
            id: 'src1',
            logoUri: 'https://cdn.example/from-sale.png',
          },
        },
        [{ id: 'src1', logoUri: 'https://cdn.example/from-catalog.png' }],
      ),
    ).toBe('https://cdn.example/from-sale.png');
  });

  it('normalizes embedded wallet and stock transactions on sale detail', () => {
    const detail = normalizeKolamSale({
      _id: 'sale-tx',
      invoiceCode: 'INV-TX',
      status: 'paid',
      walletTransactions: [
        {
          _id: 'w1',
          type: 'credit',
          source: 'sale_revenue',
          amount: 150_000,
          confirmStatus: 'confirmed',
          note: 'Pendapatan',
          wallet: { name: 'Kas Tokopedia', type: 'virtual' },
          createdAt: '2026-07-30T12:00:00.000Z',
        },
      ],
      stockTransactions: [
        {
          _id: 'st1',
          source: 'sale',
          type: 'out',
          quantity: 2,
          before: 10,
          after: 8,
          reason: 'Penjualan INV-TX',
          marketplaceCrossSync: { summary: 'synced' },
          createdAt: '2026-07-30T12:01:00.000Z',
        },
      ],
      items: [],
    });

    expect(detail.walletTransactions).toHaveLength(1);
    expect(detail.walletTransactions[0].id).toBe('w1');
    expect(detail.walletTransactions[0].amount).toBe(150_000);
    expect(detail.walletTransactions[0].walletName).toBe('Kas Tokopedia');
    expect(formatKolamSaleWalletSourceLabel('sale_revenue')).toBe(
      'Pendapatan penjualan',
    );
    expect(detail.stockTransactions).toHaveLength(1);
    expect(detail.stockTransactions[0].id).toBe('st1');
    expect(detail.stockTransactions[0].quantity).toBe(2);
    expect(detail.stockTransactions[0].before).toBe(10);
    expect(detail.stockTransactions[0].after).toBe(8);
    expect(detail.stockTransactions[0].crossSyncSummary).toBeTruthy();
  });

  it('computes Tokopedia/Shopee olshop profit like FE (not internal PM path)', () => {
    const detail = normalizeKolamSale({
      _id: 'sale-tokped',
      invoiceCode: 'INV-TP',
      status: 'paid',
      finalTotal: 160_000,
      sourceCost: 4_000,
      sourceCostBreakdown: [
        { name: 'Biaya layanan', amount: 3_000 },
        { name: 'Biaya pembayaran', amount: 1_000 },
      ],
      commissionAccruedTotalAtSale: 0,
      paymentMethodCost: 9_999,
      hppTotalAtSale: 40_000,
      externalRef: { source: 'tokopedia', tokopedia: { mainOrderId: 'TP-1' } },
      sourceRef: { _id: 'src1', name: 'Tokopedia', type: 'online' },
      items: [
        {
          _id: 'i1',
          itemType: 'product',
          quantity: 1,
          unitPrice: 150_000,
          subtotal: 150_000,
          unitCostAtSale: 40_000,
          product: { _id: 'p1', name: 'Produk' },
        },
      ],
    });

    const summary = computeKolamSaleProfitSummary(detail);
    expect(summary.mode).toBe('olshop');
    expect(summary.marketplaceFeeLabel).toBe('Biaya layanan Tokopedia');
    expect(summary.marketplaceFees).toBe(4_000);
    expect(summary.marketplaceFeeBreakdown).toHaveLength(2);
    // FE: pendapatan − HPP − biaya layanan − komisi (PM diabaikan untuk olshop)
    expect(summary.netProfit).toBe(106_000);
    expect(summary.itemBreakdowns[0].sourceFeeShare).toBe(4_000);
    expect(summary.itemBreakdowns[0].pmCostShare).toBe(0);
    expect(summary.itemBreakdowns[0].profitItem).toBe(106_000);
    expect(summary.paymentMethodCost).toBe(0);
  });

  it('computes internal profit with PM share (non-marketplace)', () => {
    const detail = normalizeKolamSale({
      _id: 'sale-pos',
      invoiceCode: 'INV-POS',
      status: 'paid',
      paymentMethodCost: 2_000,
      commissionAccruedTotalAtSale: 5_000,
      items: [
        {
          _id: 'i1',
          itemType: 'product',
          quantity: 1,
          unitPrice: 100_000,
          subtotal: 100_000,
          unitCostAtSale: 30_000,
          product: { _id: 'p1', name: 'Filter' },
        },
      ],
      sourceRef: { _id: 's1', name: 'POS', type: 'offline' },
    });
    const summary = computeKolamSaleProfitSummary(detail);
    expect(summary.mode).toBe('internal');
    expect(summary.netProfit).toBe(63_000);
    expect(summary.itemBreakdowns[0].pmCostShare).toBe(2_000);
    expect(summary.itemBreakdowns[0].profitItem).toBe(63_000);
  });

  it('normalizes item thumbnails, HPP snapshot, and margin helpers', () => {
    const detail = normalizeKolamSale({
      _id: 'sale-profit',
      invoiceCode: 'INV-P',
      status: 'paid',
      finalTotal: 100_000,
      hppTotalAtSale: 40_000,
      commissionAccruedTotalAtSale: 5_000,
      paymentMethodCost: 2_000,
      sourceCost: 1_500,
      items: [
        {
          _id: 'i1',
          itemType: 'product',
          quantity: 2,
          unitPrice: 30_000,
          subtotal: 60_000,
          unitCostAtSale: 10_000,
          discount: { type: 'percentage', amount: 10 },
          product: {
            _id: 'p1',
            name: 'Filter',
            thumbnailImage: '/uploads/filter.jpg',
          },
          variant: {
            photos: [{ path: '/uploads/variant.jpg' }],
          },
        },
        {
          _id: 'i2',
          itemType: 'custom',
          customName: 'Ongkos',
          quantity: 1,
          unitPrice: 20_000,
          subtotal: 20_000,
          customCost: 5_000,
        },
        {
          _id: 'i3',
          itemType: 'service',
          customName: 'Jasa',
          quantity: 1,
          unitPrice: 10_000,
          subtotal: 10_000,
          service: {
            _id: 'sv1',
            name: 'Jasa',
            photos: ['/uploads/service.jpg'],
          },
        },
      ],
    });

    expect(detail.hppTotalAtSale).toBe(40_000);
    expect(detail.commissionAccruedTotalAtSale).toBe(5_000);
    expect(detail.paymentMethodCost).toBe(2_000);
    expect(detail.sourceCost).toBe(1_500);
    expect(detail.items[0].unitCostAtSale).toBe(10_000);
    expect(detail.items[0].thumbnailUri).toContain('/uploads/variant.jpg');
    expect(detail.items[2].thumbnailUri).toContain('/uploads/service.jpg');

    expect(getKolamSaleItemHppTotal(detail.items[0])).toBe(20_000);
    expect(getKolamSaleItemHppTotal(detail.items[1])).toBe(5_000);
    expect(getKolamSaleItemDiscountAmount(detail.items[0])).toBe(6_000);
    // FE proportional commission: only non-custom share of 5_000 by subtotal
    // product 60k + service 10k = 70k → product gets round(5000*60/70)=4286
    expect(
      allocateKolamSaleCommissionShares(detail.items, 5_000),
    ).toEqual([4286, 0, 714]);
    expect(getKolamSaleItemNetProfit(detail.items[0], 4286, 0)).toBe(35_714);
    // Internal summary: product+species revenue only (60k) − HPP 40k − PM 2k − komisi 5k
    expect(getKolamSaleInternalNetProfit(detail)).toBe(13_000);
    expect(
      getKolamSaleEstimatedMargin({
        finalTotal: 100_000,
        hppTotalAtSale: 40_000,
        commissionAccruedTotalAtSale: 5_000,
        paymentMethodCost: 2_000,
      }),
    ).toBe(53_000);
  });

  it('formats payment and delivery labels for list badges', () => {
    expect(formatKolamSalePaymentStatusLabel('paid')).toBe('Lunas');
    expect(formatKolamSalePaymentStatusLabel('reject')).toBe('Diskon ditolak');
    expect(getKolamSalePaymentStatusIntent('paid')).toBe('success');
    expect(formatKolamSaleDeliveryStatusLabel('none', 'paid')).toBe(
      'Butuh kirim',
    );
    expect(formatKolamSaleDeliveryStatusLabel('packing', 'paid')).toBe(
      'Sedang dipacking',
    );
    expect(formatKolamSaleDeliveryStatusLabel('waiting_pickup', 'paid')).toBe(
      'Menunggu di jemput kurir',
    );
    expect(
      getKolamNoShippingDeliveryLabel({
        items: [{ itemType: 'product' }],
        sourceRef: { type: 'offline', name: 'POS' },
      }),
    ).toBe('POS (tanpa kirim)');
    expect(
      getKolamNoShippingDeliveryLabel({
        items: [{ itemType: 'service' }],
        sourceRef: { type: 'online', name: 'Website' },
      }),
    ).toBe('Layanan (tanpa kirim)');
    expect(
      kolamSaleSkipsShippingFlow({
        items: [{ itemType: 'product' }],
        sourceRef: { type: 'offline', name: 'Kasir Cabang' },
      }),
    ).toBe(true);
  });

  it('remaps waiting_pickup label for marketplace drop-off vs courier pickup', () => {
    const tokopediaDropoff = normalizeKolamSale({
      _id: 'sale-wp-tp-drop',
      invoiceCode: 'INV-WP-TP',
      status: 'paid',
      deliveryStatus: 'waiting_pickup',
      externalRef: {
        source: 'tokopedia',
        tokopedia: {
          fulfillmentMode: 'dropoff',
          lastStatus: 101,
        },
      },
      items: [],
    });
    expect(resolveKolamWaitingPickupDisplayLabel(tokopediaDropoff)).toBe(
      'Menunggu dibawa ke gerai',
    );
    expect(
      formatKolamSaleDeliveryStatusLabel(
        'waiting_pickup',
        'paid',
        tokopediaDropoff,
      ),
    ).toBe('Menunggu dibawa ke gerai');
    expect(
      formatKolamSaleDeliveryStatusLabel('waiting_pickup', 'paid'),
    ).toBe('Menunggu di jemput kurir');

    const tokopediaPickup = normalizeKolamSale({
      _id: 'sale-wp-tp-pick',
      invoiceCode: 'INV-WP-TPP',
      status: 'paid',
      deliveryStatus: 'waiting_pickup',
      externalRef: {
        source: 'tokopedia',
        tokopedia: {
          fulfillmentMode: 'pickup',
          lastStatus: 101,
        },
      },
      items: [],
    });
    expect(
      formatKolamSaleDeliveryStatusLabel(
        'waiting_pickup',
        'paid',
        tokopediaPickup,
      ),
    ).toBe('Menunggu di jemput kurir');

    const shopeeDropoffPending = normalizeKolamSale({
      _id: 'sale-wp-sp-drop',
      invoiceCode: 'INV-WP-SP',
      status: 'paid',
      deliveryStatus: 'waiting_pickup',
      externalRef: {
        source: 'shopee',
        shopee: {
          fulfillmentMode: 'dropoff',
          pickupArranged: false,
        },
      },
      items: [],
    });
    expect(isKolamShopeeDropOffOnly(shopeeDropoffPending)).toBe(true);
    expect(isKolamShopeeDropOffArrangedOnSale(shopeeDropoffPending)).toBe(false);
    expect(
      formatKolamSaleDeliveryStatusLabel(
        'waiting_pickup',
        'paid',
        shopeeDropoffPending,
      ),
    ).toBe('Menunggu dibawa ke gerai');

    const shopeeDropoffArranged = normalizeKolamSale({
      _id: 'sale-wp-sp-arr',
      invoiceCode: 'INV-WP-SPA',
      status: 'paid',
      deliveryStatus: 'waiting_pickup',
      externalRef: {
        source: 'shopee',
        shopee: {
          fulfillmentMode: 'dropoff',
          pickupArranged: true,
        },
      },
      items: [],
    });
    expect(isKolamShopeeDropOffArrangedOnSale(shopeeDropoffArranged)).toBe(true);
    expect(
      formatKolamSaleDeliveryStatusLabel(
        'waiting_pickup',
        'paid',
        shopeeDropoffArranged,
      ),
    ).toBe('Drop Off');
  });

  it('splits shipping vs complaint labels like FE list columns', () => {
    expect(
      formatKolamSaleDeliveryStatusLabel('waiting_complaints', 'paid'),
    ).toBe('Terkirim');
    expect(formatKolamSaleDeliveryStatusLabel('complaint', 'paid')).toBe(
      'Terkirim',
    );
    expect(
      formatKolamSaleDeliveryFilterLabel('waiting_complaints'),
    ).toBe('Menunggu komplain');
    expect(formatKolamSaleDeliveryFilterLabel('complaint')).toBe(
      'Komplain diproses',
    );

    const waitingWindow = normalizeKolamSale({
      _id: 'sale-cw-1',
      invoiceCode: 'INV-CW-1',
      status: 'paid',
      deliveryStatus: 'waiting_complaints',
      items: [],
    });
    expect(resolveKolamSaleComplaintDisplayLabel(waitingWindow)).toBe(
      'Menunggu komplain',
    );
    expect(formatKolamSaleListComplaintLabel('Menunggu komplain')).toBe(
      'Menunggu',
    );
    expect(getKolamSaleListComplaintDisplay(waitingWindow)).toEqual({
      label: 'Menunggu',
      intent: 'warning',
      asBadge: true,
    });

    const clearSale = normalizeKolamSale({
      _id: 'sale-cw-2',
      invoiceCode: 'INV-CW-2',
      status: 'paid',
      deliveryStatus: 'success',
      items: [],
    });
    expect(resolveKolamSaleComplaintDisplayLabel(clearSale)).toBe(
      'Tidak dikomplain',
    );
    expect(getKolamSaleListComplaintDisplay(clearSale)).toEqual({
      label: 'Lulus',
      intent: 'muted',
      asBadge: false,
    });

    const ticketSale = normalizeKolamSale({
      _id: 'sale-cw-3',
      invoiceCode: 'INV-CW-3',
      status: 'paid',
      deliveryStatus: 'delivered',
      hasComplaints: true,
      complaints: [
        {_id: 'c1', ticketCode: 'CMP-1', status: 'pending', decision: ''},
      ],
      items: [],
    });
    expect(getKolamSaleListComplaintDisplay(ticketSale)).toEqual({
      label: 'Komplain',
      intent: 'warning',
      asBadge: true,
    });
    expect(
      formatKolamSaleDeliveryStatusLabel(
        ticketSale.deliveryStatus,
        ticketSale.status,
        ticketSale,
      ),
    ).toBe('Terkirim');
  });

  it('gates status, edit, add-items, and delivery transitions', () => {
    expect(getKolamSaleAllowedStatusTransitions('draft')).toEqual([
      'sent',
      'cancelled',
    ]);
    expect(getKolamSaleAllowedStatusTransitions('pending')).toEqual([]);
    expect(canEditKolamSaleDraft({ status: 'draft' })).toBe(true);
    expect(canEditKolamSaleDraft({ status: 'pending' })).toBe(false);
    expect(canShowKolamSaleEditAction({ status: 'pending' })).toBe(true);
    expect(
      canAddItemsToKolamSale({ status: 'paid', deliveryStatus: 'none' }),
    ).toBe(true);
    expect(
      canAddItemsToKolamSale({ status: 'paid', deliveryStatus: 'packing' }),
    ).toBe(false);
    expect(canUploadKolamSalePaymentProof('sent')).toBe(true);
    expect(canMarkKolamSalePaid({ status: 'sent', paymentProofs: [] }).ok).toBe(
      false,
    );
    expect(
      getKolamSaleAllowedDeliveryTransitions('none', { isOfflineSource: true }),
    ).toEqual(['packing', 'on_delivery', 'success']);
    expect(
      getKolamSaleAllowedDeliveryTransitions('none', {
        isOfflineSource: false,
      }),
    ).toEqual(['packing', 'on_delivery']);
  });

  it('formats cashflow and forbidden mutation errors', () => {
    const formatted = formatKolamSaleMutationError(
      new ApiError(400, {
        message: 'No open cashflow session',
        code: 'CASHFLOW_SESSION_REQUIRED',
      }),
    );
    expect(formatted).toContain('Sesi Tunai');
    expect(formatted).toContain('No open cashflow session');

    const forbidden = formatKolamSaleMutationError(
      new ApiError(403, { message: 'Forbidden for role' }),
    );
    expect(forbidden).toContain('Forbidden for role');
  });

  it('picks default offline POS source and filters marketplace options', () => {
    expect(
      pickDefaultOfflinePosSourceId([
        {
          id: 'aaaaaaaaaaaaaaaaaaaaaaaa',
          type: 'online',
          name: 'Shopee',
        },
        {
          id: 'bbbbbbbbbbbbbbbbbbbbbbbb',
          type: 'offline',
          name: 'Website Counter',
        },
        {
          id: 'cccccccccccccccccccccccc',
          type: 'offline',
          name: 'POS',
        },
      ]),
    ).toBe('cccccccccccccccccccccccc');

    const methods = [
      { name: 'Cash POS' },
      { name: 'Transfer Shopee' },
      { name: 'Tokopedia VA' },
    ];
    expect(
      filterOptionsBySalesSource(methods, {
        type: 'offline',
        name: 'POS',
      }).map(row => row.name),
    ).toEqual(['Cash POS']);
    expect(isMarketplaceSalesSource({ type: 'online', name: 'Shopee' })).toBe(
      true,
    );
    expect(
      isMarketplaceSalesSource({ type: 'online', name: 'Tokopedia' }),
    ).toBe(true);
    expect(
      isMarketplaceSalesSource({ type: 'online', name: 'Shopee Official' }),
    ).toBe(false);
    expect(
      isMarketplaceSalesSource({ type: 'online', name: 'Tokopedia Store' }),
    ).toBe(false);

    const fallback = filterOptionsBySalesSourceWithFallback(
      [{ name: 'Cash POS' }, { name: 'Transfer Bank' }],
      { type: 'online', name: 'Shopee' },
    );
    expect(fallback.usedFallback).toBe(true);
    expect(fallback.items.map(row => row.name)).toEqual([
      'Cash POS',
      'Transfer Bank',
    ]);
  });

  it('builds and validates create sale payload including buyerInfo', () => {
    const form = createInitialKolamSaleCreateForm();
    form.customerId = '111111111111111111111111';
    form.paymentMethodId = '222222222222222222222222';
    form.sourceRefId = '333333333333333333333333';
    form.items[0] = {
      ...form.items[0],
      itemType: 'product',
      productId: '444444444444444444444444',
      quantity: '2',
      shippingMethodId: '555555555555555555555555',
      shippingCost: '15000',
      discountType: 'percentage',
      discountAmount: '10',
    };
    form.shippingCost = '15000';

    const body = buildKolamSaleCreateBody(form);
    expect(body.items[0]).toMatchObject({
      itemType: 'product',
      product: '444444444444444444444444',
      quantity: 2,
      shippingMethod: '555555555555555555555555',
      shippingCost: 15000,
      discount: { type: 'percentage', amount: 10 },
    });
    expect(body.shippingCost).toBe(15000);
    expect(form.items[0].discountType).toBe('percentage');
    expect(createInitialKolamSaleCreateForm().items[0].discountType).toBe(
      'percentage',
    );
    expect(createInitialKolamSaleCreateForm().items[0].shippingMethodId).toBe(
      '',
    );
    expect(validateKolamSaleCreatePayload(body).isValid).toBe(true);

    const lineTotal = estimateKolamSaleCreateItemLineTotal(
      {
        ...form.items[0],
        quantity: '2',
        discountType: 'percentage',
        discountAmount: '10',
      },
      [
        {
          id: '444444444444444444444444',
          priceToSell: 100_000,
          price: 90_000,
        } as never,
      ],
      [],
    );
    expect(lineTotal.unitPrice).toBe(100_000);
    expect(lineTotal.subtotal).toBe(200_000);
    expect(lineTotal.discount).toBe(20_000);
    expect(lineTotal.total).toBe(180_000);

    expect(createInitialKolamSaleCreateForm().items[0].itemType).toBe('product');
    expect(createInitialKolamSaleCreateForm().pointsMethod).toBe('product_based');
    expect(body.pointsConfig).toEqual({ method: 'product_based' });

    const summary = estimateKolamSaleCreateOrderSummary(
      form,
      [
        {
          id: '444444444444444444444444',
          name: 'Produk A',
          priceToSell: 100_000,
          price: 90_000,
        } as never,
      ],
      [],
      [],
      [],
    );
    expect(summary.itemsTotal).toBe(180_000);
    expect(summary.shippingTotal).toBe(15_000);
    expect(summary.grandTotal).toBe(195_000);

    form.termsTemplateIds = ['777777777777777777777777'];
    expect(buildKolamSaleCreateBody(form).termsTemplates).toEqual([
      '777777777777777777777777',
    ]);

    const shippingMethodId = '666666666666666666666666';
    const shippingIds = resolveKolamSaleCreateItemShippingMethodIds(
      {
        ...form.items[0],
        itemType: 'product',
        productId: '444444444444444444444444',
      },
      [
        {
          id: '444444444444444444444444',
          logistics: {
            shippingMethods: [{ id: 'shipping-1' }],
          },
          raw: {
            availableShippingMethods: [shippingMethodId],
          },
        } as never,
      ],
      [],
    );
    expect(shippingIds).toEqual([shippingMethodId]);
    expect(
      filterKolamSaleCreateItemShippingMethods(
        [
          {
            id: shippingMethodId,
            displayName: 'JNE',
            pricingPrice: 12000,
          } as never,
        ],
        shippingIds,
      ),
    ).toHaveLength(1);

    const marketplaceBody = buildKolamSaleCreateBody(
      {
        ...form,
        customerId: '',
        buyerInfoName: 'Buyer Shopee',
      },
      { useBuyerInfo: true },
    );
    expect(marketplaceBody.customer).toBeNull();
    expect(marketplaceBody.buyerInfo?.name).toBe('Buyer Shopee');
    expect(validateKolamSaleCreatePayload(marketplaceBody).isValid).toBe(true);

    expect(
      validateKolamSaleCreatePayload({
        ...body,
        customer: null,
      }).errors[0],
    ).toBe('Customer atau nama pembeli wajib diisi');
  });

  it('normalizes sales analytics overview from beranda-style payload', () => {
    const overview = normalizeKolamSaleAnalyticsOverview(
      {
        data: {
          range: 'week',
          bySource: [
            {
              sourceId: 's1',
              name: 'POS',
              logo: '/logos/pos.png',
              type: 'offline',
              orderCount: 12,
            },
          ],
          timeline: [
            {
              timestamp: '2026-07-24T00:00:00.000Z',
              successCount: 4,
              failedCount: 1,
            },
          ],
          totals: { orders: 12, success: 4, failed: 1 },
        },
      },
      'month',
    );
    expect(overview.range).toBe('week');
    expect(overview.bySource).toHaveLength(1);
    expect(overview.bySource[0].orderCount).toBe(12);
    expect(overview.bySource[0].logoUri).toContain('/logos/pos.png');
    expect(overview.totals.orders).toBe(12);
    expect(overview.timeline[0].failedCount).toBe(1);
  });

  it('keeps list rows even when a sale document has a nested data field', () => {
    const list = normalizeKolamSaleList({
      data: [
        {
          _id: '507f1f77bcf86cd799439011',
          invoiceCode: 'INV-NEST',
          status: 'draft',
          data: { leftover: true, meta: 1 },
          items: [],
        },
        {
          _id: { $oid: '507f1f77bcf86cd799439012' },
          invoiceCode: 'INV-OID',
          status: 'sent',
          items: [],
        },
      ],
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    });
    expect(list.data).toHaveLength(2);
    expect(list.data[0].invoiceCode).toBe('INV-NEST');
    expect(list.data[1].id).toBe('507f1f77bcf86cd799439012');
  });

  it('skips invalid list rows without dropping valid siblings', () => {
    const list = normalizeKolamSaleList({
      data: [
        null,
        'broken',
        {
          _id: 'sale-ok',
          invoiceCode: 'INV-OK',
          status: 'sent',
          items: [],
        },
        { invoiceCode: 'NO-ID', status: 'draft', items: [] },
      ],
      pagination: { page: 1, limit: 10, total: 4, totalPages: 1 },
    });
    expect(list.data).toHaveLength(1);
    expect(list.data[0].id).toBe('sale-ok');
    expect(list.pagination.total).toBe(4);
  });

  it('hydrates edit form and validates update payload sourceRef', () => {
    const sale = normalizeKolamSale({
      _id: 'sale-edit',
      invoiceCode: 'INV-E',
      status: 'draft',
      customer: { _id: '111111111111111111111111', name: 'Ada' },
      paymentMethod: { _id: '222222222222222222222222', name: 'Cash' },
      sourceRef: { _id: '333333333333333333333333', name: 'POS', type: 'offline' },
      items: [
        {
          _id: 'i1',
          itemType: 'product',
          product: { _id: '444444444444444444444444', name: 'Filter' },
          quantity: 1,
          unitPrice: 1000,
        },
      ],
    });
    const form = hydrateKolamSaleCreateFormFromSale(sale);
    expect(form.customerId).toBe('111111111111111111111111');
    expect(form.items[0].productId).toBe('444444444444444444444444');

    expect(
      validateKolamSaleUpdatePayload({
        paymentMethod: '222222222222222222222222',
        sourceRef: '',
        shippingCost: 0,
        items: [
          {
            itemType: 'product',
            product: '444444444444444444444444',
            quantity: 1,
          },
        ],
      }).errors[0],
    ).toBe('Sumber penjualan tidak boleh dikosongkan');
  });

  it('normalizes linked complaints and deep-link eligibility helpers', () => {
    const sale = normalizeKolamSale({
      _id: 'sale-c1',
      invoiceCode: 'INV-C',
      status: 'paid',
      deliveryStatus: 'delivered',
      hasComplaints: true,
      complaints: [
        {
          _id: 'comp-1',
          ticketCode: 'COMP-1',
          status: 'pending',
          decision: null,
        },
      ],
    });

    expect(sale.hasComplaints).toBe(true);
    expect(getKolamSaleMainComplaint(sale)?.id).toBe('comp-1');
    expect(canOpenKolamSaleComplaintCreate(sale)).toBe(false);
    expect(
      canOpenKolamSaleComplaintCreate({
        status: 'paid',
        hasComplaints: false,
      }),
    ).toBe(true);
    expect(
      canShowKolamSaleComplaintSuccessPrompt({
        status: 'paid',
        deliveryStatus: 'delivered',
        marketplaceSource: '',
      }),
    ).toBe(true);
    expect(
      canShowKolamSaleComplaintSuccessPrompt({
        status: 'paid',
        deliveryStatus: 'delivered',
        marketplaceSource: 'shopee',
      }),
    ).toBe(false);
  });

  it('gates discount approval by finance/super-admin and scrapes history reasons', () => {
    expect(canApproveKolamSaleDiscount('finance')).toBe(true);
    expect(canApproveKolamSaleDiscount('super-admin')).toBe(true);
    expect(canApproveKolamSaleDiscount('super_administrator')).toBe(true);
    expect(canApproveKolamSaleDiscount('cashier')).toBe(false);
    expect(canApproveKolamSaleDiscount(null)).toBe(false);

    const sale = normalizeKolamSale({
      _id: 'sale-pending',
      invoiceCode: 'INV-P',
      status: 'pending',
      discount: 0,
      items: [
        {
          _id: 'i1',
          itemType: 'product',
          quantity: 2,
          unitPrice: 10000,
          discount: { type: 'percentage', amount: 10 },
          subtotal: 18000,
        },
      ],
      saleHistories: [
        {
          status: 'pending',
          note: 'Requires finance approval: item discount below minimum',
          changedAt: '2026-08-01T00:00:00.000Z',
        },
        { status: 'pending', note: 'Ordinary note', changedAt: '2026-08-01T00:00:00.000Z' },
      ],
    });

    expect(sale.discount).toBe(0);
    expect(getKolamSaleItemDiscountAmount(sale.items[0])).toBe(2000);
    expect(getKolamSaleDiscountApprovalReasons(sale)).toEqual([
      'Requires finance approval: item discount below minimum',
    ]);
  });

  it('normalizes per-item voucher snapshot from BE items[].voucher', () => {
    const sale = normalizeKolamSale({
      _id: 'sale-voucher',
      invoiceCode: 'INV-V',
      status: 'pending',
      items: [
        {
          _id: 'i1',
          itemType: 'product',
          quantity: 1,
          unitPrice: 100000,
          subtotal: 100000,
          voucher: {
            voucherId: 'v1',
            code: 'HEMAT10',
            discountType: 'percentage',
            discountValue: 10,
            discountApplied: 10000,
            appliedAt: '2026-08-01T00:00:00.000Z',
          },
        },
      ],
      saleHistories: [
        {
          status: 'pending',
          note: 'Sale created with per-item discount / voucher — awaiting finance approval',
          changedAt: '2026-08-01T00:00:00.000Z',
        },
      ],
    });

    expect(sale.items[0].voucherCode).toBe('HEMAT10');
    expect(sale.items[0].voucherDiscountApplied).toBe(10000);
    expect(sale.items[0].voucherDiscountType).toBe('percentage');
    expect(sale.items[0].voucherDiscountValue).toBe(10);
    expect(getKolamSaleItemVoucherDiscountApplied(sale.items[0])).toBe(10000);
    expect(formatKolamSaleItemVoucherLabel(sale.items[0])).toBe('HEMAT10 (10%)');
    expect(getKolamSaleDiscountApprovalReasons(sale)).toEqual([
      'Sale created with per-item discount / voucher — awaiting finance approval',
    ]);
  });
});
