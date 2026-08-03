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

describe('AM primary sidebar placement', () => {
  it('renders AM directly after POS without route count or dev planning entries', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamSidebarNavGroup
            activeModule="kolam"
            collapsed={false}
            label=""
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
    const posIndex = text.indexOf('POS');
    const amIndex = text.indexOf('AM');

    expect(posIndex).toBeGreaterThanOrEqual(0);
    expect(amIndex).toBe(posIndex + 1);
    expect(text).not.toContain('38');
    expect(text).not.toEqual(expect.arrayContaining(['Plugin', 'Persiapan']));
  });
});
