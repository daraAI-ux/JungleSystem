import React from 'react';
import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {kolamNavigationSections} from '../domain/kolam-navigation';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';

export function KolamMenuDock({
  sections,
}: {
  sections: typeof kolamNavigationSections;
}) {
  return (
    <KolamListFrame variant="menuDockGroup">
      <KolamMappedList
        items={sections}
        getKey={section => section.id}
        renderItem={section => (
          <KolamMenuDockItem
            count={section.items.length}
            label={section.title}
          />
        )}
      />
    </KolamListFrame>
  );
}

export function KolamMenuDockItem({count, label}: {count: number; label: string}) {
  return (
    <KolamCardFrame variant="menuDockItem">
      <KolamCopyStack
        items={[
          {
            id: 'letter',
            text: label.charAt(0),
            style: styles.kolamMenuDockLetter,
          },
          {id: 'count', text: count, style: styles.kolamMenuDockCount},
        ]}
      />
    </KolamCardFrame>
  );
}

const styles = StyleSheet.create({
  kolamMenuDockLetter: {
    color: V.colors.sidebarFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  kolamMenuDockCount: {
    marginTop: 1,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 9,
    fontWeight: '800',
  },
});