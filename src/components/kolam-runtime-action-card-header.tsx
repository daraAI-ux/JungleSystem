import React from 'react';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {RuntimeAction} from '../domain/runtime-actions';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamHeaderFrame} from './kolam-header-frame';
import {KolamStatusBadge} from './kolam-status-badge';
import {KolamStatusIndicatorIcon} from './kolam-status-indicator-icon';
import {getStatusIndicatorIconKind} from './kolam-status-indicator-utils';
import {runtimeActionStyles as styles} from './kolam-runtime-action-styles';

export function KolamRuntimeActionCardHeader({
  action,
  enabled,
}: {
  action: RuntimeAction;
  enabled: boolean;
}) {
  return (
    <KolamHeaderFrame variant="runtimeActionCard">
      <KolamCopyStack
        items={[
          {
            id: 'title',
            text: action.label,
            style: styles.runtimeActionCardTitle,
          },
        ]}
      />
      <KolamStatusBadge
        label={enabled ? action.status : `butuh ${action.requiredAccess}`}
        intent={enabled ? 'success' : 'warning'}
        icon={
          <KolamStatusIndicatorIcon
            color={enabled ? V.colors.success : V.colors.warning}
            kind={getStatusIndicatorIconKind(
              enabled ? action.statusIconKind : 'clock',
            )}
          />
        }
      />
    </KolamHeaderFrame>
  );
}