import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamTipTapRichTextEditor} from './kolam-tiptap-rich-text-editor';

type ExclusiveContextValue = {
  activeFieldId: string | null;
  setActiveFieldId: (fieldId: string) => void;
};

const TipTapExclusiveContext =
  React.createContext<ExclusiveContextValue | null>(null);

/**
 * Ensures at most one TipTap WebView2 is mounted inside the group.
 * Inactive fields render a lightweight preview until activated.
 */
export function KolamTipTapExclusiveGroup({
  children,
  initialFieldId = null,
}: {
  children: React.ReactNode;
  initialFieldId?: string | null;
}) {
  const [activeFieldId, setActiveFieldId] = React.useState<string | null>(
    initialFieldId,
  );

  const value = React.useMemo(
    () => ({
      activeFieldId,
      setActiveFieldId,
    }),
    [activeFieldId],
  );

  return (
    <TipTapExclusiveContext.Provider value={value}>
      {children}
    </TipTapExclusiveContext.Provider>
  );
}

export function KolamTipTapExclusiveField({
  editable = true,
  fieldId,
  onChangeText,
  onDebugMessage,
  placeholder,
  value,
}: {
  editable?: boolean;
  fieldId: string;
  onChangeText: (value: string) => void;
  onDebugMessage?: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  const context = React.useContext(TipTapExclusiveContext);
  if (!context) {
    throw new Error(
      'KolamTipTapExclusiveField must be used inside KolamTipTapExclusiveGroup',
    );
  }

  const {activeFieldId, setActiveFieldId} = context;
  const isActive = activeFieldId === fieldId;

  if (isActive) {
    return (
      <KolamTipTapRichTextEditor
        editable={editable}
        onChangeText={onChangeText}
        onDebugMessage={onDebugMessage}
        placeholder={placeholder}
        value={value}
      />
    );
  }

  const previewText = getPlainTextPreview(value);
  const empty = !previewText;

  return (
    <Pressable
      accessibilityLabel={placeholder ?? 'Rich text field'}
      accessibilityRole="button"
      disabled={!editable}
      onPress={() => {
        if (editable) {
          setActiveFieldId(fieldId);
        }
      }}
      style={({pressed}) => [
        styles.preview,
        pressed && editable ? styles.previewPressed : null,
        !editable ? styles.previewDisabled : null,
      ]}
    >
      <Text
        numberOfLines={8}
        style={[styles.previewText, empty ? styles.previewPlaceholder : null]}
      >
        {empty ? placeholder ?? 'Ketuk untuk mengedit...' : previewText}
      </Text>
      {editable ? (
        <Text style={styles.previewHint}>Ketuk untuk mengedit di editor</Text>
      ) : null}
    </Pressable>
  );
}

function getPlainTextPreview(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

const styles = StyleSheet.create({
  preview: {
    minHeight: 388,
    borderRadius: V.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: V.colors.border,
    backgroundColor: V.colors.bg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'space-between',
    gap: 10,
  },
  previewPressed: {
    opacity: 0.92,
  },
  previewDisabled: {
    opacity: 0.7,
  },
  previewText: {
    color: V.colors.fg,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: V.fontFamily,
  },
  previewPlaceholder: {
    color: V.colors.mutedFg,
  },
  previewHint: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: V.fontFamily,
  },
});
