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
import { KolamUploadDeleteIcon } from './kolam-upload-delete-icon';

/**
 * Native Windows drops arrive via a single global queue (`consumeDroppedImage`).
 * When several upload fields mount (Product Media: Thumbnail / Foto / Video),
 * every field used to poll that queue — Thumbnail usually won.
 * Only the dropzone currently hovered (or the sole mounted field) may consume.
 */
let activeNativeDropTargetId: string | null = null;
let nativeDropTargetSeq = 0;
const mountedNativeDropTargets = new Set<string>();

function claimNativeDropTarget(id: string) {
  activeNativeDropTargetId = id;
}

function releaseNativeDropTarget(id: string) {
  if (activeNativeDropTargetId === id) {
    activeNativeDropTargetId = null;
  }
}

function getFirstMountedNativeDropTargetId() {
  for (const id of mountedNativeDropTargets) {
    return id;
  }
  return null;
}

function canConsumeNativeDrop(id: string) {
  if (activeNativeDropTargetId === id) {
    return true;
  }
  if (activeNativeDropTargetId != null) {
    return false;
  }
  // No hover claim yet: sole field, or first mounted (Thumbnail / default).
  // Hover/drag still redirects ownership to Foto/Video when those events fire.
  if (mountedNativeDropTargets.size <= 1) {
    return true;
  }
  return getFirstMountedNativeDropTargetId() === id;
}

export function KolamSettingsWebFileField({
  accessibilityLabel = 'Logo',
  actionLabel = 'Unggah logo',
  disabled: disabledProp = false,
  emptyLabel = 'Logo belum diatur',
  fileCount,
  fileTypeLabel = 'Tipe file yang diterima: JPG, PNG, GIF, WEBP, SVG',
  fileLimitLabel,
  fileMax,
  hint = 'Seret dan lepas untuk mengunggah atau',
  onLocalValueChange,
  onUpload,
  previewKind = 'image',
  scope = 'websetting-logo',
  title = 'Logo',
  value,
}: {
  accessibilityLabel?: string;
  actionLabel?: string;
  disabled?: boolean;
  emptyLabel?: string;
  fileCount?: number;
  fileTypeLabel?: string;
  fileLimitLabel?: string;
  fileMax?: number;
  hint?: string;
  onLocalValueChange?: (value: string) => void;
  onUpload?: () => void;
  previewKind?: 'file' | 'image';
  scope?: string;
  title?: string;
  value?: string | null;
}) {
  const safeValue = typeof value === 'string' ? value : '';
  const logoUri = getLogoPreviewUri(safeValue);
  const displayName = getUploadDisplayName(safeValue);
  const disabled = disabledProp || (!onUpload && !onLocalValueChange);
  const resolvedFileLimitLabel =
    fileLimitLabel ??
    (Number.isFinite(fileCount) && Number.isFinite(fileMax)
      ? `(${Math.max(0, fileCount ?? 0)}/${Math.max(0, fileMax ?? 0)})`
      : '');
  const targetIdRef = React.useRef(`upload-drop-${++nativeDropTargetSeq}`);
  const onLocalValueChangeRef = React.useRef(onLocalValueChange);
  onLocalValueChangeRef.current = onLocalValueChange;

  React.useEffect(() => {
    const targetId = targetIdRef.current;
    if (disabled || !onLocalValueChange) {
      return undefined;
    }

    mountedNativeDropTargets.add(targetId);
    let disposed = false;
    const timer = setInterval(() => {
      if (!canConsumeNativeDrop(targetId)) {
        return;
      }
      void consumeNativeDroppedImage()
        .then(dropped => {
          const droppedUri = readDroppedNativeUri(dropped);
          if (disposed || !droppedUri) {
            return;
          }
          if (!canConsumeNativeDrop(targetId)) {
            return;
          }
          onLocalValueChangeRef.current?.(droppedUri);
          releaseNativeDropTarget(targetId);
        })
        .catch(() => {
          // Ignore bridge failures so a bad drop payload cannot white-screen the form.
        });
    }, 500);

    return () => {
      disposed = true;
      clearInterval(timer);
      mountedNativeDropTargets.delete(targetId);
      releaseNativeDropTarget(targetId);
    };
  }, [disabled, onLocalValueChange]);

  const claimDropTarget = React.useCallback(() => {
    if (!disabled && onLocalValueChange) {
      claimNativeDropTarget(targetIdRef.current);
    }
  }, [disabled, onLocalValueChange]);

  const handleDrop = React.useCallback(
    (event: unknown) => {
      preventDefaultDropEvent(event);
      claimDropTarget();
      const targetId = targetIdRef.current;
      void (async () => {
        try {
          // Windows native queue holds the real filesystem path. Prefer it over
          // flaky event/blob URLs that cannot preview in KolamRemoteImage.
          if (canConsumeNativeDrop(targetId)) {
            const nativeUri = readDroppedNativeUri(
              await consumeNativeDroppedImage(),
            );
            if (nativeUri) {
              onLocalValueChangeRef.current?.(nativeUri);
              return;
            }
          }

          const eventUri = asUsableDroppedPreviewUri(
            await getDroppedImageValue(event),
          );
          if (eventUri) {
            onLocalValueChangeRef.current?.(eventUri);
          }
        } catch {
          // Ignore bridge/event failures so drop handling cannot white-screen.
        } finally {
          releaseNativeDropTarget(targetId);
        }
      })();
    },
    [claimDropTarget],
  );

  const dropzoneProps = React.useMemo(
    () =>
      ({
        onDragEnter: (event: unknown) => {
          preventDefaultDropEvent(event);
          claimDropTarget();
        },
        onDragOver: (event: unknown) => {
          preventDefaultDropEvent(event);
          claimDropTarget();
        },
        onDrop: handleDrop,
      }) as object,
    [claimDropTarget, handleDrop],
  );

  return (
    <View style={styles.settingsWebUploadStack}>
      <View style={styles.settingsWebUploadTitleRow}>
        <KolamUploadCameraIcon />
        <Text style={styles.settingsWebUploadTitle}>{title}</Text>
        {resolvedFileLimitLabel ? (
          <Text style={styles.settingsWebUploadCount}>
            {resolvedFileLimitLabel}
          </Text>
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
      <Text style={styles.settingsWebUploadHint}>{fileTypeLabel}</Text>
      {logoUri ? (
        <View style={styles.settingsWebUploadFileRow}>
          <KolamCardFrame variant="settingsWebLogoPreview">
            {previewKind === 'image' ? (
              <KolamRemoteImage
                accessibilityLabel={accessibilityLabel}
                resizeMode="contain"
                revision={logoUri}
                scope={scope}
                sourceUri={logoUri}
                style={styles.settingsWebLogoImage}
              />
            ) : (
              <Text style={styles.settingsWebFilePreviewLabel}>
                {getUploadFileExtension(displayName)}
              </Text>
            )}
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
              <KolamUploadDeleteIcon />
            </KolamInteractionFrame>
          ) : null}
        </View>
      ) : (
        <Text style={styles.settingsWebLogoFallback}>{emptyLabel}</Text>
      )}
    </View>
  );
}

function readDroppedNativeUri(dropped: unknown) {
  if (!dropped || typeof dropped !== 'object') {
    return '';
  }
  const record = dropped as {
    cancelled?: unknown;
    path?: unknown;
    uri?: unknown;
  };
  if (record.cancelled === true) {
    return '';
  }
  const uri = typeof record.uri === 'string' ? record.uri.trim() : '';
  if (uri) {
    return uri;
  }
  return typeof record.path === 'string' ? record.path.trim() : '';
}

function asUsableDroppedPreviewUri(value: unknown) {
  if (typeof value !== 'string') {
    return '';
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  // blob: object URLs from the DOM drop path do not preview reliably on RNW.
  if (/^(file:|data:|https?:)/i.test(trimmed)) {
    return trimmed;
  }
  if (/^[a-zA-Z]:[\\/]/.test(trimmed) || trimmed.startsWith('\\\\')) {
    return trimmed;
  }
  return '';
}

function getLogoPreviewUri(value: string) {
  const trimmed = (value ?? '').trim();

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
  const trimmed = (value ?? '').trim();
  if (!trimmed || trimmed === 'Logo belum diatur') {
    return '';
  }

  const withoutQuery = trimmed.split(/[?#]/)[0] ?? trimmed;
  return withoutQuery.split(/[\\/]/).filter(Boolean).pop() ?? trimmed;
}

function getUploadFileExtension(fileName: string) {
  const extension = fileName.split('.').pop()?.trim().slice(0, 4).toUpperCase();
  return extension || 'FILE';
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

  if (isSvgDropFile(first)) {
    const dataUrl = await readDroppedFileAsDataUrl(first);
    if (dataUrl) {
      return dataUrl;
    }
  }

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

function isSvgDropFile(file: unknown) {
  const name = getString(file, 'name');
  const type = getString(file, 'type');
  return /\.svg$/i.test(name) || /^image\/svg\+xml$/i.test(type);
}

function getRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}
