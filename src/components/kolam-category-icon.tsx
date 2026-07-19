import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { KolamCategory } from '../domain/kolam-category';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamLocalAssetImage } from './kolam-local-asset-image';

export function KolamCategoryIcon({
  category,
  variant = 'list',
}: {
  category: KolamCategory;
  variant?: 'list' | 'detail';
}) {
  return (
    <View style={[styles.icon, variant === 'detail' && styles.iconDetail]}>
      <KolamLocalAssetImage
        accessibilityLabel={`${category.name} icon`}
        resizeMode="contain"
        revision={getCategoryIconRevision(category)}
        scope="category-icon"
        sourceUri={category.iconUrl}
        style={styles.image}
      />
      {!category.iconUrl ? <View style={styles.placeholder} /> : null}
    </View>
  );
}

function getCategoryIconRevision(category: KolamCategory) {
  return [category.iconUrl ?? '', category.updatedAt ?? ''].join(':');
}

const styles = StyleSheet.create({
  icon: {
    width: 42,
    height: 42,
    overflow: 'hidden',
    flexShrink: 0,
  },
  iconDetail: {
    width: 84,
    height: 84,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: V.colors.secondary,
  },
});
