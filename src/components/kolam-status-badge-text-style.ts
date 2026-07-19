import type {KolamStatusBadgeIntent} from './kolam-status-badge-types';
import {statusBadgeStyles as styles} from './kolam-status-badge-styles';

export function getStatusBadgeTextIntentStyle(intent: KolamStatusBadgeIntent) {
  switch (intent) {
    case 'secondary':
    case 'muted':
      return styles.textSecondary;
    case 'success':
      return styles.textSuccess;
    case 'info':
      return styles.textInfo;
    case 'warning':
      return styles.textWarning;
    case 'danger':
      return styles.textDanger;
    case 'outline':
      return styles.textOutline;
    case 'primary':
    default:
      return styles.textPrimary;
  }
}
