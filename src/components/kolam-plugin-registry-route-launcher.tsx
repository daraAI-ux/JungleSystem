import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {PluginRouteEntry} from '../domain/unified';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamButton} from './kolam-button';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamMappedList} from './kolam-mapped-list';

export function KolamPluginRegistryRouteLauncher({
  routeIndex,
  onRouteSelect,
}: {
  routeIndex: PluginRouteEntry[];
  onRouteSelect?: (route: PluginRouteEntry) => void;
}) {
  if (!routeIndex.length) {
    return null;
  }

  return (
    <View accessibilityLabel="Plugin route launcher" style={styles.container}>
      <KolamCopyStack
        items={[
          {
            id: 'title',
            text: 'Plugin Route Launcher',
            style: styles.title,
          },
          {
            id: 'hint',
            text: `${routeIndex.length} route manifest bisa dibuka sebagai native route surface.`,
            style: styles.hint,
          },
        ]}
      />
      <View style={styles.grid}>
        <KolamMappedList
          items={routeIndex}
          getKey={route => `${route.pluginId}:${route.route}`}
          renderItem={route => (
            <KolamButton
              accessibilityLabel={`Buka ${route.pluginLabel} ${route.route}`}
              intent="outline"
              label={`${route.pluginLabel} ${route.route}`}
              onPress={() => onRouteSelect?.(route)}
              size="sm"
              style={styles.routeButton}
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
  routeButton: {
    alignSelf: 'flex-start',
    maxWidth: 320,
  },
});
