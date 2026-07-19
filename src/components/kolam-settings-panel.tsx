import React from 'react';
import type {SyncActivityEntry} from '../domain/sync-activity';
import type {SettingsSurfaceItem} from '../domain/settings-surface';
import {KolamSettingsPanelLayout} from './kolam-settings-panel-layout';
import {useKolamSettingsPanelController} from './kolam-settings-panel-controller';

export function KolamSettingsPanel({
  activityEntries,
  initialActiveSurfaceId,
}: {
  activityEntries: SyncActivityEntry[];
  initialActiveSurfaceId?: SettingsSurfaceItem['id'];
}) {
  const controller = useKolamSettingsPanelController(
    activityEntries,
    initialActiveSurfaceId,
  );

  return <KolamSettingsPanelLayout controller={controller} />;
}
