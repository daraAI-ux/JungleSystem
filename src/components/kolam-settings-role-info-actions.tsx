import React from 'react';
import type {SettingsRoleInfoPanel} from '../domain/settings-surface';
import {KolamActionButton} from './kolam-action-button';
import {KolamActionGlyph} from './kolam-action-glyph';
import {KolamBadge} from './kolam-badge';
import {KolamListFrame} from './kolam-list-frame';
import {settingsRoleInfoPanelStyles as styles} from './kolam-settings-role-info-panel-styles';

export function KolamSettingsRoleInfoActions({
  info,
}: {
  info: SettingsRoleInfoPanel;
}) {
  return (
    <KolamListFrame variant="roleInfoActions">
      <KolamBadge label={info.key} intent="outline" weight="900" />
      {info.canDelete ? (
        <KolamActionButton
          label={info.deleteLabel}
          intent="danger"
          icon={<KolamActionGlyph variant="delete" tone="danger" />}
          style={styles.settingsRoleInfoDeleteButton}
          textStyle={styles.settingsRoleInfoDeleteText}
        />
      ) : null}
    </KolamListFrame>
  );
}