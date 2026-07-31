import {
  canOpenKolamComplaintRefundPayment,
  getAllowedKolamComplaintStatuses,
  getAllowedKolamComplaintTrackingStatuses,
  getAvailableKolamComplaintDecisions,
  getKolamComplaintDecisionLabel,
  getKolamComplaintIdFromRoute,
  getKolamComplaintRefundPaymentStatusLabel,
  getKolamComplaintRefundWorkflowStep,
  getKolamComplaintRouteMode,
  getKolamComplaintStatusLabel,
  isKolamComplaintRefundAwaitingReturn,
  isKolamComplaintReturnAwaitingVerification,
  isKolamComplaintRoute,
  isKolamSaleEligibleForComplaint,
  isMarketplaceMirrorComplaint,
  needsKolamComplaintReplacementReturnTracking,
  needsKolamComplaintReplacementTracking,
  normalizeKolamComplaint,
  normalizeKolamComplaintList,
  parseKolamComplaintCreateQuery,
  buildKolamComplaintCreateRoute,
  resolveKolamComplaintSaleSourceLogoUri,
  validateKolamComplaintCreateInput,
} from '../src/domain/kolam-complaint';
import {
  getKolamNavigationItemByRoute,
  getKolamNavigationRouteTarget,
} from '../src/domain/kolam-navigation';

describe('kolam-complaint domain', () => {
  it('parses complaint routes', () => {
    expect(isKolamComplaintRoute('/complaints')).toBe(true);
    expect(isKolamComplaintRoute('/complaints/create')).toBe(true);
    expect(isKolamComplaintRoute('/complaints/abc')).toBe(true);
    expect(isKolamComplaintRoute('/sales')).toBe(false);
    expect(getKolamComplaintRouteMode('/complaints')).toBe('list');
    expect(getKolamComplaintRouteMode('/complaints/create')).toBe('new');
    expect(getKolamComplaintRouteMode('/complaints/abc')).toBe('detail');
    expect(getKolamComplaintIdFromRoute('/complaints/abc')).toBe('abc');
    expect(getKolamComplaintIdFromRoute('/complaints/create')).toBe(null);
  });

  it('normalizes list and detail payloads', () => {
    const list = normalizeKolamComplaintList({
      data: [
        {
          _id: 'c1',
          ticketCode: 'COMP-20260731-001',
          status: 'pending',
          decision: null,
          source: 'arrival_inspection',
          description: 'Barang rusak',
          items: [{ saleItemIndex: 0, itemType: 'product', quantity: 1 }],
          sale: {
            _id: 'sale1',
            invoiceCode: 'INV-1',
            isCustomProject: true,
            customer: { name: 'Budi' },
          },
          assignedStaff: {
            _id: 'u1',
            first_name: 'Ani',
            last_name: 'Sari',
          },
          marketplaceSource: 'shopee',
          createdAt: '2026-07-31T00:00:00.000Z',
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    expect(list.items).toHaveLength(1);
    expect(list.items[0].ticketCode).toBe('COMP-20260731-001');
    expect(list.items[0].invoiceCode).toBe('INV-1');
    expect(list.items[0].customerName).toBe('Budi');
    expect(list.items[0].isCustomProject).toBe(true);
    expect(list.items[0].assignedStaffName).toBe('Ani Sari');
    expect(list.items[0].marketplaceReadOnly).toBe(true);
    expect(isMarketplaceMirrorComplaint(list.items[0])).toBe(true);
    expect(list.page).toBe(1);
    expect(list.limit).toBe(10);
    expect(list.total).toBe(1);
    expect(list.totalPages).toBe(1);

    const paged = normalizeKolamComplaintList({
      data: [
        {
          _id: 'c1',
          ticketCode: 'COMP-1',
          status: 'pending',
          description: 'x',
          items: [],
        },
      ],
      pagination: { page: 2, limit: 10, total: 25, totalPages: 3 },
    });
    expect(paged.items).toHaveLength(1);
    expect(paged.page).toBe(2);
    expect(paged.limit).toBe(10);
    expect(paged.total).toBe(25);
    expect(paged.totalPages).toBe(3);

    const detail = normalizeKolamComplaint({
      _id: 'c2',
      ticketCode: 'COMP-2',
      status: 'approved',
      decision: 'return_then_refund',
      description: 'Retur',
      photos: [{ _id: 'p1', path: 'media/complaints/a.jpg' }],
      histories: [
        {
          _id: 'h1',
          action: 'created',
          note: 'Tiket dibuat',
          changedBy: { first_name: 'Staff' },
          changedAt: '2026-07-31T01:00:00.000Z',
        },
      ],
      returnTracking: {
        status: 'in_transit',
        trackingNumber: 'RESI1',
        courierName: 'JNE',
        receivedBy: { _id: 'recv1', first_name: 'Rina' },
        receivedByType: 'other',
      },
      createdBy: { _id: 'cust1', first_name: 'Budi' },
      items: [],
      sale: {
        _id: 'sale2',
        invoiceCode: 'INV-2',
        sourceRef: {
          _id: 'src1',
          name: 'POS Offline',
          logo: '/media/sources/pos.png',
        },
      },
    });

    expect(detail.decision).toBe('return_then_refund');
    expect(detail.photos[0].uri).toContain('media/complaints/a.jpg');
    expect(detail.histories[0].changedByLabel).toBe('Staff');
    expect(detail.returnTracking?.trackingNumber).toBe('RESI1');
    expect(detail.returnTracking?.receivedById).toBe('recv1');
    expect(detail.returnTracking?.receivedByType).toBe('other');
    expect(detail.createdById).toBe('cust1');
    expect(detail.saleSourceRef?.id).toBe('src1');
    expect(detail.saleSourceRef?.name).toBe('POS Offline');
    expect(detail.saleSourceRef?.logoUri).toContain('media/sources/pos.png');
    expect(
      resolveKolamComplaintSaleSourceLogoUri(detail, [
        { id: 'src1', logoUri: 'https://cdn.example/fallback.png' },
      ]),
    ).toContain('media/sources/pos.png');
    expect(getKolamComplaintStatusLabel('pending')).toBe('Menunggu');
    expect(getKolamComplaintDecisionLabel(null)).toBe('Tidak ada');
  });

  it('gates replacement tracking until return is verified', () => {
    const base = normalizeKolamComplaint({
      _id: 'c3',
      ticketCode: 'COMP-3',
      status: 'processing',
      decision: 'replacement',
      description: 'Ganti',
      items: [],
      returnTracking: { status: 'received', trackingNumber: 'R1' },
    });
    expect(isKolamComplaintReturnAwaitingVerification(base)).toBe(true);
    expect(needsKolamComplaintReplacementTracking(base)).toBe(false);

    const ready = normalizeKolamComplaint({
      _id: 'c3',
      ticketCode: 'COMP-3',
      status: 'processing',
      decision: 'replacement',
      description: 'Ganti',
      items: [],
      returnTracking: { status: 'verified', trackingNumber: 'R1' },
      replacementTracking: { status: 'pending' },
      replacementReturnTracking: { status: 'pending' },
    });
    expect(isKolamComplaintReturnAwaitingVerification(ready)).toBe(false);
    expect(needsKolamComplaintReplacementTracking(ready)).toBe(true);
    expect(needsKolamComplaintReplacementReturnTracking(ready)).toBe(true);

    const done = normalizeKolamComplaint({
      _id: 'c3',
      ticketCode: 'COMP-3',
      status: 'processing',
      decision: 'replacement',
      description: 'Ganti',
      items: [],
      returnTracking: { status: 'verified' },
      replacementTracking: { status: 'verified' },
      replacementReturnTracking: { status: 'verified' },
    });
    expect(needsKolamComplaintReplacementTracking(done)).toBe(false);
    expect(needsKolamComplaintReplacementReturnTracking(done)).toBe(false);
  });

  it('gates refund payment until return is verified', () => {
    const waiting = normalizeKolamComplaint({
      _id: 'c4',
      ticketCode: 'COMP-4',
      status: 'processing',
      decision: 'return_then_refund',
      refundAmount: 150000,
      description: 'Refund',
      items: [],
      returnTracking: { status: 'in_transit', trackingNumber: 'R2' },
    });
    expect(isKolamComplaintRefundAwaitingReturn(waiting)).toBe(true);
    expect(canOpenKolamComplaintRefundPayment(waiting)).toBe(false);
    expect(getKolamComplaintRefundWorkflowStep(waiting)).toBe('unavailable');

    const ready = normalizeKolamComplaint({
      _id: 'c4',
      ticketCode: 'COMP-4',
      status: 'processing',
      decision: 'return_then_refund',
      refundAmount: 150000,
      description: 'Refund',
      items: [],
      returnTracking: { status: 'verified', trackingNumber: 'R2' },
      refundTransaction: {
        _id: 'tx1',
        amount: 150000,
        confirmStatus: 'unconfirmed',
        wallet: { _id: 'w1', name: 'Kas Utama' },
      },
      refundPaymentStatus: 'pending',
    });
    expect(isKolamComplaintRefundAwaitingReturn(ready)).toBe(false);
    expect(canOpenKolamComplaintRefundPayment(ready)).toBe(true);
    expect(ready.refundTransaction?.walletName).toBe('Kas Utama');
    expect(getKolamComplaintRefundWorkflowStep(ready)).toBe('send');
    expect(getKolamComplaintRefundPaymentStatusLabel('sent')).toBe(
      'Pembayaran dikirim',
    );

    const sent = normalizeKolamComplaint({
      _id: 'c4',
      ticketCode: 'COMP-4',
      status: 'processing',
      decision: 'return_then_refund',
      refundAmount: 150000,
      description: 'Refund',
      items: [],
      returnTracking: { status: 'verified' },
      refundTransaction: {
        _id: 'tx1',
        amount: 150000,
        confirmStatus: 'unconfirmed',
        wallet: { _id: 'w1', name: 'Kas Utama' },
      },
      refundPaymentStatus: 'sent',
      refundPaymentDetails: {
        accountNumber: '123',
        accountName: 'Budi',
        bank: 'BCA',
      },
    });
    expect(getKolamComplaintRefundWorkflowStep(sent)).toBe('confirm');
    expect(sent.refundPaymentDetails?.bank).toBe('BCA');

    const done = normalizeKolamComplaint({
      _id: 'c4',
      ticketCode: 'COMP-4',
      status: 'completed',
      decision: 'return_then_refund',
      refundAmount: 150000,
      description: 'Refund',
      items: [],
      returnTracking: { status: 'verified' },
      refundPaymentStatus: 'completed',
      refundTransaction: {
        _id: 'tx1',
        confirmStatus: 'confirmed',
        wallet: { name: 'Kas' },
      },
    });
    expect(canOpenKolamComplaintRefundPayment(done)).toBe(false);
    expect(getKolamComplaintRefundWorkflowStep(done)).toBe('completed');
  });

  it('exposes status transition and decision helpers for workflow UI', () => {
    expect(getAllowedKolamComplaintStatuses('pending')).toEqual(['in_review']);
    expect(getAllowedKolamComplaintStatuses('in_review')).toEqual([
      'approved',
      'rejected',
      'cancelled',
    ]);
    expect(getAllowedKolamComplaintTrackingStatuses('pending')).toEqual([
      'in_transit',
    ]);
    expect(
      getAvailableKolamComplaintDecisions(false).map(row => row.id),
    ).toEqual(['replacement', 'return_then_refund']);
    expect(
      getAvailableKolamComplaintDecisions(true).map(row => row.id),
    ).toEqual(['rework', 'refund']);
    expect(
      getAvailableKolamComplaintDecisions(false, {
        isWarrantyClaim: true,
      }).map(row => row.id),
    ).toEqual(['warranty_honored_da', 'warranty_rejected']);
  });

  it('parses create query and validates create payload', () => {
    expect(
      parseKolamComplaintCreateQuery(
        '/complaints/create?saleId=s1&category=damaged&pendingServiceId=ps1&taskKind=dosing&taskId=t1',
      ),
    ).toEqual({
      saleId: 's1',
      pendingServiceId: 'ps1',
      subscriptionId: null,
      category: 'damaged',
      serviceContext: {
        taskKind: 'dosing',
        taskId: 't1',
        executionId: null,
        visitTitle: null,
      },
    });

    expect(
      isKolamSaleEligibleForComplaint({
        status: 'paid',
        deliveryStatus: 'delivered',
      }),
    ).toBe(true);
    expect(
      isKolamSaleEligibleForComplaint({
        status: 'paid',
        deliveryStatus: 'packing',
      }),
    ).toBe(false);

    expect(
      validateKolamComplaintCreateInput({
        saleId: '',
        items: [],
        description: '',
        category: 'other',
        priority: 'medium',
      }),
    ).toBe('Silakan pilih penjualan/invoice');
    expect(
      validateKolamComplaintCreateInput({
        saleId: 's1',
        items: [],
        description: 'Rusak',
        category: 'other',
        priority: 'medium',
      }),
    ).toBe('Silakan pilih minimal satu item untuk dikeluhkan');
    expect(
      validateKolamComplaintCreateInput({
        saleId: 's1',
        items: [{ saleItemIndex: 0, quantity: 1 }],
        description: '  ',
        category: 'other',
        priority: 'medium',
      }),
    ).toBe('Silakan masukkan deskripsi');
    expect(
      validateKolamComplaintCreateInput({
        saleId: 's1',
        items: [{ saleItemIndex: 0, quantity: 2 }],
        description: 'Barang rusak',
        category: 'damaged',
        priority: 'high',
      }),
    ).toBeNull();

    expect(buildKolamComplaintCreateRoute({ saleId: 'sale-1' })).toBe(
      '/complaints/create?saleId=sale-1',
    );
  });
});

describe('kolam-complaint navigation', () => {
  it('keeps /complaints on kolam module with Indonesian copy', () => {
    const item = getKolamNavigationItemByRoute('/complaints');
    expect(item).toEqual(
      expect.objectContaining({
        label: 'Komplain',
        route: '/complaints',
      }),
    );
    expect(item?.description).toMatch(/komplain/i);
    expect(getKolamNavigationRouteTarget(item!).moduleId).toBe('kolam');
  });
});
