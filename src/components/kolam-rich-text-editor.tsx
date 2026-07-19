import React from 'react';
import { StyleSheet, TextInput, View, type TextInputSelectionChangeEventData, type NativeSyntheticEvent } from 'react-native';
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

  const applyTag = (tag: string) => {
    const open = `<${tag}>`;
    const close = `</${tag}>`;
    const start = Math.min(selection.start, value.length);
    const end = Math.min(selection.end, value.length);
    const selected = value.slice(start, end) || getPlaceholderText(tag);
    onChangeText(`${value.slice(0, start)}${open}${selected}${close}${value.slice(end)}`);
  };

  const applyList = () => {
    const start = Math.min(selection.start, value.length);
    const end = Math.min(selection.end, value.length);
    const selected = value.slice(start, end) || 'Item daftar';
    const items = selected
      .split(/\r?\n/)
      .map(item => item.trim())
      .filter(Boolean)
      .map(item => `<li>${item}</li>`)
      .join('');
    onChangeText(`${value.slice(0, start)}<ul>${items}</ul>${value.slice(end)}`);
  };

  const onSelectionChange = (
    event: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
  ) => {
    setSelection(event.nativeEvent.selection);
  };

  return (
    <View style={styles.editor}>
      <View style={styles.toolbar}>
        <KolamButton disabled={!editable} label="B" onPress={() => applyTag('strong')} style={styles.toolButton} />
        <KolamButton disabled={!editable} label="I" onPress={() => applyTag('em')} style={styles.toolButton} />
        <KolamButton disabled={!editable} label="H2" onPress={() => applyTag('h2')} style={styles.toolButton} />
        <KolamButton disabled={!editable} label="Daftar" onPress={applyList} style={styles.toolButton} />
        <KolamButton disabled={!editable} label="Kutipan" onPress={() => applyTag('blockquote')} style={styles.toolButton} />
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
    case 'h2':
      return 'Judul bagian';
    case 'blockquote':
      return 'Kutipan';
    default:
      return 'Teks';
  }
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
