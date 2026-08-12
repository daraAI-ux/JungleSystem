import {appConfig} from '../config/app';
import {
  activeCashflowSession,
  catalogItems,
  customers,
  paymentMethods,
  recentSales,
} from '../data/seed';
import type {
  CashflowSession,
  CatalogItem,
  Customer,
  PaymentMethod,
  SaleSummary,
} from '../domain/pos';
import {getErrorMessage} from '../lib/api-error';
import {
  getActiveCashflowSession,
  getCustomers,
  getPaymentMethods,
  getRecentSales,
  getSellableCatalog,
} from './pos-api';

export interface PosDataset {
  catalog: CatalogItem[];
  customers: Customer[];
  paymentMethods: PaymentMethod[];
  activeSession: CashflowSession | null;
  recentSales: SaleSummary[];
  source: 'seed' | 'live' | 'fallback';
  errorMessage?: string;
}

export const seedDataset: PosDataset = {
  catalog: catalogItems,
  customers,
  paymentMethods,
  activeSession: activeCashflowSession,
  recentSales,
  source: 'seed',
};

export async function loadPosDataset(
  options: {preferLiveApi?: boolean} = {},
): Promise<PosDataset> {
  const preferLiveApi = options.preferLiveApi ?? appConfig.preferLiveApi;

  if (!preferLiveApi) {
    return seedDataset;
  }

  const [catalog, customerList, methods, activeSession, sales] =
    await Promise.allSettled([
      getSellableCatalog(),
      getCustomers(),
      getPaymentMethods(),
      getActiveCashflowSession(),
      getRecentSales(),
    ]);
  const errors = [catalog, customerList, methods, activeSession, sales]
    .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
    .map(result => getErrorMessage(result.reason))
    .filter(Boolean);

  return {
    catalog:
      catalog.status === 'fulfilled' ? catalog.value : seedDataset.catalog,
    customers:
      customerList.status === 'fulfilled'
        ? customerList.value
        : seedDataset.customers,
    paymentMethods:
      methods.status === 'fulfilled'
        ? methods.value.filter(method => method.active)
        : seedDataset.paymentMethods,
    activeSession:
      activeSession.status === 'fulfilled'
        ? activeSession.value
        : seedDataset.activeSession,
    recentSales:
      sales.status === 'fulfilled' ? sales.value : seedDataset.recentSales,
    source: errors.length ? 'fallback' : 'live',
    errorMessage: errors[0],
  };
}
