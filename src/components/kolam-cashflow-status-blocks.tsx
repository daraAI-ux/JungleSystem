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
        primary={activeSession ? 'Open' : 'Closed'}
        secondary={activeSession?.name ?? 'Belum ada session aktif'}
      />
      <KolamInfoBlock
        label="Kasir"
        primary={activeSession?.cashier ?? '-'}
        secondary={
          activeSession
            ? `Opening cash ${formatRupiah(activeSession.openingBalance)}`
            : 'Buka session dari backend POS lama.'
        }
      />
    </>
  );
}
