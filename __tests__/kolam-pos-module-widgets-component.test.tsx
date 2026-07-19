import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {
  KolamCashflowModule,
  KolamCatalogModule,
  KolamCustomerModule,
} from '../src/components/kolam-pos-module-widgets';
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

describe('POS module widgets', () => {
  it('renders catalog, cashflow, and customer modules directly', async () => {
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
        'Customer',
        'Buat customer',
      ]),
    );
  });
});
