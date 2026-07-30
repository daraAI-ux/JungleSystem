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
    expect(isCatalogTableListRoute('/production')).toBe(false);
    expect(isCatalogTableListRoute('/product-serials')).toBe(false);
    expect(isCatalogTableListRoute('/sales')).toBe(false);
    expect(isCatalogTableListRoute('/raw-materials')).toBe(false);
    expect(isCatalogTableListRoute('/stock-opname')).toBe(false);
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
    expect(isCatalogTableListRoute('/pengaturan')).toBe(false);
    // Mapped-row catalogs (Packing/Teranura) use shell ScrollView — not owned FlatList viewport.
    expect(isCatalogTableListRoute('/teranura')).toBe(false);
    expect(isCatalogTableListRoute('/packing-materials')).toBe(false);
  });
});
