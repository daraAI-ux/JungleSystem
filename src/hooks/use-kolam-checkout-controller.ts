import {useMemo, useState} from 'react';
import {initialCheckoutState} from '../data/seed';
import type {AccessScope} from '../domain/auth';
import type {CartLine, CatalogItem, CheckoutState} from '../domain/pos';
import type {CatalogFilterType} from '../lib/catalog';
import {filterCatalogItems} from '../lib/catalog';
import {
  applyDiscount,
  clearCart,
  getCartSubtotal,
  normalizeDiscountAmount,
  parseNonNegativeNumber,
  updateCartLineDiscount,
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
  const [catalogSearch, setCatalogSearch] = useState('');

  const filteredCatalog = useMemo(
    () =>
      filterCatalogItems(dataset.catalog, {
        type: activeType,
        search: catalogSearch,
      }),
    [activeType, catalogSearch, dataset.catalog],
  );
  const selectedCustomer = dataset.customers.find(
    customer => customer.id === checkout.customerId,
  );
  const selectedPayment = dataset.paymentMethods.find(
    method => method.id === checkout.paymentMethodId,
  );
  const subtotal = getCartSubtotal(checkout.cart, dataset.catalog);
  const afterDiscount = applyDiscount(
    subtotal,
    checkout.globalDiscountType,
    checkout.globalDiscount,
  );
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

      if (!existing) {
        return {
          ...current,
          cart: [
            ...current.cart,
            {
              itemId: item.id,
              quantity: 1,
              discountType: 'fixed',
              discountAmount: 0,
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

  return {
    activeType,
    addToCart,
    afterDiscount,
    canCreateDraft,
    catalogSearch,
    checkout,
    checkoutWorkflowSteps,
    clearCheckoutCart,
    filteredCatalog,
    finalTotal,
    reconcileCheckoutWithDataset,
    selectCustomer,
    selectPaymentMethod,
    selectedCustomer,
    selectedPayment,
    setActiveType,
    setCatalogSearch,
    setDiscountType,
    subtotal,
    updateGlobalDiscount,
    updateLineDiscountAmount,
    updateLineDiscountType,
    updateQuantity,
    updateShippingCost,
  };
}
