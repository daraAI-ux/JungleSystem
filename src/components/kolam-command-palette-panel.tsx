import React from 'react';
import type {CommandEntry} from '../domain/command-index';
import {KolamCommandPaletteList} from './kolam-command-palette-list';
import {KolamCommandPaletteSearchRow} from './kolam-command-palette-search-row';
import {KolamPanelFrame} from './kolam-panel-frame';
import type {KolamCommandPaletteSection} from './kolam-command-palette-types';

export function KolamCommandPalettePanel({
  onClose,
  onSearchChange,
  onSelect,
  search,
  sections,
}: {
  onClose: () => void;
  onSearchChange: (query: string) => void;
  onSelect: (command: CommandEntry) => void;
  search: string;
  sections: KolamCommandPaletteSection[];
}) {
  return (
    <KolamPanelFrame variant="commandPalette">
      <KolamCommandPaletteSearchRow
        onClose={onClose}
        onSearchChange={onSearchChange}
        search={search}
      />
      <KolamCommandPaletteList sections={sections} onSelect={onSelect} />
    </KolamPanelFrame>
  );
}