import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamSidebarBrand} from '../src/components/kolam-sidebar-brand';
import {getSidebarBrand} from '../src/domain/app-shell';

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

describe('KolamSidebarBrand', () => {
  it('renders expanded brand wordmark and hides it when collapsed', async () => {
    const brand = getSidebarBrand();
    let expanded: ReactTestRenderer.ReactTestRenderer;
    let collapsed: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      expanded = ReactTestRenderer.create(
        <View>
          <KolamSidebarBrand collapsed={false} />
        </View>,
      );
      collapsed = ReactTestRenderer.create(
        <View>
          <KolamSidebarBrand collapsed />
        </View>,
      );
    });

    expect(renderText(expanded!)).toEqual(
      expect.arrayContaining([brand.title, brand.subtitle]),
    );
    expect(renderText(collapsed!)).not.toContain(brand.title);
  });
});
