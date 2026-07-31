import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  AM_ROUTES,
  AM_ROUTE_SECTIONS,
  type AmRouteItem,
} from '../domain/am-navigation';
import type { AccessScope } from '../domain/auth';
import {
  getShellModuleRouteEntry,
  getShellModulesByArea,
  type AppModule,
  type ShellModule,
  type ShellModuleRouteEntry,
} from '../domain/app-shell';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import type { KolamNavigationItem } from '../domain/kolam-navigation';
import { KolamMappedList } from './kolam-mapped-list';
import { KolamQuickSearch } from './kolam-quick-search';
import { KolamNavItem } from './kolam-nav-item';
import { KolamSidebarNavGroup } from './kolam-sidebar-navigation-widgets';
import { KolamMenuGroup } from './kolam-sidebar-menu-widgets';

export interface KolamSidebarContentProps {
  accessScope: AccessScope;
  activeModule: AppModule;
  activeModuleRoute?: ShellModuleRouteEntry | null;
  activeRoute?: string | null;
  collapsed: boolean;
  expandedSections: Record<string, boolean>;
  filterMenuByAccess: boolean;
  onMoveMenuSection: (sectionId: string, direction: 'up' | 'down') => void;
  onModuleRouteSelect?: (route: ShellModuleRouteEntry) => void;
  onQuickSearch: () => void;
  onSelectMenuItem: (item: KolamNavigationItem) => void;
  onSelectModule: (module: AppModule) => void;
  onToggleMenuSection: (sectionId: string) => void;
  sectionOrder: string[];
}

export function KolamSidebarContent({
  accessScope,
  activeModule,
  activeRoute,
  collapsed,
  expandedSections,
  filterMenuByAccess,
  onMoveMenuSection,
  onModuleRouteSelect,
  onQuickSearch,
  onSelectMenuItem,
  onSelectModule,
  onToggleMenuSection,
  sectionOrder,
}: KolamSidebarContentProps) {
  const activeArea = getActiveSidebarArea(activeModule);
  const primaryModules = [
    ...getShellModulesByArea('kolam'),
    ...getShellModulesByArea('am'),
  ];
  const posModules = getShellModulesByArea('pos');

  return (
    <ScrollView
      style={styles.sidebarContent}
      contentContainerStyle={[
        styles.sidebarContentInner,
        collapsed && styles.sidebarContentInnerCollapsed,
      ]}
      showsVerticalScrollIndicator={false}
    >
      <KolamQuickSearch collapsed={collapsed} onPress={onQuickSearch} />
      {activeArea === 'am' ? (
        <KolamAmSidebarMenu
          activeModule={activeModule}
          activeRoute={activeRoute}
          collapsed={collapsed}
          onSelectModule={onSelectModule}
          onSelectRoute={onModuleRouteSelect ?? (() => undefined)}
        />
      ) : activeArea === 'pos' ? (
        <>
          <KolamSidebarNavGroup
            activeModule={activeModule}
            collapsed={collapsed}
            label="POS"
            modules={posModules}
            onSelect={onSelectModule}
          />
          <KolamSidebarNavGroup
            activeModule={activeModule}
            collapsed={collapsed}
            label="JungleSystem"
            modules={getShellModulesByArea('kolam')}
            onSelect={onSelectModule}
          />
        </>
      ) : (
        <>
          <KolamSidebarNavGroup
            activeModule={activeModule}
            collapsed={collapsed}
            label=""
            modules={primaryModules}
            onSelect={onSelectModule}
          />
          <KolamMenuGroup
            accessScope={accessScope}
            activeRoute={activeRoute}
            collapsed={collapsed}
            expandedSections={expandedSections}
            filterByAccess={filterMenuByAccess}
            onMoveSection={onMoveMenuSection}
            onSelectItem={onSelectMenuItem}
            onToggleSection={onToggleMenuSection}
            sectionOrder={sectionOrder}
          />
        </>
      )}
    </ScrollView>
  );
}

function KolamAmSidebarMenu({
  activeModule,
  activeRoute,
  collapsed,
  onSelectModule,
  onSelectRoute,
}: {
  activeModule: AppModule;
  activeRoute?: string | null;
  collapsed: boolean;
  onSelectModule: (module: AppModule) => void;
  onSelectRoute: (route: ShellModuleRouteEntry) => void;
}) {
  return (
    <>
      <View style={[styles.amMenuGroup, collapsed && styles.amMenuGroupCollapsed]}>
        {collapsed ? null : (
          <View style={styles.amMenuSectionHeader}>
            <Text style={styles.amMenuSectionLabel}>AM</Text>
            <Text style={styles.amMenuSectionMeta}>Automation Management</Text>
          </View>
        )}
        {AM_ROUTE_SECTIONS.map(section => (
          <View key={section} style={styles.amMenuSection}>
            {collapsed ? null : (
              <Text style={styles.amMenuSectionLabel}>{section}</Text>
            )}
            <KolamMappedList
              items={AM_ROUTES.filter(item => item.section === section)}
              getKey={item => item.id}
              renderItem={item => (
                <KolamNavItem
                  active={isAmRouteActive(item, activeRoute)}
                  collapsed={collapsed}
                  module={toAmShellModule(item)}
                  onPress={() => {
                    const route = getShellModuleRouteEntry('am', item.moduleRoute);
                    if (route) {
                      onSelectRoute(route);
                    }
                  }}
                />
              )}
            />
          </View>
        ))}
      </View>
      <KolamSidebarNavGroup
        activeModule={activeModule}
        collapsed={collapsed}
        label="JungleSystem"
        modules={getShellModulesByArea('kolam')}
        onSelect={onSelectModule}
      />
    </>
  );
}

function toAmShellModule(item: AmRouteItem): ShellModule {
  return {
    id: 'am',
    area: 'am',
    label: item.label,
    iconKind: 'automation',
    sourceRepo: 'E:\\Projects\\da-automation-management',
    summary: item.description,
    routes: [item.moduleRoute],
  };
}

function isAmRouteActive(item: AmRouteItem, activeRoute?: string | null) {
  if (!activeRoute) return item.id === 'dashboard';
  const normalizedActiveRoute =
    activeRoute === '/' ? '/' : activeRoute.replace(/^\/+/, '').replace(/\/+$/, '');
  const normalizedItemRoute =
    item.moduleRoute === '/'
      ? '/'
      : item.moduleRoute.replace(/^\/+/, '').replace(/\/+$/, '');

  return (
    normalizedActiveRoute === normalizedItemRoute ||
    (normalizedItemRoute !== '/' &&
      normalizedActiveRoute.startsWith(`${normalizedItemRoute}/`))
  );
}

function getActiveSidebarArea(module: AppModule) {
  if (getShellModulesByArea('pos').some(item => item.id === module)) return 'pos';
  if (module === 'am') return 'am';
  return 'kolam';
}

const styles = StyleSheet.create({
  sidebarContent: {
    flex: 1,
  },
  sidebarContentInner: {
    paddingBottom: 12,
  },
  sidebarContentInnerCollapsed: {
    alignItems: 'center',
  },
  amMenuGroup: {
    gap: 8,
    marginTop: 2,
    marginBottom: V.layout.navSectionGap,
  },
  amMenuGroupCollapsed: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  amMenuSection: {
    paddingHorizontal: 10,
    paddingVertical: 1,
  },
  amMenuSectionHeader: {
    paddingHorizontal: 12,
  },
  amMenuSectionLabel: {
    marginBottom: 4,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  amMenuSectionMeta: {
    marginBottom: 6,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
  },
});
