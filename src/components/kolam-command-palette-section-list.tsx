import React from 'react';
import type {CommandEntry} from '../domain/command-index';
import {KolamCommandPaletteSectionBlock} from './kolam-command-palette-section-block';
import {KolamMappedList} from './kolam-mapped-list';
import type {KolamCommandPaletteSection} from './kolam-command-palette-types';

export function KolamCommandPaletteSectionList({
  onSelect,
  sections,
}: {
  onSelect: (command: CommandEntry) => void;
  sections: KolamCommandPaletteSection[];
}) {
  return (
    <KolamMappedList
      items={sections}
      getKey={section => section.id}
      renderItem={section => (
        <KolamCommandPaletteSectionBlock
          onSelect={onSelect}
          section={section}
        />
      )}
    />
  );
}
