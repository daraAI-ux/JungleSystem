import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {
  KolamUnifiedRuntimeFooter,
  KolamUnifiedSourcePanel,
} from '../src/components/kolam-unified-source-widgets';
import {getShellModule} from '../src/domain/app-shell';
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

describe('unified source widgets', () => {
  it('renders source panel and runtime footer directly', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamUnifiedSourcePanel
            module={getShellModule('kolam')}
            dataset={seedUnifiedDataset}
            pluginCount={0}
            totalPluginCount={0}
          />
          <KolamUnifiedRuntimeFooter />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['Source repo live', 'Unified runtime']),
    );
  });
});
