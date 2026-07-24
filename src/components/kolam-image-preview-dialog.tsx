import React from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamButton } from './kolam-button';
import { KolamInteractionFrame } from './kolam-interaction-frame';

export type KolamImagePreviewItem = {
  revision?: string;
  scope?: string;
  title: string;
  uri: string;
};

type KolamImagePreviewState = {
  initialIndex: number;
  items: KolamImagePreviewItem[];
} | null;

type OpenKolamImagePreviewInput = KolamImagePreviewItem & {
  initialIndex?: number;
  items?: KolamImagePreviewItem[];
};

const imagePreviewListeners = new Set<() => void>();
let imagePreviewState: KolamImagePreviewState = null;

export function openKolamImagePreview(nextState: OpenKolamImagePreviewInput) {
  const fallbackItem = getValidPreviewItem(nextState);
  const rawItems = nextState.items?.length
    ? nextState.items
    : fallbackItem
    ? [fallbackItem]
    : [];
  const items = rawItems
    .map(getValidPreviewItem)
    .filter((item): item is KolamImagePreviewItem => Boolean(item));
  const safeItems = items.length ? items : fallbackItem ? [fallbackItem] : [];

  if (!safeItems.length) {
    return;
  }

  const matchedIndex = safeItems.findIndex(item => item.uri === nextState.uri);
  const requestedIndex =
    nextState.initialIndex ?? (matchedIndex >= 0 ? matchedIndex : 0);

  imagePreviewState = {
    initialIndex: clampIndex(requestedIndex, safeItems.length),
    items: safeItems,
  };
  notifyImagePreviewListeners();
}

function closeKolamImagePreview() {
  imagePreviewState = null;
  notifyImagePreviewListeners();
}

function subscribeImagePreview(listener: () => void) {
  imagePreviewListeners.add(listener);
  return () => {
    imagePreviewListeners.delete(listener);
  };
}

function notifyImagePreviewListeners() {
  imagePreviewListeners.forEach(listener => listener());
}

function getImagePreviewSnapshot() {
  return imagePreviewState;
}

function getValidPreviewItem(
  item: KolamImagePreviewItem | null | undefined,
): KolamImagePreviewItem | null {
  if (!item?.uri?.trim()) {
    return null;
  }

  return {
    revision: item.revision,
    scope: item.scope,
    title: item.title || 'Preview gambar',
    uri: item.uri,
  };
}

function clampIndex(index: number, length: number) {
  if (!length) {
    return 0;
  }

  return Math.max(0, Math.min(index, length - 1));
}

export function KolamImagePreviewHost() {
  const state = React.useSyncExternalStore(
    subscribeImagePreview,
    getImagePreviewSnapshot,
    getImagePreviewSnapshot,
  );

  if (!state) {
    return null;
  }

  return (
    <KolamImagePreviewDialog
      initialIndex={state.initialIndex}
      items={state.items}
      onClose={closeKolamImagePreview}
    />
  );
}

function KolamImagePreviewDialog({
  initialIndex,
  items,
  onClose,
}: {
  initialIndex: number;
  items: KolamImagePreviewItem[];
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const galleryKey = React.useMemo(
    () => items.map(item => item.uri).join('|'),
    [items],
  );
  const safeIndex = clampIndex(currentIndex, items.length);
  const current = items[safeIndex];
  const previewSize = React.useMemo(() => {
    const windowSize = Dimensions.get('window');
    const dialogWidth = Math.max(280, Math.min(windowSize.width - 80, 1040));
    const dialogHeight = Math.max(260, Math.min(windowSize.height - 80, 760));

    return {
      dialogHeight,
      dialogWidth,
      imageStageHeight: Math.max(180, dialogHeight - 72),
      imageStageWidth: dialogWidth,
    };
  }, [galleryKey]);
  const resolvedUri = current?.uri ?? null;

  React.useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [galleryKey, initialIndex]);

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
    <View style={styles.host} pointerEvents="box-none">
      <KolamInteractionFrame
        accessibilityLabel="Tutup preview gambar"
        onPress={onClose}
        style={styles.backdrop}
      />
      <View
        accessibilityLabel={current.title}
        style={[
          styles.dialog,
          {
            height: previewSize.dialogHeight,
            width: previewSize.dialogWidth,
          },
        ]}
      >
        <View style={styles.header}>
          <Text numberOfLines={2} style={styles.title}>
            {current.title}
          </Text>
          {items.length > 1 ? (
            <Text style={styles.counter}>
              {safeIndex + 1} / {items.length}
            </Text>
          ) : null}
          <KolamButton label="Tutup" onPress={onClose} />
        </View>
        <View
          style={[
            styles.imageStage,
            {
              height: previewSize.imageStageHeight,
              width: previewSize.imageStageWidth,
            },
          ]}
        >
          {resolvedUri ? (
            <Image
              accessibilityIgnoresInvertColors
              accessibilityLabel={current.title}
              resizeMode="contain"
              source={{ uri: resolvedUri }}
              style={{
                height: previewSize.imageStageHeight,
                width: previewSize.imageStageWidth,
              }}
            />
          ) : (
            <Text style={styles.loadingText}>Memuat gambar...</Text>
          )}
          {items.length > 1 ? (
            <>
              <KolamInteractionFrame
                accessibilityLabel="Gambar sebelumnya"
                onPress={goPrevious}
                style={[
                  styles.arrowButton,
                  styles.arrowLeft,
                  { top: Math.max(0, (previewSize.imageStageHeight - 48) / 2) },
                ]}
              >
                <Text style={styles.arrowText}>{'<'}</Text>
              </KolamInteractionFrame>
              <KolamInteractionFrame
                accessibilityLabel="Gambar berikutnya"
                onPress={goNext}
                style={[
                  styles.arrowButton,
                  styles.arrowRight,
                  { top: Math.max(0, (previewSize.imageStageHeight - 48) / 2) },
                ]}
              >
                <Text style={styles.arrowText}>{'>'}</Text>
              </KolamInteractionFrame>
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    zIndex: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.20)',
  },
  dialog: {
    backgroundColor: V.colors.bg,
    gap: 10,
    padding: 12,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  title: {
    color: V.colors.fg,
    flex: 1,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 22,
  },
  counter: {
    color: V.colors.muted,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  imageStage: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  loadingText: {
    color: V.colors.muted,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
  },
  arrowButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.64)',
    height: 48,
    justifyContent: 'center',
    position: 'absolute',
    width: 48,
    zIndex: 2,
  },
  arrowLeft: {
    left: 12,
  },
  arrowRight: {
    right: 12,
  },
  arrowText: {
    color: '#ffffff',
    fontFamily: V.fontFamily,
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 30,
  },
});

