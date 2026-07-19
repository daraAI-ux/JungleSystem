import type {KolamStatusBadgeIntent} from './kolam-status-badge-types';
import {statusBadgeStyles as styles} from './kolam-status-badge-styles';

export function getStatusBadgeIntentStyle(intent: KolamStatusBadgeIntent) {
  switch (intent) {
    case 'secondary':
    case 'muted':
      return styles.secondary;
    case 'success':
      return styles.success;
    case 'info':
      return styles.info;
    case 'warning':
      return styles.warning;
    case 'danger':
      return styles.danger;
    case 'outline':
      return styles.outline;
    case 'primary':
    default:
      return styles.primary;
  }
}
