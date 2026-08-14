import React, {useEffect, useMemo, useState} from 'react';
import {
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
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
  // autoplay=1: user already tapped our play control (native gesture).
  return `https://www.youtube.com/embed/${safeId}?rel=0&playsinline=1&autoplay=1&modestbranding=1`;
}

/**
 * HTML shell with referrer policy (Error 153) + autoplay after thumbnail tap.
 * baseUrl must be https://www.youtube.com/ so Referer is valid.
 */
function createYoutubeEmbedHtml(videoId: string, title?: string) {
  const safeId = encodeURIComponent(videoId);
  const safeTitle = escapeHtml(title || 'YouTube video');
  const src = `https://www.youtube.com/embed/${safeId}?rel=0&playsinline=1&autoplay=1&modestbranding=1`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/><meta name="referrer" content="strict-origin-when-cross-origin"/><style>html,body{margin:0;padding:0;width:100%;height:100%;background:#111;overflow:hidden}iframe{border:0;position:absolute;inset:0;width:100%;height:100%}</style></head><body><iframe src="${src}" title="${safeTitle}" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe></body></html>`;
}

const TRY_PLAY_JS = `
(function () {
  function clickPlay() {
    var selectors = [
      '.ytp-large-play-button',
      'button.ytp-play-button',
      'button[aria-label*="Play"]',
      'button[aria-label*="Putar"]',
      '.ytp-cued-thumbnail-overlay'
    ];
    for (var i = 0; i < selectors.length; i++) {
      var el = document.querySelector(selectors[i]);
      if (el) {
        el.click();
        break;
      }
    }
    var video = document.querySelector('video');
    if (video) {
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    }
  }
  clickPlay();
  setTimeout(clickPlay, 600);
  setTimeout(clickPlay, 1600);
  true;
})();
`;

/**
 * SoT FE `YoutubeEmbed` — thumbnail until play (exclusive WebView2 on Windows).
 */
export function KolamChatYoutubeCard({
  playKey,
  youtube,
}: {
  playKey: string;
  youtube: KolamChatYoutubePayload;
}) {
  const [playing, setPlaying] = useState(false);
  const [useHtmlShell, setUseHtmlShell] = useState(false);
  const [frameSize, setFrameSize] = useState({width: 288, height: 162});
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
  const htmlShell = useMemo(
    () => createYoutubeEmbedHtml(youtube.videoId, youtube.title),
    [youtube.title, youtube.videoId],
  );

  useEffect(() => {
    const sync = () => {
      if (activePlayKey !== playKey) {
        setPlaying(false);
        setUseHtmlShell(false);
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

  const onFrameLayout = (event: LayoutChangeEvent) => {
    const {width, height} = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setFrameSize({width, height});
    }
  };

  if (playing) {
    return (
      <View style={styles.card}>
        <View onLayout={onFrameLayout} style={styles.playerFrame}>
          <KolamWebView
            allowsFullscreenVideo
            containerStyle={[
              styles.webViewContainer,
              {height: frameSize.height, width: frameSize.width},
            ]}
            injectedJavaScript={TRY_PLAY_JS}
            javaScriptEnabled
            mediaPlaybackRequiresUserAction={false}
            onError={() => {
              if (!useHtmlShell) {
                setUseHtmlShell(true);
              }
            }}
            onHttpError={() => {
              if (!useHtmlShell) {
                setUseHtmlShell(true);
              }
            }}
            onLoadEnd={() => {
              // Second nudge after document load (Windows WebView2).
            }}
            originWhitelist={['https://*', 'http://*']}
            source={
              useHtmlShell
                ? {
                    html: htmlShell,
                    baseUrl: 'https://www.youtube.com/',
                  }
                : {uri: embedUri}
            }
            style={{
              backgroundColor: '#111',
              height: frameSize.height,
              width: frameSize.width,
            }}
            useWebView2={Platform.OS === 'windows'}
          />
        </View>
        <View style={styles.footerRow}>
          <KolamPressable
            accessibilityLabel="Buka di YouTube"
            onPress={openWatchUrl}
            style={styles.footerLink}
          >
            <Text numberOfLines={1} style={styles.footerLinkText}>
              {youtube.title || 'Buka di YouTube'}
            </Text>
          </KolamPressable>
          {!useHtmlShell ? (
            <KolamPressable
              accessibilityLabel="Coba mode embed alternatif"
              onPress={() => setUseHtmlShell(true)}
              style={styles.footerLink}
            >
              <Text style={styles.footerAltText}>Retry</Text>
            </KolamPressable>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <KolamPressable
        accessibilityLabel="Putar YouTube"
        onPress={() => {
          setUseHtmlShell(false);
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
    backgroundColor: '#111',
    overflow: 'hidden',
    width: '100%',
  },
  webViewContainer: {
    backgroundColor: '#111',
  },
  footerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerLink: {
    flexShrink: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  footerLinkText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  footerAltText: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '600',
  },
});
