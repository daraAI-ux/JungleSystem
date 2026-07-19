import { appConfig } from '../config/app';
import { getRuntimeClientHeaders } from '../domain/runtime-client-contract';
import { ApiError, type ApiErrorPayload } from './api-error';

type QueryValue = string | number | boolean | string[] | undefined | null;
type RequestCredentialsMode = 'include' | 'omit' | 'same-origin';
type CookieJar = Record<string, string>;

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  query?: Record<string, QueryValue>;
  body?: unknown;
  cookieJar?: boolean;
  credentials?: RequestCredentialsMode;
  token?: string;
  baseUrl?: string;
  sourceHeader?: string;
}

let accessToken: string | undefined;
let nativeDeviceIdentity: NativeDeviceIdentity = {};
const responseCookieJar: Record<string, CookieJar> = {};

export interface NativeDeviceIdentity {
  macAddresses?: string[];
  macSignature?: string;
}

export function setAccessToken(token: string | undefined) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function setNativeDeviceIdentity(identity: NativeDeviceIdentity) {
  nativeDeviceIdentity = {
    macAddresses: normalizeMacAddresses(identity.macAddresses),
    macSignature: identity.macSignature?.trim() || undefined,
  };
}

export function getNativeDeviceIdentity(): NativeDeviceIdentity {
  return {
    macAddresses: nativeDeviceIdentity.macAddresses
      ? [...nativeDeviceIdentity.macAddresses]
      : undefined,
    macSignature: nativeDeviceIdentity.macSignature,
  };
}

export function clearNativeDeviceIdentity() {
  nativeDeviceIdentity = {};
}

export function clearResponseCookieJar() {
  Object.keys(responseCookieJar).forEach(origin => {
    delete responseCookieJar[origin];
  });
}

export function getResponseCookieValue(baseUrl: string, name: string) {
  const origin = getUrlOrigin(baseUrl);
  return responseCookieJar[origin]?.[name];
}

export async function apiRequest<T>({
  method = 'GET',
  path,
  query,
  body,
  cookieJar,
  credentials,
  token,
  baseUrl,
  sourceHeader,
}: RequestOptions): Promise<T> {
  const url = buildUrl(path, query, baseUrl);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...getRuntimeClientHeaders({ sourceHeader }),
  };

  const macHeader = nativeDeviceIdentity.macAddresses?.join(',');
  if (macHeader) {
    headers['x-device-mac'] = macHeader;
  }

  if (nativeDeviceIdentity.macSignature) {
    headers['x-device-mac-signature'] = nativeDeviceIdentity.macSignature;
  }

  const isMultipartBody = isFormDataBody(body);

  if (body !== undefined && !isMultipartBody) {
    headers['Content-Type'] = 'application/json';
  }

  const bearerToken = token ?? accessToken;
  if (bearerToken) {
    headers.Authorization = `Bearer ${bearerToken}`;
  }

  if (cookieJar) {
    const origin = getUrlOrigin(url);
    const cookieHeader = getCookieHeader(origin);
    headers.Cookie = cookieHeader ?? 'kolamCsrf=';

    const csrfToken = responseCookieJar[origin]?.kolamCsrf;
    if (csrfToken && method !== 'GET') {
      headers['x-csrf-token'] = csrfToken;
    }
  }

  const response = await fetch(url, {
    method,
    headers,
    credentials,
    body:
      body === undefined
        ? undefined
        : isMultipartBody
        ? (body as BodyInit_)
        : JSON.stringify(body),
  });

  if (cookieJar) {
    storeResponseCookies(url, response);
  }

  const payload = await readJson(response);

  if (!response.ok) {
    throw new ApiError(response.status, normalizeErrorPayload(payload));
  }

  return payload as T;
}

export function apiGet<T>(
  path: string,
  query?: Record<string, QueryValue>,
): Promise<T> {
  return apiRequest<T>({ method: 'GET', path, query });
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>({ method: 'POST', path, body });
}

export function buildUrl(
  path: string,
  query?: Record<string, QueryValue>,
  baseUrl = appConfig.apiBaseUrl,
) {
  const cleanBase = baseUrl.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${cleanBase}${cleanPath}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(item => url.searchParams.append(key, item));
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function normalizeErrorPayload(payload: unknown): ApiErrorPayload {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    return {
      message:
        typeof record.message === 'string'
          ? record.message
          : typeof record.error === 'string'
          ? record.error
          : undefined,
      code: typeof record.code === 'string' ? record.code : undefined,
      errors: isValidationErrors(record.errors) ? record.errors : undefined,
    };
  }

  return {};
}

function isValidationErrors(value: unknown): value is Record<string, string[]> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return Object.values(value).every(
    entry =>
      Array.isArray(entry) && entry.every(item => typeof item === 'string'),
  );
}

function normalizeMacAddresses(values: string[] | undefined) {
  if (!values) {
    return undefined;
  }

  const macs = values.map(value => value.trim().toUpperCase()).filter(Boolean);

  return macs.length ? macs : undefined;
}

function isFormDataBody(body: unknown): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

function getUrlOrigin(url: string) {
  return new URL(url).origin;
}

function getCookieHeader(origin: string) {
  const jar = responseCookieJar[origin];
  if (!jar) {
    return undefined;
  }

  const pairs = Object.entries(jar)
    .filter(([, value]) => value !== '')
    .map(([name, value]) => `${name}=${value}`);

  return pairs.length ? pairs.join('; ') : undefined;
}

function storeResponseCookies(url: string, response: Response) {
  const raw = getSetCookieHeader(response);
  if (!raw) {
    return;
  }

  const origin = getUrlOrigin(url);
  const jar = (responseCookieJar[origin] ??= {});
  for (const { name, value } of parseSetCookieHeader(raw)) {
    if (!name) {
      continue;
    }

    if (value === '') {
      delete jar[name];
      continue;
    }

    jar[name] = value;
  }
}

function parseSetCookieHeader(raw: string) {
  const cookies: Array<{ name: string; value: string }> = [];
  const pattern = /(?:^|,\s*)([A-Za-z0-9_-]+)=([^;,]*)/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(raw))) {
    const name = match[1];
    if (isSetCookieAttribute(name)) {
      continue;
    }

    cookies.push({
      name,
      value: match[2],
    });
  }

  return cookies;
}

function isSetCookieAttribute(name: string) {
  return [
    'domain',
    'expires',
    'httponly',
    'max-age',
    'path',
    'samesite',
    'secure',
  ].includes(name.toLowerCase());
}

function getSetCookieHeader(response: Response) {
  const headers = response.headers as
    | (Headers & {
        map?: Record<string, string | string[]>;
        raw?: () => Record<string, string[]>;
        _headers?: Record<string, string | string[]>;
      })
    | undefined;
  const values: string[] = [];
  const headerGetter = headers?.get?.bind(headers);
  const direct =
    headerGetter?.('set-cookie') ??
    headerGetter?.('Set-Cookie') ??
    normalizeHeaderValue(headers?.map?.['set-cookie']) ??
    normalizeHeaderValue(headers?.map?.['Set-Cookie']) ??
    normalizeHeaderValue(headers?._headers?.['set-cookie']) ??
    normalizeHeaderValue(headers?._headers?.['Set-Cookie']);
  if (direct) {
    values.push(direct);
  }

  const raw = headers?.raw?.();
  const rawSetCookie =
    normalizeHeaderValue(raw?.['set-cookie']) ??
    normalizeHeaderValue(raw?.['Set-Cookie']);
  if (rawSetCookie) {
    values.push(rawSetCookie);
  }

  headers?.forEach?.((value, name) => {
    if (name.toLowerCase() === 'set-cookie') {
      values.push(value);
    }
  });

  return values.filter(Boolean).join(',');
}

function normalizeHeaderValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value.join(',');
  }

  return value;
}
