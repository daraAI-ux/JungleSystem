import React from 'react';
import {KolamCashflowActionButton} from './kolam-cashflow-action-button';

export function KolamCashflowActions({
  canClose,
  canOpen,
  isClosingCashflow,
  isOpeningCashflow,
  onCloseCashflow,
  onOpenCashflow,
}: {
  canClose: boolean;
  canOpen: boolean;
  isClosingCashflow: boolean;
  isOpeningCashflow: boolean;
  onCloseCashflow: () => void;
  onOpenCashflow: () => void;
}) {
  return (
    <>
      <KolamCashflowActionButton
        label="Open cashflow"
        loadingLabel="Membuka session..."
        loading={isOpeningCashflow}
        canRun={canOpen}
        onPress={onOpenCashflow}
      />
      <KolamCashflowActionButton
        label="Close cashflow"
        loadingLabel="Menutup session..."
        loading={isClosingCashflow}
        canRun={canClose}
        onPress={onCloseCashflow}
      />
    </>
  );
}
