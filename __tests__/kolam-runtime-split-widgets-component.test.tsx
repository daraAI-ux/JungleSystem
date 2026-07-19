import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamCommandIndexPanel} from '../src/components/kolam-command-index-widgets';
import {KolamReadinessPanel} from '../src/components/kolam-readiness-widgets';
import {KolamRuntimeActionStrip} from '../src/components/kolam-runtime-action-widgets';
import {KolamRuntimeIdentityStrip} from '../src/components/kolam-runtime-identity-widgets';
import {KolamStatusPanelFrame} from '../src/components/kolam-status-panel-frame';
import {KolamSyncActivityPanel} from '../src/components/kolam-sync-activity-widgets';
import {getCommandIndex} from '../src/domain/command-index';
import {getNativeReadinessChecks} from '../src/domain/readiness';
import {
  getRuntimeIdentityItems,
  getRuntimeIdentitySummary,
} from '../src/domain/runtime-identity';
import {getStatusPanelDescriptor} from '../src/domain/status-panel';
import {getSyncActivityEntries} from '../src/domain/sync-activity';
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

describe('runtime split widgets', () => {
  it('renders direct imports for the runtime status panels', async () => {
    const readinessChecks = getNativeReadinessChecks();
    const runtimeIdentityItems = getRuntimeIdentityItems();
    const runtimeIdentitySummary = getRuntimeIdentitySummary(runtimeIdentityItems);
    const syncEntries = getSyncActivityEntries(seedUnifiedDataset, '10:00');
    const commands = getCommandIndex();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamStatusPanelFrame
            panel={getStatusPanelDescriptor('runtime-actions')}
            meta="direct frame">
            <Text>Frame child</Text>
          </KolamStatusPanelFrame>
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
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Frame child',
        'Runtime',
        'readiness summary',
        'Native Route Coverage',
        'Command Groups',
        'POS',
      ]),
    );
  });
});
