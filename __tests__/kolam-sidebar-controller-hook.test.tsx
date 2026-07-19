import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import type {AppModule} from '../src/domain/app-shell';
import type {AccessScope} from '../src/domain/auth';
import type {KolamNavigationItem} from '../src/domain/kolam-navigation';
import {useKolamSidebarController} from '../src/hooks/use-kolam-sidebar-controller';

type SidebarController = ReturnType<typeof useKolamSidebarController>;

const accessScope: AccessScope = {
  kolam: true,
  pos: true,
  am: false,
};

const menuItem: KolamNavigationItem = {
  label: 'Customer Visit',
  route: '/customer-visit',
  description: 'Follow customer visits from Kolam',
  requiredAccess: ['kolam'],
};

function requireController(controller: SidebarController | null) {
  if (!controller) {
    throw new Error('Sidebar controller did not render.');
  }

  return controller;
}

function SidebarHarness({
  filterMenuByAccess,
  onRender,
}: {
  filterMenuByAccess: boolean;
  onRender: (controller: SidebarController) => void;
}) {
  const controller = useKolamSidebarController({
    accessScope,
    activeModule: 'kolam',
    collapsed: true,
    expandedSections: {operations: true},
    filterMenuByAccess,
    onMoveMenuSection: () => undefined,
    onQuickSearch: () => undefined,
    onSelectMenuItem: () => undefined,
    onSelectModule: () => undefined,
    onToggleMenuSection: () => undefined,
    sectionOrder: ['operations', 'finance'],
  });

  onRender(controller);
  return null;
}

describe('Kolam sidebar controller hook', () => {
  it('builds the app shell sidebar contract without changing navigation state', async () => {
    let latest: SidebarController | null = null;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <SidebarHarness
          filterMenuByAccess={true}
          onRender={controller => {
            latest = controller;
          }}
        />,
      );
    });

    const controller = requireController(latest);

    expect(controller.sidebar.accessScope).toBe(accessScope);
    expect(controller.sidebar.activeModule).toBe<AppModule>('kolam');
    expect(controller.sidebar.collapsed).toBe(true);
    expect(controller.sidebar.expandedSections).toEqual({operations: true});
    expect(controller.sidebar.filterMenuByAccess).toBe(true);
    expect(controller.sidebar.sectionOrder).toEqual(['operations', 'finance']);
  });

  it('keeps sidebar callbacks wired through the reusable controller', async () => {
    let latest: SidebarController | null = null;
    let selectedModule: AppModule | null = null;
    let selectedItemRoute = '';
    let movedSection = '';
    let moveDirection = '';
    let toggledSection = '';
    let quickSearchCount = 0;

    function CallbackHarness() {
      const controller = useKolamSidebarController({
        accessScope,
        activeModule: 'catalog',
        collapsed: false,
        expandedSections: {},
        filterMenuByAccess: false,
        onMoveMenuSection: (sectionId, direction) => {
          movedSection = sectionId;
          moveDirection = direction;
        },
        onQuickSearch: () => {
          quickSearchCount += 1;
        },
        onSelectMenuItem: item => {
          selectedItemRoute = item.route;
        },
        onSelectModule: module => {
          selectedModule = module;
        },
        onToggleMenuSection: sectionId => {
          toggledSection = sectionId;
        },
        sectionOrder: [],
      });

      latest = controller;
      return null;
    }

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(<CallbackHarness />);
    });

    const controller = requireController(latest);

    controller.sidebar.onSelectModule('plugins');
    controller.sidebar.onSelectMenuItem(menuItem);
    controller.sidebar.onMoveMenuSection('finance', 'up');
    controller.sidebar.onToggleMenuSection('operations');
    controller.sidebar.onQuickSearch();

    expect(selectedModule).toBe<AppModule>('plugins');
    expect(selectedItemRoute).toBe('/customer-visit');
    expect(movedSection).toBe('finance');
    expect(moveDirection).toBe('up');
    expect(toggledSection).toBe('operations');
    expect(quickSearchCount).toBe(1);
  });
});
