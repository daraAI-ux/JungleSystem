import type {CartLine, CatalogItem, CheckoutState, DiscountType} from '../domain/pos';
import type {CreateSaleDraftBody} from '../services/pos-api';

export function applyDiscount(
  value: number,
  discountType: DiscountType,
  discountAmount: number,
): number {
  if (discountAmount <= 0) {
    return value;
  }

  if (discountType === 'percentage') {
    return Math.max(0, value - value * (discountAmount / 100));
  }

  return Math.max(0, value - discountAmount);
}

export function getCartLineSubtotal(
  line: CartLine,
  item: CatalogItem | undefined,
): number {
  if (!item) {
    return 0;
  }

  const gross = item.price * line.quantity;
  return applyDiscount(gross, line.discountType, line.discountAmount);
}

export function getCartSubtotal(
  cart: CartLine[],
  catalog: CatalogItem[],
): number {
  return cart.reduce((sum, line) => {
    const item = catalog.find(catalogItem => catalogItem.id === line.itemId);
    return sum + getCartLineSubtotal(line, item);
  }, 0);
}

export function clearCart(checkout: CheckoutState): CheckoutState {
  return {
    ...checkout,
    cart: [],
  };
}

export function updateCartLineDiscount(
  checkout: CheckoutState,
  itemId: string,
  discount: Partial<Pick<CartLine, 'discountType' | 'discountAmount'>>,
): CheckoutState {
  return {
    ...checkout,
    cart: checkout.cart.map(line => {
      if (line.itemId !== itemId) {
        return line;
      }

      const discountType = discount.discountType ?? line.discountType;
      const discountAmount = normalizeDiscountAmount(
        discountType,
        discount.discountAmount ?? line.discountAmount,
      );

      return {
        ...line,
        discountType,
        discountAmount,
      };
    }),
  };
}

export function parseNonNegativeNumber(value: string): number {
  const compact = value.replace(/[^0-9.,]/g, '');
  const normalized = normalizeNumberText(compact);
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}

export function normalizeDiscountAmount(
  discountType: DiscountType,
  discountAmount: number,
): number {
  const safeAmount = Math.max(0, discountAmount);

  if (discountType === 'percentage') {
    return Math.min(100, safeAmount);
  }

  return safeAmount;
}

function normalizeNumberText(value: string): string {
  if (value.includes(',')) {
    return value.replace(/\./g, '').replace(',', '.');
  }

  const dotParts = value.split('.');
  if (dotParts.length > 1 && dotParts.slice(1).every(part => part.length === 3)) {
    return dotParts.join('');
  }

  return value;
}

export function buildSaleDraftPayload(
  checkout: CheckoutState,
  catalog: CatalogItem[],
): CreateSaleDraftBody {
  const items: CreateSaleDraftBody['items'] = [];

  checkout.cart.forEach(line => {
    const item = catalog.find(catalogItem => catalogItem.id === line.itemId);
    if (!item) {
      return;
    }

    items.push({
      itemType: item.type,
      product: item.type === 'product' ? item.id : undefined,
      species: item.type === 'species' ? item.id : undefined,
      quantity: line.quantity,
      discount: {
        type: line.discountType,
        amount: line.discountAmount,
      },
    });
  });

  return {
    customer: checkout.customerId,
    paymentMethod: checkout.paymentMethodId,
    channel: 'pos',
    shippingCost: checkout.shippingCost,
    discount: checkout.globalDiscount,
    discountType: checkout.globalDiscountType,
    items,
  };
}
