import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import type { AccessScope } from '../domain/auth';
import type { AppModule } from '../domain/app-shell';
import type { KolamNavigationItem } from '../domain/kolam-navigation';
import { KolamQuickSearch } from './kolam-quick-search';
import {
  KolamSidebarModuleGroup,
  KolamSidebarModuleGroups,
} from './kolam-sidebar-navigation-widgets';
import { KolamMenuGroup } from './kolam-sidebar-menu-widgets';

export interface KolamSidebarContentProps {
  accessScope: AccessScope;
  activeModule: AppModule;
  activeRoute?: string | null;
  collapsed: boolean;
  expandedSections: Record<string, boolean>;
  filterMenuByAccess: boolean;
  onMoveMenuSection: (sectionId: string, direction: 'up' | 'down') => void;
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
  onQuickSearch,
  onSelectMenuItem,
  onSelectModule,
  onToggleMenuSection,
  sectionOrder,
}: KolamSidebarContentProps) {
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
      <KolamSidebarModuleGroup
        activeModule={activeModule}
        area="kolam"
        collapsed={collapsed}
        label="Kolam"
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
      <KolamSidebarModuleGroups
        activeModule={activeModule}
        collapsed={collapsed}
        onSelect={onSelectModule}
      />
    </ScrollView>
  );
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
});
