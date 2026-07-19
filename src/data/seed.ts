import type {
  CashflowSession,
  CatalogItem,
  CheckoutState,
  Customer,
  PaymentMethod,
  SaleSummary,
} from '../domain/pos';

export const catalogItems: CatalogItem[] = [
  {
    id: 'product-filter-sponge',
    type: 'product',
    name: 'Sponge Filter Medium',
    code: 'PRD-FLT-001',
    category: 'Peralatan',
    price: 45000,
    stock: 18,
    lowStockThreshold: 6,
    labels: ['sellable', 'fast-moving'],
  },
  {
    id: 'product-mineral',
    type: 'product',
    name: 'Mineral Buffer 250g',
    code: 'PRD-WTR-014',
    category: 'Water Care',
    price: 78000,
    stock: 9,
    lowStockThreshold: 5,
    labels: ['sellable'],
  },
  {
    id: 'species-anemone',
    type: 'species',
    name: 'Bubble Tip Anemone',
    code: 'SPC-BTA-002',
    category: 'Species',
    price: 325000,
    stock: 4,
    lowStockThreshold: 2,
    labels: ['sellable', 'live-stock'],
  },
  {
    id: 'species-clownfish',
    type: 'species',
    name: 'Amphiprion ocellaris',
    code: 'SPC-CLOWN-011',
    category: 'Species',
    price: 185000,
    stock: 12,
    lowStockThreshold: 4,
    labels: ['sellable', 'live-stock'],
  },
];

export const customers: Customer[] = [
  {
    id: 'cust-walkin',
    name: 'Walk-in Customer',
    phone: '-',
    email: '-',
    address: 'Toko Dunia Anura',
  },
  {
    id: 'cust-raja',
    name: 'Raja Anemon',
    phone: '0812-0000-1122',
    email: 'raja@example.com',
    address: 'Jakarta Selatan',
  },
];

export const paymentMethods: PaymentMethod[] = [
  {
    id: 'pay-cash',
    name: 'Cash',
    wallet: 'Kas Toko',
    active: true,
  },
  {
    id: 'pay-transfer',
    name: 'Bank Transfer',
    wallet: 'BCA Operasional',
    active: true,
  },
];

export const activeCashflowSession: CashflowSession = {
  id: 'cashflow-today',
  name: 'Daily Cashflow',
  openedAt: '2026-07-11T09:00:00+07:00',
  openingBalance: 750000,
  cashier: 'Kasir Dunia Anura',
};

export const recentSales: SaleSummary[] = [
  {
    id: 'sale-001',
    invoiceCode: 'POS-20260711-001',
    customerName: 'Raja Anemon',
    status: 'paid',
    total: 510000,
    paidAmount: 510000,
    createdAt: '2026-07-11T10:24:00+07:00',
    items: [
      {
        itemId: 'species-anemone',
        itemType: 'species',
        name: 'Bubble Tip Anemone',
        quantity: 1,
        subtotal: 325000,
      },
      {
        itemId: 'species-clownfish',
        itemType: 'species',
        name: 'Amphiprion ocellaris',
        quantity: 1,
        subtotal: 185000,
      },
    ],
  },
  {
    id: 'sale-002',
    invoiceCode: 'POS-20260711-002',
    customerName: 'Walk-in Customer',
    status: 'pending',
    total: 123000,
    paidAmount: 0,
    createdAt: '2026-07-11T11:08:00+07:00',
    items: [
      {
        itemId: 'product-filter-sponge',
        itemType: 'product',
        name: 'Sponge Filter Medium',
        quantity: 2,
        subtotal: 90000,
      },
      {
        itemId: 'product-mineral',
        itemType: 'product',
        name: 'Mineral Buffer 250g',
        quantity: 1,
        subtotal: 78000,
      },
    ],
  },
];

export const initialCheckoutState: CheckoutState = {
  customerId: customers[0].id,
  paymentMethodId: paymentMethods[0].id,
  cart: [
    {
      itemId: catalogItems[0].id,
      quantity: 1,
      discountType: 'fixed',
      discountAmount: 0,
    },
    {
      itemId: catalogItems[2].id,
      quantity: 1,
      discountType: 'fixed',
      discountAmount: 0,
    },
  ],
  globalDiscount: 0,
  globalDiscountType: 'fixed',
  shippingCost: 0,
};
