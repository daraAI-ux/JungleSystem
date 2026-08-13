import React from 'react';
import { StyleSheet, View } from 'react-native';
import { kolamNavigationSections } from '../domain/kolam-navigation';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamMappedList } from './kolam-mapped-list';
import { KolamMenuFolderIcon } from './kolam-menu-folder-icon';

export function KolamMenuDock({
  sections,
}: {
  sections: typeof kolamNavigationSections;
}) {
  return (
    <View style={styles.dock}>
      <KolamMappedList
        items={sections}
        getKey={section => section.id}
        renderItem={section => (
          <View
            accessibilityLabel={`Menu ${section.title}`}
            style={styles.dockItem}>
            <KolamMenuFolderIcon size="dock" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    alignItems: 'center',
    gap: 6,
    marginBottom: V.layout.navSectionGap,
    marginTop: 2,
  },
  dockItem: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: V.radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 34,
    width: 36,
  },
});
