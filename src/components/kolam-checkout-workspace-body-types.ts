import type {
  CartLine,
  CatalogItem,
  CatalogItemType,
  CheckoutState,
  Customer,
  PaymentMethod,
} from '../domain/pos';
import type {WorkflowStep} from '../lib/workflow';

export interface KolamCheckoutWorkspaceBodyProps {
  activeType: CatalogItemType | 'all';
  afterDiscount: number;
  canCreateDraft: boolean;
  catalog: CatalogItem[];
  catalogSearch: string;
  checkout: CheckoutState;
  customers: Customer[];
  filteredCatalog: CatalogItem[];
  finalTotal: number;
  isCreatingSale: boolean;
  onAddToCart: (item: CatalogItem) => void;
  onCatalogSearchChange: (query: string) => void;
  onClearCart: () => void;
  onCreateSaleDraft: () => void;
  onDiscountAmountChange: (itemId: string, value: string) => void;
  onDiscountTypeChange: (
    itemId: string,
    discountType: CartLine['discountType'],
  ) => void;
  onGlobalDiscountChange: (value: string) => void;
  onGlobalDiscountTypeChange: (discountType: CheckoutState['globalDiscountType']) => void;
  onQuantityChange: (itemId: string, nextQuantity: number) => void;
  onSelectCustomer: (customerId: string) => void;
  onSelectPaymentMethod: (methodId: string) => void;
  onShippingCostChange: (value: string) => void;
  onTypeChange: (type: CatalogItemType | 'all') => void;
  paymentMethods: PaymentMethod[];
  selectedCustomer?: Customer;
  selectedPayment?: PaymentMethod;
  subtotal: number;
  workflowSteps: WorkflowStep[];
}
