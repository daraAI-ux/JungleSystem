import {
  getAllowedKolamComplaintStatuses,
  getAllowedKolamComplaintTrackingStatuses,
  getAvailableKolamComplaintDecisions,
  getKolamComplaintDecisionLabel,
  getKolamComplaintIdFromRoute,
  getKolamComplaintRouteMode,
  getKolamComplaintStatusLabel,
  isKolamComplaintRoute,
  isMarketplaceMirrorComplaint,
  normalizeKolamComplaint,
  normalizeKolamComplaintList,
  resolveKolamComplaintSaleSourceLogoUri,
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
      },
      items: [],
      sale: 'sale2',
    });

    expect(detail.decision).toBe('return_then_refund');
    expect(detail.photos[0].uri).toContain('media/complaints/a.jpg');
    expect(detail.histories[0].changedByLabel).toBe('Staff');
    expect(detail.returnTracking?.trackingNumber).toBe('RESI1');
    expect(getKolamComplaintStatusLabel('pending')).toBe('Menunggu');
    expect(getKolamComplaintDecisionLabel(null)).toBe('Tidak ada');
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
