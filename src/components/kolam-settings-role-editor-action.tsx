import React from 'react';
import type {SettingsRoleEditorAction} from '../domain/settings-surface';
import {KolamActionButton} from './kolam-action-button';
import {KolamActionGlyph} from './kolam-action-glyph';
import {getRoleEditorActionGlyphVariant} from './kolam-settings-role-editor-action-glyph';

export function KolamSettingsRoleEditorAction({
  action,
}: {
  action: SettingsRoleEditorAction;
}) {
  return (
    <KolamActionButton
      label={action.label}
      intent={action.intent}
      disabled={action.disabled}
      disabledReason={action.disabledReason}
      icon={
        <KolamActionGlyph
          variant={getRoleEditorActionGlyphVariant(action.id)}
          tone={
            action.intent === 'danger' && !action.disabled
              ? 'danger'
              : 'default'
          }
        />
      }
    />
  );
}
