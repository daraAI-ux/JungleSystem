import React from 'react';
import type {SyncActivityEntry} from '../domain/sync-activity';
import type {SettingsSurfaceItem, SettingsTabItem} from '../domain/settings-surface';
import {KolamSettingsPanelLayout} from './kolam-settings-panel-layout';
import {useKolamSettingsPanelController} from './kolam-settings-panel-controller';

export function KolamSettingsPanel({
  activityEntries,
  initialActiveSurfaceId,
  onActiveTabChange,
}: {
  activityEntries: SyncActivityEntry[];
  initialActiveSurfaceId?: SettingsSurfaceItem['id'];
  onActiveTabChange?: (tab: SettingsTabItem) => void;
}) {
  const controller = useKolamSettingsPanelController(
    activityEntries,
    initialActiveSurfaceId,
  );

  React.useEffect(() => {
    if (controller.activeSettingsTab) {
      onActiveTabChange?.(controller.activeSettingsTab);
    }
  }, [controller.activeSettingsTab, onActiveTabChange]);

  return <KolamSettingsPanelLayout controller={controller} />;
}
