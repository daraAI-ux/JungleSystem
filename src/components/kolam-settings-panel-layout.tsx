import React from 'react';
import {StyleSheet, View} from 'react-native';
import { KolamModulePanel } from './kolam-surface-widgets';
import type { KolamSettingsPanelController } from './kolam-settings-panel-controller';
import { KolamSettingsSurfaceFrame } from './kolam-settings-surface-frame';
import { KolamMappedControlTabList } from './kolam-mapped-control-tab-list';
import { KolamSettingsPackageUpdateActions } from './kolam-settings-package-update-actions';

export function KolamSettingsPanelLayout({
  controller,
}: {
  controller: KolamSettingsPanelController;
}) {
  const tabItems = controller.settingsTabItems.filter(item => item.id !== 'ai');

  return (
    <KolamModulePanel title="Pengaturan" hint="">
      <View style={styles.tabBar}>
        <View style={styles.tabs}>
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
        </View>
        <KolamSettingsPackageUpdateActions />
      </View>
      <KolamSettingsSurfaceFrame controller={controller} />
    </KolamModulePanel>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    alignItems: 'stretch',
    flexDirection: 'row',
  },
  tabs: {
    flex: 1,
    minWidth: 0,
  },
});
