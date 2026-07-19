import React from 'react';
import {StyleSheet, View} from 'react-native';
import {getSidebarBrand} from '../domain/app-shell';
import {KolamSidebarBrandEmblem} from './kolam-sidebar-brand-emblem';
import {KolamSidebarBrandWordmark} from './kolam-sidebar-brand-wordmark';

const SIDEBAR_BRAND = getSidebarBrand();

export function KolamSidebarBrand({collapsed}: {collapsed: boolean}) {
  return (
    <View style={[styles.brand, collapsed && styles.brandCollapsed]}>
      <View style={[styles.brandLogo, collapsed && styles.brandLogoCollapsed]}>
        <KolamSidebarBrandEmblem collapsed={collapsed} />
        {collapsed ? null : <KolamSidebarBrandWordmark />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: {
    minHeight: SIDEBAR_BRAND.expandedSize.height,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandCollapsed: {
    minHeight: SIDEBAR_BRAND.collapsedSize,
    marginBottom: 8,
  },
  brandLogo: {
    width: SIDEBAR_BRAND.expandedSize.width,
    height: SIDEBAR_BRAND.expandedSize.height,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  brandLogoCollapsed: {
    width: SIDEBAR_BRAND.collapsedSize,
    height: SIDEBAR_BRAND.collapsedSize,
    gap: 0,
  },
});
