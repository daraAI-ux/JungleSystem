import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {
  KolamCashflowModule,
  KolamCatalogModule,
  KolamCheckoutWorkspace,
  KolamCustomerModule,
} from '../src/components/kolam-pos-workspace-widgets';
import {initialCheckoutState} from '../src/data/seed';
import {getCheckoutWorkflowSteps} from '../src/lib/workflow';
import {seedUnifiedDataset} from '../src/services/unified-data';

function renderText(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root.findAllByType(Text).map(node => node.props.children);
}

describe('POS workspace Kolam widgets', () => {
  it('renders checkout, catalog, cashflow, and customer module surfaces', async () => {
    const dataset = seedUnifiedDataset;
    const firstCustomer = dataset.customers[0];
    const firstPayment = dataset.paymentMethods[0];
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
            workflowSteps={getCheckoutWorkflowSteps({
              cartItemCount: 0,
              hasCashflow: false,
              hasCustomer: Boolean(firstCustomer),
              hasPaymentMethod: Boolean(firstPayment),
              hasPosAccess: true,
              signedIn: true,
            })}
          />
          <KolamCatalogModule
            catalogSearch=""
            filteredCatalog={dataset.catalog.slice(0, 1)}
            onCatalogSearchChange={() => undefined}
          />
          <KolamCashflowModule
            activeSession={null}
            cashflowPreview={null}
            cashflowShiftName=""
            canClose={false}
            canOpen
            isClosingCashflow={false}
            isLoadingCashflowPreview={false}
            isOpeningCashflow={false}
            onCashflowShiftNameChange={() => undefined}
            onCloseCashflow={() => undefined}
            onOpenCashflow={() => undefined}
          />
          <KolamCustomerModule
            customerForm={{
              address: '',
              email: '',
              gender: 'other',
              name: '',
              phone: '',
            }}
            customers={dataset.customers}
            isCreatingCustomer={false}
            onCreateCustomer={() => undefined}
            onCustomerFormChange={() => undefined}
          />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Katalog Sellable',
        'Checkout',
        'Katalog',
        'Cashflow',
        'Customer',
        'Buat customer',
      ]),
    );
  });
});
