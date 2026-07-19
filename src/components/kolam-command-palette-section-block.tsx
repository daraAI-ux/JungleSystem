import React from 'react';
import type {CommandEntry} from '../domain/command-index';
import {KolamCommandPaletteSectionCommand} from './kolam-command-palette-section-command';
import {KolamContentFrame} from './kolam-content-frame';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamMappedList} from './kolam-mapped-list';
import {commandPaletteStyles as styles} from './kolam-command-palette-styles';
import type {KolamCommandPaletteSection} from './kolam-command-palette-types';

export function KolamCommandPaletteSectionBlock({
  onSelect,
  section,
}: {
  onSelect: (command: CommandEntry) => void;
  section: KolamCommandPaletteSection;
}) {
  return (
    <KolamContentFrame variant="commandPaletteSection">
      <KolamCopyStack
        items={[
          {
            id: 'title',
            text: section.title,
            style: styles.commandPaletteSectionTitle,
          },
        ]}
      />
      <KolamMappedList
        items={section.commands}
        getKey={command => command.id}
        renderItem={command => (
          <KolamCommandPaletteSectionCommand
            command={command}
            onSelect={onSelect}
          />
        )}
      />
    </KolamContentFrame>
  );
}