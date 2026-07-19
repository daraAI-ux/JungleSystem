import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import type {AccessScope} from '../src/domain/auth';
import type {AppModule} from '../src/domain/app-shell';
import type {RuntimeAction} from '../src/domain/runtime-actions';
import {runtimeActions} from '../src/domain/runtime-actions';
import {useKolamRuntimeActionController} from '../src/hooks/use-kolam-runtime-action-controller';

type RuntimeActionController = ReturnType<
  typeof useKolamRuntimeActionController
>;

const allAccess: AccessScope = {kolam: true, pos: true, am: true};
const noAccess: AccessScope = {kolam: false, pos: false, am: false};

function requireAction(id: string) {
  const action = runtimeActions.find(item => item.id === id);

  if (!action) {
    throw new Error(`Runtime action not found: ${id}`);
  }

  return action;
}

function requireController(controller: RuntimeActionController | null) {
  if (!controller) {
    throw new Error('Runtime action controller did not render.');
  }

  return controller;
}

function RuntimeActionHarness({
  accessScope = allAccess,
  onCloseCashflow = async () => undefined,
  onCreateSaleDraft = async () => undefined,
  onMessage,
  onOpenCashflow = async () => undefined,
  onPluginSearchChange = () => undefined,
  onRefreshDataset = async () => undefined,
  onRender,
  onSelectModule = () => undefined,
}: {
  accessScope?: AccessScope;
  onCloseCashflow?: () => Promise<void>;
  onCreateSaleDraft?: () => Promise<void>;
  onMessage: (message: string) => void;
  onOpenCashflow?: () => Promise<void>;
  onPluginSearchChange?: (search: string) => void;
  onRefreshDataset?: (
    preferLiveApi: boolean,
    enabledAreas?: AccessScope,
  ) => Promise<void>;
  onRender: (controller: RuntimeActionController) => void;
  onSelectModule?: (module: AppModule) => void;
}) {
  const controller = useKolamRuntimeActionController({
    accessScope,
    onCloseCashflow,
    onCreateSaleDraft,
    onMessage,
    onOpenCashflow,
    onPluginSearchChange,
    onRefreshDataset,
    onSelectModule,
  });

  onRender(controller);
  return null;
}

describe('Kolam runtime action controller hook', () => {
  it('blocks runtime actions when the current access scope is missing', async () => {
    let latest: RuntimeActionController | null = null;
    let message = '';

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <RuntimeActionHarness
          accessScope={noAccess}
          onMessage={nextMessage => {
            message = nextMessage;
          }}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      await requireController(latest).handleRuntimeAction(
        requireAction('pos-search-catalog'),
      );
    });

    expect(message).toBe('Search sellable catalog membutuhkan akses pos.');
  });

  it('refreshes live server data for Kolam and AM sync actions', async () => {
    let latest: RuntimeActionController | null = null;
    const refreshes: Array<{
      enabledAreas?: AccessScope;
      preferLiveApi: boolean;
    }> = [];

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <RuntimeActionHarness
          onMessage={() => undefined}
          onRefreshDataset={async (preferLiveApi, enabledAreas) => {
            refreshes.push({enabledAreas, preferLiveApi});
          }}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      await requireController(latest).handleRuntimeAction(
        requireAction('kolam-sync-finance'),
      );
    });

    expect(refreshes).toEqual([{enabledAreas: allAccess, preferLiveApi: true}]);
  });

  it('routes native POS actions to the matching module affordance', async () => {
    let latest: RuntimeActionController | null = null;
    const messages: string[] = [];
    const selectedModules: AppModule[] = [];

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <RuntimeActionHarness
          onMessage={message => messages.push(message)}
          onRender={controller => {
            latest = controller;
          }}
          onSelectModule={module => selectedModules.push(module)}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      await requireController(latest).handleRuntimeAction(
        requireAction('pos-create-customer'),
      );
      await requireController(latest).handleRuntimeAction(
        requireAction('pos-update-sale-status'),
      );
    });

    expect(selectedModules).toEqual(['customer', 'sales']);
    expect(messages).toEqual([
      'Isi form customer untuk membuat customer POS baru.',
      'Pilih sale lalu ubah status dari modul Sales.',
    ]);
  });

  it('keeps plugin explorer filters centralized in the dispatcher', async () => {
    let latest: RuntimeActionController | null = null;
    const messages: string[] = [];
    const selectedModules: AppModule[] = [];
    const searches: string[] = [];

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <RuntimeActionHarness
          onMessage={message => messages.push(message)}
          onPluginSearchChange={search => searches.push(search)}
          onRender={controller => {
            latest = controller;
          }}
          onSelectModule={module => selectedModules.push(module)}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      await requireController(latest).handleRuntimeAction(
        requireAction('plugin-route-explorer'),
      );
      await requireController(latest).handleRuntimeAction(
        requireAction('plugin-version-audit'),
      );
    });

    expect(selectedModules).toEqual(['plugins', 'plugins']);
    expect(searches).toEqual(['', 'version-mismatch']);
    expect(messages).toEqual([
      'Plugin route explorer menampilkan semua route host.',
      'Plugin Hub difilter ke manifest/package mismatch.',
    ]);
  });

  it('describes source-audit actions that do not have a native handler yet', async () => {
    let latest: RuntimeActionController | null = null;
    let message = '';
    const action: RuntimeAction = {
      ...requireAction('kolam-review-operations'),
      id: 'kolam-review-operations-unhandled',
    };

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <RuntimeActionHarness
          onMessage={nextMessage => {
            message = nextMessage;
          }}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      await requireController(latest).handleRuntimeAction(action);
    });

    expect(message).toBe(
      'Review operations: source-audit - da-inventory-frontend routes',
    );
  });
});
