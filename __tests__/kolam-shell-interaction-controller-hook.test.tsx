import React, {useState} from 'react';
import ReactTestRenderer from 'react-test-renderer';
import type {CommandEntry} from '../src/domain/command-index';
import type {RuntimeAction} from '../src/domain/runtime-actions';
import {useKolamShellInteractionController} from '../src/hooks/use-kolam-shell-interaction-controller';

type ShellInteractionController = ReturnType<
  typeof useKolamShellInteractionController
>;

const command: CommandEntry = {
  area: 'pos',
  description: 'Buka checkout',
  id: 'module:checkout',
  kind: 'module',
  label: 'Checkout',
  moduleId: 'checkout',
  source: 'test',
};

const runtimeAction: RuntimeAction = {
  area: 'pos',
  description: 'Create sale draft',
  id: 'pos-create-sale-draft',
  label: 'Create sale draft',
  moduleId: 'checkout',
  requiredAccess: 'pos',
  sourceContract: 'POST /sales channel=pos',
  status: 'live-api',
  statusIconKind: 'activity',
};

function requireController(controller: ShellInteractionController | null) {
  if (!controller) {
    throw new Error('Shell interaction controller did not render.');
  }

  return controller;
}

function ShellInteractionHarness({
  onCommand,
  onFlags,
  onRender,
  onRuntimeAction,
}: {
  onCommand: (
    command: CommandEntry,
    onRuntimeAction: (action: RuntimeAction) => Promise<void>,
  ) => Promise<void>;
  onFlags: (flags: {
    attentionOpen: boolean;
    commandPaletteOpen: boolean;
    userMenuOpen: boolean;
  }) => void;
  onRender: (controller: ShellInteractionController) => void;
  onRuntimeAction: (action: RuntimeAction) => Promise<void>;
}) {
  const [attentionOpen, setIsAttentionPanelOpen] = useState(true);
  const [commandPaletteOpen, setIsCommandPaletteOpen] = useState(true);
  const [userMenuOpen, setIsUserMenuOpen] = useState(true);
  const controller = useKolamShellInteractionController({
    onCommand,
    onRuntimeAction,
    setIsAttentionPanelOpen,
    setIsCommandPaletteOpen,
    setIsUserMenuOpen,
  });

  onFlags({attentionOpen, commandPaletteOpen, userMenuOpen});
  onRender(controller);
  return null;
}

describe('Kolam shell interaction controller hook', () => {
  it('routes command selections through the shared navigation/runtime bridge', async () => {
    let latest: ShellInteractionController | null = null;
    const commands: CommandEntry[] = [];
    const runtimeActions: RuntimeAction[] = [];

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <ShellInteractionHarness
          onCommand={async (selectedCommand, onRuntimeAction) => {
            commands.push(selectedCommand);
            await onRuntimeAction(runtimeAction);
          }}
          onFlags={() => undefined}
          onRender={controller => {
            latest = controller;
          }}
          onRuntimeAction={async action => {
            runtimeActions.push(action);
          }}
        />,
      );
    });

    await ReactTestRenderer.act(async () => {
      await requireController(latest).handleCommandSelect(command);
    });

    expect(commands).toEqual([command]);
    expect(runtimeActions).toEqual([runtimeAction]);
  });

  it('centralizes shell overlay close handlers', async () => {
    let latest: ShellInteractionController | null = null;
    let flags = {
      attentionOpen: false,
      commandPaletteOpen: false,
      userMenuOpen: false,
    };

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <ShellInteractionHarness
          onCommand={async () => undefined}
          onFlags={nextFlags => {
            flags = nextFlags;
          }}
          onRender={controller => {
            latest = controller;
          }}
          onRuntimeAction={async () => undefined}
        />,
      );
    });

    expect(flags).toEqual({
      attentionOpen: true,
      commandPaletteOpen: true,
      userMenuOpen: true,
    });

    await ReactTestRenderer.act(async () => {
      const controller = requireController(latest);
      controller.handleAttentionClose();
      controller.handleCommandPaletteClose();
      controller.handleUserMenuClose();
    });

    expect(flags).toEqual({
      attentionOpen: false,
      commandPaletteOpen: false,
      userMenuOpen: false,
    });
  });
});
