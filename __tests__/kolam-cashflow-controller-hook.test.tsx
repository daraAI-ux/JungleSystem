import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import type {CashflowSession} from '../src/domain/pos';
import {useKolamCashflowController} from '../src/hooks/use-kolam-cashflow-controller';
import {
  closeCashflowSession,
  openCashflowSession,
} from '../src/services/pos-api';

jest.mock('../src/services/pos-api', () => ({
  closeCashflowSession: jest.fn(),
  openCashflowSession: jest.fn(),
}));

type CashflowController = ReturnType<typeof useKolamCashflowController>;

const openCashflowSessionMock =
  openCashflowSession as jest.MockedFunction<typeof openCashflowSession>;
const closeCashflowSessionMock =
  closeCashflowSession as jest.MockedFunction<typeof closeCashflowSession>;

const activeSession: CashflowSession = {
  id: 'cashflow-1',
  name: 'Morning Shift',
  openedAt: '2026-07-18T09:00:00.000+07:00',
  openingBalance: 0,
  cashier: 'Operator',
};

function requireController(controller: CashflowController | null) {
  if (!controller) {
    throw new Error('Cashflow controller did not render.');
  }

  return controller;
}

function CashflowHarness({
  session,
  hasPosAccess = true,
  onMessage,
  onRefresh,
  onRender,
  signedIn = true,
}: {
  session: CashflowSession | null;
  hasPosAccess?: boolean;
  onMessage: (message: string) => void;
  onRefresh: () => Promise<void>;
  onRender: (controller: CashflowController) => void;
  signedIn?: boolean;
}) {
  const controller = useKolamCashflowController({
    activeSession: session,
    hasPosAccess,
    onMessage,
    onRefresh,
    signedIn,
  });

  onRender(controller);
  return null;
}

describe('Kolam cashflow controller hook', () => {
  beforeEach(() => {
    closeCashflowSessionMock.mockReset();
    openCashflowSessionMock.mockReset();
  });

  it('blocks opening cashflow until the operator is signed in with POS access', async () => {
    let latest: CashflowController | null = null;
    let message = '';

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <CashflowHarness
          session={null}
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
      await requireController(latest).handleOpenCashflow();
    });

    expect(message).toBe('Login kasir dulu sebelum membuka cashflow.');
    expect(openCashflowSessionMock).not.toHaveBeenCalled();
  });

  it('opens cashflow with the trimmed shift name, clears the field, and refreshes data', async () => {
    let latest: CashflowController | null = null;
    const messages: string[] = [];
    let refreshCount = 0;
    openCashflowSessionMock.mockResolvedValue(activeSession);

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <CashflowHarness
          session={null}
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
      requireController(latest).setCashflowShiftName('  Sore  ');
    });

    await ReactTestRenderer.act(async () => {
      await requireController(latest).handleOpenCashflow();
    });

    expect(openCashflowSessionMock).toHaveBeenCalledWith({name: 'Sore'});
    expect(messages).toContain('Cashflow session berhasil dibuka.');
    expect(refreshCount).toBe(1);
    expect(requireController(latest).cashflowShiftName).toBe('');
    expect(requireController(latest).isOpeningCashflow).toBe(false);
  });

  it('closes the active cashflow session and refreshes data', async () => {
    let latest: CashflowController | null = null;
    const messages: string[] = [];
    let refreshCount = 0;
    closeCashflowSessionMock.mockResolvedValue(activeSession);

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <CashflowHarness
          session={activeSession}
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
      await requireController(latest).handleCloseCashflow();
    });

    expect(closeCashflowSessionMock).toHaveBeenCalledWith('cashflow-1');
    expect(messages).toContain('Cashflow session berhasil ditutup.');
    expect(refreshCount).toBe(1);
    expect(requireController(latest).isClosingCashflow).toBe(false);
  });
});
