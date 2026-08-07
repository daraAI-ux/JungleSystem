import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import type { KolamCategory } from '../domain/kolam-category';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { openKolamImagePreview } from './kolam-image-preview-dialog';
import { KolamInteractionFrame } from './kolam-interaction-frame';
import { KolamLocalAssetImage } from './kolam-local-asset-image';

export function KolamCategoryIcon({
  category,
  variant = 'list',
}: {
  category: KolamCategory;
  variant?: 'list' | 'detail' | 'summary';
}) {
  const sourceUri =
    variant === 'list'
      ? category.photos[0] ?? category.iconUrl
      : category.iconUrl;
  const svgXml = useCategorySvgXml(sourceUri);
  const usesSvg = Boolean(sourceUri && isSvgUri(sourceUri));
  const iconStyle = [
    styles.icon,
    variant === 'detail' && styles.iconDetail,
    variant === 'summary' && styles.iconSummary,
  ];
  const placeholderStyle = [
    styles.placeholder,
    variant === 'summary' && styles.placeholderSummary,
  ];

  if (usesSvg) {
    return (
      <KolamInteractionFrame
        accessibilityLabel={`Lihat ${category.name} icon`}
        onPress={() => {
          if (!sourceUri) {
            return;
          }

          openKolamImagePreview({
            revision: getCategoryIconRevision(category),
            scope: 'category-icon',
            title: `${category.name} icon`,
            uri: sourceUri,
          });
        }}
        style={iconStyle}
      >
        <View style={placeholderStyle}>
          {variant !== 'list' ? (
            <Text
              numberOfLines={1}
              style={[
                styles.placeholderText,
                variant === 'detail' && styles.placeholderTextDetail,
                variant === 'summary' && styles.placeholderTextSummary,
              ]}>
              {getCategoryInitial(category.name)}
            </Text>
          ) : null}
        </View>
        {svgXml ? (
          <View style={styles.image}>
            <SvgXml height="100%" width="100%" xml={svgXml} />
          </View>
        ) : null}
      </KolamInteractionFrame>
    );
  }

  return (
    <View style={iconStyle}>
      <View style={placeholderStyle}>
        {variant !== 'list' ? (
          <Text
            numberOfLines={1}
            style={[
              styles.placeholderText,
              variant === 'detail' && styles.placeholderTextDetail,
              variant === 'summary' && styles.placeholderTextSummary,
            ]}>
            {getCategoryInitial(category.name)}
          </Text>
        ) : null}
      </View>
      <KolamLocalAssetImage
        accessibilityLabel={`${category.name} icon`}
        resizeMode="contain"
        revision={getCategoryIconRevision(category)}
        scope="category-icon"
        sourceUri={sourceUri}
        style={styles.image}
      />
    </View>
  );
}

function useCategorySvgXml(sourceUri: string | null | undefined) {
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
      const decoded = decodeSvgDataUri(sourceUri);
      setSvgXml(decoded);
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

function getCategoryIconRevision(category: KolamCategory) {
  return [
    category.iconUrl ?? '',
    category.photos[0] ?? '',
    category.updatedAt ?? '',
  ].join(':');
}

function getCategoryInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?';
}

const styles = StyleSheet.create({
  icon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    overflow: 'hidden',
    flexShrink: 0,
    backgroundColor: V.colors.successSoft,
  },
  iconDetail: {
    width: 84,
    height: 84,
    borderRadius: 14,
  },
  iconSummary: {
    backgroundColor: 'transparent',
    width: 154,
    height: 154,
    borderRadius: 16,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.successSoft,
  },
  placeholderSummary: {
    backgroundColor: 'transparent',
  },
  placeholderText: {
    color: V.colors.success,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
  },
  placeholderTextDetail: {
    fontSize: 28,
  },
  placeholderTextSummary: {
    fontSize: 42,
  },
});
