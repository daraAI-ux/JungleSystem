import React from 'react';
import {
  Image,
  type ImageResizeMode,
  type ImageStyle,
  type StyleProp,
} from 'react-native';
import { syncKolamImageCache } from '../services/kolam-image-local-cache';

export function KolamRemoteImage({
  accessibilityLabel,
  allowRemoteFallback = false,
  resizeMode = 'cover',
  revision,
  scope = 'general',
  sourceUri,
  style,
}: {
  accessibilityLabel: string;
  allowRemoteFallback?: boolean;
  resizeMode?: ImageResizeMode;
  revision?: string;
  scope?: string;
  sourceUri: string | null | undefined;
  style: StyleProp<ImageStyle>;
}) {
  const [failedUri, setFailedUri] = React.useState<string | null>(null);
  const [cachedUri, setCachedUri] = React.useState<string | null>(null);
  const imageRevision = revision ?? sourceUri ?? '';
  const isInlineImage = sourceUri?.startsWith('data:') ?? false;
  const fallbackUri = allowRemoteFallback || isInlineImage ? sourceUri : null;
  const visibleUri = [cachedUri, fallbackUri].find(
    uri => uri && uri !== failedUri,
  );

  React.useEffect(() => {
    setFailedUri(null);
    setCachedUri(null);

    if (isInlineImage) {
      return;
    }

    let active = true;
    void syncKolamImageCache({ revision: imageRevision, scope, sourceUri })
      .then(image => {
        if (active) {
          setCachedUri(image?.dataUri ?? null);
        }
      })
      .catch(() => {
        if (active) {
          setCachedUri(null);
        }
      });

    return () => {
      active = false;
    };
  }, [imageRevision, isInlineImage, scope, sourceUri]);

  if (!visibleUri) {
    return null;
  }

  return (
    <Image
      accessibilityIgnoresInvertColors
      accessibilityLabel={accessibilityLabel}
      resizeMode={resizeMode}
      source={{ uri: visibleUri }}
      style={style}
      onError={() => setFailedUri(visibleUri)}
    />
  );
}
