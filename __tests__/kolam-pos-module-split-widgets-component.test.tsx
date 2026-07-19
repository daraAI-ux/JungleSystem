import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamCashflowClosePreview} from '../src/components/kolam-cashflow-close-preview';
import {KolamCashflowModule} from '../src/components/kolam-cashflow-module';
import {KolamCatalogModule} from '../src/components/kolam-catalog-module';
import {KolamCustomerModule} from '../src/components/kolam-customer-module';
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

describe('POS module split widgets', () => {
  it('renders direct imports for catalog, cashflow, preview, and customer modules', async () => {
    const dataset = seedUnifiedDataset;
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
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
          <KolamCashflowClosePreview
            cashflowPreview={null}
            isLoadingCashflowPreview={false}
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
        'Katalog',
        'Cashflow',
        'Close preview',
        'Customer',
        'Buat customer',
      ]),
    );
  });
});