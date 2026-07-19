import React from 'react';
import type {CashflowSalesPreview, CashflowSession} from '../domain/pos';
import {KolamModulePanel} from './kolam-surface-widgets';
import {KolamCashflowActions} from './kolam-cashflow-actions';
import {KolamCashflowSessionBody} from './kolam-cashflow-session-body';
import {KolamCashflowStatusBlocks} from './kolam-cashflow-status-blocks';

export function KolamCashflowModule({
  activeSession,
  cashflowPreview,
  cashflowShiftName,
  canClose,
  canOpen,
  isClosingCashflow,
  isLoadingCashflowPreview,
  isOpeningCashflow,
  onCashflowShiftNameChange,
  onCloseCashflow,
  onOpenCashflow,
}: {
  activeSession: CashflowSession | null;
  cashflowPreview: CashflowSalesPreview | null;
  cashflowShiftName: string;
  canClose: boolean;
  canOpen: boolean;
  isClosingCashflow: boolean;
  isLoadingCashflowPreview: boolean;
  isOpeningCashflow: boolean;
  onCashflowShiftNameChange: (value: string) => void;
  onCloseCashflow: () => void;
  onOpenCashflow: () => void;
}) {
  return (
    <KolamModulePanel
      title="Cashflow"
      hint="Sale draft backend menolak transaksi jika tidak ada session open.">
      <KolamCashflowStatusBlocks activeSession={activeSession} />
      <KolamCashflowSessionBody
        activeSession={activeSession}
        cashflowPreview={cashflowPreview}
        cashflowShiftName={cashflowShiftName}
        isLoadingCashflowPreview={isLoadingCashflowPreview}
        onCashflowShiftNameChange={onCashflowShiftNameChange}
      />
      <KolamCashflowActions
        canClose={canClose}
        canOpen={canOpen}
        isClosingCashflow={isClosingCashflow}
        isOpeningCashflow={isOpeningCashflow}
        onCloseCashflow={onCloseCashflow}
        onOpenCashflow={onOpenCashflow}
      />
    </KolamModulePanel>
  );
}
