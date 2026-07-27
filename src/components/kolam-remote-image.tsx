import React from 'react';
import {
  Image,
  StyleSheet,
  type ImageResizeMode,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  getRenderableKolamImageUri,
  syncKolamImageCache,
} from '../services/kolam-image-local-cache';
import {
  openKolamImagePreview,
  type KolamImagePreviewItem,
} from './kolam-image-preview-dialog';
import { KolamInteractionFrame } from './kolam-interaction-frame';

export function KolamRemoteImage({
  accessibilityLabel,
  allowRemoteFallback = true,
  previewIndex,
  previewItems,
  resizeMode = 'cover',
  revision,
  scope = 'general',
  sourceUri,
  style,
}: {
  accessibilityLabel: string;
  allowRemoteFallback?: boolean;
  previewIndex?: number;
  previewItems?: KolamImagePreviewItem[];
  resizeMode?: ImageResizeMode;
  revision?: string;
  scope?: string;
  sourceUri: string | null | undefined;
  style: StyleProp<ImageStyle>;
}) {
  const imageRevision = revision ?? sourceUri ?? '';
  const [cachedUri, setCachedUri] = React.useState<string | null>(null);
  const [failedUri, setFailedUri] = React.useState<string | null>(null);
  const [syncDone, setSyncDone] = React.useState(() => isDirectRenderUri(sourceUri));

  React.useEffect(() => {
    let cancelled = false;
    setFailedUri(null);
    setCachedUri(null);

    if (!sourceUri) {
      setSyncDone(true);
      return;
    }

    if (isDirectRenderUri(sourceUri)) {
      setCachedUri(sourceUri);
      setSyncDone(true);
      return;
    }

    setSyncDone(false);
    void syncKolamImageCache({
      revision: imageRevision,
      scope,
      sourceUri,
    })
      .then(asset => {
        if (cancelled) {
          return;
        }

        setCachedUri(getRenderableKolamImageUri(asset));
      })
      .catch(() => {
        if (!cancelled) {
          setCachedUri(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSyncDone(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [imageRevision, scope, sourceUri]);

  const remoteUri =
    allowRemoteFallback && sourceUri && !isDirectRenderUri(sourceUri)
      ? sourceUri
      : null;
  const preferredUri = cachedUri || (syncDone || allowRemoteFallback ? remoteUri : null);
  const visibleUri =
    preferredUri && preferredUri !== failedUri ? preferredUri : null;

  if (!visibleUri) {
    return null;
  }

  return (
    <KolamInteractionFrame
      accessibilityLabel={`Lihat ${accessibilityLabel}`}
      onPress={() =>
        openKolamImagePreview({
          initialIndex: previewIndex,
          items: previewItems,
          revision: imageRevision,
          scope,
          title: accessibilityLabel,
          uri: visibleUri,
        })
      }
      style={[style as StyleProp<ViewStyle>, styles.imageShell]}
    >
      <Image
        accessibilityIgnoresInvertColors
        accessibilityLabel={accessibilityLabel}
        resizeMode={resizeMode}
        source={{ uri: visibleUri }}
        style={styles.imageFill}
        onError={() => setFailedUri(visibleUri)}
      />
    </KolamInteractionFrame>
  );
}

function isDirectRenderUri(uri: string | null | undefined) {
  return Boolean(uri && /^(data:|file:)/i.test(uri));
}

const styles = StyleSheet.create({
  imageShell: {
    overflow: 'hidden',
  },
  imageFill: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    width: '100%',
  },
});
