import {
  getDashboardCustomerVisitConfirmations,
  getDashboardCustomerVisitConfirmationsDescriptor,
  getDashboardCustomerVisitConfirmationsVisualContract,
} from '../src/domain/dashboard-customer-visit-confirmations';
import {seedUnifiedDataset} from '../src/services/unified-data';

describe('getDashboardCustomerVisitConfirmations', () => {
  it('maps live FE pending customer verification rows into Beranda visit confirmations', () => {
    const rows = getDashboardCustomerVisitConfirmations(seedUnifiedDataset);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual(
      expect.objectContaining({
        id: 'maintenance-visit-1-execution-visit-1',
        title: 'Kunjungan layanan',
        actionLabel: 'Konfirmasi',
        actionAccessibilityLabel:
          'Konfirmasi - /layanan/voucher/pending-service-aquarium-care/execution/execution-visit-1',
        route:
          '/layanan/voucher/pending-service-aquarium-care/execution/execution-visit-1',
      }),
    );
    expect(rows[0].description).toContain('SUB-2026-0001 · Jadwal');
  });

  it('tracks the live CustomerVisitConfirmations visual contract', () => {
    expect(getDashboardCustomerVisitConfirmationsDescriptor()).toEqual({
      title: 'Konfirmasi kunjungan layanan',
      description:
        'Kunjungan yang sudah diverifikasi tim — menunggu persetujuan Anda.',
      sourcePartial:
        'E:\\Projects\\_latest-da\\da-inventory-frontend\\src\\app\\(app)\\(dashboard)\\(partials)\\customer-visit-confirmations.tsx',
      emptyBehavior: 'hidden',
    });

    expect(getDashboardCustomerVisitConfirmationsVisualContract()).toEqual({
      sourcePartial:
        'E:\\Projects\\_latest-da\\da-inventory-frontend\\src\\app\\(app)\\(dashboard)\\(partials)\\customer-visit-confirmations.tsx',
      card: {
        background: 'bg',
        borderWidth: 1,
        paddingY: 16,
        radius: 8,
        shadow: 'xs',
        sourcePrimitive: 'Card [--card-spacing:--spacing(4)]',
        spacing: 16,
      },
      header: {
        descriptionGapY: 4,
        descriptionFontSize: 14,
        paddingX: 16,
        titleFontSize: 16,
        titleFontWeight: 'semibold',
      },
      list: {
        borderTopWidth: 0,
        gapY: 8,
        paddingX: 16,
        paddingY: 0,
      },
      row: {
        actionColor: 'primary',
        actionUnderline: true,
        borderWidth: 1,
        descriptionGapY: 3,
        descriptionFontSize: 12,
        flexWrap: true,
        gapX: 8,
        paddingX: 12,
        paddingY: 8,
        radius: 6,
        titleFontSize: 14,
        titleFontWeight: 'medium',
      },
    });
  });

  it('returns defensive copies of the visit confirmation visual contract', () => {
    const first = getDashboardCustomerVisitConfirmationsVisualContract();

    first.card.spacing = 99;
    first.header.titleFontSize = 99;
    first.list.gapY = 99;
    first.row.descriptionGapY = 99;

    const next = getDashboardCustomerVisitConfirmationsVisualContract();

    expect(next.card.spacing).toBe(16);
    expect(next.header.titleFontSize).toBe(16);
    expect(next.list.gapY).toBe(8);
    expect(next.row.descriptionGapY).toBe(3);
  });

  it('uses the live FE punctuation for missing visit schedules', () => {
    const rows = getDashboardCustomerVisitConfirmations({
      ...seedUnifiedDataset,
      kolam: {
        ...seedUnifiedDataset.kolam,
        pendingCustomerVerifications: [
          {
            ...seedUnifiedDataset.kolam.pendingCustomerVerifications[0],
            scheduledTime: null,
            serviceSerial: 'SVC-EMPTY',
            subscriptionNumber: null,
          },
        ],
      },
    });

    expect(rows[0].description).toBe('SVC-EMPTY · Jadwal —');
  });
});
