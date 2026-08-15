import { appConfig } from '../config/app';
import {
  canonicalKolamDeviceMacPayload,
  normalizeKolamDeviceMacAddressList,
} from '../domain/kolam-device-mac';
import { getRuntimeClientHeaders } from '../domain/runtime-client-contract';
import {
  ApiError,
  isNonRetryableKolamAuthError,
  sanitizeApiErrorMessage,
  type ApiErrorPayload,
} from './api-error';

type QueryValue = string | number | boolean | string[] | undefined | null;
type RequestCredentialsMode = 'include' | 'omit' | 'same-origin';
type CookieJar = Record<string, string>;

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  query?: Record<string, QueryValue>;
  body?: unknown;
  headers?: Record<string, string>;
  cookieJar?: boolean;
  credentials?: RequestCredentialsMode;
  token?: string;
  baseUrl?: string;
  sourceHeader?: string;
  skipAuthRefresh?: boolean;
  notifyOnAuthFailure?: boolean;
}

let accessToken: string | undefined;
let nativeDeviceIdentity: NativeDeviceIdentity = {};
const responseCookieJar: Record<string, CookieJar> = {};
let refreshAccessToken: (() => Promise<string | undefined>) | undefined;
let notifySessionExpired: (() => void) | undefined;
let refreshAccessTokenPromise: Promise<string | undefined> | undefined;

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

export function setAuthSessionHandlers(handlers: {
  refreshAccessToken?: () => Promise<string | undefined>;
  onSessionExpired?: () => void;
}) {
  refreshAccessToken = handlers.refreshAccessToken;
  notifySessionExpired = handlers.onSessionExpired;
}

export function setNativeDeviceIdentity(identity: NativeDeviceIdentity) {
  const macAddresses = normalizeMacAddresses(identity.macAddresses);
  const macSignature = identity.macSignature?.trim() || undefined;
  // Never attach bare MAC without signature — BE treats that as empty MAC.
  nativeDeviceIdentity =
    macAddresses?.length && macSignature
      ? {macAddresses, macSignature}
      : {};
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
  headers: requestHeaders,
  cookieJar,
  credentials,
  token,
  baseUrl,
  sourceHeader,
  skipAuthRefresh,
  notifyOnAuthFailure,
}: RequestOptions): Promise<T> {
  return apiRequestWithAuthRefresh<T>(
    {
      method,
      path,
      query,
      body,
      headers: requestHeaders,
      cookieJar,
      credentials,
      token,
      baseUrl,
      sourceHeader,
      skipAuthRefresh,
      notifyOnAuthFailure,
    },
    false,
  );
}

async function apiRequestWithAuthRefresh<T>(
  options: Required<Pick<RequestOptions, 'method' | 'path'>> &
    Omit<RequestOptions, 'method' | 'path'>,
  didRefresh: boolean,
): Promise<T> {
  const {
    method,
    path,
    query,
    body,
    headers: requestHeaders,
    cookieJar,
    credentials,
    token,
    baseUrl,
    sourceHeader,
    skipAuthRefresh,
    notifyOnAuthFailure,
  } = options;
  const url = buildUrl(path, query, baseUrl);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...getRuntimeClientHeaders({ sourceHeader }),
    ...(requestHeaders ?? {}),
  };

  const macHeader = nativeDeviceIdentity.macAddresses?.length
    ? canonicalKolamDeviceMacPayload(nativeDeviceIdentity.macAddresses)
    : '';
  if (macHeader && nativeDeviceIdentity.macSignature) {
    headers['x-device-mac'] = macHeader;
    headers['x-device-mac-signature'] = nativeDeviceIdentity.macSignature;
  }

  const isMultipartBody = isFormDataBody(body);
  const isBinaryBody = isBinaryRequestBody(body);

  if (body !== undefined && !isMultipartBody && !isBinaryBody) {
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
        : isMultipartBody || isBinaryBody
        ? (body as BodyInit_)
        : JSON.stringify(body),
  });

  if (cookieJar) {
    storeResponseCookies(url, response);
  }

  const payload = await readJson(response);

  if (!response.ok) {
    const error = new ApiError(response.status, normalizeErrorPayload(payload));
    if (
      !isNonRetryableKolamAuthError(error) &&
      shouldRefreshAuth(error, token, skipAuthRefresh, didRefresh)
    ) {
      const refreshedToken = await refreshStoredAccessToken();
      if (refreshedToken) {
        return apiRequestWithAuthRefresh<T>(
          {
            ...options,
            token: token ?? refreshedToken,
          },
          true,
        );
      }
    }

    if (
      shouldNotifySessionExpired(
        error,
        skipAuthRefresh,
        notifyOnAuthFailure,
      )
    ) {
      notifySessionExpired?.();
    }

    throw error;
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
    return {
      message: sanitizeApiErrorMessage(text, response.status),
    };
  }
}

function normalizeErrorPayload(payload: unknown): ApiErrorPayload {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const rawMessage =
      typeof record.message === 'string'
        ? record.message
        : typeof record.error === 'string'
          ? record.error
          : undefined;
    return {
      message:
        rawMessage != null
          ? sanitizeApiErrorMessage(rawMessage)
          : undefined,
      code:
        typeof record.code === 'string'
          ? record.code
          : typeof record.errorCode === 'string'
            ? record.errorCode
            : undefined,
      errors: isValidationErrors(record.errors) ? record.errors : undefined,
      insufficientStock: isStringArray(record.insufficientStock)
        ? record.insufficientStock
        : undefined,
    };
  }

  return {};
}

function shouldRefreshAuth(
  error: ApiError,
  token: string | undefined,
  skipAuthRefresh: boolean | undefined,
  didRefresh: boolean,
) {
  return (
    error.status === 401 &&
    !skipAuthRefresh &&
    !didRefresh &&
    !token &&
    Boolean(accessToken)
  );
}

function shouldNotifySessionExpired(
  error: ApiError,
  skipAuthRefresh: boolean | undefined,
  notifyOnAuthFailure: boolean | undefined,
) {
  return error.status === 401 && !skipAuthRefresh && Boolean(notifyOnAuthFailure);
}

async function refreshStoredAccessToken() {
  if (!refreshAccessToken) {
    return undefined;
  }

  if (!refreshAccessTokenPromise) {
    refreshAccessTokenPromise = refreshAccessToken()
      .then(nextToken => {
        if (nextToken) {
          setAccessToken(nextToken);
        }
        return nextToken;
      })
      .catch(() => undefined)
      .finally(() => {
        refreshAccessTokenPromise = undefined;
      });
  }

  return refreshAccessTokenPromise;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every(item => typeof item === 'string')
  );
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

  const macs = normalizeKolamDeviceMacAddressList(values);
  return macs.length ? macs : undefined;
}

function isFormDataBody(body: unknown): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

function isBinaryRequestBody(
  body: unknown,
): body is Blob | ArrayBuffer | Uint8Array {
  if (typeof Blob !== 'undefined' && body instanceof Blob) {
    return true;
  }
  if (body instanceof ArrayBuffer) {
    return true;
  }
  return body instanceof Uint8Array;
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
