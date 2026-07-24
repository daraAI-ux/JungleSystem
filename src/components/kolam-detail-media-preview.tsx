import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {type KolamImagePreviewItem} from './kolam-image-preview-dialog';
import {KolamInteractionFrame} from './kolam-interaction-frame';
import {openKolamMediaPreview} from './kolam-media-preview-dialog';
import {KolamRemoteImage} from './kolam-remote-image';
import {KolamStatusBadge} from './kolam-status-badge';

export type KolamDetailMediaItem = {
  badgeLabel?: string;
  id: string;
  label: string;
  revision?: string;
  scope?: string;
  type: 'image' | 'video';
  uri: string;
};

export function KolamDetailMediaPreview({
  items,
  title,
}: {
  items: KolamDetailMediaItem[];
  title: string;
}) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const safeIndex = Math.min(currentIndex, Math.max(0, items.length - 1));
  const current = items[safeIndex];
  const imagePreviewItems = React.useMemo<KolamImagePreviewItem[]>(
    () =>
      items
        .filter(item => item.type === 'image')
        .map(item => ({
          revision: item.revision ?? item.uri,
          scope: item.scope ?? 'detail-media',
          title: item.label,
          uri: item.uri,
        })),
    [items],
  );
  const imagePreviewIndexById = React.useMemo(() => {
    const indexById = new Map<string, number>();
    let imageIndex = 0;

    items.forEach(item => {
      if (item.type === 'image') {
        indexById.set(item.id, imageIndex);
        imageIndex += 1;
      }
    });

    return indexById;
  }, [items]);

  React.useEffect(() => {
    if (currentIndex >= items.length) {
      setCurrentIndex(Math.max(0, items.length - 1));
    }
  }, [currentIndex, items.length]);

  if (!current) {
    return null;
  }

  const goPrevious = () => {
    setCurrentIndex(index => (index - 1 + items.length) % items.length);
  };
  const goNext = () => {
    setCurrentIndex(index => (index + 1) % items.length);
  };

  return (
    <View style={styles.stack}>
      <View style={styles.mainFrame}>
        {current.type === 'video' ? (
          <VideoMediaTile item={current} large />
        ) : (
          <KolamRemoteImage
            accessibilityLabel={`Foto ${title}`}
            previewIndex={imagePreviewIndexById.get(current.id)}
            previewItems={imagePreviewItems}
            resizeMode="cover"
            revision={current.revision ?? current.uri}
            scope={current.scope ?? 'detail-media'}
            sourceUri={current.uri}
            style={styles.mainImage}
          />
        )}
        {current.badgeLabel ? (
          <View style={styles.badge}>
            <KolamStatusBadge intent="muted" label={current.badgeLabel} />
          </View>
        ) : null}
        {current.type === 'video' ? (
          <View style={styles.typeBadge}>
            <KolamStatusBadge intent="danger" label="Video" />
          </View>
        ) : null}
        {items.length > 1 ? (
          <View style={styles.counter}>
            <Text style={styles.counterText}>
              {safeIndex + 1} / {items.length}
            </Text>
          </View>
        ) : null}
        {items.length > 1 ? (
          <>
            <KolamInteractionFrame
              accessibilityLabel="Media sebelumnya"
              onPress={goPrevious}
              style={[styles.arrow, styles.arrowLeft]}>
              <Text style={styles.arrowText}>{'<'}</Text>
            </KolamInteractionFrame>
            <KolamInteractionFrame
              accessibilityLabel="Media berikutnya"
              onPress={goNext}
              style={[styles.arrow, styles.arrowRight]}>
              <Text style={styles.arrowText}>{'>'}</Text>
            </KolamInteractionFrame>
          </>
        ) : null}
      </View>
      {items.length > 1 ? (
        <ScrollView
          contentContainerStyle={styles.thumbList}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbScroll}>
          {items.map((item, index) => (
            <KolamInteractionFrame
              accessibilityLabel={`Pilih media ${index + 1}`}
              key={item.id}
              onPress={() => setCurrentIndex(index)}
              selected={safeIndex === index}
              style={[
                styles.thumb,
                safeIndex === index ? styles.thumbActive : null,
              ]}>
              {item.type === 'video' ? (
                <VideoMediaTile item={item} />
              ) : (
                <KolamRemoteImage
                  accessibilityLabel={`Thumb ${item.label}`}
                  previewIndex={imagePreviewIndexById.get(item.id)}
                  previewItems={imagePreviewItems}
                  resizeMode="cover"
                  revision={item.revision ?? item.uri}
                  scope={item.scope ?? 'detail-media'}
                  sourceUri={item.uri}
                  style={styles.thumbImage}
                />
              )}
            </KolamInteractionFrame>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

function VideoMediaTile({
  item,
  large = false,
}: {
  item: KolamDetailMediaItem;
  large?: boolean;
}) {
  return (
    <KolamInteractionFrame
      accessibilityLabel={`Lihat video ${item.label}`}
      onPress={() =>
        openKolamMediaPreview({
          kind: 'video',
          title: item.label,
          uri: item.uri,
        })
      }
      style={[styles.videoTile, large ? styles.videoTileLarge : null]}>
      <View style={styles.videoPlayCircle}>
        <Text style={styles.videoPlayText}>{'>'}</Text>
      </View>
    </KolamInteractionFrame>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 10,
    width: '100%',
  },
  mainFrame: {
    aspectRatio: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  mainImage: {
    height: '100%',
    width: '100%',
  },
  badge: {
    left: 10,
    position: 'absolute',
    top: 10,
  },
  typeBadge: {
    left: 10,
    position: 'absolute',
    top: 10,
  },
  counter: {
    backgroundColor: '#f8fafc',
    borderColor: '#16a34a',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: 'absolute',
    right: 10,
    top: 10,
  },
  counterText: {
    color: '#047857',
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 14,
  },
  arrow: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 999,
    height: 34,
    justifyContent: 'center',
    position: 'absolute',
    top: '44%',
    width: 34,
  },
  arrowLeft: {
    left: 8,
  },
  arrowRight: {
    right: 8,
  },
  arrowText: {
    color: '#047857',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 22,
    textAlign: 'center',
  },
  thumbScroll: {
    width: '100%',
  },
  thumbList: {
    gap: 8,
    paddingVertical: 2,
  },
  thumb: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 64,
    overflow: 'hidden',
    width: 64,
  },
  thumbActive: {
    borderColor: '#16a34a',
    borderWidth: 2,
  },
  thumbImage: {
    height: '100%',
    width: '100%',
  },
  videoTile: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    height: '100%',
    justifyContent: 'center',
    padding: 6,
    width: '100%',
  },
  videoTileLarge: {
    backgroundColor: '#e5e7eb',
  },
  videoPlayCircle: {
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
    borderRadius: 999,
    minHeight: 30,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  videoPlayText: {
    color: '#475569',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 16,
  },
});
