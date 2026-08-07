import React from 'react';
import {StyleSheet, View} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {KOLAM_BRAND_MODULE_ICON_SVG} from '../assets/icons/brand-module-icon-svg';
import {KOLAM_CATEGORY_MODULE_ICON_SVG} from '../assets/icons/category-module-icon-svg';
import type {KolamNavigationModuleIcon} from '../domain/kolam-navigation';

const MODULE_ICON_XML: Record<KolamNavigationModuleIcon, string> = {
  brand: KOLAM_BRAND_MODULE_ICON_SVG,
  category: KOLAM_CATEGORY_MODULE_ICON_SVG,
};

const MODULE_ICON_LABEL: Record<KolamNavigationModuleIcon, string> = {
  brand: 'Icon Merek',
  category: 'Icon Kategori',
};

const MODULE_ICON_SIZE = {
  header: 64,
  menu: 18,
} as const;

export function KolamModuleIcon({
  kind,
  size = 'menu',
}: {
  kind: KolamNavigationModuleIcon;
  size?: keyof typeof MODULE_ICON_SIZE;
}) {
  const dimension = MODULE_ICON_SIZE[size];

  return (
    <View
      accessibilityLabel={MODULE_ICON_LABEL[kind]}
      style={[styles.root, {height: dimension, width: dimension}]}>
      <SvgXml height="100%" width="100%" xml={MODULE_ICON_XML[kind]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexShrink: 0,
  },
});
