import type {KolamStatsCardTone} from './kolam-stats-card-strip-types';
import {statsCardStripStyles as styles} from './kolam-stats-card-strip-styles';

export function getStatsCardValueToneStyle(tone: KolamStatsCardTone) {
  switch (tone) {
    case 'success':
      return styles.valueSuccess;
    case 'warning':
      return styles.valueWarning;
    case 'muted':
      return styles.valueMuted;
    case 'default':
    default:
      return undefined;
  }
}
