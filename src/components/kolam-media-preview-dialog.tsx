import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamButton } from './kolam-button';
import { KolamInteractionFrame } from './kolam-interaction-frame';
import { KolamMediaPlayer } from './kolam-media-player';

export type KolamMediaPreviewItem = {
  kind: 'audio' | 'video';
  title: string;
  uri: string;
};

type KolamMediaPreviewState = KolamMediaPreviewItem | null;

const mediaPreviewListeners = new Set<() => void>();
let mediaPreviewState: KolamMediaPreviewState = null;

export function openKolamMediaPreview(nextState: KolamMediaPreviewItem) {
  if (!nextState.uri?.trim()) {
    return;
  }

  mediaPreviewState = nextState;
  notifyMediaPreviewListeners();
}

function closeKolamMediaPreview() {
  mediaPreviewState = null;
  notifyMediaPreviewListeners();
}

function subscribeMediaPreview(listener: () => void) {
  mediaPreviewListeners.add(listener);
  return () => {
    mediaPreviewListeners.delete(listener);
  };
}

function notifyMediaPreviewListeners() {
  mediaPreviewListeners.forEach(listener => listener());
}

function getMediaPreviewSnapshot() {
  return mediaPreviewState;
}

export function KolamMediaPreviewHost() {
  const state = React.useSyncExternalStore(
    subscribeMediaPreview,
    getMediaPreviewSnapshot,
    getMediaPreviewSnapshot,
  );

  if (!state) {
    return null;
  }

  return (
    <KolamMediaPreviewDialog item={state} onClose={closeKolamMediaPreview} />
  );
}

function KolamMediaPreviewDialog({
  item,
  onClose,
}: {
  item: KolamMediaPreviewItem;
  onClose: () => void;
}) {
  const previewSize = React.useMemo(() => {
    const windowSize = Dimensions.get('window');
    const dialogWidth = Math.max(360, Math.min(windowSize.width - 96, 1080));
    const dialogHeight =
      item.kind === 'video'
        ? Math.max(320, Math.min(windowSize.height - 96, 760))
        : 156;

    return {
      dialogHeight,
      dialogWidth,
      playerHeight:
        item.kind === 'video' ? Math.max(240, dialogHeight - 64) : 52,
    };
  }, [item.kind, item.uri]);

  return (
    <View style={styles.host} pointerEvents="box-none">
      <KolamInteractionFrame
        accessibilityLabel="Tutup preview media"
        onPress={onClose}
        style={styles.backdrop}
      />
      <View
        accessibilityLabel={item.title}
        style={[
          styles.dialog,
          { height: previewSize.dialogHeight, width: previewSize.dialogWidth },
        ]}
      >
        <View style={styles.header}>
          <Text numberOfLines={2} style={styles.title}>
            {item.title}
          </Text>
          <KolamButton label="Tutup" onPress={onClose} />
        </View>
        <KolamMediaPlayer
          kind={item.kind}
          title={item.title}
          uri={item.uri}
          style={{ height: previewSize.playerHeight, width: '100%' }}
        />
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
    zIndex: 10000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.20)',
  },
  dialog: {
    backgroundColor: V.colors.bg,
    gap: 12,
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
});
