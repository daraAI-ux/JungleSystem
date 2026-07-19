import React from 'react';
import {
  Image,
  type ImageResizeMode,
  type ImageStyle,
  type StyleProp,
} from 'react-native';
import { readKolamLocalAsset } from '../services/kolam-local-asset-store';

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
  const [dataUri, setDataUri] = React.useState<string | null>(null);
  const [retryIndex, setRetryIndex] = React.useState(0);
  const assetRevision = revision ?? sourceUri ?? '';
  const isInlineImage = sourceUri?.startsWith('data:') ?? false;

  React.useEffect(() => {
    setDataUri(isInlineImage ? sourceUri ?? null : null);
    setRetryIndex(0);
  }, [assetRevision, isInlineImage, sourceUri]);

  React.useEffect(() => {
    if (dataUri || !sourceUri || isInlineImage || retryIndex >= 4) {
      return;
    }

    const delays = [350, 1000, 2500, 5000];
    const timer = setTimeout(() => {
      setRetryIndex(current => current + 1);
    }, delays[retryIndex] ?? delays[delays.length - 1]);

    return () => clearTimeout(timer);
  }, [dataUri, isInlineImage, retryIndex, sourceUri]);

  React.useEffect(() => {
    if (!sourceUri || isInlineImage) {
      return;
    }

    let active = true;
    void readKolamLocalAsset(scope, sourceUri)
      .then(asset => {
        if (active) {
          setDataUri(
            asset?.revision === assetRevision ? asset.value.dataUri : null,
          );
        }
      })
      .catch(() => {
        if (active) {
          setDataUri(null);
        }
      });

    return () => {
      active = false;
    };
  }, [assetRevision, isInlineImage, retryIndex, scope, sourceUri]);

  if (!dataUri) {
    return null;
  }

  return (
    <Image
      accessibilityIgnoresInvertColors
      accessibilityLabel={accessibilityLabel}
      resizeMode={resizeMode}
      source={{ uri: dataUri }}
      style={style}
    />
  );
}
