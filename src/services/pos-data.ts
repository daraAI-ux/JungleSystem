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
  source: 'seed' | 'live';
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

  try {
    const [catalog, customerList, methods, activeSession, sales] =
      await Promise.all([
        getSellableCatalog(),
        getCustomers(),
        getPaymentMethods(),
        getActiveCashflowSession(),
        getRecentSales(),
      ]);

    return {
      catalog,
      customers: customerList,
      paymentMethods: methods.filter(method => method.active),
      activeSession,
      recentSales: sales,
      source: 'live',
    };
  } catch (error) {
    return {
      ...seedDataset,
      errorMessage: getErrorMessage(error),
    };
  }
}

