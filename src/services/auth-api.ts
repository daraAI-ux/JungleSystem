import {appConfig} from '../config/app';
import {
  apiRequest,
  getNativeDeviceIdentity,
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

export interface SignInBody {
  email: string;
  password: string;
  cfToken?: string;
  source?: AuthSource;
}

export interface SignedInUser {
  id?: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  profilePhotoUrl?: string | null;
  timezone?: string;
  roleKey?: string;
  accessPos?: boolean;
  accessInventory?: boolean;
  accessAm?: boolean;
  accountRestricted?: boolean;
  resignedAt?: string | null;
}

interface SignInResponse {
  accessToken: string;
  _id?: string;
  id?: string;
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  profile_picture?: string | null;
  timezone?: string;
  access_pos?: boolean;
  access_inventory?: boolean;
  access_am?: boolean;
  account_restricted?: boolean;
  resignedAt?: string | null;
  user?: {
    _id?: string;
    id?: string;
    email?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    profile_picture?: string | null;
    timezone?: string;
    access_pos?: boolean;
    access_inventory?: boolean;
    access_am?: boolean;
    account_restricted?: boolean;
    resignedAt?: string | null;
  };
  role?: {
    key?: string;
  };
  roleKey?: string | null;
}

interface BackendUserPayload {
  _id?: string;
  id?: string;
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  profile_picture?: string | null;
  timezone?: string;
  access_pos?: boolean;
  access_inventory?: boolean;
  access_am?: boolean;
  account_restricted?: boolean;
  resignedAt?: string | null;
  role?: {
    key?: string;
  };
}

export interface AuthSession {
  token: string;
  user: SignedInUser;
  source: AuthSource;
}

let activeAuthSource: AuthSource = getStoredAuthSource() ?? 'kolam';

export async function signIn(body: SignInBody): Promise<AuthSession> {
  const authSource = getAuthSource(body.source ?? 'kolam');
  const response =
    authSource.id === 'kolam'
      ? await signInKolamDirect(body, authSource)
      : await signInDirect(body, authSource);

  saveAuthToken(response.accessToken);
  saveAuthSource(authSource.id);
  activeAuthSource = authSource.id;
  const userPayload = response.user ?? response;
  const fallbackUser = mapSignedInUser(userPayload, response.role?.key);
  const user = await getCurrentUser().catch(() => fallbackUser);

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

export async function getCurrentUser(): Promise<SignedInUser> {
  if (activeAuthSource === 'kolam') {
    const response = await apiRequest<BackendUserPayload>({
      method: 'GET',
      path: '/auth/detail-user',
      baseUrl: appConfig.kolamApiBaseUrl,
      sourceHeader: getAuthSource(activeAuthSource).headerSource,
    });

    return mapSignedInUser(response);
  }

  const response = await apiRequest<BackendUserPayload>({
    method: 'GET',
    path: '/auth/detail-user',
    sourceHeader: getAuthSource(activeAuthSource).headerSource,
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
    profilePhotoUrl: resolveProfilePhotoUrl(payload.profile_picture),
    timezone: payload.timezone,
    roleKey,
    accessPos: payload.access_pos,
    accessInventory: payload.access_inventory,
    accessAm: payload.access_am,
    accountRestricted: payload.account_restricted,
    resignedAt: payload.resignedAt,
  };
}

function resolveProfilePhotoUrl(profilePicture?: string | null): string | null {
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

export function signOut() {
  clearAuthToken();
  clearAuthSource();
  activeAuthSource = 'kolam';
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





