import React from 'react';
import { Text, View } from 'react-native';
import { getKolamFileUrl } from '../lib/file-url';
import { KolamActionControlButton } from './kolam-action-control-button';
import { KolamCardFrame } from './kolam-card-frame';
import { KolamInteractionFrame } from './kolam-interaction-frame';
import { KolamInlineFrame } from './kolam-inline-frame';
import { KolamRemoteImage } from './kolam-remote-image';
import { settingsWebFormStyles as styles } from './kolam-settings-web-form-styles';

export function KolamSettingsWebFileField({
  accessibilityLabel = 'Logo',
  actionLabel = 'Unggah logo',
  emptyLabel = 'Logo belum diatur',
  hint = 'Klik atau tarik gambar',
  onLocalValueChange,
  onUpload,
  scope = 'websetting-logo',
  value,
}: {
  accessibilityLabel?: string;
  actionLabel?: string;
  emptyLabel?: string;
  hint?: string;
  onLocalValueChange?: (value: string) => void;
  onUpload?: () => void;
  scope?: string;
  value: string;
}) {
  const logoUri = getLogoPreviewUri(value);
  const disabled = !onUpload && !onLocalValueChange;
  const dropzoneProps = React.useMemo(
    () =>
      ({
        onDragOver: (event: unknown) => {
          preventDefaultDropEvent(event);
        },
        onDrop: (event: unknown) => {
          preventDefaultDropEvent(event);
          const dropped = getDroppedImageValue(event);
          if (dropped) {
            onLocalValueChange?.(dropped);
          }
        },
      }) as object,
    [onLocalValueChange],
  );

  return (
    <KolamInlineFrame variant="settingsWebLogoRow">
      <View {...dropzoneProps} style={styles.settingsWebUploadDropzone}>
        <KolamInteractionFrame
          accessibilityLabel={hint}
          disabled={disabled}
          onPress={onUpload}
          style={styles.settingsWebUploadPreviewButton}
        >
          <KolamCardFrame variant="settingsWebLogoPreview">
            {logoUri ? (
              <KolamRemoteImage
                accessibilityLabel={accessibilityLabel}
                resizeMode="contain"
                revision={logoUri}
                scope={scope}
                sourceUri={logoUri}
                style={styles.settingsWebLogoImage}
              />
            ) : (
              <Text style={styles.settingsWebLogoFallback}>{emptyLabel}</Text>
            )}
          </KolamCardFrame>
        </KolamInteractionFrame>
        <Text style={styles.settingsWebUploadHint}>{hint}</Text>
      </View>
      <KolamActionControlButton
        label={actionLabel}
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

  if (/^(https?:|file:|data:)/i.test(trimmed)) {
    return trimmed;
  }

  if (/^[a-zA-Z]:[\\/]/.test(trimmed)) {
    return `file:///${trimmed.replace(/\\/g, '/')}`;
  }

  return getKolamFileUrl(trimmed) ?? trimmed;
}

function preventDefaultDropEvent(event: unknown) {
  const record = event as { preventDefault?: () => void };
  record.preventDefault?.();
}

function getDroppedImageValue(event: unknown) {
  const dataTransfer =
    getRecord(event).dataTransfer ?? getRecord(getRecord(event).nativeEvent).dataTransfer;
  const files = getRecord(dataTransfer).files;
  const first = getArrayLikeFirst(files);

  const filePath =
    getString(first, 'path') ||
    getString(first, 'uri') ||
    getString(first, 'name');

  if (filePath) {
    return filePath;
  }

  const uriList = callGetData(dataTransfer, 'text/uri-list');
  if (uriList) {
    return uriList.split(/\r?\n/).find(Boolean)?.trim() ?? '';
  }

  return callGetData(dataTransfer, 'text/plain');
}

function callGetData(target: unknown, type: string) {
  const getData = getRecord(target).getData;
  return typeof getData === 'function' ? String(getData.call(target, type)).trim() : '';
}

function getArrayLikeFirst(value: unknown) {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  const record = value as { length?: number; item?: (index: number) => unknown; 0?: unknown };
  return record.item?.(0) ?? record[0] ?? null;
}

function getString(value: unknown, key: string) {
  const raw = getRecord(value)[key];
  return typeof raw === 'string' ? raw.trim() : '';
}

function getRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}
