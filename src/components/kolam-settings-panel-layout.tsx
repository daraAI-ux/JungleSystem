import React from 'react';
import { KolamModulePanel } from './kolam-surface-widgets';
import type { KolamSettingsPanelController } from './kolam-settings-panel-controller';
import { KolamSettingsSurfaceFrame } from './kolam-settings-surface-frame';
import { KolamMappedControlTabList } from './kolam-mapped-control-tab-list';

export function KolamSettingsPanelLayout({
  controller,
}: {
  controller: KolamSettingsPanelController;
}) {
  const tabItems = controller.settingsTabItems.filter(item => item.id !== 'ai');

  return (
    <KolamModulePanel title="Pengaturan" hint="">
      <KolamMappedControlTabList
        accessibilityLabel="settings native tabs"
        selectedId={controller.activeSettingsTabId}
        items={tabItems}
        onSelect={tabId => controller.selectSettingsTab(tabId)}
        getItem={item => ({
          id: item.id,
          label: item.label,
          flag: item.status === 'planned' ? 'Direncanakan' : undefined,
        })}
      />
      <KolamSettingsSurfaceFrame controller={controller} />
    </KolamModulePanel>
  );
}
