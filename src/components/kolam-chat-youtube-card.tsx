import React, {useEffect, useState} from 'react';
import {Linking, Platform, StyleSheet, Text, View} from 'react-native';
import WebView from 'react-native-webview';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {KolamChatYoutubePayload} from '../domain/kolam-chat-youtube';
import {KolamPressable} from './kolam-pressable';
import {KolamRemoteImage} from './kolam-remote-image';

const KolamWebView = WebView as unknown as React.ComponentType<any>;

/**
 * YouTube requires a valid HTTP Referer for embeds (Error 153).
 * react-native-webview on Windows WebView2 navigates with Source(uri) only —
 * JS `headers` / HTML `baseUrl` are ignored — so in-app embed fails for all videos.
 * Windows: open system browser. Other platforms: WebView + Referer header.
 */
const YOUTUBE_EMBED_REFERER = 'https://dunia-anura.com/';

let activePlayKey: string | null = null;
const playListeners = new Set<() => void>();

function setActiveYoutubePlayKey(next: string | null) {
  activePlayKey = next;
  playListeners.forEach(listener => listener());
}

function buildYoutubeEmbedUri(videoId: string) {
  const safeId = encodeURIComponent(videoId);
  return `https://www.youtube.com/embed/${safeId}?rel=0&playsinline=1&autoplay=1&modestbranding=1`;
}

function openExternalYoutube(url: string) {
  Linking.openURL(url).catch(() => undefined);
}

/**
 * SoT FE `YoutubeEmbed` card chrome — Windows plays via external browser
 * until native WebView2 can inject Referer.
 */
export function KolamChatYoutubeCard({
  playKey,
  youtube,
}: {
  playKey: string;
  youtube: KolamChatYoutubePayload;
}) {
  const [playing, setPlaying] = useState(false);
  const thumbnailUri = youtube.videoId
    ? `https://i.ytimg.com/vi/${youtube.videoId}/hqdefault.jpg`
    : null;
  const watchUrl =
    youtube.url?.trim() ||
    `https://www.youtube.com/watch?v=${youtube.videoId}`;
  const embedUri = buildYoutubeEmbedUri(youtube.videoId);
  const useInAppWebView = Platform.OS !== 'windows';

  useEffect(() => {
    const sync = () => {
      if (activePlayKey !== playKey) {
        setPlaying(false);
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

  const startPlayback = () => {
    if (!useInAppWebView) {
      openExternalYoutube(watchUrl);
      return;
    }
    setActiveYoutubePlayKey(playKey);
    setPlaying(true);
  };

  if (playing && useInAppWebView) {
    return (
      <View style={styles.card}>
        <View style={styles.playerFrame}>
          <KolamWebView
            allowsFullscreenVideo
            containerStyle={styles.webViewContainer}
            javaScriptEnabled
            mediaPlaybackRequiresUserAction={false}
            originWhitelist={['https://*', 'http://*']}
            source={{
              headers: {
                Referer: YOUTUBE_EMBED_REFERER,
              },
              uri: embedUri,
            }}
            style={styles.webView}
          />
        </View>
        <KolamPressable
          accessibilityLabel="Buka di YouTube"
          onPress={() => openExternalYoutube(watchUrl)}
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
        accessibilityLabel={
          useInAppWebView ? 'Putar YouTube' : 'Putar di browser'
        }
        onPress={startPlayback}
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
        onPress={() => openExternalYoutube(watchUrl)}
        style={styles.footerLink}
      >
        <Text numberOfLines={1} style={styles.footerLinkText}>
          {useInAppWebView
            ? youtube.title || 'Buka di YouTube'
            : youtube.title || 'Putar di browser'}
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
    backgroundColor: '#111',
    overflow: 'hidden',
    width: '100%',
  },
  webViewContainer: {
    backgroundColor: '#111',
    flex: 1,
  },
  webView: {
    backgroundColor: '#111',
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
