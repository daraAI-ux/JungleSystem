import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamOverlaySurface} from '../src/components/kolam-overlay-surface';
import {getAttentionPanelItems} from '../src/domain/attention-panel';
import {getCommandIndex} from '../src/domain/command-index';
import {getNativeReadinessChecks} from '../src/domain/readiness';
import {getTopNavUserMenuItems} from '../src/domain/top-nav';
import {seedUnifiedDataset} from '../src/services/unified-data';

function renderText(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root
    .findAllByType(Text)
    .flatMap(node => flattenText(node.props.children));
}

function flattenText(value: React.ReactNode): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(flattenText);
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return [String(value)];
  }

  return [];
}

function buildOverlayProps(
  overrides: Partial<React.ComponentProps<typeof KolamOverlaySurface>> = {},
) {
  const commands = getCommandIndex();
  const attentionItems = getAttentionPanelItems({
    checks: getNativeReadinessChecks(),
    sync: seedUnifiedDataset.sync,
  });

  return {
    isAttentionOpen: false,
    isCommandPaletteOpen: false,
    isUserMenuOpen: false,
    userMenu: {
      items: getTopNavUserMenuItems('admin'),
      displayName: 'Dunia Anura',
      initials: 'DA',
      email: 'seed@kolam.local',
      accessScope: {am: true, kolam: true, pos: true},
      onClose: () => undefined,
      onSelect: () => undefined,
    },
    attention: {
      items: attentionItems,
      unreadCount: attentionItems.filter(item => item.isUnread).length,
      onClose: () => undefined,
      onSeeAll: () => undefined,
    },
    commandPalette: {
      commands,
      search: '',
      onSearchChange: () => undefined,
      onClose: () => undefined,
      onSelect: () => undefined,
    },
    ...overrides,
  } satisfies React.ComponentProps<typeof KolamOverlaySurface>;
}

describe('KolamOverlaySurface', () => {
  it('renders user menu when requested', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamOverlaySurface
            {...buildOverlayProps({isUserMenuOpen: true})}
          />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['Dunia Anura', 'seed@kolam.local']),
    );
  });

  it('renders command palette when requested', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamOverlaySurface
            {...buildOverlayProps({isCommandPaletteOpen: true})}
          />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['Esc', 'Dashboard']),
    );
  });
});
