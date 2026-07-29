import {
  canCancelFinanceStockTransaction,
  canVerifyStockTransaction,
  crossSyncSummaryLabel,
  getKolamStockTransactionRouteId,
  hasStockTransactionCrossSyncAudit,
  isKolamStockTransactionDetailRoute,
  normalizeKolamStockTransaction,
  parseStockTxMarketplaceSyncNote,
  resolveStockTxCrossSyncDisplay,
} from '../src/domain/kolam-stock-transaction';

describe('Kolam stock transaction detail domain', () => {
  it('parses detail route ids and ignores opname/list', () => {
    expect(getKolamStockTransactionRouteId('/stock-transaction/tx-abc')).toBe(
      'tx-abc',
    );
    expect(
      isKolamStockTransactionDetailRoute('/stock-transaction/tx-abc'),
    ).toBe(true);
    expect(getKolamStockTransactionRouteId('/stock-transaction')).toBe(null);
    expect(getKolamStockTransactionRouteId('/stock-transaction/opname')).toBe(
      null,
    );
  });

  it('normalizes detail payload with photos, wallet, and cross-sync targets', () => {
    const tx = normalizeKolamStockTransaction({
      data: {
        _id: 'tx-detail-1',
        type: 'adjust',
        source: 'stock-opname',
        quantity: 1,
        before: 5,
        after: 4,
        status: 'unverified',
        reason: 'Hitung ulang',
        photos: ['uploads/a.jpg', 'uploads/b.jpg'],
        productId: { _id: 'p1', name: 'Produk', sku: 'SKU-1' },
        walletTransaction: {
          _id: 'w1',
          amount: 15000,
          confirmStatus: 'unconfirmed',
          wallet: { _id: 'wallet-1', name: 'Kas utama' },
        },
        marketplaceCrossSync: {
          summary: 'partial',
          originPlatform: 'shopee',
          sku: 'SKU-1',
          targetStock: 4,
          targets: [
            {
              platform: 'tokopedia',
              status: 'pending',
              taskId: 'task-1',
            },
          ],
        },
        createdBy: { _id: 'u1', name: 'Staff A' },
        createdAt: '2026-07-01T10:00:00.000Z',
      },
    });

    expect(tx.id).toBe('tx-detail-1');
    expect(tx.photos).toEqual(['uploads/a.jpg', 'uploads/b.jpg']);
    expect(tx.walletTransaction).toMatchObject({
      id: 'w1',
      walletName: 'Kas utama',
      amount: 15000,
      confirmStatus: 'unconfirmed',
    });
    expect(tx.crossSync).toMatchObject({
      summary: 'partial',
      targetStock: 4,
      targets: [{ platform: 'tokopedia', status: 'pending', taskId: 'task-1' }],
    });
    expect(hasStockTransactionCrossSyncAudit(tx.crossSync)).toBe(true);
    expect(crossSyncSummaryLabel(tx.crossSync?.summary)).toBe('Sync sebagian');
    expect(canVerifyStockTransaction(tx)).toBe(true);
    expect(canCancelFinanceStockTransaction(tx)).toBe(true);
    expect(tx.target?.href).toBe('/products/p1');

    const display = resolveStockTxCrossSyncDisplay(tx.crossSync, tx.reason);
    expect(display?.usedFallbackPlatforms).toBe(false);
    expect(display?.targets).toEqual([
      expect.objectContaining({
        platform: 'tokopedia',
        statusLabel: 'Menunggu AM',
        fromFallback: false,
      }),
    ]);
  });

  it('falls back to reason sync note and expected platforms when audit targets empty', () => {
    const tx = normalizeKolamStockTransaction({
      _id: 'tx-sync-empty',
      source: 'stock-opname',
      reason:
        'Opname rak A | Sync ke semua platform: sukses (SKU-A) | lain-lain',
      marketplaceCrossSync: {
        summary: 'unknown',
        targets: [],
      },
    });

    expect(parseStockTxMarketplaceSyncNote(tx.reason)).toBe('sukses (SKU-A)');
    expect(hasStockTransactionCrossSyncAudit(tx.crossSync, tx.reason)).toBe(
      true,
    );
    expect(hasStockTransactionCrossSyncAudit(tx.crossSync)).toBe(false);

    const display = resolveStockTxCrossSyncDisplay(tx.crossSync, tx.reason);
    expect(display).toMatchObject({
      summaryLabel: 'Sync OK',
      syncNote: 'sukses (SKU-A)',
      usedFallbackPlatforms: true,
    });
    expect(display?.targets).toEqual([
      expect.objectContaining({
        platform: 'tokopedia',
        statusLabel: 'Berhasil',
        fromFallback: true,
      }),
      expect.objectContaining({
        platform: 'shopee',
        statusLabel: 'Berhasil',
        fromFallback: true,
      }),
    ]);
  });

  it('hides empty unknown audit without sync note', () => {
    const tx = normalizeKolamStockTransaction({
      _id: 'tx-empty',
      source: 'stock-opname',
      reason: 'Tanpa sync',
      marketplaceCrossSync: {
        summary: 'unknown',
        targets: [],
      },
    });
    expect(hasStockTransactionCrossSyncAudit(tx.crossSync, tx.reason)).toBe(
      false,
    );
    expect(resolveStockTxCrossSyncDisplay(tx.crossSync, tx.reason)).toBeNull();
  });

  it('parses partial sync note per platform', () => {
    const display = resolveStockTxCrossSyncDisplay(
      {
        summary: 'unknown',
        originPlatform: '',
        sku: '',
        targetStock: null,
        targets: [],
      },
      'Sync ke semua platform: sebagian — ok: tokopedia; gagal: shopee (timeout)',
    );
    expect(display?.summaryLabel).toBe('Sync sebagian');
    expect(display?.targets).toEqual([
      expect.objectContaining({
        platform: 'tokopedia',
        statusLabel: 'Berhasil',
      }),
      expect.objectContaining({
        platform: 'shopee',
        statusLabel: 'Gagal',
      }),
    ]);
  });

  it('hides verify/cancel when already verified or finance cancelled', () => {
    const verified = normalizeKolamStockTransaction({
      _id: 'tx-2',
      source: 'stock-opname',
      status: 'verified',
      walletTransaction: {
        _id: 'w2',
        amount: 1,
        confirmStatus: 'unconfirmed',
        wallet: { name: 'Kas' },
      },
    });
    expect(canVerifyStockTransaction(verified)).toBe(false);

    const cancelled = normalizeKolamStockTransaction({
      _id: 'tx-3',
      source: 'stock-opname',
      status: 'unverified',
      financeCancelledAt: '2026-07-02T00:00:00.000Z',
      walletTransaction: {
        _id: 'w3',
        amount: 1,
        confirmStatus: 'unconfirmed',
        wallet: { name: 'Kas' },
      },
    });
    expect(canCancelFinanceStockTransaction(cancelled)).toBe(false);
  });
});
