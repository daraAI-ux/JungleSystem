import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamSidebarNavGroup} from '../src/components/kolam-sidebar-navigation-widgets';
import {getShellModulesByArea} from '../src/domain/app-shell';

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
  it('renders AM in the primary module group without dev planning groups', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamSidebarNavGroup
            activeModule="kolam"
            collapsed={false}
            label="Kolam"
            modules={[
              ...getShellModulesByArea('kolam'),
              ...getShellModulesByArea('am'),
            ]}
            onSelect={() => undefined}
          />
        </View>,
      );
    });

    const text = renderText(renderer!);

    expect(text).toEqual(expect.arrayContaining(['Kolam', 'POS', 'AM']));
    expect(text).not.toContain('38');
    expect(text).not.toEqual(expect.arrayContaining(['Plugin', 'Persiapan']));
  });
});
