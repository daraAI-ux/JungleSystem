import React from 'react';
import type {DashboardHeaderAction} from '../domain/dashboard-header';
import {KolamDashboardHeaderAction} from './kolam-dashboard-header-action';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';

export function KolamDashboardHeaderActions({
  actions,
  onSelectModule,
}: {
  actions: DashboardHeaderAction[];
  onSelectModule: (action: DashboardHeaderAction) => void;
}) {
  return (
    <KolamListFrame variant="dashboardHeaderActions">
      <KolamMappedList
        items={actions}
        getKey={action => action.id}
        renderItem={action => (
          <KolamDashboardHeaderAction
            action={action}
            onSelectModule={onSelectModule}
          />
        )}
      />
    </KolamListFrame>
  );
}