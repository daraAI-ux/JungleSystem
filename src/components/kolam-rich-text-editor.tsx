import React from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputSelectionChangeEventData,
} from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamButton } from './kolam-button';

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
  const [imageAlign, setImageAlign] = React.useState<'left' | 'center' | 'right'>(
    'center',
  );
  const [imageAlt, setImageAlt] = React.useState('');
  const [imageSize, setImageSize] = React.useState<
    '15%' | '25%' | '50%' | '75%' | '100%'
  >('50%');
  const [linkUrl, setLinkUrl] = React.useState('');
  const [imageUrl, setImageUrl] = React.useState('');

  const replaceSelection = (next: string) => {
    const start = Math.min(selection.start, value.length);
    const end = Math.min(selection.end, value.length);
    onChangeText(`${value.slice(0, start)}${next}${value.slice(end)}`);
  };

  const getSelectedText = (fallback: string) => {
    const start = Math.min(selection.start, value.length);
    const end = Math.min(selection.end, value.length);
    return value.slice(start, end) || fallback;
  };

  const applyTag = (tag: string) => {
    const selected = getSelectedText(getPlaceholderText(tag));
    replaceSelection(`<${tag}>${selected}</${tag}>`);
  };

  const applyList = (ordered = false) => {
    const selected = getSelectedText('Item daftar');
    const items = selected
      .split(/\r?\n/)
      .map(item => item.trim())
      .filter(Boolean)
      .map(item => `<li>${item}</li>`)
      .join('');
    replaceSelection(ordered ? `<ol>${items}</ol>` : `<ul>${items}</ul>`);
  };

  const applyLink = () => {
    const href = normalizeUrl(linkUrl);
    if (!href) {
      return;
    }

    const selected = getSelectedText(href);
    replaceSelection(`<a href="${href}">${selected}</a>`);
    setLinkUrl('');
  };

  const applyImage = () => {
    const src = normalizeUrl(imageUrl);
    if (!src) {
      return;
    }

    replaceSelection(
      `<img src="${src}" alt="${escapeHtmlAttribute(imageAlt)}" class="align-${imageAlign}" style="width: ${imageSize}; height: auto;" />`,
    );
    setImageAlt('');
    setImageUrl('');
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
        <KolamButton
          disabled={!editable}
          label="B"
          onPress={() => applyTag('strong')}
          style={styles.toolButton}
        />
        <KolamButton
          disabled={!editable}
          label="I"
          onPress={() => applyTag('em')}
          style={styles.toolButton}
        />
        <KolamButton
          disabled={!editable}
          label="Kode"
          onPress={() => applyTag('code')}
          style={styles.toolButton}
        />
        <View style={styles.separator} />
        <KolamButton
          disabled={!editable}
          label="H1"
          onPress={() => applyTag('h1')}
          style={styles.toolButton}
        />
        <KolamButton
          disabled={!editable}
          label="H2"
          onPress={() => applyTag('h2')}
          style={styles.toolButton}
        />
        <KolamButton
          disabled={!editable}
          label="H3"
          onPress={() => applyTag('h3')}
          style={styles.toolButton}
        />
        <View style={styles.separator} />
        <KolamButton
          disabled={!editable}
          label="Poin"
          onPress={() => applyList(false)}
          style={styles.toolButton}
        />
        <KolamButton
          disabled={!editable}
          label="1."
          onPress={() => applyList(true)}
          style={styles.toolButton}
        />
        <KolamButton
          disabled={!editable}
          label="Kutipan"
          onPress={() => applyTag('blockquote')}
          style={styles.toolButton}
        />
        <KolamButton
          disabled={!editable}
          label="Garis"
          onPress={() => replaceSelection('<hr />')}
          style={styles.toolButton}
        />
        <KolamButton
          disabled={!editable}
          label="Bersih"
          onPress={clearBasicFormatting}
          style={styles.toolButton}
        />
      </View>
      <View style={styles.insertRow}>
        <TextInput
          editable={editable}
          onChangeText={setLinkUrl}
          placeholder="URL tautan"
          placeholderTextColor={V.colors.mutedFg}
          style={[styles.inlineInput, styles.inlineInputWide]}
          value={linkUrl}
        />
        <KolamButton
          disabled={!editable || !linkUrl.trim()}
          label="Tautan"
          onPress={applyLink}
          style={styles.insertButton}
        />
        <TextInput
          editable={editable}
          onChangeText={setImageUrl}
          placeholder="URL gambar"
          placeholderTextColor={V.colors.mutedFg}
          style={[styles.inlineInput, styles.inlineInputWide]}
          value={imageUrl}
        />
        <KolamButton
          disabled={!editable || !imageUrl.trim()}
          label="Gambar"
          onPress={applyImage}
          style={styles.insertButton}
        />
        <TextInput
          editable={editable}
          onChangeText={setImageAlt}
          placeholder="Alt gambar"
          placeholderTextColor={V.colors.mutedFg}
          style={[styles.inlineInput, styles.inlineInputAlt]}
          value={imageAlt}
        />
        <View style={styles.compactGroup}>
          {(['left', 'center', 'right'] as const).map(align => (
            <KolamButton
              disabled={!editable}
              intent={imageAlign === align ? 'primary' : 'outline'}
              key={align}
              label={getAlignmentLabel(align)}
              onPress={() => setImageAlign(align)}
              style={styles.compactButton}
            />
          ))}
        </View>
        <View style={styles.compactGroup}>
          {(['15%', '25%', '50%', '75%', '100%'] as const).map(size => (
            <KolamButton
              disabled={!editable}
              intent={imageSize === size ? 'primary' : 'outline'}
              key={size}
              label={getImageSizeLabel(size)}
              onPress={() => setImageSize(size)}
              style={styles.compactButton}
            />
          ))}
        </View>
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

function getPlaceholderText(tag: string) {
  switch (tag) {
    case 'h1':
    case 'h2':
    case 'h3':
      return 'Judul bagian';
    case 'code':
      return 'kode';
    case 'blockquote':
      return 'Kutipan';
    default:
      return 'Teks';
  }
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

function getAlignmentLabel(align: 'left' | 'center' | 'right') {
  switch (align) {
    case 'left':
      return 'Kiri';
    case 'right':
      return 'Kanan';
    case 'center':
    default:
      return 'Tengah';
  }
}

function getImageSizeLabel(size: '15%' | '25%' | '50%' | '75%' | '100%') {
  switch (size) {
    case '15%':
      return 'XS';
    case '25%':
      return 'S';
    case '75%':
      return 'L';
    case '100%':
      return 'XL';
    case '50%':
    default:
      return 'M';
  }
}

function stripBasicHtml(text: string) {
  return text
    .replace(/<\/?(strong|em|h1|h2|h3|code|blockquote|ul|ol|li)>/gi, '')
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
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    padding: 7,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    backgroundColor: V.colors.secondary,
  },
  toolButton: {
    minWidth: 38,
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: V.colors.border,
  },
  insertRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    padding: 7,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    backgroundColor: V.colors.bg,
  },
  inlineInput: {
    minHeight: 34,
    paddingHorizontal: 10,
    borderRadius: V.radius.md,
    borderColor: V.colors.input,
    borderWidth: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  inlineInputWide: {
    flex: 1,
    minWidth: 180,
  },
  inlineInputAlt: {
    width: 150,
  },
  insertButton: {
    minWidth: 74,
  },
  compactGroup: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactButton: {
    minWidth: 48,
    paddingHorizontal: 8,
  },
  input: {
    minHeight: 160,
    paddingHorizontal: V.control.inputPaddingX,
    paddingVertical: 10,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
});
