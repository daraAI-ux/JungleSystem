import React from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import WebView, {type WebViewMessageEvent} from 'react-native-webview';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {tipTapEditorBundle} from '../generated/tiptap-editor-bundle';
import {pickNativeImageFile} from '../services/native-file-picker';

type EditorMessage =
  | {type: 'ready'}
  | {html: string; type: 'change'}
  | {detail?: string; level: 'error' | 'info' | 'warn'; message: string; type: 'debug'}
  | {type: 'pick-image'};

const KolamWebView = WebView as unknown as React.ComponentType<any>;

export function KolamTipTapRichTextEditor({
  editable = true,
  onChangeText,
  onDebugMessage,
  placeholder,
  value,
}: {
  editable?: boolean;
  onChangeText: (value: string) => void;
  onDebugMessage?: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  const webViewRef = React.useRef<WebViewHandle | null>(null);
  const lastNativeValueRef = React.useRef(value);
  const lastWebValueRef = React.useRef(value);
  const sourceRef = React.useRef({
    html: createEditorHtml({
      editable,
      html: value,
      placeholder: placeholder ?? 'Tulis deskripsi...',
    }),
  });
  const [mounted, setMounted] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const [hostVisible, setHostVisible] = React.useState(false);
  const [coverVisible, setCoverVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 140);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  React.useEffect(() => {
    if (!ready) {
      setHostVisible(false);
      setCoverVisible(true);
      return;
    }

    const hostTimer = setTimeout(() => setHostVisible(true), 80);
    const coverTimer = setTimeout(() => setCoverVisible(false), 260);

    return () => {
      clearTimeout(hostTimer);
      clearTimeout(coverTimer);
    };
  }, [ready]);

  React.useEffect(() => {
    if (!ready || value === lastWebValueRef.current) {
      lastNativeValueRef.current = value;
      return;
    }

    lastNativeValueRef.current = value;
    injectEditorCommand(
      webViewRef.current,
      `window.KolamTipTap.setHTML(${toSafeJsString(value)});`,
    );
  }, [ready, value]);

  React.useEffect(() => {
    if (!ready) {
      return;
    }

    injectEditorCommand(
      webViewRef.current,
      `window.KolamTipTap.setEditable(${editable ? 'true' : 'false'});`,
    );
  }, [editable, ready]);

  const handleMessage = async (event: WebViewMessageEvent) => {
    const message = parseEditorMessage(event.nativeEvent.data);
    if (!message) {
      return;
    }

    if (message.type === 'ready') {
      setReady(true);
      injectEditorCommand(
        webViewRef.current,
        `window.KolamTipTap.setHTML(${toSafeJsString(lastNativeValueRef.current)}); window.KolamTipTap.setEditable(${
          editable ? 'true' : 'false'
        });`,
      );
      return;
    }

    if (message.type === 'change') {
      lastWebValueRef.current = message.html;
      onChangeText(message.html);
      return;
    }

    if (message.type === 'debug') {
      onDebugMessage?.(
        `[${message.level}] ${message.message}${
          message.detail ? ` - ${message.detail}` : ''
        }`,
      );
      return;
    }

    if (message.type === 'pick-image') {
      try {
        const picked = await pickNativeImageFile();
        const uri = picked.uri || (picked.path ? `file:///${picked.path}` : '');
        if (picked.cancelled || !uri) {
          return;
        }

        injectEditorCommand(
          webViewRef.current,
          `window.KolamTipTap.insertImage(${toSafeJsString(
            uri,
          )}, ${toSafeJsString(picked.name || 'Gambar')});`,
        );
      } catch {
        injectEditorCommand(
          webViewRef.current,
          'window.KolamTipTap.openImagePrompt();',
        );
      }
    }
  };

  if (!mounted) {
    return <View style={styles.editor} />;
  }

  return (
    <View style={styles.editor}>
      <View style={[styles.webViewHost, !hostVisible && styles.webViewHostPriming]}>
        <KolamWebView
          allowFileAccess
          containerStyle={styles.webViewContainer}
          javaScriptEnabled
          nestedScrollEnabled
          onMessage={handleMessage}
          originWhitelist={['*']}
          ref={webViewRef}
          scrollEnabled={false}
          source={sourceRef.current}
          style={styles.webView}
          useWebView2={Platform.OS === 'windows'}
          webviewDebuggingEnabled
        />
      </View>
      {coverVisible ? (
        <View pointerEvents="none" style={styles.loadingCover} />
      ) : null}
    </View>
  );
}

interface WebViewHandle {
  injectJavaScript: (script: string) => void;
}

function injectEditorCommand(webView: WebViewHandle | null, command: string) {
  webView?.injectJavaScript(`${command}\ntrue;`);
}

function parseEditorMessage(value: string): EditorMessage | null {
  try {
    const parsed = JSON.parse(value) as EditorMessage;
    if (
      parsed.type === 'ready' ||
      parsed.type === 'pick-image' ||
      (parsed.type === 'debug' &&
        typeof parsed.message === 'string' &&
        typeof parsed.level === 'string') ||
      (parsed.type === 'change' && typeof parsed.html === 'string')
    ) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

function toSafeJsString(value: string) {
  return JSON.stringify(value).replace(/<\/script/gi, '<\\/script');
}

function createEditorHtml({
  editable,
  html,
  placeholder,
}: {
  editable: boolean;
  html: string;
  placeholder: string;
}) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="color-scheme" content="light only" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
  />
  <style>
    :root {
      color-scheme: light;
      --bg: ${V.colors.bg};
      --fg: ${V.colors.fg};
      --muted: ${V.colors.mutedFg};
      --border: ${V.colors.border};
      --input: ${V.colors.input};
      --primary: ${V.colors.primary};
      --secondary: ${V.colors.secondary};
      --danger: ${V.colors.danger};
      --radius: 8px;
      font-family: ${V.fontFamily}, Segoe UI, Arial, sans-serif;
    }
    * { box-sizing: border-box; }
    html, body {
      width: 100%;
      min-height: 100%;
      margin: 0;
      background: var(--bg) !important;
      color: var(--fg);
      overflow: hidden;
      font-family: ${V.fontFamily}, Segoe UI, Arial, sans-serif;
      letter-spacing: 0;
    }
    button, select { font-family: inherit; }
    .shell {
      min-height: 386px;
      border: 1px solid var(--input);
      border-radius: var(--radius);
      background: var(--bg);
      overflow: hidden;
    }
    .toolbar {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 8px;
      border-bottom: 1px solid var(--border);
      background: var(--secondary);
    }
    .shell > .toolbar {
      display: none;
    }
    .kolam-toolbar {
      display: flex;
      flex-direction: column;
      border-bottom: 1px solid var(--border);
      background: var(--secondary);
    }
    .toolbar-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px;
    }
    .kolam-toolbar-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px;
      padding: 7px 8px;
    }
    .kolam-toolbar-row + .kolam-toolbar-row {
      border-top: 1px solid var(--border);
    }
    .toolbar-label {
      margin-right: 4px;
      color: var(--muted);
      font: 800 12px/16px ${V.fontFamily}, Segoe UI, Arial, sans-serif;
    }
    .tool {
      min-width: 32px;
      min-height: 30px;
      padding: 0 8px;
      border: 1px solid transparent;
      border-radius: 7px;
      background: transparent;
      color: var(--fg);
      font: 800 12px/16px ${V.fontFamily}, Segoe UI, Arial, sans-serif;
      cursor: pointer;
    }
    .tool.icon {
      min-width: 30px;
      padding: 0 6px;
      font-size: 14px;
    }
    .tool:hover { border-color: var(--primary); color: var(--primary); }
    .tool.active { background: var(--primary); border-color: var(--primary); color: white; }
    .tool.danger:hover { border-color: var(--danger); color: var(--danger); }
    .tool:disabled { opacity: .45; cursor: not-allowed; }
    .tool-select {
      height: 30px;
      max-width: 98px;
      padding: 0 24px 0 8px;
      border: 1px solid var(--border);
      border-radius: 7px;
      background: var(--bg);
      color: var(--fg);
      font: 800 12px/16px ${V.fontFamily}, Segoe UI, Arial, sans-serif;
    }
    .divider { width: 1px; height: 24px; margin: 0 2px; background: var(--border); }
    #editor-root {
      min-height: 310px;
      max-height: 480px;
      overflow-y: auto;
      background: var(--bg);
    }
    .ProseMirror {
      min-height: 310px;
      padding: 14px 16px;
      outline: none;
      color: var(--fg);
      font: 700 13px/22px ${V.fontFamily}, Segoe UI, Arial, sans-serif;
      white-space: normal;
    }
    .ProseMirror p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      float: left;
      height: 0;
      color: var(--muted);
      pointer-events: none;
      font-weight: 700;
    }
    .ProseMirror h1 { margin: 16px 0 8px; font-size: 24px; line-height: 30px; }
    .ProseMirror h2 { margin: 14px 0 8px; font-size: 20px; line-height: 26px; }
    .ProseMirror h3 { margin: 12px 0 6px; font-size: 17px; line-height: 24px; }
    .ProseMirror p { margin: 10px 0; }
    .ProseMirror ul, .ProseMirror ol { margin: 10px 0 10px 24px; padding: 0; }
    .ProseMirror li { margin: 4px 0; }
    .ProseMirror blockquote {
      margin: 12px 0;
      padding-left: 12px;
      border-left: 4px solid var(--border);
      color: var(--muted);
      font-style: italic;
    }
    .ProseMirror a { color: var(--primary); text-decoration: underline; }
    .ProseMirror code {
      padding: 2px 5px;
      border-radius: 5px;
      background: var(--secondary);
      font-family: Consolas, monospace;
      font-weight: 700;
    }
    .ProseMirror pre {
      padding: 12px;
      border-radius: 7px;
      background: #111827;
      color: white;
      overflow-x: auto;
    }
    .ProseMirror img {
      display: inline-block;
      max-width: 100%;
      height: auto;
      margin: 8px 0;
      border-radius: 6px;
    }
    .ProseMirror table {
      width: 100%;
      margin: 12px 0;
      border-collapse: collapse;
      table-layout: fixed;
    }
    .ProseMirror td, .ProseMirror th {
      min-width: 80px;
      padding: 8px;
      border: 1px solid var(--border);
      vertical-align: top;
    }
    .ProseMirror th { background: var(--secondary); }
    .ProseMirror hr {
      margin: 16px 0;
      border: 0;
      border-top: 1px solid var(--border);
    }
    .ProseMirror ul[data-type="taskList"] {
      list-style: none;
      margin-left: 0;
    }
    .ProseMirror ul[data-type="taskList"] li {
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }
    .ProseMirror .drop-cap::first-letter {
      float: left;
      margin: 4px 8px 0 0;
      color: var(--primary);
      font-size: 42px;
      line-height: 34px;
      font-weight: 900;
    }
  </style>
</head>
<body>
  <script>
    (function () {
      function post(level, message, detail) {
        var payload = JSON.stringify({
          type: 'debug',
          level: level,
          message: String(message || ''),
          detail: detail ? String(detail) : ''
        });
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(payload);
          return;
        }
        if (window.chrome && window.chrome.webview && window.chrome.webview.postMessage) {
          window.chrome.webview.postMessage(payload);
        }
      }
      ['log', 'warn', 'error'].forEach(function (level) {
        var original = console[level];
        console[level] = function () {
          post(level === 'log' ? 'info' : level, Array.prototype.join.call(arguments, ' '));
          if (original) {
            original.apply(console, arguments);
          }
        };
      });
      window.onerror = function (message, source, line, column, error) {
        post('error', message, (source || '') + ':' + (line || 0) + ':' + (column || 0) + ' ' + (error && error.stack ? error.stack : ''));
      };
      window.onunhandledrejection = function (event) {
        var reason = event && event.reason;
        post('error', 'Unhandled promise rejection', reason && reason.stack ? reason.stack : reason);
      };
      post('info', 'TipTap HTML loaded');
    })();
  </script>
  <div class="shell">
    <div class="toolbar" aria-label="Toolbar rich text">
      <div class="toolbar-row">
        <button class="tool" data-action="bold" title="Tebal">B</button>
        <button class="tool" data-action="italic" title="Miring"><i>I</i></button>
        <button class="tool" data-action="underline" title="Garis bawah"><u>U</u></button>
        <button class="tool" data-action="strike" title="Coret">S</button>
        <span class="divider"></span>
        <button class="tool" data-action="paragraph" title="Paragraf">P</button>
        <button class="tool" data-action="h1" title="Heading 1">H1</button>
        <button class="tool" data-action="h2" title="Heading 2">H2</button>
        <button class="tool" data-action="h3" title="Heading 3">H3</button>
        <span class="divider"></span>
        <button class="tool" data-action="bullet-list" title="Daftar bullet">•</button>
        <button class="tool" data-action="ordered-list" title="Daftar angka">1.</button>
        <button class="tool" data-action="task-list" title="Daftar tugas">☑</button>
        <button class="tool" data-action="blockquote" title="Kutipan">66</button>
        <button class="tool" data-action="code-block" title="Blok kode">{ }</button>
        <button class="tool" data-action="horizontal-rule" title="Garis">--</button>
        <span class="divider"></span>
        <button class="tool icon" data-action="link" title="Tambah link">🔗</button>
        <button class="tool icon" data-action="image" title="Tambah gambar">▧</button>
      </div>
      <div class="toolbar-row">
        <button class="tool" data-action="align-left" title="Rata kiri">⇤</button>
        <button class="tool" data-action="align-center" title="Rata tengah">≡</button>
        <button class="tool" data-action="align-right" title="Rata kanan">⇥</button>
        <button class="tool" data-action="align-justify" title="Rata penuh">☰</button>
        <span class="divider"></span>
        <button class="tool" data-action="table" title="Tambah tabel">Tabel</button>
        <button class="tool" data-action="add-row-after" title="Tambah baris">+ Baris</button>
        <button class="tool" data-action="add-column-after" title="Tambah kolom">+ Kolom</button>
        <button class="tool" data-action="delete-row" title="Hapus baris">- Baris</button>
        <button class="tool" data-action="delete-column" title="Hapus kolom">- Kolom</button>
        <button class="tool danger" data-action="delete-table" title="Hapus tabel">Hapus tabel</button>
        <span class="divider"></span>
        <button class="tool" data-action="highlight" data-value="#dcfce7" title="Stabilo hijau">Stabilo</button>
        <button class="tool" data-action="color" data-value="#15803d" title="Teks hijau">Hijau</button>
        <button class="tool" data-action="clear" title="Hapus format">Bersih</button>
        <button class="tool" data-action="undo" title="Undo">↶</button>
        <button class="tool" data-action="redo" title="Redo">↷</button>
      </div>
    </div>
    <div class="kolam-toolbar" aria-label="Toolbar rich text Kolam">
      <div class="kolam-toolbar-row">
        <button class="tool" data-action="bold" title="Tebal">B</button>
        <button class="tool" data-action="italic" title="Miring"><i>I</i></button>
        <button class="tool" data-action="underline" title="Garis bawah"><u>U</u></button>
        <span class="divider"></span>
        <button class="tool icon" data-action="emoji" data-value="&#128512;" title="Sisip senyum">&#128512;</button>
        <button class="tool icon" data-action="emoji" data-value="&#128077;" title="Sisip setuju">&#128077;</button>
        <button class="tool icon" data-action="emoji" data-value="&#128591;" title="Sisip terima kasih">&#128591;</button>
        <button class="tool icon" data-action="emoji" data-value="&#9989;" title="Sisip selesai">&#9989;</button>
        <button class="tool icon" data-action="emoji" data-value="&#10060;" title="Sisip batal">&#10060;</button>
        <button class="tool icon" data-action="emoji" data-value="&#128247;" title="Sisip kamera">&#128247;</button>
        <button class="tool icon" data-action="emoji" data-value="&#127881;" title="Sisip perayaan">&#127881;</button>
        <button class="tool icon" data-action="emoji" data-value="&#128176;" title="Sisip harga">&#128176;</button>
        <button class="tool icon" data-action="emoji" data-value="&#128230;" title="Sisip paket">&#128230;</button>
        <button class="tool icon" data-action="emoji" data-value="&#128056;" title="Sisip produk">&#128056;</button>
        <button class="tool icon" data-action="emoji" data-value="&#127807;" title="Sisip daun">&#127807;</button>
        <span class="divider"></span>
        <button class="tool" data-action="h1" title="Heading 1">H1</button>
        <button class="tool" data-action="h2" title="Heading 2">H2</button>
        <button class="tool" data-action="h3" title="Heading 3">H3</button>
        <span class="divider"></span>
        <button class="tool" data-action="bullet-list" title="Daftar bullet">&bull;</button>
        <button class="tool" data-action="ordered-list" title="Daftar angka">1.</button>
        <span class="divider"></span>
        <button class="tool" data-action="columns" data-value="2" title="Layout 2 kolom">2 Kolom</button>
        <button class="tool" data-action="columns" data-value="1" title="Kembali ke 1 kolom">1 Kolom</button>
        <button class="tool" data-action="table" title="Tambah tabel">Tabel</button>
        <span class="divider"></span>
        <button class="tool" data-action="blockquote" title="Kutipan">66</button>
        <button class="tool" data-action="horizontal-rule" title="Garis">--</button>
        <span class="divider"></span>
        <button class="tool icon" data-action="link" title="Tambah link">&#128279;</button>
        <button class="tool icon" data-action="image" title="Tambah gambar">&#9639;</button>
      </div>
      <div class="kolam-toolbar-row">
        <span class="toolbar-label">Paragraf:</span>
        <button class="tool" data-action="align-left" title="Rata kiri">&#8676;</button>
        <button class="tool" data-action="align-center" title="Rata tengah">&#8801;</button>
        <button class="tool" data-action="align-right" title="Rata kanan">&#8677;</button>
        <button class="tool" data-action="align-justify" title="Rata penuh">&#9776;</button>
        <span class="divider"></span>
        <select class="tool-select" data-select-action="line-height" title="Jarak baris">
          <option value="">LH --</option>
          <option value="1.2">LH 1.2</option>
          <option value="1.5">LH 1.5</option>
          <option value="1.8">LH 1.8</option>
          <option value="2">LH 2</option>
        </select>
        <select class="tool-select" data-select-action="spacing-before" title="Spasi sebelum">
          <option value="">Sp sebelum --</option>
          <option value="0">0</option>
          <option value="8">8</option>
          <option value="16">16</option>
          <option value="24">24</option>
        </select>
        <select class="tool-select" data-select-action="spacing-after" title="Spasi sesudah">
          <option value="">Sp sesudah --</option>
          <option value="0">0</option>
          <option value="8">8</option>
          <option value="16">16</option>
          <option value="24">24</option>
        </select>
        <span class="divider"></span>
        <button class="tool" data-action="indent" title="Tambah indent">-&gt;|</button>
        <button class="tool" data-action="outdent" title="Kurangi indent">|&lt;-</button>
        <button class="tool" data-action="first-line" title="First line indent">1st</button>
        <button class="tool" data-action="hanging" title="Hanging indent">Hang</button>
        <span class="divider"></span>
        <button class="tool" data-action="direction" data-value="ltr" title="Kiri ke kanan">LTR</button>
        <button class="tool" data-action="direction" data-value="rtl" title="Kanan ke kiri">RTL</button>
        <span class="divider"></span>
        <button class="tool" data-action="columns" data-value="1" title="Satu kolom">1&#9638;</button>
        <button class="tool" data-action="columns" data-value="2" title="Dua kolom">2&#9638;</button>
        <button class="tool" data-action="columns" data-value="3" title="Tiga kolom">3&#9638;</button>
        <span class="divider"></span>
        <button class="tool" data-action="drop-cap" title="Drop cap">Drop</button>
      </div>
      <div class="kolam-toolbar-row">
        <span class="toolbar-label">Tabel:</span>
        <button class="tool" data-action="add-row-after" title="Tambah baris">+ Baris</button>
        <button class="tool" data-action="add-column-after" title="Tambah kolom">+ Kolom</button>
        <button class="tool" data-action="delete-row" title="Hapus baris">- Baris</button>
        <button class="tool" data-action="delete-column" title="Hapus kolom">- Kolom</button>
        <button class="tool danger" data-action="delete-table" title="Hapus tabel">Hapus tabel</button>
        <span class="divider"></span>
        <button class="tool" data-action="clear" title="Hapus format">Bersih</button>
        <button class="tool" data-action="undo" title="Undo">&#8630;</button>
        <button class="tool" data-action="redo" title="Redo">&#8631;</button>
      </div>
    </div>
    <div id="editor-root"></div>
  </div>
  <script>${tipTapEditorBundle}</script>
  <script>
    window.KolamTipTapBootstrap({
      editable: ${editable ? 'true' : 'false'},
      html: ${toSafeJsString(html)},
      placeholder: ${toSafeJsString(placeholder)}
    });
  </script>
</body>
</html>`;
}

const styles = StyleSheet.create({
  editor: {
    minHeight: 388,
    overflow: 'hidden',
    borderRadius: V.radius.lg,
    backgroundColor: V.colors.bg,
  },
  webViewContainer: {
    backgroundColor: V.colors.bg,
  },
  webViewHost: {
    minHeight: 388,
    overflow: 'hidden',
    backgroundColor: V.colors.bg,
  },
  webViewHostPriming: {
    position: 'absolute',
    top: -14000,
    left: -14000,
    width: 720,
    height: 388,
  },
  webView: {
    minHeight: 388,
    backgroundColor: V.colors.bg,
  },
  loadingCover: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: V.colors.bg,
  },
});
