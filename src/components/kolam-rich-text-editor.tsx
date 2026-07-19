import React from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import WebView, {type WebViewMessageEvent} from 'react-native-webview';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {pickNativeImageFile} from '../services/native-file-picker';

type EditorMessage =
  | {type: 'ready'}
  | {html: string; type: 'change'}
  | {type: 'pick-image'};

const KolamWebView = WebView as unknown as React.ComponentType<any>;

export function KolamRichTextEditor({
  editable = true,
  onChangeText,
  placeholder,
  value,
}: {
  editable?: boolean;
  onChangeText: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  const webViewRef = React.useRef<WebViewHandle | null>(null);
  const lastNativeValueRef = React.useRef(value);
  const lastWebValueRef = React.useRef(value);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (!ready || value === lastWebValueRef.current) {
      lastNativeValueRef.current = value;
      return;
    }

    lastNativeValueRef.current = value;
    injectEditorCommand(
      webViewRef.current,
      `window.KolamEditor.setHTML(${toSafeJsString(value)});`,
    );
  }, [ready, value]);

  React.useEffect(() => {
    if (!ready) {
      return;
    }

    injectEditorCommand(
      webViewRef.current,
      `window.KolamEditor.setEditable(${editable ? 'true' : 'false'});`,
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
        `window.KolamEditor.setHTML(${toSafeJsString(lastNativeValueRef.current)}); window.KolamEditor.setEditable(${
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

    if (message.type === 'pick-image') {
      try {
        const picked = await pickNativeImageFile();
        const uri = picked.uri || (picked.path ? `file:///${picked.path}` : '');
        if (picked.cancelled || !uri) {
          return;
        }

        injectEditorCommand(
          webViewRef.current,
          `window.KolamEditor.insertImage(${toSafeJsString(
            uri,
          )}, ${toSafeJsString(picked.name || 'Gambar')});`,
        );
      } catch {
        injectEditorCommand(
          webViewRef.current,
          "window.KolamEditor.openImagePrompt();",
        );
      }
    }
  };

  return (
    <View style={styles.editor}>
      <KolamWebView
        allowFileAccess
        javaScriptEnabled
        nestedScrollEnabled
        onMessage={handleMessage}
        originWhitelist={['*']}
        ref={webViewRef}
        scrollEnabled={false}
        source={{
          html: createEditorHtml({
            editable,
            html: value,
            placeholder: placeholder ?? 'Tulis deskripsi...',
          }),
        }}
        style={styles.webView}
        useWebView2={Platform.OS === 'windows'}
      />
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
      background: var(--bg);
      color: var(--fg);
      overflow: hidden;
      font-family: ${V.fontFamily}, Segoe UI, Arial, sans-serif;
      letter-spacing: 0;
    }
    .shell {
      min-height: 318px;
      border: 1px solid var(--input);
      border-radius: var(--radius);
      background: var(--bg);
      overflow: hidden;
    }
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px;
      min-height: 48px;
      padding: 8px;
      border-bottom: 1px solid var(--border);
      background: var(--secondary);
    }
    .tool {
      min-width: 32px;
      min-height: 30px;
      padding: 0 8px;
      border: 1px solid var(--border);
      border-radius: 7px;
      background: var(--bg);
      color: var(--fg);
      font: 800 12px/16px ${V.fontFamily}, Segoe UI, Arial, sans-serif;
      cursor: pointer;
    }
    .tool:hover { border-color: var(--primary); color: var(--primary); }
    .tool.active { background: var(--primary); border-color: var(--primary); color: white; }
    .tool:disabled { opacity: .45; cursor: not-allowed; }
    .divider { width: 1px; height: 24px; margin: 0 2px; background: var(--border); }
    .editor {
      min-height: 260px;
      max-height: 420px;
      overflow-y: auto;
      padding: 14px 16px;
      outline: none;
      color: var(--fg);
      font: 700 13px/22px ${V.fontFamily}, Segoe UI, Arial, sans-serif;
      white-space: normal;
    }
    .editor:empty:before {
      content: attr(data-placeholder);
      color: var(--muted);
      pointer-events: none;
      font-weight: 700;
    }
    .editor h1 { margin: 16px 0 8px; font-size: 24px; line-height: 30px; }
    .editor h2 { margin: 14px 0 8px; font-size: 20px; line-height: 26px; }
    .editor h3 { margin: 12px 0 6px; font-size: 17px; line-height: 24px; }
    .editor p { margin: 10px 0; }
    .editor ul, .editor ol { margin: 10px 0 10px 24px; padding: 0; }
    .editor li { margin: 4px 0; }
    .editor blockquote {
      margin: 12px 0;
      padding-left: 12px;
      border-left: 4px solid var(--border);
      color: var(--muted);
      font-style: italic;
    }
    .editor a { color: var(--primary); text-decoration: underline; }
    .editor code {
      padding: 2px 5px;
      border-radius: 5px;
      background: var(--secondary);
      font-family: Consolas, monospace;
      font-weight: 700;
    }
    .editor img {
      display: inline-block;
      max-width: 100%;
      height: auto;
      margin: 8px 0;
      border-radius: 6px;
    }
    .editor table {
      width: 100%;
      margin: 12px 0;
      border-collapse: collapse;
    }
    .editor td, .editor th {
      min-width: 80px;
      padding: 8px;
      border: 1px solid var(--border);
    }
    .editor hr {
      margin: 16px 0;
      border: 0;
      border-top: 1px solid var(--border);
    }
  </style>
</head>
<body>
  <div class="shell">
    <div class="toolbar">
      <button class="tool" data-command="bold" title="Bold">B</button>
      <button class="tool" data-command="italic" title="Italic">I</button>
      <button class="tool" data-command="underline" title="Underline">U</button>
      <button class="tool" data-command="formatBlock" data-value="p" title="Paragraf">P</button>
      <span class="divider"></span>
      <button class="tool" data-command="formatBlock" data-value="h1" title="Heading 1">H1</button>
      <button class="tool" data-command="formatBlock" data-value="h2" title="Heading 2">H2</button>
      <button class="tool" data-command="formatBlock" data-value="h3" title="Heading 3">H3</button>
      <span class="divider"></span>
      <button class="tool" data-command="insertUnorderedList" title="Daftar bullet">UL</button>
      <button class="tool" data-command="insertOrderedList" title="Daftar angka">OL</button>
      <button class="tool" data-command="formatBlock" data-value="blockquote" title="Kutipan">Quote</button>
      <button class="tool" data-command="insertHorizontalRule" title="Garis">HR</button>
      <span class="divider"></span>
      <button class="tool" data-action="link" title="Tambah link">Link</button>
      <button class="tool" data-action="image" title="Tambah gambar">Img</button>
      <button class="tool" data-action="table" title="Tabel">Tabel</button>
      <button class="tool" data-command="removeFormat" title="Hapus format">Clear</button>
    </div>
    <div
      id="editor"
      class="editor"
      contenteditable="${editable ? 'true' : 'false'}"
      data-placeholder="${escapeHtmlAttribute(placeholder)}"
    ></div>
  </div>
  <script>
    const RN = window.ReactNativeWebView;
    const editor = document.getElementById('editor');
    const initialHTML = ${toSafeJsString(html)};
    let internalUpdate = false;

    function send(message) {
      RN && RN.postMessage(JSON.stringify(message));
    }

    function focusEditor() {
      if (editor.getAttribute('contenteditable') === 'true') {
        editor.focus();
      }
    }

    function emitChange() {
      if (internalUpdate) return;
      send({ type: 'change', html: editor.innerHTML });
      updateToolbarState();
    }

    function runCommand(command, value) {
      focusEditor();
      document.execCommand(command, false, value || null);
      emitChange();
      updateToolbarState();
    }

    function createLink() {
      focusEditor();
      const previous = document.queryCommandValue('createLink') || '';
      const url = window.prompt('Masukkan URL', previous || 'https://');
      if (!url) return;
      const finalUrl = /^(https?:|mailto:|tel:)/i.test(url) ? url : 'https://' + url;
      document.execCommand('createLink', false, finalUrl);
      emitChange();
    }

    function insertTable() {
      focusEditor();
      document.execCommand(
        'insertHTML',
        false,
        '<table><tbody><tr><td>Kolom 1</td><td>Kolom 2</td></tr><tr><td></td><td></td></tr></tbody></table>'
      );
      emitChange();
    }

    function updateToolbarState() {
      document.querySelectorAll('[data-command]').forEach(button => {
        const command = button.getAttribute('data-command');
        if (!command || command === 'formatBlock') return;
        try {
          button.classList.toggle('active', document.queryCommandState(command));
        } catch {}
      });
    }

    document.querySelectorAll('.tool').forEach(button => {
      button.addEventListener('mousedown', event => event.preventDefault());
      button.addEventListener('click', () => {
        if (editor.getAttribute('contenteditable') !== 'true') return;
        const action = button.getAttribute('data-action');
        if (action === 'link') {
          createLink();
          return;
        }
        if (action === 'image') {
          send({ type: 'pick-image' });
          return;
        }
        if (action === 'table') {
          insertTable();
          return;
        }
        const command = button.getAttribute('data-command');
        const commandValue = button.getAttribute('data-value');
        if (command) {
          runCommand(command, commandValue);
        }
      });
    });

    editor.addEventListener('input', emitChange);
    editor.addEventListener('keyup', updateToolbarState);
    editor.addEventListener('mouseup', updateToolbarState);
    editor.addEventListener('paste', event => {
      const items = event.clipboardData && Array.from(event.clipboardData.items || []);
      const imageItem = items && items.find(item => item.type && item.type.startsWith('image/'));
      if (imageItem) {
        send({ type: 'pick-image' });
      }
      setTimeout(emitChange, 0);
    });

    window.KolamEditor = {
      setHTML(nextHTML) {
        if (editor.innerHTML === nextHTML) return;
        internalUpdate = true;
        editor.innerHTML = nextHTML || '';
        internalUpdate = false;
        updateToolbarState();
      },
      setEditable(nextEditable) {
        editor.setAttribute('contenteditable', nextEditable ? 'true' : 'false');
        document.querySelectorAll('.tool').forEach(button => {
          button.disabled = !nextEditable;
        });
      },
      insertImage(src, alt) {
        focusEditor();
        const image = '<img src="' + String(src).replace(/"/g, '&quot;') + '" alt="' + String(alt || 'Gambar').replace(/"/g, '&quot;') + '" />';
        document.execCommand('insertHTML', false, image);
        emitChange();
      },
      openImagePrompt() {
        focusEditor();
        const src = window.prompt('Masukkan URL gambar', 'https://');
        if (!src) return;
        this.insertImage(src, 'Gambar');
      }
    };

    window.KolamEditor.setHTML(initialHTML);
    window.KolamEditor.setEditable(${editable ? 'true' : 'false'});
    send({ type: 'ready' });
  </script>
</body>
</html>`;
}

function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const styles = StyleSheet.create({
  editor: {
    minHeight: 320,
    overflow: 'hidden',
    borderRadius: V.radius.lg,
    backgroundColor: V.colors.bg,
  },
  webView: {
    minHeight: 320,
    backgroundColor: V.colors.bg,
  },
});
