import React from 'react';
import {View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamJungleSystemLogo} from '../src/components/kolam-jungle-system-logo';
import {KolamSidebarBrand} from '../src/components/kolam-sidebar-brand';
import {getSidebarBrand} from '../src/domain/app-shell';

describe('KolamSidebarBrand', () => {
  it('renders the shared JungleSystem logo in expanded and collapsed states', async () => {
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

    const expandedLogo = expanded!.root.findByType(KolamJungleSystemLogo);
    const collapsedLogo = collapsed!.root.findByType(KolamJungleSystemLogo);

    expect(expandedLogo.props.accessibilityLabel).toBe(brand.title);
    expect(expandedLogo.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          height: '100%',
          width: '100%',
        }),
      ]),
    );
    expect(collapsedLogo.props.accessibilityLabel).toBe(brand.title);
    expect(collapsedLogo.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          height: brand.collapsedSize,
          width: brand.collapsedSize,
        }),
      ]),
    );
  });
});
