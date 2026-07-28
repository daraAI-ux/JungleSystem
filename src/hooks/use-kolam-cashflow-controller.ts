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
          ? 'Login kasir dulu sebelum membuka arus kas.'
          : !hasPosAccess
            ? 'Pengguna ini tidak punya akses POS untuk membuka arus kas.'
            : 'Sesi arus kas sudah dibuka.',
      );
      return;
    }

    setIsOpeningCashflow(true);
    try {
      await openCashflowSession({
        name: getCashflowShiftName(cashflowShiftName),
      });
      setCashflowShiftName('');
      onMessage('Sesi arus kas berhasil dibuka.');
      await onRefresh();
    } catch (error) {
      onMessage(
        error instanceof Error ? error.message : 'Gagal membuka arus kas.',
      );
    } finally {
      setIsOpeningCashflow(false);
    }
  };

  const handleCloseCashflow = async () => {
    if (!canCloseCashflowSession) {
      onMessage(
        !signedIn
          ? 'Login kasir dulu sebelum menutup arus kas.'
          : !hasPosAccess
            ? 'Pengguna ini tidak punya akses POS untuk menutup arus kas.'
            : 'Belum ada sesi arus kas yang dibuka.',
      );
      return;
    }

    setIsClosingCashflow(true);
    try {
      await closeCashflowSession(activeSession!.id);
      onMessage('Sesi arus kas berhasil ditutup.');
      await onRefresh();
    } catch (error) {
      onMessage(
        error instanceof Error ? error.message : 'Gagal menutup arus kas.',
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
