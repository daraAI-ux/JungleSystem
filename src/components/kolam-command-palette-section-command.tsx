import React from 'react';
import type {CommandEntry} from '../domain/command-index';
import {KolamCommandPaletteItem} from './kolam-command-palette-item';
import {KolamCommandPaletteKindIcon} from './kolam-command-palette-kind-icon';
import {KOLAM_COMMAND_MENU_VISUAL} from './kolam-command-palette-visual';

export function KolamCommandPaletteSectionCommand({
  command,
  onSelect,
}: {
  command: CommandEntry;
  onSelect: (command: CommandEntry) => void;
}) {
  return (
    <KolamCommandPaletteItem
      description={command.description}
      icon={<KolamCommandPaletteKindIcon kind={command.kind} />}
      label={command.label}
      meta={command.route ?? command.actionId ?? command.moduleId}
      onPress={() => onSelect(command)}
      showDescription={KOLAM_COMMAND_MENU_VISUAL.showDescription}
      showMeta={KOLAM_COMMAND_MENU_VISUAL.showMetaColumn}
    />
  );
}
