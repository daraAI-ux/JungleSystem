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
type InlineTag = 'strong' | 'em';
type SelectionRange = { start: number; end: number };

const EMPTY_SELECTION: SelectionRange = { start: 0, end: 0 };

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
  const inputRef = React.useRef<TextInput>(null);
  const selectionRef = React.useRef<SelectionRange>(EMPTY_SELECTION);
  const [selection, setSelection] =
    React.useState<SelectionRange>(EMPTY_SELECTION);
  const [linkPanelOpen, setLinkPanelOpen] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState('');

  const setEditorSelection = React.useCallback((next: SelectionRange) => {
    selectionRef.current = next;
    setSelection(next);
  }, []);

  const focusInput = React.useCallback(() => {
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const getRange = React.useCallback(() => {
    const start = clampIndex(selectionRef.current.start, value.length);
    const end = clampIndex(selectionRef.current.end, value.length);
    return start <= end ? { start, end } : { start: end, end: start };
  }, [value.length]);

  const runCommand = React.useCallback(
    (
      createReplacement: (selectedText: string) => {
        caretOffset?: number;
        text: string;
      },
      fallback = '',
    ) => {
      if (!editable) {
        return;
      }

      const range = getRange();
      const selectedText = value.slice(range.start, range.end) || fallback;
      const replacement = createReplacement(selectedText);
      const nextValue = `${value.slice(0, range.start)}${replacement.text}${value.slice(
        range.end,
      )}`;
      const caret =
        range.start + (replacement.caretOffset ?? replacement.text.length);

      onChangeText(nextValue);
      setEditorSelection({ start: caret, end: caret });
      focusInput();
    },
    [editable, focusInput, getRange, onChangeText, setEditorSelection, value],
  );

  const applyInline = (tag: InlineTag) => {
    runCommand(
      selectedText => ({
        caretOffset: selectedText ? undefined : tag.length + 2,
        text: `<${tag}>${escapeHtmlText(selectedText)}</${tag}>`,
      }),
      'Teks',
    );
  };

  const applyBlock = (tag: BlockTag) => {
    runCommand(
      selectedText => ({
        text: `<${tag}>${escapeHtmlText(selectedText)}</${tag}>`,
      }),
      getBlockFallback(tag),
    );
  };

  const applyParagraph = () => {
    runCommand(
      selectedText => ({
        text: `<p>${escapeHtmlText(selectedText)}</p>`,
      }),
      'Paragraf',
    );
  };

  const applyList = (ordered = false) => {
    runCommand(
      selectedText => {
        const items = selectedText
          .split(/\r?\n/)
          .map(item => item.trim())
          .filter(Boolean)
          .map(item => `<li>${escapeHtmlText(item)}</li>`)
          .join('');
        return {
          text: ordered ? `<ol>${items}</ol>` : `<ul>${items}</ul>`,
        };
      },
      'Item daftar',
    );
  };

  const insertTemplate = (template: string) => {
    runCommand(() => ({ text: template }));
  };

  const openLinkPanel = () => {
    if (!editable) {
      return;
    }

    setLinkPanelOpen(current => !current);
  };

  const applyLink = () => {
    const href = normalizeUrl(linkUrl);
    if (!href) {
      setLinkPanelOpen(false);
      setLinkUrl('');
      return;
    }

    runCommand(
      selectedText => ({
        text: `<a href="${escapeHtmlAttribute(href)}">${escapeHtmlText(
          selectedText || href,
        )}</a>`,
      }),
      href,
    );
    setLinkPanelOpen(false);
    setLinkUrl('');
  };

  const insertImageFromPicker = async () => {
    if (!editable) {
      return;
    }

    try {
      const picked = await pickNativeImageFile();
      const uri = picked.uri || (picked.path ? `file:///${picked.path}` : '');
      if (picked.cancelled || !uri) {
        return;
      }

      insertTemplate(
        `<img src="${escapeHtmlAttribute(uri)}" alt="${escapeHtmlAttribute(
          picked.name || 'Gambar',
        )}" />`,
      );
    } catch {
      insertTemplate('<img src="" alt="Gambar" />');
    }
  };

  const clearBasicFormatting = () => {
    runCommand(selectedText => ({ text: stripBasicHtml(selectedText) }), value);
  };

  const onSelectionChange = (
    event: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
  ) => {
    setEditorSelection(event.nativeEvent.selection);
  };

  return (
    <View style={styles.editor}>
      <View style={styles.toolbar}>
        <ToolbarButton
          disabled={!editable}
          label="B"
          onPress={() => applyInline('strong')}
          title="Bold"
        />
        <ToolbarButton
          disabled={!editable}
          label="I"
          onPress={() => applyInline('em')}
          title="Italic"
        />
        <ToolbarDivider />
        <ToolbarButton
          disabled={!editable}
          label="P"
          onPress={applyParagraph}
          title="Paragraf"
        />
        <ToolbarButton
          disabled={!editable}
          label="H1"
          onPress={() => applyBlock('h1')}
          title="Heading 1"
        />
        <ToolbarButton
          disabled={!editable}
          label="H2"
          onPress={() => applyBlock('h2')}
          title="Heading 2"
        />
        <ToolbarButton
          disabled={!editable}
          label="H3"
          onPress={() => applyBlock('h3')}
          title="Heading 3"
        />
        <ToolbarDivider />
        <ToolbarButton
          disabled={!editable}
          label="UL"
          onPress={() => applyList(false)}
          title="Daftar bullet"
        />
        <ToolbarButton
          disabled={!editable}
          label="OL"
          onPress={() => applyList(true)}
          title="Daftar angka"
        />
        <ToolbarButton
          disabled={!editable}
          label="Quote"
          onPress={() => applyBlock('blockquote')}
          title="Kutipan"
        />
        <ToolbarButton
          disabled={!editable}
          label="HR"
          onPress={() => insertTemplate('<hr />')}
          title="Garis pemisah"
        />
        <ToolbarDivider />
        <ToolbarButton
          disabled={!editable}
          label="Link"
          onPress={openLinkPanel}
          title="Tambah link"
        />
        <ToolbarButton
          disabled={!editable}
          label="Img"
          onPress={() => {
            void insertImageFromPicker();
          }}
          title="Tambah gambar"
        />
        <ToolbarButton
          disabled={!editable}
          label="Clear"
          onPress={clearBasicFormatting}
          title="Hapus format dasar"
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
      <TextInput
        editable={editable}
        multiline
        onChangeText={onChangeText}
        onSelectionChange={onSelectionChange}
        placeholder={placeholder}
        placeholderTextColor={V.colors.mutedFg}
        ref={inputRef}
        selection={selection}
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
  title,
}: {
  disabled?: boolean;
  label: string;
  onPress: () => void;
  title: string;
}) {
  return (
    <KolamInteractionFrame
      accessibilityLabel={title}
      disabled={disabled}
      onPress={onPress}
      style={[styles.toolButton, disabled && styles.toolButtonDisabled]}
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

function clampIndex(index: number, max: number) {
  if (!Number.isFinite(index)) {
    return max;
  }

  return Math.max(0, Math.min(index, max));
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
    .replace(/<\/?(strong|em|u|h1|h2|h3|code|blockquote|ul|ol|li|p)>/gi, '')
    .replace(/<hr\s*\/?>/gi, '')
    .replace(/<a\s+[^>]*>(.*?)<\/a>/gi, '$1')
    .replace(/<img\s+[^>]*>/gi, '')
    .trim();
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
  toolButton: {
    minWidth: 34,
    minHeight: 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: V.radius.md,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  toolButtonDisabled: {
    opacity: 0.45,
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
    marginHorizontal: 2,
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
    minHeight: 190,
    paddingHorizontal: V.control.inputPaddingX,
    paddingVertical: 12,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
  },
});
