import { isCatalogTableListRoute } from '../src/domain/kolam-workspace-scroll';

describe('isCatalogTableListRoute', () => {
  it('matches overview root because Beranda owns its page scroll', () => {
    expect(isCatalogTableListRoute('/')).toBe(true);
    expect(isCatalogTableListRoute('')).toBe(true);
  });

  it('matches app downloads because the page owns its detail scroll', () => {
    expect(isCatalogTableListRoute('/app-downloads')).toBe(true);
    expect(isCatalogTableListRoute('/app-downloads?tab=download')).toBe(true);
    expect(isCatalogTableListRoute('/app-downloads/')).toBe(true);
  });

  it('keeps mapped-table catalog roots on shell ScrollView', () => {
    expect(isCatalogTableListRoute('/species')).toBe(false);
    expect(isCatalogTableListRoute('/products')).toBe(false);
    expect(isCatalogTableListRoute('/products/archive')).toBe(false);
    expect(isCatalogTableListRoute('/stock-transaction')).toBe(false);
    expect(isCatalogTableListRoute('/stock-transaction?productId=abc')).toBe(
      false,
    );
    expect(isCatalogTableListRoute('/suppliers')).toBe(false);
    expect(isCatalogTableListRoute('/customers')).toBe(false);
    expect(isCatalogTableListRoute('/list-of-users')).toBe(false);
    expect(isCatalogTableListRoute('/purchase-order')).toBe(false);
    // Mapped-row Produksi uses shell ScrollView (same as supplier/PO) so header height stays compact.
    expect(isCatalogTableListRoute('/production')).toBe(false);
    expect(isCatalogTableListRoute('/product-serials')).toBe(false);
    expect(isCatalogTableListRoute('/sales')).toBe(false);
    expect(isCatalogTableListRoute('/raw-materials')).toBe(false);
    expect(isCatalogTableListRoute('/stock-opname')).toBe(false);
  });

  it('keeps mapped-table Keuangan roots on shell ScrollView', () => {
    expect(isCatalogTableListRoute('/finance')).toBe(false);
    expect(isCatalogTableListRoute('/finance/abc123')).toBe(false);
    // Dompet uses shell ScrollView (card grid + mapped TX); owned FlatList scroll would clip.
    expect(isCatalogTableListRoute('/wallet')).toBe(false);
    expect(isCatalogTableListRoute('/payable')).toBe(false);
    expect(isCatalogTableListRoute('/receivable')).toBe(false);
    // Mapped-row expense/income lists use shell ScrollView (same as /finance).
    expect(isCatalogTableListRoute('/routine-expenses')).toBe(false);
    expect(isCatalogTableListRoute('/unexpected-expense')).toBe(false);
    expect(isCatalogTableListRoute('/unexpected-income')).toBe(false);
    expect(isCatalogTableListRoute('/asset-purchase')).toBe(false);
    expect(isCatalogTableListRoute('/commissions')).toBe(false);
    expect(isCatalogTableListRoute('/finance/payroll')).toBe(false);
    expect(isCatalogTableListRoute('/finance/bonus')).toBe(false);
    expect(isCatalogTableListRoute('/cashflow-session')).toBe(true);
    expect(isCatalogTableListRoute('/cashflow-session/')).toBe(true);
    expect(isCatalogTableListRoute('/finance/tax')).toBe(false);
    expect(isCatalogTableListRoute('/finance/settings/tax-profile')).toBe(false);
    expect(isCatalogTableListRoute('/finance/payroll/2026-08')).toBe(false);
    expect(isCatalogTableListRoute('/wallet/w1')).toBe(false);
    expect(isCatalogTableListRoute('/payable/p1')).toBe(false);
    expect(isCatalogTableListRoute('/media')).toBe(false);
  });

  it('keeps detail and edit routes on shell ScrollView', () => {
    expect(isCatalogTableListRoute('/species/betta-splendens')).toBe(false);
    expect(isCatalogTableListRoute('/species/baru')).toBe(false);
    expect(isCatalogTableListRoute('/products/filter-canister')).toBe(false);
    expect(isCatalogTableListRoute('/products/filter-canister/edit')).toBe(
      false,
    );
    expect(isCatalogTableListRoute('/raw-materials/create')).toBe(false);
    expect(isCatalogTableListRoute('/stock-transaction/tx-1')).toBe(false);
    expect(isCatalogTableListRoute('/purchase-order/create')).toBe(false);
    expect(isCatalogTableListRoute('/purchase-order/po-1')).toBe(false);
    expect(isCatalogTableListRoute('/production/create')).toBe(false);
    expect(isCatalogTableListRoute('/production/prod-1')).toBe(false);
    expect(isCatalogTableListRoute('/cashflow-session/create')).toBe(false);
    expect(isCatalogTableListRoute('/cashflow-session/session-1')).toBe(false);
    expect(isCatalogTableListRoute('/pengaturan')).toBe(false);
    // Mapped-row catalogs (Packing/Teranura) use shell ScrollView — not owned FlatList viewport.
    expect(isCatalogTableListRoute('/teranura')).toBe(false);
    expect(isCatalogTableListRoute('/packing-materials')).toBe(false);
  });
});
