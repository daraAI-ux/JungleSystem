import React from 'react';
import type {ReadinessCheck} from '../domain/readiness';
import {KolamStatusBadge} from './kolam-status-badge';
import {KolamStatusIndicatorIcon} from './kolam-status-indicator-icon';
import {
  getReadinessStatusIconColor,
  getStatusIndicatorIconKind,
} from './kolam-status-indicator-utils';
import {readinessStyles as styles} from './kolam-readiness-styles';

export function KolamReadinessStatusBadge({
  check,
}: {
  check: ReadinessCheck;
}) {
  return (
    <KolamStatusBadge
      label={check.status}
      intent={
        check.status === 'ready'
          ? 'success'
          : check.status === 'partial'
            ? 'info'
            : 'warning'
      }
      style={styles.status}
      icon={
        <KolamStatusIndicatorIcon
          color={getReadinessStatusIconColor(check.status)}
          kind={getStatusIndicatorIconKind(check.statusIconKind)}
        />
      }
    />
  );
}
