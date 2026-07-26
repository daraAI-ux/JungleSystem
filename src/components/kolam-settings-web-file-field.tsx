import React from 'react';
import { Text } from 'react-native';
import { getKolamFileUrl } from '../lib/file-url';
import { KolamActionControlButton } from './kolam-action-control-button';
import { KolamCardFrame } from './kolam-card-frame';
import { KolamInlineFrame } from './kolam-inline-frame';
import { KolamRemoteImage } from './kolam-remote-image';
import { settingsWebFormStyles as styles } from './kolam-settings-web-form-styles';

export function KolamSettingsWebFileField({
  onUpload,
  value,
}: {
  onUpload?: () => void;
  value: string;
}) {
  const logoUri = getLogoPreviewUri(value);

  return (
    <KolamInlineFrame variant="settingsWebLogoRow">
      <KolamCardFrame variant="settingsWebLogoPreview">
        {logoUri ? (
          <KolamRemoteImage
            accessibilityLabel="Logo WebSetting"
            resizeMode="contain"
            revision={logoUri}
            scope="websetting-logo"
            sourceUri={logoUri}
            style={styles.settingsWebLogoImage}
          />
        ) : (
          <Text style={styles.settingsWebLogoFallback}>Logo belum diatur</Text>
        )}
      </KolamCardFrame>
      <KolamActionControlButton
        label="Unggah logo"
        intent="outline"
        onPress={onUpload}
      />
    </KolamInlineFrame>
  );
}

function getLogoPreviewUri(value: string) {
  const trimmed = value.trim();

  if (!trimmed || trimmed === 'Logo belum diatur') {
    return null;
  }

  return getKolamFileUrl(trimmed) ?? trimmed;
}
