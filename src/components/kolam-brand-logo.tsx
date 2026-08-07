import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { KolamBrand } from '../domain/kolam-brand';
import { KolamLocalAssetImage } from './kolam-local-asset-image';

export function KolamBrandLogo({
  brand,
  variant = 'list',
}: {
  brand: KolamBrand;
  variant?: 'list' | 'detail' | 'summary';
}) {
  return (
    <View
      style={[
        styles.logo,
        variant === 'detail' && styles.logoDetail,
        variant === 'summary' && styles.logoSummary,
      ]}
    >
      <KolamLocalAssetImage
        accessibilityLabel={`${brand.name} logo`}
        resizeMode="contain"
        revision={getBrandLogoImageRevision(brand)}
        scope="brand-logo"
        sourceUri={brand.logoUrl}
        style={styles.image}
      />
    </View>
  );
}

function getBrandLogoImageRevision(brand: KolamBrand) {
  return [brand.logoUrl ?? '', brand.updatedAt ?? ''].join(':');
}

const styles = StyleSheet.create({
  logo: {
    width: 132,
    height: 40,
    overflow: 'hidden',
    flexShrink: 0,
  },
  logoDetail: {
    width: 158,
    height: 84,
  },
  logoSummary: {
    height: '100%',
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
