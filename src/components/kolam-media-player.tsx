import React from 'react';
import {
  Platform,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import WebView from 'react-native-webview';

const KolamWebView = WebView as unknown as React.ComponentType<any>;

export function KolamMediaPlayer({
  autoPlay = false,
  kind,
  style,
  title,
  uri,
}: {
  autoPlay?: boolean;
  kind: 'audio' | 'video';
  style?: StyleProp<ViewStyle>;
  title: string;
  uri: string | null | undefined;
}) {
  const sourceUri = normalizeMediaUrl(uri ?? '');
  const documentBaseUrl = React.useMemo(
    () => resolveMediaDocumentBaseUrl(sourceUri),
    [sourceUri],
  );
  const html = React.useMemo(
    () => createMediaPlayerHtml({ autoPlay, kind, title, uri: sourceUri }),
    [autoPlay, kind, sourceUri, title],
  );

  if (!sourceUri) {
    return null;
  }

  return (
    <KolamWebView
      allowsFullscreenVideo
      containerStyle={[styles.container, style]}
      javaScriptEnabled
      mediaPlaybackRequiresUserAction={false}
      originWhitelist={['*']}
      source={{ html, baseUrl: documentBaseUrl }}
      style={[styles.webView, style]}
      useWebView2={Platform.OS === 'windows'}
    />
  );
}

function createMediaPlayerHtml({
  autoPlay,
  kind,
  title,
  uri,
}: {
  autoPlay: boolean;
  kind: 'audio' | 'video';
  title: string;
  uri: string;
}) {
  const safeTitle = escapeHtml(title);
  const safeUri = escapeHtml(uri);

  return kind === 'video'
    ? createVideoPlayerHtml({ autoPlay, safeTitle, safeUri })
    : createAudioPlayerHtml({ autoPlay, safeTitle, safeUri });
}

function createVideoPlayerHtml({
  autoPlay,
  safeTitle,
  safeUri,
}: {
  autoPlay: boolean;
  safeTitle: string;
  safeUri: string;
}) {
  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    html, body { background: #f8fafc; height: 100%; margin: 0; overflow: hidden; width: 100%; }
    video { background: #f8fafc; border: 0; display: block; height: 100%; object-fit: contain; outline: 0; width: 100%; }
  </style>
</head>
<body>
  <video ${
    autoPlay ? 'autoplay' : ''
  } controls playsinline preload="metadata" title="${safeTitle}" src="${safeUri}"></video>
</body>
</html>`;
}

function createAudioPlayerHtml({
  autoPlay,
  safeTitle,
  safeUri,
}: {
  autoPlay: boolean;
  safeTitle: string;
  safeUri: string;
}) {
  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    html, body {
      background: #f8fafc;
      height: 100%;
      margin: 0;
      overflow: hidden;
      width: 100%;
    }
    body {
      align-items: center;
      color: #475569;
      display: flex;
      font-family: Arial, sans-serif;
      justify-content: center;
    }
    .player {
      align-items: center;
      background: #f8fafc;
      box-sizing: border-box;
      display: grid;
      gap: 10px;
      grid-template-columns: 34px 48px 1fr 34px;
      height: 48px;
      padding: 0;
      width: 100%;
    }
    button {
      align-items: center;
      background: #e5e7eb;
      border: 0;
      border-radius: 999px;
      color: #475569;
      cursor: pointer;
      display: flex;
      font-size: 14px;
      font-weight: 900;
      height: 30px;
      justify-content: center;
      line-height: 30px;
      padding: 0;
      width: 30px;
    }
    .time {
      color: #475569;
      font-size: 12px;
      font-weight: 800;
      white-space: nowrap;
    }
    input[type='range'] {
      accent-color: #cbd5e1;
      width: 100%;
    }
  </style>
</head>
<body>
  <audio id="audio" preload="metadata" title="${safeTitle}"><source src="${safeUri}"></audio>
  <div class="player">
    <button id="play" aria-label="Putar">▶</button>
    <span id="time" class="time">0:00</span>
    <input id="seek" type="range" min="0" max="1000" value="0" />
    <button id="mute" aria-label="Suara">🔊</button>
  </div>
  <script>
    const audio = document.getElementById('audio');
    const play = document.getElementById('play');
    const mute = document.getElementById('mute');
    const seek = document.getElementById('seek');
    const time = document.getElementById('time');
    const format = value => {
      if (!Number.isFinite(value)) return '0:00';
      const minutes = Math.floor(value / 60);
      const seconds = Math.floor(value % 60).toString().padStart(2, '0');
      return minutes + ':' + seconds;
    };
    const update = () => {
      const duration = audio.duration || 0;
      seek.value = duration ? String(Math.round((audio.currentTime / duration) * 1000)) : '0';
      time.textContent = format(audio.currentTime);
      play.textContent = audio.paused ? '▶' : 'Ⅱ';
      mute.textContent = audio.muted ? '🔇' : '🔊';
    };
    play.addEventListener('click', () => audio.paused ? audio.play() : audio.pause());
    mute.addEventListener('click', () => { audio.muted = !audio.muted; update(); });
    seek.addEventListener('input', () => {
      if (audio.duration) audio.currentTime = (Number(seek.value) / 1000) * audio.duration;
    });
    audio.addEventListener('loadedmetadata', update);
    audio.addEventListener('timeupdate', update);
    audio.addEventListener('play', update);
    audio.addEventListener('pause', update);
    if (${autoPlay ? 'true' : 'false'}) {
      const start = () => audio.play().catch(() => {});
      audio.addEventListener('canplay', start, { once: true });
      setTimeout(start, 50);
    }
    update();
  </script>
</body>
</html>`;
}

function normalizeMediaUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  if (/^(https?:|file:|ms-appx:|ms-appdata:|data:)/i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

/** WebView2 HTML docs need a real https base so remote media can load. */
function resolveMediaDocumentBaseUrl(uri: string) {
  const match = uri.match(/^(https?:\/\/[^/?#]+)/i);
  if (match) {
    return `${match[1]}/`;
  }
  if (/^file:/i.test(uri) || /^ms-app/i.test(uri)) {
    return uri;
  }
  return 'https://localhost/';
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
    borderColor: '#f8fafc',
    borderWidth: 0,
    overflow: 'hidden',
  },
  webView: {
    backgroundColor: '#f8fafc',
    flex: 1,
  },
});
