import {pillFrameStyles as styles} from './kolam-pill-frame-styles';
import type {KolamPillFrameVariant} from './kolam-pill-frame-types';

export function getPillFrameStyle(variant: KolamPillFrameVariant) {
  return variant === 'selector' ? styles.selector : styles.state;
}

export function getPillFrameSelectedStyle(variant: KolamPillFrameVariant) {
  return variant === 'selector' ? styles.selectorSelected : styles.stateSelected;
}
