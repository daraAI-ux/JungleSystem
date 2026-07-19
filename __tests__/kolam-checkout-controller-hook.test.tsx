import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {useKolamCashflowPreview} from '../src/hooks/use-kolam-cashflow-preview';
import {useKolamCheckoutController} from '../src/hooks/use-kolam-checkout-controller';
import {seedUnifiedDataset} from '../src/services/unified-data';

type CheckoutController = ReturnType<typeof useKolamCheckoutController>;
type CashflowPreviewController = ReturnType<typeof useKolamCashflowPreview>;

function requireCheckoutController(
  controller: CheckoutController | null,
): CheckoutController {
  if (!controller) {
    throw new Error('Checkout controller did not render.');
  }

  return controller;
}

function requireCashflowPreviewController(
  controller: CashflowPreviewController | null,
): CashflowPreviewController {
  if (!controller) {
    throw new Error('Cashflow preview controller did not render.');
  }

  return controller;
}

function CheckoutHarness({
  onRender,
}: {
  onRender: (controller: CheckoutController) => void;
}) {
  const controller = useKolamCheckoutController({
    accessScope: {am: true, kolam: true, pos: true},
    dataset: seedUnifiedDataset,
    signedIn: true,
  });

  onRender(controller);
  return null;
}

function CashflowPreviewHarness({
  onRender,
}: {
  onRender: (controller: CashflowPreviewController) => void;
}) {
  const controller = useKolamCashflowPreview({
    activeModule: 'checkout',
    activeSession: seedUnifiedDataset.activeSession,
  });

  onRender(controller);
  return null;
}

describe('Kolam checkout hooks', () => {
  it('keeps cart editing behavior in the checkout controller', async () => {
    let latest: CheckoutController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <CheckoutHarness
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    expect(requireCheckoutController(latest).canCreateDraft).toBe(true);
    expect(requireCheckoutController(latest).subtotal).toBe(370000);

    await ReactTestRenderer.act(async () => {
      requireCheckoutController(latest).addToCart(seedUnifiedDataset.catalog[0]);
    });

    expect(requireCheckoutController(latest).checkout.cart[0].quantity).toBe(2);

    await ReactTestRenderer.act(async () => {
      const controller = requireCheckoutController(latest);
      controller.setDiscountType('percentage');
      controller.updateGlobalDiscount('150');
      controller.updateQuantity('product-filter-sponge', 0);
    });

    expect(requireCheckoutController(latest).checkout.globalDiscount).toBe(100);
    expect(
      requireCheckoutController(latest).checkout.cart.some(
        line => line.itemId === 'product-filter-sponge',
      ),
    ).toBe(false);
  });

  it('does not load cashflow preview outside the cashflow module', async () => {
    let latest: CashflowPreviewController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <CashflowPreviewHarness
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    expect(requireCashflowPreviewController(latest).cashflowPreview).toBeNull();
    expect(
      requireCashflowPreviewController(latest).isLoadingCashflowPreview,
    ).toBe(false);
  });
});
