import React from 'react';
import type {KolamSettingsActivityEntries} from './kolam-workspace-module-surface-types';
import type {SettingsSurfaceItem, SettingsTabItem} from '../domain/settings-surface';
import {KolamSettingsPanel} from './kolam-settings-widgets';

export function KolamSettingsSurface({
  activeSurfaceId,
  onActiveTabChange,
  syncActivity,
}: {
  activeSurfaceId?: SettingsSurfaceItem['id'];
  onActiveTabChange?: (tab: SettingsTabItem) => void;
  syncActivity: KolamSettingsActivityEntries;
}) {
  return (
    <KolamSettingsPanel
      activityEntries={syncActivity}
      initialActiveSurfaceId={activeSurfaceId}
      onActiveTabChange={onActiveTabChange}
    />
  );
}
