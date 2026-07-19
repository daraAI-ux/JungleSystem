import React from 'react';
import type {AccessScope} from '../domain/auth';
import {
  isRuntimeActionEnabled,
  type RuntimeAction,
} from '../domain/runtime-actions';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamRuntimeActionCard} from './kolam-runtime-action-widgets';

export function KolamRuntimeActionGrid({
  accessScope,
  actions,
  onAction,
}: {
  accessScope: AccessScope;
  actions: RuntimeAction[];
  onAction: (action: RuntimeAction) => void;
}) {
  return (
    <KolamListFrame variant="runtimeActionGrid">
      <KolamMappedList
        items={actions}
        getKey={action => action.id}
        renderItem={action => (
          <KolamRuntimeActionCard
            action={action}
            enabled={isRuntimeActionEnabled(action, accessScope)}
            onPress={() => onAction(action)}
          />
        )}
      />
    </KolamListFrame>
  );
}
