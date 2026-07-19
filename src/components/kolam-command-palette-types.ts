import {
  getCommandPaletteSections,
  type CommandEntry,
} from '../domain/command-index';

export interface KolamCommandPaletteOverlayProps {
  commands: CommandEntry[];
  search: string;
  onSearchChange: (query: string) => void;
  onClose: () => void;
  onSelect: (command: CommandEntry) => void;
}

export type KolamCommandPaletteSection = ReturnType<
  typeof getCommandPaletteSections
>[number];
