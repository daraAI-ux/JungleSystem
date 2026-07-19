import {
  applyDiscount,
  buildSaleDraftPayload,
  clearCart,
  getCartSubtotal,
  normalizeDiscountAmount,
  parseNonNegativeNumber,
  updateCartLineDiscount,
} from '../src/lib/checkout';
import {catalogItems, initialCheckoutState} from '../src/data/seed';

test('builds mixed product and species sale payload', () => {
  const payload = buildSaleDraftPayload(initialCheckoutState, catalogItems);

  expect(payload.channel).toBe('pos');
  expect(payload.sourceRef).toBeUndefined();
  expect(payload.customer).toBe(initialCheckoutState.customerId);
  expect(payload.paymentMethod).toBe(initialCheckoutState.paymentMethodId);
  expect(payload.items).toEqual([
    expect.objectContaining({
      itemType: 'product',
      product: 'product-filter-sponge',
      quantity: 1,
    }),
    expect.objectContaining({
      itemType: 'species',
      species: 'species-anemone',
      quantity: 1,
    }),
  ]);
});

test('calculates checkout subtotal from catalog prices', () => {
  expect(getCartSubtotal(initialCheckoutState.cart, catalogItems)).toBe(370000);
});

test('clears checkout cart without resetting customer or payment choices', () => {
  const clearedCheckout = clearCart(initialCheckoutState);

  expect(clearedCheckout.cart).toEqual([]);
  expect(clearedCheckout.customerId).toBe(initialCheckoutState.customerId);
  expect(clearedCheckout.paymentMethodId).toBe(
    initialCheckoutState.paymentMethodId,
  );
});

test('parses cashier numeric input safely', () => {
  expect(parseNonNegativeNumber('15.5')).toBe(15.5);
  expect(parseNonNegativeNumber('Rp 12.000')).toBe(12000);
  expect(parseNonNegativeNumber('12.500,75')).toBe(12500.75);
  expect(parseNonNegativeNumber('abc')).toBe(0);
});

test('applies fixed and percentage discounts', () => {
  expect(applyDiscount(100000, 'fixed', 25000)).toBe(75000);
  expect(applyDiscount(100000, 'percentage', 10)).toBe(90000);
  expect(applyDiscount(100000, 'fixed', 150000)).toBe(0);
});

test('updates cart line discount and clamps percentage amount', () => {
  const updatedCheckout = updateCartLineDiscount(
    initialCheckoutState,
    'product-filter-sponge',
    {
      discountType: 'percentage',
      discountAmount: 150,
    },
  );

  expect(updatedCheckout.cart[0]).toEqual(
    expect.objectContaining({
      discountType: 'percentage',
      discountAmount: 100,
    }),
  );
  expect(updatedCheckout.cart[1]).toBe(initialCheckoutState.cart[1]);
});

test('normalizes discount amounts for backend validation', () => {
  expect(normalizeDiscountAmount('percentage', 150)).toBe(100);
  expect(normalizeDiscountAmount('percentage', -10)).toBe(0);
  expect(normalizeDiscountAmount('fixed', 150000)).toBe(150000);
});
