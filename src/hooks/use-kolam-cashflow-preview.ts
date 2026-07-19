import {useEffect, useState} from 'react';
import type {AppModule} from '../domain/app-shell';
import type {
  CashflowSalesPreview,
  CashflowSession,
} from '../domain/pos';
import {getCashflowSalesPreview} from '../services/pos-api';

export function useKolamCashflowPreview({
  activeModule,
  activeSession,
}: {
  activeModule: AppModule;
  activeSession: CashflowSession | null;
}) {
  const [cashflowPreview, setCashflowPreview] =
    useState<CashflowSalesPreview | null>(null);
  const [isLoadingCashflowPreview, setIsLoadingCashflowPreview] =
    useState(false);

  useEffect(() => {
    if (activeModule !== 'cashflow' || !activeSession) {
      setCashflowPreview(null);
      return;
    }

    let isMounted = true;

    setIsLoadingCashflowPreview(true);
    getCashflowSalesPreview(activeSession.id)
      .then(preview => {
        if (isMounted) {
          setCashflowPreview(preview);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCashflowPreview(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingCashflowPreview(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeModule, activeSession]);

  return {
    cashflowPreview,
    isLoadingCashflowPreview,
  };
}
