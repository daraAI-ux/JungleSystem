import React from 'react';
import { StyleSheet, View } from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamSidebarBrand } from './kolam-sidebar-brand';
import {
  KolamSidebarContent,
  type KolamSidebarContentProps,
} from './kolam-sidebar-content';

export interface KolamSidebarProps extends KolamSidebarContentProps {}

export function KolamSidebar({
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
}: KolamSidebarProps) {
  return (
    <View style={[styles.sidebar, collapsed && styles.sidebarCollapsed]}>
      <KolamSidebarBrand collapsed={collapsed} />
      <KolamSidebarContent
        accessScope={accessScope}
        activeModule={activeModule}
        activeRoute={activeRoute}
        collapsed={collapsed}
        expandedSections={expandedSections}
        filterMenuByAccess={filterMenuByAccess}
        onMoveMenuSection={onMoveMenuSection}
        onQuickSearch={onQuickSearch}
        onSelectMenuItem={onSelectMenuItem}
        onSelectModule={onSelectModule}
        onToggleMenuSection={onToggleMenuSection}
        sectionOrder={sectionOrder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: V.layout.sidebarWidth,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: V.colors.sidebar,
    borderRightColor: V.colors.border,
    borderRightWidth: 1,
  },
  sidebarCollapsed: {
    width: V.layout.sidebarDockWidth,
    paddingHorizontal: 6,
  },
});
