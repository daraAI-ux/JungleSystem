import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {getSidebarBrand} from '../domain/app-shell';

const SIDEBAR_BRAND = getSidebarBrand();
const JUNGLE_SYSTEM_LOGO = require('../assets/brand/jungle-system-logo-color.jpg');

export function KolamSidebarBrand({collapsed}: {collapsed: boolean}) {
  return (
    <View style={[styles.brand, collapsed && styles.brandCollapsed]}>
      <View style={[styles.brandLogo, collapsed && styles.brandLogoCollapsed]}>
        <Image
          accessibilityLabel={SIDEBAR_BRAND.title}
          resizeMode="contain"
          source={JUNGLE_SYSTEM_LOGO}
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
