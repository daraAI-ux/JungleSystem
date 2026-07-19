import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {
  KolamCheckoutSummaryPanel,
  KolamCheckoutWorkspace,
  KolamSellableCatalogPicker,
} from '../src/components/kolam-pos-checkout-workspace';
import {initialCheckoutState} from '../src/data/seed';
import {getCheckoutWorkflowSteps} from '../src/lib/workflow';
import {seedUnifiedDataset} from '../src/services/unified-data';

function renderText(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root
    .findAllByType(Text)
    .flatMap(node => flattenText(node.props.children));
}

function flattenText(value: React.ReactNode): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(flattenText);
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return [String(value)];
  }

  return [];
}

describe('POS checkout workspace widgets', () => {
  it('renders checkout workspace, catalog picker, and summary panel directly', async () => {
    const dataset = seedUnifiedDataset;
    const firstCustomer = dataset.customers[0];
    const firstPayment = dataset.paymentMethods[0];
    const workflowSteps = getCheckoutWorkflowSteps({
      cartItemCount: 0,
      hasCashflow: false,
      hasCustomer: Boolean(firstCustomer),
      hasPaymentMethod: Boolean(firstPayment),
      hasPosAccess: true,
      signedIn: true,
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamCheckoutWorkspace
            activeType="all"
            afterDiscount={0}
            canCreateDraft={false}
            catalog={dataset.catalog}
            catalogSearch=""
            checkout={initialCheckoutState}
            customers={dataset.customers}
            filteredCatalog={dataset.catalog.slice(0, 2)}
            finalTotal={0}
            isCreatingSale={false}
            onAddToCart={() => undefined}
            onCatalogSearchChange={() => undefined}
            onClearCart={() => undefined}
            onCreateSaleDraft={() => undefined}
            onDiscountAmountChange={() => undefined}
            onDiscountTypeChange={() => undefined}
            onGlobalDiscountChange={() => undefined}
            onGlobalDiscountTypeChange={() => undefined}
            onQuantityChange={() => undefined}
            onSelectCustomer={() => undefined}
            onSelectPaymentMethod={() => undefined}
            onShippingCostChange={() => undefined}
            onTypeChange={() => undefined}
            paymentMethods={dataset.paymentMethods}
            recentSales={dataset.recentSales}
            selectedCustomer={firstCustomer}
            selectedPayment={firstPayment}
            subtotal={0}
            workflowSteps={workflowSteps}
          />
          <KolamSellableCatalogPicker
            activeType="product"
            catalogSearch=""
            filteredCatalog={dataset.catalog.slice(0, 1)}
            onAddToCart={() => undefined}
            onCatalogSearchChange={() => undefined}
            onTypeChange={() => undefined}
          />
          <KolamCheckoutSummaryPanel
            afterDiscount={0}
            canCreateDraft={false}
            catalog={dataset.catalog}
            checkout={initialCheckoutState}
            customers={dataset.customers}
            finalTotal={0}
            isCreatingSale={false}
            onClearCart={() => undefined}
            onCreateSaleDraft={() => undefined}
            onDiscountAmountChange={() => undefined}
            onDiscountTypeChange={() => undefined}
            onGlobalDiscountChange={() => undefined}
            onGlobalDiscountTypeChange={() => undefined}
            onQuantityChange={() => undefined}
            onSelectCustomer={() => undefined}
            onSelectPaymentMethod={() => undefined}
            onShippingCostChange={() => undefined}
            paymentMethods={dataset.paymentMethods}
            selectedCustomer={firstCustomer}
            selectedPayment={firstPayment}
            subtotal={0}
            workflowSteps={workflowSteps}
          />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Katalog Sellable',
        'Checkout',
        'Buat sale draft',
      ]),
    );
  });
});
