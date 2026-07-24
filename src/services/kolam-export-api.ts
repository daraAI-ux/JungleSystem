import { appConfig } from '../config/app';
import { getRuntimeClientHeaders } from '../domain/runtime-client-contract';
import {
  apiRequest,
  getAccessToken,
  getNativeDeviceIdentity,
} from '../lib/api-client';
import { ApiError } from '../lib/api-error';
import { saveNativeBase64File } from './native-file-saver';

export type KolamExportFieldLevel = 'doc' | 'variant' | 'both';
export type KolamExportMode = 'doc' | 'variant';

export interface KolamExportField {
  key: string;
  header: string;
  group: string;
  level: KolamExportFieldLevel;
  heavy?: boolean;
  meta?: Record<string, unknown>;
}

export interface KolamExportCatalog {
  resource: string;
  type?: string;
  fields: KolamExportField[];
  presets: Record<string, string[]>;
  modes: KolamExportMode[];
  maxRows: number;
}

export interface KolamGroupedExportFields {
  group: string;
  fields: KolamExportField[];
}

export interface KolamExportDownloadArgs {
  endpoint: string;
  fields: string[];
  mode: KolamExportMode;
  filenameHint: string;
  extraParams?: Record<
    string,
    string | number | boolean | string[] | undefined
  >;
  limit?: number;
}

interface DataResponse<T> {
  success?: boolean;
  data?: T;
}

export async function fetchKolamExportCatalog({
  endpoint,
  params,
}: {
  endpoint: string;
  params?: Record<string, string | number | boolean | undefined>;
}): Promise<KolamExportCatalog> {
  const response = await apiRequest<DataResponse<KolamExportCatalog>>({
    path: endpoint,
    query: params,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });

  if (!response?.data) {
    throw new Error('Gagal memuat katalog field export.');
  }

  return response.data;
}

export async function downloadKolamXlsxExport({
  endpoint,
  fields,
  filenameHint,
  mode,
  extraParams,
  limit,
}: KolamExportDownloadArgs): Promise<{ path?: string; name: string }> {
  const url = buildKolamExportUrl(endpoint, {
    fields: fields.join(','),
    mode,
    limit,
    ...extraParams,
  });
  const headers = buildKolamBinaryHeaders();
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const payload = await readExportErrorPayload(response);
    throw new ApiError(response.status, payload);
  }

  const filename =
    deriveFilenameFromDisposition(
      response.headers.get('content-disposition') ?? undefined,
    ) ?? buildExportFilename(filenameHint);
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

export function groupKolamExportFields(
  fields: KolamExportField[],
): KolamGroupedExportFields[] {
  const groups = new Map<string, KolamExportField[]>();
  for (const field of fields) {
    const current = groups.get(field.group);
    if (current) {
      current.push(field);
    } else {
      groups.set(field.group, [field]);
    }
  }

  return Array.from(groups.entries()).map(([group, groupFields]) => ({
    group,
    fields: groupFields,
  }));
}

function buildKolamExportUrl(
  endpoint: string,
  params: Record<
    string,
    string | number | boolean | string[] | undefined | null
  >,
) {
  const cleanBase = appConfig.kolamApiBaseUrl.replace(/\/$/, '');
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = new URL(`${cleanBase}${cleanPath}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(item => {
        if (item !== undefined && item !== '') {
          url.searchParams.append(`${key}[]`, String(item));
        }
      });
      return;
    }

    url.searchParams.append(key, String(value));
  });

  return url.toString();
}

function buildKolamBinaryHeaders() {
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

async function readExportErrorPayload(response: Response) {
  const text = await response.text();
  if (!text) {
    return { message: 'Export gagal.' };
  }

  try {
    const parsed = JSON.parse(text) as { message?: string; error?: string };
    return {
      message: parsed.message ?? parsed.error ?? 'Export gagal.',
    };
  } catch {
    return { message: text };
  }
}

function buildExportFilename(hint: string) {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
    now.getDate(),
  )}_${pad(now.getHours())}${pad(now.getMinutes())}`;
  const safe = hint.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${safe}_${stamp}.xlsx`;
}

function deriveFilenameFromDisposition(header: string | undefined) {
  if (!header) {
    return null;
  }

  const match = /filename="?([^";]+)"?/i.exec(header);
  return match?.[1] ?? null;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  const nativeBtoa = (globalThis as { btoa?: (value: string) => string }).btoa;
  if (typeof nativeBtoa === 'function') {
    return nativeBtoa(binary);
  }

  return encodeBase64Binary(binary);
}

function encodeBase64Binary(binary: string) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';

  for (let index = 0; index < binary.length; index += 3) {
    const chr1 = binary.charCodeAt(index);
    const chr2 = binary.charCodeAt(index + 1);
    const chr3 = binary.charCodeAt(index + 2);
    const enc1 = chr1 >> 2;
    const enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    const enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    const enc4 = chr3 & 63;

    output +=
      chars.charAt(enc1) +
      chars.charAt(enc2) +
      (Number.isNaN(chr2) ? '=' : chars.charAt(enc3)) +
      (Number.isNaN(chr3) ? '=' : chars.charAt(enc4));
  }

  return output;
}
