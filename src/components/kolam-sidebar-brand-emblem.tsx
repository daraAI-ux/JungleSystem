import React from 'react';
import {StyleSheet, View} from 'react-native';
import {getSidebarBrand} from '../domain/app-shell';

const SIDEBAR_BRAND = getSidebarBrand();

export function KolamSidebarBrandEmblem({collapsed}: {collapsed: boolean}) {
  return (
    <View style={[styles.brandEmblem, collapsed && styles.brandEmblemCollapsed]}>
      <View style={styles.brandLeafLeft} />
      <View style={styles.brandLeafRight} />
      <View style={styles.brandFace}>
        <View style={styles.brandEyeRow}>
          <View style={styles.brandEye} />
          <View style={styles.brandEye} />
        </View>
        <View style={styles.brandSmile} />
      </View>
      <View style={styles.brandStem} />
    </View>
  );
}

const styles = StyleSheet.create({
  brandEmblem: {
    width: 50,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandEmblemCollapsed: {
    width: 42,
    height: 42,
  },
  brandLeafLeft: {
    position: 'absolute',
    left: 2,
    top: 14,
    width: 31,
    height: 18,
    borderRadius: 18,
    backgroundColor: SIDEBAR_BRAND.palette.brightLeaf,
    borderColor: SIDEBAR_BRAND.palette.deepGreen,
    borderWidth: 1,
    transform: [{rotate: '-24deg'}],
  },
  brandLeafRight: {
    position: 'absolute',
    right: 1,
    top: 14,
    width: 31,
    height: 18,
    borderRadius: 18,
    backgroundColor: SIDEBAR_BRAND.palette.deepGreen,
    borderColor: SIDEBAR_BRAND.palette.darkLeaf,
    borderWidth: 1,
    transform: [{rotate: '24deg'}],
  },
  brandFace: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: SIDEBAR_BRAND.palette.darkLeaf,
    borderColor: SIDEBAR_BRAND.palette.cream,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandEyeRow: {
    width: 19,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  brandEye: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: SIDEBAR_BRAND.palette.redAccent,
  },
  brandSmile: {
    width: 14,
    height: 4,
    marginTop: 5,
    borderRadius: 999,
    backgroundColor: SIDEBAR_BRAND.palette.cream,
  },
  brandStem: {
    position: 'absolute',
    bottom: 3,
    width: 18,
    height: 5,
    borderRadius: 999,
    backgroundColor: SIDEBAR_BRAND.palette.yellow,
  },
});
