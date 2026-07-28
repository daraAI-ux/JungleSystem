import React from 'react';
import type {CashflowSession} from '../domain/pos';
import {formatRupiah} from '../lib/money';
import {KolamInfoBlock} from './kolam-info-block';

export function KolamCashflowStatusBlocks({
  activeSession,
}: {
  activeSession: CashflowSession | null;
}) {
  return (
    <>
      <KolamInfoBlock
        label="Status"
        primary={activeSession ? 'Dibuka' : 'Ditutup'}
        secondary={activeSession?.name ?? 'Belum ada sesi aktif'}
      />
      <KolamInfoBlock
        label="Kasir"
        primary={activeSession?.cashier ?? '-'}
        secondary={
          activeSession
            ? `Kas awal ${formatRupiah(activeSession.openingBalance)}`
            : 'Buka sesi dari backend POS.'
        }
      />
    </>
  );
}
