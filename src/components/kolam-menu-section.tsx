import React from 'react';
import { StyleSheet, View } from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  getKolamNavigationDisclosure,
  type KolamNavigationItem,
  kolamNavigationSections,
} from '../domain/kolam-navigation';
import { KolamChevronIcon } from './kolam-chevron-icon';
import { KolamHeaderFrame } from './kolam-header-frame';
import { KolamMenuSectionActions } from './kolam-menu-section-actions';
import { KolamMenuSectionItems } from './kolam-menu-section-items';
import { KolamMenuSectionToggle } from './kolam-menu-section-toggle';
import {
  getKolamChevronDirection,
  KOLAM_NAVIGATION_CHROME,
} from './kolam-menu-navigation-utils';

export function KolamMenuSection({
  activeRoute,
  expanded,
  onMove,
  onSelectItem,
  onToggle,
  section,
}: {
  activeRoute?: string | null;
  expanded: boolean;
  onMove: (sectionId: string, direction: 'up' | 'down') => void;
  onSelectItem: (item: KolamNavigationItem) => void;
  onToggle: (sectionId: string) => void;
  section: (typeof kolamNavigationSections)[number];
}) {
  const disclosure = getKolamNavigationDisclosure(section, expanded);

  return (
    <View style={styles.kolamMenuSection}>
      <KolamHeaderFrame variant="menuSection">
        <KolamMenuSectionToggle
          icon={
            <KolamChevronIcon
              direction={getKolamChevronDirection(
                expanded
                  ? KOLAM_NAVIGATION_CHROME.disclosureExpandedIconKind
                  : KOLAM_NAVIGATION_CHROME.disclosureCollapsedIconKind,
              )}
              size="menu"
            />
          }
          label={section.title}
          onPress={() => onToggle(section.id)}
        />
        <KolamMenuSectionActions
          countLabel={disclosure.countLabel}
          onMove={direction => onMove(section.id, direction)}
        />
      </KolamHeaderFrame>
      <KolamMenuSectionItems
        activeRoute={activeRoute}
        items={disclosure.visibleItems}
        onSelectItem={onSelectItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  kolamMenuSection: {
    paddingHorizontal: 10,
    paddingVertical: 1,
    borderRadius: V.radius.lg,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 1,
  },
});
