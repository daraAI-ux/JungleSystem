import {useMemo, useState} from 'react';
import {initialCheckoutState} from '../data/seed';
import type {AccessScope} from '../domain/auth';
import type {CartLine, CatalogItem, CheckoutState} from '../domain/pos';
import type {CatalogFilterType} from '../lib/catalog';
import {filterCatalogItems} from '../lib/catalog';
import {
  clearCart,
  getCartSubtotal,
  normalizeDiscountAmount,
  parseNonNegativeNumber,
  updateCartLineDiscount,
  updateCartLineVoucherCode,
} from '../lib/checkout';
import {
  canCreateSaleDraft,
  getCheckoutWorkflowSteps,
} from '../lib/workflow';
import type {UnifiedDataset} from '../services/unified-data';

export interface KolamCheckoutControllerOptions {
  accessScope: AccessScope;
  dataset: UnifiedDataset;
  signedIn: boolean;
}

export function useKolamCheckoutController({
  accessScope,
  dataset,
  signedIn,
}: KolamCheckoutControllerOptions) {
  const [checkout, setCheckout] = useState<CheckoutState>(initialCheckoutState);
  const [activeType, setActiveType] = useState<CatalogFilterType>('all');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [catalogSearch, setCatalogSearch] = useState('');

  const catalogCategories = useMemo(
    () =>
      Array.from(
        new Set(
          dataset.catalog
            .filter(item => activeType === 'all' || item.type === activeType)
            .map(item => item.category.trim())
            .filter(Boolean),
        ),
      ).sort((left, right) => left.localeCompare(right, 'id-ID')),
    [activeType, dataset.catalog],
  );
  const filteredCatalog = useMemo(
    () =>
      filterCatalogItems(dataset.catalog, {
        category: activeCategory,
        type: activeType,
        search: catalogSearch,
      }),
    [activeCategory, activeType, catalogSearch, dataset.catalog],
  );
  const selectedCustomer = dataset.customers.find(
    customer => customer.id === checkout.customerId,
  );
  const selectedPayment = dataset.paymentMethods.find(
    method => method.id === checkout.paymentMethodId,
  );
  const subtotal = getCartSubtotal(checkout.cart, dataset.catalog);
  // Order-level discount is not sent to BE; totals follow per-line discounts only.
  const afterDiscount = subtotal;
  const finalTotal = afterDiscount + checkout.shippingCost;
  const checkoutReadiness = {
    signedIn,
    hasPosAccess: accessScope.pos,
    hasCashflow: !!dataset.activeSession,
    hasCustomer: !!selectedCustomer,
    hasPaymentMethod: !!selectedPayment,
    cartItemCount: checkout.cart.length,
  };
  const checkoutWorkflowSteps = getCheckoutWorkflowSteps(checkoutReadiness);
  const canCreateDraft = canCreateSaleDraft(checkoutReadiness);

  const reconcileCheckoutWithDataset = (nextDataset: UnifiedDataset) => {
    setCheckout(current => ({
      ...current,
      customerId:
        nextDataset.customers.find(customer => customer.id === current.customerId)
          ?.id ?? nextDataset.customers[0]?.id ?? current.customerId,
      paymentMethodId:
        nextDataset.paymentMethods.find(
          method => method.id === current.paymentMethodId,
        )?.id ??
        nextDataset.paymentMethods[0]?.id ??
        current.paymentMethodId,
      cart: current.cart.filter(line =>
        nextDataset.catalog.some(item => item.id === line.itemId),
      ),
    }));
  };

  const addToCart = (item: CatalogItem) => {
    setCheckout(current => {
      const existing = current.cart.find(line => line.itemId === item.id);
      const initialQuantity = Math.min(
        Math.max(1, item.stock),
        Math.max(1, Math.floor(item.minimumOrderQty ?? 1)),
      );

      if (!existing) {
        return {
          ...current,
          cart: [
            ...current.cart,
            {
              itemId: item.id,
              quantity: initialQuantity,
              discountType: 'fixed',
              discountAmount: 0,
              voucherCode: '',
            },
          ],
        };
      }

      return {
        ...current,
        cart: current.cart.map(line =>
          line.itemId === item.id
            ? {...line, quantity: Math.min(item.stock, line.quantity + 1)}
            : line,
        ),
      };
    });
  };

  const updateQuantity = (itemId: string, nextQuantity: number) => {
    setCheckout(current => ({
      ...current,
      cart: current.cart
        .map(line =>
          line.itemId === itemId
            ? {...line, quantity: Math.max(0, nextQuantity)}
            : line,
        )
        .filter(line => line.quantity > 0),
    }));
  };

  const clearCheckoutCart = () => {
    setCheckout(current => clearCart(current));
  };

  const replaceCheckout = (nextCheckout: CheckoutState) => {
    setCheckout(nextCheckout);
  };

  const updateLineDiscountType = (
    itemId: string,
    discountType: CartLine['discountType'],
  ) => {
    setCheckout(current =>
      updateCartLineDiscount(current, itemId, {discountType}),
    );
  };

  const updateLineDiscountAmount = (itemId: string, value: string) => {
    setCheckout(current =>
      updateCartLineDiscount(current, itemId, {
        discountAmount: parseNonNegativeNumber(value),
      }),
    );
  };

  const updateLineVoucherCode = (itemId: string, voucherCode: string) => {
    setCheckout(current => updateCartLineVoucherCode(current, itemId, voucherCode));
  };

  const selectCustomer = (customerId: string) => {
    setCheckout(current => ({...current, customerId}));
  };

  const selectPaymentMethod = (paymentMethodId: string) => {
    setCheckout(current => ({...current, paymentMethodId}));
  };

  const updateGlobalDiscount = (value: string) => {
    setCheckout(current => ({
      ...current,
      globalDiscount: normalizeDiscountAmount(
        current.globalDiscountType,
        parseNonNegativeNumber(value),
      ),
    }));
  };

  const updateShippingCost = (value: string) => {
    setCheckout(current => ({
      ...current,
      shippingCost: parseNonNegativeNumber(value),
    }));
  };

  const setDiscountType = (
    globalDiscountType: CheckoutState['globalDiscountType'],
  ) => {
    setCheckout(current => ({
      ...current,
      globalDiscountType,
      globalDiscount: normalizeDiscountAmount(
        globalDiscountType,
        current.globalDiscount,
      ),
    }));
  };

  const setCatalogType = (type: CatalogFilterType) => {
    setActiveType(type);
    setActiveCategory(null);
  };

  return {
    activeCategory,
    activeType,
    addToCart,
    afterDiscount,
    canCreateDraft,
    catalogCategories,
    catalogSearch,
    checkout,
    checkoutWorkflowSteps,
    clearCheckoutCart,
    filteredCatalog,
    finalTotal,
    onCategoryChange: setActiveCategory,
    reconcileCheckoutWithDataset,
    replaceCheckout,
    selectCustomer,
    selectPaymentMethod,
    selectedCustomer,
    selectedPayment,
    setActiveCategory,
    setActiveType: setCatalogType,
    setCatalogSearch,
    setDiscountType,
    subtotal,
    updateGlobalDiscount,
    updateLineDiscountAmount,
    updateLineDiscountType,
    updateLineVoucherCode,
    updateQuantity,
    updateShippingCost,
  };
}
