import React from 'react';
import {KolamModulePanel} from './kolam-surface-widgets';
import type {KolamSettingsPanelController} from './kolam-settings-panel-controller';
import {KolamSettingsMetricsGrid} from './kolam-settings-metrics-grid';
import {KolamSettingsSurfaceFrame} from './kolam-settings-surface-frame';
import {KolamMappedControlTabList} from './kolam-mapped-control-tab-list';

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
      <KolamMappedControlTabList
        accessibilityLabel="settings native tabs"
        selectedId={controller.activeSettingsTabId}
        items={controller.settingsTabItems}
        onSelect={tabId => controller.selectSettingsTab(tabId)}
        getItem={item => ({
          id: item.id,
          label: item.label,
          flag: item.status === 'planned' ? 'Planned' : undefined,
        })}
      />
      <KolamSettingsSurfaceFrame controller={controller} />
    </KolamModulePanel>
  );
}
