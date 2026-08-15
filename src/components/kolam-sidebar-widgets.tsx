import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { getKolamWebSettingVersion } from '../services/kolam-api';
import { KolamSidebarBrand } from './kolam-sidebar-brand';
import {
  KolamSidebarContent,
  type KolamSidebarContentProps,
} from './kolam-sidebar-content';

export interface KolamSidebarProps extends KolamSidebarContentProps {}

export function KolamSidebar({
  accessScope,
  activeModule,
  activeModuleRoute,
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
}: KolamSidebarProps) {
  const [version, setVersion] = React.useState('-');

  React.useEffect(() => {
    let mounted = true;

    getKolamWebSettingVersion('junglesystem')
      .then(result => {
        if (mounted) {
          const nextVersion = String(result.version ?? '').trim();
          setVersion(nextVersion || '-');
        }
      })
      .catch(() => {
        if (mounted) {
          setVersion('-');
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const year = new Date().getFullYear();

  return (
    <View style={[styles.sidebar, collapsed && styles.sidebarCollapsed]}>
      <KolamSidebarBrand collapsed={collapsed} />
      <KolamSidebarContent
        accessScope={accessScope}
        activeModule={activeModule}
        activeModuleRoute={activeModuleRoute}
        activeRoute={activeRoute}
        collapsed={collapsed}
        expandedSections={expandedSections}
        filterMenuByAccess={filterMenuByAccess}
        onMoveMenuSection={onMoveMenuSection}
        onModuleRouteSelect={onModuleRouteSelect}
        onQuickSearch={onQuickSearch}
        onSelectMenuItem={onSelectMenuItem}
        onSelectModule={onSelectModule}
        onToggleMenuSection={onToggleMenuSection}
        sectionOrder={sectionOrder}
      />
      {collapsed ? null : (
        <View style={styles.sidebarFooter}>
          <Text style={styles.sidebarFooterText}>
            <Text>Versi </Text>
            <Text style={styles.sidebarFooterStrong}>{version}</Text>
            <Text style={styles.sidebarFooterMuted}> • </Text>
            <Text style={styles.sidebarFooterStrong}>
              © {year} Dunia Anura
            </Text>
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: V.layout.sidebarWidth,
    flexShrink: 0,
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
  sidebarFooter: {
    flexShrink: 0,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    paddingHorizontal: 8,
    paddingTop: 10,
  },
  sidebarFooterText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
    textAlign: 'center',
  },
  sidebarFooterStrong: {
    color: V.colors.sidebarFg,
  },
  sidebarFooterMuted: {
    color: V.colors.mutedFg,
  },
});
