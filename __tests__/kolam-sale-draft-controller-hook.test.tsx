import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {initialCheckoutState} from '../src/data/seed';
import {useKolamSaleDraftController} from '../src/hooks/use-kolam-sale-draft-controller';
import {createSaleDraft} from '../src/services/pos-api';
import {seedUnifiedDataset} from '../src/services/unified-data';

jest.mock('../src/services/pos-api', () => ({
  createSaleDraft: jest.fn(),
}));

type SaleDraftController = ReturnType<typeof useKolamSaleDraftController>;

const createSaleDraftMock =
  createSaleDraft as jest.MockedFunction<typeof createSaleDraft>;

function requireController(controller: SaleDraftController | null) {
  if (!controller) {
    throw new Error('Sale draft controller did not render.');
  }

  return controller;
}

function SaleDraftHarness({
  activeSession = seedUnifiedDataset.activeSession,
  checkout = initialCheckoutState,
  hasPosAccess = true,
  onMessage,
  onRefresh,
  onRender,
  selectedCustomer = seedUnifiedDataset.customers[0],
  selectedPayment = seedUnifiedDataset.paymentMethods[0],
  signedIn = true,
}: {
  activeSession?: typeof seedUnifiedDataset.activeSession;
  checkout?: typeof initialCheckoutState;
  hasPosAccess?: boolean;
  onMessage: (message: string) => void;
  onRefresh: () => Promise<void>;
  onRender: (controller: SaleDraftController) => void;
  selectedCustomer?: typeof seedUnifiedDataset.customers[number];
  selectedPayment?: typeof seedUnifiedDataset.paymentMethods[number];
  signedIn?: boolean;
}) {
  const controller = useKolamSaleDraftController({
    activeSession,
    catalog: seedUnifiedDataset.catalog,
    checkout,
    hasPosAccess,
    onMessage,
    onRefresh,
    selectedCustomer,
    selectedPayment,
    signedIn,
  });

  onRender(controller);
  return null;
}

describe('Kolam sale draft controller hook', () => {
  beforeEach(() => {
    createSaleDraftMock.mockReset();
  });

  it('blocks sale draft creation until the cashier is signed in', async () => {
    let latest: SaleDraftController | null = null;
    let message = '';

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <SaleDraftHarness
          onMessage={nextMessage => {
            message = nextMessage;
          }}
          onRefresh={async () => undefined}
          onRender={controller => {
            latest = controller;
          }}
          signedIn={false}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      await requireController(latest).handleCreateSaleDraft();
    });

    expect(message).toBe('Login kasir dulu sebelum membuat sale draft.');
    expect(createSaleDraftMock).not.toHaveBeenCalled();
  });

  it('blocks sale draft creation when the cart is empty', async () => {
    let latest: SaleDraftController | null = null;
    let message = '';

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <SaleDraftHarness
          checkout={{...initialCheckoutState, cart: []}}
          onMessage={nextMessage => {
            message = nextMessage;
          }}
          onRefresh={async () => undefined}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      await requireController(latest).handleCreateSaleDraft();
    });

    expect(message).toBe('Cart masih kosong.');
    expect(createSaleDraftMock).not.toHaveBeenCalled();
  });

  it('creates the sale draft, reports success, and refreshes runtime data', async () => {
    let latest: SaleDraftController | null = null;
    const messages: string[] = [];
    let refreshCount = 0;
    createSaleDraftMock.mockResolvedValue({
      data: seedUnifiedDataset.recentSales[0],
    } as unknown as Awaited<ReturnType<typeof createSaleDraft>>);

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <SaleDraftHarness
          onMessage={message => messages.push(message)}
          onRefresh={async () => {
            refreshCount += 1;
          }}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      await requireController(latest).handleCreateSaleDraft();
    });

    expect(createSaleDraftMock).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: initialCheckoutState.customerId,
        paymentMethod: initialCheckoutState.paymentMethodId,
      }),
    );
    expect(messages).toContain('Sale draft berhasil dibuat di backend.');
    expect(refreshCount).toBe(1);
    expect(requireController(latest).isCreatingSale).toBe(false);
  });
});
