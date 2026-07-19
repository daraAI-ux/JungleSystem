import {selectableCardStyles as styles} from './kolam-selectable-card-styles';
import type {KolamSelectableCardLayout} from './kolam-selectable-card-types';

export function getSelectableCardLayoutStyle(
  layout: KolamSelectableCardLayout,
) {
  return layout === 'third' ? styles.third : styles.half;
}
