import React from 'react';
import { KolamPanelFrame } from './kolam-panel-frame';
import type { KolamSettingsPanelController } from './kolam-settings-panel-controller';
import { KolamSettingsSurfaceBody } from './kolam-settings-surface-body';
import { KolamSurfacePanelCopy } from './kolam-surface-panel-copy';

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
    <KolamPanelFrame variant="settingsSurface">
      <KolamSurfacePanelCopy title={title} description={description} />
      <KolamSettingsSurfaceBody controller={controller} />
    </KolamPanelFrame>
  );
}
