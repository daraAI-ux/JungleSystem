import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {UnifiedSurface} from '../domain/unified';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamButton} from './kolam-button';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamMappedList} from './kolam-mapped-list';

export function KolamSurfaceLauncher({
  label = 'Surface Launcher',
  surfaces,
  onSurfaceSelect,
}: {
  label?: string;
  surfaces: UnifiedSurface[];
  onSurfaceSelect?: (surface: UnifiedSurface) => void;
}) {
  if (!surfaces.length) {
    return null;
  }

  return (
    <View accessibilityLabel={label} style={styles.container}>
      <KolamCopyStack
        items={[
          {
            id: 'title',
            text: label,
            style: styles.title,
          },
          {
            id: 'hint',
            text: `${surfaces.length} surface contract bisa dibuka sebagai native route surface.`,
            style: styles.hint,
          },
        ]}
      />
      <View style={styles.grid}>
        <KolamMappedList
          items={surfaces}
          getKey={surface => surface.id}
          renderItem={surface => (
            <KolamButton
              accessibilityLabel={`Buka ${surface.label} surface`}
              intent="outline"
              label={surface.label}
              onPress={() => onSurfaceSelect?.(surface)}
              size="sm"
              style={styles.button}
            />
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  title: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '700',
  },
  hint: {
    marginTop: 3,
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    alignSelf: 'flex-start',
  },
});
