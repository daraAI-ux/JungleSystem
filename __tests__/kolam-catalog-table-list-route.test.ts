import { isCatalogTableListRoute } from '../src/components/kolam-app-shell-surface';

describe('isCatalogTableListRoute', () => {
  it('matches species/product/raw list roots only', () => {
    expect(isCatalogTableListRoute('/species')).toBe(true);
    expect(isCatalogTableListRoute('/products')).toBe(true);
    expect(isCatalogTableListRoute('/products/archive')).toBe(true);
    expect(isCatalogTableListRoute('/stock-transaction')).toBe(true);
    expect(isCatalogTableListRoute('/stock-transaction?productId=abc')).toBe(
      true,
    );
    expect(isCatalogTableListRoute('/suppliers')).toBe(false);
    expect(isCatalogTableListRoute('/customers')).toBe(true);
    expect(isCatalogTableListRoute('/purchase-order')).toBe(false);
    // Mapped-row Produksi uses shell ScrollView (same as supplier/PO) so header height stays compact.
    expect(isCatalogTableListRoute('/production')).toBe(false);
    expect(isCatalogTableListRoute('/product-serials')).toBe(false);
    expect(isCatalogTableListRoute('/sales')).toBe(false);
    expect(isCatalogTableListRoute('/raw-materials')).toBe(false);
    expect(isCatalogTableListRoute('/stock-opname')).toBe(false);
  });

  it('matches Keuangan FlatList list roots', () => {
    expect(isCatalogTableListRoute('/finance')).toBe(false);
    expect(isCatalogTableListRoute('/finance/abc123')).toBe(false);
    expect(isCatalogTableListRoute('/wallet')).toBe(true);
    expect(isCatalogTableListRoute('/payable')).toBe(true);
    expect(isCatalogTableListRoute('/receivable')).toBe(true);
    expect(isCatalogTableListRoute('/routine-expenses')).toBe(true);
    expect(isCatalogTableListRoute('/unexpected-expense')).toBe(true);
    expect(isCatalogTableListRoute('/unexpected-income')).toBe(true);
    expect(isCatalogTableListRoute('/asset-purchase')).toBe(true);
    expect(isCatalogTableListRoute('/commissions')).toBe(true);
    expect(isCatalogTableListRoute('/finance/payroll')).toBe(true);
    expect(isCatalogTableListRoute('/finance/bonus')).toBe(true);
    expect(isCatalogTableListRoute('/cashflow-session')).toBe(true);
    expect(isCatalogTableListRoute('/finance/tax')).toBe(false);
    expect(isCatalogTableListRoute('/finance/settings/tax-profile')).toBe(false);
    expect(isCatalogTableListRoute('/finance/payroll/2026-08')).toBe(false);
    expect(isCatalogTableListRoute('/wallet/w1')).toBe(false);
    expect(isCatalogTableListRoute('/payable/p1')).toBe(false);
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
    expect(isCatalogTableListRoute('/pengaturan')).toBe(false);
    // Mapped-row catalogs (Packing/Teranura) use shell ScrollView — not owned FlatList viewport.
    expect(isCatalogTableListRoute('/teranura')).toBe(false);
    expect(isCatalogTableListRoute('/packing-materials')).toBe(false);
  });
});
