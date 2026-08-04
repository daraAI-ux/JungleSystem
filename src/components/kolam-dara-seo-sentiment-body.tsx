import React from 'react';
import {ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {
  KolamDaraSeoSentimentController,
  KolamDaraSeoSentimentFilter,
} from '../hooks/use-kolam-dara-seo-sentiment-controller';
import {KolamButton} from './kolam-button';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamSwitch} from './kolam-switch';

const QUICK_CHIPS = ['Produk bagus', 'Pengiriman lambat', 'Harga terlalu mahal'];

const FILTERS: Array<{id: KolamDaraSeoSentimentFilter; label: string}> = [
  {id: 'all', label: 'All'},
  {id: 'positive', label: 'Positif'},
  {id: 'neutral', label: 'Netral'},
  {id: 'negative', label: 'Negatif'},
];

const SENTIMENT_LABEL: Record<string, string> = {
  positive: 'Positif',
  neutral: 'Netral',
  negative: 'Negatif',
};

export function KolamDaraSeoSentimentBody({
  canDraft,
  controller,
}: {
  canDraft: boolean;
  controller: KolamDaraSeoSentimentController;
}) {
  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
      <View style={styles.mainRow}>
        <View style={styles.main}>
          {canDraft ? (
            <View style={styles.ingestCard}>
              <TextInput
                onChangeText={controller.onSetText}
                placeholder="Tulis atau tempel teks pelanggan"
                placeholderTextColor={V.colors.mutedFg}
                style={styles.input}
                value={controller.text}
              />
              <View style={styles.chipsRow}>
                {QUICK_CHIPS.map(chip => (
                  <KolamButton
                    key={chip}
                    label={chip}
                    onPress={() => controller.onUseQuickChip(chip)}
                  />
                ))}
              </View>
              {controller.llamaEnabled ? (
                <View style={styles.llamaRow}>
                  <Text style={styles.meta}>Gunakan Llama</Text>
                  <KolamSwitch
                    active={controller.useLlm}
                    onPress={() => controller.onSetUseLlm(!controller.useLlm)}
                  />
                </View>
              ) : null}
              <KolamButton
                disabled={controller.busy}
                intent="primary"
                label={controller.busy ? 'Menyimpan…' : 'Analisa'}
                onPress={() => {
                  void controller.onIngest();
                }}
              />
            </View>
          ) : null}

          {controller.notice ? (
            <Text style={styles.notice}>{controller.notice}</Text>
          ) : null}

          <View style={styles.filterRow}>
            {FILTERS.map(item => (
              <KolamButton
                intent={controller.filter === item.id ? 'primary' : 'outline'}
                key={item.id}
                label={item.label}
                onPress={() => controller.onSetFilter(item.id)}
              />
            ))}
          </View>

          {controller.loading && !controller.rows.length ? (
            <Text style={styles.meta}>Memuat…</Text>
          ) : null}
          {controller.error && !controller.rows.length ? (
            <KolamEmptyState message={controller.error} title="Gagal memuat" />
          ) : null}
          {!controller.loading &&
          !controller.error &&
          !controller.filteredRows.length ? (
            <KolamEmptyState
              message="Tambahkan teks pelanggan untuk dianalisa."
              title="Belum ada data sentimen"
            />
          ) : null}

          {controller.filteredRows.map(row => (
            <View key={row.id} style={styles.row}>
              <Text style={styles.rowText}>{row.text}</Text>
              <View style={styles.rowMetaRow}>
                <Text style={styles.badge}>
                  {SENTIMENT_LABEL[row.sentiment] ?? row.sentiment}
                </Text>
                <Text style={styles.meta}>
                  {row.detectedAt
                    ? new Date(row.detectedAt).toLocaleString('id-ID')
                    : '—'}
                </Text>
                {canDraft ? (
                  <KolamButton
                    disabled={controller.deletingId === row.id}
                    label="Hapus"
                    onPress={() => {
                      void controller.onDelete(row.id);
                    }}
                  />
                ) : null}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.aside}>
          <Text style={styles.cardTitle}>Ringkasan</Text>
          <Text style={styles.summaryLine}>
            {`Positif ${controller.summary.positive}`}
          </Text>
          <Text style={styles.summaryLine}>
            {`Netral ${controller.summary.neutral}`}
          </Text>
          <Text style={styles.summaryLine}>
            {`Negatif ${controller.summary.negative}`}
          </Text>
          {controller.summary.topics.length ? (
            <>
              <Text style={[styles.cardTitle, styles.topicsTitle]}>Topik</Text>
              {controller.summary.topics.map(topic => (
                <Text key={topic} style={styles.summaryLine}>
                  {`• ${topic}`}
                </Text>
              ))}
            </>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {flex: 1},
  content: {gap: 10, paddingBottom: 24},
  mainRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 12},
  main: {flexBasis: 320, flexGrow: 2, gap: 10},
  aside: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexBasis: 220,
    flexGrow: 1,
    gap: 4,
    padding: 12,
  },
  cardTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  topicsTitle: {marginTop: 8},
  summaryLine: {color: V.colors.mutedFg, fontFamily: V.fontFamily, fontSize: 12},
  ingestCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  input: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  chipsRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
  llamaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  notice: {color: V.colors.mutedFg, fontFamily: V.fontFamily, fontSize: 12},
  filterRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
  meta: {color: V.colors.mutedFg, fontFamily: V.fontFamily, fontSize: 12},
  row: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  rowText: {color: V.colors.fg, fontFamily: V.fontFamily, fontSize: 13},
  rowMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
});
