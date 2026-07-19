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
        containerStyle={styles.webViewContainer}
        javaScriptEnabled
        nestedScrollEnabled
        onLoadEnd={() => setReady(true)}
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
    .shell {
      min-height: 318px;
      border: 1px solid var(--input);
      border-radius: var(--radius);
      background: var(--bg);
      overflow: hidden;
    }
    .toolbar {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 8px;
      border-bottom: 1px solid var(--border);
      background: var(--secondary);
    }
    .toolbar-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px;
    }
    .toolbar-label {
      color: var(--fg);
      font: 800 12px/16px ${V.fontFamily}, Segoe UI, Arial, sans-serif;
      margin-right: 2px;
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
      font-size: 15px;
    }
    .tool:hover { border-color: var(--primary); color: var(--primary); }
    .tool.active { background: var(--primary); border-color: var(--primary); color: white; }
    .tool:disabled { opacity: .45; cursor: not-allowed; }
    .tool-select {
      height: 32px;
      min-width: 92px;
      padding: 0 28px 0 10px;
      border: 1px solid var(--border);
      border-radius: 7px;
      background: var(--bg);
      color: var(--fg);
      font: 800 12px/16px ${V.fontFamily}, Segoe UI, Arial, sans-serif;
      cursor: pointer;
    }
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
    .editor .kolam-columns {
      display: grid;
      gap: 12px;
      margin: 12px 0;
    }
    .editor .kolam-columns.columns-1 { grid-template-columns: 1fr; }
    .editor .kolam-columns.columns-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .editor .kolam-columns.columns-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .editor .kolam-column {
      min-height: 42px;
      padding: 10px;
      border: 1px dashed var(--border);
      border-radius: 7px;
    }
    .editor .drop-cap::first-letter {
      float: left;
      margin: 4px 8px 0 0;
      font-size: 42px;
      line-height: 34px;
      font-weight: 900;
      color: var(--primary);
    }
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
      <div class="toolbar-row">
        <button class="tool" data-command="bold" title="Tebal">B</button>
        <button class="tool" data-command="italic" title="Miring"><i>I</i></button>
        <button class="tool" data-command="underline" title="Garis bawah"><u>U</u></button>
        <span class="divider"></span>
        <button class="tool icon" data-action="emoji" data-value="&#128578;" title="Sisipkan ikon senyum">&#128578;</button>
        <button class="tool icon" data-action="emoji" data-value="&#128077;" title="Sisipkan ikon setuju">&#128077;</button>
        <button class="tool icon" data-action="emoji" data-value="&#128591;" title="Sisipkan ikon terima kasih">&#128591;</button>
        <button class="tool icon" data-action="emoji" data-value="&#9989;" title="Sisipkan ikon selesai">&#9989;</button>
        <button class="tool icon" data-action="emoji" data-value="&#10060;" title="Sisipkan ikon batal">&#10060;</button>
        <button class="tool icon" data-action="emoji" data-value="&#128247;" title="Sisipkan ikon kamera">&#128247;</button>
        <button class="tool icon" data-action="emoji" data-value="&#127881;" title="Sisipkan ikon perayaan">&#127881;</button>
        <button class="tool icon" data-action="emoji" data-value="&#128176;" title="Sisipkan ikon harga">&#128176;</button>
        <button class="tool icon" data-action="emoji" data-value="&#128230;" title="Sisipkan ikon paket">&#128230;</button>
        <button class="tool icon" data-action="emoji" data-value="&#127812;" title="Sisipkan ikon produk">&#127812;</button>
        <button class="tool icon" data-action="emoji" data-value="&#127807;" title="Sisipkan ikon daun">&#127807;</button>
        <span class="divider"></span>
        <button class="tool" data-command="formatBlock" data-value="h1" title="Heading 1">H1</button>
        <button class="tool" data-command="formatBlock" data-value="h2" title="Heading 2">H2</button>
        <button class="tool" data-command="formatBlock" data-value="h3" title="Heading 3">H3</button>
        <span class="divider"></span>
        <button class="tool" data-command="insertUnorderedList" title="Daftar bullet">&#8226;</button>
        <button class="tool" data-command="insertOrderedList" title="Daftar angka">1.</button>
        <button class="tool" data-action="columns" data-value="2" title="Dua kolom">2 Kolom</button>
        <button class="tool" data-action="columns" data-value="1" title="Satu kolom">1 Kolom</button>
        <button class="tool" data-action="table" title="Tabel">Tabel</button>
        <button class="tool" data-command="formatBlock" data-value="blockquote" title="Kutipan">66</button>
        <button class="tool" data-command="insertHorizontalRule" title="Garis">--</button>
        <button class="tool icon" data-action="link" title="Tambah link">&#128279;</button>
        <button class="tool icon" data-action="image" title="Tambah gambar">&#128247;</button>
      </div>
      <div class="toolbar-row">
        <span class="toolbar-label">Paragraf:</span>
        <button class="tool" data-command="justifyLeft" title="Rata kiri">&#9776;</button>
        <button class="tool" data-command="justifyCenter" title="Rata tengah">&#8801;</button>
        <button class="tool" data-command="justifyRight" title="Rata kanan">&#9776;</button>
        <button class="tool" data-command="justifyFull" title="Rata penuh">&#8803;</button>
        <select class="tool-select" data-action="line-height" title="Jarak baris">
          <option value="">LH</option>
          <option value="1.2">LH 1.2</option>
          <option value="1.5">LH 1.5</option>
          <option value="1.8">LH 1.8</option>
          <option value="2">LH 2</option>
        </select>
        <select class="tool-select" data-action="margin-before" title="Spasi sebelum">
          <option value="">Sebelum</option>
          <option value="0">0</option>
          <option value="8">8 px</option>
          <option value="16">16 px</option>
          <option value="24">24 px</option>
        </select>
        <select class="tool-select" data-action="margin-after" title="Spasi sesudah">
          <option value="">Sesudah</option>
          <option value="0">0</option>
          <option value="8">8 px</option>
          <option value="16">16 px</option>
          <option value="24">24 px</option>
        </select>
        <button class="tool" data-command="outdent" title="Kurangi indent">&#8592;</button>
        <button class="tool" data-command="indent" title="Tambah indent">&#8594;</button>
        <button class="tool" data-action="first-line" title="First line indent">1st</button>
        <button class="tool" data-action="hanging" title="Hanging indent">Hang</button>
        <button class="tool" data-action="direction" data-value="ltr" title="Kiri ke kanan">LTR</button>
        <button class="tool" data-action="direction" data-value="rtl" title="Kanan ke kiri">RTL</button>
        <button class="tool" data-action="columns" data-value="1" title="Satu kolom">1&#9638;</button>
        <button class="tool" data-action="columns" data-value="2" title="Dua kolom">2&#9638;</button>
        <button class="tool" data-action="columns" data-value="3" title="Tiga kolom">3&#9638;</button>
        <button class="tool" data-action="drop-cap" title="Drop cap">Drop</button>
        <button class="tool" data-command="removeFormat" title="Hapus format">Clear</button>
      </div>
    </div>
    <div
      id="editor"
      class="editor"
      contenteditable="${editable ? 'true' : 'false'}"
      data-placeholder="${escapeHtmlAttribute(placeholder)}"
    ></div>
  </div>
  <script>
    const editor = document.getElementById('editor');
    const initialHTML = ${toSafeJsString(html)};
    let internalUpdate = false;
    let savedRange = null;

    function send(message) {
      const payload = JSON.stringify(message);
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(payload);
        return;
      }
      if (window.chrome && window.chrome.webview && window.chrome.webview.postMessage) {
        window.chrome.webview.postMessage(payload);
      }
    }

    function focusEditor() {
      if (editor.getAttribute('contenteditable') === 'true') {
        editor.focus();
      }
    }

    function saveSelection() {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      savedRange = selection.getRangeAt(0);
    }

    function restoreSelection() {
      if (!savedRange) return;
      const selection = window.getSelection();
      if (!selection) return;
      selection.removeAllRanges();
      selection.addRange(savedRange);
    }

    function emitChange() {
      if (internalUpdate) return;
      send({ type: 'change', html: editor.innerHTML });
      updateToolbarState();
    }

    function runCommand(command, value) {
      focusEditor();
      restoreSelection();
      document.execCommand(command, false, value || null);
      emitChange();
      updateToolbarState();
    }

    function insertHTML(value) {
      focusEditor();
      restoreSelection();
      document.execCommand('insertHTML', false, value);
      emitChange();
    }

    function createLink() {
      focusEditor();
      restoreSelection();
      const previous = document.queryCommandValue('createLink') || '';
      const url = window.prompt('Masukkan URL', previous || 'https://');
      if (!url) return;
      const finalUrl = /^(https?:|mailto:|tel:)/i.test(url) ? url : 'https://' + url;
      document.execCommand('createLink', false, finalUrl);
      emitChange();
    }

    function insertTable() {
      insertHTML(
        '<table><tbody><tr><td>Kolom 1</td><td>Kolom 2</td></tr><tr><td></td><td></td></tr></tbody></table>'
      );
    }

    function insertColumns(count) {
      const columnCount = Math.max(1, Math.min(Number(count) || 1, 3));
      const columns = Array.from({ length: columnCount }, (_, index) => {
        return '<div class="kolam-column"><p>Kolom ' + (index + 1) + '</p></div>';
      }).join('');
      insertHTML('<div class="kolam-columns columns-' + columnCount + '">' + columns + '</div>');
    }

    function getBlockElement() {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return editor;
      let node = selection.anchorNode;
      if (node && node.nodeType === Node.TEXT_NODE) {
        node = node.parentNode;
      }
      while (node && node !== editor) {
        if (/^(P|DIV|LI|H1|H2|H3|BLOCKQUOTE)$/i.test(node.nodeName)) {
          return node;
        }
        node = node.parentNode;
      }
      return editor;
    }

    function setBlockStyle(styleName, value, unit) {
      focusEditor();
      restoreSelection();
      if (value === '') return;
      const block = getBlockElement();
      block.style[styleName] = value + (unit || '');
      emitChange();
    }

    function setDirection(value) {
      const block = getBlockElement();
      block.setAttribute('dir', value);
      emitChange();
    }

    function setFirstLineIndent() {
      setBlockStyle('textIndent', '24', 'px');
    }

    function setHangingIndent() {
      const block = getBlockElement();
      block.style.paddingLeft = '24px';
      block.style.textIndent = '-24px';
      emitChange();
    }

    function applyDropCap() {
      const block = getBlockElement();
      if (block === editor) {
        insertHTML('<p class="drop-cap">Tulis paragraf drop cap di sini.</p>');
        return;
      }
      block.classList.toggle('drop-cap');
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
        const actionValue = button.getAttribute('data-value') || '';
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
        if (action === 'columns') {
          insertColumns(actionValue);
          return;
        }
        if (action === 'emoji') {
          insertHTML(actionValue);
          return;
        }
        if (action === 'direction') {
          setDirection(actionValue);
          return;
        }
        if (action === 'first-line') {
          setFirstLineIndent();
          return;
        }
        if (action === 'hanging') {
          setHangingIndent();
          return;
        }
        if (action === 'drop-cap') {
          applyDropCap();
          return;
        }
        const command = button.getAttribute('data-command');
        const commandValue = button.getAttribute('data-value');
        if (command) {
          runCommand(command, commandValue);
        }
      });
    });

    document.querySelectorAll('.tool-select').forEach(select => {
      select.addEventListener('mousedown', saveSelection);
      select.addEventListener('focus', saveSelection);
      select.addEventListener('change', () => {
        if (editor.getAttribute('contenteditable') !== 'true') return;
        const action = select.getAttribute('data-action');
        if (action === 'line-height') {
          setBlockStyle('lineHeight', select.value, '');
        }
        if (action === 'margin-before') {
          setBlockStyle('marginTop', select.value, 'px');
        }
        if (action === 'margin-after') {
          setBlockStyle('marginBottom', select.value, 'px');
        }
        select.value = '';
      });
    });

    editor.addEventListener('input', emitChange);
    editor.addEventListener('blur', saveSelection);
    editor.addEventListener('keyup', saveSelection);
    editor.addEventListener('mouseup', saveSelection);
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
    editor.addEventListener('dragover', event => event.preventDefault());
    editor.addEventListener('drop', event => {
      event.preventDefault();
      const transfer = event.dataTransfer;
      const url =
        (transfer && transfer.getData('text/uri-list')) ||
        (transfer && transfer.getData('text/plain')) ||
        '';
      if (!url) {
        send({ type: 'pick-image' });
        return;
      }
      if (/\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(url)) {
        window.KolamEditor.insertImage(url, 'Gambar');
        return;
      }
      document.execCommand('createLink', false, /^(https?:|mailto:|tel:)/i.test(url) ? url : 'https://' + url);
      emitChange();
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
        restoreSelection();
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
  webViewContainer: {
    backgroundColor: V.colors.bg,
  },
  webView: {
    minHeight: 320,
    backgroundColor: V.colors.bg,
  },
});
