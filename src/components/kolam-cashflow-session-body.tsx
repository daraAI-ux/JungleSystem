import React from 'react';
import type {CashflowSalesPreview, CashflowSession} from '../domain/pos';
import {KolamCashflowClosePreview} from './kolam-cashflow-close-preview';
import {KolamCashflowOpenForm} from './kolam-cashflow-open-form';

export function KolamCashflowSessionBody({
  activeSession,
  cashflowPreview,
  cashflowShiftName,
  isLoadingCashflowPreview,
  onCashflowShiftNameChange,
}: {
  activeSession: CashflowSession | null;
  cashflowPreview: CashflowSalesPreview | null;
  cashflowShiftName: string;
  isLoadingCashflowPreview: boolean;
  onCashflowShiftNameChange: (value: string) => void;
}) {
  return activeSession ? (
    <KolamCashflowClosePreview
      cashflowPreview={cashflowPreview}
      isLoadingCashflowPreview={isLoadingCashflowPreview}
    />
  ) : (
    <KolamCashflowOpenForm
      cashflowShiftName={cashflowShiftName}
      onCashflowShiftNameChange={onCashflowShiftNameChange}
    />
  );
}
