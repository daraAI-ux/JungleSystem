import React, {useEffect, useMemo, useState} from 'react';
import {
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import WebView from 'react-native-webview';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {KolamChatYoutubePayload} from '../domain/kolam-chat-youtube';
import {KolamPressable} from './kolam-pressable';
import {KolamRemoteImage} from './kolam-remote-image';

const KolamWebView = WebView as unknown as React.ComponentType<any>;

/** One WebView2 YouTube player at a time across inbox + team chat. */
let activePlayKey: string | null = null;
const playListeners = new Set<() => void>();

function setActiveYoutubePlayKey(next: string | null) {
  activePlayKey = next;
  playListeners.forEach(listener => listener());
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildYoutubeEmbedUri(videoId: string) {
  const safeId = encodeURIComponent(videoId);
  // Direct youtube.com embed (not nocookie nested in local HTML) so WebView2
  // has a real https origin/referer — avoids Error 153.
  return `https://www.youtube.com/embed/${safeId}?rel=0&playsinline=1`;
}

/**
 * Fallback HTML if URI navigation is blocked. Sends referrer so YouTube
 * accepts the embed (Error 153 = missing/suppressed Referer).
 */
function createYoutubeEmbedHtml(videoId: string, title?: string) {
  const safeId = encodeURIComponent(videoId);
  const safeTitle = escapeHtml(title || 'YouTube video');
  const src = `https://www.youtube.com/embed/${safeId}?rel=0&playsinline=1`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/><meta name="referrer" content="strict-origin-when-cross-origin"/><style>html,body{margin:0;padding:0;width:100%;height:100%;background:#000;overflow:hidden}iframe{border:0;width:100%;height:100%;display:block}</style></head><body><iframe src="${src}" title="${safeTitle}" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe></body></html>`;
}

/**
 * SoT FE `YoutubeEmbed` — thumbnail until play (exclusive WebView2 on Windows).
 * Loads embed as top-level URI to satisfy YouTube Referer checks (Error 153).
 */
export function KolamChatYoutubeCard({
  playKey,
  youtube,
}: {
  playKey: string;
  youtube: KolamChatYoutubePayload;
}) {
  const [playing, setPlaying] = useState(false);
  const [useHtmlFallback, setUseHtmlFallback] = useState(false);
  const thumbnailUri = youtube.videoId
    ? `https://i.ytimg.com/vi/${youtube.videoId}/hqdefault.jpg`
    : null;
  const watchUrl =
    youtube.url?.trim() ||
    `https://www.youtube.com/watch?v=${youtube.videoId}`;
  const embedUri = useMemo(
    () => buildYoutubeEmbedUri(youtube.videoId),
    [youtube.videoId],
  );
  const htmlFallback = useMemo(
    () => createYoutubeEmbedHtml(youtube.videoId, youtube.title),
    [youtube.title, youtube.videoId],
  );

  useEffect(() => {
    const sync = () => {
      if (activePlayKey !== playKey) {
        setPlaying(false);
        setUseHtmlFallback(false);
      }
    };
    playListeners.add(sync);
    return () => {
      playListeners.delete(sync);
      if (activePlayKey === playKey) {
        setActiveYoutubePlayKey(null);
      }
    };
  }, [playKey]);

  const openWatchUrl = () => {
    Linking.openURL(watchUrl).catch(() => undefined);
  };

  if (playing) {
    return (
      <View style={styles.card}>
        <View style={styles.playerFrame}>
          <KolamWebView
            allowsFullscreenVideo
            containerStyle={styles.webViewContainer}
            javaScriptEnabled
            mediaPlaybackRequiresUserAction={false}
            onError={() => {
              if (!useHtmlFallback) {
                setUseHtmlFallback(true);
              }
            }}
            onHttpError={() => {
              if (!useHtmlFallback) {
                setUseHtmlFallback(true);
              }
            }}
            originWhitelist={['*']}
            source={
              useHtmlFallback
                ? {
                    html: htmlFallback,
                    baseUrl: 'https://www.youtube.com/',
                  }
                : {uri: embedUri}
            }
            style={styles.webView}
            useWebView2={Platform.OS === 'windows'}
          />
        </View>
        <KolamPressable
          accessibilityLabel="Buka di YouTube"
          onPress={openWatchUrl}
          style={styles.footerLink}
        >
          <Text numberOfLines={1} style={styles.footerLinkText}>
            {youtube.title || 'Buka di YouTube'}
          </Text>
        </KolamPressable>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <KolamPressable
        accessibilityLabel="Putar YouTube"
        onPress={() => {
          setUseHtmlFallback(false);
          setActiveYoutubePlayKey(playKey);
          setPlaying(true);
        }}
        style={styles.previewPressable}
      >
        {thumbnailUri ? (
          <KolamRemoteImage
            accessibilityLabel="Thumbnail YouTube"
            resizeMode="cover"
            scope="chat-youtube"
            sourceUri={thumbnailUri}
            style={styles.thumbnail}
          />
        ) : (
          <View style={styles.thumbnailFallback}>
            <Text style={styles.thumbnailFallbackText}>YT</Text>
          </View>
        )}
        <View style={styles.playBadge}>
          <Text style={styles.playBadgeText}>▶</Text>
        </View>
      </KolamPressable>
      <KolamPressable
        accessibilityLabel="Buka di YouTube"
        onPress={openWatchUrl}
        style={styles.footerLink}
      >
        <Text numberOfLines={1} style={styles.footerLinkText}>
          {youtube.title || 'Buka di YouTube'}
        </Text>
      </KolamPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    maxWidth: '100%',
    overflow: 'hidden',
    width: 288,
  },
  previewPressable: {
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    width: '100%',
  },
  thumbnail: {
    height: '100%',
    width: '100%',
  },
  thumbnailFallback: {
    alignItems: 'center',
    backgroundColor: V.colors.mutedSoft,
    flex: 1,
    justifyContent: 'center',
  },
  thumbnailFallbackText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '700',
  },
  playBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 28,
    height: 48,
    justifyContent: 'center',
    left: '50%',
    marginLeft: -24,
    marginTop: -24,
    position: 'absolute',
    top: '50%',
    width: 48,
  },
  playBadgeText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 2,
  },
  playerFrame: {
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    width: '100%',
  },
  webViewContainer: {
    backgroundColor: '#000',
    flex: 1,
  },
  webView: {
    backgroundColor: '#000',
    flex: 1,
  },
  footerLink: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  footerLinkText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
});
