import {actionFrameStyles as styles} from './kolam-action-frame-styles';
import type {KolamActionFrameVariant} from './kolam-action-frame-types';

export function getActionFrameStyle(variant: KolamActionFrameVariant) {
  return variant === 'table' ? styles.table : styles.text;
}
