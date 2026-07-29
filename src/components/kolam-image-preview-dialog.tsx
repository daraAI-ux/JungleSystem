import React from 'react';
import {
  Dimensions,
  Image,
  type LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
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

export function getKolamImagePreviewSize(bounds: {
  height: number;
  width: number;
}) {
  const safeWidth = Number.isFinite(bounds.width) ? bounds.width : 0;
  const safeHeight = Number.isFinite(bounds.height) ? bounds.height : 0;
  const dialogWidth = Math.max(360, Math.min(safeWidth - 32, 1320));
  const dialogHeight = Math.max(360, Math.min(safeHeight - 32, 960));
  const imageStageWidth = Math.max(320, dialogWidth - 24);

  return {
    dialogHeight,
    dialogWidth,
    imageStageHeight: Math.max(280, dialogHeight - 74),
    imageStageWidth,
  };
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
  const [hostSize, setHostSize] = React.useState(() =>
    Dimensions.get('window'),
  );
  const galleryKey = React.useMemo(
    () => items.map(item => item.uri).join('|'),
    [items],
  );
  const safeIndex = clampIndex(currentIndex, items.length);
  const current = items[safeIndex];
  const previewSize = React.useMemo(
    () => getKolamImagePreviewSize(hostSize),
    [hostSize],
  );
  const resolvedUri = current?.uri ?? null;
  const usesSvg = Boolean(resolvedUri && isSvgUri(resolvedUri));
  const svgXml = usePreviewSvgXml(resolvedUri);

  const handleHostLayout = React.useCallback((event: LayoutChangeEvent) => {
    const { height, width } = event.nativeEvent.layout;

    setHostSize(previous =>
      Math.round(previous.width) === Math.round(width) &&
      Math.round(previous.height) === Math.round(height)
        ? previous
        : {
            fontScale: previous.fontScale,
            height,
            scale: previous.scale,
            width,
          },
    );
  }, []);

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
    <View
      onLayout={handleHostLayout}
      style={styles.host}
      pointerEvents="box-none"
    >
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
          {resolvedUri && usesSvg ? (
            svgXml ? (
              <View
                style={{
                  height: previewSize.imageStageHeight,
                  width: previewSize.imageStageWidth,
                }}
              >
                <SvgXml height="100%" width="100%" xml={svgXml} />
              </View>
            ) : (
              <Text style={styles.loadingText}>Memuat gambar...</Text>
            )
          ) : resolvedUri ? (
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

function usePreviewSvgXml(sourceUri: string | null | undefined) {
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
  host: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
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
