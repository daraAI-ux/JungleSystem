import {appConfig} from '../config/app';
import {
  apiRequest,
  getNativeDeviceIdentity,
  setAuthSessionHandlers,
} from '../lib/api-client';
import {
  getAuthSource,
  type AuthSource,
} from '../domain/auth';
import {
  clearAuthSource,
  clearAuthToken,
  getStoredAuthSource,
  getStoredAuthToken,
  saveAuthSource,
  saveAuthToken,
} from './token-store';
import {bootstrapNativeDeviceIdentity} from './native-device-identity';

export interface SignInBody {
  email: string;
  password: string;
  cfToken?: string;
  source?: AuthSource;
}

export interface StaffOtpLoginConfig {
  enabled: boolean;
  otpExpireMinutes: number;
  resendCooldownSeconds: number;
}

export interface StaffOtpRequestResponse {
  message: string;
  maskedEmail?: string | null;
  email?: string;
}

export interface StaffOtpVerifyBody {
  email: string;
  otpCode: string;
  source?: AuthSource;
}

export interface SignedInUser {
  id?: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePhotoUrl?: string | null;
  timezone?: string;
  roleKey?: string;
  isEmployee?: boolean;
  csActive?: boolean;
  accessPos?: boolean;
  accessInventory?: boolean;
  accessAm?: boolean;
  accountRestricted?: boolean;
  resignedAt?: string | null;
  permissions?: Array<{
    resource?: string;
    actions?: string[];
  }>;
}

interface SignInResponse {
  accessToken: string;
  _id?: string;
  id?: string;
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  profile_picture?: string | null;
  timezone?: string;
  access_pos?: boolean;
  access_inventory?: boolean;
  access_am?: boolean;
  csActive?: boolean;
  account_restricted?: boolean;
  resignedAt?: string | null;
  user?: {
    _id?: string;
    id?: string;
    email?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    profile_picture?: string | null;
    timezone?: string;
    access_pos?: boolean;
    access_inventory?: boolean;
    access_am?: boolean;
    csActive?: boolean;
    account_restricted?: boolean;
    resignedAt?: string | null;
  };
  role?: {
    key?: string;
    permissions?: Array<{
      resource?: string;
      actions?: string[];
    }>;
  };
  roleKey?: string | null;
  isEmployee?: boolean;
}

interface BackendUserPayload {
  _id?: string;
  id?: string;
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  profile_picture?: string | null;
  timezone?: string;
  access_pos?: boolean;
  access_inventory?: boolean;
  access_am?: boolean;
  csActive?: boolean;
  account_restricted?: boolean;
  resignedAt?: string | null;
  role?: {
    key?: string;
    permissions?: Array<{
      resource?: string;
      actions?: string[];
    }>;
  };
  isEmployee?: boolean;
}

interface RefreshAuthResponse {
  accessToken?: string;
  token?: string;
}

export interface AuthSession {
  token: string;
  user: SignedInUser;
  source: AuthSource;
}

let activeAuthSource: AuthSource = getStoredAuthSource() ?? 'kolam';

/** Selaras OTP + FE Electron: trim; email di-lower-case. Username tetap case-sensitive. */
export function normalizeLoginIdentifier(value: string): string {
  const trimmed = String(value ?? '').trim();
  return trimmed.includes('@') ? trimmed.toLowerCase() : trimmed;
}

export async function signIn(body: SignInBody): Promise<AuthSession> {
  const authSource = getAuthSource(body.source ?? 'kolam');
  const normalizedBody: SignInBody = {
    ...body,
    email: normalizeLoginIdentifier(body.email),
  };
  const response =
    authSource.id === 'kolam'
      ? await signInKolamDirect(normalizedBody, authSource)
      : await signInDirect(normalizedBody, authSource);

  saveAuthToken(response.accessToken);
  saveAuthSource(authSource.id);
  activeAuthSource = authSource.id;
  const userPayload = response.user ?? response;
  const fallbackUser = mapSignedInUser(userPayload, response.role?.key);
  const user = await getCurrentUser({skipAuthRefresh: true}).catch(
    () => fallbackUser,
  );

  return {
    token: response.accessToken,
    source: authSource.id,
    user,
  };
}

export async function getStaffOtpLoginConfig(): Promise<StaffOtpLoginConfig> {
  const response = await apiRequest<{
    data?: StaffOtpLoginConfig;
    enabled?: boolean;
    otpExpireMinutes?: number;
    resendCooldownSeconds?: number;
  }>({
    method: 'GET',
    path: '/auth/staff-otp-login/config',
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: getAuthSource('kolam').headerSource,
    skipAuthRefresh: true,
    notifyOnAuthFailure: false,
  });

  const data: StaffOtpLoginConfig = response.data ?? {
    enabled: Boolean(response.enabled),
    otpExpireMinutes: Number(response.otpExpireMinutes) || 10,
    resendCooldownSeconds: Number(response.resendCooldownSeconds) || 60,
  };
  return {
    enabled: Boolean(data.enabled),
    otpExpireMinutes: Number(data.otpExpireMinutes) || 10,
    resendCooldownSeconds: Number(data.resendCooldownSeconds) || 60,
  };
}

export async function requestStaffLoginOtp(
  email: string,
): Promise<StaffOtpRequestResponse> {
  const response = await apiRequest<StaffOtpRequestResponse>({
    method: 'POST',
    path: '/auth/staff-otp-login/request',
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: getAuthSource('kolam').headerSource,
    skipAuthRefresh: true,
    notifyOnAuthFailure: false,
    body: {
      email,
      source: getAuthSource('kolam').bodySource,
    },
  });

  return response;
}

export async function verifyStaffLoginOtp(
  body: StaffOtpVerifyBody,
): Promise<AuthSession> {
  const authSource = getAuthSource(body.source ?? 'kolam');
  const identity = getNativeDeviceIdentity();
  const response = await apiRequest<SignInResponse>({
    method: 'POST',
    path: '/auth/staff-otp-login/verify',
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: authSource.headerSource,
    skipAuthRefresh: true,
    notifyOnAuthFailure: false,
    body: {
      email: body.email,
      otp_code: body.otpCode,
      source: authSource.bodySource,
      desktopClient: true,
      nativeClientId: appConfig.nativeClientId,
      nativeOrigin: appConfig.nativeOrigin,
      nativeUserAgent: appConfig.nativeUserAgent,
      deviceMacAddresses: identity.macAddresses ?? [],
    },
  });

  saveAuthToken(response.accessToken);
  saveAuthSource(authSource.id);
  activeAuthSource = authSource.id;
  const userPayload = response.user ?? response;
  const fallbackUser = mapSignedInUser(userPayload, response.role?.key);
  const user = await getCurrentUser({skipAuthRefresh: true}).catch(
    () => fallbackUser,
  );

  return {
    token: response.accessToken,
    source: authSource.id,
    user,
  };
}

function signInDirect(
  body: SignInBody,
  authSource: ReturnType<typeof getAuthSource>,
): Promise<SignInResponse> {
  return apiRequest<SignInResponse>({
    method: 'POST',
    path: '/auth/signin',
    sourceHeader: authSource.headerSource,
    body: {
      ...body,
      source: authSource.bodySource,
    },
  });
}

async function signInKolamDirect(
  body: SignInBody,
  authSource: ReturnType<typeof getAuthSource>,
): Promise<SignInResponse> {
  const identity = getNativeDeviceIdentity();
  const deviceMacAddresses = identity.macAddresses ?? [];

  return withKolamLoginStep('direct-be', () =>
    apiRequest<SignInResponse>({
      method: 'POST',
      path: '/auth/signin',
      baseUrl: appConfig.kolamApiBaseUrl,
      sourceHeader: authSource.headerSource,
      body: {
        email: body.email,
        password: body.password,
        source: authSource.bodySource,
        desktopClient: true,
        nativeClientId: appConfig.nativeClientId,
        nativeOrigin: appConfig.nativeOrigin,
        nativeUserAgent: appConfig.nativeUserAgent,
        deviceMacAddresses,
      },
    }),
  );
}

async function withKolamLoginStep<T>(
  step: string,
  request: () => Promise<T>,
): Promise<T> {
  try {
    return await request();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login gagal.';
    throw new Error(`Login Kolam ${step} gagal: ${message}`);
  }
}

export async function getCurrentUser({
  skipAuthRefresh,
}: {
  skipAuthRefresh?: boolean;
} = {}): Promise<SignedInUser> {
  if (activeAuthSource === 'kolam') {
    const response = await apiRequest<BackendUserPayload>({
      method: 'GET',
      path: '/auth/detail-user',
      baseUrl: appConfig.kolamApiBaseUrl,
      sourceHeader: getAuthSource(activeAuthSource).headerSource,
      skipAuthRefresh,
    });

    return mapSignedInUser(response);
  }

  const response = await apiRequest<BackendUserPayload>({
    method: 'GET',
    path: '/auth/detail-user',
    sourceHeader: getAuthSource(activeAuthSource).headerSource,
    skipAuthRefresh,
  });

  return mapSignedInUser(response);
}

function mapSignedInUser(
  payload: BackendUserPayload,
  roleKey = payload.role?.key,
): SignedInUser {
  return {
    id: payload._id ?? payload.id,
    email: payload.email,
    username: payload.username,
    firstName: payload.first_name,
    lastName: payload.last_name,
    phoneNumber: payload.phone_number,
    profilePhotoUrl: resolveProfilePhotoUrl(payload.profile_picture),
    timezone: payload.timezone,
    roleKey,
    isEmployee: payload.isEmployee,
    csActive: payload.csActive,
    accessPos: payload.access_pos,
    accessInventory: payload.access_inventory,
    accessAm: payload.access_am,
    accountRestricted: payload.account_restricted,
    resignedAt: payload.resignedAt,
    permissions: payload.role?.permissions,
  };
}

export async function updateCurrentUserProfile(body: {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
}): Promise<SignedInUser> {
  const response = await apiRequest<BackendUserPayload | {data?: BackendUserPayload}>({
    method: 'POST',
    path: '/auth/update-profile',
    body,
    baseUrl:
      activeAuthSource === 'kolam'
        ? appConfig.kolamApiBaseUrl
        : undefined,
    sourceHeader: getAuthSource(activeAuthSource).headerSource,
  });
  const payload =
    response && typeof response === 'object' && 'data' in response
      ? response.data ?? {}
      : response;
  return mapSignedInUser(payload as BackendUserPayload);
}

export async function uploadCurrentUserProfilePhoto(
  localUri: string,
): Promise<SignedInUser> {
  const body = new FormData();
  body.append(
    'photos',
    createReactNativeImageFilePart(localUri, 'profile-photo.jpg') as unknown as Blob,
  );

  const response = await apiRequest<BackendUserPayload | {data?: BackendUserPayload}>({
    method: 'POST',
    path: '/auth/upload-profile-photo',
    body,
    baseUrl:
      activeAuthSource === 'kolam'
        ? appConfig.kolamApiBaseUrl
        : undefined,
    sourceHeader: getAuthSource(activeAuthSource).headerSource,
  });
  const payload =
    response && typeof response === 'object' && 'data' in response
      ? response.data ?? {}
      : response;
  return mapSignedInUser(payload as BackendUserPayload);
}

export async function changeCurrentUserPassword(body: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await apiRequest<unknown>({
    method: 'POST',
    path: '/auth/change-password',
    body,
    baseUrl:
      activeAuthSource === 'kolam'
        ? appConfig.kolamApiBaseUrl
        : undefined,
    sourceHeader: getAuthSource(activeAuthSource).headerSource,
  });
}

export function resolveProfilePhotoUrl(
  profilePicture?: string | null,
): string | null {
  const raw = String(profilePicture ?? '').trim();
  if (!raw) {
    return null;
  }

  const fileBaseUrl = appConfig.fileBaseUrl.replace(/\/$/, '');
  const mediaUrl = /^https?:\/\//i.test(raw)
    ? raw.replace(
        /^https?:\/\/kolam\.dunia-anura\.com\/media\//i,
        `${fileBaseUrl}/media/`,
      )
    : `${fileBaseUrl}/${raw.replace(/^\/+/, '')}`;

  return resolveProfileAvatarUrl(mediaUrl);
}

function resolveProfileAvatarUrl(mediaUrl: string): string {
  const fileBaseUrl = appConfig.fileBaseUrl.replace(/\/$/, '');

  try {
    const url = new URL(mediaUrl);
    const fileBase = new URL(fileBaseUrl);
    if (url.host === fileBase.host && url.pathname.startsWith('/media/')) {
      const mediaPath = url.pathname.replace(/^\/+/, '');
      return `${fileBaseUrl}/api/media/avatar?src=${encodeURIComponent(mediaPath)}&size=96`;
    }
  } catch {
    // Keep the original URL if parsing fails; the caller can still attempt to render it.
  }

  return mediaUrl;
}

function createReactNativeImageFilePart(
  localUri: string,
  fallbackName: string,
) {
  const normalizedUri = localUri.startsWith('file://')
    ? localUri
    : `file:///${localUri.replace(/\\/g, '/')}`;
  const name = normalizedUri.split('/').pop() || fallbackName;

  return {
    name,
    type: inferImageMimeType(name),
    uri: normalizedUri,
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
      return 'image/jpeg';
    default:
      return 'application/octet-stream';
  }
}

export function signOut() {
  clearAuthToken();
  clearAuthSource();
  activeAuthSource = 'kolam';
}

export async function refreshAuthSession(): Promise<string | undefined> {
  const sourceHeader = getAuthSource(activeAuthSource).headerSource;
  const response = await apiRequest<RefreshAuthResponse>({
    method: 'POST',
    path: '/auth/refresh',
    baseUrl:
      activeAuthSource === 'kolam'
        ? appConfig.kolamApiBaseUrl
        : appConfig.apiBaseUrl,
    sourceHeader,
    skipAuthRefresh: true,
  });
  const nextToken = response.accessToken ?? response.token;

  if (!nextToken) {
    return undefined;
  }

  saveAuthToken(nextToken);
  return nextToken;
}

export function registerAuthSessionHandlers(onSessionExpired: () => void) {
  setAuthSessionHandlers({
    refreshAccessToken: refreshAuthSession,
    onSessionExpired,
  });
}

export function clearAuthSessionHandlers() {
  setAuthSessionHandlers({});
}

export async function signOutRemote(): Promise<void> {
  const sourceHeader = getAuthSource(activeAuthSource).headerSource;

  try {
    await apiRequest({
      method: 'POST',
      path: '/auth/logout',
      sourceHeader,
    });
  } finally {
    signOut();
  }
}

export function getActiveAuthSource() {
  return activeAuthSource;
}

export async function restoreAuthSessionFromStore(): Promise<AuthSession | null> {
  const token = getStoredAuthToken();

  if (!token) {
    return null;
  }

  const source = getStoredAuthSource() ?? activeAuthSource;
  activeAuthSource = source;
  saveAuthSource(source);

  // detail-user enforces MAC; without identity headers BE reports "MAC tidak terdeteksi"
  // even when the device is allowlisted. Wait for native bootstrap before restore.
  if (source === 'kolam') {
    await bootstrapNativeDeviceIdentity();
  }

  try {
    return {
      token,
      source,
      user: await getCurrentUser(),
    };
  } catch (error) {
    signOut();
    throw error;
  }
}

export function getUserDisplayName(user: SignedInUser | null): string {
  if (!user) {
    return 'Belum login';
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return fullName || user.username || user.email || 'User POS';
}
