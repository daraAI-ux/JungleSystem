import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamPluginRegistryList} from '../src/components/kolam-plugin-registry-widgets';
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

describe('plugin registry widgets', () => {
  it('renders plugin registry list directly', async () => {
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
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['Plugin', 'Capability / Source']),
    );
  });

  it('opens plugin routes from the registry launcher', async () => {
    const plugins = pluginRegistry.filter(plugin => plugin.id === 'chat');
    const routeIndex = getPluginRouteIndex(plugins);
    const teamChatRoute = routeIndex.find(route => route.route === '/team-chat');
    const onRouteSelect = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    if (!teamChatRoute) {
      throw new Error('Team Chat route is missing from plugin registry.');
    }

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamPluginRegistryList
            plugins={plugins}
            routeIndex={routeIndex}
            search="chat"
            onRouteSelect={onRouteSelect}
            onSearchChange={() => undefined}
          />
        </View>,
      );
    });

    await ReactTestRenderer.act(async () => {
      renderer!.root
        .findByProps({
          accessibilityLabel: 'Buka Chat /team-chat',
        })
        .props.onPress();
    });

    expect(onRouteSelect).toHaveBeenCalledWith(teamChatRoute);
  });
});
