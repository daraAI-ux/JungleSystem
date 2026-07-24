import React from 'react';
import {
  Image,
  StyleSheet,
  type ImageResizeMode,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { openKolamImagePreview } from './kolam-image-preview-dialog';
import { KolamInteractionFrame } from './kolam-interaction-frame';

export function KolamLocalAssetImage({
  accessibilityLabel,
  resizeMode = 'cover',
  revision,
  scope,
  sourceUri,
  style,
}: {
  accessibilityLabel: string;
  resizeMode?: ImageResizeMode;
  revision?: string;
  scope: string;
  sourceUri: string | null | undefined;
  style: StyleProp<ImageStyle>;
}) {
  const [failedUri, setFailedUri] = React.useState<string | null>(null);
  const visibleUri = sourceUri && sourceUri !== failedUri ? sourceUri : null;

  React.useEffect(() => {
    setFailedUri(null);
  }, [revision, scope, sourceUri]);

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
