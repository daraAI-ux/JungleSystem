import React from 'react';
import {KolamIconButton} from './kolam-icon-button';
import {KolamListFrame} from './kolam-list-frame';
import {KolamSearchField} from './kolam-search-field';
import {KolamXIcon} from './kolam-x-icon';
import {commandPaletteStyles as styles} from './kolam-command-palette-styles';
import {KOLAM_COMMAND_MENU_VISUAL} from './kolam-command-palette-visual';

export function KolamCommandPaletteSearchRow({
  onClose,
  onSearchChange,
  search,
}: {
  onClose: () => void;
  onSearchChange: (query: string) => void;
  search: string;
}) {
  return (
    <KolamListFrame variant="commandPaletteSearchRow">
      <KolamSearchField
        value={search}
        onChangeText={onSearchChange}
        autoFocus
        placeholder={KOLAM_COMMAND_MENU_VISUAL.searchPlaceholder}
        containerStyle={styles.commandPaletteSearchField}
        inputStyle={styles.commandPaletteInput}
        trailingLabel="Esc"
      />
      <KolamIconButton
        accessibilityLabel={KOLAM_COMMAND_MENU_VISUAL.closeActionLabel}
        onPress={onClose}
        size={30}
        radius="md"
        variant="ghost">
        {KOLAM_COMMAND_MENU_VISUAL.closeActionIconKind === 'x' ? (
          <KolamXIcon />
        ) : null}
      </KolamIconButton>
    </KolamListFrame>
  );
}