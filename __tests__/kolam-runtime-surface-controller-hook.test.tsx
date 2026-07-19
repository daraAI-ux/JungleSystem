import React, {useState} from 'react';
import ReactTestRenderer from 'react-test-renderer';
import type {AuthSource} from '../src/domain/auth';
import {getCommandIndex} from '../src/domain/command-index';
import {getNativeReadinessChecks} from '../src/domain/readiness';
import {getRuntimeIdentityItems} from '../src/domain/runtime-identity';
import type {RuntimeAction} from '../src/domain/runtime-actions';
import {getSyncActivityEntries} from '../src/domain/sync-activity';
import {useKolamRuntimeSurfaceController} from '../src/hooks/use-kolam-runtime-surface-controller';
import {seedUnifiedDataset} from '../src/services/unified-data';

type RuntimeSurfaceController = ReturnType<
  typeof useKolamRuntimeSurfaceController
>;

function requireController(controller: RuntimeSurfaceController | null) {
  if (!controller) {
    throw new Error('Runtime surface controller did not render.');
  }

  return controller;
}

function RuntimeSurfaceHarness({
  onRender,
  onRuntimeAction = async () => undefined,
  onSignIn = async () => undefined,
  onSignOut = async () => undefined,
  onSync = async () => undefined,
}: {
  onRender: (controller: RuntimeSurfaceController) => void;
  onRuntimeAction?: (action: RuntimeAction) => Promise<void>;
  onSignIn?: () => Promise<void>;
  onSignOut?: () => Promise<void>;
  onSync?: () => Promise<void>;
}) {
  const [amApiBaseUrl, setAmApiBaseUrl] = useState('https://am.example.test');
  const [authEmail, setAuthEmail] = useState('operator@example.test');
  const [authPassword, setAuthPassword] = useState('');
  const [authSource, setAuthSource] = useState<AuthSource>('pos');
  const [commandSearch, setCommandSearch] = useState('sale');
  const commands = getCommandIndex();
  const controller = useKolamRuntimeSurfaceController({
    accessScope: {am: true, kolam: true, pos: true},
    activeModule: 'checkout',
    amApiBaseUrl,
    authEmail,
    authMessage: 'Runtime server existing siap.',
    authPassword,
    authSource,
    authSourceHint: 'POS access_pos atau role POS.',
    commandSearch,
    commandTotalCount: commands.length,
    commands: commands.slice(0, 2),
    coverageCommands: commands,
    dataset: seedUnifiedDataset,
    displayName: 'Dunia Anura',
    isLoadingDataset: false,
    isSigningIn: false,
    onCommandSelect: async () => undefined,
    onRuntimeAction,
    onSignIn,
    onSignOut,
    onSync,
    readinessChecks: getNativeReadinessChecks(),
    readinessSummaryText: 'readiness summary',
    runtimeIdentityItems: getRuntimeIdentityItems(),
    runtimeIdentityMeta: '4 ready - 1 partial',
    setAmApiBaseUrl,
    setAuthEmail,
    setAuthPassword,
    setAuthSource,
    setCommandSearch,
    syncActivity: getSyncActivityEntries(seedUnifiedDataset, '10:00'),
  });

  onRender(controller);
  return null;
}

describe('Kolam runtime surface controller hook', () => {
  it('builds runtime panel props from app state without changing backend sync messaging', async () => {
    let latest: RuntimeSurfaceController | null = null;
    const totalCommands = getCommandIndex().length;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <RuntimeSurfaceHarness
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    const {runtime} = requireController(latest);
    expect(runtime.auth.authSource).toBe('pos');
    expect(runtime.auth.amApiBaseUrl).toBe('https://am.example.test');
    expect(runtime.syncStatus.message).toBe(
      'Sync: POS seed, Kolam seed, AM disabled.',
    );
    expect(runtime.commandIndex.commands).toHaveLength(2);
    expect(runtime.commandIndex.coverageCommands).toHaveLength(totalCommands);
    expect(runtime.commandIndex.totalCount).toBe(totalCommands);
    expect(runtime.runtimeActions.moduleId).toBe('checkout');
  });

  it('keeps auth field and runtime action callbacks live through the wrapper', async () => {
    let latest: RuntimeSurfaceController | null = null;
    const events: string[] = [];
    const action: RuntimeAction = {
      area: 'kolam',
      description: 'Refresh Kolam finance data.',
      id: 'kolam-sync-finance',
      label: 'Sync finance',
      moduleId: 'kolam',
      requiredAccess: 'kolam',
      sourceContract: 'GET /finance-summary',
      status: 'live-api',
      statusIconKind: 'activity',
    };

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <RuntimeSurfaceHarness
          onRender={controller => {
            latest = controller;
          }}
          onRuntimeAction={async nextAction => {
            events.push(nextAction.id);
          }}
          onSync={async () => {
            events.push('sync');
          }}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      const {runtime} = requireController(latest);
      runtime.auth.onAuthEmailChange('admin@example.test');
      runtime.auth.onSync();
      await runtime.runtimeActions.onAction(action);
    });

    expect(requireController(latest).runtime.auth.authEmail).toBe(
      'admin@example.test',
    );
    expect(events).toEqual(['sync', 'kolam-sync-finance']);
  });
});
