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
  type ShellModuleRouteEntry,
} from '../domain/app-shell';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import type { KolamNavigationItem } from '../domain/kolam-navigation';
import { KolamQuickSearch } from './kolam-quick-search';
import { KolamSidebarNavGroup } from './kolam-sidebar-navigation-widgets';
import { KolamMenuGroup } from './kolam-sidebar-menu-widgets';
import { KolamMenuSectionItems } from './kolam-menu-section-items';

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
          activeRoute={activeRoute}
          collapsed={collapsed}
          onBackToKolam={() => onSelectModule('kolam')}
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
  activeRoute,
  collapsed,
  onBackToKolam,
  onSelectRoute,
}: {
  activeRoute?: string | null;
  collapsed: boolean;
  onBackToKolam: () => void;
  onSelectRoute: (route: ShellModuleRouteEntry) => void;
}) {
  if (collapsed) {
    return (
      <KolamSidebarNavGroup
        activeModule="am"
        collapsed
        label="AM"
        modules={getShellModulesByArea('am')}
        onSelect={() => undefined}
      />
    );
  }

  return (
    <View style={styles.amMenuGroup}>
      <KolamSidebarNavGroup
        activeModule="am"
        collapsed={false}
        label="AM"
        meta="Automation Management"
        modules={getShellModulesByArea('am')}
        onSelect={() => undefined}
      />
      {AM_ROUTE_SECTIONS.map(section => (
        <View key={section} style={styles.amMenuSection}>
          <Text style={styles.amMenuSectionLabel}>{section}</Text>
          <KolamMenuSectionItems
            activeRoute={activeRoute}
            items={AM_ROUTES.filter(item => item.section === section).map(toAmNavigationItem)}
            onSelectItem={item => {
              const route = getShellModuleRouteEntry('am', getAmModuleRoute(item.route));
              if (route) {
                onSelectRoute(route);
              }
            }}
          />
        </View>
      ))}
      <View style={styles.amMenuSection}>
        <Text style={styles.amMenuSectionLabel}>JungleSystem</Text>
        <KolamMenuSectionItems
          activeRoute={null}
          items={[
            {
              label: 'Kembali ke Kolam',
              route: '/kolam',
              description: 'Kembali ke sidebar utama Kolam.',
              requiredAccess: ['kolam', 'pos', 'am'],
            },
          ]}
          onSelectItem={() => onBackToKolam()}
        />
      </View>
    </View>
  );
}

function toAmNavigationItem(item: AmRouteItem): KolamNavigationItem {
  return {
    label: item.label,
    route: item.path,
    description: item.description,
    requiredAccess: ['am'],
  };
}

function getAmModuleRoute(route: string) {
  if (route === '/') return '/';
  return route.replace(/^\/+/, '');
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
  amMenuSection: {
    paddingHorizontal: 10,
    paddingVertical: 1,
  },
  amMenuSectionLabel: {
    marginBottom: 4,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});
