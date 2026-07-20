import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { KolamCustomField } from '../domain/kolam-custom-field';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamLocalAssetImage } from './kolam-local-asset-image';

export function KolamCustomFieldIcon({
  field,
  variant = 'list',
}: {
  field: KolamCustomField;
  variant?: 'list' | 'detail';
}) {
  return (
    <View style={[styles.icon, variant === 'detail' && styles.iconDetail]}>
      <View style={styles.placeholder}>
        <Text
          numberOfLines={1}
          style={[
            styles.placeholderText,
            variant === 'detail' && styles.placeholderTextDetail,
          ]}>
          {getFieldInitial(field.fieldLabel)}
        </Text>
      </View>
      <KolamLocalAssetImage
        accessibilityLabel={`${field.fieldLabel} icon`}
        resizeMode="contain"
        revision={getCustomFieldIconRevision(field)}
        scope="custom-field-icon"
        sourceUri={field.iconUrl}
        style={styles.image}
      />
    </View>
  );
}

function getCustomFieldIconRevision(field: KolamCustomField) {
  return [field.iconUrl ?? '', field.updatedAt ?? ''].join(':');
}

function getFieldInitial(name: string) {
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
