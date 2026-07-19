import React from 'react';
import {getSettingsDescriptionListVisualContract} from '../domain/settings-surface';
import {KolamDescriptionList} from './kolam-description-list';
import {KolamEndpointList} from './kolam-endpoint-list';
import {KolamMappedSurfacePanel} from './kolam-mapped-surface-panel';
import type {KolamSettingsPanelController} from './kolam-settings-panel-controller';
import {KolamSettingsSurfaceBody} from './kolam-settings-surface-body';

const SETTINGS_DESCRIPTION_LIST_VISUAL =
  getSettingsDescriptionListVisualContract();

export function KolamSettingsSurfaceFrame({
  controller,
}: {
  controller: KolamSettingsPanelController;
}) {
  return (
    <KolamMappedSurfacePanel
      title={controller.activeSurface.title}
      description={controller.activeSurface.description}
      selectedTabId={controller.activeSurfaceId}
      onSelectTab={controller.selectSurface}
      tabItems={controller.settingsSurfaceItems}
      getTab={item => ({
        id: item.id,
        label: item.badge,
      })}>
      <KolamEndpointList
        accessibilityLabel="settings live endpoint contracts"
        endpoints={controller.liveEndpoints}
      />
      <KolamDescriptionList
        rows={controller.detailRows}
        accessibilityLabel={`${SETTINGS_DESCRIPTION_LIST_VISUAL.sourceComponent} mapped to native Settings`}
      />
      <KolamSettingsSurfaceBody controller={controller} />
    </KolamMappedSurfacePanel>
  );
}
