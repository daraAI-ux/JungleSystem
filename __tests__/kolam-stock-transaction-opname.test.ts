import {
  createEmptyKolamStockOpnameFormState,
  createKolamStockOpnameTargetFromProduct,
  getStockOpnameDiff,
  getStockOpnameLossAmount,
  stockOpnameNeedsWalletConfirm,
  validateKolamStockOpnameForm,
} from '../src/domain/kolam-stock-transaction';

describe('Kolam stock opname form helpers', () => {
  const target = createKolamStockOpnameTargetFromProduct({
    id: 'p1',
    name: 'Produk A',
    sku: 'SKU-A',
    stock: 10,
    price: 5000,
    hasVariants: false,
    variants: [],
  });

  it('computes stock diff and loss amount for decreases', () => {
    const form = {
      ...createEmptyKolamStockOpnameFormState(),
      targetId: 'p1',
      adjustedStock: '7',
    };

    expect(getStockOpnameDiff(form, target)).toBe(-3);
    expect(getStockOpnameLossAmount(form, target)).toBe(15000);
    expect(stockOpnameNeedsWalletConfirm(form, target)).toBe(true);
  });

  it('skips wallet confirm when stock increases or price is zero', () => {
    const increase = {
      ...createEmptyKolamStockOpnameFormState(),
      targetId: 'p1',
      adjustedStock: '12',
    };
    expect(stockOpnameNeedsWalletConfirm(increase, target)).toBe(false);

    const freeTarget = createKolamStockOpnameTargetFromProduct({
      id: 'p2',
      name: 'Gratis',
      stock: 5,
      price: 0,
      hasVariants: false,
      variants: [],
    });
    const decreaseFree = {
      ...createEmptyKolamStockOpnameFormState(),
      targetId: 'p2',
      adjustedStock: '2',
    };
    expect(stockOpnameNeedsWalletConfirm(decreaseFree, freeTarget)).toBe(false);
  });

  it('requires variant when target has variants', () => {
    const variantTarget = createKolamStockOpnameTargetFromProduct({
      id: 'p3',
      name: 'Produk Varian',
      stock: 1,
      price: 1000,
      hasVariants: true,
      variants: [
        { id: 'v1', label: 'Merah', sku: 'V1', stock: 4, price: 1200 },
      ],
    });
    const form = {
      ...createEmptyKolamStockOpnameFormState(),
      targetId: 'p3',
      adjustedStock: '2',
    };

    expect(validateKolamStockOpnameForm(form, variantTarget)).toBe(
      'Pilih varian terlebih dahulu.',
    );
    expect(
      validateKolamStockOpnameForm(
        { ...form, variantId: 'v1' },
        variantTarget,
      ),
    ).toBeNull();
  });
});
