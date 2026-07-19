import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {
  KolamCommandIndexPanel,
  KolamReadinessPanel,
  KolamRuntimeActionStrip,
  KolamRuntimeIdentityStrip,
  KolamSyncActivityPanel,
} from '../src/components/kolam-runtime-status-widgets';
import {getCommandIndex} from '../src/domain/command-index';
import {getNativeReadinessChecks} from '../src/domain/readiness';
import {
  getRuntimeIdentityItems,
  getRuntimeIdentitySummary,
} from '../src/domain/runtime-identity';
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

describe('runtime status widgets', () => {
  it('renders runtime identity, readiness, sync, actions, and command index', async () => {
    const readinessChecks = getNativeReadinessChecks();
    const runtimeIdentityItems = getRuntimeIdentityItems();
    const runtimeIdentitySummary = getRuntimeIdentitySummary(runtimeIdentityItems);
    const syncEntries = getSyncActivityEntries(seedUnifiedDataset, '10:00');
    const commands = getCommandIndex();
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
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Runtime',
        'readiness summary',
        'Native Route Coverage',
        'Current Filter',
        'POS',
      ]),
    );
  });
});
