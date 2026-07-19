import type {KolamBadgeIntent} from './kolam-badge';
import type {KolamDetailValueTone} from './kolam-detail-value-row-types';

export function getDetailValueBadgeIntent(
  tone: KolamDetailValueTone,
): KolamBadgeIntent {
  switch (tone) {
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'danger':
      return 'danger';
    case 'default':
    default:
      return 'info';
  }
}
