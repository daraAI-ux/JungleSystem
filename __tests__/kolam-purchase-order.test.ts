import {
  KOLAM_PURCHASE_ORDER_ROOT,
  calculateKolamPOBreakdown,
  getAllowedNextPOStatuses,
  getKolamPOItemDisplayTitle,
  getKolamPOItemCode,
  getKolamPOItemVariantLabel,
  getKolamPOPaymentStatusLabel,
  getKolamPOStatusLabel,
  getKolamPurchaseOrderBreadcrumbPath,
  getKolamPurchaseOrderEditRouteId,
  getKolamPurchaseOrderRouteId,
  hasKolamPoStagePermission,
  isKolamPurchaseOrderCreateRoute,
  isKolamPurchaseOrderDetailRoute,
  isKolamPurchaseOrderEditRoute,
  isKolamPurchaseOrderListRoute,
  isKolamPurchaseOrderRoute,
  normalizeKolamPurchaseOrder,
  normalizeKolamPurchaseOrderList,
} from '../src/domain/kolam-purchase-order';

describe('kolam purchase order domain', () => {
  it('recognizes purchase order routes', () => {
    expect(isKolamPurchaseOrderRoute(KOLAM_PURCHASE_ORDER_ROOT)).toBe(true);
    expect(isKolamPurchaseOrderRoute('/purchase-order/po-1')).toBe(true);
    expect(isKolamPurchaseOrderRoute('/purchase-order/po-1/edit')).toBe(true);
    expect(isKolamPurchaseOrderRoute('/suppliers')).toBe(false);

    expect(isKolamPurchaseOrderListRoute(KOLAM_PURCHASE_ORDER_ROOT)).toBe(true);
    expect(isKolamPurchaseOrderListRoute('/purchase-order/po-1')).toBe(false);

    expect(isKolamPurchaseOrderCreateRoute('/purchase-order/create')).toBe(true);
    expect(isKolamPurchaseOrderCreateRoute('/purchase-order/po-1')).toBe(false);

    expect(getKolamPurchaseOrderRouteId('/purchase-order/po-1')).toBe('po-1');
    expect(getKolamPurchaseOrderRouteId(KOLAM_PURCHASE_ORDER_ROOT)).toBe(null);
    expect(getKolamPurchaseOrderRouteId('/purchase-order/create')).toBe(null);
    expect(isKolamPurchaseOrderDetailRoute('/purchase-order/po-1')).toBe(true);
    expect(isKolamPurchaseOrderDetailRoute('/purchase-order/po-1/edit')).toBe(false);

    expect(getKolamPurchaseOrderEditRouteId('/purchase-order/po-1/edit')).toBe(
      'po-1',
    );
    expect(getKolamPurchaseOrderEditRouteId('/purchase-order/po-1')).toBe(null);
    expect(isKolamPurchaseOrderEditRoute('/purchase-order/po-1/edit')).toBe(true);

    expect(getKolamPurchaseOrderBreadcrumbPath('new')).toBe(
      '/purchase-order/create',
    );
    expect(
      getKolamPurchaseOrderBreadcrumbPath('detail', { id: 'po-1', poCode: 'PO-1' }),
    ).toBe('/purchase-order/po-1');
    expect(
      getKolamPurchaseOrderBreadcrumbPath('edit', { id: 'po-1', poCode: 'PO-1' }),
    ).toBe('/purchase-order/po-1/edit');
  });

  it('normalizes a purchase order list payload', () => {
    const result = normalizeKolamPurchaseOrderList({
      data: [
        {
          _id: 'po-1',
          poCode: 'PO-0001',
          vendor: { _id: 'v1', name: 'Pemasok Satu' },
          items: [
            {
              _id: 'item-1',
              product: { _id: 'p1', name: 'Produk A', sku: 'SKU-A' },
              quantity: 2,
              unitPrice: { $numberDecimal: '15000' },
            },
          ],
          total: { $numberDecimal: '30000' },
          finalTotal: 30000,
          status: 'sent',
          paymentStatus: 'unpaid',
          refundStatus: 'none',
          shippingCost: 5000,
          createdBy: { first_name: 'Budi', last_name: 'Santoso' },
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    expect(result.data).toHaveLength(1);
    expect(result.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });

    const po = result.data[0];
    expect(po).toMatchObject({
      id: 'po-1',
      poCode: 'PO-0001',
      status: 'sent',
      shippingCost: 5000,
      createdByName: 'Budi Santoso',
    });
    expect(po.vendor).toEqual({ id: 'v1', name: 'Pemasok Satu' });
    expect(po.total).toBe(30000);
    expect(po.items).toHaveLength(1);
    expect(po.items[0]).toMatchObject({
      itemType: 'product',
      refId: 'p1',
      title: 'Produk A',
      sku: 'SKU-A',
      quantity: 2,
      unitPrice: 15000,
      lineTotal: 30000,
    });
  });

  it('falls back singular receive/check proof into proofs arrays', () => {
    const po = normalizeKolamPurchaseOrder({
      data: {
        _id: 'po-proofs',
        poCode: 'PO-PROOF',
        receiveProof: '/uploads/receive-1.jpg',
        checkProof: '/uploads/check-1.jpg',
        receivedAt: '2026-07-12T10:00:00.000Z',
        onCheckAt: '2026-07-12T12:00:00.000Z',
        status: 'on_check',
      },
    });

    expect(po.receiveProofs).toEqual(['/uploads/receive-1.jpg']);
    expect(po.checkProofs).toEqual(['/uploads/check-1.jpg']);
  });

  it('normalizes a purchase order detail payload with species item + variant', () => {
    const po = normalizeKolamPurchaseOrder({
      data: {
        _id: 'po-2',
        poCode: 'PO-0002',
        vendor: 'v2',
        wallet: { _id: 'w1', name: 'Kas Utama', type: 'cash' },
        items: [
          {
            _id: 'item-2',
            species: { _id: 's1', scientificName: 'Rana sp.' },
            variant: { _id: 'var-1', tier1Value: 'S', sku: 'RANA-S' },
            quantity: 3,
            unitPrice: 8000,
            receivedQuantity: 2,
          },
        ],
        status: 'on_check',
        paymentStatus: 'partial_paid',
        refundStatus: 'pending',
        discount: { type: 'percent', value: 10 },
        isPartial: true,
      },
    });

    expect(po.id).toBe('po-2');
    expect(po.vendor).toEqual({ id: 'v2', name: '' });
    expect(po.wallet).toEqual({ id: 'w1', name: 'Kas Utama', type: 'cash' });
    expect(po.discount).toEqual({ type: 'percent', value: 10 });
    expect(po.isPartial).toBe(true);
    expect(po.items[0]).toMatchObject({
      itemType: 'species',
      refId: 's1',
      title: 'Rana sp.',
      receivedQuantity: 2,
    });
    expect(getKolamPOItemDisplayTitle(po.items[0])).toBe('Rana sp.');
    expect(getKolamPOItemVariantLabel(po.items[0].variant)).toBe('S');
    expect(getKolamPOItemCode(po.items[0])).toBe('RANA-S');
  });

  it('resolves allowed next statuses matching backend transitions', () => {
    expect(getAllowedNextPOStatuses('draft')).toEqual(['sent', 'cancelled']);
    expect(getAllowedNextPOStatuses('sent')).toEqual(['delivery', 'cancelled']);
    expect(getAllowedNextPOStatuses('delivery')).toEqual(['received']);
    expect(getAllowedNextPOStatuses('received')).toEqual(['on_check']);
    expect(getAllowedNextPOStatuses('on_check')).toEqual(['completed', 'rejected']);
    expect(getAllowedNextPOStatuses('completed')).toEqual([]);
    expect(getAllowedNextPOStatuses('rejected')).toEqual([]);
    expect(getAllowedNextPOStatuses('cancelled')).toEqual(['draft']);
    expect(getAllowedNextPOStatuses('unknown')).toEqual([]);
  });

  it('gates workflow stages behind purchase-order permissions', () => {
    expect(hasKolamPoStagePermission(null, 'receive')).toBe(true);
    expect(
      hasKolamPoStagePermission(
        [{ resource: 'purchase-order', actions: ['update_status'] }],
        'complete_stock',
      ),
    ).toBe(true);
    expect(
      hasKolamPoStagePermission(
        [{ resource: 'purchase-order', actions: ['view'] }],
        'receive',
      ),
    ).toBe(false);
    expect(
      hasKolamPoStagePermission(
        [{ resource: 'purchase-order', actions: ['receive'] }],
        'receive',
      ),
    ).toBe(true);
    expect(
      hasKolamPoStagePermission(
        [{ resource: 'purchase-order', actions: ['receive'] }],
        'general',
      ),
    ).toBe(false);
  });

  it('calculates PO breakdown with flat shipping and percent discount', () => {
    const result = calculateKolamPOBreakdown({
      items: [
        { unitPrice: 10000, quantity: 2 },
        { unitPrice: 5000, quantity: 1 },
      ],
      shippingCost: 3000,
      discount: { type: 'percent', value: 10 },
    });

    expect(result.subtotal).toBe(25000);
    expect(result.totalQty).toBe(3);
    expect(result.discountAmount).toBe(2500);
    expect(result.shippingPerUnit).toBe(1000);
    expect(result.discountPerUnit).toBe(833);
    expect(result.allocationMode).toBe('flat');
    expect(result.finalTotal).toBe(25500);
    expect(result.lines).toHaveLength(2);
    expect(result.lines[0]).toMatchObject({
      unitPrice: 10000,
      quantity: 2,
      effectivePrice: 9167,
      effectiveShipping: 1000,
      effectiveTotalCost: 10167,
    });
  });

  it('exposes Indonesian labels for PO status and payment status', () => {
    expect(getKolamPOStatusLabel('draft')).toBe('Draf');
    expect(getKolamPOStatusLabel('sent')).toBe('Dikirim');
    expect(getKolamPOStatusLabel('delivery')).toBe('Pengiriman');
    expect(getKolamPOStatusLabel('received')).toBe('Diterima');
    expect(getKolamPOStatusLabel('on_check')).toBe('Pemeriksaan');
    expect(getKolamPOStatusLabel('completed')).toBe('Selesai');
    expect(getKolamPOStatusLabel('rejected')).toBe('Ditolak');
    expect(getKolamPOStatusLabel('cancelled')).toBe('Dibatalkan');

    expect(getKolamPOPaymentStatusLabel('unpaid')).toBe('Belum dibayar');
    expect(getKolamPOPaymentStatusLabel('partial_paid')).toBe('Dibayar sebagian');
    expect(getKolamPOPaymentStatusLabel('paid')).toBe('Lunas');
  });

  it('normalizes tax faktur pajak snapshot from PO detail', () => {
    const po = normalizeKolamPurchaseOrder({
      _id: 'po-tax',
      poCode: 'PO-TAX',
      vendor: { _id: 'v1', name: 'Vendor' },
      items: [],
      total: 0,
      finalTotal: 0,
      status: 'completed',
      paymentStatus: 'paid',
      refundStatus: 'none',
      tax: {
        fakturPajak: {
          serialNumber: '010.001',
          status: 'draft',
          vendorNpwp: '123',
          vendorName: 'Vendor PT',
          notes: 'catatan',
        },
      },
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    expect(po.taxFaktur).toMatchObject({
      serialNumber: '010.001',
      status: 'draft',
      vendorNpwp: '123',
      vendorName: 'Vendor PT',
      notes: 'catatan',
    });
  });
});
