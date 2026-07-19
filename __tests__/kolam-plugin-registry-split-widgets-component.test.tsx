import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamPluginRegistryList} from '../src/components/kolam-plugin-registry-list';
import {KolamPluginRegistryRow} from '../src/components/kolam-plugin-registry-row';
import {getPluginRouteIndex, pluginRegistry} from '../src/domain/unified';

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

describe('plugin registry split widgets', () => {
  it('renders direct imports for registry list and row', async () => {
    const plugins = pluginRegistry.slice(0, 2);
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamPluginRegistryList
            plugins={plugins}
            routeIndex={getPluginRouteIndex(plugins)}
            search="chat"
            onSearchChange={() => undefined}
          />
          <KolamPluginRegistryRow plugin={plugins[0]} />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Plugin',
        'Capability / Source',
        plugins[0].manifestName,
      ]),
    );
  });
});