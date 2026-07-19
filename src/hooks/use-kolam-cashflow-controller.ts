import {useMemo, useState} from 'react';
import type {CashflowSession} from '../domain/pos';
import {getCashflowShiftName} from '../lib/cashflow';
import {canCloseCashflow, canOpenCashflow} from '../lib/workflow';
import {
  closeCashflowSession,
  openCashflowSession,
} from '../services/pos-api';

export function useKolamCashflowController({
  activeSession,
  hasPosAccess,
  onMessage,
  onRefresh,
  signedIn,
}: {
  activeSession: CashflowSession | null;
  hasPosAccess: boolean;
  onMessage: (message: string) => void;
  onRefresh: () => Promise<void>;
  signedIn: boolean;
}) {
  const [cashflowShiftName, setCashflowShiftName] = useState('');
  const [isOpeningCashflow, setIsOpeningCashflow] = useState(false);
  const [isClosingCashflow, setIsClosingCashflow] = useState(false);
  const canOpenCashflowSession = useMemo(
    () => canOpenCashflow(signedIn, hasPosAccess, Boolean(activeSession)),
    [activeSession, hasPosAccess, signedIn],
  );
  const canCloseCashflowSession = useMemo(
    () => canCloseCashflow(signedIn, hasPosAccess, Boolean(activeSession)),
    [activeSession, hasPosAccess, signedIn],
  );

  const handleOpenCashflow = async () => {
    if (!canOpenCashflowSession) {
      onMessage(
        !signedIn
          ? 'Login kasir dulu sebelum membuka cashflow.'
          : !hasPosAccess
            ? 'User ini tidak punya akses POS untuk membuka cashflow.'
            : 'Cashflow session sudah open.',
      );
      return;
    }

    setIsOpeningCashflow(true);
    try {
      await openCashflowSession({
        name: getCashflowShiftName(cashflowShiftName),
      });
      setCashflowShiftName('');
      onMessage('Cashflow session berhasil dibuka.');
      await onRefresh();
    } catch (error) {
      onMessage(
        error instanceof Error ? error.message : 'Gagal membuka cashflow.',
      );
    } finally {
      setIsOpeningCashflow(false);
    }
  };

  const handleCloseCashflow = async () => {
    if (!canCloseCashflowSession) {
      onMessage(
        !signedIn
          ? 'Login kasir dulu sebelum menutup cashflow.'
          : !hasPosAccess
            ? 'User ini tidak punya akses POS untuk menutup cashflow.'
            : 'Belum ada cashflow session yang open.',
      );
      return;
    }

    setIsClosingCashflow(true);
    try {
      await closeCashflowSession(activeSession!.id);
      onMessage('Cashflow session berhasil ditutup.');
      await onRefresh();
    } catch (error) {
      onMessage(
        error instanceof Error ? error.message : 'Gagal menutup cashflow.',
      );
    } finally {
      setIsClosingCashflow(false);
    }
  };

  return {
    canCloseCashflowSession,
    canOpenCashflowSession,
    cashflowShiftName,
    handleCloseCashflow,
    handleOpenCashflow,
    isClosingCashflow,
    isOpeningCashflow,
    setCashflowShiftName,
  };
}
