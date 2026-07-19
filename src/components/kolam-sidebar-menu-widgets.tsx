import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { AccessScope } from '../domain/auth';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  filterKolamNavigationSectionsByAccess,
  orderKolamNavigationSections,
  type KolamNavigationItem,
  kolamSidebarNavigationSections,
} from '../domain/kolam-navigation';
import { KolamMappedList } from './kolam-mapped-list';
import { KolamMenuDock } from './kolam-menu-dock-widgets';
import { KolamMenuSection } from './kolam-menu-section-widgets';
import { KolamMenuTitle } from './kolam-menu-title';

export function KolamMenuGroup({
  accessScope,
  activeRoute,
  collapsed = false,
  expandedSections,
  filterByAccess = false,
  onMoveSection,
  onSelectItem,
  onToggleSection,
  sectionOrder,
}: {
  accessScope: AccessScope;
  activeRoute?: string | null;
  collapsed?: boolean;
  expandedSections: Record<string, boolean>;
  filterByAccess?: boolean;
  onMoveSection: (sectionId: string, direction: 'up' | 'down') => void;
  onSelectItem: (item: KolamNavigationItem) => void;
  onToggleSection: (sectionId: string) => void;
  sectionOrder: string[];
}) {
  const orderedSections = orderKolamNavigationSections(
    kolamSidebarNavigationSections,
    sectionOrder,
  );
  const sections = filterByAccess
    ? filterKolamNavigationSectionsByAccess(orderedSections, accessScope)
    : orderedSections;

  if (collapsed) {
    return <KolamMenuDock sections={sections} />;
  }

  return (
    <View style={styles.kolamMenuGroup}>
      <KolamMenuTitle
        filterByAccess={filterByAccess}
        itemCount={sections.reduce(
          (total, section) => total + section.items.length,
          0,
        )}
      />
      <KolamMappedList
        items={sections}
        getKey={section => section.id}
        renderItem={section => (
          <KolamMenuSection
            activeRoute={activeRoute}
            expanded={Boolean(expandedSections[section.id])}
            onMove={onMoveSection}
            onSelectItem={onSelectItem}
            onToggle={onToggleSection}
            section={section}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  kolamMenuGroup: {
    gap: 6,
    marginTop: 2,
    marginBottom: V.layout.navSectionGap,
  },
});
