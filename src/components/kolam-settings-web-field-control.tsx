import React from 'react';
import type { SettingsWebField } from './kolam-settings-web-form-field';
import { KolamSettingsWebFileField } from './kolam-settings-web-file-field';
import { KolamSettingsWebSwitchField } from './kolam-settings-web-switch-field';
import { KolamSettingsWebValueField } from './kolam-settings-web-value-field';

export function KolamSettingsWebFieldControl({
  field,
  onUploadFile,
}: {
  field: SettingsWebField;
  onUploadFile?: () => void;
}) {
  if (field.control === 'switch') {
    return <KolamSettingsWebSwitchField field={field} />;
  }

  if (field.control === 'file') {
    return (
      <KolamSettingsWebFileField value={field.value} onUpload={onUploadFile} />
    );
  }

  return <KolamSettingsWebValueField field={field} />;
}
