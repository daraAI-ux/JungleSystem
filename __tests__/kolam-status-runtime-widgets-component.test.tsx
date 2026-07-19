import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {
  KolamAttentionPanel,
  KolamCommandIndexPanel,
  KolamReadinessPanel,
  KolamRuntimeActionStrip,
  KolamRuntimeIdentityStrip,
  KolamSyncActivityPanel,
} from '../src/components/kolam-status-runtime-widgets';
import {getAttentionPanelItems} from '../src/domain/attention-panel';
import {getCommandIndex} from '../src/domain/command-index';
import {getNativeReadinessChecks} from '../src/domain/readiness';
import {
  getRuntimeIdentityItems,
  getRuntimeIdentitySummary,
} from '../src/domain/runtime-identity';
import {getSyncActivityEntries} from '../src/domain/sync-activity';
import {seedUnifiedDataset} from '../src/services/unified-data';

function renderText(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root.findAllByType(Text).map(node => node.props.children);
}

describe('status and runtime Kolam widgets', () => {
  it('renders status, readiness, sync, and command surfaces', async () => {
    const readinessChecks = getNativeReadinessChecks();
    const runtimeIdentityItems = getRuntimeIdentityItems();
    const runtimeIdentitySummary = getRuntimeIdentitySummary(runtimeIdentityItems);
    const syncEntries = getSyncActivityEntries(seedUnifiedDataset, '10:00');
    const commands = getCommandIndex();
    const attentionItems = getAttentionPanelItems({
      checks: readinessChecks,
      sync: seedUnifiedDataset.sync,
    });
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamRuntimeIdentityStrip
            items={runtimeIdentityItems}
            meta={`${runtimeIdentitySummary.ready} ready`}
          />
          <KolamSyncActivityPanel entries={syncEntries} />
          <KolamReadinessPanel
            checks={readinessChecks}
            summaryText="readiness summary"
          />
          <KolamRuntimeActionStrip
            accessScope={{am: true, kolam: true, pos: true}}
            moduleId="checkout"
            onAction={() => undefined}
          />
          <KolamCommandIndexPanel
            commands={commands}
            totalCount={commands.length}
            search=""
            onSearchChange={() => undefined}
            onSelect={() => undefined}
          />
          <KolamAttentionPanel
            items={attentionItems}
            unreadCount={attentionItems.filter(item => item.isUnread).length}
            onClose={() => undefined}
            onSeeAll={() => undefined}
          />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Runtime',
        'POS',
        'readiness summary',
        'Notifications',
      ]),
    );
  });
});
