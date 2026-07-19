import {
  getDashboardPendingOrders,
  getDashboardPendingOrdersDescriptor,
  getDashboardPendingOrdersVisualContract,
} from '../src/domain/dashboard-pending-orders';
import {formatRupiah} from '../src/lib/money';
import {seedUnifiedDataset} from '../src/services/unified-data';

describe('getDashboardPendingOrders', () => {
  it('keeps the live Kolam pending orders panel descriptor', () => {
    expect(getDashboardPendingOrdersDescriptor()).toEqual({
      title: 'Pesanan perlu ditindak lanjuti',
      description:
        'Penjualan umum (belum lunas / belum kirim) dan proyek kustom aktif',
      actionLabel: 'Lihat semua',
      actionRoute: '/sales?needsAction=1',
      actionIconKind: 'chevron',
      iconKind: 'clock',
    });
  });

  it('tracks the live PendingOrders visual contract', () => {
    const contract = getDashboardPendingOrdersVisualContract();

    expect(contract.sourcePartial).toBe(
      'E:\\Projects\\_latest-da\\da-inventory-frontend\\src\\app\\(app)\\(dashboard)\\(partials)\\pending-orders.tsx',
    );
    expect(contract.card).toEqual({padding: 0, radius: 22});
    expect(contract.header).toEqual({
      borderBottom: true,
      minHeight: 42,
      paddingX: 16,
      paddingY: 16,
      gapY: 4,
      titleRowMinHeight: 20,
      titleRowGapX: 8,
      actionGapX: 4,
      iconSize: 16,
      titleFontSize: 14,
      descriptionFontSize: 12,
      actionColor: 'primary',
      actionFontSize: 14,
    });
    expect(contract.clockIcon).toEqual({
      borderWidth: 2,
      handRadius: 999,
      hourHandWidth: 2,
      hourHandHeight: 5,
      hourHandTranslateY: -2,
      minuteHandWidth: 6,
      minuteHandHeight: 2,
      minuteHandTranslateX: 2,
    });
    expect(contract.content).toEqual({
      gridGap: 0,
      paddingX: 0,
      paddingBottom: 0,
      sectionHeaderBackground: 'mutedSoft',
      sectionHeaderPaddingX: 20,
      sectionHeaderPaddingY: 8,
      sectionTitleFontSize: 11,
      rowPaddingX: 20,
      rowPaddingY: 14,
      rowGapX: 12,
      rowGapY: 8,
      cappedPaddingY: 12,
      cappedFontSize: 11,
      emptyPaddingY: 28,
      emptyFontSize: 12,
    });
    expect(contract.row).toEqual({
      invoiceMinWidth: 112,
      invoiceFontSize: 13,
      metaGapY: 3,
      metaFontSize: 12,
      totalFontSize: 12,
      badgeFontSize: 10,
      metaRowGapX: 5,
      countFontSize: 11,
      badgesGapX: 4,
      badgesGapY: 4,
      statusGroupMarginLeft: 'auto',
    });
    expect(contract.range).toEqual({
      minWidth: 150,
      labelFontSize: 12,
      valueFontSize: 20,
      badgeFontSize: 10,
      gapY: 4,
    });
  });

  it('returns defensive copies of the pending orders visual contract', () => {
    const first = getDashboardPendingOrdersVisualContract();

    first.header.minHeight = 99;
    first.card.radius = 99;
    first.header.actionColor = 'primary';
    first.clockIcon.borderWidth = 99;
    first.content.emptyPaddingY = 99;
    first.content.sectionHeaderBackground = 'mutedSoft';
    first.row.metaGapY = 99;
    first.row.badgesGapY = 99;
    first.row.statusGroupMarginLeft = 'auto';
    first.range.minWidth = 99;

    const next = getDashboardPendingOrdersVisualContract();

    expect(next.header.minHeight).toBe(42);
    expect(next.card.radius).toBe(22);
    expect(next.clockIcon.borderWidth).toBe(2);
    expect(next.content.emptyPaddingY).toBe(28);
    expect(next.content.sectionHeaderBackground).toBe('mutedSoft');
    expect(next.row.metaGapY).toBe(3);
    expect(next.row.badgesGapY).toBe(4);
    expect(next.row.statusGroupMarginLeft).toBe('auto');
    expect(next.range.minWidth).toBe(150);
  });

  it('builds the live action-required grouped list from server dashboard data', () => {
    const panel = getDashboardPendingOrders({
      ...seedUnifiedDataset,
      kolam: {
        ...seedUnifiedDataset.kolam,
        dashboardActionRequired: {
          total: 2,
          capped: true,
          counts: {standard: 1, custom: 1},
          items: [
            {
              id: 'sale-standard-1',
              kind: 'standard',
              invoiceCode: 'INV-001',
              status: 'pending',
              deliveryStatus: 'none',
              finalTotal: 123_000,
              createdAt: '2026-07-11T11:08:00+07:00',
              sourceName: 'Website',
              reasons: ['belum_bayar'],
            },
            {
              id: 'sale-custom-1',
              kind: 'custom',
              invoiceCode: 'CP-001',
              status: 'pending',
              deliveryStatus: 'none',
              finalTotal: 5_000_000,
              createdAt: '2026-07-10T09:00:00+07:00',
              sourceName: 'Backoffice',
              reasons: ['proyek_kustom', 'cp_dp'],
              customProject: {
                lifecycleStatus: 'dp',
                lifecycleLabel: 'Menunggu DP',
              },
            },
          ],
        },
      },
    });

    expect(panel.source).toBe('live');
    expect(panel.total).toBe(2);
    expect(panel.customTotal).toBe(1);
    expect(panel.description).toBe(
      'Penjualan umum (belum lunas / belum kirim) dan proyek kustom aktif (2 pesanan, 1 kustom)',
    );
    expect(panel.sections.map(section => section.title)).toEqual([
      'Penjualan umum',
      'Proyek kustom',
    ]);
    expect(panel.sections[0].items[0]).toEqual(
      expect.objectContaining({
        invoiceCode: 'INV-001',
        sourceName: 'Website',
        totalLabel: 'Rp 123.0Rb',
        reasonLabels: ['Belum bayar'],
        statusLabel: 'Menunggu persetujuan finance',
        deliveryLabel: 'Belum dikirim',
      }),
    );
    expect(panel.sections[1].items[0]).toEqual(
      expect.objectContaining({
        invoiceCode: 'CP-001',
        totalLabel: 'Rp 5.0Jt',
        lifecycleLabel: 'Menunggu DP',
        reasonLabels: ['Kustom', 'DP'],
      }),
    );
    expect(panel.cappedLabel).toContain('Menampilkan 2 dari 2 pesanan');
  });

  it('keeps an empty live action-required response from falling back to POS seed sales', () => {
    const panel = getDashboardPendingOrders({
      ...seedUnifiedDataset,
      kolam: {
        ...seedUnifiedDataset.kolam,
        dashboardActionRequired: {
          total: 0,
          capped: false,
          counts: {standard: 0, custom: 0},
          items: [],
        },
      },
    });

    expect(panel.source).toBe('live');
    expect(panel.total).toBe(0);
    expect(panel.sections).toEqual([]);
    expect(panel.description).toBe(
      'Penjualan umum (belum lunas / belum kirim) dan proyek kustom aktif (0 pesanan)',
    );
    expect(panel.emptyLabel).toBe(
      'Tidak ada pesanan yang perlu ditindak lanjuti.',
    );
  });

  it('falls back to POS pending sales when live action-required rows are unavailable', () => {
    const panel = getDashboardPendingOrders(seedUnifiedDataset);

    expect(panel.source).toBe('fallback');
    expect(panel.sections.map(section => section.id)).toEqual(['standard']);
    expect(panel.sections[0].items[0]).toEqual(
      expect.objectContaining({
        invoiceCode: 'POS-20260711-002',
        totalLabel: 'Rp 123.0Rb',
        reasonLabels: ['Belum bayar'],
        statusLabel: 'Menunggu persetujuan finance',
      }),
    );
    expect(panel.ranges.map(range => range.id)).toEqual([
      'today',
      'month',
      'year',
      'all',
    ]);
    expect(panel.ranges[0].value).toBe(formatRupiah(123_000));
    expect(panel.ranges[0].channels.find(channel => channel.id === 'pos')?.count).toBe(1);
  });

  it('returns an empty panel when there are no live or fallback pending sales', () => {
    const panel = getDashboardPendingOrders({
      ...seedUnifiedDataset,
      recentSales: seedUnifiedDataset.recentSales.map(sale => ({
        ...sale,
        status: 'paid',
      })),
    });

    expect(panel.source).toBe('empty');
    expect(panel.sections).toEqual([]);
    expect(panel.emptyLabel).toBe('Tidak ada pesanan yang perlu ditindak lanjuti.');
  });

  it('uses live FE payment and delivery labels for action-required rows', () => {
    const panel = getDashboardPendingOrders({
      ...seedUnifiedDataset,
      kolam: {
        ...seedUnifiedDataset.kolam,
        dashboardActionRequired: {
          total: 3,
          capped: false,
          counts: {standard: 3, custom: 0},
          items: [
            {
              id: 'sale-sent',
              kind: 'standard',
              invoiceCode: 'INV-SENT',
              status: 'sent',
              deliveryStatus: 'waiting_pickup',
              finalTotal: 100_000,
              createdAt: '2026-07-11T11:08:00+07:00',
              sourceName: 'Website',
              reasons: ['belum_kirim'],
            },
            {
              id: 'sale-paid',
              kind: 'standard',
              invoiceCode: 'INV-PAID',
              status: 'paid',
              deliveryStatus: 'none',
              finalTotal: 200_000,
              createdAt: '2026-07-11T11:08:00+07:00',
              sourceName: 'Website',
              reasons: ['belum_kirim'],
            },
            {
              id: 'sale-partial',
              kind: 'standard',
              invoiceCode: 'INV-PARTIAL',
              status: 'partial_paid',
              deliveryStatus: 'success',
              finalTotal: 300_000,
              createdAt: '2026-07-11T11:08:00+07:00',
              sourceName: 'Website',
              reasons: ['belum_bayar'],
            },
          ],
        },
      },
    });

    expect(
      panel.sections[0].items.map(item => [
        item.invoiceCode,
        item.statusLabel,
        item.deliveryLabel,
      ]),
    ).toEqual([
      ['INV-SENT', 'Menunggu bayar', 'Menunggu di jemput kurir'],
      ['INV-PAID', 'Lunas', 'Butuh kirim'],
      ['INV-PARTIAL', 'Bayar sebagian', 'Pengiriman selesai'],
    ]);
  });
});
