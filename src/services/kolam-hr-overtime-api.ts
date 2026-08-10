import {appConfig} from '../config/app';
import {
  normalizeKolamHrOvertimeList,
  type KolamHrOvertimeRow,
} from '../domain/kolam-hr';
import {apiRequest} from '../lib/api-client';

export async function fetchKolamHrOvertimeList(
  status = 'all',
): Promise<KolamHrOvertimeRow[]> {
  const payload = await kolamRequest<unknown>('/overtime', {
    query: status !== 'all' ? {status} : undefined,
  });
  return normalizeKolamHrOvertimeList(payload);
}

export async function reviewKolamHrOvertime(input: {
  id: string;
  action: 'approve' | 'reject';
  reviewNote?: string;
  overtimeUnits?: number;
  amount?: number;
}): Promise<void> {
  await kolamRequest(`/overtime/${encodeURIComponent(input.id)}/review`, {
    method: 'PATCH',
    body: {
      action: input.action,
      ...(input.reviewNote?.trim()
        ? {reviewNote: input.reviewNote.trim()}
        : {}),
      ...(typeof input.overtimeUnits === 'number'
        ? {overtimeUnits: input.overtimeUnits}
        : {}),
      ...(typeof input.amount === 'number' ? {amount: input.amount} : {}),
    },
  });
}

export async function payKolamHrOvertime(input: {
  id: string;
  walletFrom: string;
  note?: string;
}): Promise<void> {
  await kolamRequest(`/overtime/${encodeURIComponent(input.id)}/pay`, {
    method: 'POST',
    body: {
      walletFrom: input.walletFrom,
      note: input.note?.trim() || 'Pembayaran lembur',
    },
  });
}

export async function uploadKolamHrOvertimeProof(input: {
  id: string;
  localUri: string;
  fileName?: string;
  mimeType?: string;
}): Promise<void> {
  const body = new FormData();
  body.append(
    'proof',
    createReactNativeFilePart(
      input.localUri,
      input.fileName || 'overtime-proof',
      input.mimeType,
    ) as unknown as Blob,
  );

  await kolamRequest(
    `/overtime/${encodeURIComponent(input.id)}/transfer-proof`,
    {
      method: 'POST',
      body,
    },
  );
}

function createReactNativeFilePart(
  localUri: string,
  fallbackName: string,
  mimeType?: string,
) {
  const normalizedUri = localUri.startsWith('file://')
    ? localUri
    : `file:///${localUri.replace(/\\/g, '/')}`;
  const name = localUri.split(/[/\\]/).pop() || fallbackName;
  return {
    name,
    type: mimeType || inferFileMimeType(name),
    uri: normalizedUri,
  };
}

function inferFileMimeType(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'pdf':
      return 'application/pdf';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    default:
      return 'image/jpeg';
  }
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
