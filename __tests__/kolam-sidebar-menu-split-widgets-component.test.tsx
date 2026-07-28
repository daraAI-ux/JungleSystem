import React from 'react';
import { Text, View } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { KolamMenuDock } from '../src/components/kolam-menu-dock-widgets';
import { KolamMenuSection } from '../src/components/kolam-menu-section-widgets';
import { KolamMenuTitle } from '../src/components/kolam-menu-title';
import { kolamNavigationSections } from '../src/domain/kolam-navigation';

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

describe('sidebar menu split widgets', () => {
  it('renders dock, title, and section direct imports', async () => {
    const firstSection = kolamNavigationSections[0];
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamMenuTitle
            filterByAccess
            itemCount={firstSection.items.length}
          />
          <KolamMenuDock sections={kolamNavigationSections.slice(0, 2)} />
          <KolamMenuSection
            expanded
            section={firstSection}
            onMove={() => undefined}
            onSelectItem={() => undefined}
            onToggle={() => undefined}
          />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Kolam Menu',
        firstSection.title,
        firstSection.items[0].label,
      ]),
    );
    expect(
      renderer!.root.findAll(
        node =>
          node.props.testID === `kolam-menu-section-icon:${firstSection.id}`,
      ).length,
    ).toBeGreaterThan(0);
    expect(
      renderer!.root.findAll(
        node =>
          node.props.testID ===
          `kolam-menu-item-icon:${firstSection.items[0].route}`,
      ).length,
    ).toBeGreaterThan(0);
  });
});
