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
  openKolamImagePreview,
  type KolamImagePreviewItem,
} from './kolam-image-preview-dialog';
import { KolamInteractionFrame } from './kolam-interaction-frame';

export function KolamRemoteImage({
  accessibilityLabel,
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
  const [failedUri, setFailedUri] = React.useState<string | null>(null);
  const imageRevision = revision ?? sourceUri ?? '';
  const visibleUri = sourceUri && sourceUri !== failedUri ? sourceUri : null;

  React.useEffect(() => {
    setFailedUri(null);
  }, [sourceUri]);

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
