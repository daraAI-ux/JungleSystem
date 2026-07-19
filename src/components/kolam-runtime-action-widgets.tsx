import React from 'react';
import type {AccessScope} from '../domain/auth';
import type {AppModule} from '../domain/app-shell';
import {
  getRuntimeActionsByModule,
  type RuntimeAction,
} from '../domain/runtime-actions';
import {getStatusPanelDescriptor} from '../domain/status-panel';
import {KolamSelectableCard} from './kolam-selectable-card';
import {KolamStatusPanelFrame} from './kolam-status-panel-frame';
import {KolamRuntimeActionCardCopy} from './kolam-runtime-action-card-copy';
import {KolamRuntimeActionCardHeader} from './kolam-runtime-action-card-header';
import {KolamRuntimeActionGrid} from './kolam-runtime-action-grid';
import {getRuntimeActionStripMeta} from './kolam-runtime-action-meta';

export function KolamRuntimeActionStrip({
  moduleId,
  accessScope,
  onAction,
}: {
  moduleId: AppModule;
  accessScope: AccessScope;
  onAction: (action: RuntimeAction) => void;
}) {
  const actions = getRuntimeActionsByModule(moduleId);

  if (!actions.length) {
    return null;
  }

  return (
    <KolamStatusPanelFrame
      panel={getStatusPanelDescriptor('runtime-actions')}
      meta={getRuntimeActionStripMeta(accessScope, actions)}>
      <KolamRuntimeActionGrid
        accessScope={accessScope}
        actions={actions}
        onAction={onAction}
      />
    </KolamStatusPanelFrame>
  );
}

export function KolamRuntimeActionCard({
  action,
  enabled,
  onPress,
}: {
  action: RuntimeAction;
  enabled: boolean;
  onPress: () => void;
}) {
  return (
    <KolamSelectableCard
      layout="third"
      minHeight={118}
      blocked={!enabled}
      onPress={onPress}
      accessibilityLabel={action.label}>
      <KolamRuntimeActionCardHeader action={action} enabled={enabled} />
      <KolamRuntimeActionCardCopy action={action} />
    </KolamSelectableCard>
  );
}
