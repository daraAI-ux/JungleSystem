import React from 'react';
import { getSettingsDescriptionListVisualContract } from '../domain/settings-surface';
import { KolamDescriptionList } from './kolam-description-list';
import { KolamEndpointList } from './kolam-endpoint-list';
import { KolamPanelFrame } from './kolam-panel-frame';
import type { KolamSettingsPanelController } from './kolam-settings-panel-controller';
import { KolamSettingsSurfaceBody } from './kolam-settings-surface-body';
import { KolamSurfacePanelCopy } from './kolam-surface-panel-copy';

const SETTINGS_DESCRIPTION_LIST_VISUAL =
  getSettingsDescriptionListVisualContract();

export function KolamSettingsSurfaceFrame({
  controller,
}: {
  controller: KolamSettingsPanelController;
}) {
  const title =
    controller.activeSettingsTab?.label ?? controller.activeSurface.title;
  const description =
    controller.activeSettingsTab?.description ??
    controller.activeSurface.description;

  return (
    <KolamPanelFrame variant="surface">
      <KolamSurfacePanelCopy title={title} description={description} />
      <KolamEndpointList
        accessibilityLabel="settings live endpoint contracts"
        endpoints={controller.liveEndpoints}
      />
      <KolamDescriptionList
        rows={controller.detailRows}
        accessibilityLabel={`${SETTINGS_DESCRIPTION_LIST_VISUAL.sourceComponent} mapped to native Settings`}
      />
      <KolamSettingsSurfaceBody controller={controller} />
    </KolamPanelFrame>
  );
}
