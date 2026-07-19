import {getKolamCommandMenuVisualContract} from '../domain/kolam-command-menu';

const KOLAM_COMMAND_MENU_VISUAL = getKolamCommandMenuVisualContract();

export const commandPaletteItemDefaults = {
  showDescription: KOLAM_COMMAND_MENU_VISUAL.showDescription,
  showMeta: KOLAM_COMMAND_MENU_VISUAL.showMetaColumn,
};
