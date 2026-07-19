import React from 'react';
import { Text, View } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { KolamSidebar } from '../src/components/kolam-sidebar-widgets';
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

describe('KolamSidebar', () => {
  it('renders expanded module groups and Kolam menu sections', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamSidebar
            accessScope={{ am: true, kolam: true, pos: true }}
            activeModule="kolam"
            collapsed={false}
            expandedSections={{ dashboard: true }}
            filterMenuByAccess={false}
            onMoveMenuSection={() => undefined}
            onQuickSearch={() => undefined}
            onSelectMenuItem={() => undefined}
            onSelectModule={() => undefined}
            onToggleMenuSection={() => undefined}
            sectionOrder={[]}
          />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Kolam',
        'Kolam Menu',
        'POS',
        '5 modul / 19 route',
        'AM',
        '1 modul / 38 route',
        'Plugin',
        '1 modul / 9 route',
      ]),
    );
  });

  it('renders collapsed menu dock without expanded text chrome', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamSidebar
            accessScope={{ am: false, kolam: true, pos: true }}
            activeModule="checkout"
            collapsed
            expandedSections={{}}
            filterMenuByAccess
            onMoveMenuSection={() => undefined}
            onQuickSearch={() => undefined}
            onSelectMenuItem={() => undefined}
            onSelectModule={() => undefined}
            onToggleMenuSection={() => undefined}
            sectionOrder={[]}
          />
        </View>,
      );
    });

    const text = renderText(renderer!);
    const visibleDockInitials = filterKolamNavigationSectionsByAccess(
      kolamSidebarNavigationSections,
      { am: false, kolam: true, pos: true },
    ).map(section => section.title.charAt(0));

    expect(text).toEqual(expect.arrayContaining(visibleDockInitials));
    expect(text).not.toContain('Kolam Menu');
    expect(text).not.toContain('5 modul / 19 route');
  });
});
