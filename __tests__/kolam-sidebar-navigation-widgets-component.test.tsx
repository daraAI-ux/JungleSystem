import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {
  KolamSidebarModuleGroup,
  KolamSidebarModuleGroups,
} from '../src/components/kolam-sidebar-navigation-widgets';

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

describe('sidebar navigation widgets', () => {
  it('renders Kolam and secondary module groups directly', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamSidebarModuleGroup
            activeModule="kolam"
            area="kolam"
            collapsed={false}
            label="Kolam"
            onSelect={() => undefined}
          />
          <KolamSidebarModuleGroups
            activeModule="plugins"
            collapsed={false}
            onSelect={() => undefined}
          />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Kolam',
        'POS',
        '5 modul / 19 route',
        'AM',
        '1 modul / 38 route',
        'Plugin',
        '1 modul / 9 route',
      ]),
    );
  });
});
