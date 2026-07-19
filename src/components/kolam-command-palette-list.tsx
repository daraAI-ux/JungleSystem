import React from 'react';
import {ScrollView} from 'react-native';
import type {CommandEntry} from '../domain/command-index';
import {KolamCommandPaletteEmptyState} from './kolam-command-palette-empty-state';
import {KolamCommandPaletteSectionList} from './kolam-command-palette-section-list';
import {commandPaletteStyles as styles} from './kolam-command-palette-styles';
import type {KolamCommandPaletteSection} from './kolam-command-palette-types';

export function KolamCommandPaletteList({
  onSelect,
  sections,
}: {
  onSelect: (command: CommandEntry) => void;
  sections: KolamCommandPaletteSection[];
}) {
  return (
    <ScrollView style={styles.commandPaletteScroll}>
      {sections.length ? (
        <KolamCommandPaletteSectionList
          onSelect={onSelect}
          sections={sections}
        />
      ) : (
        <KolamCommandPaletteEmptyState />
      )}
    </ScrollView>
  );
}
