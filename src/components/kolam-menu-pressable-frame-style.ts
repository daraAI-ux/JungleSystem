import {menuPressableFrameStyles as styles} from './kolam-menu-pressable-frame-styles';
import type {KolamMenuPressableFrameVariant} from './kolam-menu-pressable-frame-types';

export function getMenuPressableFrameStyle(
  variant: KolamMenuPressableFrameVariant,
) {
  switch (variant) {
    case 'groupedItem':
      return [styles.item, styles.groupedItem];
    case 'sectionToggle':
      return styles.sectionToggle;
    case 'item':
    default:
      return styles.item;
  }
}
