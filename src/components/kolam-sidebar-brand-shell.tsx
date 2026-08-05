import React from 'react';
import {StyleSheet, View} from 'react-native';
import {getSidebarBrand} from '../domain/app-shell';
import {KolamJungleSystemLogo} from './kolam-jungle-system-logo';

const SIDEBAR_BRAND = getSidebarBrand();

export function KolamSidebarBrand({collapsed}: {collapsed: boolean}) {
  return (
    <View style={[styles.brand, collapsed && styles.brandCollapsed]}>
      <View style={[styles.brandLogo, collapsed && styles.brandLogoCollapsed]}>
        <KolamJungleSystemLogo
          accessibilityLabel={SIDEBAR_BRAND.title}
          style={[styles.brandImage, collapsed && styles.brandImageCollapsed]}
        />
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogoCollapsed: {
    width: SIDEBAR_BRAND.collapsedSize,
    height: SIDEBAR_BRAND.collapsedSize,
  },
  brandImage: {
    width: '100%',
    height: '100%',
  },
  brandImageCollapsed: {
    width: SIDEBAR_BRAND.collapsedSize,
    height: SIDEBAR_BRAND.collapsedSize,
  },
});
