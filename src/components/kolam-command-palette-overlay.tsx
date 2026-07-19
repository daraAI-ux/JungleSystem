import React from 'react';
import {getCommandPaletteSections} from '../domain/command-index';
import {KolamCommandPalettePanel} from './kolam-command-palette-panel';
import {KOLAM_COMMAND_MENU_VISUAL} from './kolam-command-palette-visual';
import {KolamModalBackdrop} from './kolam-modal-backdrop';
import {KolamShellFrame} from './kolam-shell-frame';
import type {KolamCommandPaletteOverlayProps} from './kolam-command-palette-types';

export function KolamCommandPaletteOverlay({
  commands,
  search,
  onSearchChange,
  onClose,
  onSelect,
}: KolamCommandPaletteOverlayProps) {
  const sections = getCommandPaletteSections(
    commands,
    KOLAM_COMMAND_MENU_VISUAL.sectionLimit,
  );

  return (
    <KolamShellFrame variant="commandPaletteOverlay">
      <KolamModalBackdrop onPress={onClose} />
      <KolamCommandPalettePanel
        onClose={onClose}
        onSearchChange={onSearchChange}
        onSelect={onSelect}
        search={search}
        sections={sections}
      />
    </KolamShellFrame>
  );
}