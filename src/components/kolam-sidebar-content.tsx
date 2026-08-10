import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  AM_ROUTE_SECTIONS,
  AM_SIDEBAR_ROUTES,
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
import {
  getAmCurrentUser,
  type AmCurrentUser,
} from '../services/am-api';
import { KolamMappedList } from './kolam-mapped-list';
import { KolamNavItem } from './kolam-nav-item';
import { KolamCopyStack } from './kolam-copy-stack';
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
  activeModuleRoute,
  activeRoute,
  collapsed,
  expandedSections,
  filterMenuByAccess,
  onMoveMenuSection,
  onModuleRouteSelect,
  onSelectMenuItem,
  onSelectModule,
  onToggleMenuSection,
  sectionOrder,
}: KolamSidebarContentProps) {
  const activeArea = getActiveSidebarArea(activeModule, accessScope);
  const activeAmRoute =
    activeArea === 'am' ? activeModuleRoute?.route ?? activeRoute : activeRoute;
  const primaryModules = [
    ...getShellModulesByArea('kolam'),
    ...(accessScope.am ? getShellModulesByArea('am') : []),
  ];
  const amBackModules = getShellModulesByArea('kolam').filter(
    module => module.id !== 'checkout',
  );
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
      {activeArea === 'am' ? (
        <>
          <KolamAmSidebarMenu
            activeRoute={activeAmRoute}
            collapsed={collapsed}
            onSelectRoute={onModuleRouteSelect ?? (() => undefined)}
          />
          <KolamSidebarNavGroup
            activeModule={activeModule}
            collapsed={collapsed}
            label="JungleSystem"
            modules={amBackModules}
            onSelect={onSelectModule}
          />
        </>
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
            compactBottomGap
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
  onSelectRoute,
}: {
  activeRoute?: string | null;
  collapsed: boolean;
  onSelectRoute: (route: ShellModuleRouteEntry) => void;
}) {
  const [currentUser, setCurrentUser] =
    React.useState<AmCurrentUser | null>(null);

  React.useEffect(() => {
    let mounted = true;

    getAmCurrentUser()
      .then(user => {
        if (mounted) {
          setCurrentUser(user);
        }
      })
      .catch(() => {
        if (mounted) {
          setCurrentUser(null);
        }
      });

    return () => {
      mounted = false;
    };
  }, [activeRoute]);

  return (
    <View style={[styles.amMenuGroup, collapsed && styles.amMenuGroupCollapsed]}>
      {collapsed ? null : (
        <KolamCopyStack
          items={[
            {id: 'label', text: 'AM', style: styles.amMenuGroupLabel},
          ]}
        />
      )}
      <KolamMappedList
        items={getAmSidebarSections(currentUser)}
        getKey={section => section.id}
        renderItem={section => (
          <KolamAmSidebarSection
            activeRoute={activeRoute}
            collapsed={collapsed}
            onSelectRoute={onSelectRoute}
            section={section}
          />
        )}
      />
    </View>
  );
}

function KolamAmSidebarSection({
  activeRoute,
  collapsed,
  onSelectRoute,
  section,
}: {
  activeRoute?: string | null;
  collapsed: boolean;
  onSelectRoute: (route: ShellModuleRouteEntry) => void;
  section: AmSidebarSection;
}) {
  return (
    <View style={styles.amMenuSection}>
      {collapsed ? null : (
        <KolamCopyStack
          items={[
            {id: 'label', text: section.label, style: styles.amMenuSectionLabel},
          ]}
        />
      )}
      <KolamMappedList
        items={section.items}
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
  );
}

type AmSidebarSection = {
  id: string;
  label: string;
  items: AmRouteItem[];
};

function getAmSidebarSections(currentUser: AmCurrentUser | null): AmSidebarSection[] {
  return AM_ROUTE_SECTIONS.map(section => ({
    id: section,
    label: section,
    items: AM_SIDEBAR_ROUTES.filter(
      route =>
        route.section === section &&
        canShowAmSidebarRoute(route, currentUser),
    ),
  })).filter(section => section.items.length > 0);
}

function canShowAmSidebarRoute(
  route: AmRouteItem,
  currentUser: AmCurrentUser | null,
) {
  if (route.id === 'users') {
    return hasAmSidebarPermission(currentUser, 'user:read');
  }

  if (route.id === 'activity-log') {
    return currentUser?.role?.name === 'Super Admin';
  }

  return true;
}

function hasAmSidebarPermission(
  currentUser: AmCurrentUser | null,
  permission: string,
) {
  return currentUser?.role?.permissions.includes(permission) ?? false;
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

function getActiveSidebarArea(module: AppModule, accessScope: AccessScope) {
  if (getShellModulesByArea('pos').some(item => item.id === module)) return 'pos';
  if (module === 'am' && accessScope.am) return 'am';
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
    marginTop: 2,
    marginBottom: V.layout.navSectionGap,
  },
  amMenuGroupCollapsed: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  amMenuGroupLabel: {
    paddingHorizontal: 12,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  amMenuSection: {
    gap: 1,
    marginTop: 8,
  },
  amMenuSectionLabel: {
    paddingHorizontal: 12,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  amAccountPanel: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: V.colors.border,
    paddingHorizontal: 10,
    paddingTop: 12,
    gap: 8,
  },
  amAccountAvatar: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: V.colors.primarySoft,
  },
  amAccountAvatarText: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  amAccountCopy: {
    minWidth: 0,
  },
  amAccountName: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  amAccountUsername: {
    marginTop: 2,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  amAccountActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  amAccountError: {
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
});
