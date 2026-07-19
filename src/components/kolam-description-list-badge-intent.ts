import type {KolamBadgeIntent} from './kolam-badge';
import type {KolamDescriptionListTone} from './kolam-description-list-types';

export function getDescriptionListBadgeIntent(
  tone: KolamDescriptionListTone,
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
      return 'muted';
  }
}
