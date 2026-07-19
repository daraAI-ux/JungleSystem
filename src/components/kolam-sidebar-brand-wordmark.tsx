import React from 'react';
import {StyleSheet, View} from 'react-native';
import {getSidebarBrand} from '../domain/app-shell';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCopyStack} from './kolam-copy-stack';

const SIDEBAR_BRAND = getSidebarBrand();

export function KolamSidebarBrandWordmark() {
  return (
    <View style={styles.brandWordmark}>
      <KolamCopyStack
        items={[{id: 'title', text: SIDEBAR_BRAND.title, style: styles.brandName}]}
      />
      <View style={styles.brandAccentRow}>
        <View style={styles.brandAccent} />
        <KolamCopyStack
          items={[
            {id: 'subtitle', text: SIDEBAR_BRAND.subtitle, style: styles.brandSubtle},
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  brandWordmark: {
    flex: 1,
    minWidth: 96,
  },
  brandName: {
    color: SIDEBAR_BRAND.palette.darkLeaf,
    fontFamily: V.fontFamily,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
  },
  brandAccentRow: {
    marginTop: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  brandAccent: {
    width: 18,
    height: 5,
    borderRadius: 999,
    backgroundColor: SIDEBAR_BRAND.palette.brightLeaf,
  },
  brandSubtle: {
    color: SIDEBAR_BRAND.palette.deepGreen,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0,
  },
});
