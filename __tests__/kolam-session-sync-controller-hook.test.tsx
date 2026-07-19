import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import type {AuthSession, SignedInUser} from '../src/services/auth-api';
import {
  seedUnifiedDataset,
  type UnifiedDataset,
} from '../src/services/unified-data';
import {useKolamSessionSyncController} from '../src/hooks/use-kolam-session-sync-controller';
import type {RefreshUnifiedDatasetInput} from '../src/hooks/use-kolam-unified-data-controller';

type SessionSyncController = ReturnType<typeof useKolamSessionSyncController>;

const posUser: SignedInUser = {
  email: 'kasir@example.test',
  roleKey: 'pos',
};

const kolamUser: SignedInUser = {
  accessInventory: true,
  email: 'kolam@example.test',
  roleKey: 'staff',
};

const liveDataset: UnifiedDataset = {
  ...seedUnifiedDataset,
  sync: {
    pos: 'live',
    kolam: 'disabled',
    am: 'disabled',
  },
};

function requireController(controller: SessionSyncController | null) {
  if (!controller) {
    throw new Error('Session sync controller did not render.');
  }

  return controller;
}

function SessionSyncHarness({
  authUser = null,
  onMessage,
  onReconcileDataset,
  onRefreshUnifiedDataset,
  onRender,
  onSignIn,
  onSignOut,
}: {
  authUser?: SignedInUser | null;
  onMessage: (message: string) => void;
  onReconcileDataset: (dataset: UnifiedDataset) => void;
  onRefreshUnifiedDataset: (
    input: RefreshUnifiedDatasetInput,
  ) => Promise<UnifiedDataset>;
  onRender: (controller: SessionSyncController) => void;
  onSignIn: () => Promise<AuthSession | null>;
  onSignOut: () => Promise<void>;
}) {
  const controller = useKolamSessionSyncController({
    authUser,
    onMessage,
    onReconcileDataset,
    onRefreshUnifiedDataset,
    onSignIn,
    onSignOut,
  });

  onRender(controller);
  return null;
}

describe('Kolam session sync controller hook', () => {
  it('refreshes the dataset with the current signed-in access scope', async () => {
    let latest: SessionSyncController | null = null;
    const refreshInputs: RefreshUnifiedDatasetInput[] = [];
    const reconciledDatasets: UnifiedDataset[] = [];
    const messages: string[] = [];

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <SessionSyncHarness
          authUser={posUser}
          onMessage={message => messages.push(message)}
          onReconcileDataset={dataset => reconciledDatasets.push(dataset)}
          onRefreshUnifiedDataset={async input => {
            refreshInputs.push(input);
            return liveDataset;
          }}
          onRender={controller => {
            latest = controller;
          }}
          onSignIn={async () => null}
          onSignOut={async () => undefined}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      await requireController(latest).refreshDataset(true);
    });

    expect(refreshInputs).toEqual([
      {
        cacheOwnerId: 'kasir@example.test',
        enabledAreas: {am: false, kolam: false, pos: true},
        preferLiveApi: true,
      },
    ]);
    expect(reconciledDatasets).toEqual([liveDataset]);
    expect(messages).toEqual(['Sync: POS live, Kolam disabled, AM disabled.']);
  });

  it('refreshes live API areas from the returned sign-in session', async () => {
    let latest: SessionSyncController | null = null;
    const refreshInputs: RefreshUnifiedDatasetInput[] = [];
    const session: AuthSession = {
      source: 'kolam',
      token: 'token',
      user: kolamUser,
    };

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <SessionSyncHarness
          onMessage={() => undefined}
          onReconcileDataset={() => undefined}
          onRefreshUnifiedDataset={async input => {
            refreshInputs.push(input);
            return liveDataset;
          }}
          onRender={controller => {
            latest = controller;
          }}
          onSignIn={async () => session}
          onSignOut={async () => undefined}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      await requireController(latest).handleSignIn();
    });

    expect(refreshInputs).toEqual([
      {
        cacheOwnerId: 'kolam@example.test',
        enabledAreas: {am: false, kolam: true, pos: false},
        preferLiveApi: true,
      },
    ]);
  });

  it('does not refresh when sign-in validation returns no session', async () => {
    let latest: SessionSyncController | null = null;
    const refreshInputs: RefreshUnifiedDatasetInput[] = [];

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <SessionSyncHarness
          onMessage={() => undefined}
          onReconcileDataset={() => undefined}
          onRefreshUnifiedDataset={async input => {
            refreshInputs.push(input);
            return liveDataset;
          }}
          onRender={controller => {
            latest = controller;
          }}
          onSignIn={async () => null}
          onSignOut={async () => undefined}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      await requireController(latest).handleSignIn();
    });

    expect(refreshInputs).toEqual([]);
  });

  it('logs out before returning to seed/fallback access scope', async () => {
    let latest: SessionSyncController | null = null;
    const events: string[] = [];
    const refreshInputs: RefreshUnifiedDatasetInput[] = [];

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <SessionSyncHarness
          authUser={posUser}
          onMessage={() => undefined}
          onReconcileDataset={() => events.push('reconcile')}
          onRefreshUnifiedDataset={async input => {
            events.push('refresh');
            refreshInputs.push(input);
            return liveDataset;
          }}
          onRender={controller => {
            latest = controller;
          }}
          onSignIn={async () => null}
          onSignOut={async () => {
            events.push('signout');
          }}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      await requireController(latest).handleSignOut();
    });

    expect(events).toEqual(['signout', 'refresh', 'reconcile']);
    expect(refreshInputs).toEqual([
      {
        enabledAreas: {am: false, kolam: false, pos: false},
        preferLiveApi: false,
      },
    ]);
  });
});
