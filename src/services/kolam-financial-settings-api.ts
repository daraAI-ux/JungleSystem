import { appConfig } from '../config/app';
import { apiRequest } from '../lib/api-client';

type DataResponse<T> = { data: T };
type ListResponse<T> = {
  data: T[];
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
};

export type KolamFinancialPermissionKey =
  | 'payment-methods'
  | 'tax-profile'
  | 'overtime'
  | 'enclosure-commission';

export type KolamPaymentMethodType =
  | 'cash'
  | 'transfer'
  | 'ewallet'
  | 'credit'
  | 'debit'
  | 'qris';

export type KolamPaymentCostType = 'percentage' | 'fixed';

export interface KolamPaymentCost {
  _id?: string;
  name: string;
  type: KolamPaymentCostType;
  amount: number;
}

export interface KolamPaymentWallet {
  id: string;
  name: string;
  type: string;
}

export interface KolamPaymentMethod {
  id: string;
  name: string;
  type: KolamPaymentMethodType;
  provider: string;
  accountNumber: string;
  accountName: string;
  notes: string;
  paymentIcon: string;
  wallet: KolamPaymentWallet | null;
  isActive: boolean;
  isAvailableOnWebstore: boolean;
  requireSaleProof: boolean;
  costs: KolamPaymentCost[];
}

export interface KolamPaymentMethodListParams {
  page?: number;
  limit?: number;
  search?: string;
  isAvailableOnWebstore?: boolean | '';
}

export interface KolamPaymentMethodListResponse {
  rows: KolamPaymentMethod[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface KolamPaymentMethodSaveBody {
  name: string;
  type: KolamPaymentMethodType;
  provider: string;
  wallet: string;
  accountNumber: string;
  accountName: string;
  notes?: string;
  isActive?: boolean;
  isAvailableOnWebstore?: boolean;
  requireSaleProof?: boolean;
  costs?: KolamPaymentCost[];
}

export interface KolamFinancialWallet {
  id: string;
  name: string;
  type: string;
  provider: string;
}

export interface KolamTaxRegisteredAddress {
  complete?: boolean;
  companyName?: string;
  addressText?: string;
  phone?: string;
  email?: string;
  originAddress?: {
    addressLine1?: string;
    city?: string;
    province?: string;
    postalCode?: string;
  };
}

export interface KolamTaxCompanyProfile {
  _id?: string;
  companyName?: string;
  legalName?: string;
  npwp?: string;
  npwp16?: string;
  nik?: string;
  isPkp?: boolean;
  pkpCertificateNumber?: string;
  taxpayerType?: 'umkm' | 'cv' | 'pt' | 'perorangan' | 'other';
  umkmScheme?: 'none' | 'pp_55_2022' | 'other';
  taxOffice?: string;
  defaultPpnRate?: number;
  pricesIncludeTax?: boolean;
  notes?: string;
  registeredAddress?: KolamTaxRegisteredAddress;
  completeness?: { complete: boolean; missing: string[] };
  updatedAt?: string;
}

export interface KolamTaxPartyGapRow {
  partyType: string;
  partyId: string;
  name: string;
  email?: string;
  npwp?: string;
  npwp16?: string;
}

export interface KolamTaxPartyGapsSummary {
  vendorTotal: number;
  vendorWithNpwp: number;
  vendorsMissing: number;
  customerTotal: number;
  customerWithNpwp: number;
  customersMissing: number;
  vendorsMissingSample: KolamTaxPartyGapRow[];
  customersMissingSample?: KolamTaxPartyGapRow[];
}

export async function getKolamPaymentMethods(
  params: KolamPaymentMethodListParams = {},
): Promise<KolamPaymentMethodListResponse> {
  const response = await kolamRequest<ListResponse<unknown>>('/payment-method', {
    query: {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      search: params.search?.trim() || undefined,
      isAvailableOnWebstore:
        params.isAvailableOnWebstore === ''
          ? undefined
          : params.isAvailableOnWebstore,
    },
  });

  return {
    rows: (response.data ?? []).map(normalizePaymentMethod),
    pagination: {
      total: response.pagination?.total ?? response.data?.length ?? 0,
      page: response.pagination?.page ?? params.page ?? 1,
      limit: response.pagination?.limit ?? params.limit ?? 10,
      totalPages: response.pagination?.totalPages ?? 1,
    },
  };
}

export async function createKolamPaymentMethod(
  body: KolamPaymentMethodSaveBody,
): Promise<KolamPaymentMethod> {
  const response = await kolamRequest<unknown>('/payment-method', {
    method: 'POST',
    body,
  });
  return normalizePaymentMethod(unwrapData(response));
}

export async function updateKolamPaymentMethod(
  id: string,
  body: Partial<KolamPaymentMethodSaveBody>,
): Promise<KolamPaymentMethod> {
  const response = await kolamRequest<unknown>(
    `/payment-method/${encodeURIComponent(id)}`,
    { method: 'PUT', body },
  );
  return normalizePaymentMethod(unwrapData(response));
}

export async function deleteKolamPaymentMethod(id: string): Promise<void> {
  await kolamRequest<unknown>(`/payment-method/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function uploadKolamPaymentMethodPhoto(
  id: string,
  localUri: string,
): Promise<void> {
  const body = new FormData();
  body.append('photo', createReactNativeFilePart(localUri) as unknown as Blob);
  await kolamRequest<unknown>(
    `/payment-method/${encodeURIComponent(id)}/upload-photo`,
    { method: 'POST', body },
  );
}

export async function deleteKolamPaymentMethodPhoto(id: string): Promise<void> {
  await kolamRequest<unknown>(
    `/payment-method/${encodeURIComponent(id)}/delete-photo`,
    { method: 'DELETE' },
  );
}

export async function getKolamFinancialWallets(): Promise<
  KolamFinancialWallet[]
> {
  const response = await kolamRequest<ListResponse<unknown> | unknown[]>(
    '/wallet',
  );
  const rows = Array.isArray(response)
    ? response
    : Array.isArray(response.data)
    ? response.data
    : [];
  return rows.map(normalizeFinancialWallet);
}

export async function getKolamTaxCompanyProfile(): Promise<KolamTaxCompanyProfile> {
  const response = await kolamRequest<DataResponse<KolamTaxCompanyProfile>>(
    '/dara-tax/company-profile',
  );
  return response.data ?? {};
}

export async function updateKolamTaxCompanyProfile(
  body: Partial<KolamTaxCompanyProfile>,
): Promise<KolamTaxCompanyProfile> {
  const response = await kolamRequest<DataResponse<KolamTaxCompanyProfile>>(
    '/dara-tax/company-profile',
    { method: 'PUT', body },
  );
  return response.data ?? {};
}

export async function getKolamTaxPartyGaps(): Promise<KolamTaxPartyGapsSummary> {
  const response = await kolamRequest<DataResponse<KolamTaxPartyGapsSummary>>(
    '/dara-tax/party-profiles/gaps',
  );
  return (
    response.data ?? {
      vendorTotal: 0,
      vendorWithNpwp: 0,
      vendorsMissing: 0,
      customerTotal: 0,
      customerWithNpwp: 0,
      customersMissing: 0,
      vendorsMissingSample: [],
    }
  );
}

function kolamRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    query?: Record<string, string | number | boolean | undefined>;
  } = {},
) {
  return apiRequest<T>({
    method: options.method ?? 'GET',
    path,
    query: options.query,
    body: options.body,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });
}

function normalizePaymentMethod(value: unknown): KolamPaymentMethod {
  const item = isRecord(value) ? value : {};
  const wallet = item.wallet;

  return {
    id: String(item._id ?? item.id ?? ''),
    name: String(item.name ?? ''),
    type: normalizePaymentMethodType(item.type),
    provider: String(item.provider ?? ''),
    accountNumber: String(item.accountNumber ?? ''),
    accountName: String(item.accountName ?? ''),
    notes: String(item.notes ?? ''),
    paymentIcon: String(item.paymentIcon ?? ''),
    wallet: isRecord(wallet)
      ? {
          id: String(wallet._id ?? wallet.id ?? ''),
          name: String(wallet.name ?? ''),
          type: String(wallet.type ?? ''),
        }
      : wallet
      ? { id: String(wallet), name: String(wallet), type: '' }
      : null,
    isActive: item.isActive !== false,
    isAvailableOnWebstore: item.isAvailableOnWebstore !== false,
    requireSaleProof: item.requireSaleProof === true,
    costs: Array.isArray(item.costs)
      ? item.costs.map(cost => normalizePaymentCost(cost))
      : [],
  };
}

function normalizePaymentCost(value: unknown): KolamPaymentCost {
  const item = isRecord(value) ? value : {};
  return {
    _id: item._id ? String(item._id) : undefined,
    name: String(item.name ?? ''),
    type: item.type === 'fixed' ? 'fixed' : 'percentage',
    amount: Number(item.amount ?? 0),
  };
}

function normalizeFinancialWallet(value: unknown): KolamFinancialWallet {
  const item = isRecord(value) ? value : {};
  return {
    id: String(item._id ?? item.id ?? ''),
    name: String(item.name ?? ''),
    type: String(item.type ?? ''),
    provider: String(item.provider ?? ''),
  };
}

function normalizePaymentMethodType(value: unknown): KolamPaymentMethodType {
  return value === 'transfer' ||
    value === 'ewallet' ||
    value === 'credit' ||
    value === 'debit' ||
    value === 'qris'
    ? value
    : 'cash';
}

function unwrapData(value: unknown) {
  return isRecord(value) && 'data' in value ? value.data : value;
}

function createReactNativeFilePart(localUri: string) {
  const normalizedUri = localUri.startsWith('file://')
    ? localUri
    : `file:///${localUri.replace(/\\/g, '/')}`;
  const name = normalizedUri.split('/').pop() || 'payment-method.jpg';

  return {
    uri: normalizedUri,
    name,
    type: inferImageMimeType(name),
  };
}

function inferImageMimeType(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'jpg':
    case 'jpeg':
    default:
      return 'image/jpeg';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}
