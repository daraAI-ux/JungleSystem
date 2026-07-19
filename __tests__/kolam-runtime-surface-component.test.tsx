import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamRuntimeSurface} from '../src/components/kolam-runtime-surface';
import {authSources} from '../src/domain/auth';
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

describe('KolamRuntimeSurface', () => {
  it('renders runtime controls through one shared boundary', async () => {
    const runtimeIdentityItems = getRuntimeIdentityItems();
    const runtimeIdentitySummary =
      getRuntimeIdentitySummary(runtimeIdentityItems);
    const commands = getCommandIndex();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamRuntimeSurface
            auth={{
              accessScope: {am: true, kolam: true, pos: true},
              amApiBaseUrl: 'https://am.example.test',
              authEmail: '',
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
              onLogin: () => undefined,
              onLogout: () => undefined,
              onSync: () => undefined,
            }}
            runtimeIdentity={{
              items: runtimeIdentityItems,
              meta: `${runtimeIdentitySummary.ready} ready`,
            }}
            syncStatus={{
              message: 'Unified sync live',
              loading: false,
            }}
            syncActivity={getSyncActivityEntries(seedUnifiedDataset, '10:00')}
            readiness={{
              checks: getNativeReadinessChecks(),
              summaryText: 'readiness summary',
            }}
            runtimeActions={{
              accessScope: {am: true, kolam: true, pos: true},
              moduleId: 'checkout',
              onAction: () => undefined,
            }}
            commandIndex={{
              commands,
              totalCount: commands.length,
              search: '',
              onSearchChange: () => undefined,
              onSelect: () => undefined,
            }}
          />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Session',
        'Runtime',
        'Unified sync live',
        'readiness summary',
        'POS',
      ]),
    );
  });
});
