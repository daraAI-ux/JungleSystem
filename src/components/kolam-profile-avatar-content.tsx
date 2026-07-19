import React, {useEffect, useState} from 'react';
import {
  Image,
  type ImageStyle,
  type StyleProp,
  type TextStyle,
} from 'react-native';
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

  useEffect(() => {
    setFailedImageUrl(null);
  }, [imageUrl]);

  if (visibleImageUrl) {
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
