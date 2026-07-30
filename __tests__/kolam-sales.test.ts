import {
  buildKolamSaleCreateBody,
  canAddItemsToKolamSale,
  canEditKolamSaleDraft,
  canMarkKolamSalePaid,
  canUploadKolamSalePaymentProof,
  createInitialKolamSaleCreateForm,
  createInitialKolamSaleListFilters,
  filterOptionsBySalesSource,
  formatKolamSaleDeliveryStatusLabel,
  formatKolamSaleMutationError,
  formatKolamSalePaymentStatusLabel,
  getKolamSaleAllowedDeliveryTransitions,
  getKolamSaleAllowedStatusTransitions,
  getKolamSaleEditRouteId,
  getKolamSalePaymentStatusIntent,
  getKolamSaleRouteId,
  getKolamSaleSurfaceMode,
  hydrateKolamSaleCreateFormFromSale,
  isKolamSaleMarketplaceManaged,
  isKolamSalesAddItemsRoute,
  isKolamSalesCreateRoute,
  isKolamSalesDetailRoute,
  isKolamSalesDiscountApprovalRoute,
  isKolamSalesEditRoute,
  isKolamSalesListRoute,
  isKolamSalesRoute,
  isMarketplaceSalesSource,
  normalizeKolamSale,
  normalizeKolamSaleAnalyticsOverview,
  normalizeKolamSaleList,
  pickDefaultOfflinePosSourceId,
  validateKolamSaleCreatePayload,
  validateKolamSaleUpdatePayload,
} from '../src/domain/kolam-sales';
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
    expect(detail.paymentMethod?.name).toBe('Transfer');
    expect(detail.paymentProofs).toHaveLength(1);
    expect(detail.paymentProofs[0].uri).toContain('/proofs/a.jpg');
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
  });

  it('gates status, edit, add-items, and delivery transitions', () => {
    expect(getKolamSaleAllowedStatusTransitions('draft')).toEqual([
      'sent',
      'cancelled',
    ]);
    expect(getKolamSaleAllowedStatusTransitions('pending')).toEqual([]);
    expect(canEditKolamSaleDraft({ status: 'draft' })).toBe(true);
    expect(canEditKolamSaleDraft({ status: 'pending' })).toBe(false);
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
    expect(
      isMarketplaceSalesSource({ type: 'online', name: 'Shopee Official' }),
    ).toBe(true);
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
      discountType: 'fixed',
      discountAmount: '1000',
    };

    const body = buildKolamSaleCreateBody(form);
    expect(body.items[0]).toMatchObject({
      itemType: 'product',
      product: '444444444444444444444444',
      quantity: 2,
    });
    expect(validateKolamSaleCreatePayload(body).isValid).toBe(true);

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
});
