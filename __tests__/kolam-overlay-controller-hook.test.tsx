import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import type {AccessScope} from '../src/domain/auth';
import {getCommandIndex} from '../src/domain/command-index';
import {getTopNavUserMenuItems, type TopNavUserMenuItem} from '../src/domain/top-nav';
import {useKolamOverlayController} from '../src/hooks/use-kolam-overlay-controller';

type OverlayController = ReturnType<typeof useKolamOverlayController>;

function requireController(controller: OverlayController | null) {
  if (!controller) {
    throw new Error('Overlay controller did not render.');
  }

  return controller;
}

function OverlayHarness({
  accessScope,
  onRender,
}: {
  accessScope: AccessScope;
  onRender: (controller: OverlayController) => void;
}) {
  const controller = useKolamOverlayController({
    accessScope,
    attentionCount: 1,
    attentionItems: [
      {
        id: 'sync-kolam',
        label: 'KOLAM sync',
        message: 'fallback',
        meta: 'Unified sync',
        tone: 'warning',
        isUnread: true,
      },
    ],
    commandSearch: 'dashboard',
    commands: getCommandIndex().slice(0, 2),
    displayInitials: 'OO',
    displayName: 'Offline Operator',
    email: 'offline@example.test',
    isAttentionOpen: true,
    isCommandPaletteOpen: false,
    isUserMenuOpen: true,
    onAttentionClose: () => undefined,
    onCommandPaletteClose: () => undefined,
    onCommandSearchChange: () => undefined,
    onCommandSelect: async () => undefined,
    onSeeAllNotifications: () => undefined,
    onSignOut: async () => undefined,
    onUserMenuClose: () => undefined,
    onUserMenuSelect: async () => undefined,
    userMenuItems: getTopNavUserMenuItems('admin'),
  });

  onRender(controller);
  return null;
}

describe('Kolam overlay controller hook', () => {
  it('builds overlay props for user menu, attention, and command palette', async () => {
    let latest: OverlayController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <OverlayHarness
          accessScope={{am: true, kolam: true, pos: true}}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    const {overlay} = requireController(latest);

    expect(overlay.isUserMenuOpen).toBe(true);
    expect(overlay.isAttentionOpen).toBe(true);
    expect(overlay.userMenu).toEqual(
      expect.objectContaining({
        displayName: 'Offline Operator',
        initials: 'OO',
        email: 'offline@example.test',
      }),
    );
    expect(overlay.attention.unreadCount).toBe(1);
    expect(overlay.commandPalette.search).toBe('dashboard');
    expect(overlay.commandPalette.commands).toHaveLength(2);
  });

  it('forwards user menu selection with the provided sign out callback', async () => {
    const logoutItem: TopNavUserMenuItem = getTopNavUserMenuItems('admin').find(
      item => item.id === 'logout',
    )!;
    let selectedItemId: TopNavUserMenuItem['id'] | null = null;
    let didSignOut = false;
    let latest: OverlayController | null = null;

    function ForwardHarness() {
      const controller = useKolamOverlayController({
        accessScope: {am: true, kolam: true, pos: true},
        attentionCount: 0,
        attentionItems: [],
        commandSearch: '',
        commands: [],
        displayInitials: 'OO',
        displayName: 'Offline Operator',
        email: 'offline@example.test',
        isAttentionOpen: false,
        isCommandPaletteOpen: false,
        isUserMenuOpen: true,
        onAttentionClose: () => undefined,
        onCommandPaletteClose: () => undefined,
        onCommandSearchChange: () => undefined,
        onCommandSelect: async () => undefined,
        onSeeAllNotifications: () => undefined,
        onSignOut: async () => {
          didSignOut = true;
        },
        onUserMenuClose: () => undefined,
        onUserMenuSelect: async (item, onSignOut) => {
          selectedItemId = item.id;
          await onSignOut();
        },
        userMenuItems: [logoutItem],
      });

      latest = controller;
      return null;
    }

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(<ForwardHarness />);
    });

    await ReactTestRenderer.act(async () => {
      await requireController(latest).overlay.userMenu.onSelect(logoutItem);
    });

    expect(selectedItemId).toBe('logout');
    expect(didSignOut).toBe(true);
  });
});
