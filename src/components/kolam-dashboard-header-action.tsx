import React from 'react';
import type {DashboardHeaderAction} from '../domain/dashboard-header';
import {KolamActionControlButton} from './kolam-action-control-button';
import {KolamDashboardHeaderActionIcon} from './kolam-dashboard-header-action-icon';

export function KolamDashboardHeaderAction({
  action,
  onSelectModule,
}: {
  action: DashboardHeaderAction;
  onSelectModule: (action: DashboardHeaderAction) => void;
}) {
  return (
    <KolamActionControlButton
      accessibilityLabel={action.accessibilityLabel}
      label={action.label}
      intent={action.intent}
      tone={action.buttonTone}
      size="sm"
      onPress={() => onSelectModule(action)}
      icon={
        <KolamDashboardHeaderActionIcon
          kind={action.iconKind}
          intent={action.intent}
          tone={action.buttonTone}
        />
      }
    />
  );
}




