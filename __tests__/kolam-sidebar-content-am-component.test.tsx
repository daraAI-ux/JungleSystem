import React from 'react';
import { Text, View } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { KolamSidebarContent } from '../src/components/kolam-sidebar-content';

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

describe('KolamSidebarContent AM mode', () => {
  it('replaces the Kolam menu body with AM routes in the main sidebar', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamSidebarContent
            accessScope={{ am: true, kolam: true, pos: true }}
            activeModule="am"
            activeRoute="/services"
            collapsed={false}
            expandedSections={{ dashboard: true }}
            filterMenuByAccess={false}
            onModuleRouteSelect={() => undefined}
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

    expect(text).toEqual(
      expect.arrayContaining([
        'AM',
        'Automation Management',
        'Overview',
        'Dashboard',
        'Automation',
        'Tasks',
        'Services',
        'Infrastructure',
        'Hardware',
        'Webhooks',
        'Banking',
        'Transfers',
        'Mutations',
        'Administration',
        'Users',
        'Activity Log',
        'JungleSystem',
        'Kembali ke Kolam',
      ]),
    );
    expect(text).not.toContain('Kolam Menu');
  });
});
