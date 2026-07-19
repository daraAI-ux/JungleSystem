import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {ShellModuleRouteEntry} from '../domain/app-shell';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamButton} from './kolam-button';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamMappedList} from './kolam-mapped-list';

export function KolamModuleRouteLauncher({
  label,
  routes,
  onRouteSelect,
}: {
  label: string;
  routes: ShellModuleRouteEntry[];
  onRouteSelect?: (route: ShellModuleRouteEntry) => void;
}) {
  if (!routes.length) {
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
            text: `${routes.length} module route contract bisa dibuka sebagai native route surface.`,
            style: styles.hint,
          },
        ]}
      />
      <View style={styles.grid}>
        <KolamMappedList
          items={routes}
          getKey={route => route.id}
          renderItem={route => (
            <KolamButton
              accessibilityLabel={`Buka ${route.moduleLabel} ${route.route}`}
              intent="outline"
              label={route.route}
              onPress={() => onRouteSelect?.(route)}
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
    maxWidth: 320,
  },
});
