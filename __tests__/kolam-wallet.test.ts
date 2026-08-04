import {
  buildKolamWalletSummaryStats,
  countKolamWalletTxByType,
  formatKolamWalletTxSourceLabel,
  formatKolamWalletTypeLabel,
  getKolamWalletRouteId,
  getKolamWalletSurfaceMode,
  isKolamWalletRoute,
  normalizeKolamWallet,
  normalizeKolamWalletList,
  normalizeKolamWalletTransaction,
  normalizeKolamWalletTransactionList,
} from '../src/domain/kolam-wallet';

describe('kolam wallet domain', () => {
  it('detects wallet routes and surface mode', () => {
    expect(isKolamWalletRoute('/wallet')).toBe(true);
    expect(isKolamWalletRoute('/wallet/w1')).toBe(true);
    expect(isKolamWalletRoute('/wallet/create')).toBe(true);
    expect(isKolamWalletRoute('/wallet/w1/edit')).toBe(true);
    expect(isKolamWalletRoute('/finance')).toBe(false);
    expect(getKolamWalletRouteId('/wallet')).toBe(null);
    expect(getKolamWalletRouteId('/wallet/create')).toBe(null);
    expect(getKolamWalletRouteId('/wallet/w1')).toBe('w1');
    expect(getKolamWalletRouteId('/wallet/w1/edit')).toBe('w1');
    expect(getKolamWalletSurfaceMode('/wallet')).toBe('list');
    expect(getKolamWalletSurfaceMode('/wallet/create')).toBe('create');
    expect(getKolamWalletSurfaceMode('/wallet/w1')).toBe('detail');
    expect(getKolamWalletSurfaceMode('/wallet/w1/edit')).toBe('edit');
  });

  it('formats wallet labels', () => {
    expect(formatKolamWalletTypeLabel('main')).toBe('Dompet Utama');
    expect(formatKolamWalletTxSourceLabel('deposit')).toBe('Drop Dana');
    expect(formatKolamWalletTxSourceLabel('unknown_source')).toBe(
      'unknown source',
    );
  });

  it('normalizes wallet payload', () => {
    const wallet = normalizeKolamWallet({
      _id: 'w1',
      name: 'Kas',
      type: 'cash',
      initialBalance: 100,
      currentBalance: 250,
      note: 'Utama',
    });
    expect(wallet.id).toBe('w1');
    expect(wallet.name).toBe('Kas');
    expect(wallet.type).toBe('cash');
    expect(wallet.currentBalance).toBe(250);
  });

  it('normalizes wallet list with pagination', () => {
    const result = normalizeKolamWalletList({
      data: [
        {
          _id: 'w1',
          name: 'Kas',
          type: 'main',
          initialBalance: 0,
          currentBalance: 1000,
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });
    expect(result.items).toHaveLength(1);
    expect(result.pagination.total).toBe(1);
    expect(result.items[0]?.name).toBe('Kas');
  });

  it('normalizes wallet transaction with populated wallet', () => {
    const tx = normalizeKolamWalletTransaction({
      _id: 'tx1',
      wallet: { _id: 'w1', name: 'Kas' },
      type: 'credit',
      source: 'deposit',
      amount: 5000,
      note: 'Setoran',
      confirmStatus: 'confirmed',
      createdAt: '2026-08-01T00:00:00.000Z',
    });
    expect(tx.id).toBe('tx1');
    expect(tx.walletId).toBe('w1');
    expect(tx.walletName).toBe('Kas');
    expect(tx.amount).toBe(5000);
    expect(tx.confirmStatus).toBe('confirmed');
  });

  it('normalizes wallet transaction list', () => {
    const result = normalizeKolamWalletTransactionList({
      data: [
        {
          _id: 'tx1',
          wallet: 'w1',
          type: 'debit',
          source: 'withdraw',
          amount: 100,
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, pages: 1 },
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.type).toBe('debit');
    expect(result.pagination.totalPages).toBe(1);
  });

  it('builds wallet summary stats from all wallets', () => {
    const stats = buildKolamWalletSummaryStats([
      {
        id: '1',
        name: 'Utama',
        type: 'main',
        initialBalance: 0,
        currentBalance: 1000,
        note: '',
        provider: '',
        requireDepositProof: false,
        accountNumber: '',
        accountName: '',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '2',
        name: 'Virtual',
        type: 'virtual',
        initialBalance: 0,
        currentBalance: -50,
        note: '',
        provider: '',
        requireDepositProof: false,
        accountNumber: '',
        accountName: '',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '3',
        name: 'Tunai',
        type: 'cash',
        initialBalance: 0,
        currentBalance: 200,
        note: '',
        provider: '',
        requireDepositProof: false,
        accountNumber: '',
        accountName: '',
        createdAt: '',
        updatedAt: '',
      },
    ]);
    expect(stats.totalBalance).toBe(1150);
    expect(stats.positiveBalance).toBe(1200);
    expect(stats.negativeBalance).toBe(-50);
    expect(stats.walletCount).toBe(3);
    expect(stats.virtualCount).toBe(1);
    expect(stats.cashCount).toBe(1);
    expect(stats.mainWallet?.name).toBe('Utama');
    expect(countKolamWalletTxByType([
      {
        id: 'a',
        walletId: '1',
        walletName: 'Utama',
        type: 'credit',
        source: 'deposit',
        amount: 1,
        note: '',
        confirmStatus: 'confirmed',
        confirmedAt: '',
        confirmNote: '',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 'b',
        walletId: '1',
        walletName: 'Utama',
        type: 'debit',
        source: 'withdraw',
        amount: 1,
        note: '',
        confirmStatus: 'unconfirmed',
        confirmedAt: '',
        confirmNote: '',
        createdAt: '',
        updatedAt: '',
      },
    ])).toEqual({ credit: 1, debit: 1 });
    expect(formatKolamWalletTxSourceLabel('sale_revenue')).toBe(
      'Pendapatan penjualan',
    );
  });
});
