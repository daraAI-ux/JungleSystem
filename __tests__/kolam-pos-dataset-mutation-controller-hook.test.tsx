import React, {useState} from 'react';
import ReactTestRenderer from 'react-test-renderer';
import type {Customer, SaleSummary} from '../src/domain/pos';
import {useKolamPosDatasetMutationController} from '../src/hooks/use-kolam-pos-dataset-mutation-controller';
import {
  seedUnifiedDataset,
  type UnifiedDataset,
} from '../src/services/unified-data';

type PosDatasetMutationController = ReturnType<
  typeof useKolamPosDatasetMutationController
>;

function requireController(controller: PosDatasetMutationController | null) {
  if (!controller) {
    throw new Error('POS dataset mutation controller did not render.');
  }

  return controller;
}

function PosDatasetMutationHarness({
  onDataset,
  onMessage,
  onRender,
  onSelectCustomer,
}: {
  onDataset: (dataset: UnifiedDataset) => void;
  onMessage: (message: string) => void;
  onRender: (controller: PosDatasetMutationController) => void;
  onSelectCustomer: (customerId: string) => void;
}) {
  const [dataset, setDataset] = useState(seedUnifiedDataset);
  const controller = useKolamPosDatasetMutationController({
    onMessage,
    onSelectCustomer,
    setDataset,
  });

  onDataset(dataset);
  onRender(controller);
  return null;
}

describe('Kolam POS dataset mutation controller hook', () => {
  it('prepends created customers and selects the new customer', async () => {
    let latest: PosDatasetMutationController | null = null;
    let latestDataset = seedUnifiedDataset;
    const selectedCustomers: string[] = [];
    const createdCustomer: Customer = {
      address: 'Jl Kolam',
      email: 'baru@example.test',
      id: 'customer-baru',
      name: 'Customer Baru',
      phone: '081234',
    };

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <PosDatasetMutationHarness
          onDataset={dataset => {
            latestDataset = dataset;
          }}
          onMessage={() => undefined}
          onRender={controller => {
            latest = controller;
          }}
          onSelectCustomer={customerId => selectedCustomers.push(customerId)}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      requireController(latest).handleCustomerCreated(createdCustomer);
    });

    expect(latestDataset.customers[0]).toEqual(createdCustomer);
    expect(selectedCustomers).toEqual([createdCustomer.id]);
  });

  it('replaces the updated sale without changing the rest of the sale list', async () => {
    let latest: PosDatasetMutationController | null = null;
    let latestDataset = seedUnifiedDataset;
    const updatedSale: SaleSummary = {
      ...seedUnifiedDataset.recentSales[0],
      paidAmount: seedUnifiedDataset.recentSales[0].total,
      status: 'paid',
    };

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <PosDatasetMutationHarness
          onDataset={dataset => {
            latestDataset = dataset;
          }}
          onMessage={() => undefined}
          onRender={controller => {
            latest = controller;
          }}
          onSelectCustomer={() => undefined}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      requireController(latest).handleSaleUpdated(updatedSale);
    });

    expect(latestDataset.recentSales[0]).toEqual(updatedSale);
    expect(latestDataset.recentSales.slice(1)).toEqual(
      seedUnifiedDataset.recentSales.slice(1),
    );
  });

  it('keeps customer visit confirmation messaging in one controller', async () => {
    let latest: PosDatasetMutationController | null = null;
    let message = '';

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <PosDatasetMutationHarness
          onDataset={() => undefined}
          onMessage={nextMessage => {
            message = nextMessage;
          }}
          onRender={controller => {
            latest = controller;
          }}
          onSelectCustomer={() => undefined}
        />,
      );
    });

    requireController(latest).handleCustomerVisitConfirm({
      actionLabel: 'Konfirmasi',
      actionAccessibilityLabel:
        'Konfirmasi - /kontrol-layanan/pending-services/pending-1',
      description: 'SUB-1 - Jadwal Hari ini',
      id: 'visit-1',
      route: '/kontrol-layanan/pending-services/pending-1',
      title: 'Kunjungan layanan',
    });

    expect(message).toBe(
      'Konfirmasi native membuka /kontrol-layanan/pending-services/pending-1.',
    );
  });
});
