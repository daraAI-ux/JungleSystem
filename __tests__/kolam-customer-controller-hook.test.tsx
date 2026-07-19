import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import type {Customer} from '../src/domain/pos';
import {useKolamCustomerController} from '../src/hooks/use-kolam-customer-controller';
import {
  createCustomer,
  type CreateCustomerBody,
} from '../src/services/pos-api';
import {seedUnifiedDataset} from '../src/services/unified-data';

jest.mock('../src/services/pos-api', () => ({
  createCustomer: jest.fn(),
}));

type CustomerController = ReturnType<typeof useKolamCustomerController>;

const createCustomerMock =
  createCustomer as jest.MockedFunction<typeof createCustomer>;

function requireController(controller: CustomerController | null) {
  if (!controller) {
    throw new Error('Customer controller did not render.');
  }

  return controller;
}

function CustomerHarness({
  hasPosAccess = true,
  onCustomerCreated,
  onMessage,
  onRender,
  signedIn = true,
}: {
  hasPosAccess?: boolean;
  onCustomerCreated: (customer: Customer) => void;
  onMessage: (message: string) => void;
  onRender: (controller: CustomerController) => void;
  signedIn?: boolean;
}) {
  const controller = useKolamCustomerController({
    hasPosAccess,
    onCustomerCreated,
    onMessage,
    signedIn,
  });

  onRender(controller);
  return null;
}

describe('Kolam customer controller hook', () => {
  beforeEach(() => {
    createCustomerMock.mockReset();
  });

  it('blocks customer creation until the cashier is signed in', async () => {
    let latest: CustomerController | null = null;
    let message = '';

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <CustomerHarness
          onCustomerCreated={() => undefined}
          onMessage={nextMessage => {
            message = nextMessage;
          }}
          onRender={controller => {
            latest = controller;
          }}
          signedIn={false}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      await requireController(latest).handleCreateCustomer();
    });

    expect(message).toBe('Login kasir dulu sebelum membuat customer.');
    expect(createCustomerMock).not.toHaveBeenCalled();
  });

  it('requires customer name and phone before calling the backend', async () => {
    let latest: CustomerController | null = null;
    let message = '';

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <CustomerHarness
          onCustomerCreated={() => undefined}
          onMessage={nextMessage => {
            message = nextMessage;
          }}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      await requireController(latest).handleCreateCustomer();
    });

    expect(message).toBe('Nama dan nomor telepon customer wajib diisi.');
    expect(createCustomerMock).not.toHaveBeenCalled();
  });

  it('creates the customer, resets the form, and reports success', async () => {
    let latest: CustomerController | null = null;
    const messages: string[] = [];
    const createdCustomers: Customer[] = [];
    const createdCustomer = seedUnifiedDataset.customers[0];
    createCustomerMock.mockResolvedValue(createdCustomer);

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <CustomerHarness
          onCustomerCreated={customer => {
            createdCustomers.push(customer);
          }}
          onMessage={message => messages.push(message)}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      requireController(latest).setCustomerForm({
        name: 'Budi Kolam',
        gender: 'other',
        address: '',
        phone: '081234',
        email: '',
        notes: 'member baru',
      });
    });

    await ReactTestRenderer.act(async () => {
      await requireController(latest).handleCreateCustomer();
    });

    expect(createCustomerMock).toHaveBeenCalledWith(
      expect.objectContaining<CreateCustomerBody>({
        name: 'Budi Kolam',
        gender: 'other',
        address: '-',
        phone: '081234',
        email: '-',
        notes: 'member baru',
      }),
    );
    expect(createdCustomers).toEqual([createdCustomer]);
    expect(messages).toContain(`Customer dibuat: ${createdCustomer.name}`);
    expect(requireController(latest).customerForm).toMatchObject({
      name: '',
      phone: '',
    });
    expect(requireController(latest).isCreatingCustomer).toBe(false);
  });
});
