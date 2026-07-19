import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamCartRow} from '../src/components/kolam-cart-row';
import {KolamCatalogCard} from '../src/components/kolam-catalog-card';
import {KolamCustomerSelector} from '../src/components/kolam-customer-selector';
import {KolamPaymentSelector} from '../src/components/kolam-payment-selector';
import {KolamSalesPanel} from '../src/components/kolam-sales-panel';
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

describe('POS split widgets', () => {
  it('renders direct imports for sales, catalog, selectors, and cart row', async () => {
    const dataset = seedUnifiedDataset;
    const firstItem = dataset.catalog[0];
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamSalesPanel sales={dataset.recentSales.slice(0, 1)} />
          <KolamCatalogCard item={firstItem} onPress={() => undefined} />
          <KolamCustomerSelector
            customers={dataset.customers}
            selectedCustomerId={dataset.customers[0].id}
            onSelect={() => undefined}
          />
          <KolamPaymentSelector
            methods={dataset.paymentMethods}
            selectedMethodId={dataset.paymentMethods[0].id}
            onSelect={() => undefined}
          />
          <KolamCartRow
            catalog={dataset.catalog}
            line={{
              discountAmount: 0,
              discountType: 'fixed',
              itemId: firstItem.id,
              quantity: 1,
            }}
            onDiscountAmountChange={() => undefined}
            onDiscountTypeChange={() => undefined}
            onQuantityChange={() => undefined}
          />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Sales Terbaru',
        firstItem.name,
        dataset.customers[0].name,
        dataset.paymentMethods[0].name,
      ]),
    );
  });
});