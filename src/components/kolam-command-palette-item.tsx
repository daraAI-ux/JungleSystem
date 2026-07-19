import React from 'react';
import {KolamInteractionFrame} from './kolam-interaction-frame';
import {KolamCommandPaletteItemCopy} from './kolam-command-palette-item-copy';
import {commandPaletteItemDefaults} from './kolam-command-palette-item-defaults';
import {KolamCommandPaletteItemIcon} from './kolam-command-palette-item-icon';
import {KolamCommandPaletteItemMeta} from './kolam-command-palette-item-meta';
import {type KolamCommandPaletteItemProps} from './kolam-command-palette-item-types';
import {commandPaletteItemStyles as styles} from './kolam-command-palette-item-styles';

export type {KolamCommandPaletteItemProps};

export function KolamCommandPaletteItem({
  description,
  icon,
  label,
  meta,
  onPress,
  showDescription = commandPaletteItemDefaults.showDescription,
  showMeta = commandPaletteItemDefaults.showMeta,
}: KolamCommandPaletteItemProps) {
  return (
    <KolamInteractionFrame onPress={onPress} style={styles.row}>
      <KolamCommandPaletteItemIcon icon={icon} />
      <KolamCommandPaletteItemCopy
        description={description}
        label={label}
        showDescription={showDescription}
      />
      <KolamCommandPaletteItemMeta meta={meta} showMeta={showMeta} />
    </KolamInteractionFrame>
  );
}
