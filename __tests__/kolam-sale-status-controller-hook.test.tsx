import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import type {SaleSummary} from '../src/domain/pos';
import {useKolamSaleStatusController} from '../src/hooks/use-kolam-sale-status-controller';
import {updateSaleStatus} from '../src/services/pos-api';
import {seedUnifiedDataset} from '../src/services/unified-data';

jest.mock('../src/services/pos-api', () => ({
  updateSaleStatus: jest.fn(),
}));

type SaleStatusController = ReturnType<typeof useKolamSaleStatusController>;

const updateSaleStatusMock =
  updateSaleStatus as jest.MockedFunction<typeof updateSaleStatus>;

function requireController(controller: SaleStatusController | null) {
  if (!controller) {
    throw new Error('Sale status controller did not render.');
  }

  return controller;
}

function SaleStatusHarness({
  hasPosAccess = true,
  onMessage,
  onRender,
  onSaleUpdated,
  signedIn = true,
}: {
  hasPosAccess?: boolean;
  onMessage: (message: string) => void;
  onRender: (controller: SaleStatusController) => void;
  onSaleUpdated: (sale: SaleSummary) => void;
  signedIn?: boolean;
}) {
  const controller = useKolamSaleStatusController({
    hasPosAccess,
    onMessage,
    onSaleUpdated,
    signedIn,
  });

  onRender(controller);
  return null;
}

describe('Kolam sale status controller hook', () => {
  beforeEach(() => {
    updateSaleStatusMock.mockReset();
  });

  it('blocks sale status updates until the cashier is signed in', async () => {
    let latest: SaleStatusController | null = null;
    let message = '';

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <SaleStatusHarness
          onMessage={nextMessage => {
            message = nextMessage;
          }}
          onRender={controller => {
            latest = controller;
          }}
          onSaleUpdated={() => undefined}
          signedIn={false}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      await requireController(latest).handleSaleStatus('sale-1', 'paid');
    });

    expect(message).toBe('Login kasir dulu sebelum mengubah status sale.');
    expect(updateSaleStatusMock).not.toHaveBeenCalled();
  });

  it('blocks sale status updates without POS access', async () => {
    let latest: SaleStatusController | null = null;
    let message = '';

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <SaleStatusHarness
          hasPosAccess={false}
          onMessage={nextMessage => {
            message = nextMessage;
          }}
          onRender={controller => {
            latest = controller;
          }}
          onSaleUpdated={() => undefined}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      await requireController(latest).handleSaleStatus('sale-1', 'paid');
    });

    expect(message).toBe('User ini tidak punya akses POS untuk mengubah status sale.');
    expect(updateSaleStatusMock).not.toHaveBeenCalled();
  });

  it('updates the sale status, reports success, and clears loading state', async () => {
    let latest: SaleStatusController | null = null;
    const messages: string[] = [];
    const updatedSales: SaleSummary[] = [];
    const updatedSale = {
      ...seedUnifiedDataset.recentSales[0],
      status: 'paid',
    } satisfies SaleSummary;
    updateSaleStatusMock.mockResolvedValue(updatedSale);

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <SaleStatusHarness
          onMessage={message => messages.push(message)}
          onRender={controller => {
            latest = controller;
          }}
          onSaleUpdated={sale => {
            updatedSales.push(sale);
          }}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      await requireController(latest).handleSaleStatus(updatedSale.id, 'paid');
    });

    expect(updateSaleStatusMock).toHaveBeenCalledWith(updatedSale.id, 'paid');
    expect(updatedSales).toEqual([updatedSale]);
    expect(messages).toContain(`${updatedSale.invoiceCode} menjadi paid.`);
    expect(requireController(latest).updatingSaleId).toBeNull();
  });
});
