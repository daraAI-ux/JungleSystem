import type {
  CashflowSession,
  CashflowSalesPreview,
  CashflowSnapshot,
  CatalogItem,
  Customer,
  PaymentMethod,
  SaleSummary,
} from '../domain/pos';
import {apiGet, apiPost, apiRequest} from '../lib/api-client';

interface ListResponse<T> {
  data: T[];
}

interface DataResponse<T> {
  data: T;
}

interface BackendProduct {
  _id: string;
  name: string;
  sku?: string;
  productCode?: string;
  category?: string | {name?: string};
  price?: number;
  price_to_sell?: number;
  stock?: number;
  lowStockThreshold?: number;
  labels?: string[];
}

interface BackendSpecies {
  _id: string;
  localName?: string;
  commonName?: string;
  scientificName?: string;
  sku?: string;
  productCode?: string;
  price?: number;
  price_to_sell?: number;
  stock?: number;
  lowStockThreshold?: number;
  labels?: string[];
}

interface BackendCustomer {
  _id: string;
  name: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

interface BackendPaymentMethod {
  _id: string;
  name: string;
  wallet?: string | {name?: string};
  isActive?: boolean;
}

interface BackendCashflowSession {
  _id: string;
  name?: string;
  openedAt: string;
  openingCash?: number;
  snapshot?: CashflowSnapshot;
  openedBy?: {
    first_name?: string;
    last_name?: string;
    username?: string;
  };
}

interface BackendSale {
  _id: string;
  invoiceCode: string;
  customer?: string | {name?: string} | null;
  buyerInfo?: {name?: string} | null;
  status: string;
  finalTotal?: number;
  total?: number;
  paidAmount?: number;
  paid?: number;
  createdAt: string;
  items?: BackendSaleItem[];
}

interface BackendSaleItem {
  product?: string | {_id?: string; name?: string} | null;
  species?: string | {_id?: string; localName?: string; commonName?: string; scientificName?: string} | null;
  itemType?: 'product' | 'species' | string;
  quantity?: number;
  subtotal?: number;
  total?: number;
}

export async function getSellableCatalog(): Promise<CatalogItem[]> {
  const [products, species] = await Promise.all([
    apiGet<ListResponse<BackendProduct>>('/products', {
      page: 1,
      limit: 50,
      type: 'product',
      status: 'active',
      sellable: true,
    }),
    apiGet<ListResponse<BackendSpecies>>('/species', {
      page: 1,
      limit: 50,
      sellable: true,
      sort: 'scientificName:asc',
    }),
  ]);

  return [...products.data.map(mapProduct), ...species.data.map(mapSpecies)];
}

export async function getCustomers(): Promise<Customer[]> {
  const response = await apiGet<ListResponse<BackendCustomer>>('/customer', {
    page: 1,
    limit: 25,
  });

  return response.data.map(mapCustomer);
}

export interface CreateCustomerBody {
  name: string;
  gender: 'male' | 'female' | 'other' | string;
  address: string;
  phone: string;
  email: string;
  notes?: string;
}

export async function createCustomer(
  body: CreateCustomerBody,
): Promise<Customer> {
  const response = await apiPost<DataResponse<BackendCustomer>>(
    '/customer',
    body,
  );

  return mapCustomer(response.data);
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const response = await apiGet<ListResponse<BackendPaymentMethod>>(
    '/payment-method',
    {
      page: 1,
      limit: 50,
    },
  );

  return response.data.map(method => ({
    id: method._id,
    name: method.name,
    wallet:
      typeof method.wallet === 'object'
        ? method.wallet?.name ?? '-'
        : method.wallet ?? '-',
    active: method.isActive ?? true,
  }));
}

export async function getActiveCashflowSession(): Promise<CashflowSession | null> {
  const response =
    await apiGet<DataResponse<BackendCashflowSession | null>>(
      '/pos/cashflow/active',
    );

  if (!response.data) {
    return null;
  }

  return mapCashflowSession(response.data);
}

export async function getRecentSales(): Promise<SaleSummary[]> {
  const response = await apiGet<ListResponse<BackendSale>>('/sales', {
    page: 1,
    limit: 10,
  });

  return response.data.map(mapSale);
}

export async function getCashflowSalesPreview(
  sessionId: string,
): Promise<CashflowSalesPreview> {
  const response = await apiGet<DataResponse<CashflowSalesPreview>>(
    `/pos/cashflow/${sessionId}/sales-preview`,
  );

  return response.data;
}

export interface CreateSaleDraftBody {
  customer: string;
  paymentMethod: string;
  channel: 'pos';
  shippingCost: number;
  discount: number;
  discountType: 'fixed' | 'percentage';
  sourceRef?: string;
  items: Array<{
    itemType: 'product' | 'species';
    product?: string;
    species?: string;
    quantity: number;
    discount: {
      type: 'fixed' | 'percentage';
      amount: number;
    };
  }>;
}

export async function createSaleDraft(body: CreateSaleDraftBody) {
  return apiPost<DataResponse<BackendSale>>('/sales', body);
}

export async function updateSaleStatus(
  id: string,
  status: SaleSummary['status'],
): Promise<SaleSummary> {
  const response = await apiRequest<DataResponse<BackendSale>>({
    method: 'PUT',
    path: `/sales/${id}/status`,
    body: {status},
  });

  return mapSale(response.data);
}

export interface OpenCashflowSessionBody {
  name?: string;
}

export async function openCashflowSession(body: OpenCashflowSessionBody = {}) {
  const response = await apiPost<DataResponse<BackendCashflowSession>>(
    '/pos/cashflow/open',
    body,
  );

  return mapCashflowSession(response.data);
}

export async function closeCashflowSession(sessionId: string) {
  const response = await apiPost<DataResponse<BackendCashflowSession>>(
    `/pos/cashflow/${sessionId}/close`,
  );

  return mapCashflowSession(response.data);
}

function mapProduct(product: BackendProduct): CatalogItem {
  return {
    id: product._id,
    type: 'product',
    name: product.name,
    code: product.productCode ?? product.sku ?? '-',
    category:
      typeof product.category === 'object'
        ? product.category?.name ?? 'Product'
        : 'Product',
    price: product.price_to_sell ?? product.price ?? 0,
    stock: product.stock ?? 0,
    lowStockThreshold: product.lowStockThreshold ?? 0,
    labels: product.labels ?? [],
  };
}

function mapCustomer(customer: BackendCustomer): Customer {
  return {
    id: customer._id,
    name: customer.name,
    phone: customer.phone ?? '-',
    email: customer.email ?? '-',
    address: customer.address ?? '-',
  };
}

function mapSpecies(species: BackendSpecies): CatalogItem {
  return {
    id: species._id,
    type: 'species',
    name:
      species.localName ??
      species.commonName ??
      species.scientificName ??
      'Unnamed species',
    code: species.productCode ?? species.sku ?? '-',
    category: 'Species',
    price: species.price_to_sell ?? species.price ?? 0,
    stock: species.stock ?? 0,
    lowStockThreshold: species.lowStockThreshold ?? 0,
    labels: species.labels ?? [],
  };
}

function mapCashflowSession(session: BackendCashflowSession): CashflowSession {
  const openedBy = session.openedBy;
  const cashier = [openedBy?.first_name, openedBy?.last_name]
    .filter(Boolean)
    .join(' ');

  return {
    id: session._id,
    name: session.name ?? 'Daily Cashflow',
    openedAt: session.openedAt,
    openingBalance: session.openingCash ?? 0,
    snapshot: session.snapshot,
    cashier: cashier || openedBy?.username || '-',
  };
}

function getCustomerName(sale: BackendSale): string {
  if (sale.customer && typeof sale.customer === 'object' && sale.customer.name) {
    return sale.customer.name;
  }

  return sale.buyerInfo?.name ?? 'Customer';
}

function mapSale(sale: BackendSale): SaleSummary {
  return {
    id: sale._id,
    invoiceCode: sale.invoiceCode,
    customerName: getCustomerName(sale),
    status: normalizeSaleStatus(sale.status),
    total: sale.finalTotal ?? sale.total ?? 0,
    paidAmount: sale.paidAmount ?? sale.paid ?? 0,
    createdAt: sale.createdAt,
    items: sale.items?.map(mapSaleItem).filter(Boolean) as SaleSummary['items'],
  };
}

function mapSaleItem(item: BackendSaleItem): NonNullable<SaleSummary['items']>[number] | null {
  const productId = getEntityId(item.product);
  const speciesId = getEntityId(item.species);
  const itemType = item.itemType === 'species' || speciesId ? 'species' : 'product';
  const itemId = itemType === 'species' ? speciesId : productId;

  if (!itemId) {
    return null;
  }

  return {
    itemId,
    itemType,
    name:
      itemType === 'species'
        ? getSpeciesName(item.species)
        : getEntityName(item.product),
    quantity: item.quantity ?? 1,
    subtotal: item.subtotal ?? item.total,
  };
}

function getEntityId(entity?: string | {_id?: string} | null) {
  return typeof entity === 'string' ? entity : entity?._id;
}

function getEntityName(entity?: string | {name?: string} | null) {
  return typeof entity === 'object' ? entity?.name : undefined;
}

function getSpeciesName(
  entity?:
    | string
    | {localName?: string; commonName?: string; scientificName?: string}
    | null,
) {
  if (typeof entity !== 'object') {
    return undefined;
  }

  return entity?.localName ?? entity?.commonName ?? entity?.scientificName;
}

function normalizeSaleStatus(status: string): SaleSummary['status'] {
  if (
    status === 'draft' ||
    status === 'pending' ||
    status === 'sent' ||
    status === 'paid' ||
    status === 'cancelled'
  ) {
    return status;
  }

  return 'draft';
}
