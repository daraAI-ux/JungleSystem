import { appConfig } from '../config/app';
import { getRuntimeClientHeaders } from '../domain/runtime-client-contract';
import type { KolamFinanceRange } from '../domain/kolam-finance-summary';
import {
  getAccessToken,
  getNativeDeviceIdentity,
} from '../lib/api-client';
import { ApiError } from '../lib/api-error';
import { saveNativeBase64File } from './native-file-saver';

export type KolamAccountingLedgerExportParams = {
  range?: KolamFinanceRange;
  startDate?: string;
  endDate?: string;
};

export async function downloadKolamAccountingLedgerXlsx(
  params: KolamAccountingLedgerExportParams = {},
): Promise<{ path?: string; name: string }> {
  const searchParams = new URLSearchParams();
  if (params.range && params.range !== 'custom') {
    searchParams.set('range', params.range);
  }
  if (params.range === 'custom') {
    searchParams.set('range', 'custom');
    if (params.startDate?.trim()) {
      searchParams.set('startDate', params.startDate.trim());
    }
    if (params.endDate?.trim()) {
      searchParams.set('endDate', params.endDate.trim());
    }
  }

  const base = appConfig.kolamApiBaseUrl.replace(/\/+$/, '');
  const query = searchParams.toString();
  const url = `${base}/accounting-ledger/export.xlsx${query ? `?${query}` : ''}`;
  const headers = buildBinaryHeaders();
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      payload = { message: await response.text() };
    }
    throw new ApiError(response.status, asApiErrorPayload(payload));
  }

  const filename =
    deriveFilenameFromDisposition(
      response.headers.get('content-disposition') ?? undefined,
    ) ?? 'Accounting-Ledger.xlsx';
  const buffer = await response.arrayBuffer();
  const saveResult = await saveNativeBase64File(
    filename,
    arrayBufferToBase64(buffer),
  );

  if (saveResult.cancelled) {
    throw new Error('Export dibatalkan.');
  }

  return {
    name: saveResult.name ?? filename,
    path: saveResult.path,
  };
}

function asApiErrorPayload(payload: unknown) {
  if (payload && typeof payload === 'object') {
    return payload as { message?: string; code?: string };
  }
  return { message: String(payload ?? 'Export gagal') };
}

function buildBinaryHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/octet-stream,*/*',
    ...getRuntimeClientHeaders({ sourceHeader: appConfig.kolamSourceHeader }),
  };
  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const nativeIdentity = getNativeDeviceIdentity();
  const macHeader = nativeIdentity.macAddresses?.join(',');
  if (macHeader) {
    headers['x-device-mac'] = macHeader;
  }
  if (nativeIdentity.macSignature) {
    headers['x-device-mac-signature'] = nativeIdentity.macSignature;
  }

  return headers;
}

function deriveFilenameFromDisposition(value?: string) {
  if (!value) {
    return undefined;
  }
  const utfMatch = /filename\*=UTF-8''([^;]+)/i.exec(value);
  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(utfMatch[1]);
    } catch {
      return utfMatch[1];
    }
  }
  const plainMatch = /filename="?([^";]+)"?/i.exec(value);
  return plainMatch?.[1]?.trim() || undefined;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  const globalBtoa = (globalThis as { btoa?: (data: string) => string }).btoa;
  if (typeof globalBtoa === 'function') {
    return globalBtoa(binary);
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Buffer } = require('buffer') as typeof import('buffer');
  return Buffer.from(bytes).toString('base64');
}
