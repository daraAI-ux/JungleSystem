import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {
  KolamAttentionPanel,
  KolamCommandPaletteOverlay,
  KolamUserMenuPanel,
} from '../src/components/kolam-overlay-status-widgets';
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

describe('overlay status widgets', () => {
  it('renders attention, user menu, and command palette overlays', async () => {
    const attentionItems = getAttentionPanelItems({
      checks: getNativeReadinessChecks(),
      sync: seedUnifiedDataset.sync,
    });
    const commands = getCommandIndex();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamAttentionPanel
            items={attentionItems}
            unreadCount={attentionItems.filter(item => item.isUnread).length}
            onClose={() => undefined}
            onSeeAll={() => undefined}
          />
          <KolamUserMenuPanel
            accessScope={{am: true, kolam: true, pos: true}}
            displayName="Dunia Anura"
            email="kolam@example.test"
            initials="DA"
            items={getTopNavUserMenuItems()}
            onClose={() => undefined}
            onSelect={() => undefined}
          />
          <KolamCommandPaletteOverlay
            commands={commands}
            search=""
            onClose={() => undefined}
            onSearchChange={() => undefined}
            onSelect={() => undefined}
          />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['Notifications', 'Dunia Anura', 'Esc']),
    );
  });
});
