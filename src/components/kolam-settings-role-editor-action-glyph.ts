import type {SettingsRoleEditorAction} from '../domain/settings-surface';

export function getRoleEditorActionGlyphVariant(
  actionId: SettingsRoleEditorAction['id'],
) {
  if (actionId === 'create-role') {
    return 'plus';
  }

  if (actionId === 'delete-role') {
    return 'delete';
  }

  return 'edit';
}
