import React from 'react';
import { Text, View } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { KolamMenuGroup } from '../src/components/kolam-sidebar-menu-widgets';
import {
  filterKolamNavigationSectionsByAccess,
  kolamSidebarNavigationSections,
} from '../src/domain/kolam-navigation';

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

describe('KolamMenuGroup', () => {
  it('renders expanded menu and collapsed dock directly', async () => {
    let expanded: ReactTestRenderer.ReactTestRenderer;
    let collapsed: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      expanded = ReactTestRenderer.create(
        <View>
          <KolamMenuGroup
            accessScope={{ am: true, kolam: true, pos: true }}
            collapsed={false}
            expandedSections={{ dashboard: true }}
            filterByAccess={false}
            onMoveSection={() => undefined}
            onSelectItem={() => undefined}
            onToggleSection={() => undefined}
            sectionOrder={[]}
          />
        </View>,
      );
      collapsed = ReactTestRenderer.create(
        <View>
          <KolamMenuGroup
            accessScope={{ am: false, kolam: true, pos: true }}
            collapsed
            expandedSections={{}}
            filterByAccess
            onMoveSection={() => undefined}
            onSelectItem={() => undefined}
            onToggleSection={() => undefined}
            sectionOrder={[]}
          />
        </View>,
      );
    });

    const visibleDockInitials = filterKolamNavigationSectionsByAccess(
      kolamSidebarNavigationSections,
      { am: false, kolam: true, pos: true },
    ).map(section => section.title.charAt(0));

    expect(renderText(expanded!)).toContain('Kolam Menu');
    expect(renderText(collapsed!)).toEqual(
      expect.arrayContaining(visibleDockInitials),
    );
  });
});
