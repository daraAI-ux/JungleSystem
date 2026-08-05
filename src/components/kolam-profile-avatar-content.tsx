import React, {useEffect, useState} from 'react';
import {
  Image,
  StyleSheet,
  type ImageStyle,
  type StyleProp,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {KolamCopyStack} from './kolam-copy-stack';

export function KolamProfileAvatarContent({
  imageUrl,
  imageStyle,
  initials,
  textStyle,
}: {
  imageUrl?: string | null;
  imageStyle: StyleProp<ImageStyle>;
  initials: string;
  textStyle: StyleProp<TextStyle>;
}) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const visibleImageUrl =
    imageUrl && imageUrl !== failedImageUrl ? imageUrl : undefined;
  const svgXml = useAvatarSvgXml(visibleImageUrl);

  useEffect(() => {
    setFailedImageUrl(null);
  }, [imageUrl]);

  if (visibleImageUrl) {
    if (isSvgUri(visibleImageUrl) && svgXml) {
      return (
        <View style={[imageStyle as StyleProp<ViewStyle>, styles.svgShell]}>
          <SvgXml height="100%" width="100%" xml={svgXml} />
        </View>
      );
    }

    return (
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="cover"
        source={{uri: visibleImageUrl}}
        style={imageStyle}
        onError={() => setFailedImageUrl(visibleImageUrl)}
      />
    );
  }

  return (
    <KolamCopyStack
      items={[{id: 'initials', text: initials, style: textStyle}]}
    />
  );
}

function useAvatarSvgXml(sourceUri: string | null | undefined) {
  const [svgXml, setSvgXml] = useState<string | null>(null);

  useEffect(() => {
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

    fetch(sourceUri)
      .then(response => (response.ok ? response.text() : ''))
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
  svgShell: {
    overflow: 'hidden',
  },
});
