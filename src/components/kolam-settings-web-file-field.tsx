import React from 'react';
import { Text, View } from 'react-native';
import { getKolamFileUrl } from '../lib/file-url';
import { consumeNativeDroppedImage } from '../services/native-file-picker';
import { KolamCardFrame } from './kolam-card-frame';
import { KolamInteractionFrame } from './kolam-interaction-frame';
import { KolamRemoteImage } from './kolam-remote-image';
import { settingsWebFormStyles as styles } from './kolam-settings-web-form-styles';
import { KolamUploadArrowIcon } from './kolam-upload-arrow-icon';
import { KolamUploadCameraIcon } from './kolam-upload-camera-icon';

export function KolamSettingsWebFileField({
  accessibilityLabel = 'Logo',
  actionLabel = 'Unggah logo',
  emptyLabel = 'Logo belum diatur',
  fileLimitLabel,
  hint = 'Seret dan lepas untuk mengunggah atau',
  onLocalValueChange,
  onUpload,
  scope = 'websetting-logo',
  title = 'Logo',
  value,
}: {
  accessibilityLabel?: string;
  actionLabel?: string;
  emptyLabel?: string;
  fileLimitLabel?: string;
  hint?: string;
  onLocalValueChange?: (value: string) => void;
  onUpload?: () => void;
  scope?: string;
  title?: string;
  value: string;
}) {
  const logoUri = getLogoPreviewUri(value);
  const displayName = getUploadDisplayName(value);
  const disabled = !onUpload && !onLocalValueChange;
  React.useEffect(() => {
    if (!onLocalValueChange) {
      return undefined;
    }

    let disposed = false;
    const timer = setInterval(() => {
      void consumeNativeDroppedImage().then(dropped => {
        const droppedUri = dropped.uri ?? dropped.path ?? '';
        if (!disposed && !dropped.cancelled && droppedUri) {
          onLocalValueChange(droppedUri);
        }
      });
    }, 500);

    return () => {
      disposed = true;
      clearInterval(timer);
    };
  }, [onLocalValueChange]);

  const handleDrop = React.useCallback(
    (event: unknown) => {
      preventDefaultDropEvent(event);
      void getDroppedImageValue(event).then(dropped => {
        if (dropped) {
          onLocalValueChange?.(dropped);
        }
      });
    },
    [onLocalValueChange],
  );
  const dropzoneProps = React.useMemo(
    () =>
      ({
        onDragEnter: (event: unknown) => {
          preventDefaultDropEvent(event);
        },
        onDragOver: (event: unknown) => {
          preventDefaultDropEvent(event);
        },
        onDrop: handleDrop,
      }) as object,
    [handleDrop],
  );

  return (
    <View style={styles.settingsWebUploadStack}>
      <View style={styles.settingsWebUploadTitleRow}>
        <KolamUploadCameraIcon />
        <Text style={styles.settingsWebUploadTitle}>{title}</Text>
        {fileLimitLabel ? (
          <Text style={styles.settingsWebUploadCount}>{fileLimitLabel}</Text>
        ) : null}
      </View>
      <View {...dropzoneProps} style={styles.settingsWebUploadDropzone}>
        <KolamInteractionFrame
          {...dropzoneProps}
          accessibilityLabel={hint}
          disabled={disabled}
          onPress={onUpload}
          style={styles.settingsWebUploadPreviewButton}
        >
          <KolamUploadArrowIcon />
          <View style={styles.settingsWebUploadPromptRow}>
            <Text style={styles.settingsWebUploadPrompt}>{hint}</Text>
            <Text style={styles.settingsWebUploadLink}>{actionLabel}</Text>
            <Text style={styles.settingsWebUploadPrompt}> untuk mengunggah</Text>
          </View>
        </KolamInteractionFrame>
      </View>
      <Text style={styles.settingsWebUploadHint}>
        Tipe file yang diterima: JPG, PNG, GIF, WEBP
      </Text>
      {logoUri ? (
        <View style={styles.settingsWebUploadFileRow}>
          <KolamCardFrame variant="settingsWebLogoPreview">
            <KolamRemoteImage
              accessibilityLabel={accessibilityLabel}
              resizeMode="contain"
              revision={logoUri}
              scope={scope}
              sourceUri={logoUri}
              style={styles.settingsWebLogoImage}
            />
          </KolamCardFrame>
          <View style={styles.settingsWebUploadFileCopy}>
            <Text numberOfLines={1} style={styles.settingsWebUploadFileName}>
              {displayName}
            </Text>
            <Text style={styles.settingsWebUploadFileStatus}>Terunggah</Text>
          </View>
          {onLocalValueChange ? (
            <KolamInteractionFrame
              accessibilityLabel="Hapus logo"
              onPress={() => onLocalValueChange('')}
              style={styles.settingsWebUploadDeleteButton}
            >
              <Text style={styles.settingsWebUploadDeleteText}>x</Text>
            </KolamInteractionFrame>
          ) : null}
        </View>
      ) : (
        <Text style={styles.settingsWebLogoFallback}>{emptyLabel}</Text>
      )}
    </View>
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

function getUploadDisplayName(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'Logo belum diatur') {
    return '';
  }

  const withoutQuery = trimmed.split(/[?#]/)[0] ?? trimmed;
  return withoutQuery.split(/[\\/]/).filter(Boolean).pop() ?? trimmed;
}

function preventDefaultDropEvent(event: unknown) {
  const record = event as { preventDefault?: () => void };
  record.preventDefault?.();
}

async function getDroppedImageValue(event: unknown) {
  const dataTransfer =
    getRecord(event).dataTransfer ?? getRecord(getRecord(event).nativeEvent).dataTransfer;
  const files = getRecord(dataTransfer).files;
  const first = getArrayLikeFirst(files);

  const filePath =
    getString(first, 'path') ||
    getString(first, 'uri');

  if (filePath) {
    return filePath;
  }

  const objectUrl = createDroppedFileObjectUrl(first);
  if (objectUrl) {
    return objectUrl;
  }

  const dataUrl = await readDroppedFileAsDataUrl(first);
  if (dataUrl) {
    return dataUrl;
  }

  const uriList = callGetData(dataTransfer, 'text/uri-list');
  if (uriList) {
    return uriList.split(/\r?\n/).find(Boolean)?.trim() ?? '';
  }

  return callGetData(dataTransfer, 'text/plain');
}

function createDroppedFileObjectUrl(file: unknown) {
  const createObjectURL = getRecord(getRecord(globalThis).URL).createObjectURL;
  if (typeof createObjectURL !== 'function') {
    return '';
  }

  try {
    return String(createObjectURL.call(getRecord(globalThis).URL, file));
  } catch (_error) {
    return '';
  }
}

function readDroppedFileAsDataUrl(file: unknown) {
  const FileReaderCtor = getRecord(globalThis).FileReader as
    | (new () => {
        error?: unknown;
        onerror?: () => void;
        onload?: () => void;
        readAsDataURL?: (value: unknown) => void;
        result?: unknown;
      })
    | undefined;
  if (typeof FileReaderCtor !== 'function' || !file) {
    return Promise.resolve('');
  }

  return new Promise<string>(resolve => {
    try {
      const reader = new FileReaderCtor();

      reader.onerror = () => resolve('');
      reader.onload = () =>
        resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.readAsDataURL?.(file);
    } catch (_error) {
      resolve('');
    }
  });
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
