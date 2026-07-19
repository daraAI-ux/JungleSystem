import {appConfig} from '../src/config/app';
import {
  authSources,
  formatAccessScope,
  getAccessScope,
  getAuthSource,
} from '../src/domain/auth';
import {
  getActiveAuthSource,
  getCurrentUser,
  restoreAuthSessionFromStore,
  signIn,
  signOut,
  signOutRemote,
} from '../src/services/auth-api';
import {
  clearNativeDeviceIdentity,
  clearResponseCookieJar,
  setNativeDeviceIdentity,
} from '../src/lib/api-client';
import {
  getStoredAuthSource,
  getStoredAuthToken,
  saveAuthSource,
  saveAuthToken,
} from '../src/services/token-store';

const fetchMock = jest.fn();

describe('unified auth source contracts', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock;
    signOut();
    clearNativeDeviceIdentity();
    clearResponseCookieJar();
  });

  it('defines distinct login sources for Kolam, POS, and AM', () => {
    expect(authSources.map(source => source.id)).toEqual([
      'kolam',
      'pos',
      'am',
    ]);
    expect(getAuthSource('kolam')).toMatchObject({
      bodySource: 'inventory',
      headerSource: appConfig.kolamSourceHeader,
    });
    expect(getAuthSource('pos')).toMatchObject({
      bodySource: 'pos',
      headerSource: appConfig.sourceHeader,
    });
    expect(getAuthSource('am')).toMatchObject({
      bodySource: 'am',
      headerSource: appConfig.amSourceHeader,
    });
  });

  it('signs in to Kolam with inventory source and maps top-level backend user fields', async () => {
    setNativeDeviceIdentity({
      macAddresses: ['AA:BB:CC:DD:EE:FF'],
    });
    fetchMock
      .mockResolvedValueOnce(jsonResponse({
        accessToken: 'kolam-token',
        id: 'user-1',
        email: 'staff@example.test',
        first_name: 'Anura',
        last_name: 'Staff',
        role: {key: 'staff'},
      }))
      .mockResolvedValueOnce(jsonResponse({
        id: 'user-1',
        email: 'staff@example.test',
        first_name: 'Anura',
        last_name: 'Staff',
        profile_picture: 'media/user-avatar/staff.jpg',
        timezone: 'UTC+08:00',
        access_inventory: true,
        access_pos: true,
        access_am: true,
        role: {key: 'staff'},
      }));

    await expect(
      signIn({
        email: 'staff@example.test',
        password: 'secret',
        source: 'kolam',
      }),
    ).resolves.toMatchObject({
      token: 'kolam-token',
      source: 'kolam',
      user: {
        id: 'user-1',
        email: 'staff@example.test',
        firstName: 'Anura',
        lastName: 'Staff',
        profilePhotoUrl:
          `${appConfig.fileBaseUrl}/api/media/avatar?src=media%2Fuser-avatar%2Fstaff.jpg&size=96`,
        timezone: 'UTC+08:00',
        roleKey: 'staff',
        accessInventory: true,
        accessPos: true,
        accessAm: true,
      },
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `${appConfig.kolamApiBaseUrl}/auth/signin`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'x-source': appConfig.kolamSourceHeader,
          'x-device-mac': 'AA:BB:CC:DD:EE:FF',
        }),
        body: JSON.stringify({
          email: 'staff@example.test',
          password: 'secret',
          source: 'inventory',
          desktopClient: true,
          nativeClientId: appConfig.nativeClientId,
          nativeOrigin: appConfig.nativeOrigin,
          nativeUserAgent: appConfig.nativeUserAgent,
          deviceMacAddresses: ['AA:BB:CC:DD:EE:FF'],
        }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `${appConfig.kolamApiBaseUrl}/auth/detail-user`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer kolam-token',
          'x-source': appConfig.kolamSourceHeader,
        }),
      }),
    );
    expect(getActiveAuthSource()).toBe('kolam');
    expect(getStoredAuthToken()).toBe('kolam-token');
    expect(getStoredAuthSource()).toBe('kolam');
  });

  it('uses the active auth source header when requesting the current user', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({
        accessToken: 'am-token',
        id: 'user-2',
        username: 'amstaff',
        role: {key: 'operator'},
      }))
      .mockResolvedValueOnce(jsonResponse({
        id: 'user-2',
        username: 'amstaff',
        role: {key: 'operator'},
      }))
      .mockResolvedValueOnce(jsonResponse({
        id: 'user-2',
        username: 'amstaff',
        role: {key: 'operator'},
      }));

    await signIn({
      email: 'am@example.test',
      password: 'secret',
      source: 'am',
    });
    await expect(getCurrentUser()).resolves.toMatchObject({
      id: 'user-2',
      username: 'amstaff',
      roleKey: 'operator',
    });

    expect(fetchMock).toHaveBeenLastCalledWith(
      `${appConfig.apiBaseUrl}/auth/detail-user`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer am-token',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('restores a stored Kolam session through the direct BE profile route', async () => {
    saveAuthToken('stored-kolam-token');
    saveAuthSource('kolam');
    fetchMock.mockResolvedValueOnce(jsonResponse({
      id: 'user-restored',
      email: 'restored@example.test',
      first_name: 'Restored',
      access_inventory: true,
      role: {key: 'staff'},
    }));

    await expect(restoreAuthSessionFromStore()).resolves.toMatchObject({
      token: 'stored-kolam-token',
      source: 'kolam',
      user: {
        id: 'user-restored',
        email: 'restored@example.test',
        firstName: 'Restored',
        accessInventory: true,
      },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/auth/detail-user`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'x-source': appConfig.kolamSourceHeader,
        }),
      }),
    );
  });

  it('returns no restored session when there is no stored token', async () => {
    await expect(restoreAuthSessionFromStore()).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('keeps the login response user when detail-user enrichment fails', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({
        accessToken: 'pos-token',
        id: 'user-3',
        username: 'cashier',
        role: {key: 'pos'},
      }))
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue(JSON.stringify({
          message: 'detail failed',
        })),
      });

    await expect(signIn({
      email: 'cashier@example.test',
      password: 'secret',
      source: 'pos',
    })).resolves.toMatchObject({
      token: 'pos-token',
      source: 'pos',
      user: {
        id: 'user-3',
        username: 'cashier',
        roleKey: 'pos',
      },
    });
  });

  it('logs out remotely with the active auth source header and clears local session', async () => {
    setNativeDeviceIdentity({
      macAddresses: ['AA:BB:CC:DD:EE:FF'],
    });
    fetchMock
      .mockResolvedValueOnce(jsonResponse({
        accessToken: 'kolam-token',
        id: 'user-4',
        username: 'staff',
        role: {key: 'staff'},
      }))
      .mockResolvedValueOnce(jsonResponse({
        id: 'user-4',
        username: 'staff',
        role: {key: 'staff'},
      }))
      .mockResolvedValueOnce(jsonResponse({
        message: 'Logged out successfully',
      }));

    await signIn({
      email: 'staff@example.test',
      password: 'secret',
      source: 'kolam',
    });
    await signOutRemote();

    expect(fetchMock).toHaveBeenLastCalledWith(
      `${appConfig.apiBaseUrl}/auth/logout`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer kolam-token',
          'x-source': appConfig.kolamSourceHeader,
        }),
      }),
    );
    expect(getActiveAuthSource()).toBe('kolam');
    expect(getStoredAuthToken()).toBeUndefined();
    expect(getStoredAuthSource()).toBeUndefined();
  });

  it('clears local session even when remote logout fails', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({
        accessToken: 'am-token',
        id: 'user-5',
        username: 'amstaff',
        role: {key: 'staff'},
      }))
      .mockResolvedValueOnce(jsonResponse({
        id: 'user-5',
        username: 'amstaff',
        role: {key: 'staff'},
      }))
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue(JSON.stringify({
          message: 'logout failed',
        })),
      });

    await signIn({
      email: 'am@example.test',
      password: 'secret',
      source: 'am',
    });

    await expect(signOutRemote()).rejects.toThrow('logout failed');
    expect(getActiveAuthSource()).toBe('kolam');
    expect(getStoredAuthToken()).toBeUndefined();
    expect(getStoredAuthSource()).toBeUndefined();
  });

  it('derives unified access scope from role and access flags', () => {
    expect(formatAccessScope(getAccessScope({
      roleKey: 'super_admin',
    }))).toBe('Kolam / AM');

    expect(getAccessScope({
      roleKey: 'pos',
      accessPos: false,
      accessInventory: true,
      accessAm: true,
    })).toEqual({
      kolam: true,
      pos: true,
      am: true,
    });

    expect(formatAccessScope(getAccessScope({
      roleKey: 'staff',
      accountRestricted: true,
      accessPos: true,
      accessInventory: true,
      accessAm: true,
    }))).toBe('Tidak ada akses area');
  });
});

function jsonResponse(payload: unknown, setCookie?: string) {
  return {
    ok: true,
    status: 200,
    headers: {
      get: jest.fn((name: string) =>
        name.toLowerCase() === 'set-cookie' ? setCookie : undefined,
      ),
    },
    text: jest.fn().mockResolvedValue(JSON.stringify(payload)),
  };
}




