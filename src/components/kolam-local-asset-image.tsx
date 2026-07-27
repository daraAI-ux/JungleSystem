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
  getRenderableKolamLocalAssetUri,
  syncKolamLocalAsset,
} from '../services/kolam-local-asset-store';
import { openKolamImagePreview } from './kolam-image-preview-dialog';
import { KolamInteractionFrame } from './kolam-interaction-frame';

export function KolamLocalAssetImage({
  accessibilityLabel,
  allowRemoteFallback = true,
  resizeMode = 'cover',
  revision,
  scope,
  sourceUri,
  style,
}: {
  accessibilityLabel: string;
  allowRemoteFallback?: boolean;
  resizeMode?: ImageResizeMode;
  revision?: string;
  scope: string;
  sourceUri: string | null | undefined;
  style: StyleProp<ImageStyle>;
}) {
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
    void syncKolamLocalAsset({
      revision,
      scope,
      sourceUri,
    })
      .then(asset => {
        if (cancelled) {
          return;
        }

        setCachedUri(getRenderableKolamLocalAssetUri(asset));
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
  }, [revision, scope, sourceUri]);

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
          revision,
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
