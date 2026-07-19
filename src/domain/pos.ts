export type CatalogItemType = 'product' | 'species';

export type SaleStatus = 'draft' | 'pending' | 'sent' | 'paid' | 'cancelled';

export type DiscountType = 'fixed' | 'percentage';

export interface CatalogItem {
  id: string;
  type: CatalogItemType;
  name: string;
  code: string;
  category: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  labels: string[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  wallet: string;
  active: boolean;
}

export interface CashflowSession {
  id: string;
  name: string;
  openedAt: string;
  openingBalance: number;
  cashier: string;
  snapshot?: CashflowSnapshot;
}

export interface CashflowSnapshot {
  totalSalesCount: number;
  totalSalesAmount: number;
  cashSalesCount: number;
  cashSalesTotal: number;
}

export interface CashflowSalesPreview extends CashflowSnapshot {
  openingCash: number;
}

export interface CartLine {
  itemId: string;
  quantity: number;
  discountType: DiscountType;
  discountAmount: number;
}

export interface SaleSummary {
  id: string;
  invoiceCode: string;
  customerName: string;
  status: SaleStatus;
  total: number;
  paidAmount: number;
  createdAt: string;
  items?: SaleSummaryItem[];
}

export interface SaleSummaryItem {
  itemId: string;
  itemType: CatalogItemType;
  name?: string;
  quantity: number;
  subtotal?: number;
}

export interface CheckoutState {
  customerId: string;
  paymentMethodId: string;
  cart: CartLine[];
  globalDiscount: number;
  globalDiscountType: DiscountType;
  shippingCost: number;
}
