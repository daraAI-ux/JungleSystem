import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {useKolamAuthController} from '../src/hooks/use-kolam-auth-controller';
import {apiRequest} from '../src/lib/api-client';
import {
  clearAuthSource,
  clearAuthToken,
  createMemoryAuthTokenStore,
  saveAuthSource,
  saveAuthToken,
  setAuthTokenStore,
} from '../src/services/token-store';

type AuthController = ReturnType<typeof useKolamAuthController>;

function requireAuthController(controller: AuthController | null) {
  if (!controller) {
    throw new Error('Auth controller did not render.');
  }

  return controller;
}

function AuthHarness({onRender}: {onRender: (controller: AuthController) => void}) {
  const controller = useKolamAuthController();
  onRender(controller);
  return null;
}

describe('Kolam auth controller hook', () => {
  beforeEach(() => {
    setAuthTokenStore(createMemoryAuthTokenStore());
    clearAuthToken();
    clearAuthSource();
    globalThis.fetch = jest.fn();
  });

  it('keeps auth form state and validates required login fields', async () => {
    let latest: AuthController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <AuthHarness
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    expect(requireAuthController(latest).displayName).toBe('Belum login');
    expect(requireAuthController(latest).accessScope).toEqual({
      am: false,
      kolam: false,
      pos: false,
    });

    await ReactTestRenderer.act(async () => {
      const controller = requireAuthController(latest);
      controller.setAuthEmail('staff@example.test');
      controller.setAuthSource('kolam');
    });

    expect(requireAuthController(latest).authEmail).toBe('staff@example.test');
    expect(requireAuthController(latest).authSourceHint).toContain('Kolam');

    await ReactTestRenderer.act(async () => {
      await requireAuthController(latest).handleSignIn();
    });

    expect(requireAuthController(latest).authMessage).toBe(
      'Email dan password wajib diisi.',
    );
    expect(requireAuthController(latest).isSigningIn).toBe(false);
  });

  it('restores an existing server session from the token store', async () => {
    let latest: AuthController | null = null;
    const fetchMock = jest.fn().mockResolvedValue(jsonResponse({
      id: 'user-restored',
      email: 'restored@example.test',
      first_name: 'Anura',
      last_name: 'Desktop',
      access_inventory: true,
      role: {key: 'staff'},
    }));
    globalThis.fetch = fetchMock;
    saveAuthToken('stored-token');
    saveAuthSource('kolam');

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <AuthHarness
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
    });

    expect(requireAuthController(latest).displayName).toBe('Anura Desktop');
    expect(requireAuthController(latest).authSource).toBe('kolam');
    expect(requireAuthController(latest).accessScope).toEqual({
      am: false,
      kolam: true,
      pos: false,
    });
    expect(requireAuthController(latest).authMessage).toContain(
      'Sesi Kolam dipulihkan',
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/auth/detail-user'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer stored-token',
          'x-source': 'Kolam',
        }),
      }),
    );
  });

  it('clears the restored user when token refresh cannot recover an expired session', async () => {
    let latest: AuthController | null = null;
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({
        id: 'user-restored',
        email: 'restored@example.test',
        first_name: 'Anura',
        access_inventory: true,
      }))
      .mockResolvedValueOnce(unauthorizedResponse('Token expired'))
      .mockResolvedValueOnce(unauthorizedResponse('Refresh expired'));
    globalThis.fetch = fetchMock;
    saveAuthToken('stored-token');
    saveAuthSource('kolam');

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <AuthHarness
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      await Promise.resolve();
    });

    expect(requireAuthController(latest).authUser).toEqual(
      expect.objectContaining({email: 'restored@example.test'}),
    );

    await ReactTestRenderer.act(async () => {
      await expect(
        apiRequest({
          method: 'GET',
          notifyOnAuthFailure: true,
          path: '/auth/detail-user',
        }),
      ).rejects.toMatchObject({status: 401});
    });

    expect(requireAuthController(latest).authUser).toBeNull();
    expect(requireAuthController(latest).authMessage).toBe(
      'Sesi login berakhir. Silakan login lagi untuk melanjutkan.',
    );
  });
});

function jsonResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    headers: {
      get: jest.fn(),
    },
    text: jest.fn().mockResolvedValue(JSON.stringify(payload)),
  };
}

function unauthorizedResponse(message: string) {
  return {
    ok: false,
    status: 401,
    headers: {
      get: jest.fn(),
    },
    text: jest.fn().mockResolvedValue(JSON.stringify({message})),
  };
}
