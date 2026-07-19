import React from 'react';
import {KolamModulePanel} from './kolam-surface-widgets';
import type {KolamSettingsPanelController} from './kolam-settings-panel-controller';
import {KolamSettingsMetricsGrid} from './kolam-settings-metrics-grid';
import {KolamSettingsRouteList} from './kolam-settings-panel-surfaces';
import {KolamSettingsSurfaceFrame} from './kolam-settings-surface-frame';

export function KolamSettingsPanelLayout({
  controller,
}: {
  controller: KolamSettingsPanelController;
}) {
  return (
    <KolamModulePanel
      title="Settings"
      hint="Native summary untuk Web Settings, Role Management, dan Activity Log Kolam.">
      <KolamSettingsMetricsGrid stats={controller.stats} />
      <KolamSettingsRouteList
        activeSurfaceId={controller.activeSurfaceId}
        items={controller.settingsSurfaceItems}
        onSelectSurface={controller.selectSurface}
      />
      <KolamSettingsSurfaceFrame controller={controller} />
    </KolamModulePanel>
  );
}
