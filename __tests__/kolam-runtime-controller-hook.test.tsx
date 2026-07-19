import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import type {KolamRuntimeSurfaceProps} from '../src/components/kolam-runtime-surface';
import {authSources} from '../src/domain/auth';
import {getCommandIndex} from '../src/domain/command-index';
import {getNativeReadinessChecks} from '../src/domain/readiness';
import {
  getRuntimeIdentityItems,
  getRuntimeIdentitySummary,
} from '../src/domain/runtime-identity';
import type {RuntimeAction} from '../src/domain/runtime-actions';
import {getSyncActivityEntries} from '../src/domain/sync-activity';
import {useKolamRuntimeController} from '../src/hooks/use-kolam-runtime-controller';
import {seedUnifiedDataset} from '../src/services/unified-data';

type RuntimeController = ReturnType<typeof useKolamRuntimeController>;

function requireController(controller: RuntimeController | null) {
  if (!controller) {
    throw new Error('Runtime controller did not render.');
  }

  return controller;
}

function buildRuntimeProps(
  overrides: Partial<KolamRuntimeSurfaceProps> = {},
): KolamRuntimeSurfaceProps {
  const runtimeIdentityItems = getRuntimeIdentityItems();
  const runtimeIdentitySummary =
    getRuntimeIdentitySummary(runtimeIdentityItems);
  const commands = getCommandIndex();

  return {
    auth: {
      accessScope: {am: true, kolam: true, pos: true},
      amApiBaseUrl: 'https://am.example.test',
      authEmail: 'operator@example.test',
      authMessage: 'Runtime server existing siap.',
      authPassword: '',
      authSource: 'pos',
      authSourceHint: 'POS access_pos atau role POS.',
      authSources,
      displayName: 'Dunia Anura',
      isSigningIn: false,
      onAmApiBaseUrlChange: () => undefined,
      onAuthEmailChange: () => undefined,
      onAuthPasswordChange: () => undefined,
      onAuthSourceChange: () => undefined,
      onLogin: async () => undefined,
      onLogout: async () => undefined,
      onSync: () => undefined,
    },
    runtimeIdentity: {
      items: runtimeIdentityItems,
      meta: `${runtimeIdentitySummary.ready} ready`,
    },
    syncStatus: {
      message: 'Unified sync live',
      loading: false,
    },
    syncActivity: getSyncActivityEntries(seedUnifiedDataset, '10:00'),
    readiness: {
      checks: getNativeReadinessChecks(),
      summaryText: 'readiness summary',
    },
    runtimeActions: {
      accessScope: {am: true, kolam: true, pos: true},
      moduleId: 'checkout',
      onAction: () => undefined,
    },
    commandIndex: {
      commands,
      totalCount: commands.length,
      search: '',
      onSearchChange: () => undefined,
      onSelect: () => undefined,
    },
    ...overrides,
  };
}

function RuntimeHarness({
  props,
  onRender,
}: {
  props: KolamRuntimeSurfaceProps;
  onRender: (controller: RuntimeController) => void;
}) {
  const controller = useKolamRuntimeController(props);

  onRender(controller);
  return null;
}

describe('Kolam runtime controller hook', () => {
  it('builds the reusable runtime surface contract without changing server-facing props', async () => {
    let latest: RuntimeController | null = null;
    const props = buildRuntimeProps({
      syncStatus: {
        message: 'Server production live',
        loading: true,
        errorMessage: 'temporary retry',
      },
    });

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <RuntimeHarness
          props={props}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    const {runtime} = requireController(latest);

    expect(runtime.auth.amApiBaseUrl).toBe('https://am.example.test');
    expect(runtime.auth.authSource).toBe('pos');
    expect(runtime.syncStatus.message).toBe('Server production live');
    expect(runtime.syncStatus.loading).toBe(true);
    expect(runtime.runtimeActions.moduleId).toBe('checkout');
    expect(runtime.commandIndex.totalCount).toBe(getCommandIndex().length);
  });

  it('keeps runtime action and command callbacks wired through the controller', async () => {
    let latest: RuntimeController | null = null;
    let selectedActionId = '';
    let selectedCommandId = '';
    let searched = '';
    const command = getCommandIndex()[0];
    const action: RuntimeAction = {
      id: 'kolam-sync-finance',
      moduleId: 'kolam',
      area: 'kolam',
      label: 'Sync finance',
      description: 'Refresh Kolam finance data.',
      requiredAccess: 'kolam',
      status: 'live-api',
      statusIconKind: 'activity',
      sourceContract: 'runtime-actions',
    };
    const props = buildRuntimeProps({
      runtimeActions: {
        accessScope: {am: true, kolam: true, pos: true},
        moduleId: 'kolam',
        onAction: nextAction => {
          selectedActionId = nextAction.id;
        },
      },
      commandIndex: {
        commands: [command],
        totalCount: 1,
        search: 'finance',
        onSearchChange: value => {
          searched = value;
        },
        onSelect: async nextCommand => {
          selectedCommandId = nextCommand.id;
        },
      },
    });

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <RuntimeHarness
          props={props}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    requireController(latest).runtime.runtimeActions.onAction(action);
    requireController(latest).runtime.commandIndex.onSearchChange('sales');
    await requireController(latest).runtime.commandIndex.onSelect(command);

    expect(selectedActionId).toBe('kolam-sync-finance');
    expect(searched).toBe('sales');
    expect(selectedCommandId).toBe(command.id);
  });
});
