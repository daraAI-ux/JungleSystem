import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
  const sourceUri =
    variant === 'list'
      ? category.photos[0] ?? category.iconUrl
      : category.iconUrl;

  return (
    <View style={[styles.icon, variant === 'detail' && styles.iconDetail]}>
      <View style={styles.placeholder}>
        {variant === 'detail' ? (
          <Text
            numberOfLines={1}
            style={[styles.placeholderText, styles.placeholderTextDetail]}>
            {getCategoryInitial(category.name)}
          </Text>
        ) : null}
      </View>
      <KolamLocalAssetImage
        accessibilityLabel={`${category.name} icon`}
        resizeMode="contain"
        revision={getCategoryIconRevision(category)}
        scope="category-icon"
        sourceUri={sourceUri}
        style={styles.image}
      />
    </View>
  );
}

function getCategoryIconRevision(category: KolamCategory) {
  return [
    category.iconUrl ?? '',
    category.photos[0] ?? '',
    category.updatedAt ?? '',
  ].join(':');
}

function getCategoryInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?';
}

const styles = StyleSheet.create({
  icon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    overflow: 'hidden',
    flexShrink: 0,
    backgroundColor: V.colors.successSoft,
  },
  iconDetail: {
    width: 84,
    height: 84,
    borderRadius: 14,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.successSoft,
  },
  placeholderText: {
    color: V.colors.success,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
  },
  placeholderTextDetail: {
    fontSize: 28,
  },
});
