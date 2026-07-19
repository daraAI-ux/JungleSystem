import React from 'react';
import type {KolamSettingsActivityEntries} from './kolam-workspace-module-surface-types';
import type {SettingsSurfaceItem} from '../domain/settings-surface';
import {KolamSettingsPanel} from './kolam-settings-widgets';

export function KolamSettingsSurface({
  activeSurfaceId,
  syncActivity,
}: {
  activeSurfaceId?: SettingsSurfaceItem['id'];
  syncActivity: KolamSettingsActivityEntries;
}) {
  return (
    <KolamSettingsPanel
      activityEntries={syncActivity}
      initialActiveSurfaceId={activeSurfaceId}
    />
  );
}
