import { appConfig } from '../config/app';
import {
  normalizeKolamWallet,
  normalizeKolamWalletList,
  normalizeKolamWalletTransaction,
  normalizeKolamWalletTransactionList,
  type KolamWallet,
  type KolamWalletListFilters,
  type KolamWalletTransaction,
  type KolamWalletTxFilters,
  type KolamWalletType,
} from '../domain/kolam-wallet';
import { apiRequest } from '../lib/api-client';
import {
  getKolamWalletOptions,
  getKolamWalletOptionsPaginated,
} from './kolam-wallet-option-api';

export {
  getKolamWalletOptions,
  getKolamWalletOptionsPaginated,
};

export type KolamWalletDepositBody = {
  walletId: string;
  amount: number;
  note?: string;
  proofLocalUris?: string[];
};

export type KolamWalletWithdrawBody = {
  walletId: string;
  amount: number;
  note?: string;
  proofLocalUris?: string[];
};

export type KolamWalletTransferBody = {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  note?: string;
  proofLocalUris?: string[];
};

export async function fetchKolamWalletsAll(): Promise<KolamWallet[]> {
  const payload = await kolamRequest<unknown>('/wallet');
  return normalizeKolamWalletList(payload).items;
}

export async function fetchKolamWalletsPaginated(
  filters: Pick<KolamWalletListFilters, 'page' | 'limit' | 'type'>,
) {
  const payload = await kolamRequest<unknown>('/wallet', {
    query: {
      page: filters.page,
      limit: filters.limit,
      type:
        filters.type && filters.type !== 'all'
          ? (filters.type as KolamWalletType)
          : undefined,
    },
  });
  return normalizeKolamWalletList(payload);
}

export async function fetchKolamWalletById(id: string): Promise<KolamWallet> {
  const payload = await kolamRequest<unknown>(
    `/wallet/${encodeURIComponent(id)}`,
  );
  const row =
    payload && typeof payload === 'object' && 'data' in (payload as object)
      ? (payload as { data: unknown }).data
      : payload;
  return normalizeKolamWallet(row);
}

export async function fetchKolamWalletTransactions(
  filters: Pick<
    KolamWalletTxFilters,
    | 'page'
    | 'limit'
    | 'walletId'
    | 'type'
    | 'source'
    | 'confirmStatus'
    | 'startDate'
    | 'endDate'
  >,
) {
  const payload = await kolamRequest<unknown>('/wallet-transaction', {
    query: {
      page: filters.page,
      limit: filters.limit,
      wallet: filters.walletId?.trim() || undefined,
      type:
        filters.type && filters.type !== 'all' ? filters.type : undefined,
      source:
        filters.source && filters.source !== 'all'
          ? filters.source
          : undefined,
      confirmStatus:
        filters.confirmStatus && filters.confirmStatus !== 'all'
          ? filters.confirmStatus
          : undefined,
      startDate: filters.startDate?.trim() || undefined,
      endDate: filters.endDate?.trim() || undefined,
    },
  });
  return normalizeKolamWalletTransactionList(payload);
}

export async function depositKolamWallet(
  body: KolamWalletDepositBody,
): Promise<KolamWalletTransaction | null> {
  const payload = await kolamRequest<unknown>(
    `/wallet/${encodeURIComponent(body.walletId)}/deposit`,
    {
      method: 'POST',
      body: createWalletMoneyMoveFormData({
        amount: body.amount,
        note: body.note,
        proofLocalUris: body.proofLocalUris,
      }),
    },
  );
  return extractWalletTransaction(payload);
}

export async function withdrawKolamWallet(
  body: KolamWalletWithdrawBody,
): Promise<KolamWalletTransaction | null> {
  const payload = await kolamRequest<unknown>(
    `/wallet/${encodeURIComponent(body.walletId)}/withdraw`,
    {
      method: 'POST',
      body: createWalletMoneyMoveFormData({
        amount: body.amount,
        note: body.note,
        proofLocalUris: body.proofLocalUris,
      }),
    },
  );
  return extractWalletTransaction(payload);
}

export async function transferKolamWallet(
  body: KolamWalletTransferBody,
): Promise<unknown> {
  const formData = createWalletMoneyMoveFormData({
    amount: body.amount,
    note: body.note,
    proofLocalUris: body.proofLocalUris,
  });
  formData.append('fromWalletId', body.fromWalletId);
  formData.append('toWalletId', body.toWalletId);
  return kolamRequest<unknown>('/wallet/transfer', {
    method: 'POST',
    body: formData,
  });
}

export async function confirmKolamWalletTransaction(
  id: string,
  confirmNote?: string,
): Promise<KolamWalletTransaction> {
  const payload = await kolamRequest<unknown>(
    `/wallet-transaction/${encodeURIComponent(id)}/confirm`,
    {
      method: 'PUT',
      body: confirmNote?.trim() ? { confirmNote: confirmNote.trim() } : {},
    },
  );
  const row =
    payload && typeof payload === 'object' && 'data' in (payload as object)
      ? (payload as { data: unknown }).data
      : payload;
  return normalizeKolamWalletTransaction(row);
}

function createWalletMoneyMoveFormData(input: {
  amount: number;
  note?: string;
  proofLocalUris?: string[];
}): FormData {
  const formData = new FormData();
  formData.append('amount', String(input.amount));
  if (input.note?.trim()) {
    formData.append('note', input.note.trim());
  }
  const proofs = (input.proofLocalUris ?? [])
    .map(uri => uri.trim())
    .filter(Boolean)
    .slice(0, 3);
  proofs.forEach((localUri, index) => {
    formData.append(
      'proofs',
      createReactNativeFilePart(
        localUri,
        `wallet-proof-${index + 1}.jpg`,
      ) as unknown as Blob,
    );
  });
  return formData;
}

function createReactNativeFilePart(localUri: string, fallbackName: string) {
  const cleanUri = localUri.trim();
  const fileName =
    cleanUri.split(/[\\/]/).pop()?.split('?')[0]?.trim() || fallbackName;
  return {
    uri: cleanUri,
    name: fileName,
    type: guessMimeType(fileName),
  };
}

function guessMimeType(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.png')) {
    return 'image/png';
  }
  if (lower.endsWith('.webp')) {
    return 'image/webp';
  }
  if (lower.endsWith('.gif')) {
    return 'image/gif';
  }
  if (lower.endsWith('.pdf')) {
    return 'application/pdf';
  }
  return 'image/jpeg';
}

function extractWalletTransaction(payload: unknown): KolamWalletTransaction | null {
  const root = asRecord(payload);
  const data = asRecord(root.data);
  const tx = data.transaction ?? root.transaction ?? data;
  const normalized = normalizeKolamWalletTransaction(tx);
  return normalized.id ? normalized : null;
}

function kolamRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    query?: Record<string, string | number | boolean | undefined | null>;
    body?: unknown;
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

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
