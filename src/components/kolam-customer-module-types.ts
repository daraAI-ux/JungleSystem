import type {Customer} from '../domain/pos';
import type {CreateCustomerBody} from '../services/pos-api';

export interface KolamCustomerModuleProps {
  customerForm: CreateCustomerBody;
  customers: Customer[];
  isCreatingCustomer: boolean;
  onCreateCustomer: () => void;
  onCustomerFormChange: (nextForm: CreateCustomerBody) => void;
}
