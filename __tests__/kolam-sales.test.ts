import {
  buildKolamSaleCreateBody,
  canMarkKolamSalePaid,
  canUploadKolamSalePaymentProof,
  createInitialKolamSaleCreateForm,
  createInitialKolamSaleListFilters,
  filterOptionsBySalesSource,
  formatKolamSaleDeliveryStatusLabel,
  formatKolamSaleMutationError,
  formatKolamSalePaymentStatusLabel,
  getKolamSaleAllowedStatusTransitions,
  getKolamSalePaymentStatusIntent,
  getKolamSaleRouteId,
  getKolamSaleSurfaceMode,
  isKolamSaleMarketplaceManaged,
  isKolamSalesCreateRoute,
  isKolamSalesDetailRoute,
  isKolamSalesDiscountApprovalRoute,
  isKolamSalesListRoute,
  isKolamSalesRoute,
  normalizeKolamSale,
  normalizeKolamSaleList,
  pickDefaultOfflinePosSourceId,
  validateKolamSaleCreatePayload,
} from '../src/domain/kolam-sales';
import { getKolamNavigationRouteTarget } from '../src/domain/kolam-navigation';
import { ApiError } from '../src/lib/api-error';

describe('kolam sales domain', () => {
  it('detects list, detail, and create ops routes; excludes edit/discount-approval', () => {
    expect(isKolamSalesRoute('/sales')).toBe(true);
    expect(isKolamSalesListRoute('/sales')).toBe(true);
    expect(isKolamSalesDetailRoute('/sales/abc123')).toBe(true);
    expect(getKolamSaleRouteId('/sales/abc123')).toBe('abc123');

    expect(isKolamSalesRoute('/sales/create')).toBe(true);
    expect(isKolamSalesCreateRoute('/sales/create')).toBe(true);
    expect(isKolamSalesRoute('/sales/abc123/edit')).toBe(false);
    expect(isKolamSalesRoute('/sales/discount-approval')).toBe(false);
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

  it('normalizes sale list and detail payloads', () => {
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
              product: { name: 'Filter', sku: 'F-1' },
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
    expect(list.data[0].buyerLabel).toBe('Ada');
    expect(list.data[0].items[0].title).toBe('Filter');
    expect(list.pagination.total).toBe(1);

    const detail = normalizeKolamSale({
      data: {
        _id: 'sale-2',
        invoiceCode: 'INV-02',
        status: 'paid',
        deliveryStatus: 'none',
        buyerInfo: { name: 'Shopee Buyer', phone: '0812' },
        externalRef: { source: 'shopee' },
        paymentMethod: { _id: 'pm1', name: 'Transfer', type: 'transfer' },
        paymentProofs: [{ path: '/proofs/a.jpg', uploadedAt: '2026-01-02' }],
        items: [],
        finalTotal: 99000,
      },
    });
    expect(detail.id).toBe('sale-2');
    expect(detail.buyerLabel).toBe('Shopee Buyer');
    expect(detail.marketplaceSource).toBe('shopee');
    expect(isKolamSaleMarketplaceManaged(detail)).toBe(true);
    expect(detail.paymentMethod?.name).toBe('Transfer');
    expect(detail.paymentProofs).toHaveLength(1);
    expect(detail.paymentProofs[0].uri).toContain('/proofs/a.jpg');
  });

  it('formats payment and delivery labels for list badges', () => {
    expect(formatKolamSalePaymentStatusLabel('paid')).toBe('Lunas');
    expect(getKolamSalePaymentStatusIntent('paid')).toBe('success');
    expect(formatKolamSaleDeliveryStatusLabel('none', 'paid')).toBe(
      'Butuh kirim',
    );
    expect(formatKolamSaleDeliveryStatusLabel('packing', 'paid')).toBe(
      'Sedang dipacking',
    );
  });

  it('gates status transitions and paid proof requirement', () => {
    expect(getKolamSaleAllowedStatusTransitions('draft')).toEqual([
      'sent',
      'cancelled',
    ]);
    expect(getKolamSaleAllowedStatusTransitions('pending')).toEqual([]);
    expect(getKolamSaleAllowedStatusTransitions('sent')).toEqual([
      'paid',
      'cancelled',
    ]);
    expect(canUploadKolamSalePaymentProof('sent')).toBe(true);
    expect(canUploadKolamSalePaymentProof('draft')).toBe(false);
    expect(canMarkKolamSalePaid({ status: 'sent', paymentProofs: [] }).ok).toBe(
      false,
    );
    expect(
      canMarkKolamSalePaid({
        status: 'sent',
        paymentProofs: [{ path: 'x' }],
      }).ok,
    ).toBe(true);
  });

  it('formats cashflow session required errors for operators', () => {
    const formatted = formatKolamSaleMutationError(
      new ApiError(400, {
        message: 'No open cashflow session',
        code: 'CASHFLOW_SESSION_REQUIRED',
      }),
    );
    expect(formatted).toContain('Sesi Tunai');
    expect(formatted).toContain('No open cashflow session');
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
      filterOptionsBySalesSource(methods, {
        type: 'online',
        name: 'Shopee Official',
      }).map(row => row.name),
    ).toEqual(['Transfer Shopee']);
  });

  it('builds and validates create sale payload', () => {
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
    expect(body).toEqual({
      customer: '111111111111111111111111',
      paymentMethod: '222222222222222222222222',
      sourceRef: '333333333333333333333333',
      shippingCost: 0,
      items: [
        {
          itemType: 'product',
          product: '444444444444444444444444',
          quantity: 2,
          discount: { type: 'fixed', amount: 1000 },
        },
      ],
    });
    expect(validateKolamSaleCreatePayload(body).isValid).toBe(true);

    expect(
      validateKolamSaleCreatePayload({
        ...body,
        customer: null,
      }).errors[0],
    ).toBe('Customer wajib diisi');
  });
});
