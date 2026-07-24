import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import WebView, { type WebViewMessageEvent } from 'react-native-webview';
import { kolamVisualTokens as V } from '../domain/kolam-visual';

const KolamWebView = WebView as unknown as React.ComponentType<any>;
const MIN_HTML_CONTENT_HEIGHT = 44;
const MAX_HTML_CONTENT_HEIGHT = 5000;
const HTML_MEASURE_TIMEOUT_MS = 1800;

export function KolamHtmlContent({
  html,
  style,
}: {
  html: string | null | undefined;
  style?: StyleProp<ViewStyle>;
}) {
  const safeHtml = html?.trim() ?? '';
  const fallbackHeight = React.useMemo(
    () => estimateHtmlContentHeight(safeHtml),
    [safeHtml],
  );
  const [height, setHeight] = React.useState(fallbackHeight);
  const [measureTimedOut, setMeasureTimedOut] = React.useState(false);
  const lastHeightRef = React.useRef(fallbackHeight);
  const measuredRef = React.useRef(false);
  const source = React.useMemo(() => createHtmlDocument(safeHtml), [safeHtml]);

  React.useEffect(() => {
    measuredRef.current = false;
    lastHeightRef.current = fallbackHeight;
    setMeasureTimedOut(false);
    setHeight(fallbackHeight);

    const timeout = setTimeout(() => {
      if (!measuredRef.current) {
        setMeasureTimedOut(true);
      }
    }, HTML_MEASURE_TIMEOUT_MS);

    return () => clearTimeout(timeout);
  }, [fallbackHeight, source]);

  if (!safeHtml) {
    return null;
  }

  if (measureTimedOut) {
    return (
      <Text style={[styles.fallbackText, style as StyleProp<TextStyle>]}> 
        {stripHtmlToText(safeHtml)}
      </Text>
    );
  }

  return (
    <KolamWebView
      containerStyle={[styles.container, { height }, style]}
      javaScriptEnabled
      onError={() => setMeasureTimedOut(true)}
      onMessage={(event: WebViewMessageEvent) => {
        const nextHeight = Number(event.nativeEvent.data);
        if (Number.isFinite(nextHeight) && nextHeight > 0) {
          measuredRef.current = true;
          setMeasureTimedOut(false);
          const measuredHeight = Math.min(
            MAX_HTML_CONTENT_HEIGHT,
            Math.max(MIN_HTML_CONTENT_HEIGHT, Math.ceil(nextHeight)),
          );
          if (Math.abs(measuredHeight - lastHeightRef.current) >= 4) {
            lastHeightRef.current = measuredHeight;
            setHeight(measuredHeight);
          }
        }
      }}
      originWhitelist={['*']}
      scrollEnabled={false}
      source={{ html: source }}
      style={styles.webView}
      useWebView2={Platform.OS === 'windows'}
    />
  );
}

export function containsHtmlMarkup(value: string | null | undefined) {
  return /<\/?[a-z][\s\S]*>/i.test(value ?? '');
}

function estimateHtmlContentHeight(html: string) {
  const textLength = stripHtmlToText(html).length;
  const blockCount = Math.max(
    1,
    (html.match(/<(p|div|section|li|tr|h[1-6]|blockquote)\b/gi) ?? []).length,
  );
  const imageCount = (html.match(/<img\b/gi) ?? []).length;
  const estimatedLines = Math.ceil(textLength / 92);
  const estimated = 24 + estimatedLines * 22 + blockCount * 10 + imageCount * 180;
  return Math.min(
    MAX_HTML_CONTENT_HEIGHT,
    Math.max(MIN_HTML_CONTENT_HEIGHT, estimated),
  );
}

function stripHtmlToText(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/p>|<\/div>|<\/section>|<\/li>|<\/tr>|<\/h[1-6]>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .trim();
}

function createHtmlDocument(html: string) {
  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    html,
    body {
      background: #ffffff;
      margin: 0;
      overflow: hidden;
      padding: 0;
      width: 100%;
    }
    body {
      color: #111827;
      font-family: ${JSON.stringify(V.fontFamily)}, Arial, sans-serif;
      font-size: 13px;
      font-weight: 700;
      line-height: 1.55;
      overflow-wrap: anywhere;
    }
    p { margin: 0 0 10px; }
    p:last-child { margin-bottom: 0; }
    strong, b { font-weight: 900; }
    em, i { font-style: italic; }
    ul, ol { margin: 0 0 10px 20px; padding: 0; }
    li { margin: 0 0 6px; }
    a { color: #047857; font-weight: 900; text-decoration: underline; }
    blockquote {
      border-left: 3px solid #10b981;
      margin: 8px 0;
      padding: 6px 10px;
      background: #f0fdf4;
    }
    table { border-collapse: collapse; margin: 8px 0; width: 100%; }
    td, th { border: 1px solid #d1d5db; padding: 6px; text-align: left; }
    img { height: auto; max-width: 100%; }
    .locale-field-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 100%;
    }
    .locale-field-card {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-sizing: border-box;
      padding: 12px;
      width: 100%;
    }
    .locale-field-label {
      color: #64748b;
      font-size: 12px;
      font-weight: 900;
      line-height: 16px;
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    .locale-field-body { color: #111827; }
    .locale-empty { color: #64748b; font-weight: 800; }
  </style>
</head>
<body>
  ${html}
  <script>
    let lastPostedHeight = 0;
    let pendingFrame = 0;
    const measureHeight = () => Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight
    );
    const postHeight = () => {
      pendingFrame = 0;
      const height = Math.ceil(measureHeight() + 2);
      if (Math.abs(height - lastPostedHeight) < 4) {
        return;
      }
      lastPostedHeight = height;
      window.ReactNativeWebView?.postMessage(String(height));
    };
    const queueHeight = () => {
      if (pendingFrame) {
        return;
      }
      pendingFrame = window.requestAnimationFrame(postHeight);
    };
    window.addEventListener('load', queueHeight);
    window.addEventListener('DOMContentLoaded', queueHeight);
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(queueHeight).observe(document.body);
    }
    setTimeout(queueHeight, 0);
    setTimeout(queueHeight, 100);
    setTimeout(queueHeight, 350);
    setTimeout(queueHeight, 900);
  </script>
</body>
</html>`;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    width: '100%',
  },
  webView: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  fallbackText: {
    backgroundColor: '#ffffff',
    color: '#111827',
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
    width: '100%',
  },
});
