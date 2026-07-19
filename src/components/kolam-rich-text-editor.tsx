import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputSelectionChangeEventData,
} from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { pickNativeImageFile } from '../services/native-file-picker';
import { KolamButton } from './kolam-button';
import { KolamInteractionFrame } from './kolam-interaction-frame';

type BlockTag = 'h1' | 'h2' | 'h3' | 'blockquote';
type InlineTag = 'strong' | 'em' | 'u' | 'code';

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
  const [selection, setSelection] = React.useState({ start: 0, end: 0 });
  const [linkPanelOpen, setLinkPanelOpen] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState('');

  const replaceSelection = React.useCallback(
    (next: string) => {
      const start = Math.min(selection.start, value.length);
      const end = Math.min(selection.end, value.length);
      onChangeText(`${value.slice(0, start)}${next}${value.slice(end)}`);
    },
    [onChangeText, selection.end, selection.start, value],
  );

  const getSelectedText = React.useCallback(
    (fallback: string) => {
      const start = Math.min(selection.start, value.length);
      const end = Math.min(selection.end, value.length);
      return value.slice(start, end) || fallback;
    },
    [selection.end, selection.start, value],
  );

  const applyInline = (tag: InlineTag) => {
    replaceSelection(`<${tag}>${getSelectedText('Teks')}</${tag}>`);
  };

  const applyBlock = (tag: BlockTag) => {
    replaceSelection(`<${tag}>${getSelectedText(getBlockFallback(tag))}</${tag}>`);
  };

  const applyList = (ordered = false) => {
    const selected = getSelectedText('Item daftar');
    const items = selected
      .split(/\r?\n/)
      .map(item => item.trim())
      .filter(Boolean)
      .map(item => `<li>${escapeHtmlText(item)}</li>`)
      .join('');
    replaceSelection(ordered ? `<ol>${items}</ol>` : `<ul>${items}</ul>`);
  };

  const insertTemplate = (template: string) => {
    replaceSelection(template);
  };

  const insertEmoji = (emoji: string) => {
    replaceSelection(emoji);
  };

  const applyLink = () => {
    const href = normalizeUrl(linkUrl);
    if (!href) {
      setLinkPanelOpen(false);
      return;
    }

    const selected = getSelectedText(href);
    replaceSelection(`<a href="${escapeHtmlAttribute(href)}">${selected}</a>`);
    setLinkPanelOpen(false);
    setLinkUrl('');
  };

  const insertImageFromPicker = async () => {
    try {
      const picked = await pickNativeImageFile();
      const uri = picked.uri || (picked.path ? `file:///${picked.path}` : '');
      if (picked.cancelled || !uri) {
        return;
      }

      replaceSelection(
        `<img src="${escapeHtmlAttribute(uri)}" alt="${escapeHtmlAttribute(
          picked.name || 'Gambar',
        )}" />`,
      );
    } catch {
      insertTemplate('<img src="" alt="Gambar" />');
    }
  };

  const clearBasicFormatting = () => {
    replaceSelection(stripBasicHtml(getSelectedText(value)));
  };

  const onSelectionChange = (
    event: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
  ) => {
    setSelection(event.nativeEvent.selection);
  };

  return (
    <View style={styles.editor}>
      <View style={styles.toolbar}>
        <ToolbarButton
          disabled={!editable}
          label="B"
          onPress={() => applyInline('strong')}
        />
        <ToolbarButton
          disabled={!editable}
          label="I"
          onPress={() => applyInline('em')}
        />
        <ToolbarButton
          disabled={!editable}
          label="U"
          onPress={() => applyInline('u')}
        />
        <ToolbarDivider />
        {['🙂', '👍', '🙏', '✅', '❌', '📷', '🎉', '💰', '📦', '🐸', '🌿'].map(
          emoji => (
            <ToolbarButton
              disabled={!editable}
              key={emoji}
              label={emoji}
              onPress={() => insertEmoji(emoji)}
            />
          ),
        )}
        <ToolbarDivider />
        <ToolbarButton
          disabled={!editable}
          label="H1"
          onPress={() => applyBlock('h1')}
        />
        <ToolbarButton
          disabled={!editable}
          label="H2"
          onPress={() => applyBlock('h2')}
        />
        <ToolbarButton
          disabled={!editable}
          label="H3"
          onPress={() => applyBlock('h3')}
        />
        <ToolbarButton
          disabled={!editable}
          label="•"
          onPress={() => applyList(false)}
        />
        <ToolbarButton
          disabled={!editable}
          label="1."
          onPress={() => applyList(true)}
        />
        <ToolbarButton
          disabled={!editable}
          label="2 Kolom"
          onPress={() =>
            insertTemplate(
              '<div class="grid grid-cols-2 gap-4"><div>Kolom 1</div><div>Kolom 2</div></div>',
            )
          }
        />
        <ToolbarButton
          disabled={!editable}
          label="1 Kolom"
          onPress={() => insertTemplate('<div>Konten</div>')}
        />
        <ToolbarButton
          disabled={!editable}
          label="Tabel"
          onPress={() =>
            insertTemplate(
              '<table><tbody><tr><td>Kolom 1</td><td>Kolom 2</td></tr></tbody></table>',
            )
          }
        />
        <ToolbarButton
          disabled={!editable}
          label="66"
          onPress={() => applyBlock('blockquote')}
        />
        <ToolbarButton
          disabled={!editable}
          label="-"
          onPress={() => insertTemplate('<hr />')}
        />
        <ToolbarButton
          disabled={!editable}
          label="🔗"
          onPress={() => setLinkPanelOpen(current => !current)}
        />
        <ToolbarButton
          disabled={!editable}
          label="🖼"
          onPress={() => {
            void insertImageFromPicker();
          }}
        />
        <ToolbarButton
          disabled={!editable}
          label="⌫"
          onPress={clearBasicFormatting}
        />
      </View>
      {linkPanelOpen ? (
        <View style={styles.linkPanel}>
          <TextInput
            autoFocus
            editable={editable}
            onChangeText={setLinkUrl}
            placeholder="https://..."
            placeholderTextColor={V.colors.mutedFg}
            style={styles.linkInput}
            value={linkUrl}
          />
          <KolamButton
            disabled={!editable}
            label="Simpan"
            onPress={applyLink}
          />
          <KolamButton
            label="Batal"
            onPress={() => {
              setLinkPanelOpen(false);
              setLinkUrl('');
            }}
          />
        </View>
      ) : null}
      <View style={styles.subToolbar}>
        <ToolbarButton
          disabled={!editable}
          label="Paragraf"
          onPress={() => insertTemplate('<p>Paragraf</p>')}
        />
        <ToolbarButton
          disabled={!editable}
          label="LH"
          onPress={() => insertTemplate('<p style="line-height: 1.6;">Teks</p>')}
        />
        <ToolbarButton
          disabled={!editable}
          label="Sebelum"
          onPress={() => insertTemplate('<p style="margin-top: 1rem;">Teks</p>')}
        />
        <ToolbarButton
          disabled={!editable}
          label="Sesudah"
          onPress={() =>
            insertTemplate('<p style="margin-bottom: 1rem;">Teks</p>')
          }
        />
        <ToolbarButton
          disabled={!editable}
          label="LTR"
          onPress={() => insertTemplate('<p dir="ltr">Teks</p>')}
        />
        <ToolbarButton
          disabled={!editable}
          label="RTL"
          onPress={() => insertTemplate('<p dir="rtl">Teks</p>')}
        />
      </View>
      <TextInput
        editable={editable}
        multiline
        onChangeText={onChangeText}
        onSelectionChange={onSelectionChange}
        placeholder={placeholder}
        placeholderTextColor={V.colors.mutedFg}
        style={styles.input}
        textAlignVertical="top"
        value={value}
      />
    </View>
  );
}

function ToolbarButton({
  disabled,
  label,
  onPress,
}: {
  disabled?: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <KolamInteractionFrame
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={styles.toolButton}
    >
      <Text allowFontScaling={false} style={styles.toolButtonText}>
        {label}
      </Text>
    </KolamInteractionFrame>
  );
}

function ToolbarDivider() {
  return <View style={styles.separator} />;
}

function getBlockFallback(tag: BlockTag) {
  return tag === 'blockquote' ? 'Kutipan' : 'Judul bagian';
}

function normalizeUrl(url: string) {
  const next = url.trim();
  if (!next) {
    return '';
  }

  if (/^(https?:|data:image\/|file:)/i.test(next)) {
    return next;
  }

  return `https://${next}`;
}

function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtmlText(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function stripBasicHtml(text: string) {
  return text
    .replace(/<\/?(strong|em|u|h1|h2|h3|code|blockquote|ul|ol|li)>/gi, '')
    .replace(/<hr\s*\/?>/gi, '')
    .replace(/<a\s+[^>]*>(.*?)<\/a>/gi, '$1')
    .replace(/<img\s+[^>]*>/gi, '');
}

const styles = StyleSheet.create({
  editor: {
    overflow: 'hidden',
    borderRadius: V.radius.lg,
    borderColor: V.colors.input,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  toolbar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    padding: 8,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    backgroundColor: V.colors.secondary,
  },
  subToolbar: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    backgroundColor: V.colors.bg,
  },
  toolButton: {
    minWidth: 32,
    minHeight: 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: V.radius.md,
  },
  toolButtonText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontWeight: '800',
    fontSize: 12,
    lineHeight: 16,
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: V.colors.border,
  },
  linkPanel: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    backgroundColor: V.colors.bg,
  },
  linkInput: {
    flex: 1,
    minHeight: 34,
    paddingHorizontal: 10,
    borderRadius: V.radius.lg,
    borderColor: V.colors.input,
    borderWidth: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    minHeight: 170,
    paddingHorizontal: V.control.inputPaddingX,
    paddingVertical: 12,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
  },
});
