import React from 'react';
import {ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {formatKolamDaraSeoMentionSource} from '../domain/kolam-dara-seo';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {KolamDaraSeoMentionsController} from '../hooks/use-kolam-dara-seo-mentions-controller';
import {KolamButton} from './kolam-button';
import {KolamEmptyState} from './kolam-empty-state';

export function KolamDaraSeoMentionsBody({
  canDraft,
  controller,
}: {
  canDraft: boolean;
  controller: KolamDaraSeoMentionsController;
}) {
  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
      {canDraft ? (
        <View style={styles.ingestCard}>
          <Text style={styles.ingestTitle}>Tambah data</Text>
          <View style={styles.ingestRow}>
            <View style={styles.ingestBox}>
              <Text style={styles.ingestLabel}>Keyword SERP</Text>
              <Text style={styles.ingestHint}>
                Ambil snapshot ranking untuk keyword produk/brand.
              </Text>
              <TextInput
                editable={!controller.busy}
                onChangeText={controller.onSetKeyword}
                placeholder="nama produk / brand"
                placeholderTextColor={V.colors.mutedFg}
                style={styles.input}
                value={controller.keyword}
              />
              <KolamButton
                disabled={controller.busy}
                intent="primary"
                label="Fetch SERP"
                onPress={() => {
                  void controller.onFetchSerp();
                }}
                style={styles.ingestAction}
              />
            </View>
            <View style={styles.ingestBox}>
              <Text style={styles.ingestLabel}>Kompetitor</Text>
              <Text style={styles.ingestHint}>
                Catat nama brand pesaing untuk monitoring.
              </Text>
              <TextInput
                editable={!controller.busy}
                onChangeText={controller.onSetCompetitor}
                placeholder="Brand kompetitor"
                placeholderTextColor={V.colors.mutedFg}
                style={styles.input}
                value={controller.competitor}
              />
              <KolamButton
                disabled={controller.busy}
                label="Tambah kompetitor"
                onPress={() => {
                  void controller.onIngestCompetitor();
                }}
                style={styles.ingestAction}
              />
            </View>
            <View style={styles.ingestBox}>
              <Text style={styles.ingestLabel}>Backlink</Text>
              <Text style={styles.ingestHint}>
                Simpan URL halaman yang link ke website/toko Anda.
              </Text>
              <TextInput
                editable={!controller.busy}
                onChangeText={controller.onSetBacklinkUrl}
                placeholder="https://..."
                placeholderTextColor={V.colors.mutedFg}
                style={styles.input}
                value={controller.backlinkUrl}
              />
              <KolamButton
                disabled={controller.busy}
                label="Tambah backlink"
                onPress={() => {
                  void controller.onIngestBacklink();
                }}
                style={styles.ingestAction}
              />
            </View>
          </View>
        </View>
      ) : null}

      {controller.notice ? (
        <Text style={styles.notice}>{controller.notice}</Text>
      ) : null}

      {controller.loading && !controller.rows.length ? (
        <Text style={styles.meta}>Memuat…</Text>
      ) : null}
      {controller.error && !controller.rows.length ? (
        <KolamEmptyState message={controller.error} title="Gagal memuat" />
      ) : null}
      {!controller.loading && !controller.error && !controller.rows.length ? (
        <KolamEmptyState
          message="Gunakan form di atas untuk menambah SERP, kompetitor, atau backlink."
          title="Belum ada data"
        />
      ) : null}

      {controller.rows.map(row => (
        <View key={row.id} style={styles.row}>
          <Text style={styles.rowTitle}>{row.entityName}</Text>
          <Text style={styles.meta}>
            {`${formatKolamDaraSeoMentionSource(
              row.sourceType,
              row.sourceName,
            )} · ${row.engine || '—'}`}
          </Text>
          <Text numberOfLines={2} style={styles.snippet}>
            {row.snippet || '—'}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {flex: 1},
  content: {gap: 10, paddingBottom: 24},
  ingestCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    padding: 12,
    width: '100%',
  },
  ingestTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  ingestRow: {
    alignItems: 'stretch',
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  ingestBox: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 8,
    minWidth: 0,
    padding: 12,
  },
  ingestLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  ingestHint: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    lineHeight: 15,
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
    width: '100%',
  },
  ingestAction: {
    alignSelf: 'stretch',
  },
  notice: {color: V.colors.mutedFg, fontFamily: V.fontFamily, fontSize: 12},
  meta: {color: V.colors.mutedFg, fontFamily: V.fontFamily, fontSize: 12},
  row: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  rowTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  snippet: {color: V.colors.mutedFg, fontFamily: V.fontFamily, fontSize: 12},
});
