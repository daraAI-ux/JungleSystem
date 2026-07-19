import type {Dispatch, SetStateAction} from 'react';
import type {DashboardCustomerVisitConfirmation} from '../domain/dashboard-customer-visit-confirmations';
import type {Customer, SaleSummary} from '../domain/pos';
import type {UnifiedDataset} from '../services/unified-data';

export function useKolamPosDatasetMutationController({
  onMessage,
  onSelectCustomer,
  setDataset,
}: {
  onMessage: (message: string) => void;
  onSelectCustomer: (customerId: string) => void;
  setDataset: Dispatch<SetStateAction<UnifiedDataset>>;
}) {
  const handleCustomerCreated = (createdCustomer: Customer) => {
    setDataset(current => ({
      ...current,
      customers: [createdCustomer, ...current.customers],
    }));
    onSelectCustomer(createdCustomer.id);
  };

  const handleSaleUpdated = (updatedSale: SaleSummary) => {
    setDataset(current => ({
      ...current,
      recentSales: current.recentSales.map(sale =>
        sale.id === updatedSale.id ? updatedSale : sale,
      ),
    }));
  };

  const handleCustomerVisitConfirm = (
    row: DashboardCustomerVisitConfirmation,
  ) => {
    onMessage(`${row.actionLabel} native membuka ${row.route}.`);
  };

  return {
    handleCustomerCreated,
    handleCustomerVisitConfirm,
    handleSaleUpdated,
  };
}
