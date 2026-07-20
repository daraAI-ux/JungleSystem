import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamPanelFrame} from './kolam-panel-frame';
import {KolamSummaryCardList} from './kolam-summary-card-list';
import {KolamTipTapRichTextEditor} from './kolam-tiptap-rich-text-editor';

const INITIAL_HTML =
  '<p><strong>Uji rich text JungleSystem.</strong> Pilih teks ini lalu coba toolbar.</p>';

const TIPTAP_TARGETS = [
  {id: 'engine', title: 'Engine', meta: 'TipTap lokal'},
  {id: 'scope', title: 'Scope', meta: 'Lab dulu'},
  {id: 'output', title: 'Output', meta: 'HTML'},
  {id: 'install', title: 'Pasang modul', meta: 'Setelah lolos uji'},
];

export function KolamRichTextLabSurface() {
  const [html, setHtml] = React.useState(INITIAL_HTML);
  const [debugMessages, setDebugMessages] = React.useState<string[]>([]);

  const handleDebugMessage = React.useCallback((message: string) => {
    setDebugMessages(current => [message, ...current].slice(0, 8));
  }, []);

  return (
    <KolamPanelFrame
      accessibilityLabel="Rich text lab"
      variant="surface"
      style={styles.panel}>
      <KolamCopyStack
        items={[
          {id: 'eyebrow', text: 'PREPARATION', style: styles.eyebrow},
          {id: 'title', text: 'Rich Text Lab', style: styles.title},
          {
            id: 'subtitle',
            text: 'Uji editor reusable sebelum dipasang ke merek, kategori, dan produk.',
            style: styles.subtitle,
          },
        ]}
      />
      <KolamSummaryCardList
        accessibilityLabel="Rich text lab target"
        items={TIPTAP_TARGETS}
        variant="compact"
      />
      <KolamTipTapRichTextEditor
        onChangeText={setHtml}
        onDebugMessage={handleDebugMessage}
        placeholder="Tulis deskripsi..."
        value={html}
      />
      <View style={styles.output}>
        <KolamCopyStack
          items={[
            {id: 'label', text: 'Log Editor', style: styles.outputLabel},
          ]}
        />
        <Text selectable style={styles.outputText}>
          {debugMessages.length > 0
            ? debugMessages.join('\n')
            : 'Belum ada log editor.'}
        </Text>
      </View>
      <View style={styles.output}>
        <KolamCopyStack
          items={[
            {id: 'label', text: 'HTML Output', style: styles.outputLabel},
          ]}
        />
        <Text selectable style={styles.outputText}>
          {html}
        </Text>
      </View>
    </KolamPanelFrame>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: 14,
    padding: V.layout.cardSpacing,
  },
  eyebrow: {
    color: V.colors.success,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 4,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 6,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    lineHeight: 19,
  },
  output: {
    gap: 8,
    padding: 12,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.muted,
  },
  outputLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  outputText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 18,
  },
});
