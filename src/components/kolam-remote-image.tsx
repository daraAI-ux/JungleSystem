import React from 'react';
import {
  Image,
  StyleSheet,
  type ImageResizeMode,
  type ImageStyle,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import {
  getRenderableKolamImageUri,
  syncKolamImageCache,
} from '../services/kolam-image-local-cache';
import { readNativeSvgPreviewFile } from '../services/native-file-picker';
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
  const svgXml = useKolamSvgXml(sourceUri);
  const usesSvg = Boolean(sourceUri && isSvgUri(sourceUri));
  const [syncDone, setSyncDone] = React.useState(() => isDirectRenderUri(sourceUri));

  React.useEffect(() => {
    let cancelled = false;
    setFailedUri(null);
    setCachedUri(null);

    if (!sourceUri) {
      setSyncDone(true);
      return;
    }

    if (isDirectRenderUri(sourceUri) || isSvgUri(sourceUri)) {
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
      {usesSvg && svgXml ? (
        <View style={styles.imageFill}>
          <SvgXml height="100%" width="100%" xml={svgXml} />
        </View>
      ) : (
        <Image
          accessibilityIgnoresInvertColors
          accessibilityLabel={accessibilityLabel}
          resizeMode={resizeMode}
          source={{ uri: visibleUri }}
          style={styles.imageFill}
          onError={() => setFailedUri(visibleUri)}
        />
      )}
    </KolamInteractionFrame>
  );
}

function isDirectRenderUri(uri: string | null | undefined) {
  return Boolean(uri && /^(data:|file:)/i.test(uri));
}

function useKolamSvgXml(sourceUri: string | null | undefined) {
  const [svgXml, setSvgXml] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setSvgXml(null);

    if (!sourceUri || !isSvgUri(sourceUri)) {
      return () => {
        cancelled = true;
      };
    }

    if (isSvgDataUri(sourceUri)) {
      setSvgXml(decodeSvgDataUri(sourceUri));
      return () => {
        cancelled = true;
      };
    }

    const svgTextPromise = isLocalFileUri(sourceUri)
      ? readNativeSvgPreviewFile(sourceUri)
      : fetch(sourceUri).then(response => (response.ok ? response.text() : ''));

    svgTextPromise
      .then(svg => {
        if (!cancelled && svg.trim()) {
          setSvgXml(svg);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSvgXml(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [sourceUri]);

  return svgXml;
}

function isSvgUri(uri: string) {
  return isSvgDataUri(uri) || /\.svg(?:[?#]|$)/i.test(uri);
}

function isSvgDataUri(uri: string) {
  return /^data:image\/svg\+xml/i.test(uri);
}

function isLocalFileUri(uri: string) {
  return /^file:/i.test(uri);
}

function decodeSvgDataUri(uri: string) {
  const commaIndex = uri.indexOf(',');
  if (commaIndex < 0) {
    return null;
  }

  const payload = uri.slice(commaIndex + 1);
  try {
    return decodeURIComponent(payload);
  } catch {
    return payload;
  }
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
