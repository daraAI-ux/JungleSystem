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
        label="Buka arus kas"
        loadingLabel="Membuka sesi..."
        loading={isOpeningCashflow}
        canRun={canOpen}
        onPress={onOpenCashflow}
      />
      <KolamCashflowActionButton
        label="Tutup arus kas"
        loadingLabel="Menutup sesi..."
        loading={isClosingCashflow}
        canRun={canClose}
        onPress={onCloseCashflow}
      />
    </>
  );
}
